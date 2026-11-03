# InterviewAI — AI Tech Interview Preparation & Simulation Platform

An end-to-end, AI-powered mock interview simulator designed to guide software engineering candidates from **Freshers/Beginners** to **Industry-Ready Professionals**.

---

## 🌟 Key Features

### 1. 5-Stage Progressive Learning Path
- **Stage 1: ATS Resume Scanner & Friendliness Audit (`/interview/resume-check`)**
  - Drag-and-drop `.pdf`, `.docx`, or `.txt` resumes.
  - Section-by-section health check (Contact info, Skills, Projects, Experience, Education).
  - Quantifiable metrics score and action verbs impact analysis.
  - Generates **custom live interview questions directly from candidate projects** with instant voice/text practice and AI feedback.
- **Stage 2: HR & Behavioral Round (`/interview/new?stage=level_2_behavioral`)**
  - Conversational speech interview evaluating communication, introduction, and the STAR framework (Situation, Task, Action, Result).
- **Stage 3: Core Technical Screening (`/interview/new?stage=level_3_tech_screen`)**
  - Rapid-fire conceptual CS fundamentals tailored to your selected role (Frontend, Backend, Full-Stack, Mobile, DevOps, AI).
- **Stage 4: Live Monaco Code Editor (`/interview/[id]/coding`)**
  - In-browser VS Code experience (`@monaco-editor/react`).
  - Multi-language support: JavaScript, TypeScript, Python 3.
  - Test runner executing code against visible and hidden test cases with execution time and interviewer hints.
- **Stage 5: System Design & Architecture (`/interview/new?stage=level_5_system_design`)**
  - High-level distributed systems discussion covering caching, databases, sharding, and latency bottlenecks.

### 2. Dual-Layer Voice & Speech Engine
- **Layer 1:** Browser Web Speech Recognition with accumulated live transcript.
- **Layer 2:** `MediaRecorder` audio backup with dedicated `/api/interview/transcribe` endpoint for zero speech loss across any browser.
- **Live Vitals:** Speaking pace (WPM), speech duration, words spoken, and filler word counter (`"um"`, `"uh"`, `"like"`).

### 3. Detailed Performance Scorecard & Feedback (`/interview/[id]/report`)
- Overall score (0-100) with celebratory confetti.
- 5-category evaluation (Technical Accuracy, Communication Clarity, Confidence & Pacing, STAR Method, Problem Solving).
- Identified strengths and targeted areas for improvement.
- 3-step actionable study roadmap.
- Print / Export as PDF.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with modern UI aesthetics
- **AI Intelligence:** Google Gemini API (`@google/genai` — Gemini 2.5 Flash)
- **Code Editor:** `@monaco-editor/react` (Monaco Editor)
- **Database & Storage:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`, PostgreSQL schema)
- **PDF Extraction:** `pdf-parse`

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/awromal/Interview.git
cd Interview
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API Key and Supabase credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(Note: The platform includes smart local fallbacks so all features work out-of-the-box even before adding API keys!)*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT License. Free to use, modify, and distribute.
