AutoFlow AI Studio
AutoFlow AI Studio is a portfolio-grade visual automation builder that runs fully in the browser. Users can create drag-and-drop workflows, connect nodes, execute pipelines step-by-step, and view outputs in real time.

Stack:

React + Vite + TypeScript frontend (runs fully standalone in the browser)
localStorage persistence (no backend required to use the app)
Optional OpenAI integration
Full demo mode fallback when no API key is provided
Optional Node.js + Express + MongoDB backend in ../server/ for user accounts and cloud workflow persistence
See ../ARCHITECTURE.md for the full system diagram and workflow guide.

Core Highlights
Visual node editor built with @xyflow/react (React Flow)
Sequential execution engine with node statuses (idle, running, done, error, skipped)
Built-in node types:
Input
Transform
Condition (true/false branching)
AI Summarize
AI Rewrite
AI Custom Prompt
AI Translate
Delay
Output
Demo mode AI responses for all AI features (no key required)
Undo/redo history
Run history panel
Import/export JSON workflow
Shareable URL support (?wf=...)
Double-click canvas quick-add menu
Animated landing page demo pipeline
Tech Stack
React 19 + TypeScript
Vite
Tailwind CSS
Framer Motion
@xyflow/react
Zustand
localStorage
Project Structure
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
How Execution Works
Workflow graph is topologically sorted.
Nodes execute in order.
Each node updates visual status in real time.
Condition node writes handle-aware context:
nodeId:true
nodeId:false
Downstream nodes receiving non-active branch input are marked skipped.
Outputs are stored and displayed inside nodes.
Demo Mode vs OpenAI Mode
Demo Mode (default)
Active when no API key is saved in settings.
Uses local mock responses for:
summarize
rewrite
custom prompt
translate
OpenAI Mode
Paste API key in Settings inside Studio.
AI nodes call OpenAI chat completions endpoint.
If key is removed, app automatically falls back to demo mode.
Getting Started
1) Install
npm install
2) Run Development Server
npm run dev
3) Build
npm run build
4) Preview Production Build
npm run preview
Usage Guide
Open Workflows page.
Create new workflow or start from template.
In Studio:
drag nodes from left panel
connect handles
configure node options
Click Run to execute.
Check per-node output and run history.
Optional:
export/import JSON
duplicate workflow
copy output from done nodes
share workflow URL
Keyboard & Productivity
Ctrl + Z / Cmd + Z -> Undo
Ctrl + Y / Cmd + Shift + Z -> Redo
Delete -> remove selected element
Double-click canvas -> quick add menu
Persistence
Stored in browser localStorage:

autoflow_workflows
autoflow_settings
autoflow_run_history_<workflowId>
Important Notes
The frontend works fully standalone — no backend required.
An optional backend (../server/) adds user accounts + MongoDB workflow persistence.
Shared URL payloads are base64-encoded in the query string for lightweight sharing.
Current Lint Status
TypeScript checks pass (npx tsc --noEmit).

ESLint currently reports several existing rule violations in app files, mostly:

react-hooks/set-state-in-effect
react-refresh/only-export-components
preserve-caught-error
These are code-quality follow-ups and do not block runtime behavior.

Future Improvements
Parallel branch execution
Robust schema validation for imported/shared workflows
Branch merge/aggregator node
Test coverage (unit + integration)
Optional lightweight backend sync layer (if productionized)
