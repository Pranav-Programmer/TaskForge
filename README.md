<div align="center">

<img src="public/favicon.svg" alt="TaskForge Logo" width="100" height="100" />

# ⚡ TaskForge

### Personal Work Command Center

A modern, self-contained productivity dashboard for managing tasks, notes, projects, decisions, and reusable prompts — all from a single interface.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue?style=for-the-badge)

<br />

[**Live Demo**](https://pranav-programmer.github.io/TaskForge/) · [**Report Bug**](https://github.com/Pranav-Programmer/TaskForge/issues) · [**Request Feature**](https://github.com/Pranav-Programmer/TaskForge/issues)

</div>

---

## Table of Contents

- [About](#about)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)

---

## About

**TaskForge** is a client-side productivity application built for developers and teams who want a single pane of glass for their workflow. Unlike cloud-based tools, TaskForge stores everything in your browser's `localStorage` — zero server dependencies, zero latency, zero subscription fees.

The app is designed around five core modules that cover the full spectrum of knowledge work: task management, note-taking, project tracking, decision logging, and prompt vault management.

**Why TaskForge?**

- **No backend required** — Data lives in `localStorage`. Open and go.
- **Dark mode native** — Full dark theme with system preference detection.
- **Fully typed** — Written in TypeScript with strict mode enabled.
- **Instant load** — Vite dev server starts in milliseconds; production build is < 300KB gzipped.
- **Accessible** — ARIA labels, keyboard navigation, focus management, screen reader support.

---

## Screenshots

<div align="center">

| Dashboard | Task Manager | Notes |
|:---------:|:------------:|:-----:|
| ![Dashboard](https://img.shields.io/badge/Dashboard-View-blue?style=for-the-badge) | ![Tasks](https://img.shields.io/badge/Task_Manager-View-green?style=for-the-badge) | ![Notes](https://img.shields.io/badge/Notes-View-purple?style=for-the-badge) |

</div>

> Run `npm run dev` locally to see the full UI with dark mode, responsive layout, and animations.

---

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | At-a-glance overview with stats, recent activity, and quick actions across all modules. |
| **Task Manager** | Create, filter, and track tasks with status (To Do / In Progress / Done), priority levels (Low → Urgent), due dates, tags, and project association. |
| **Notes** | Rich-text notes with categories, pinning, and project linking. Supports Markdown-style content. |
| **Projects** | Project tracker with status lifecycle (Planning → Active → On Hold → Completed → Archived) and color coding. |
| **Decision Log** | Record technical decisions with context, alternatives considered, rationale, and outcome status. |
| **Prompt Vault** | Reusable prompt templates with `{{variable}}` placeholders, usage tracking, and one-click copy with variable filling. |

### Technical Features

- **Responsive Design** — Mobile-first layout with collapsible sidebar, adaptive grid columns, and touch-friendly interactions.
- **Dark Mode** — System preference detection + manual toggle. Persists across sessions.
- **Local Storage Persistence** — All data auto-saves to `localStorage`. No data loss on refresh.
- **Client-Side Routing** — View-based navigation without URL changes (SPA behavior).
- **Animations** — Fade-in, slide-up, scale-in transitions on all interactive elements.
- **Toast Notifications** — Non-intrusive success/error/info toasts with auto-dismiss.
- **Modal System** — Accessible modals with focus trapping, Escape key handling, and backdrop click dismissal.
- **Filtering & Search** — Full-text search across all modules. Category/status-based filter tabs.
- **Keyboard Accessible** — All interactive elements are keyboard-navigable with visible focus indicators.

---

## Tech Stack

```
├── Frontend
│   ├── React 19         — UI library with hooks
│   ├── TypeScript 6     — Type-safe JavaScript
│   ├── Tailwind CSS 4   — Utility-first styling (via @tailwindcss/vite plugin)
│   └── Vite 8           — Build tool & dev server (with Rolldown bundler)
│
├── Tooling
│   ├── ESLint            — Code linting
│   ├── Prettier          — Code formatting
│   └── GitHub Actions    — CI/CD for GitHub Pages deployment
│
└── Data
    └── localStorage      — Client-side persistence (no backend)
```

### Why These Choices

| Choice | Rationale |
|--------|-----------|
| **React 19** | Latest stable release with improved rendering and hooks. |
| **Tailwind CSS 4** | New Rust-based engine via Vite plugin. Zero-config, fastest build times. |
| **Vite 8** | Uses Rolldown (Rust bundler) for 10x faster builds vs Webpack. |
| **TypeScript 6** | Strict mode catches bugs at compile time. `verbatimModuleSyntax` ensures clean imports. |
| **No Router** | Single-page with view switching is simpler for a dashboard app. No URL complexity needed. |
| **No State Library** | `useState` + `useLocalStorage` hook is sufficient. Avoids Redux/Zustand overhead. |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     App.tsx                         │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │          │  │                                  │ │
│  │ Sidebar  │  │         Main Content             │ │
│  │          │  │  ┌────────────────────────────┐  │ │
│  │ Dashboard│  │  │  Dashboard / TaskManager / │  │ │
│  │ Tasks    │  │  │  Notes / Projects /        │  │ │
│  │ Notes    │  │  │  DecisionLog / PromptVault │  │ │
│  │ Projects │  │  └────────────────────────────┘  │ │
│  │ Decisions│  │                                  │ │
│  │ Prompts  │  │                                  │ │
│  │          │  └──────────────────────────────────┘ │
│  └──────────┘                                       │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              ToastContainer                    │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component Handler → useLocalStorage Hook → localStorage → Re-render
                                         ↓
                                   JSON.stringify → localStorage.setItem
```

- **No API calls** — Everything is synchronous local storage operations.
- **Optimistic updates** — State updates immediately; localStorage writes happen in the same render cycle.
- **ID generation** — `Date.now().toString(36) + random` for collision-free unique IDs.

---

## Getting Started

### Prerequisites

- **Node.js** — v18 or higher (v20+ recommended)
- **npm** — v9 or higher (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Pranav-Programmer/TaskForge.git
cd TaskForge

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/TaskForge/`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR (Hot Module Replacement) |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |

### Build Output

```
dist/
├── index.html                    (1.03 KB)
├── assets/
│   ├── index-De-qZcN0.css       (46.95 KB → 8.61 KB gzipped)
│   └── index-HeXaSQVY.js       (293.71 KB → 79.74 KB gzipped)
├── favicon.svg
└── icons.svg
```

### Deploy to GitHub Pages

```bash
# Build the project
npm run build

# The dist/ folder is ready to deploy
# Push to GitHub and enable GitHub Actions in repo Settings → Pages
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles automatic deployment on every push to `main`.

---

## Project Structure

```
TaskForge/
├── public/
│   ├── favicon.svg              # App icon (lightning bolt)
│   └── icons.svg                # SVG sprite sheet
│
├── src/
│   ├── main.tsx                 # Entry point — renders <App />
│   ├── App.tsx                  # Root component — routing, state, layout
│   ├── index.css                # Tailwind imports, custom theme, animations
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces & type aliases
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.ts   # Persistent state hook (localStorage wrapper)
│   │   └── useDarkMode.ts       # Dark mode hook (class toggle + persistence)
│   │
│   ├── data/
│   │   └── seed.ts              # Sample data for first-time users
│   │
│   └── components/
│       ├── Sidebar.tsx           # Navigation sidebar (desktop + mobile)
│       ├── Dashboard.tsx         # Overview dashboard with stats
│       ├── TaskManager.tsx       # Task CRUD with filters
│       ├── Notes.tsx             # Notes CRUD with categories
│       ├── Projects.tsx          # Project management
│       ├── DecisionLog.tsx       # Decision recording
│       ├── PromptVault.tsx       # Prompt template manager
│       ├── Modal.tsx             # Accessible modal dialog
│       ├── Toast.tsx             # Toast notification system
│       ├── Badge.tsx             # Status/label badge component
│       └── SharedUI.tsx          # Shared components (EmptyState, SearchInput, FilterTabs, etc.)
│
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration (with base path for GH Pages)
├── .gitignore
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Actions CI/CD workflow
```

---

## Data Model

All data is typed in `src/types/index.ts`:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  tags: string[];
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  chosenOption: string;
  rationale: string;
  status: 'pending' | 'accepted' | 'rejected' | 'superseded';
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  variables: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### localStorage Keys

| Key | Data |
|-----|------|
| `tf_tasks` | Array of Task objects |
| `tf_notes` | Array of Note objects |
| `tf_projects` | Array of Project objects |
| `tf_decisions` | Array of Decision objects |
| `tf_prompts` | Array of Prompt objects |
| `tf_dark` | Boolean — dark mode preference |

---

## Configuration

### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig({
  base: '/TaskForge/',  // Base path for GitHub Pages deployment
  plugins: [react(), tailwindcss()],
})
```

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "es2023",
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "noEmit": true
  }
}
```

### Custom Theme (`src/index.css`)

The app defines a custom color palette and typography:

```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --color-primary-500: #3b82f6;   /* Blue-500 */
  --color-primary-600: #2563eb;   /* Blue-600 */

  --color-sidebar-bg: #0f172a;    /* Slate-900 */
  --color-sidebar-hover: #1e293b; /* Slate-800 */
}
```

---

## Contributing

Contributions are welcome! Here's how to get started:

### 1. Fork the Repository

```bash
# Click the "Fork" button on GitHub, then:
git clone https://github.com/YOUR_USERNAME/TaskForge.git
cd TaskForge
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-description
```

### 3. Make Changes

Follow the existing code style:

- **Components** go in `src/components/`
- **Hooks** go in `src/hooks/`
- **Types** go in `src/types/index.ts`
- Use **Tailwind classes** for styling (no CSS modules)
- Use **functional components** with hooks (no class components)
- Keep components **small and focused** — one component per file

### 4. Test Locally

```bash
npm run dev       # Start dev server
npm run build     # Verify production build passes
```

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add your descriptive commit message"
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

Go to the original repo and click **"New Pull Request"**. Describe what you changed and why.

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Code style (formatting, no logic change) |
| `refactor:` | Code restructuring (no feature/fix) |
| `test:` | Adding/updating tests |
| `chore:` | Build, config, dependency updates |

### Code Guidelines

- **No comments** — Code should be self-documenting through naming.
- **Use TypeScript** — Avoid `any` types. Use proper interfaces.
- **Dark mode** — Always include `dark:` variants for colors.
- **Accessibility** — Add `aria-label`, `role`, and `tabIndex` where needed.
- **Responsive** — Use `sm:`, `md:`, `lg:` breakpoints. Mobile-first approach.

---

## FAQ

**Q: Where is my data stored?**
A: All data is stored in your browser's `localStorage`. No data is sent to any server. Clearing browser data will remove all TaskForge data.

**Q: Is there a data export/import feature?**
A: Not yet, but it's on the roadmap. You can manually export `localStorage` via browser DevTools.

**Q: Can I use this on mobile?**
A: Yes. The UI is fully responsive with a collapsible sidebar, touch-friendly buttons, and adaptive grid layouts.

**Q: Why localStorage instead of IndexedDB?**
A: For the MVP, localStorage's 5MB limit is sufficient and the synchronous API is simpler. IndexedDB or cloud sync can be added later.

**Q: Can I deploy this to my own server?**
A: Yes. Run `npm run build` and serve the `dist/` folder with any static file server (Nginx, Apache, Vercel, Netlify, etc.).

**Q: Does it work offline?**
A: Yes. Once loaded, the app runs entirely from cache. No network requests are made after initial load.

---

## Roadmap

- [ ] Drag-and-drop task reordering
- [ ] Data export/import (JSON)
- [ ] Markdown preview in notes
- [ ] Keyboard shortcuts (Ctrl+K command palette)
- [ ] Cloud sync (Supabase/Firebase)
- [ ] Multi-language support
- [ ] Mobile PWA with offline support

---

<div align="center">

**Built with ⚡ by [Pranav](https://github.com/Pranav-Programmer)**

If this project helped you, consider giving it a ⭐ on GitHub!

</div>
