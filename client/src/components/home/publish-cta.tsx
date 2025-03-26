import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function PublishCTA() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const handlePublish = () => {
    if (!user) {
      navigate("/auth");
    } else if (user && !user.isAuthor) {
      // If user is logged in but not an author, they need to update their profile
      // For now, just redirect to auth
      navigate("/auth");
    } else {
      navigate("/author-dashboard");
    }
  };
  
  const handleLearnMore = () => {
    // Scroll to "How it works" section or navigate to an info page
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <section className="bg-gradient-to-r from-secondary to-primary text-white rounded-lg shadow-md p-6 mb-12">
      <div className="md:flex md:items-center md:justify-between">
        <div className="md:w-2/3 mb-6 md:mb-0">
          <h2 className="text-2xl font-bold mb-2">Ready to Publish Your Book?</h2>
          <p className="text-gray-100 mb-4">
            Join thousands of authors who are reaching readers directly and earning more with Lieutenant's AI-powered platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={handlePublish}
            >
              Start Publishing
            </Button>
            <Button 
              variant="outline"
              className="bg-transparent hover:bg-white/10 border border-white text-white"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-center md:justify-end">
          <img 
            src="https://images.unsplash.com/photo-1519791883288-dc8bd696e667?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
            alt="Publishing illustration" 
            className="rounded-lg max-h-40" 
          />
        </div>
      </div>
    </section>
  );
}
