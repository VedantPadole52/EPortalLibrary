import { 
  users, 
  books,
  categories,
  readingHistory,
  activeSessions,
  announcements,
  notifications,
  type User, 
  type InsertUser,
  type Book,
  type InsertBook,
  type Category,
  type InsertCategory,
  type ReadingHistory,
  type InsertReadingHistory,
  type ActiveSession,
  type InsertActiveSession,
  type Announcement,
  type InsertAnnouncement
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
  getAllBooks(page?: number, limit?: number): Promise<{ books: Book[]; total: number }>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  searchBooks(query: string, page?: number, limit?: number): Promise<{ books: Book[]; total: number }>;
  
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
  
  // User management
  blockUser(userId: string): Promise<User | undefined>;
  unblockUser(userId: string): Promise<User | undefined>;
  getUserActivityByPeriod(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<any[]>;
  
  // Announcements
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(limit?: number): Promise<Announcement[]>;
  deleteAnnouncement(id: number): Promise<boolean>;

  // Leaderboards
  getTopReaders(): Promise<any[]>;
  getStreakLeaders(): Promise<any[]>;
  getMostReviewers(): Promise<any[]>;
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
  async getAllBooks(page: number = 1, limit: number = 20): Promise<{ books: Book[]; total: number }> {
    const offset = (page - 1) * limit;
    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(books);
    const bookList = await db.select().from(books).orderBy(desc(books.createdAt)).limit(limit).offset(offset);
    return { books: bookList, total: Number(total) };
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
      .set({
        ...book,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteBook(id: number): Promise<boolean> {
    // Use transaction to delete related records first
    return await db.transaction(async (tx) => {
      // Delete all reading history for this book
      await tx.delete(readingHistory).where(eq(readingHistory.bookId, id));
      // Delete the book
      const result = await tx.delete(books).where(eq(books.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    });
  }

  async searchBooks(query: string, page: number = 1, limit: number = 20): Promise<{ books: Book[]; total: number }> {
    const searchPattern = `%${query}%`;
    const offset = (page - 1) * limit;
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(books)
      .where(sql`${books.title} ILIKE ${searchPattern} OR ${books.author} ILIKE ${searchPattern} OR ${books.subcategory} ILIKE ${searchPattern}`);
    const bookList = await db
      .select()
      .from(books)
      .where(sql`${books.title} ILIKE ${searchPattern} OR ${books.author} ILIKE ${searchPattern} OR ${books.subcategory} ILIKE ${searchPattern}`)
      .limit(limit)
      .offset(offset);
    return { books: bookList, total: Number(total) };
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
    // Count distinct active users (not sessions) in last 5 minutes
    const [result] = await db
      .select({ count: sql<number>`count(distinct ${activeSessions.userId})` })
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
    // Count total visits (all sessions) TODAY, not just distinct users
    const [activeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(activeSessions)
      .where(sql`DATE(${activeSessions.lastActivityAt}) = CURRENT_DATE`);
    
    const activeCount = Number(activeResult?.count || 0);
    if (activeCount > 0) {
      return activeCount;
    }
    
    // Fallback: count total reading history entries if no active sessions today
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
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

    // Daily visits for the last 7 days - count from active sessions (last activity date)
    const dailyVisits = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count distinct users with activity on this date
      const [activeResult] = await db
        .select({ count: sql<number>`count(distinct ${activeSessions.userId})` })
        .from(activeSessions)
        .where(sql`DATE(${activeSessions.lastActivityAt}) = ${dateStr}`);
      
      let visitCount = Number(activeResult?.count || 0);
      
      // If no active sessions, use reading history as fallback
      if (visitCount === 0) {
        const [readResult] = await db
          .select({ count: sql<number>`count(distinct ${readingHistory.userId})` })
          .from(readingHistory)
          .where(sql`DATE(${readingHistory.lastAccessedAt}) = ${dateStr}`);
        visitCount = Number(readResult?.count || 0);
      }
      
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      dailyVisits.push({
        date: dayName,
        visits: visitCount,
      });
    }

    // Category stats - count of books per category
    const categoryStats = await db
      .select({
        name: categories.name,
        count: sql<number>`count(distinct ${books.id})`,
      })
      .from(categories)
      .leftJoin(books, eq(categories.id, books.categoryId))
      .groupBy(categories.id, categories.name)
      .orderBy(sql`count(distinct ${books.id}) DESC`);

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

  async blockUser(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isBlocked: true })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async unblockUser(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isBlocked: false })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Announcements
  async createAnnouncement(announcement: InsertAnnouncement & { createdBy?: string }): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title: announcement.title,
        content: announcement.content,
        isPublished: announcement.isPublished,
        createdBy: announcement.createdBy || ""
      })
      .returning();
    return newAnnouncement;
  }

  async getAnnouncements(limit: number = 10): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.isPublished, true))
      .orderBy(desc(announcements.createdAt))
      .limit(limit);
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id));
    return !!result;
  }

  async getUserActivityByPeriod(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<any[]> {
    const intervalMap = {
      daily: "1 day",
      weekly: "7 days",
      monthly: "30 days",
      yearly: "365 days"
    };
    
    const interval = intervalMap[period];
    const result = await db.select({
      period: sql<string>`to_char(${readingHistory.lastAccessedAt}, ${
        period === "daily" ? "'YYYY-MM-DD'" :
        period === "weekly" ? "'YYYY-W'||to_char(${readingHistory.lastAccessedAt}, 'WW')" :
        period === "monthly" ? "'YYYY-MM'" :
        "'YYYY'"
      })`,
      count: sql<number>`count(distinct ${readingHistory.userId})`
    })
    .from(readingHistory)
    .where(sql`${readingHistory.lastAccessedAt} > now() - interval '${sql.raw(interval)}'`)
    .groupBy(sql<string>`to_char(${readingHistory.lastAccessedAt}, ${
      period === "daily" ? "'YYYY-MM-DD'" :
      period === "weekly" ? "'YYYY-W'||to_char(${readingHistory.lastAccessedAt}, 'WW')" :
      period === "monthly" ? "'YYYY-MM'" :
      "'YYYY'"
    })`)
    .orderBy(sql`to_char(${readingHistory.lastAccessedAt}, ${
      period === "daily" ? "'YYYY-MM-DD'" :
      period === "weekly" ? "'YYYY-W'||to_char(${readingHistory.lastAccessedAt}, 'WW')" :
      period === "monthly" ? "'YYYY-MM'" :
      "'YYYY'"
    })`);
    
    return result;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getTopReaders(): Promise<any[]> {
    const result = await db.select({
      userId: readingHistory.userId,
      userName: users.name,
      booksRead: sql<number>`count(distinct ${readingHistory.bookId})`,
    })
    .from(readingHistory)
    .leftJoin(users, eq(readingHistory.userId, users.id))
    .where(eq(readingHistory.progress, 100))
    .groupBy(readingHistory.userId, users.name)
    .orderBy(sql`count(distinct ${readingHistory.bookId}) DESC`)
    .limit(10);
    
    return result.map((r: any) => ({
      userId: r.userId,
      name: r.userName || "Unknown",
      booksRead: Number(r.booksRead || 0),
    }));
  }

  async getStreakLeaders(): Promise<any[]> {
    const { readingStreaks } = await import("@shared/schema");
    const result = await db.select({
      userId: readingStreaks.userId,
      userName: users.name,
      currentStreak: readingStreaks.currentStreak,
      longestStreak: readingStreaks.longestStreak,
    })
    .from(readingStreaks)
    .leftJoin(users, eq(readingStreaks.userId, users.id))
    .where(sql`${readingStreaks.currentStreak} > 0`)
    .orderBy(sql`${readingStreaks.longestStreak} DESC`)
    .limit(10);
    
    return result.map((r: any) => ({
      userId: r.userId,
      name: r.userName || "Unknown",
      currentStreak: r.currentStreak || 0,
      longestStreak: r.longestStreak || 0,
    }));
  }

  async getMostReviewers(): Promise<any[]> {
    const { bookRatings } = await import("@shared/schema");
    const result = await db.select({
      userId: bookRatings.userId,
      userName: users.name,
      reviewCount: sql<number>`count(${bookRatings.id})`,
    })
    .from(bookRatings)
    .leftJoin(users, eq(bookRatings.userId, users.id))
    .groupBy(bookRatings.userId, users.name)
    .orderBy(sql`count(${bookRatings.id}) DESC`)
    .limit(10);
    
    return result.map((r: any) => ({
      userId: r.userId,
      name: r.userName || "Unknown",
      reviewCount: Number(r.reviewCount || 0),
    }));
  }

  async createNotification(notification: any): Promise<any> {
    try {
      const [newNotif] = await db.insert(notifications).values(notification).returning();
      return newNotif;
    } catch (error) {
      console.error("Notification creation error:", error);
      return null;
    }
  }

  async getUnreadNotifications(userId: string): Promise<any[]> {
    try {
      return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    } catch (error) {
      return [];
    }
  }

  async markNotificationAsRead(notifId: number): Promise<void> {
    try {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notifId));
    } catch (error) {
      console.error("Mark notification error:", error);
    }
  }
}

export const storage = new DatabaseStorage();
