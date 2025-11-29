import { 
  users, 
  books,
  categories,
  readingHistory,
  activeSessions,
  type User, 
  type InsertUser,
  type Book,
  type InsertBook,
  type Category,
  type InsertCategory,
  type ReadingHistory,
  type InsertReadingHistory,
  type ActiveSession,
  type InsertActiveSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserStats(userId: string): Promise<{ booksRead: number; borrowed: number; points: number }>;
  
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  searchBooks(query: string): Promise<Book[]>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Reading History operations
  getReadingHistory(userId: string): Promise<ReadingHistory[]>;
  getReadingProgress(userId: string, bookId: number): Promise<ReadingHistory | undefined>;
  updateReadingProgress(history: InsertReadingHistory): Promise<ReadingHistory>;
  getRecentReads(userId: string, limit: number): Promise<ReadingHistory[]>;
  toggleBookmark(userId: string, bookId: number): Promise<ReadingHistory | undefined>;
  
  // Active Sessions (for real-time tracking)
  createSession(session: InsertActiveSession): Promise<ActiveSession>;
  getActiveSessionsCount(): Promise<number>;
  updateSessionActivity(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  getAllActiveSessions(): Promise<ActiveSession[]>;
  
  // Admin analytics
  getTotalUsers(): Promise<number>;
  getTotalBooks(): Promise<number>;
  getTodayVisits(): Promise<number>;
  getActivityLogs(limit: number): Promise<any[]>;
  getAnalyticsData(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  deleteCategory(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserStats(userId: string): Promise<{ booksRead: number; borrowed: number; points: number }> {
    const [result] = await db
      .select({ 
        count: sql<number>`count(*)`,
        completed: sql<number>`sum(case when ${readingHistory.progress} = 100 then 1 else 0 end)`,
        borrowed: sql<number>`count(distinct case when ${readingHistory.progress} > 0 and ${readingHistory.progress} < 100 then ${readingHistory.bookId} end)`
      })
      .from(readingHistory)
      .where(eq(readingHistory.userId, userId));
    
    const booksRead = Number(result?.completed || 0);
    const borrowed = Number(result?.borrowed || 0);
    const points = booksRead * 100 + borrowed * 20; // Simple points calculation
    
    return { booksRead, borrowed, points };
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined> {
    const [updated] = await db
      .update(books)
      .set(book)
      .where(eq(books.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(books)
      .where(
        sql`${books.title} ILIKE ${searchPattern} OR ${books.author} ILIKE ${searchPattern} OR ${books.subcategory} ILIKE ${searchPattern}`
      );
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Reading History operations
  async getReadingHistory(userId: string): Promise<ReadingHistory[]> {
    return await db
      .select()
      .from(readingHistory)
      .where(eq(readingHistory.userId, userId))
      .orderBy(desc(readingHistory.lastAccessedAt));
  }

  async getReadingProgress(userId: string, bookId: number): Promise<ReadingHistory | undefined> {
    const [history] = await db
      .select()
      .from(readingHistory)
      .where(
        and(
          eq(readingHistory.userId, userId),
          eq(readingHistory.bookId, bookId)
        )
      );
    return history || undefined;
  }

  async updateReadingProgress(history: InsertReadingHistory): Promise<ReadingHistory> {
    const existing = await this.getReadingProgress(history.userId, history.bookId);
    
    if (existing) {
      const [updated] = await db
        .update(readingHistory)
        .set({
          ...history,
          lastAccessedAt: new Date(),
        })
        .where(eq(readingHistory.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(readingHistory)
        .values(history)
        .returning();
      return created;
    }
  }

  async getRecentReads(userId: string, limit: number = 5): Promise<ReadingHistory[]> {
    return await db
      .select()
      .from(readingHistory)
      .where(eq(readingHistory.userId, userId))
      .orderBy(desc(readingHistory.lastAccessedAt))
      .limit(limit);
  }

  async toggleBookmark(userId: string, bookId: number): Promise<ReadingHistory | undefined> {
    const existing = await this.getReadingProgress(userId, bookId);
    
    if (existing) {
      const [updated] = await db
        .update(readingHistory)
        .set({ isBookmarked: !existing.isBookmarked })
        .where(eq(readingHistory.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(readingHistory)
        .values({ userId, bookId, isBookmarked: true, progress: 0 })
        .returning();
      return created;
    }
  }

  // Active Sessions
  async createSession(session: InsertActiveSession): Promise<ActiveSession> {
    const [newSession] = await db
      .insert(activeSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getActiveSessionsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(activeSessions)
      .where(sql`${activeSessions.lastActivityAt} > NOW() - INTERVAL '5 minutes'`);
    return Number(result?.count || 0);
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await db
      .update(activeSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(activeSessions.sessionId, sessionId));
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(activeSessions).where(eq(activeSessions.sessionId, sessionId));
  }

  async getAllActiveSessions(): Promise<ActiveSession[]> {
    return await db
      .select()
      .from(activeSessions)
      .where(sql`${activeSessions.lastActivityAt} > NOW() - INTERVAL '5 minutes'`)
      .orderBy(desc(activeSessions.lastActivityAt));
  }

  // Admin analytics
  async getTotalUsers(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result?.count || 0);
  }

  async getTotalBooks(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(books);
    return Number(result?.count || 0);
  }

  async getTodayVisits(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(distinct ${readingHistory.userId})` })
      .from(readingHistory)
      .where(sql`DATE(${readingHistory.lastAccessedAt}) = CURRENT_DATE`);
    return Number(result?.count || 0);
  }

  async getActivityLogs(limit: number): Promise<any[]> {
    const logs = await db
      .select({
        id: readingHistory.id,
        userId: readingHistory.userId,
        userName: users.name,
        action: sql`CASE 
          WHEN ${readingHistory.completedAt} IS NOT NULL THEN 'Book Completed'
          WHEN ${readingHistory.progress} > 0 THEN 'Reading in Progress'
          ELSE 'Started Reading'
        END`,
        type: sql`CASE 
          WHEN ${readingHistory.completedAt} IS NOT NULL THEN 'complete'
          WHEN ${readingHistory.progress} > 0 THEN 'reading'
          ELSE 'start'
        END`,
        timestamp: readingHistory.lastAccessedAt,
      })
      .from(readingHistory)
      .leftJoin(users, eq(readingHistory.userId, users.id))
      .orderBy(desc(readingHistory.lastAccessedAt))
      .limit(limit);
    
    return logs.map(log => ({
      ...log,
      timestamp: log.timestamp?.toISOString() || new Date().toISOString(),
    }));
  }

  async getAnalyticsData(): Promise<any> {
    const now = new Date();
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    // Daily visits for the last 7 days
    const dailyVisits = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(readingHistory)
        .where(sql`DATE(${readingHistory.lastAccessedAt}) = ${dateStr}`);
      
      dailyVisits.push({
        date: dateStr,
        visits: Number(result?.count || 0),
      });
    }

    // Category stats
    const categoryStats = await db
      .select({
        name: categories.name,
        count: sql<number>`count(${readingHistory.id})`,
      })
      .from(categories)
      .leftJoin(books, eq(categories.id, books.categoryId))
      .leftJoin(readingHistory, eq(books.id, readingHistory.bookId))
      .groupBy(categories.id, categories.name)
      .orderBy(sql`count(${readingHistory.id}) DESC`);

    // Top books
    const topBooks = await db
      .select({
        title: books.title,
        reads: sql<number>`count(${readingHistory.id})`,
      })
      .from(books)
      .leftJoin(readingHistory, eq(books.id, readingHistory.bookId))
      .groupBy(books.id, books.title)
      .orderBy(sql`count(${readingHistory.id}) DESC`)
      .limit(5);

    return {
      dailyVisits,
      categoryStats: categoryStats.map(c => ({
        name: c.name,
        count: Number(c.count || 0),
      })),
      topBooks: topBooks.map(b => ({
        title: b.title,
        reads: Number(b.reads || 0),
      })),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
