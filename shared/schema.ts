import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  isAuthor: boolean("is_author").default(false).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  bio: true,
  isAuthor: true,
  avatarUrl: true
});

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authorId: integer("author_id").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  price: doublePrecision("price").notNull(),
  rentPrice: doublePrecision("rent_price"),
  category: text("category").notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  rating: doublePrecision("rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull()
});

export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  authorId: true,
  description: true,
  coverImage: true,
  price: true,
  rentPrice: true,
  category: true,
  isPublished: true,
  isFeatured: true
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  purchaseType: text("purchase_type").notNull(), // "buy" or "rent"
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Only for rentals
  isActive: boolean("is_active").default(true).notNull()
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  bookId: true,
  purchaseType: true,
  amount: true,
  expiresAt: true
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  purchaseType: text("purchase_type").notNull(), // "buy" or "rent"
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  bookId: true,
  purchaseType: true
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  bookId: true,
  rating: true,
  comment: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
