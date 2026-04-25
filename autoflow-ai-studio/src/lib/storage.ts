import type { Workflow, RunHistoryEntry } from '../types/workflow';

const WORKFLOWS_KEY = 'autoflow_workflows';
const SETTINGS_KEY = 'autoflow_settings';
const HISTORY_KEY = 'autoflow_run_history';

export interface AppSettings {
  apiKey: string;
}

// --- Workflows ---
export function loadWorkflows(): Workflow[] {
  try {
    const raw = localStorage.getItem(WORKFLOWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWorkflows(workflows: Workflow[]): void {
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
}

export function loadWorkflow(id: string): Workflow | null {
  return loadWorkflows().find((w) => w.id === id) ?? null;
}

export function saveWorkflow(workflow: Workflow): void {
  const workflows = loadWorkflows();
  const idx = workflows.findIndex((w) => w.id === workflow.id);
  if (idx >= 0) {
    workflows[idx] = workflow;
  } else {
    workflows.push(workflow);
  }
  saveWorkflows(workflows);
}

export function deleteWorkflow(id: string): void {
  const workflows = loadWorkflows().filter((w) => w.id !== id);
  saveWorkflows(workflows);
}

// --- Settings ---
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { apiKey: '' };
  } catch {
    return { apiKey: '' };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getApiKey(): string {
  return loadSettings().apiKey;
}

// --- Run History ---
export function loadRunHistory(workflowId: string): RunHistoryEntry[] {
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY}_${workflowId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRunEntry(entry: RunHistoryEntry): void {
  const history = loadRunHistory(entry.workflowId);
  history.unshift(entry);
  // Keep last 20 runs per workflow
  const trimmed = history.slice(0, 20);
  localStorage.setItem(`${HISTORY_KEY}_${entry.workflowId}`, JSON.stringify(trimmed));
}
