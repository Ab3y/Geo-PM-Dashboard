# ⚡ AbeOps

> A role-based project management dashboard combining Kanban boards, Scrum ceremonies, and PMP process tracking — built with React, TypeScript, and Tailwind CSS.

![Kanban Board](docs/screenshots/01-kanban-board.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Persona System](#persona-system)
- [PMP Integration](#pmp-integration)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Tutorial](#tutorial)

---

## Overview

AbeOps is an interactive project management tool that adapts its interface based on **who is using it**. A Project Manager sees PMP process groups and knowledge area matrices. A Scrum Master sees sprint planning with velocity tracking. A Team Member sees their assigned cards on the Kanban board. All roles share the same underlying data but get a tailored experience — and each persona's view state is independently saved and restored.

---

## Features

### 🗂️ Kanban Board
- **Drag-and-drop** cards between 6 columns (Backlog → Done) via `@hello-pangea/dnd`
- **WIP limits** with visual warnings when columns are over capacity
- **Inline card creation** — click "+ Add card" at the bottom of any column
- **Filters** — search, filter by priority, type, assignee, or sprint
- **Card details** — priority badges, story point indicators, type icons, assignee avatars

![Kanban Board](docs/screenshots/01-kanban-board.png)

### 📋 Product Backlog
- **Sortable table** with columns for title, type, priority, points, status, assignee, sprint
- **Inline editing** — expand any row to edit details and acceptance criteria
- **Bulk filters** — priority, type, and assignee dropdowns
- **Summary stats** — total stories, points, and status distribution at a glance

![Backlog View](docs/screenshots/02-backlog-view.png)

### 🏃 Sprint Planning
- **Sprint management** — create, start, complete, and cancel sprints
- **Dual-pane layout** — sprint backlog on the left, product backlog on the right
- **Drag stories** between sprint and product backlogs
- **Velocity tracking** — average velocity from completed sprints, capacity percentage
- **Progress bar** — visual sprint progress with days remaining countdown

![Sprint Planning](docs/screenshots/03-sprint-planning.png)

### 🃏 Scrum Poker
- **Fibonacci card deck** — 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕
- **AI participants** — simulated team members vote with gaussian-biased estimates
- **Vote reveal** with statistics — min, max, average, mode, consensus level
- **Timer** — optional countdown for time-boxed estimation
- **Apply estimate** — set the final story points directly from the poker session

![Scrum Poker](docs/screenshots/11-scrum-poker-setup.png)

### 📊 PMP Dashboard (PMBOK-Aligned)
- **5 Process Groups** — Initiating, Planning, Executing, Monitoring & Controlling, Closing
- **10 Knowledge Areas** — Integration, Scope, Schedule, Cost, Quality, Resource, Communications, Risk, Procurement, Stakeholder Engagement
- **Process-Knowledge Matrix** — heatmap showing story distribution across the PMBOK framework
- **Health indicators** — color-coded status dots (green/yellow/red) per knowledge area
- **Interactive filtering** — click a process group to filter all views

![PMP Dashboard](docs/screenshots/04-pmp-dashboard.png)

### 🌐 GeoIntel Dashboard
- **Interactive world map** with country-level data visualization
- **2D flat** and **3D globe** view modes
- **Category filters** — Healthcare, Political, Military, Education, Custom
- **Built-in datasets** — COVID-19 cases, US election data
- **CSV upload** — drag-and-drop custom datasets
- **Color gradients** — Neon Blue, Fire, Emerald, Purple Haze, Sunset, Political

![Geo Dashboard](docs/screenshots/05-geo-dashboard.png)

### 👤 Persona System
- **8 built-in personas** — each with tailored navigation, default views, and descriptions
- **Instant switching** — dropdown in the top-right corner
- **State preservation** — each persona's filters, selected sprint, and current view are saved independently to `localStorage`
- **Dynamic navigation** — tabs shown/hidden based on persona's `visibleViews` config

![Persona Selector](docs/screenshots/06-persona-selector.png)

<details>
<summary>📸 Persona Views</summary>

| Project Manager | Product Owner |
|:-:|:-:|
| ![PM View](docs/screenshots/07-persona-pm.png) | ![PO View](docs/screenshots/08-persona-po.png) |

| Team Member | Stakeholder |
|:-:|:-:|
| ![Dev View](docs/screenshots/09-persona-dev.png) | ![Stakeholder View](docs/screenshots/10-persona-stakeholder.png) |

</details>

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Clone and enter the project
cd Squad/geo-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# → http://localhost:5173
```

### Build for Production

```bash
npm run build     # TypeScript check + Vite build → dist/
npm run preview   # Preview production build locally
```

### Lint

```bash
npm run lint      # ESLint with TypeScript rules
```

### 💾 Data Export & Import
- **Export** all stories and sprints as JSON (`abeops-export-YYYY-MM-DD.json`)
- **Import** previously exported JSON to restore or share project state
- Access from the **⋮ menu** in the top navigation bar

![Data Menu](docs/screenshots/12-data-export-menu.png)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      BrowserRouter                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │                PersonaProvider                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │               PMProvider                     │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │            AppProvider                 │  │  │  │
│  │  │  │                                       │  │  │  │
│  │  │  │   TopNav (PersonaSelector + Tabs)     │  │  │  │
│  │  │  │   ┌─────────────────────────────┐    │  │  │  │
│  │  │  │   │         Routes              │    │  │  │  │
│  │  │  │   │  /kanban    → KanbanBoard   │    │  │  │  │
│  │  │  │   │  /backlog   → BacklogView   │    │  │  │  │
│  │  │  │   │  /sprint-*  → SprintPlanning│    │  │  │  │
│  │  │  │   │  /pmp       → PMPDashboard  │    │  │  │  │
│  │  │  │   │  /dashboard → GeoDashboard  │    │  │  │  │
│  │  │  │   └─────────────────────────────┘    │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### State Management

| Context | Purpose | Persistence |
|---------|---------|-------------|
| `PersonaContext` | Current persona, per-persona view state (filters, selected sprint, sidebar) | `localStorage` (`abeops-persona-state`) |
| `PMContext` | Stories, sprints, poker sessions — all PM data | `localStorage` (`abeops-data`) |
| `AppContext` | Geo dashboard state (sidebar, map view, selected region) | In-memory |

---

## Persona System

Each persona gets a **tailored experience**:

| Persona | Default View | Visible Views | Use Case |
|---------|-------------|---------------|----------|
| **Project Manager** | PMP Dashboard | All 5 views | Full project visibility, risk management, PMBOK tracking |
| **Scrum Master** | Sprint Planning | Dashboard, Kanban, Backlog, Sprints | Sprint ceremonies, velocity, facilitation |
| **Team Member** | Kanban | Kanban, Sprints | Daily task board, estimation |
| **Product Owner** | Backlog | All 5 views | Backlog prioritization, sprint review |
| **QA Lead** | Kanban | Kanban, Backlog, Sprints | Testing pipeline, quality gates |
| **Business Analyst** | Backlog | Dashboard, Backlog, PMP | Requirements, scope analysis |
| **Stakeholder** | Dashboard | Dashboard, PMP | Read-only project status |
| **DevOps Lead** | Kanban | Kanban, Sprints | Infrastructure tasks, releases |

**State is preserved per persona.** When you switch from Scrum Master (filtered to Sprint 2, viewing Kanban) to Product Owner (searching "auth" in Backlog), then switch back — the Scrum Master's view is exactly where you left it.

---

## PMP Integration

AbeOps maps every story to the [PMBOK® Guide](https://www.pmi.org/pmbok-guide-standards/foundational/pmbok) framework:

### 5 Process Groups
| Group | Description | Color |
|-------|-------------|-------|
| Initiating | Define a new project or phase | 🔵 Blue |
| Planning | Establish scope, refine objectives | 🟣 Purple |
| Executing | Complete work defined in the plan | 🟡 Amber |
| Monitoring & Controlling | Track, review, regulate progress | 🩷 Pink |
| Closing | Finalize all activities | 🟢 Green |

### 10 Knowledge Areas
Integration · Scope · Schedule · Cost · Quality · Resource · Communications · Risk · Procurement · Stakeholder Engagement

The **Process-Knowledge Matrix** provides a heatmap view showing how work items distribute across the PMBOK framework, giving Project Managers instant visibility into coverage gaps.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Drag & Drop | @hello-pangea/dnd |
| Icons | Lucide React |
| Maps | react-simple-maps, D3.js, globe.gl, Three.js |
| IDs | uuid v13 |
| CSV Parsing | PapaParse |

---

## Project Structure

```
geo-dashboard/
├── src/
│   ├── App.tsx                    # Root component with routes
│   ├── main.tsx                   # Entry point with providers
│   ├── index.css                  # Tailwind imports
│   ├── components/
│   │   ├── pm/                    # Project management UI
│   │   │   ├── KanbanBoard.tsx    # Drag-and-drop Kanban
│   │   │   ├── BacklogView.tsx    # Sortable backlog table
│   │   │   ├── SprintPlanning.tsx # Sprint management
│   │   │   ├── ScrumPoker.tsx     # Estimation poker
│   │   │   ├── PMPDashboard.tsx   # PMBOK process tracking
│   │   │   ├── TopNav.tsx         # Navigation bar
│   │   │   └── PersonaSelector.tsx# Persona dropdown
│   │   ├── Sidebar.tsx            # Geo dashboard sidebar
│   │   ├── MapContainer.tsx       # Map view switcher
│   │   ├── USMap.tsx / WorldMap.tsx# Map components
│   │   └── GlobeView.tsx          # 3D globe
│   ├── context/
│   │   ├── PersonaContext.tsx     # Persona state + persistence
│   │   ├── PMContext.tsx          # PM data + persistence
│   │   └── AppContext.tsx         # Geo dashboard state
│   ├── types/
│   │   ├── pm.ts                  # PM type definitions
│   │   └── index.ts               # Geo types
│   ├── constants/
│   │   ├── pm.ts                  # Personas, columns, PMP config
│   │   └── index.ts               # Geo constants
│   └── hooks/                     # Custom hooks
├── docs/
│   └── screenshots/               # App screenshots
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

---

## Tutorial

📖 **[Step-by-Step Tutorial →](docs/tutorial.md)**

A comprehensive walkthrough covering:
1. Setting up the project
2. Choosing your persona
3. Managing the Kanban board
4. Running a sprint
5. Playing Scrum Poker
6. Using the PMP Dashboard
7. Exploring the GeoIntel map

---

## License

Private — internal use only.

