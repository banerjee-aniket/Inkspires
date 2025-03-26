import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, categories } from "./storage";
import { setupAuth } from "./auth";
import { insertBookSchema, insertCartItemSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get categories
  app.get("/api/categories", (req, res) => {
    res.json(categories);
  });

  // Book routes
  app.get("/api/books", async (req, res) => {
    try {
      const { category, authorId, featured, search } = req.query;
      
      const filters: any = {};
      
      if (category) {
        filters.category = category as string;
      }
      
      if (authorId) {
        filters.authorId = parseInt(authorId as string);
      }
      
      if (featured === "true") {
        filters.isFeatured = true;
      }
      
      if (search) {
        filters.search = search as string;
      }
      
      const books = await storage.getBooks(filters);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate that the user is an author
      if (!req.user.isAuthor) {
        return res.status(403).json({ message: "Only authors can create books" });
      }
      
      // Validate request body
      const validatedData = insertBookSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Validate that the user is the author of the book
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this book" });
      }
      
      const updatedBook = await storage.updateBook(bookId, req.body);
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Error updating book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Validate that the user is the author of the book
      if (book.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this book" });
      }
      
      await storage.deleteBook(bookId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting book" });
    }
  });

  // Author books
  app.get("/api/author-books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      if (!req.user.isAuthor) {
        return res.status(403).json({ message: "Not an author" });
      }
      
      const books = await storage.getBooks({ authorId: req.user.id });
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving author books" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItems = await storage.getCartItemWithBookDetails(req.user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request body
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if book exists
      const book = await storage.getBook(validatedData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const cartItem = await storage.addCartItem(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart data", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding to cart" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const cartItemId = parseInt(req.params.id);
      await storage.removeCartItem(cartItemId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      await storage.clearCart(req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get user's cart
      const cartItems = await storage.getCartItemWithBookDetails(req.user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Create an order for each cart item
      const orders = await Promise.all(
        cartItems.map(async (item) => {
          const orderData = {
            userId: req.user.id,
            bookId: item.bookId,
            purchaseType: item.purchaseType,
            amount: item.purchaseType === "buy" ? item.book.price : item.book.rentPrice,
            expiresAt: item.purchaseType === "rent" 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
              : undefined
          };
          
          // Validate order data
          const validatedData = insertOrderSchema.parse(orderData);
          
          return storage.createOrder(validatedData);
        })
      );
      
      // Clear the cart
      await storage.clearCart(req.user.id);
      
      res.status(201).json(orders);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  // Review routes
  app.get("/api/books/:id/reviews", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const reviews = await storage.getReviews(bookId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving reviews" });
    }
  });

  app.post("/api/books/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      
      // Check if book exists
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Validate request body
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        bookId
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
