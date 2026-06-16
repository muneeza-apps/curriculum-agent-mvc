# 🎓 Curriculum Builder Agent
### Complete Setup Guide — Absolute Beginner Friendly

---

## 📁 What Is This Project?

An AI agent that generates a full 5-day teaching curriculum from a single input.
Built with React (frontend) + Node.js/Express (backend) using MVC architecture.

---

## 🗂️ Project Structure

```
curriculum-agent/
│
├── backend/                        ← Node.js REST API (MVC)
│   ├── config/
│   │   └── app.js                  ← All environment config in one place
│   ├── controllers/
│   │   ├── CurriculumController.js ← Handles HTTP requests for curriculum
│   │   └── HealthController.js     ← Handles /api/health
│   ├── middleware/
│   │   ├── validate.js             ← Validates request body before controller
│   │   └── errorHandler.js        ← Global error handler
│   ├── models/
│   │   ├── Curriculum.js           ← Data shape + validation rules
│   │   └── History.js              ← History entry shape
│   ├── routes/
│   │   ├── index.js                ← Mounts all route groups under /api
│   │   ├── curriculum.js           ← POST/GET/DELETE /api/curricula
│   │   └── health.js               ← GET /api/health
│   ├── services/
│   │   ├── FoundryIQ.js            ← Microsoft Foundry IQ integration
│   │   └── HistoryStore.js         ← File-based curriculum storage
│   ├── agent/
│   │   └── curriculumAgent.js      ← 5-step AI reasoning pipeline
│   ├── utils/
│   │   ├── response.js             ← Consistent API response helpers
│   │   └── retry.js                ← Retry with exponential backoff
│   ├── data/                       ← Auto-created: history.json lives here
│   ├── server.js                   ← Express app entry point
│   ├── package.json
│   └── .env.example                ← Copy this to .env and fill in keys
│
├── frontend/                       ← React app
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppShell.js     ← Page transition wrapper
│       │   ├── pages/
│       │   │   ├── InputForm.js    ← Teacher input form
│       │   │   ├── AgentProgress.js← Live reasoning steps UI
│       │   │   ├── CurriculumDashboard.js ← Full week view
│       │   │   └── PrintView.js    ← Print/PDF preview
│       │   └── ui/
│       │       ├── HistoryPanel.js ← Saved curricula slide-over
│       │       └── Skeleton.js     ← Loading skeleton screens
│       ├── hooks/
│       │   └── useCurriculum.js    ← All app state + API calls
│       ├── services/
│       │   └── api.js              ← All fetch() calls in one place
│       ├── utils/
│       │   └── pdfExport.js        ← PDF generation
│       ├── styles/
│       │   └── global.css          ← All styles
│       ├── App.js                  ← Root component
│       └── index.js                ← React entry point
│
├── package.json                    ← Root convenience scripts
├── .gitignore
├── railway.json                    ← Deploy config
└── nixpacks.toml                   ← Railway build config
```

---

## ✅ REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/curricula` | Generate curriculum (SSE stream) |
| `GET` | `/api/curricula/sample` | Get static sample (no API key needed) |
| `GET` | `/api/curricula/history` | List all saved curricula |
| `GET` | `/api/curricula/history/:id` | Get one saved curriculum |
| `DELETE` | `/api/curricula/history/:id` | Delete a saved curriculum |
| `GET` | `/api/health` | Server health + config status |

### POST /api/curricula — Request Body
```json
{
  "topic": "Introduction to Python",
  "ageGroup": "Grade 9-10 (14-16 years)",
  "difficulty": "Beginner",
  "specialNeeds": "None",
  "subject": "Computer Science"
}
```

### Allowed Values
- **ageGroup**: `Grade 1-2 (6-8 years)` | `Grade 3-4 (8-10 years)` | `Grade 5-6 (10-12 years)` | `Grade 7-8 (12-14 years)` | `Grade 9-10 (14-16 years)` | `Grade 11-12 (16-18 years)` | `University / Adult`
- **difficulty**: `Beginner` | `Intermediate` | `Advanced`
- **specialNeeds**: `None` | `Dyslexia` | `ADHD` | `English Language Learners (ELL)` | `Visual Impairment` | `Hearing Impairment` | `Multiple Learning Differences`

---

## 🚀 HOW TO RUN — Step by Step

---

### STEP 1 — Install Node.js

Node.js is the JavaScript runtime that runs the backend.

1. Go to **https://nodejs.org**
2. Download the **LTS version** (the green button)
3. Run the installer — click Next → Next → Install
4. When done, open a terminal and verify:

```bash
node --version
# should print something like: v18.19.0

npm --version
# should print something like: 10.2.0
```

> **Windows users**: search for "Command Prompt" or "PowerShell" in Start Menu
> **Mac users**: open Terminal from Applications → Utilities

---

### STEP 2 — Download the Project

**Option A — If you have Git installed:**
```bash
git clone https://github.com/YOUR_USERNAME/curriculum-agent.git
cd curriculum-agent
```

**Option B — Without Git:**
1. Download the ZIP file
2. Extract it anywhere (e.g. Desktop)
3. Open a terminal and navigate to it:
```bash
# Windows example:
cd C:\Users\YourName\Desktop\curriculum-agent

# Mac/Linux example:
cd ~/Desktop/curriculum-agent
```

---

### STEP 3 — Install Dependencies

This downloads all the libraries the project needs.

```bash
# Install backend dependencies
cd backend
npm install

# Go back and install frontend dependencies
cd ..
cd frontend
npm install
```

You should see lots of text scrolling — that's normal. It ends with something like "added 200 packages".

> ⚠️ If you see errors about permissions on Mac/Linux, prefix commands with `sudo`

---

### STEP 4 — Set Up Environment Variables

Environment variables are secret settings (like API keys) that live in a `.env` file.

```bash
# Make sure you're in the backend folder
cd backend

# Copy the example file
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env
```

Now open the `.env` file in any text editor (Notepad, VS Code, etc.) and fill in your values:

```env
PORT=5000
NODE_ENV=development

AZURE_OPENAI_API_KEY=paste_your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

FOUNDRY_PROJECT_CONNECTION_STRING=your_foundry_connection_string_here
```

> 💡 **No API keys yet?** That's fine! Skip this step.
> The app works without keys — it loads sample data automatically.
> You can test the entire UI before buying any API access.

---

### STEP 5 — Run the Backend

Open a terminal window, navigate to the `backend` folder and run:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Curriculum Agent API
   http://localhost:5000
   ENV        : development
   Azure AI   : ⚠️  not configured (sample mode)
   Foundry IQ : ⚠️  static fallback

   Endpoints:
   POST   /api/curricula
   GET    /api/curricula/sample
   GET    /api/curricula/history
   GET    /api/curricula/history/:id
   DELETE /api/curricula/history/:id
   GET    /api/health
```

✅ Backend is running. **Leave this terminal open.**

---

### STEP 6 — Run the Frontend

Open a **second terminal window**, navigate to the `frontend` folder and run:

```bash
cd frontend
npm start
```

You should see:
```
Compiled successfully!

You can now view curriculum-agent-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser should open automatically at **http://localhost:3000**

✅ Frontend is running.

---

### STEP 7 — Test It

1. Open http://localhost:3000 in your browser
2. Type any topic (e.g. "Photosynthesis")
3. Select a grade level
4. Click "Generate Week Curriculum"
5. If no API keys → it loads sample data automatically

---

## 🔑 Getting Azure OpenAI API Keys (Optional)

To use real AI generation:

1. Go to **https://portal.azure.com**
2. Search for "Azure OpenAI" → Create a resource
3. Once created, go to **Keys and Endpoint** section
4. Copy **Key 1** → paste as `AZURE_OPENAI_API_KEY`
5. Copy **Endpoint** → paste as `AZURE_OPENAI_ENDPOINT`
6. Go to **Model Deployments** → Deploy `gpt-4o`
7. Copy the deployment name → paste as `AZURE_OPENAI_DEPLOYMENT`

---

## 🧪 Test the API Manually (Optional)

You can test the REST API directly using a browser or tool like Postman/curl.

**Check server health:**
```bash
curl http://localhost:5000/api/health
```

**Get sample curriculum:**
```bash
curl http://localhost:5000/api/curricula/sample
```

**List history:**
```bash
curl http://localhost:5000/api/curricula/history
```

**Generate curriculum (needs API key):**
```bash
curl -X POST http://localhost:5000/api/curricula \
  -H "Content-Type: application/json" \
  -d '{"topic":"Python","ageGroup":"Grade 9-10 (14-16 years)","difficulty":"Beginner","specialNeeds":"None"}'
```

---

## 🚢 Deploy to Railway (Free Hosting)

1. **Create account** at https://railway.app (free tier available)
2. **Install CLI:**
```bash
npm install -g @railway/cli
```
3. **Login:**
```bash
railway login
```
4. **Initialize project:**
```bash
railway init
```
5. **Set your environment variables:**
```bash
railway variables set AZURE_OPENAI_API_KEY=your_key
railway variables set AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
railway variables set AZURE_OPENAI_DEPLOYMENT=gpt-4o
railway variables set NODE_ENV=production
```
6. **Deploy:**
```bash
railway up
```

Railway uses `nixpacks.toml` to automatically:
- Install all dependencies
- Build the React frontend
- Copy it into `backend/public/`
- Start the Express server

---

## ❓ Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| `npm: command not found` | Install Node.js from nodejs.org first |
| `Error: EADDRINUSE :::5000` | Another app is using port 5000. Change `PORT=5001` in `.env` |
| `Cannot GET /` in browser | Make sure frontend is running on port 3000, not 5000 |
| Page loads but no data | Backend isn't running — check the backend terminal for errors |
| `Module not found` errors | Run `npm install` again inside that folder |
| API key errors | Double-check your `.env` file has no spaces around `=` |
| CORS errors | Make sure both servers are running (3000 and 5000) |

---

## 📞 API Error Responses

All errors return:
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

All success responses return:
```json
{
  "success": true,
  "...data"
}
```

---

Built for **Agents League Hackathon 2026** · Microsoft Foundry IQ · By Fakhar
