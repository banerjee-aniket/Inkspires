import BookCard, { BookCardSkeleton } from "./book-card";
import { Book } from "@shared/schema";

type BookGridProps = {
  books: Book[];
  isLoading?: boolean;
  variant?: "standard" | "featured";
  emptyMessage?: string;
};

export default function BookGrid({ 
  books, 
  isLoading = false, 
  variant = "standard",
  emptyMessage = "No books found"
}: BookGridProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-${variant === 'featured' ? '4' : '3'} lg:grid-cols-${variant === 'featured' ? '4' : '4'} gap-4 md:gap-6`}>
        {Array(8).fill(0).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!books || books.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  // Books grid
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${variant === 'featured' ? '4' : '3'} lg:grid-cols-${variant === 'featured' ? '4' : '4'} gap-4 md:gap-6`}>
      {books.map((book) => (
        <BookCard 
          key={book.id} 
          book={book} 
          variant={variant}
        />
      ))}
    </div>
  );
}
