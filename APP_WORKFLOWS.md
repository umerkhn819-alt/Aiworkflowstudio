# AutoFlow App Workflows

This document explains how the app flows from a user perspective.

## 1) Core User Journey

1. Open app (`http://localhost:5173`).
2. Create a new workflow or load a starter template.
3. Add/connect nodes on canvas.
4. Click **Run**.
5. Engine executes nodes in order and shows per-node status (`running`, `done`, `error`, `skipped`).
6. View final output in output nodes and run history.
7. Save/share/export workflow.

## 2) Workflow Builder Flow

- **Node authoring**: user places nodes from the left palette.
- **Connection**: user draws edges between node handles.
- **Configuration**: user edits node settings (tone, max words, keyword, delay, target language, custom prompt).
- **Validation by runtime**: run-time checks empty input/invalid config and marks node `error` if needed.

## 3) Execution Flow (High-Level)

1. User clicks **Run**.
2. Executor builds topological order.
3. Each node receives input from upstream context.
4. Node handler runs and returns output.
5. Output is stored in context and fed downstream.
6. UI updates each node with current status and output.
7. On failure, execution stops and failing node shows error output.

## 4) Condition Branch Flow

- Condition node checks `keyword` against input text.
- If matched: `true` branch receives input; `false` branch gets `null`.
- If not matched: `false` branch receives input; `true` branch gets `null`.
- Nodes that receive `null` are marked `skipped` with: `Skipped — branch not taken`.

## 5) AI Flow (Current Setup)

- Frontend sends AI work to backend endpoint: `POST /api/ai/run`.
- Backend uses provider from `server/.env` (`OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_API_KEY`).
- If provider works: returns real AI result.
- If backend is down or misconfigured: frontend falls back to mock AI so demo mode still works.

## 6) Save/Load/Share/Export Flow

- **Local save**: workflows are persisted in browser localStorage.
- **Export JSON**: downloads a clean workflow blueprint (statuses reset to `idle`, outputs cleared).
- **Share link**: app encodes workflow JSON into URL query (`?wf=...`).
- **Import JSON**: user can import exported file and continue editing.

## 7) Backend Persistence Flow (Optional Cloud Save)

1. Register/login to receive JWT.
2. JWT attached to requests.
3. Backend scopes workflow CRUD by authenticated `userId`.
4. MongoDB stores/retrieves user-owned workflows.
5. If DB unavailable, auth/workflow routes return `503` while AI route can still run.

## 8) What Is "Working" in Your Current Build

- Frontend workflow engine and node execution.
- Backend AI integration through OpenRouter-compatible API.
- MongoDB connectivity and workflow/auth routes (when DB reachable).
- Export/share/local history features.
