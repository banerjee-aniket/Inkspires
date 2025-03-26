import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export default function HeroSection() {
  const [, navigate] = useLocation();
  
  const handleBrowseBooks = () => {
    // Scroll to categories section or go to browse page
    const categoriesSection = document.getElementById("categories-section");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  const handlePublishBook = () => {
    navigate("/author-dashboard");
  };
  
  return (
    <section className="relative bg-gradient-to-r from-primary to-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Discover, Read, and Inspire with eBooks
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-6">
              Join Lieutenant's next generation AI-powered marketplace where readers and authors connect directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={handleBrowseBooks}
                className="bg-white text-primary hover:bg-gray-100"
              >
                Browse Books
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handlePublishBook}
                className="bg-transparent hover:bg-white/10 border border-white text-white"
              >
                Publish Your Book
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <img 
              src="https://images.unsplash.com/photo-1513001900722-370f803f498d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
              alt="Ebooks collection" 
              className="rounded-lg shadow-xl max-w-sm" 
              width="400" 
              height="300" 
            />
          </div>
        </div>
      </div>
      
      {/* Subscription Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-accent/90 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-white font-medium text-center md:text-left">
            <Crown className="inline-block mr-2 h-4 w-4" /> Unlimited eBook rentals with Premium Subscription
          </p>
          <a href="#" className="mt-2 md:mt-0 text-center md:text-right text-white underline font-medium">
            Try free for 7 days →
          </a>
        </div>
      </div>
    </section>
  );
}
