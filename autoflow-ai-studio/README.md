# DraftMesh

DraftMesh is a visual AI workflow platform for turning repetitive prompt tasks into reusable operational pipelines.
Teams can design, run, and standardize content workflows with node-level visibility and predictable outputs.

Stack:
- React + Vite + TypeScript frontend (runs fully standalone in the browser)
- localStorage persistence (no backend required to use the app)
- Backend AI routing (`/api/ai/run`) with provider configuration in `server/.env`
- Smart mock fallback when AI provider is unavailable
- Optional Node.js + Express + MongoDB backend in `../server/` for user accounts and cloud workflow persistence

See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the full system diagram and workflow guide.

## Core Highlights

- Visual node editor built with `@xyflow/react` (React Flow)
- Sequential execution engine with node statuses (`idle`, `running`, `done`, `error`, `skipped`)
- Built-in node types:
  - Input
  - Transform
  - Condition (true/false branching)
  - AI Summarize
  - AI Rewrite
  - AI Custom Prompt
  - AI Translate
  - Delay
  - Output
- Demo mode AI responses for all AI features (no key required)
- Undo/redo history
- Run history panel
- Import/export JSON workflow
- Shareable URL support (`?wf=...`)
- Double-click canvas quick-add menu
- Animated landing page demo pipeline
- Professional SaaS messaging with clear problem -> solution -> outcome positioning

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- `@xyflow/react`
- Zustand
- localStorage

## Project Structure

```text
src/
├── components/
│   ├── canvas/         # Canvas, edges, palette, quick-add
│   ├── layout/         # TopBar and shell UI
│   ├── nodes/          # All node components
│   └── ui/             # Shared UI (buttons, modal, toast, controls)
├── constants/          # Node registry, templates
├── engine/             # Executor + topological sort + node handlers
├── hooks/              # useExecution, useWorkflowStorage
├── lib/                # storage, OpenAI wrapper, mock AI, export/share helpers
├── pages/              # Landing, Workflows, Studio
├── store/              # Zustand workflow store
└── types/              # Workflow and node type definitions
```

## How Execution Works

1. Workflow graph is topologically sorted.
2. Nodes execute in order.
3. Each node updates visual status in real time.
4. Condition node writes handle-aware context:
   - `nodeId:true`
   - `nodeId:false`
5. Downstream nodes receiving non-active branch input are marked `skipped`.
6. Outputs are stored and displayed inside nodes.

## Problem It Solves

Most AI workflows break because teams copy prompts manually across multiple tools, causing:
- inconsistent output quality
- no repeatable process
- poor run visibility
- slow delivery for content and operations

DraftMesh solves this by giving teams:
- visual pipeline orchestration
- reusable node-based workflow templates
- backend-routed AI execution with clear runtime status
- optional auth + cloud persistence via MongoDB

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Run Development Server

```bash
npm run dev
```

### 3) Build

```bash
npm run build
```

### 4) Preview Production Build

```bash
npm run preview
```

## Usage Guide

1. Open **Workflows** page.
2. Create new workflow or start from template.
3. In Studio:
   - drag nodes from left panel
   - connect handles
   - configure node options
4. Click **Run** to execute.
5. Check per-node output and run history.
6. Optional:
   - export/import JSON
   - duplicate workflow
   - copy output from done nodes
   - share workflow URL

## Keyboard & Productivity

- `Ctrl + Z` / `Cmd + Z` -> Undo
- `Ctrl + Y` / `Cmd + Shift + Z` -> Redo
- `Delete` -> remove selected element
- Double-click canvas -> quick add menu

## Persistence

Stored in browser localStorage:
- `autoflow_workflows`
- `autoflow_settings`
- `autoflow_run_history_<workflowId>`

## Important Notes

- The frontend works fully standalone — no backend required.
- The backend (`../server/`) powers AI execution, auth, and MongoDB persistence.
- Shared URL payloads are base64-encoded in the query string for lightweight sharing.

## Current Lint Status

TypeScript checks pass (`npx tsc --noEmit`).

ESLint currently reports several existing rule violations in app files, mostly:
- `react-hooks/set-state-in-effect`
- `react-refresh/only-export-components`
- `preserve-caught-error`

These are code-quality follow-ups and do not block runtime behavior.

## Future Improvements

- Parallel branch execution
- Robust schema validation for imported/shared workflows
- Branch merge/aggregator node
- Test coverage (unit + integration)
- Optional lightweight backend sync layer (if productionized)
