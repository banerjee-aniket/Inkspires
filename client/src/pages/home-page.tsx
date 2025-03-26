import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import BookGrid from "@/components/books/book-grid";
import CategoryBrowser from "@/components/home/category-browser";
import FeaturedAuthors from "@/components/books/featured-authors";
import PublishCTA from "@/components/home/publish-cta";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import AboutFounder from "@/components/home/about-founder";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get featured books
  const { data: featuredBooks, isLoading: featuredLoading } = useQuery<Book[]>({
    queryKey: ["/api/books", { featured: true }],
    queryFn: async () => {
      const res = await fetch("/api/books?featured=true");
      if (!res.ok) throw new Error("Failed to fetch featured books");
      return res.json();
    }
  });
  
  // Get books filtered by category
  const { data: categoryBooks, isLoading: categoryLoading } = useQuery<Book[]>({
    queryKey: ["/api/books", { category: selectedCategory, search: searchTerm }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (searchTerm) queryParams.append("search", searchTerm);
      
      const res = await fetch(`/api/books?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch books");
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
  
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="flex-grow">
        <HeroSection />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Books Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
              <a href="#" className="text-primary hover:text-primary/80 font-medium">View all</a>
            </div>
            
            <BookGrid 
              books={featuredBooks || []} 
              isLoading={featuredLoading} 
              variant="featured"
            />
          </section>
          
          {/* Category Browser */}
          <CategoryBrowser 
            categories={categories || []} 
            books={categoryBooks || []} 
            isLoading={categoryLoading}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          {/* Featured Authors */}
          <FeaturedAuthors />
          
          {/* Publish CTA */}
          <PublishCTA />
          
          {/* How It Works */}
          <HowItWorks />
          
          {/* About Founder */}
          <AboutFounder />
          
          {/* Testimonials */}
          <Testimonials />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
