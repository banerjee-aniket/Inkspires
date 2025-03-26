import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { CartItem } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  ShoppingCart,
  Menu,
  User,
  LogOut,
  BookOpen,
  Home,
  Bookmark,
  Heart,
  Package,
} from "lucide-react";

type HeaderProps = {
  onSearch?: (term: string) => void;
};

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get cart items count
  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/cart");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user
  });

  const cartItemsCount = cartItems?.length || 0;
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="ml-2 text-2xl font-bold text-gray-900">Inkspire</span>
            </Link>
          </div>
          
          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 mx-8 items-center">
            <form onSubmit={handleSearch} className="w-full max-w-xl relative">
              <Input
                type="text"
                placeholder="Search for books, authors, genres..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4 text-gray-500" />
              </Button>
            </form>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="flex items-center space-x-6">
            <Link href="/" className="hidden md:block text-gray-600 hover:text-primary font-medium">
              Discover
            </Link>
            <Link href="/" className="hidden md:block text-gray-600 hover:text-primary font-medium">
              Categories
            </Link>
            <Link href="/" className="hidden md:block text-gray-600 hover:text-primary font-medium">
              Authors
            </Link>
            
            <div className="flex items-center space-x-4">
              {user && (
                <Link href="/checkout" className="relative">
                  <ShoppingCart className="text-gray-600 hover:text-primary h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-white">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>
              )}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.fullName} />
                        ) : (
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>My Library</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/checkout")}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Cart</span>
                    </DropdownMenuItem>
                    {user.isAuthor && (
                      <DropdownMenuItem onClick={() => navigate("/author-dashboard")}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Author Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              )}
              
              {/* Mobile menu button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6 text-gray-600" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    <SheetClose asChild>
                      <Link 
                        href="/" 
                        className="flex items-center py-2 text-gray-600 hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="mr-2 h-5 w-5" />
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/" 
                        className="flex items-center py-2 text-gray-600 hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Bookmark className="mr-2 h-5 w-5" />
                        Categories
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link 
                        href="/" 
                        className="flex items-center py-2 text-gray-600 hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="mr-2 h-5 w-5" />
                        Featured
                      </Link>
                    </SheetClose>
                    {user && (
                      <>
                        <SheetClose asChild>
                          <Link 
                            href="/checkout" 
                            className="flex items-center py-2 text-gray-600 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Cart ({cartItemsCount})
                          </Link>
                        </SheetClose>
                        {user.isAuthor && (
                          <SheetClose asChild>
                            <Link 
                              href="/author-dashboard" 
                              className="flex items-center py-2 text-gray-600 hover:text-primary"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <BookOpen className="mr-2 h-5 w-5" />
                              Author Dashboard
                            </Link>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <button 
                            className="flex items-center py-2 text-gray-600 hover:text-primary"
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="mr-2 h-5 w-5" />
                            Log out
                          </button>
                        </SheetClose>
                      </>
                    )}
                    {!user && (
                      <SheetClose asChild>
                        <Link 
                          href="/auth" 
                          className="flex items-center py-2 text-gray-600 hover:text-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="mr-2 h-5 w-5" />
                          Sign In / Register
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Input 
              type="text"
              placeholder="Search books..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4 text-gray-500" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
