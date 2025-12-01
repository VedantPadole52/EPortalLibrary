# 🏠 How to Run Locally - Step by Step for Beginners

Follow these steps one by one. Don't skip any step!

---

## ⚠️ BEFORE YOU START - Install These

### Step 0A: Install Node.js

**What is Node.js?**
It's the tool that runs the website on your computer.

**How to install:**
1. Go to: https://nodejs.org/
2. Click the BIG button that says "LTS" (Long Term Support)
3. Download it
4. Run the installer file (.exe on Windows)
5. Click "Next" and "Install" until it's done
6. **Restart your computer** (important!)

**Check if installed:**
Open Command Prompt or Terminal and type:
```
node --version
```
Should show: `v18.0.0` or higher

---

### Step 0B: Install PostgreSQL

**What is PostgreSQL?**
It's the database that stores all the books and user information.

**How to install:**
1. Go to: https://www.postgresql.org/download/
2. Download for your operating system
3. Run the installer
4. **Important:** Remember the password you set for "postgres" user!
5. Click "Next" until done

**Check if installed:**
Open Command Prompt or Terminal and type:
```
psql --version
```
Should show: `PostgreSQL 12` or higher

---

## 🎯 MAIN STEPS (Start Here)

### Step 1: Get the Project Files

**Option A: If you have a ZIP file**
```
1. Find the file: "elibrary-portal.zip" 
2. Right-click → Extract All
3. Remember where you extracted it
```

**Option B: If you have source code folder**
```
1. Open the folder in File Explorer or Terminal
2. Go inside "elibrary-portal" folder
```

---

### Step 2: Open Terminal/Command Prompt

**Windows:**
1. Press `Win + R`
2. Type: `cmd`
3. Press Enter

**Mac:**
1. Press `Cmd + Space`
2. Type: `terminal`
3. Press Enter

**Linux:**
1. Open Terminal application

---

### Step 3: Go to Project Folder

In Terminal/Command Prompt, type:

**Windows:**
```
cd C:\Users\YourName\Downloads\elibrary-portal
```
(Change path if you extracted somewhere else)

**Mac/Linux:**
```
cd ~/Downloads/elibrary-portal
```
(Change path if you extracted somewhere else)

**Check if you're in right folder:**
Type: `ls` or `dir`
You should see these files: `package.json`, `.env.example`, `start.sh`, `start.bat`

---

### Step 4: Install All Dependencies

**This downloads all the code packages needed. Takes 2-5 minutes.**

Type in Terminal:
```
npm install
```

**Wait until it's done. You'll see "added XXX packages"**

---

### Step 5: Create the Database

**Open PostgreSQL**

Type in Terminal:
```
psql -U postgres
```

It will ask: `Password for user postgres:`
Type the password you set during PostgreSQL installation.

---

**Create Database**

Now you should see: `postgres=#`

Type exactly:
```
CREATE DATABASE elibrary;
```

Press Enter. You should see: `CREATE DATABASE`

**Exit PostgreSQL**

Type:
```
\q
```

You should be back to regular Terminal prompt.

---

### Step 6: Create Environment File

**Create .env file**

Type in Terminal:
```
cp .env.example .env
```

(On Windows, use: `copy .env.example .env`)

---

**Edit the .env file**

1. Open a text editor (Notepad, VS Code, Sublime Text)
2. Open the file: `.env` (inside your project folder)
3. Find this line:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/elibrary
```

4. Replace `your_password` with YOUR PostgreSQL password
   - Example: 
   ```
   DATABASE_URL=postgresql://postgres:MyPassword123@localhost:5432/elibrary
   ```

5. Save the file

---

### Step 7: Initialize Database

**Create all database tables**

Type in Terminal:
```
npm run db:push
```

Wait for it to finish. You should see: `✅ Tables created successfully`

---

### Step 8: Start the Application

**EASIEST WAY - Use Auto Startup File:**

**Windows:**
```
start.bat
```
Or just double-click the `start.bat` file.

**Mac/Linux:**
```
bash start.sh
```

**Any Operating System:**
```
node start.js
```

---

**OR MANUAL WAY:**

Type in Terminal:
```
npm run dev
```

---

### Step 9: Open in Browser

**Wait for message:**
```
serving on port 5000
```

Then open your browser and go to:
```
http://localhost:5000
```

---

### Step 10: Login

**Use these test accounts:**

**For Citizen:**
- Email: `demo@user.com`
- Password: `user123`

**For Admin:**
- Email: `admin@amc.edu`
- Password: `admin123`

---

## ✅ CONGRATULATIONS!

You have successfully:
- ✅ Installed all requirements
- ✅ Set up the database
- ✅ Configured the project
- ✅ Started the application
- ✅ Logged in successfully

---

## 🆘 PROBLEMS? SOLUTIONS HERE

### Problem 1: "npm: command not found"

**Cause:** Node.js is not installed

**Fix:**
1. Install Node.js: https://nodejs.org/
2. **Restart your computer**
3. Try again

---

### Problem 2: "psql: command not found"

**Cause:** PostgreSQL is not installed

**Fix:**
1. Install PostgreSQL: https://www.postgresql.org/download/
2. **Restart your computer**
3. Try again

---

### Problem 3: "Database connection error"

**Cause:** Wrong DATABASE_URL in .env file

**Fix:**
1. Open `.env` file in text editor
2. Check the line:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/elibrary
   ```
3. Make sure `YOUR_PASSWORD` is your actual PostgreSQL password
4. Save and try again

---

### Problem 4: "ERROR: database "elibrary" does not exist"

**Cause:** Database wasn't created

**Fix:**
1. Type: `psql -U postgres`
2. Type: `CREATE DATABASE elibrary;`
3. Type: `\q`
4. Try: `npm run db:push` again

---

### Problem 5: "port 5000 is already in use"

**Cause:** Another app is using port 5000

**Fix:**
Change the port:
```
PORT=3000 npm run dev
```
Then open: `http://localhost:3000`

---

### Problem 6: "Cannot login"

**Cause:** Database tables weren't created

**Fix:**
1. In Terminal, type: `npm run db:push`
2. Wait for it to finish
3. Try again

---

## 📝 QUICK COMMANDS TO REMEMBER

```bash
# Go to project folder
cd path/to/elibrary-portal

# Install dependencies
npm install

# Create database
psql -U postgres
CREATE DATABASE elibrary;
\q

# Edit .env file
# (Use text editor)

# Initialize database
npm run db:push

# Start application
npm run dev

# Open in browser
http://localhost:5000
```

---

## 🛑 STOP THE APPLICATION

To stop the application running, press:
```
Ctrl + C
```

Or close the Terminal window.

---

## 🎮 WHAT TO DO NEXT

After login, you can:

**As Citizen:**
1. Browse books
2. Search books
3. Read a book
4. Rate a book
5. Add to wishlist
6. Check profile

**As Admin:**
1. Add new books
2. View analytics
3. Manage users
4. Post announcements
5. Generate reports

---

## 📞 NEED MORE HELP?

- For deployment: See **DEPLOYMENT.md**
- For overview: See **README.md**
- Still stuck? Check the Troubleshooting section above again

---

## ⏱️ HOW LONG DOES THIS TAKE?

- Node.js installation: 5 minutes
- PostgreSQL installation: 10 minutes
- Running project: 5-10 minutes

**Total: About 30 minutes first time**

Next time: 1 minute (just type `npm run dev`)

---

## 🎓 YOU'RE DOING GREAT!

Following these steps exactly will 100% work!

If you get stuck, read the Troubleshooting section and you'll find the answer.

**Let's go! Open http://localhost:5000** 🚀

---

**Happy coding!** 📚
