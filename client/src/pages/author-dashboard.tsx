import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Book, insertBookSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, Edit, Trash2 } from "lucide-react";

// Book form schema
const bookFormSchema = insertBookSchema.extend({
  category: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  rentPrice: z.coerce.number().min(0.01, "Rental price must be greater than 0").optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function AuthorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-books");
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  
  // Get author's books
  const { data: authorBooks, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ["/api/author-books"],
    queryFn: async () => {
      const res = await fetch("/api/author-books");
      if (!res.ok) throw new Error("Failed to fetch your books");
      return res.json();
    }
  });
  
  // Get categories
  const { data: categories } = useQuery<string[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });
  
  // Book form
  const bookForm = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      description: "",
      coverImage: "",
      price: 9.99,
      rentPrice: 2.99,
      category: "",
      isPublished: true,
      isFeatured: false,
      authorId: user?.id
    }
  });
  
  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      const res = await apiRequest("POST", "/api/books", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author-books"] });
      bookForm.reset();
      setActiveTab("my-books");
      toast({
        title: "Book created",
        description: "Your book has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create book",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: BookFormValues }) => {
      const res = await apiRequest("PUT", `/api/books/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author-books"] });
      bookForm.reset();
      setEditingBookId(null);
      setActiveTab("my-books");
      toast({
        title: "Book updated",
        description: "Your book has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update book",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author-books"] });
      toast({
        title: "Book deleted",
        description: "Your book has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete book",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle book form submission
  const onBookSubmit = (data: BookFormValues) => {
    if (editingBookId) {
      updateBookMutation.mutate({ id: editingBookId, data });
    } else {
      createBookMutation.mutate(data);
    }
  };
  
  // Handle editing a book
  const handleEditBook = (book: Book) => {
    setEditingBookId(book.id);
    
    bookForm.reset({
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      price: book.price,
      rentPrice: book.rentPrice,
      category: book.category,
      isPublished: book.isPublished,
      isFeatured: book.isFeatured,
      authorId: book.authorId
    });
    
    setActiveTab("add-book");
  };
  
  // Handle deleting a book
  const handleDeleteBook = (id: number) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(id);
    }
  };
  
  if (!user?.isAuthor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-lg">
            <AlertDescription>
              This page is only accessible to authors. Please register as an author to access the dashboard.
            </AlertDescription>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Author Dashboard</h1>
          <p className="text-gray-600 mb-6">Manage your published books and add new ones</p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-books">My Books</TabsTrigger>
              <TabsTrigger value="add-book">
                {editingBookId ? "Edit Book" : "Add New Book"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-books">
              <Card>
                <CardHeader>
                  <CardTitle>Your Published Books</CardTitle>
                  <CardDescription>
                    Manage all your books in one place
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {booksLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : authorBooks && authorBooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {authorBooks.map((book) => (
                        <Card key={book.id} className="overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <Button 
                                variant="secondary" 
                                size="icon"
                                onClick={() => handleEditBook(book)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => handleDeleteBook(book.id)}
                                disabled={deleteBookMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 truncate">{book.title}</h3>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500">{book.category}</span>
                              <div className="flex items-center text-sm text-gray-500">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {book.reviewCount} {book.reviewCount === 1 ? 'review' : 'reviews'}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900">${book.price.toFixed(2)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${book.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {book.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>You haven't published any books yet.</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setActiveTab("add-book")}
                      >
                        Add Your First Book
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="add-book">
              <Card>
                <CardHeader>
                  <CardTitle>{editingBookId ? "Edit Book" : "Add New Book"}</CardTitle>
                  <CardDescription>
                    {editingBookId 
                      ? "Update your book information" 
                      : "Fill out the form below to publish a new book"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...bookForm}>
                    <form onSubmit={bookForm.handleSubmit(onBookSubmit)} className="space-y-6">
                      <FormField
                        control={bookForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Book Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the title of your book" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bookForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide a detailed description of your book" 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter URL for book cover" {...field} />
                              </FormControl>
                              <FormDescription>
                                Use a direct image URL
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="rentPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rental Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>
                                Price for a 30-day rental
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookForm.control}
                          name="isPublished"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Published</FormLabel>
                                <FormDescription>
                                  Make this book available for purchase
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookForm.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Featured</FormLabel>
                                <FormDescription>
                                  Display this book in featured sections
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            bookForm.reset();
                            setEditingBookId(null);
                            setActiveTab("my-books");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createBookMutation.isPending || updateBookMutation.isPending}
                        >
                          {(createBookMutation.isPending || updateBookMutation.isPending) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {editingBookId ? "Update Book" : "Publish Book"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
