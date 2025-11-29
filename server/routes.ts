import type { Express, Request, Response, NextFunction } from "express";
import expressApp from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerSchema, loginSchema, insertBookSchema, insertCategorySchema, insertReadingHistorySchema, insertAnnouncementSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { WebSocketServer } from "ws";
import multer, { type Multer } from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import XLSX from "xlsx";

const PgSession = connectPgSimple(session);

// Setup file upload
const uploadDir = path.join(".", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Extend Express Session to include userId and user role
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }
  next();
}

// Admin-only middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden. Admin access required." });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session configuration
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "amravati-elibrary-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // ============= AUTH ROUTES =============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existing = await storage.getUserByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Auto-login after registration
      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({ 
        message: "Registration successful",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({ 
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user stats
    const stats = await storage.getUserStats(user.id);

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      stats
    });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // ============= BOOK ROUTES =============
  
  // Get all books (with optional search)
  app.get("/api/books", async (req, res) => {
    try {
      const { search } = req.query;
      
      let books;
      if (search && typeof search === "string") {
        books = await storage.searchBooks(search);
      } else {
        books = await storage.getAllBooks();
      }

      res.json({ books });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
  });

  // Get single book
  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json({ book });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch book", error: error.message });
    }
  });

  // Create book (admin only)
  app.post("/api/books", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      res.json({ message: "Book created successfully", book });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      res.status(500).json({ message: "Failed to create book", error: error.message });
    }
  });

  // Update book (admin only)
  app.patch("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.updateBook(id, req.body);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json({ message: "Book updated successfully", book });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update book", error: error.message });
    }
  });

  // Delete book (admin only)
  app.delete("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBook(id);
      
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json({ message: "Book deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete book", error: error.message });
    }
  });

  // ============= CATEGORY ROUTES =============
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json({ categories });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json({ message: "Category created successfully", category });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      res.status(500).json({ message: "Failed to create category", error: error.message });
    }
  });

  // Get books by category
  app.get("/api/categories/:id/books", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const allBooks = await storage.getAllBooks();
      const filtered = allBooks.filter(b => b.categoryId === categoryId);
      res.json({ books: filtered });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
  });

  // ============= READING HISTORY ROUTES =============
  
  // Get user's reading history
  app.get("/api/reading-history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const history = await storage.getReadingHistory(userId);
      res.json({ history });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch reading history", error: error.message });
    }
  });

  // Get recent reads
  app.get("/api/reading-history/recent", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const limit = parseInt(req.query.limit as string) || 5;
      const recent = await storage.getRecentReads(userId, limit);
      res.json({ recent });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch recent reads", error: error.message });
    }
  });

  // Update reading progress
  app.post("/api/reading-history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const validatedData = insertReadingHistorySchema.parse({ ...req.body, userId });
      const history = await storage.updateReadingProgress(validatedData);
      res.json({ message: "Progress updated successfully", history });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      res.status(500).json({ message: "Failed to update progress", error: error.message });
    }
  });

  // Toggle bookmark
  app.post("/api/reading-history/bookmark/:bookId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const bookId = parseInt(req.params.bookId);
      const history = await storage.toggleBookmark(userId, bookId);
      res.json({ message: "Bookmark toggled successfully", history });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to toggle bookmark", error: error.message });
    }
  });

  // ============= ADMIN ROUTES =============
  
  // Get analytics
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const [totalUsers, totalBooks, todayVisits, activeUsers] = await Promise.all([
        storage.getTotalUsers(),
        storage.getTotalBooks(),
        storage.getTodayVisits(),
        storage.getActiveSessionsCount(),
      ]);

      res.json({
        totalUsers,
        totalBooks,
        todayVisits,
        activeUsers,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
    }
  });

  // Get all active sessions
  app.get("/api/admin/sessions", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllActiveSessions();
      res.json({ sessions });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
    }
  });

  // Get real activity logs
  app.get("/api/admin/activity-logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = await storage.getActivityLogs(limit);
      res.json({ logs });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch activity logs", error: error.message });
    }
  });

  // Get analytics data (charts)
  app.get("/api/admin/analytics-data", requireAdmin, async (req, res) => {
    try {
      const analyticsData = await storage.getAnalyticsData();
      res.json(analyticsData);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch analytics data", error: error.message });
    }
  });

  // Get all users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  });

  // Block/Unblock user
  app.patch("/api/admin/users/:userId/block", requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { blocked } = req.body;
      
      let user;
      if (blocked) {
        user = await storage.blockUser(userId);
      } else {
        user = await storage.unblockUser(userId);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });

  // Get user activity by period
  app.get("/api/admin/user-activity/:period", requireAdmin, async (req, res) => {
    try {
      const period = req.params.period as "daily" | "weekly" | "monthly" | "yearly";
      if (!["daily", "weekly", "monthly", "yearly"].includes(period)) {
        return res.status(400).json({ message: "Invalid period" });
      }
      const activity = await storage.getUserActivityByPeriod(period);
      res.json({ activity });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch activity", error: error.message });
    }
  });

  // Delete category
  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const result = await storage.deleteCategory(categoryId);
      res.json({ message: "Category deleted", deleted: result });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
  });

  // ============= FILE UPLOAD ROUTE =============
  
  app.post("/api/upload", requireAdmin, storage_multer.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ fileUrl, message: "File uploaded successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  });

  // Generate PDF Reports
  app.get("/api/admin/reports/:type", requireAdmin, async (req, res) => {
    try {
      const reportType = req.params.type;
      const analytics = await storage.getAnalyticsData();
      const totalUsers = await storage.getTotalUsers();
      const totalBooks = await storage.getTotalBooks();
      const todayVisits = await storage.getTodayVisits();
      const allUsers = await storage.getAllUsers();

      const doc = new PDFDocument({ margin: 40 });
      const filename = `e-library-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      doc.pipe(res);

      // Header
      doc.fontSize(22).font("Helvetica-Bold").text("Amravati E-Library Portal", { align: "center" });
      doc.fontSize(14).fillColor("#0A346F").text("Library Report", { align: "center" });
      doc.fontSize(10).fillColor("#666").text(`Report Type: ${reportType.replace(/-/g, ' ').toUpperCase()}`, { align: "center" });
      doc.fontSize(9).text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown();

      if (reportType === "system") {
        // System Overview Report
        doc.fontSize(16).font("Helvetica-Bold").fillColor("#000").text("📊 System Overview Report");
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").text("Summary Metrics:");
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text(`• Total Registered Users: ${totalUsers}`);
        doc.text(`• Total Books in Catalog: ${totalBooks}`);
        doc.text(`• Today's Active Users: ${todayVisits}`);
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text("Daily User Activity (Last 7 Days):");
        doc.fontSize(10).font("Helvetica").fillColor("#333");
        if (analytics.dailyVisits && analytics.dailyVisits.length > 0) {
          analytics.dailyVisits.forEach((day: any) => {
            doc.text(`  ${day.date.padEnd(10)} → ${day.visits} active users`);
          });
        }
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text("Category Distribution:");
        doc.fontSize(10).font("Helvetica").fillColor("#333");
        if (analytics.categoryStats && analytics.categoryStats.length > 0) {
          analytics.categoryStats.slice(0, 10).forEach((cat: any) => {
            doc.text(`  ${cat.name.padEnd(25)} → ${cat.count} books`);
          });
        }
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text("Most Popular Books:");
        doc.fontSize(10).font("Helvetica").fillColor("#333");
        if (analytics.topBooks && analytics.topBooks.length > 0) {
          analytics.topBooks.forEach((book: any, idx: number) => {
            doc.text(`  ${(idx + 1)}. ${book.title.substring(0, 50)} (${book.reads} reads)`);
          });
        }
      } else if (reportType === "category-details") {
        // Category Statistics Report
        doc.fontSize(16).font("Helvetica-Bold").fillColor("#000").text("📚 Category Statistics Report");
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").text("Category Breakdown:");
        doc.fontSize(10).font("Helvetica").fillColor("#333");
        
        const totalCatBooks = analytics.categoryStats?.reduce((sum: number, c: any) => sum + c.count, 0) || 0;
        
        if (analytics.categoryStats && analytics.categoryStats.length > 0) {
          analytics.categoryStats.forEach((cat: any) => {
            const percentage = totalCatBooks > 0 ? ((cat.count / totalCatBooks) * 100).toFixed(1) : 0;
            doc.text(`  ${cat.name.padEnd(30)} → ${cat.count} books (${percentage}%)`);
          });
        }
        
        doc.moveDown();
        doc.fontSize(11).fillColor("#666").text(`Total Books Across All Categories: ${totalCatBooks}`);
      } else if (reportType === "user-activity") {
        // User Activity Report
        doc.fontSize(16).font("Helvetica-Bold").fillColor("#000").text("👥 User Activity Report");
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").text("User Metrics:");
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text(`• Total Registered Users: ${totalUsers}`);
        doc.text(`• Today's Active Users: ${todayVisits}`);
        doc.text(`• Active Users Percentage: ${totalUsers > 0 ? ((todayVisits / totalUsers) * 100).toFixed(1) : 0}%`);
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text("Recent User Registrations:");
        doc.fontSize(10).font("Helvetica").fillColor("#333");
        allUsers.slice(0, 15).forEach((user: any, idx: number) => {
          const regDate = new Date(user.createdAt).toLocaleDateString();
          doc.text(`  ${(idx + 1)}. ${user.name} (${user.email}) - Joined: ${regDate}`);
        });
      } else if (reportType === "circulation") {
        // Book Circulation Report
        doc.fontSize(16).font("Helvetica-Bold").fillColor("#000").text("📖 Book Circulation Report");
        doc.moveDown();

        doc.fontSize(12).font("Helvetica-Bold").text("Top Books by Circulation:");
        doc.fontSize(10).font("Helvetica").fillColor("#333");
        if (analytics.topBooks && analytics.topBooks.length > 0) {
          analytics.topBooks.forEach((book: any, idx: number) => {
            doc.text(`  ${(idx + 1)}. ${book.title.substring(0, 50)}`);
            doc.text(`     Times Read: ${book.reads}`, { indent: 20 });
          });
        }
        
        doc.moveDown();
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#000").text("Collection Statistics:");
        doc.fontSize(11).font("Helvetica").fillColor("#333");
        doc.text(`• Total Books: ${totalBooks}`);
        doc.text(`• Categories: ${analytics.categoryStats?.length || 0}`);
      }

      doc.moveDown(2);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.fontSize(8).fillColor("#999").text("© Amravati Municipal Corporation - E-Library Portal. This is an automated report.", { align: "center" });

      doc.end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
  });

  // Excel Export Endpoint
  app.get("/api/admin/export/:type", requireAdmin, async (req, res) => {
    try {
      const exportType = req.params.type;
      const analytics = await storage.getAnalyticsData();
      const totalUsers = await storage.getTotalUsers();
      const totalBooks = await storage.getTotalBooks();
      const todayVisits = await storage.getTodayVisits();
      const allUsers = await storage.getAllUsers();

      let workbook = XLSX.utils.book_new();
      const filename = `e-library-export-${exportType}-${new Date().toISOString().split('T')[0]}.xlsx`;

      if (exportType === "system") {
        // Summary sheet
        const summaryData = [
          { Metric: "Total Registered Users", Value: totalUsers },
          { Metric: "Total Books in Catalog", Value: totalBooks },
          { Metric: "Today's Active Users", Value: todayVisits },
          { Metric: "Categories", Value: analytics.categoryStats?.length || 0 },
        ];
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), "Summary");

        // Daily visits sheet
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analytics.dailyVisits), "Daily Visits");

        // Category sheet
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analytics.categoryStats), "Categories");

        // Top books sheet
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(analytics.topBooks), "Top Books");
      } else if (exportType === "users") {
        // Users sheet with details
        const userData = allUsers.map((user: any) => ({
          Name: user.name,
          Email: user.email,
          Phone: user.phone || "N/A",
          Role: user.role,
          Status: user.isBlocked ? "Blocked" : "Active",
          "Joined Date": new Date(user.createdAt).toLocaleDateString(),
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(userData), "Users");
      } else if (exportType === "categories") {
        // Category analysis
        const catData = analytics.categoryStats.map((cat: any) => ({
          Category: cat.name,
          "Book Count": cat.count,
          Percentage: `${((cat.count / (analytics.categoryStats.reduce((s: number, c: any) => s + c.count, 0))) * 100).toFixed(1)}%`,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(catData), "Categories");
      } else if (exportType === "circulation") {
        // Book circulation data
        const circData = analytics.topBooks.map((book: any, idx: number) => ({
          Rank: idx + 1,
          "Book Title": book.title,
          "Times Read": book.reads,
        }));
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(circData), "Circulation");
      }

      // Send file
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to export data", error: error.message });
    }
  });

  // Legacy report endpoint for compatibility
  app.get("/api/admin/generate-report", requireAdmin, async (req, res) => {
    res.redirect("/api/admin/reports/system");
  });

  // ============= ANNOUNCEMENTS ROUTES =============

  // Get all announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const announcements = await storage.getAnnouncements(limit);
      res.json({ announcements });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
    }
  });

  // Create announcement (admin only)
  app.post("/api/announcements", requireAdmin, async (req, res) => {
    try {
      const validated = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement({
        ...validated,
        createdBy: req.session.userId!
      });
      res.json({ announcement });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create announcement", error: error.message });
    }
  });

  // Delete announcement (admin only)
  app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.json({ message: "Announcement deleted" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Serve static files from public directory
  app.use(expressApp.static(path.join(".", "public")));

  // ============= WEBSOCKET FOR REAL-TIME UPDATES =============
  
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  wss.on("connection", async (ws, req) => {
    console.log("WebSocket client connected");
    
    // Extract session from cookie if available
    // For now, we'll send updates to all connected clients
    
    // Send initial data
    const activeCount = await storage.getActiveSessionsCount();
    ws.send(JSON.stringify({ type: "active_users", count: activeCount }));
    
    // Handle ping/pong for keep-alive
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 30000);
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "heartbeat" && data.userId) {
          // Update user's session activity
          // This would require storing WebSocket session IDs
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    
    ws.on("close", () => {
      clearInterval(interval);
      console.log("WebSocket client disconnected");
    });
  });

  // Broadcast active users count every 5 seconds to all connected clients
  setInterval(async () => {
    if (wss.clients.size > 0) {
      const activeCount = await storage.getActiveSessionsCount();
      const message = JSON.stringify({ type: "active_users", count: activeCount });
      
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      });
    }
  }, 5000);

  return httpServer;
}
