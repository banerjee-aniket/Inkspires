import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// Sample testimonials
const testimonials = [
  {
    id: 1,
    content: "As a self-published author, Lieutenant's Inkspire platform has been a game-changer. I'm earning more from my books than I ever did with traditional publishing, and the AI moderation ensures my work is presented alongside quality content.",
    author: {
      name: "Jennifer Adams",
      role: "Author of 6 Books",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    rating: 5
  },
  {
    id: 2,
    content: "I love that I can rent books instead of buying them outright. Lieutenant's vision for accessible reading has saved me hundreds of dollars while still giving me access to all the technical books I need for my courses.",
    author: {
      name: "Marcus Chen",
      role: "Premium Subscriber",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    rating: 4.5
  }
];

export default function Testimonials() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What Our Users Say</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </section>
  );
}

type TestimonialProps = {
  testimonial: {
    id: number;
    content: string;
    author: {
      name: string;
      role: string;
      avatar: string;
    };
    rating: number;
  };
};

function TestimonialCard({ testimonial }: TestimonialProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex text-yellow-400 mb-4">
          {/* Render stars based on rating */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${
                i < Math.floor(testimonial.rating) 
                  ? 'fill-current' 
                  : i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0
                  ? 'fill-current text-yellow-400/50' 
                  : 'text-gray-300'
              }`} 
            />
          ))}
        </div>
        <p className="text-gray-600 mb-4 italic">
          "{testimonial.content}"
        </p>
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={testimonial.author.avatar} alt={testimonial.author.name} />
            <AvatarFallback>{testimonial.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-gray-900">{testimonial.author.name}</h4>
            <p className="text-sm text-gray-600">{testimonial.author.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
