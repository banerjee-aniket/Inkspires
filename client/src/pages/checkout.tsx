import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CartItem } from "@shared/schema";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, ShoppingCart, Book, Trash2, ArrowRight, Check } from "lucide-react";

type CartItemWithBook = CartItem & { book: any };

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  
  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading } = useQuery<CartItemWithBook[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    }
  });
  
  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setCheckoutCompleted(true);
      toast({
        title: "Checkout successful",
        description: "Your order has been processed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Calculate cart totals
  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) {
      return { subtotal: 0, tax: 0, total: 0 };
    }
    
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.purchaseType === "buy" 
        ? item.book.price 
        : item.book.rentPrice;
      return sum + price;
    }, 0);
    
    const tax = subtotal * 0.07; // 7% tax rate
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };
  
  const { subtotal, tax, total } = calculateTotals();
  
  // Handle remove item
  const handleRemoveItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };
  
  // Handle checkout
  const handleCheckout = () => {
    checkoutMutation.mutate();
  };
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate("/");
  };
  
  if (checkoutCompleted) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
              <CardDescription>Your purchase was successful</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6">Thank you for your purchase. Your books are now available in your library.</p>
              <Button
                className="w-full"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (cartLoading) {
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
  
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle>Your Cart is Empty</CardTitle>
              <CardDescription>Add some books to start shopping</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="mb-6">Looks like you haven't added any books to your cart yet.</p>
              <Button
                onClick={handleContinueShopping}
                className="w-full"
              >
                Browse Books
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Your Cart ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center space-x-4 p-4 rounded-lg border"
                      >
                        <div className="bg-gray-100 rounded-md w-16 h-20 flex items-center justify-center flex-shrink-0">
                          {item.book.coverImage ? (
                            <img 
                              src={item.book.coverImage} 
                              alt={item.book.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <Book className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900">{item.book.title}</h3>
                          <p className="text-sm text-gray-500">
                            {item.purchaseType === "buy" ? "Purchase" : "30-day rental"}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.purchaseType === "buy" 
                              ? item.book.price 
                              : item.book.rentPrice).toFixed(2)}
                          </p>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-800 mt-1 flex items-center"
                            disabled={removeFromCartMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (7%)</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Complete Purchase
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </Button>
                </CardFooter>
              </Card>
              
              <Alert className="mt-6">
                <AlertDescription className="text-sm">
                  This is a demo checkout. No actual payment will be processed, and books will be added directly to your account.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
