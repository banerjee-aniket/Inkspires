import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Book, Review } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, StarHalf, ShoppingCart, Bookmark, ArrowLeft } from "lucide-react";

// Review form schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500, "Comment cannot exceed 500 characters")
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("buy");
  const [selectedRating, setSelectedRating] = useState<number>(5);
  
  // Fetch book details
  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Book not found");
        }
        throw new Error("Failed to fetch book details");
      }
      return res.json();
    }
  });
  
  // Fetch book reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/books/${bookId}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/reviews`);
      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return res.json();
    }
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ bookId, purchaseType }: { bookId: number, purchaseType: string }) => {
      const res = await apiRequest("POST", "/api/cart", { bookId, purchaseType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Book has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Review form
  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: ""
    }
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", `/api/books/${bookId}/reviews`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] });
      reviewForm.reset();
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle adding book to cart
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add books to your cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    addToCartMutation.mutate({ 
      bookId, 
      purchaseType: activeTab // "buy" or "rent"
    });
  };
  
  // Handle review submission
  const onReviewSubmit = (data: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    submitReviewMutation.mutate({
      rating: selectedRating,
      comment: data.comment
    });
  };
  
  if (bookLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-lg">
            <AlertDescription>
              Book not found or has been removed. Please try another book.
            </AlertDescription>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Homepage
            </Button>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Button>
          
          {/* Book details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Book cover */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  className="w-full object-cover aspect-[2/3]"
                />
              </div>
            </div>
            
            {/* Book info */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <Badge className="mb-4">{book.category}</Badge>
                <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.floor(book.rating) ? (
                          <Star className="fill-current h-5 w-5" />
                        ) : star === Math.ceil(book.rating) && !Number.isInteger(book.rating) ? (
                          <StarHalf className="fill-current h-5 w-5" />
                        ) : (
                          <Star className="h-5 w-5 text-gray-300" />
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {book.rating.toFixed(1)} ({book.reviewCount} {book.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">{book.description}</p>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="rent">Rent</TabsTrigger>
                  </TabsList>
                  <TabsContent value="buy" className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">${book.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 ml-2">One-time purchase</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Bookmark className="h-5 w-5" />
                        </Button>
                        <Button 
                          onClick={handleAddToCart}
                          disabled={addToCartMutation.isPending}
                        >
                          {addToCartMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="mr-2 h-4 w-4" />
                          )}
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="rent" className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">${book.rentPrice?.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 ml-2">30-day rental</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Bookmark className="h-5 w-5" />
                        </Button>
                        <Button 
                          onClick={handleAddToCart}
                          disabled={addToCartMutation.isPending}
                        >
                          {addToCartMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="mr-2 h-4 w-4" />
                          )}
                          Rent Now
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Author</h3>
                  <p className="text-gray-600">
                    This book is written by Author ID: {book.authorId}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>
            
            {/* Write review form */}
            {user && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
                  
                  <div className="flex items-center mb-4">
                    <span className="mr-2">Your Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setSelectedRating(rating)}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={`h-6 w-6 ${rating <= selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Form {...reviewForm}>
                    <form onSubmit={reviewForm.handleSubmit(onReviewSubmit)} className="space-y-4">
                      <FormField
                        control={reviewForm.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Review</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Share your thoughts about this book..." 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={submitReviewMutation.isPending}
                      >
                        {submitReviewMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Submit Review
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {/* Reviews list */}
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-5 w-5 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        User #{review.userId} • {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this book!
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
