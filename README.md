                     CURRICULUM AGENT (MVC)
                     Project Documentation
======================================================================

1. OVERVIEW
-----------
An advanced, AI-powered Full-Stack Curriculum Generation platform designed 
using a decoupled Model-View-Controller (MVC) architecture. The application 
leverages intelligent agents to seamlessly architect, draft, and track 
structural educational material.

2. CORE FEATURES
----------------
* AI Curriculum Agent: Autonomous generation logic to construct deep 
  educational frameworks.
* Dynamic Dashboard: Real-time progress monitoring, custom input forms, 
  and interactive historical state management.
* MVC Architecture: Clean separation of concerns with a modular 
  Node.js/Express backend and a modern React frontend.
* Export & Print Capabilities: Dedicated components for professional 
  print previews and direct PDF downloads.
* Production Ready: Pre-configured with Railway deployment rules and 
  cloud runtime optimizations (nixpacks).

3. PROJECT ARCHITECTURE
-----------------------
curriculum-mvc/
├── frontend/                  # React Single Page Application (SPA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # App shell and framing structure
│   │   │   ├── pages/         # Dashboard, Input Form, Agent Progress
│   │   │   └── ui/            # Reusable UI elements
│   │   ├── hooks/             # Custom state & logic management
│   │   ├── services/          # Frontend API wrappers
│   │   └── utils/             # Core layout helpers (pdfExport)
│
├── backend/                   # Node.js & Express REST API (MVC Pattern)
│   ├── agent/                 # curriculumAgent logic
│   ├── config/                # Environment and app definitions
│   ├── controllers/           # API request routers and route handlers
│   ├── middleware/            # Validation & global error handlers
│   ├── models/                # Curriculum & History schemas
│   ├── routes/                # Strictly mapped semantic API endpoints
│   ├── services/              # Integrations (FoundryIQ, HistoryStore)
│   └── utils/                 # Extensible retry mechanisms

4. LOCAL DEVELOPMENT SETUP
--------------------------
Step 1: Prerequisites
Ensure you have Node.js and npm installed on your operating system.

Step 2: Backend Installation
1. Navigate to the backend directory: cd backend
2. Install dependencies: npm install
3. Set up environment configurations: cp .env.example .env
4. Run the server: npm start

Step 3: Frontend Installation
1. Open a new terminal instance and navigate to frontend: cd frontend
2. Install frontend dependencies: npm install
3. Boot up the local web client: npm start

5. DEPLOYMENT
-------------
This repository includes custom configuration manifests (railway.json, 
nixpacks.toml) optimized for seamless deployments out-of-the-box on 
platforms like Railway.
======================================================================
'@ | Out-File -FilePath .\temp_doc.txt -Encoding utf8

# 2. Ye command bina pooche chup-chap iski PDF bana degi
Start-Process -FilePath "notepad.exe" -ArgumentList "/p .\temp_doc.txt" -NoNewWindow -Wait

# 3. Purani temporary file delete ho jayegi
Remove-Item -Path .\temp_doc.txt -Force
