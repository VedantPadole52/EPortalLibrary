# Complete Local Setup Guide

## 🎯 Quick Setup (5 minutes)

If you're in a hurry, follow these commands:

```bash
# 1. Extract and enter directory
unzip elibrary-portal.zip
cd elibrary-portal

# 2. Install dependencies
npm install

# 3. Create database
psql -U postgres
# In PostgreSQL:
# CREATE DATABASE elibrary;
# \q

# 4. Create .env file
cp .env.example .env
# Edit .env and update DATABASE_URL with your PostgreSQL password

# 5. Initialize database
npm run db:push

# 6. Start app
npm run dev

# 7. Open browser
# Visit http://localhost:5000
```

---

## 📋 Detailed Step-by-Step Guide

### Step 1: Prerequisites Installation

#### Windows
1. Download Node.js from https://nodejs.org/ (v18+)
2. Run installer, follow prompts
3. Download PostgreSQL from https://www.postgresql.org/download/
4. Run installer, choose password for 'postgres' user
5. Remember this password - you'll need it!

#### macOS
```bash
# Using Homebrew
brew install node
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Verify Installation

```bash
node --version      # Should show v18.0.0 or higher
npm --version       # Should show 9.0.0 or higher
psql --version      # Should show PostgreSQL 12 or higher
```

### Step 3: Extract Project

```bash
# If you have a zip file
unzip elibrary-portal.zip
cd elibrary-portal

# If you have source code folder
cd elibrary-portal
```

### Step 4: Install Dependencies

```bash
npm install
```

This downloads ~800MB of packages. It may take 2-5 minutes depending on internet speed.

**If it fails:**
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### Step 5: Setup PostgreSQL Database

#### Option A: Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (copy-paste these commands)
CREATE DATABASE elibrary;
\q

# Verify database was created
psql -U postgres -l
# You should see 'elibrary' in the list
```

#### Option B: Using pgAdmin GUI

1. Open pgAdmin (installed with PostgreSQL)
2. Right-click "Databases" → Create → Database
3. Name: `elibrary`
4. Click Save

### Step 6: Create Environment File

```bash
# Copy example file
cp .env.example .env

# Edit .env file with your text editor and update:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/elibrary
```

**Important:** Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation!

### Step 7: Test Database Connection

```bash
# This will show you connected to the database
psql postgresql://postgres:YOUR_PASSWORD@localhost:5432/elibrary

# If successful, you'll see: elibrary=#
# Exit with: \q
```

### Step 8: Initialize Database Schema

```bash
npm run db:push
```

This creates all tables automatically. You should see:
```
✓ Tables created successfully
```

### Step 9: Get OpenAI API Key (Optional)

For AI-powered book summaries:

1. Go to https://platform.openai.com/
2. Sign up or login
3. Click API keys in left sidebar
4. Click "Create new secret key"
5. Copy the key (looks like: `sk-xxx...`)
6. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

### Step 10: Start Application

```bash
# Development mode (with auto-reload)
npm run dev
```

You should see:
```
7:48:53 AM [express] serving on port 5000
```

### Step 11: Open in Browser

Visit: http://localhost:5000

### Step 12: Login

Use these test accounts:

**Citizen:**
- Email: demo@user.com
- Password: user123

**Admin:**
- Email: admin@amc.edu
- Password: admin123

---

## 📁 Required Files & Folders

### Must Exist in Project Root:
- ✅ `package.json` - Dependencies list
- ✅ `tsconfig.json` - TypeScript config
- ✅ `.env` - **You must create this** (copy from .env.example)

### Must Create Manually:
- `public/uploads/` - For file uploads (created automatically if missing)

### Auto-Generated (Don't worry):
- `node_modules/` - Created by `npm install`
- `dist/` - Created by `npm run build`

### Directory Structure Should Look Like:

```
elibrary-portal/
├── client/                      ← Frontend code
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.tsx
│   └── index.html
├── server/                      ← Backend code
│   ├── routes.ts
│   ├── storage.ts
│   └── index.ts
├── shared/                      ← Shared types
│   └── schema.ts
├── public/                      ← Static files
│   └── uploads/                 ← Will be created automatically
├── .env                         ← CREATE THIS (from .env.example)
├── .env.example                 ← Copy this to .env
├── package.json
├── README.md
├── SETUP_GUIDE.md
└── tsconfig.json
```

---

## 🆘 Troubleshooting

### Problem: `npm install` fails

**Solution:**
```bash
# Try clearing npm cache
npm cache clean --force

# Try installing with legacy peer deps
npm install --legacy-peer-deps

# Or use Yarn instead
npm install -g yarn
yarn install
```

### Problem: PostgreSQL connection error

**Solution:**
```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows: Check Services app

# If not running, start it:
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Problem: Database doesn't exist

**Solution:**
```bash
# Create it again
psql -U postgres
CREATE DATABASE elibrary;
\q

# Then run:
npm run db:push
```

### Problem: Port 5000 already in use

**Solution:**
```bash
# Use different port
PORT=3000 npm run dev

# Or find and kill process using 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Problem: Cannot login

**Solution:**
1. Clear browser cookies/cache
2. Make sure database initialized: `npm run db:push`
3. Check `.env` DATABASE_URL is correct
4. Check PostgreSQL is running

---

## 🔄 Development Workflow

### During Development

```bash
# Terminal 1: Start app with auto-reload
npm run dev

# Terminal 2: Watch database changes (optional)
npm run db:studio
```

### Making Changes

1. Edit files in `client/src/` or `server/`
2. Changes auto-reload in browser (client-side)
3. For backend changes, may need to restart: `Ctrl+C` then `npm run dev`

### Database Changes

If you modify `shared/schema.ts`:
```bash
npm run db:push
```

---

## 🚀 Building for Production

```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

Visit: http://localhost:5000

---

## 📊 Useful Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run db:push` | Sync database schema |
| `npm run db:studio` | Open database GUI |
| `npm run lint` | Check code quality |

---

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version` shows v18+)
- [ ] npm installed (`npm --version` shows v9+)
- [ ] PostgreSQL installed and running
- [ ] Project files extracted
- [ ] `npm install` completed successfully
- [ ] `.env` file created with correct DATABASE_URL
- [ ] Database created in PostgreSQL
- [ ] `npm run db:push` completed successfully
- [ ] `npm run dev` shows "serving on port 5000"
- [ ] Browser opens to http://localhost:5000
- [ ] Can login with demo@user.com / user123

---

## 🎓 Next Steps After Setup

1. ✅ Login with citizen account to explore portal
2. ✅ Login with admin account to manage books
3. ✅ Read `README.md` for features overview
4. ✅ Check `client/src/pages/` to understand structure
5. ✅ Explore Admin Dashboard to add books

---

## 📞 Common Questions

**Q: What if npm install hangs?**
A: Try with `--legacy-peer-deps` flag or increase timeout: `npm install --fetch-timeout=120000`

**Q: Can I use MySQL instead of PostgreSQL?**
A: No, this project uses PostgreSQL. You must use PostgreSQL.

**Q: Do I need OpenAI API key?**
A: Optional. If not provided, AI summaries feature will be disabled.

**Q: Can I change the port?**
A: Yes, set `PORT=3000 npm run dev` for port 3000.

**Q: How do I add new books?**
A: Login as admin, go to "Admin Dashboard" → "Book Manager" → Add Book.

---

**You're all set! Happy coding! 🚀**
