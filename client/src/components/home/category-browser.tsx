import { useState } from "react";
import { Book } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/books/book-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type CategoryBrowserProps = {
  categories: string[];
  books: Book[];
  isLoading: boolean;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

export default function CategoryBrowser({
  categories,
  books,
  isLoading,
  selectedCategory,
  onCategoryChange,
}: CategoryBrowserProps) {
  const [purchaseType, setPurchaseType] = useState<string>("buy");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Sorting options
  const [sortBy, setSortBy] = useState<string>("popular");
  
  // Apply sorting to books
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
      default:
        return b.reviewCount - a.reviewCount;
    }
  });
  
  // Paginate books
  const paginatedBooks = sortedBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  
  return (
    <section className="mb-12" id="categories-section">
      {/* Categories Tabs */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => onCategoryChange(null)}
          >
            All Books
          </Button>
          
          {categories.slice(0, 5).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
          
          {categories.length > 5 && (
            <Button variant="outline">
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Price</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Rating</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Format</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Customer Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Books Grid with Buy/Rent Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <Tabs value={purchaseType} onValueChange={setPurchaseType} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="rent">Rent</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="pt-4">
            <BookGrid
              books={paginatedBooks}
              isLoading={isLoading}
              emptyMessage={`No books found${selectedCategory ? ` in ${selectedCategory}` : ''}`}
            />
          </TabsContent>
          <TabsContent value="rent" className="pt-4">
            <BookGrid
              books={paginatedBooks.filter(book => book.rentPrice !== null)}
              isLoading={isLoading}
              emptyMessage={`No books available for rent${selectedCategory ? ` in ${selectedCategory}` : ''}`}
            />
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {pageNumbers.map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <span className="px-2 text-gray-500">...</span>
                    ) : (
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(+page)}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </section>
  );
}
