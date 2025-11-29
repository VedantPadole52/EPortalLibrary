# Amravati Municipal Corporation - E-Library Portal

## Overview

This is a full-stack digital library portal for the Amravati Municipal Corporation, designed to provide citizens with access to a comprehensive collection of books, NCERTs, and historical archives. The application features distinct user experiences for citizens and administrators, with a strong emphasis on government authenticity combined with modern digital engagement.

The portal serves as a secure gateway to learning, offering thousands of searchable resources accessible from anywhere. It implements session-based authentication, real-time user tracking, and comprehensive book management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR and optimized production builds
- Wouter for lightweight client-side routing without the overhead of React Router

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- Tailwind CSS v4 with custom design tokens for the government brand palette
- Custom theme variables for Royal Deep Blue (#0A346F), Digital Green (#008C45), and Subtle Gold/Saffron (#FF9933)
- Responsive design with mobile-first approach using Tailwind's breakpoint system

**State Management:**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Session-based authentication state with automatic refetch on window focus disabled to reduce server load
- Local component state for UI interactions and form handling

**Design Philosophy:**
The UI balances government authority (trust, stability) with modern digital attractiveness. This is achieved through:
- Professional typography using Inter/Roboto for body text and Merriweather for headings
- Government branding with State Emblem of India and Municipal Corporation logo
- Warm accents to avoid the "boring government site" stereotype
- Clear visual separation between public landing pages and authenticated portals

### Backend Architecture

**Server Framework:**
- Express.js for RESTful API endpoints and middleware pipeline
- HTTP server wrapped around Express for WebSocket upgrade capability
- Session middleware with PostgreSQL-backed session store for persistent authentication

**Authentication & Authorization:**
- Password hashing using bcryptjs (salt rounds: 10)
- Session-based authentication with express-session and connect-pg-simple
- Role-based access control distinguishing between "citizen" and "admin" users
- Separate admin portal (/portal/admin-access) to prevent unauthorized access
- Middleware guards: `requireAuth` for authenticated routes, `requireAdmin` for admin-only endpoints

**API Structure:**
The server exposes RESTful endpoints organized by resource type:
- `/api/auth/*` - Authentication (login, logout, register, current user)
- `/api/books/*` - Book CRUD operations, search functionality
- `/api/categories/*` - Category management
- `/api/reading-history/*` - User reading progress, bookmarks, history tracking
- `/api/admin/*` - Administrative statistics and real-time monitoring

**Real-time Features:**
- WebSocket integration for live user activity tracking
- Active session monitoring for admin dashboard
- Real-time statistics updates (active users, total visits)

### Data Storage & ORM

**Database:**
- PostgreSQL as the primary relational database
- Neon serverless PostgreSQL with WebSocket connections for scalability
- Connection pooling via @neondatabase/serverless Pool

**ORM & Schema Management:**
- Drizzle ORM for type-safe database queries and migrations
- Schema definition in TypeScript with automatic type inference
- Database migrations stored in `/migrations` directory
- Schema location: `shared/schema.ts` for sharing types between client and server

**Data Models:**
1. **Users** - UUID primary key, email/password auth, role field, timestamps
2. **Categories** - Serial ID, name, description for organizing books
3. **Books** - Comprehensive metadata including title, author, ISBN, category, PDF URL, cover image, language, pages, publish year
4. **Reading History** - Tracks user progress, last read page, bookmarks, completion status
5. **Active Sessions** - Real-time tracking of current user activity

**Validation:**
- Zod schemas for runtime validation on both client and server
- Schema definitions co-located with Drizzle tables using drizzle-zod
- Custom validation error formatting with zod-validation-error

### External Dependencies

**Third-party Services:**
- Neon Database - Serverless PostgreSQL hosting with WebSocket support
- Replit-specific integrations:
  - @replit/vite-plugin-runtime-error-modal for development error overlays
  - @replit/vite-plugin-cartographer for code navigation (dev only)
  - @replit/vite-plugin-dev-banner for development environment indicator (dev only)

**Asset Management:**
- Static assets served from `/client/public` directory
- Generated images stored in `/attached_assets/generated_images/`
- Custom Vite plugin (vite-plugin-meta-images) for dynamic OpenGraph image URL injection based on Replit deployment domain

**Build & Deployment:**
- Production build bundles server with esbuild to single CJS file
- Client built with Vite to `/dist/public`
- Allowlist bundling strategy for select dependencies to reduce cold start syscalls
- Static file serving with Express fallback to index.html for SPA routing

**Environment Variables:**
- `DATABASE_URL` - Required PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption (default provided for development)
- `NODE_ENV` - Environment indicator (development/production)
- `REPL_ID` - Replit environment detection for conditional plugin loading

**Key Libraries:**
- Form handling: react-hook-form with @hookform/resolvers
- Date manipulation: date-fns
- Charts: recharts for admin dashboard analytics
- Icons: lucide-react
- WebSockets: ws for server-side connections
- File uploads: multer (configured but not actively used in current implementation)