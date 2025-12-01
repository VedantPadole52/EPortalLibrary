# Amravati Municipal Corporation - E-Library Portal

A full-stack digital library portal for the Amravati Municipal Corporation, providing citizens with access to thousands of books, NCERTs, and historical archives with gamification features.

## 🚀 Quick Start

### Prerequisites

You need the following installed on your system:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional, for cloning)

### Installation Steps

#### Step 1: Extract and Navigate to Project
```bash
# If you have a zip file, extract it
unzip elibrary-portal.zip
cd elibrary-portal

# Or if cloning from git
git clone <repository-url>
cd elibrary-portal
```

#### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages (React, Express, Drizzle ORM, Tailwind CSS, etc.)

#### Step 3: Create Database

**Option A: Using PostgreSQL CLI**
```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE elibrary;

# Exit
\q
```

**Option B: Using pgAdmin GUI**
- Open pgAdmin
- Right-click "Databases" → Create → Database
- Name: `elibrary`
- Click Save

#### Step 4: Environment Variables Setup

Create a `.env` file in the project root with:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/elibrary

# OpenAI API (for AI-powered book summaries)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Session Secret (can be any random string)
SESSION_SECRET=your-secret-key-here-change-in-production

# Port (optional, defaults to 5000)
PORT=5000

# Node Environment
NODE_ENV=development
```

**Getting OPENAI_API_KEY:**
1. Go to [openai.com](https://openai.com)
2. Sign up or login
3. Go to API keys section
4. Create new secret key
5. Copy and paste in `.env`

#### Step 5: Initialize Database

```bash
# Run database migrations
npm run db:push
```

This creates all necessary tables automatically.

#### Step 6: (Optional) Seed Sample Data

The database comes with sample books. To add more, you can use the Admin Panel after login.

#### Step 7: Start the Application

**Development Mode:**
```bash
npm run dev
```

The app will start on `http://localhost:5000`

**Production Mode:**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
elibrary-portal/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # React pages (Dashboard, Login, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # API client, utilities
│   │   └── App.tsx           # Main app component
│   └── index.html            # Entry HTML file
├── server/                    # Backend Express server
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # Database queries
│   ├── index.ts              # Server entry point
│   └── db.ts                 # Database configuration
├── shared/                    # Shared code (types, schemas)
│   └── schema.ts             # Database schema definition
├── public/                    # Static files & uploads folder
│   └── uploads/              # User-uploaded PDFs and images
├── package.json              # Dependencies
├── .env                       # Environment variables (create this)
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## 🔑 Test Credentials

After installation, you can login with these demo accounts:

### Citizen Account
- **Email:** demo@user.com
- **Password:** user123

### Admin Account
- **Email:** admin@amc.edu
- **Password:** admin123

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:push        # Sync database schema
npm run db:studio      # Open Drizzle Studio (GUI for database)

# Code Quality
npm run lint           # Run linter
npm run type-check     # Check TypeScript errors
```

## 📋 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|------------|
| Node.js   | v16     | v18+       |
| RAM       | 512MB   | 2GB+       |
| Storage   | 500MB   | 1GB+       |
| PostgreSQL| v10     | v12+       |

## 🔧 Troubleshooting

### Issue: "Cannot find module" error

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Database connection error

**Solution:**
1. Check PostgreSQL is running: `psql --version`
2. Verify credentials in `.env` match your PostgreSQL setup
3. Ensure database exists: `psql -U postgres -l`
4. Test connection: `psql postgresql://postgres:password@localhost:5432/elibrary`

### Issue: Port 5000 already in use

**Solution:**
```bash
# Use different port
PORT=3000 npm run dev

# Or kill process using port 5000
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: OpenAI API errors

**Solution:**
1. Verify API key is correct in `.env`
2. Check OpenAI account has credits/quota
3. Test key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

## 📊 Features

✅ **Citizen Portal**
- Browse 1000+ books
- Real-time search with smart ranking
- PDF viewer (online & offline download)
- Reading history & progress tracking
- Wishlist & bookmarks
- Gamification (reading streaks, achievements, goals)
- Profile with statistics

✅ **Admin Portal**
- Book management (add, edit, delete)
- PDF upload support
- User management & blocking
- Category management
- Analytics dashboard
- PDF & Excel report generation
- Announcement posting
- AI-powered book summaries

✅ **Technical**
- PostgreSQL database with 10+ indexes
- Session-based authentication
- Rate limiting (100 req/min)
- Response compression
- Real-time data sync
- Multi-language support (English, Marathi, Hindi)
- Dark/Light mode
- Responsive design

## 🚀 Deployment

### Deploying to Replit

1. Push code to GitHub
2. Go to [replit.com](https://replit.com)
3. Click "Create Repl" → Import from GitHub
4. Select your repository
5. Set environment variables in Secrets
6. Click Run

### Deploying to Other Platforms

The app can be deployed to:
- Heroku
- Vercel (frontend) + Railway/Render (backend)
- DigitalOcean
- AWS
- Self-hosted servers

See deployment guides in each platform's documentation.

## 📚 Database Tables

- `users` - User accounts with roles
- `books` - Book catalog with metadata
- `categories` - Book categories
- `reading_history` - User reading progress
- `active_sessions` - Real-time user sessions
- `announcements` - Admin announcements
- `reading_streaks` - User reading streaks
- `reading_goals` - Annual reading targets
- `book_ratings` - Ratings and reviews
- `reading_wishlist` - User wishlists
- `achievements` - User badges and achievements

## 🛡️ Security Notes

- Change `SESSION_SECRET` in production
- Never commit `.env` file
- Keep `OPENAI_API_KEY` secure
- Enable HTTPS in production
- Regular database backups recommended
- Update dependencies periodically

## 📞 Support

For issues or questions:
1. Check Troubleshooting section above
2. Review logs in console
3. Check PostgreSQL is running
4. Verify environment variables
5. Ensure Node.js version is compatible

## 📄 License

This project is for Amravati Municipal Corporation.

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` file with credentials
3. ✅ Setup PostgreSQL database
4. ✅ Run migrations: `npm run db:push`
5. ✅ Start application: `npm run dev`
6. ✅ Open http://localhost:5000
7. ✅ Login with demo credentials

---

**Happy Learning! 📚**

For the latest updates and documentation, visit the project repository.
