# AutoFlow Workflow Diagrams

Visual diagrams for the full app flow, backend flow, and AI execution.

## 1) End-to-End App Flow

```mermaid
flowchart TD
    A[User opens app] --> B[Create or load workflow]
    B --> C[Add nodes + connect edges]
    C --> D[Configure node settings]
    D --> E[Click Run]
    E --> F[Executor topological sort]
    F --> G[Execute node handlers in order]
    G --> H[Update node status and output]
    H --> I{Any node error?}
    I -- Yes --> J[Mark error and stop]
    I -- No --> K[Complete run]
    K --> L[Save / Share / Export JSON]
```

## 2) AI Node Execution Flow

```mermaid
flowchart TD
    A[AI node in workflow] --> B[Frontend lib openai.ts]
    B --> C[POST /api/ai/run]
    C --> D[server ai.controller.ts]
    D --> E{OPENAI_API_KEY configured?}
    E -- No --> F[Mock service response]
    E -- Yes --> G[Provider call via OPENAI_BASE_URL + OPENAI_MODEL]
    G --> H{Provider success?}
    H -- Yes --> I[Return real AI output]
    H -- No --> J[Return error to frontend]
    F --> K[Frontend shows output]
    I --> K
    J --> L[Frontend fallback to mock in UI layer]
    L --> K
```

## 3) Condition Branching Flow

```mermaid
flowchart TD
    A[Condition node input] --> B{Keyword match?}
    B -- True --> C[Set source:true = input]
    B -- True --> D[Set source:false = null]
    B -- False --> E[Set source:false = input]
    B -- False --> F[Set source:true = null]
    D --> G[Downstream false path skipped]
    F --> H[Downstream true path skipped]
```

## 4) Backend Auth + Workflow CRUD Flow

```mermaid
flowchart TD
    A[Browser / Postman] --> B[Bearer JWT header]
    B --> C[Workflow CRUD routes]
    C --> D[auth.middleware.ts]
    D --> E[Verify JWT + attach userId]
    E --> F[workflow.controller.ts]
    F --> G[Workflow.model.ts]
    G --> H[(MongoDB Atlas)]
```

## 5) Route Availability Flow

```mermaid
flowchart TD
    A[Server startup] --> B[connectDB]
    B --> C{Mongo connected?}
    C -- Yes --> D[All routes available]
    C -- No --> E[AI + health still available]
    E --> F[auth/workflow return 503]
```
