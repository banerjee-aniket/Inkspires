import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

export default function AboutFounder() {
  const [, navigate] = useLocation();
  
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Meet Our Founder</h2>
      
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gradient-to-br from-primary to-secondary p-6 flex flex-col justify-center items-center text-white">
            <Avatar className="h-32 w-32 border-4 border-white mb-4">
              <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Lieutenant" />
              <AvatarFallback className="text-4xl">L</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold mb-1">Lieutenant</h3>
            <p className="text-white/80 text-center mb-4">Founder & CEO of Inkspire</p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Connect
              </Button>
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 mb-4">
              As the founder of Inkspire, I established this platform with a singular vision: to revolutionize how authors and readers connect in the digital age. Having experienced the challenges of traditional publishing firsthand, I wanted to create a marketplace where talented writers could thrive and readers could discover authentic voices without gatekeepers.
            </p>
            <p className="text-gray-600 mb-4">
              Our AI-powered platform ensures content quality while providing fair compensation to authors. We've built Inkspire to be the most author-friendly eBook marketplace, with innovative features like dynamic pricing, rental options, and subscription models that benefit both creators and consumers.
            </p>
            <p className="text-gray-600 mb-6">
              At Inkspire, we believe that stories have the power to change lives, and our mission is to make those stories accessible to everyone while supporting the incredible authors who create them.
            </p>
            <Button onClick={() => navigate("/auth")}>
              Join Our Community
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}