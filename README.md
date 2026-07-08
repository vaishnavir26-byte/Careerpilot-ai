# CareerPilot AI – Resume & Interview Copilot

CareerPilot AI is an all-in-one placement preparation platform designed to help students and job seekers optimize resumes, score ATS compatibility, practice voice-enabled mock interviews, scan GitHub repositories, and build interactive career learning roadmaps.

## 🚀 Quick Start (Running Locally)

The application has been fully compiled, built, and launched locally:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI API Engine:** [http://127.0.0.1:8000](http://127.0.0.1:8000)

Open **[http://localhost:3000](http://localhost:3000)** in your browser and click **"Enter Guest Mode"** to instantly test the workspace features without manual configuration!

---

## 📁 Codebase Directory Structure

```
careerpilot-ai/
├── README.md                 # Project guide and instructions
├── backend/                  # FastAPI Application Core
│   ├── main.py               # Main API Router & Entrypoint
│   ├── requirements.txt      # Python dependencies list
│   ├── api/                  # Modular Router Controllers
│   │   ├── auth.py           # Register, login, guest sessions
│   │   ├── resume.py         # Analyzer & ATS alignment scorer
│   │   ├── interview.py      # Mock interviewer sessions Q&A
│   │   ├── coding.py         # Algorithm tests evaluator
│   │   ├── projects.py       # Repo documentation scanner
│   │   ├── career_coach.py   # AI Mentor chat assistant
│   │   ├── roadmap.py        # 30/60/90 days roadmap builders
│   │   └── portfolio.py      # Static site ZIP files exporter
│   ├── database/             # SQLite SQLAlchemy tables mappings
│   │   ├── connection.py
│   │   └── models.py
│   ├── resume_parser/        # Local PDF text extraction
│   │   └── parser.py
│   └── uploads/              # Local resume storage directory
└── frontend/                 # Next.js React Web Workspace
    ├── src/
    │   ├── app/              # Next.js pages & layouts routing
    │   ├── components/       # Custom glassmorphic React components
    │   └── utils/
    ├── tailwind.config.ts    # Styles configuration
    └── tsconfig.json         # TypeScript configuration
```

---

## ⚙️ Manual Server Startup Commands

If you ever need to stop and restart the servers manually in your console, run:

### 1. Start the Backend API Server
```powershell
# Navigate to backend folder
cd backend
# Run FastAPI server using the portable python binary path
& "C:\Users\Msc\.gemini\antigravity\scratch\runtimes\python-nuget\tools\python.exe" main.py
```

### 2. Start the Next.js Frontend Server
```powershell
# Navigate to frontend folder
cd frontend
# Configure temporary session PATH variables to find local Node binary
$nodeDir = "C:\Users\Msc\.gemini\antigravity\scratch\runtimes\node-v24.18.0-win-x64"
$env:Path = "$nodeDir;" + $env:Path
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
# Run production web server
npm run start
```

---

## 💎 Premium Implemented Features

1. **Dual AI Mode:** Boots in Simulated Mode (completely free and offline) out-of-the-box. Connect live Google Gemini, OpenAI, or Anthropic Claude API keys via the **Settings Panel** at any time.
2. **Audio Mock Interviews:** Interactive split-screen webcam workspace using browser-native Web Speech Synthesis (interviewer speaks) and Web Speech Recognition (voice transcribes directly onto screen).
3. **HTML Portfolio Exporter:** Input social handles, select templates, inspect real-time iframe previews, and export a downloadable index.html/style.css website zip file package.
4. **ATS Keywords Evaluator:** Match technical experience bullets against pasted Job Description paragraphs to calculate index alignment metrics.
