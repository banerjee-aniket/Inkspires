import { users, books, orders, cartItems, reviews } from "@shared/schema";
import type { User, InsertUser, Book, InsertBook, Order, InsertOrder, CartItem, InsertCartItem, Review, InsertReview } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Mock data for categories
export const categories = [
  "Fiction",
  "Non-Fiction",
  "Business",
  "Technology",
  "Self-Help",
  "Science",
  "Romance",
  "Mystery",
  "Biography"
];

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Book methods
  getBook(id: number): Promise<Book | undefined>;
  getBooks(filters?: { 
    category?: string; 
    authorId?: number; 
    isFeatured?: boolean;
    search?: string;
  }): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemWithBookDetails(userId: number): Promise<(CartItem & { book: Book })[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Review methods
  getReviews(bookId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private orders: Map<number, Order>;
  private cartItems: Map<number, CartItem>;
  private reviews: Map<number, Review>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private bookIdCounter: number;
  private orderIdCounter: number;
  private cartItemIdCounter: number;
  private reviewIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.orders = new Map();
    this.cartItems = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.bookIdCounter = 1;
    this.orderIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.reviewIdCounter = 1;
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Book methods
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }
  
  async getBooks(filters?: { 
    category?: string; 
    authorId?: number; 
    isFeatured?: boolean;
    search?: string;
  }): Promise<Book[]> {
    let books = Array.from(this.books.values());
    
    if (filters) {
      if (filters.category) {
        books = books.filter(book => book.category === filters.category);
      }
      
      if (filters.authorId !== undefined) {
        books = books.filter(book => book.authorId === filters.authorId);
      }
      
      if (filters.isFeatured !== undefined) {
        books = books.filter(book => book.isFeatured === filters.isFeatured);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        books = books.filter(book => 
          book.title.toLowerCase().includes(searchTerm) || 
          book.description.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    return books;
  }
  
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    const createdAt = new Date();
    const book: Book = { 
      ...insertBook, 
      id, 
      createdAt,
      rating: 0,
      reviewCount: 0
    };
    this.books.set(id, book);
    return book;
  }
  
  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined> {
    const existingBook = this.books.get(id);
    if (!existingBook) return undefined;
    
    const updatedBook = { ...existingBook, ...bookData };
    this.books.set(id, updatedBook);
    return updatedBook;
  }
  
  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt, isActive: true };
    this.orders.set(id, order);
    return order;
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }
  
  async getCartItemWithBookDetails(userId: number): Promise<(CartItem & { book: Book })[]> {
    const cartItems = await this.getCartItems(userId);
    return cartItems.map(item => {
      const book = this.books.get(item.bookId);
      if (!book) {
        throw new Error(`Book not found for cart item: ${item.id}`);
      }
      return { ...item, book };
    });
  }
  
  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const createdAt = new Date();
    const cartItem: CartItem = { ...insertCartItem, id, createdAt };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(userId);
    cartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }
  
  // Review methods
  async getReviews(bookId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.bookId === bookId,
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const review: Review = { ...insertReview, id, createdAt };
    this.reviews.set(id, review);
    
    // Update book rating
    const book = this.books.get(insertReview.bookId);
    if (book) {
      const reviews = await this.getReviews(insertReview.bookId);
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const newRating = totalRating / reviews.length;
      
      this.updateBook(book.id, {
        rating: parseFloat(newRating.toFixed(1)),
        reviewCount: reviews.length
      });
    }
    
    return review;
  }
  
  // Sample data initialization
  private initializeSampleData() {
    // Sample author users
    const authorUsers: InsertUser[] = [
      {
        username: "sarahjohnson",
        password: "$2b$10$X7JiAEmd3viK6d.9OI59S.QY1vVkTI5NZO7ib0YQxS9PTxbCAwfgW", // "password"
        email: "sarah@example.com",
        fullName: "Sarah Johnson",
        bio: "Bestselling Author of Creative Fiction",
        isAuthor: true,
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
      },
      {
        username: "davidkim",
        password: "$2b$10$X7JiAEmd3viK6d.9OI59S.QY1vVkTI5NZO7ib0YQxS9PTxbCAwfgW", // "password"
        email: "david@example.com",
        fullName: "David Kim",
        bio: "Tech Author & Web Developer",
        isAuthor: true,
        avatarUrl: "https://images.unsplash.com/photo-1545996124-0501ebae84d0"
      },
      {
        username: "michaelchang",
        password: "$2b$10$X7JiAEmd3viK6d.9OI59S.QY1vVkTI5NZO7ib0YQxS9PTxbCAwfgW", // "password"
        email: "michael@example.com",
        fullName: "Michael Chang",
        bio: "Business Strategy Expert",
        isAuthor: true,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
      }
    ];
    
    authorUsers.forEach(user => {
      this.createUser(user);
    });
    
    // Sample books
    const sampleBooks: InsertBook[] = [
      {
        title: "The Art of Creativity",
        authorId: 1,
        description: "Unlock your creative potential with this comprehensive guide to artistic thinking.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
        price: 12.99,
        rentPrice: 3.99,
        category: "Self-Help",
        isPublished: true,
        isFeatured: true
      },
      {
        title: "Digital Transformation",
        authorId: 2,
        description: "A practical guide to transforming your business with digital technologies.",
        coverImage: "https://images.unsplash.com/photo-1603289847962-9ce53d6dd795",
        price: 14.99,
        rentPrice: 4.99,
        category: "Business",
        isPublished: true,
        isFeatured: true
      },
      {
        title: "Modern Philosophy",
        authorId: 3,
        description: "Explore the most important philosophical concepts of the modern era.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
        price: 9.99,
        rentPrice: 2.99,
        category: "Non-Fiction",
        isPublished: true,
        isFeatured: true
      },
      {
        title: "Cooking Adventures",
        authorId: 1,
        description: "Discover exciting recipes from around the world in this culinary journey.",
        coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646",
        price: 11.49,
        rentPrice: 3.49,
        category: "Non-Fiction",
        isPublished: true,
        isFeatured: true
      },
      {
        title: "Data Science Fundamentals",
        authorId: 2,
        description: "Learn the basics of data science and how to apply it to real-world problems.",
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
        price: 16.99,
        rentPrice: 5.99,
        category: "Technology",
        isPublished: true,
        isFeatured: false
      },
      {
        title: "Marketing Strategies",
        authorId: 3,
        description: "Effective marketing techniques for the digital age.",
        coverImage: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb",
        price: 13.49,
        rentPrice: 4.49,
        category: "Business",
        isPublished: true,
        isFeatured: false
      },
      {
        title: "The Startup Mindset",
        authorId: 3,
        description: "Develop the entrepreneur mindset needed for startup success.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
        price: 18.99,
        rentPrice: 6.99,
        category: "Business",
        isPublished: true,
        isFeatured: false
      },
      {
        title: "AI Ethics",
        authorId: 2,
        description: "Exploring the ethical implications of artificial intelligence.",
        coverImage: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18",
        price: 15.99,
        rentPrice: 5.49,
        category: "Technology",
        isPublished: true,
        isFeatured: false
      },
      {
        title: "Sustainable Business",
        authorId: 3,
        description: "Strategies for building environmentally sustainable businesses.",
        coverImage: "https://images.unsplash.com/photo-1521123845560-14093637aa7d",
        price: 14.49,
        rentPrice: 4.99,
        category: "Business",
        isPublished: true,
        isFeatured: false
      },
      {
        title: "Web Development",
        authorId: 2,
        description: "A comprehensive guide to modern web development techniques.",
        coverImage: "https://images.unsplash.com/photo-1535398089889-dd807df1dfaa",
        price: 19.99,
        rentPrice: 6.99,
        category: "Technology",
        isPublished: true,
        isFeatured: false
      }
    ];
    
    sampleBooks.forEach(book => {
      this.createBook(book);
    });
    
    // Sample reviews to generate ratings
    const sampleReviews: InsertReview[] = [
      { userId: 1, bookId: 1, rating: 5, comment: "Excellent book on creativity!" },
      { userId: 2, bookId: 1, rating: 4, comment: "Very helpful guide." },
      { userId: 3, bookId: 1, rating: 5, comment: "Changed my approach to creative work." },
      { userId: 1, bookId: 2, rating: 4, comment: "Great insights on digital transformation." },
      { userId: 3, bookId: 2, rating: 4, comment: "Practical advice for businesses." },
      { userId: 2, bookId: 3, rating: 5, comment: "Wonderful introduction to modern philosophy." },
      { userId: 1, bookId: 3, rating: 5, comment: "Accessible and enlightening." },
      { userId: 2, bookId: 4, rating: 3, comment: "Some good recipes but nothing extraordinary." },
      { userId: 3, bookId: 4, rating: 3, comment: "Decent cooking guide." },
      { userId: 1, bookId: 5, rating: 4, comment: "Excellent introduction to data science." },
      { userId: 2, bookId: 5, rating: 4, comment: "Clear explanations of complex concepts." },
      { userId: 3, bookId: 6, rating: 3, comment: "Some useful strategies." }
    ];
    
    sampleReviews.forEach(review => {
      this.createReview(review);
    });
  }
}

export const storage = new MemStorage();
