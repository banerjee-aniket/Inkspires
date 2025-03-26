import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Book } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, StarHalf, Bookmark, ShoppingCart, Check } from "lucide-react";

type BookCardProps = {
  book: Book;
  variant?: "standard" | "featured";
};

export default function BookCard({ book, variant = "standard" }: BookCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ bookId, purchaseType }: { bookId: number, purchaseType: string }) => {
      setIsAddingToCart(true);
      const res = await apiRequest("POST", "/api/cart", { bookId, purchaseType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setIsAddingToCart(false);
      setIsAddedToCart(true);
      
      // Reset added status after a delay
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
      
      toast({
        title: "Added to cart",
        description: "Book has been added to your cart",
      });
    },
    onError: (error: Error) => {
      setIsAddingToCart(false);
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle adding to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      bookId: book.id, 
      purchaseType: "buy"
    });
  };
  
  // Format book price with discount if applicable
  const formatPrice = () => {
    return book.price.toFixed(2);
  };
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="h-3 w-3 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-3 w-3 fill-current" />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-gray-300" />);
      }
    }
    
    return stars;
  };
  
  if (variant === "featured") {
    return (
      <Card className="book-card overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <Link href={`/books/${book.id}`}>
          <div className="relative">
            <div className="w-full h-56 overflow-hidden">
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {book.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-accent text-white">
                Best Seller
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 truncate">{book.title}</h3>
            <p className="text-sm text-gray-600 mb-2">by Author ID: {book.authorId}</p>
            
            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400">
                {renderStars(book.rating)}
              </div>
              <span className="text-xs text-gray-600 ml-2">
                {book.rating.toFixed(1)} ({book.reviewCount})
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-900 font-bold">${formatPrice()}</span>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Bookmark className="h-4 w-4 text-gray-600" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddedToCart ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }
  
  return (
    <Card className="book-card overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <Link href={`/books/${book.id}`}>
        <div className="relative">
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 truncate">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by Author ID: {book.authorId}</p>
          
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {renderStars(book.rating)}
            </div>
            <span className="text-xs text-gray-600 ml-2">
              {book.rating.toFixed(1)} ({book.reviewCount})
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-900 font-bold">${formatPrice()}</span>
            </div>
            <Button 
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddedToCart ? "Added" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}

// Loading skeleton for book card
export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full h-56">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </Card>
  );
}
