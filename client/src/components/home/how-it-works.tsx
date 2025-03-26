import { Book, ShoppingCart, Laptop } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="mb-12" id="how-it-works">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How Inkspire Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Book className="h-6 w-6 text-primary" />}
          title="Browse & Discover"
          description="Explore thousands of eBooks across genres, with AI-powered recommendations tailored to your interests."
        />
        
        <FeatureCard 
          icon={<ShoppingCart className="h-6 w-6 text-primary" />}
          title="Buy or Rent"
          description="Purchase books outright or save money by renting for the time you need. Subscribe for unlimited access."
        />
        
        <FeatureCard 
          icon={<Laptop className="h-6 w-6 text-primary" />}
          title="Read Anywhere"
          description="Access your eBooks across devices with our cloud-synced reader that remembers where you left off."
        />
      </div>
    </section>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
