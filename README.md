# StudySOS — Smart Student Study-Management Platform
*Built for the Education Category · Hackathon 2026*

---

## 🎯 Problem & Solution

### The Problem
Modern students face multiple concurrent deadlines across STEM, humanities, and languages. They struggle with:
1. **Prioritization Paralysis**: Not knowing whether to tackle a 2-hour lab due tomorrow or a quick problem set due tonight.
2. **Missed Deadlines**: Retroactively discovering homework due at 11:59 PM.
3. **Study Burnout & Cognitive Fatigue**: Cramming for hours without structured rest intervals.
4. **Tool Friction**: Heavy project management platforms requiring account signups, credit cards, or cloud synchronizations that sell student data.

### The Solution: StudySOS
**StudySOS** is a private, lightweight study management platform running 100% in the browser. It combines:
- **Deterministic Priority Scoring**: A mathematical urgency algorithm that removes subjective bias.
- **Interval Capacity Planner**: Automatically schedules coursework into bite-sized study blocks with restorative breaks.
- **Academic Progress Radar**: Visualizes completion velocities, 7-day deadlines, and on-time delivery rates.
- **Zero-Account Privacy**: All data resides in browser `localStorage`, with full JSON backup export and import capabilities.

---

## ⚡ Tech Stack & Architecture Decisions

| Technology | Purpose & Rationale |
| :--- | :--- |
| **React 19 + TypeScript** | Type-safe component architecture with isolated state management and compile-time correctness guarantees. |
| **Vite 8** | Near-instant development startup and optimized static production bundle. |
| **Tailwind CSS v4** | Consistent 8-point spatial rhythm, accessible contrast ratios, and dark/light mode themes. |
| **Lucide React** | Clean, accessible iconography pairing visual cues with textual labels. |
| **React Router (HashRouter)** | Deep routing without server redirect dependencies, enabling flawless zero-config static deployments. |
| **Vitest & React Testing Library** | Deterministic unit tests for mathematical scoring algorithms, time-slot scheduling, and component state. |
| **Native SVG / CSS Charts** | Zero-dependency data visualizations (Progress rings, velocity bar charts) with screen-reader text alternatives. |

---

## 🧮 Deterministic Priority Formula

Each incomplete task is assigned an algorithmic score between **10 and 95 points**:

$$\text{Priority Score} = \text{Importance} + \text{Urgency} + \text{Effort Bonus}$$

1. **Importance Points**:
   - `high` = 30 pts (major exams, large capstone reports)
   - `medium` = 20 pts (regular problem sets, weekly assignments)
   - `low` = 10 pts (optional reading, formative checks)
2. **Urgency Points** (computed against current local time):
   - Overdue: `+60 pts`
   - Due within 24 hours: `+45 pts`
   - Due within 3 days (72h): `+30 pts`
   - Due within 7 days (168h): `+15 pts`
   - Due later: `+0 pts`
3. **Effort Bonus**:
   - `+5 pts` if estimated duration $\ge$ 120 minutes (ensures heavy multi-hour projects start early).
4. **Tie-Breaker Hierarchy**:
   1. Higher total priority score
   2. Earliest due date and time
   3. Alphabetical order by assignment title
5. **Score Buckets**:
   - **Urgent**: $\ge 70$ pts
   - **High**: $50 - 69$ pts
   - **Medium**: $30 - 49$ pts
   - **Low**: $< 30$ pts
   - **Completed**: Excluded from urgency queues ($0$ pts).

---

## 📅 Study Planner & Interval Engine

The planner converts pending homework into structured daily study sessions:
- **Session Slicing**: Tasks are broken into chunks matching `sessionMinutes` (default 45 min).
- **Restoration Cycles**: Short breaks (10 min) are inserted between blocks; a longer recharge break (20 min) is scheduled every 4 sessions.
- **Capacity Caps**: Work starts at `dailyStudyStart` (e.g. 16:00) and halts once `dailyCapacityMinutes` (default 180 min) is exhausted. Remaining work automatically rolls over to the next day.
- **At-Risk Warning Radar**: Highlights any block that cannot be completed before its due timestamp.
- **Session Checkmarks**: Allows students to check off completed study blocks during study sessions without prematurely marking entire assignments complete.

---

## ✅ Verified Features Checklist

All listed features have been implemented and tested:
- [x] **Dashboard**: Summary metrics, completion progress ring, top 5 "Up Next" urgency queue, and today's schedule summary.
- [x] **Homework Manager**: Add, edit, delete with confirmation and 5-second undo toast buffer.
- [x] **Past Due-Date Confirmation**: Warns if a selected date is in the past, allowing deliberate retroactive task entry.
- [x] **Search & Debounce**: 200ms debounced search matching title, subject, and notes.
- [x] **Filters & Sort**: Status (all/pending/completed/overdue), priority, subject, and sorting (priority, due date, title, duration, creation). URL query string synchronization.
- [x] **Study Planner**: Daily and 7-day Weekly view, automated session and break generation, at-risk flags, session toggle.
- [x] **Academic Progress**: On-time rate, average task duration, 7-day completion velocity bar chart, subject progress breakdown, upcoming 7-day deadlines radar.
- [x] **Data Persistence**: Versioned localStorage schema (`studysos:v1`) with quota detection, corruption repair, and save timestamp indicators.
- [x] **Backup & Restore**: Export JSON file (`studysos-backup-YYYY-MM-DD.json`), file preview modal, Replace or Merge (newer `updatedAt` wins).
- [x] **Sample Data Generator**: Loads 7 realistic coursework tasks across subjects.
- [x] **Keyboard Navigation**: Global hotkeys (`/`, `n`, `?`, `g d`, `g a`, `g p`, `g r`, `g s`) safe from form inputs.
- [x] **Accessibility**: WCAG AA contrast, focus traps, Escape key dialog handling, skip-to-content link, `aria-live` toasts, accessible table fallbacks for charts.
- [x] **Responsive Design**: Mobile-friendly bottom navigation and full-screen sheets; desktop sidebar; tablet responsive grid.

---

## 💾 Data Persistence & Browser Limitations

StudySOS is designed for privacy:
- **Per-Device & Per-Browser**: Coursework stored in Chrome will not synchronize automatically with Firefox, Safari, or a mobile phone.
- **~5 MB Storage Limit**: Standard browser storage quota. StudySOS includes automated quota-exhaustion warnings.
- **Cache Clearing**: Clearing browser website data will erase local records.
- **Backup Advice**: Use the built-in **Export Backup** tool in Settings once a week to safeguard your academic records.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `?` | Open Keyboard Shortcuts Help Dialog |
| `/` | Focus Assignment Search Field |
| `n` | Open New Assignment Modal |
| `g d` | Go to Dashboard |
| `g a` | Go to Homework Manager |
| `g p` | Go to Study Planner |
| `g r` | Go to Academic Progress |
| `g s` | Go to Settings |
| `Esc` | Close any open modal or dialog |

*Note: All shortcuts are automatically disabled while typing in text inputs or textareas.*

---

## 🎬 60-Second Demo Script for Judges

To evaluate StudySOS:
1. **Load Sample Data**:
   - Open Settings (or click "Load Sample Data" on the empty state banner).
   - Notice 7 realistic assignments populated across Math, Science, History, Computer Science, and Languages.
2. **Examine Deterministic Urgency**:
   - Navigate to the **Dashboard** or **Assignments**.
   - Notice the AP Calculus and Organic Chemistry assignments ranked as **Urgent** and **High** due to close deadlines and effort requirements.
   - Click the question mark icon on any priority badge to view the mathematical point breakdown.
3. **Test Study Planner**:
   - Navigate to **Study Planner**.
   - Review how tasks are split into 45-minute blocks with 10-minute short breaks and long recharge breaks.
   - Switch between **Daily View** and **7-Day Weekly View**.
   - Check off a study block to mark a session completed.
4. **Test Safe Delete & 5-Second Undo**:
   - In Assignments, click the trash can icon on any task. Confirm deletion in the modal.
   - Click the **Undo** button in the floating toast notification at the bottom right. The task is restored instantly from memory.
5. **Test Backup & Restore**:
   - Go to **Settings** $\rightarrow$ Click **Download JSON File**.
   - Click **Danger Zone: Clear All Data** and confirm both prompts. The workspace clears.
   - Click **Choose Backup File**, select the downloaded JSON file. Review the preview and click **Replace Workspace**. All assignments and settings are restored.

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Test Suite
```bash
npm test
```
Runs Vitest unit and component tests across priority scoring boundaries, scheduling rules, validation, storage repair, and backup merge.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in the `dist/` directory.

---

## 🌐 Deployment Instructions

### Option A: AI Studio Deploy
Click the **Share** or **Deploy** button in the AI Studio Build interface. AI Studio provides an instant HTTPS preview URL.

### Option B: Netlify Drop (Drag & Drop)
1. Run `npm run build` to generate the `dist` folder.
2. Visit [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist` folder into the browser window for an immediate production deployment. Because StudySOS uses `HashRouter`, deep links (e.g. `#/planner`) work with no extra redirects needed.

### Option C: Vercel or GitHub Pages
- **Vercel**: Connect your GitHub repository, choose the `Vite` preset, and deploy.
- **GitHub Pages**: Configure GitHub Actions or deploy the `dist` directory to your `gh-pages` branch.

---

## 🔍 Known Limitations & Future Improvements

### Known Limitations
- **No Cloud Synchronization**: Multi-device sync requires manual JSON export/import.
- **Audio Notifications**: Browser background audio alarms are restricted without explicit user media permissions.
- **File Upload Attachments**: Assignment notes support rich text descriptions but not direct PDF or DOCX file attachments.

### Future Improvements
1. **Google Calendar Sync**: Export `.ics` or direct Google Calendar API integration.
2. **PWA Offline Push Notifications**: System-level reminders 1 hour before scheduled study blocks.
3. **Peer Study Group Sharing**: Exporting an encrypted study block schedule for study partners.
