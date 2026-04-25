# AutoFlow AI Studio — Full Architecture & Workflow Guide

This document describes the complete system: frontend, execution engine, backend API, database, and how everything connects.

---

## System Overview

```
New folder/
├── autoflow-ai-studio/    Frontend — React + Vite (runs on localhost:5173)
└── server/                Backend  — Node.js + Express (runs on localhost:5000)
```

The frontend works completely standalone (demo mode). The backend is an optional layer that adds:
- Server-side AI execution (OpenAI key stays on the server, not in the browser)
- User accounts (register / login)
- MongoDB workflow persistence (save/load across devices)

---

## How the App Works — End to End

### 1. User opens the browser at `http://localhost:5173`

Three pages exist. React renders one at a time (no URL routing — state-based):

```
Landing  →  Workflows  →  Studio
```

| Page | What it does |
|---|---|
| **Landing** | Marketing page with live animated demo pipeline and 3 killer workflow templates |
| **Workflows** | Lists saved workflows from localStorage, create new, import JSON, pick a template |
| **Studio** | The main canvas — build pipelines, run them, view outputs live |

---

### 2. Building a workflow in the Studio

- **Left panel (NodePalette)** — drag any node type onto the canvas
- **Canvas (WorkflowCanvas)** — React Flow powered, drag to reposition, connect handles with edges
- **Double-click canvas** — opens QuickAddPopover to insert a node at that exact position
- **TopBar** — rename workflow, undo/redo, run controls, share link, export JSON

All changes are saved to `localStorage` automatically via `useWorkflowStorage` hook.

---

### 3. Running a workflow

When you click **Run**:

```
TopBar Run button
    ↓
useExecution hook
    ↓
executor.ts — runWorkflow()
    ↓
topologicalSort() — orders nodes so dependencies run first
    ↓
For each node in order:
    resolveInput()     ← reads output from previous node (handle-aware for Condition)
    onNodeUpdate()     ← sets status = 'running' (UI updates instantly)
    executeNode()      ← calls the right handler
    onNodeUpdate()     ← sets status = 'done' + output (or 'skipped' / 'error')
```

#### Node handlers

| Node Type | Handler | What it does |
|---|---|---|
| `inputNode` | inputHandler | Returns the pre-filled text value |
| `outputNode` | outputHandler | Passes input through as final result |
| `transformNode` | transformHandler | uppercase / lowercase / trim / reverse / replace |
| `aiSummarizeNode` | aiHandler (summarize) | Calls OpenAI or mock to summarize |
| `aiRewriteNode` | aiHandler (rewrite) | Calls OpenAI or mock to rewrite |
| `aiCustomNode` | customAIHandler | Calls OpenAI with your own system prompt |
| `aiTranslateNode` | translateHandler | Translates to chosen language |
| `conditionNode` | conditionHandler | Checks if input contains keyword → routes true/false |
| `delayNode` | delayHandler | Waits N seconds before passing input through |

#### Condition node branching

The condition node writes two outputs into the execution context:
- `nodeId:true` — the input text if keyword matched
- `nodeId:false` — the input text if keyword did NOT match

Downstream nodes connected to the inactive handle receive `null` input and are marked `skipped` (grey, dimmed).

---

### 4. AI calls — Demo Mode vs OpenAI Mode

```
aiHandler / customAIHandler / translateHandler
    ↓
openai.ts
    ↓
getApiKey() from localStorage
    ↓
Key present?  ──Yes──→  fetch() to api.openai.com/v1/chat/completions
                               (key lives in browser localStorage)
    │
   No
    ↓
mockAI.ts — instant deterministic response
  "[Demo] Summary of..."
  "[Demo] Rewrite:..."
  "[Demo] Translation to Spanish:..."
```

To use real OpenAI: click **Settings** (gear icon in TopBar) → paste your API key.

---

### 5. Saving workflows — localStorage

Everything is stored locally in the browser:

| Key | Contents |
|---|---|
| `autoflow_workflows` | Array of all your workflow JSON objects |
| `autoflow_settings` | `{ apiKey: "..." }` |
| `autoflow_run_history_<workflowId>` | Last 20 run results for each workflow |

No account or internet connection needed for any of this.

---

### 6. Sharing a workflow

**TopBar → Share button (link icon):**
1. Encodes the full workflow as `btoa(JSON.stringify(workflow))`
2. Produces a URL like `http://localhost:5173/?wf=eyJpZCI6...`
3. Copies it to clipboard

**When someone opens that URL:**
- `App.tsx` reads `?wf=` on mount
- Decodes and validates the workflow
- Saves it to their localStorage
- Opens it directly in Studio

---

## The Backend

### What it is

A standalone Node.js + Express + TypeScript server in `server/`. It mirrors all the AI logic server-side and adds user accounts + MongoDB persistence.

### Starting it

```bash
cd server
cp .env.example .env    # fill in MONGO_URI and JWT_SECRET
npm run dev             # starts on localhost:5000
```

### All endpoints

| Method | Path | Auth required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Server status + mode (openai/mock) |
| `POST` | `/api/ai/run` | No | Run any AI node server-side |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Login → returns JWT |
| `GET` | `/api/workflows` | Bearer JWT | List user's workflows |
| `POST` | `/api/workflows` | Bearer JWT | Save a workflow |
| `GET` | `/api/workflows/:id` | Bearer JWT | Load one workflow |
| `PUT` | `/api/workflows/:id` | Bearer JWT | Update a workflow |
| `DELETE` | `/api/workflows/:id` | Bearer JWT | Delete a workflow |

### Request/response format for AI

```
POST /api/ai/run
Content-Type: application/json

{
  "nodeType": "summarize" | "rewrite" | "translate" | "custom",
  "input": "your text here",
  "options": {
    "maxWords": 50,           // summarize
    "tone": "casual",         // rewrite
    "targetLanguage": "Spanish", // translate
    "systemPrompt": "..."     // custom
  }
}

→ { "result": "...", "mode": "openai" | "mock" }
```

### Backend fallback logic

```
POST /api/ai/run
    ↓
ai.controller.ts — validate nodeType + input
    ↓
OPENAI_API_KEY set in server .env?
    ↓ Yes                   ↓ No
openai.service.ts      mock.service.ts
(real OpenAI call)     (same mock pools as frontend)
    ↓                       ↓
{ result, mode: "openai" }  { result, mode: "mock" }
```

### Authentication flow

```
POST /api/auth/register  { email, password }
    ↓
bcrypt.hash(password, 10)
    ↓
User saved to MongoDB
    ↓
jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" })
    ↓
→ { token, user: { id, email } }

---

Subsequent protected requests:
Authorization: Bearer <token>
    ↓
auth.middleware.ts — jwt.verify(token, JWT_SECRET)
    ↓
req.userId = payload.userId
    ↓
workflow.controller.ts — all queries filtered by userId
```

### Graceful degradation

If `MONGO_URI` is not set (or Atlas is unreachable):
- Server still starts and runs normally
- AI routes (`/api/ai/run`, `/api/health`) work fine
- Auth + workflow routes return `503` with a clear message
- Frontend localStorage path is completely unaffected

---

## Backend folder structure

```
server/
├── src/
│   ├── index.ts                     Entry point — CORS, middleware, routes, DB connect
│   ├── types.ts                     Shared TypeScript types
│   ├── db/
│   │   └── connection.ts            connectDB() using Mongoose
│   ├── middleware/
│   │   ├── auth.middleware.ts       JWT verify → attach req.userId
│   │   └── requireDb.middleware.ts  Returns 503 if MongoDB not connected
│   ├── models/
│   │   ├── User.model.ts            email + bcrypt hash (password never returned)
│   │   └── Workflow.model.ts        userId-scoped, mirrors frontend Workflow type
│   ├── controllers/
│   │   ├── ai.controller.ts         Validate + route to openai/mock service
│   │   ├── auth.controller.ts       register + login
│   │   └── workflow.controller.ts   5-route CRUD filtered by userId
│   ├── routes/
│   │   ├── ai.routes.ts             /health + /ai/run
│   │   ├── auth.routes.ts           /auth/register + /auth/login
│   │   └── workflow.routes.ts       /workflows CRUD (all behind authMiddleware)
│   ├── services/
│   │   ├── openai.service.ts        Real OpenAI fetch — same prompts as frontend
│   │   └── mock.service.ts          Mock response pools — same as frontend mockAI.ts
│   └── utils/
│       └── logger.ts                Colored timestamped console logger
├── .env.example                     Template — copy to .env and fill in values
├── package.json
└── tsconfig.json
```

---

## Frontend folder structure

```
autoflow-ai-studio/src/
├── components/
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx       React Flow canvas + drag/drop + double-click
│   │   ├── NodePalette.tsx          Left sidebar node list
│   │   ├── QuickAddPopover.tsx      Double-click quick-add popup
│   │   └── EdgeAnimated.tsx         Animated connecting edges
│   ├── layout/
│   │   └── TopBar.tsx               Run controls, undo/redo, share, export, settings
│   ├── nodes/                       One component per node type
│   │   ├── InputNode.tsx
│   │   ├── OutputNode.tsx
│   │   ├── TransformNode.tsx
│   │   ├── AINode.tsx               Summarize + Rewrite
│   │   ├── ConditionNode.tsx        True/false branching (two source handles)
│   │   ├── CustomAINode.tsx         Free system prompt textarea
│   │   ├── TranslateNode.tsx        12-language dropdown
│   │   ├── DelayNode.tsx
│   │   ├── NodeWrapper.tsx          Shared node shell (status border + icons)
│   │   └── NodeOutput.tsx           Output display + copy-to-clipboard
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── RunControls.tsx          Run / Stop / status
│       ├── RunHistoryPanel.tsx      Last 20 runs per workflow
│       └── SettingsModal.tsx        OpenAI key input
├── constants/
│   ├── nodeRegistry.ts              All node definitions + defaultConfigs
│   └── starterTemplates.ts          12 pre-built workflow templates
├── engine/
│   ├── executor.ts                  runWorkflow() — the core execution loop
│   ├── topologicalSort.ts           Kahn's algorithm BFS sort
│   └── nodeHandlers/                One handler per node type
├── hooks/
│   ├── useExecution.ts              Orchestrates run/stop/history
│   └── useWorkflowStorage.ts        Auto-save to localStorage
├── lib/
│   ├── storage.ts                   localStorage read/write helpers
│   ├── openai.ts                    callOpenAI / callOpenAICustom / callOpenAITranslate
│   ├── mockAI.ts                    Demo mode responses
│   ├── shareWorkflow.ts             btoa encode/decode for shareable URLs
│   └── exportWorkflow.ts            JSON file download
├── pages/
│   ├── Landing.tsx                  Landing page + animated demo section
│   ├── Workflows.tsx                Workflow list + template picker
│   └── Studio.tsx                   Main studio page shell
├── store/
│   └── workflowStore.ts             Zustand store — nodes, edges, history, execution state
└── types/
    └── workflow.ts                  All TypeScript interfaces
```

---

## Current Status

| Feature | Status |
|---|---|
| Frontend (React + canvas + execution) | Working |
| Demo mode AI (mock responses) | Working |
| localStorage workflow persistence | Working |
| Undo/redo, import/export, share URL | Working |
| Backend server (localhost:5000) | Running |
| Backend AI endpoint `/api/ai/run` | Working |
| MongoDB connection | Blocked — fix Atlas IP allowlist |
| Auth (register/login) | Ready — waiting on MongoDB |
| Backend workflow CRUD | Ready — waiting on MongoDB |

### To fix MongoDB

In [MongoDB Atlas](https://cloud.mongodb.com):
1. Go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Confirm → restart the backend

### To wire frontend → backend AI (optional)

Add to `autoflow-ai-studio/.env.local`:
```
VITE_API_URL=http://localhost:5000
```

Then in `autoflow-ai-studio/src/lib/openai.ts`, before the `getApiKey()` check in each function:
```typescript
const BACKEND = import.meta.env.VITE_API_URL;
if (BACKEND) {
  const res = await fetch(`${BACKEND}/api/ai/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeType, input, options }),
  });
  return (await res.json()).result;
}
```

When `VITE_API_URL` is absent the frontend continues working in demo/direct mode unchanged.

---

## Quick Start — Run Everything

```bash
# Terminal 1 — Frontend
cd "autoflow-ai-studio"
npm install
npm run dev
# → http://localhost:5173

# Terminal 2 — Backend
cd "server"
cp .env.example .env      # edit .env with your MONGO_URI + JWT_SECRET
npm install
npm run dev
# → http://localhost:5000
```
