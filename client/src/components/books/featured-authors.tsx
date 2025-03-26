import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Sample featured authors until we connect to backend
const featuredAuthors = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Bestselling Author of Creative Fiction",
    books: 12,
    avgRating: 4.8,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
  },
  {
    id: 2,
    name: "David Kim",
    role: "Tech Author & Web Developer",
    books: 8,
    avgRating: 4.7,
    image: "https://images.unsplash.com/photo-1545996124-0501ebae84d0"
  },
  {
    id: 3,
    name: "Michael Chang",
    role: "Business Strategy Expert",
    books: 6,
    avgRating: 4.5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
  }
];

export default function FeaturedAuthors() {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Authors</h2>
        <a href="#" className="text-primary hover:text-primary/80 font-medium">View all</a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredAuthors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </section>
  );
}

type AuthorCardProps = {
  author: {
    id: number;
    name: string;
    role: string;
    books: number;
    avgRating: number;
    image: string;
  };
};

function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3">
          <img 
            src={author.image} 
            alt={`${author.name} profile`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 sm:w-2/3">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{author.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{author.role}</p>
          <div className="flex items-center mb-3">
            <span className="text-sm text-primary font-medium">{author.books} Books</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-600">{author.avgRating} Avg Rating</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full text-gray-600"
          >
            Follow Author
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Skeleton for loading states
export function FeaturedAuthorsSkeleton() {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-1/3">
                <Skeleton className="w-full h-32 sm:h-full" />
              </div>
              <div className="p-4 sm:w-2/3 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
