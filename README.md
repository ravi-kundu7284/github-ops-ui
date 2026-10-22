# GitHub Operations Management UI (`github-ops-ui`)

A modern, responsive dashboard interface for performing and managing GitHub operations backed by the **GitHub Operations FastAPI and Model Context Protocol (MCP) server**.

[![CI](https://github.com/ravi-kundu7284/github-ops-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/ravi-kundu7284/github-ops-ui/actions)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features & Views

- **Dashboard:**
  - Authenticated GitHub account profile, repository statistics, and followers.
  - Active rate-limit meter with live quota tracking and reset indicators.
  - MCP Backend connectivity and registered tools monitor.
  - Recent repositories summary and quick operations launcher.
- **Repository Management:**
  - Filter repositories by visibility (`all`, `public`, `private`) and sorting (`recently updated`, `alphabetical`, `stars`).
  - Create new repositories (with private toggle and README initialization).
  - Update repository settings (name, description, visibility).
  - Destructive repository deletion with strict challenge text confirmation (must type exact repo name).
- **Branch Management:**
  - List branches with commit SHAs and protected status badges.
  - Create new branches from an existing branch or specific commit SHA.
- **Pull Request Management:**
  - View open, closed, or merged pull requests with branch compare indicators (`head` &rarr; `base`).
  - Create new pull requests (including draft PRs).
  - Submit formal PR reviews (`APPROVE`, `REQUEST_CHANGES`, `COMMENT`).
  - Merge pull requests with configurable strategy (`merge`, `squash`, `rebase`).
- **Issue Management:**
  - List open and closed issues with assignees and custom colored label pills.
  - Create new issues with labels and assignees.
  - Close issues with an optional resolution comment.
- **Commit Management:**
  - Commit history timeline with author avatars, dates, and short SHAs.
  - Detailed commit inspector displaying additions/deletions stats, affected files, and unified diff patches.
- **File & Code Browser:**
  - Browse file trees with interactive breadcrumb navigation.
  - Syntax-styled code viewer with copy-to-clipboard functionality.
  - Create and edit repository files directly with custom commit messages.
- **Workflows & Actions:**
  - View defined GitHub Actions workflows in `.github/workflows/`.
  - Inspect execution history runs, status badges, conclusion results, and triggers.
  - Drill down into job steps, durations, and download full run logs.
- **Global Search:**
  - Unified search across Repositories, Issues, Pull Requests, Commits, Code, and Users.
  - Global `Ctrl+K` / `Cmd+K` keyboard shortcut.
- **Operation History & Audit Log:**
  - Live table of operations executed through REST API and MCP server tools.
  - Inspect execution status, duration in milliseconds, sanitized parameters, and error reports.
- **Settings & MCP Client Integration:**
  - Runtime override for FastAPI backend URL.
  - GitHub Personal Access Token management (stored only in browser session).
  - Copy-paste configuration snippets for Claude Desktop, Cursor, and custom MCP clients.

---

## Technology Stack

- **Framework:** React 18 with TypeScript
- **Tooling:** Vite 5
- **Styling:** Tailwind CSS 3 with GitHub dark theme aesthetic
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library + JSDOM
- **Containerization:** Multi-stage Docker build with NGINX Alpine

---

## Prerequisites & Local Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- npm (or yarn / pnpm)

### 2. Installation
```bash
# Clone repository
git clone https://github.com/ravi-kundu7284/github-ops-ui.git
cd github-ops-ui

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
# Base URL of the GitHub Operations FastAPI Backend
VITE_API_BASE_URL=http://localhost:8000

# Optional Default GitHub Token for testing (stored only in browser memory)
VITE_GITHUB_TOKEN=
```

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Testing & Build

```bash
# Run unit tests with Vitest
npm run test

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Docker Deployment

Build and run the containerized application with NGINX:

```bash
# Build Docker image
docker build -t github-ops-ui .

# Run container on port 80 (or mapped to port 3000)
docker run -p 3000:80 github-ops-ui
```
Open [http://localhost:3000](http://localhost:3000).

---

## Static Hosting Deployment

### Cloudflare Pages
1. Connect your GitHub repository `ravi-kundu7284/github-ops-ui`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Build output directory: `dist`.
5. Environment variable: `VITE_API_BASE_URL` pointing to your deployed backend.

### Vercel
1. Import repository `github-ops-ui`.
2. Framework: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set `VITE_API_BASE_URL` in project environment variables.
