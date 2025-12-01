import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table - Keep existing ID type (varchar with UUID)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 15 }),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("citizen"), // 'citizen' or 'admin'
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = insertUserSchema.extend({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Books Table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  subcategory: varchar("subcategory", { length: 100 }),
  description: text("description"),
  coverUrl: text("cover_url"),
  pdfUrl: text("pdf_url"),
  isbn: varchar("isbn", { length: 20 }),
  publishYear: integer("publish_year"),
  pages: integer("pages"),
  language: varchar("language", { length: 50 }).default("English"),
  aiSummary: text("ai_summary"),
  summaryGeneratedAt: timestamp("summary_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  aiSummary: true,
  summaryGeneratedAt: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Reading History Table
export const readingHistory = pgTable("reading_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  progress: integer("progress").default(0), // Percentage (0-100)
  lastReadPage: integer("last_read_page").default(0),
  isBookmarked: boolean("is_bookmarked").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertReadingHistorySchema = createInsertSchema(readingHistory).omit({
  id: true,
  lastAccessedAt: true,
});

export type InsertReadingHistory = z.infer<typeof insertReadingHistorySchema>;
export type ReadingHistory = typeof readingHistory.$inferSelect;

// Active Sessions Table (for real-time tracking)
export const activeSessions = pgTable("active_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
});

export const insertActiveSessionSchema = createInsertSchema(activeSessions).omit({
  id: true,
  connectedAt: true,
  lastActivityAt: true,
});

export type InsertActiveSession = z.infer<typeof insertActiveSessionSchema>;
export type ActiveSession = typeof activeSessions.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  readingHistory: many(readingHistory),
  activeSessions: many(activeSessions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  readingHistory: many(readingHistory),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
  user: one(users, {
    fields: [readingHistory.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [readingHistory.bookId],
    references: [books.id],
  }),
}));

export const activeSessionsRelations = relations(activeSessions, ({ one }) => ({
  user: one(users, {
    fields: [activeSessions.userId],
    references: [users.id],
  }),
}));

// Announcements Table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

// Reading Streaks Table - Track consecutive days of reading
export const readingStreaks = pgTable("reading_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastReadDate: timestamp("last_read_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReadingStreakSchema = createInsertSchema(readingStreaks).omit({
  id: true,
  createdAt: true,
});

export type InsertReadingStreak = z.infer<typeof insertReadingStreakSchema>;
export type ReadingStreak = typeof readingStreaks.$inferSelect;

// Reading Goals Table - Users set annual reading targets
export const readingGoals = pgTable("reading_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  year: integer("year").notNull(),
  targetBooks: integer("target_books").notNull(),
  booksRead: integer("books_read").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReadingGoalSchema = createInsertSchema(readingGoals).omit({
  id: true,
  createdAt: true,
});

export type InsertReadingGoal = z.infer<typeof insertReadingGoalSchema>;
export type ReadingGoal = typeof readingGoals.$inferSelect;

// Book Ratings & Reviews Table
export const bookRatings = pgTable("book_ratings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  helpful: integer("helpful").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookRatingSchema = createInsertSchema(bookRatings).omit({
  id: true,
  createdAt: true,
});

export type InsertBookRating = z.infer<typeof insertBookRatingSchema>;
export type BookRating = typeof bookRatings.$inferSelect;

// Reading Wishlist Table - Save books to read later
export const readingWishlist = pgTable("reading_wishlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertWishlistSchema = createInsertSchema(readingWishlist).omit({
  id: true,
  addedAt: true,
});

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof readingWishlist.$inferSelect;

// Reading Achievements Table - Badges earned
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'streak_7', 'books_10', 'first_review', etc
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// Relations
export const readingStreaksRelations = relations(readingStreaks, ({ one }) => ({
  user: one(users, {
    fields: [readingStreaks.userId],
    references: [users.id],
  }),
}));

export const readingGoalsRelations = relations(readingGoals, ({ one }) => ({
  user: one(users, {
    fields: [readingGoals.userId],
    references: [users.id],
  }),
}));

export const bookRatingsRelations = relations(bookRatings, ({ one }) => ({
  user: one(users, {
    fields: [bookRatings.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [bookRatings.bookId],
    references: [books.id],
  }),
}));

export const wishlistRelations = relations(readingWishlist, ({ one }) => ({
  user: one(users, {
    fields: [readingWishlist.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [readingWishlist.bookId],
    references: [books.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Notifications Table - Real-time alerts for books and challenges
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'new_book', 'reading_challenge', 'achievement'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  bookId: integer("book_id").references(() => books.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
