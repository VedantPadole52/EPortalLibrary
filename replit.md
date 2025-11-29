# Amravati Municipal Corporation - E-Library Portal

## Overview

This is a full-stack digital library portal for the Amravati Municipal Corporation, designed to provide citizens with access to a comprehensive collection of books, NCERTs, and historical archives. The application features distinct user experiences for citizens and administrators, with a strong emphasis on government authenticity combined with modern digital engagement.

The portal serves as a secure gateway to learning, offering thousands of searchable resources accessible from anywhere. It implements session-based authentication, real-time user tracking, comprehensive book management capabilities, and file upload support for PDF documents.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Features Added

### User Management
- **Citizen Registration**: New `/register` page for user account creation with validation
- **Admin User Dashboard**: `/admin/users` page showing all registered citizens with search functionality
- **Category Management**: `/admin/categories` page for admins to create and delete book categories

### File Upload
- **PDF Upload**: Admin can upload PDF files when adding new books in the book manager
- **File Storage**: PDFs stored in `public/uploads/` directory with unique filenames
- **File Display**: Visual indicator showing selected PDF file before upload

### Real-time Data
- Activity logs refresh every 5 seconds from `reading_history` table
- Daily visit charts show actual 7-day trends from database
- Category statistics pie chart displays real book distribution
- User activity tracker with completion status (started, reading, completed)

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**Pages:**
- `/` - Landing page
- `/login` - Citizen login
- `/register` - Citizen registration (NEW)
- `/citizen/dashboard` - Citizen library portal
- `/citizen/reading-history` - Reading progress tracking
- `/portal/admin-access` - Admin login
- `/admin/dashboard` - Admin dashboard with real-time analytics
- `/admin/books` - Book manager with PDF upload
- `/admin/users` - User management (NEW)
- `/admin/categories` - Category management (NEW)

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS v4 with custom design tokens for government branding
- Royal Deep Blue (#0A346F), Digital Green (#008C45), Saffron (#FF9933)

### Backend Architecture

**Server Framework:**
- Express.js for RESTful API endpoints
- Multer for file upload handling
- Session middleware with PostgreSQL-backed session store

**API Routes:**
- `/api/auth/*` - Authentication (login, logout, register, current user)
- `/api/books/*` - Book CRUD operations, search
- `/api/categories/*` - Category management
- `/api/admin/users` - Get all users
- `/api/admin/activity-logs` - Real-time activity logs
- `/api/admin/analytics-data` - Dashboard analytics (daily visits, category stats)
- `/api/upload` - File upload for PDFs and images

**File Upload:**
- Endpoint: `POST /api/upload` (requires admin authentication)
- Supported formats: PDF, JPG, PNG
- Files stored in `/public/uploads/` with timestamps
- Returns file URL for database storage

### Data Storage & ORM

**Database:**
- PostgreSQL with Drizzle ORM
- Tables: users, books, categories, reading_history, active_sessions

**Analytics Queries:**
- Daily visits (last 7 days)
- Category distribution
- Top books by reads
- User activity logs with timestamps

## Demo Credentials

**Citizen:**
- Email: `demo@user.com`
- Password: `user123`

**Admin:**
- Email: `admin@amc.edu`
- Password: `admin123`

## Key Libraries

- react-hook-form - Form validation
- @tanstack/react-query - Server state management
- recharts - Analytics charts
- lucide-react - Icons
- ws - WebSocket support
- multer - File uploads
- bcryptjs - Password hashing
