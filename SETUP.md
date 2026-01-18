# 🚀 Step-by-Step Setup Guide

## Prerequisites Check

First, verify you have Node.js installed:

```powershell
node --version
npm --version
```

If these don't work, install Node.js from [nodejs.org](https://nodejs.org/).

---

## Step 1: Open Project Folder

Open PowerShell or Command Prompt and navigate to your project:

```powershell
cd C:\Rap
```

Verify you're in the right folder (should see `server.js`, `package.json`, etc.):

```powershell
ls
```

---

## Step 2: Install Dependencies (First Time Only)

If you haven't installed dependencies yet:

```powershell
npm install
```

Wait for this to complete. It may take 1-2 minutes.

---

## Step 3: Setup Environment File

Check if `.env` exists:

```powershell
Test-Path .env
```

**If it returns `False`**, create it from the example:

```powershell
Copy-Item example.env .env
```

**Now edit `.env`** and add your API key:

```powershell
notepad .env
```

In Notepad, replace `your-openai-api-key-here` with your actual OpenAI or Groq API key:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
PORT=3000
```

Save and close Notepad (Ctrl+S, then Alt+F4).

---

## Step 4: Check Port 3000 Availability

Check if port 3000 is already in use:

```powershell
netstat -ano | findstr :3000
```

**If you see output** (port is in use):

1. Find the PID number in the rightmost column
2. Kill that process:
   ```powershell
   taskkill /PID <PID_NUMBER> /F
   ```
   (Replace `<PID_NUMBER>` with the actual number)

**If you see nothing** (port is free), continue to Step 5.

---

## Step 5: Choose How to Run

You have **TWO OPTIONS**:

### 🎯 **OPTION A: Run Both Together (EASIEST - Recommended)**

Use one terminal window to run both frontend and backend:

```powershell
npm run dev:all
```

This starts both servers. You'll see output from both.

**To stop:** Press `Ctrl+C` in the terminal.

---

### 📋 **OPTION B: Run Separately (Two Terminal Windows)**

If you prefer separate terminals:

#### **Terminal 1 - Backend (Keep this open)**

Open a new PowerShell window:

```powershell
cd C:\Rap
npm run dev:server
```

You should see:

```
============================================================
✅ Rap Lyrics Generator Server
============================================================
🚀 Server: http://localhost:3000
📡 API: http://localhost:3000/api/lyrics
...
```

**Leave this terminal open!** Don't close it.

#### **Terminal 2 - Frontend (Keep this open too)**

Open **another** new PowerShell window:

```powershell
cd C:\Rap
npm run dev:client
```

You should see:

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Leave this terminal open too!**

---

## Step 6: Open the Application

Open your web browser and go to:

```
http://localhost:5173
```

You should see the Rap Lyrics Generator interface.

---

## Step 7: Test the Application

1. Fill in the form:

   - **Theme:** e.g., "city nights"
   - **Mood:** e.g., "energetic"
   - **Length:** Select "Medium"

2. Click **"Generate Lyrics"**

3. Wait a few seconds...

4. Lyrics should appear! ✅

---

## Troubleshooting

### ❌ Error: "ECONNREFUSED"

**Problem:** Backend isn't running.

**Solution:**

- Make sure Terminal 1 (backend) is running and shows "Server running"
- Or use `npm run dev:all` instead

---

### ❌ Error: "Port 3000 is already in use"

**Problem:** Something else is using port 3000.

**Solution:**

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID <PID_NUMBER> /F

# Then restart backend
npm run dev:server
```

---

### ❌ Error: "API key missing"

**Problem:** `.env` file doesn't have a valid API key.

**Solution:**

```powershell
# Check if .env exists
Test-Path .env

# If not, create it
Copy-Item example.env .env

# Edit it
notepad .env
```

Make sure `OPENAI_API_KEY` or `GROQ_API_KEY` is set to a real key.

---

### ❌ Nothing happens when clicking "Generate Lyrics"

**Problem:** Backend server crashed or API key is invalid.

**Solution:**

1. Check Terminal 1 (backend) for error messages
2. Verify your API key is correct in `.env`
3. Restart the backend server

---

## Quick Reference Commands

```powershell
# Install dependencies (first time)
npm install

# Run both servers together (EASIEST)
npm run dev:all

# OR run separately:
npm run dev:server  # Backend only (Terminal 1)
npm run dev:client  # Frontend only (Terminal 2)

# Stop server
# Press Ctrl+C in the terminal

# Check if backend is running
curl http://localhost:3000/api/health
```

---

## Summary

**Easiest way to run:**

```powershell
cd C:\Rap
npm run dev:all
```

Then open `http://localhost:5173` in your browser.

Done! 🎉
