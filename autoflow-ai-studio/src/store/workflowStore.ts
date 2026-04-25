import { create } from 'zustand';
import type { WorkflowNode, WorkflowEdge, Workflow, NodeData } from '../types/workflow';
import { saveWorkflow, loadWorkflow } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

const MAX_HISTORY = 50;

interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowStore {
  workflowId: string | null;
  workflowName: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isRunning: boolean;
  isDirty: boolean;
  completedNodeCount: number;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  loadFromStorage: (id: string) => void;
  setWorkflowName: (name: string) => void;
  setNodes: (nodes: WorkflowNode[], skipHistory?: boolean) => void;
  setEdges: (edges: WorkflowEdge[], skipHistory?: boolean) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (id: string, patch: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  setIsRunning: (val: boolean) => void;
  resetNodeStatuses: () => void;
  persistWorkflow: () => void;
  createNewWorkflow: () => string;
  undo: () => void;
  redo: () => void;
}

function pushToHistory(
  history: HistoryEntry[],
  historyIndex: number,
  entry: HistoryEntry
): { history: HistoryEntry[]; historyIndex: number } {
  const trimmed = history.slice(0, historyIndex + 1);
  const next = [...trimmed, entry].slice(-MAX_HISTORY);
  return { history: next, historyIndex: next.length - 1 };
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowId: null,
  workflowName: 'Untitled Workflow',
  nodes: [],
  edges: [],
  isRunning: false,
  isDirty: false,
  completedNodeCount: 0,
  history: [],
  historyIndex: -1,

  loadFromStorage: (id: string) => {
    const wf = loadWorkflow(id);
    if (wf) {
      set({
        workflowId: wf.id,
        workflowName: wf.name,
        nodes: wf.nodes,
        edges: wf.edges,
        isDirty: false,
        history: [{ nodes: wf.nodes, edges: wf.edges }],
        historyIndex: 0,
        completedNodeCount: 0,
      });
    }
  },

  setWorkflowName: (name: string) => {
    set({ workflowName: name, isDirty: true });
  },

  setNodes: (nodes: WorkflowNode[], skipHistory = false) => {
    if (skipHistory) {
      set({ nodes, isDirty: true });
    } else {
      const { history, historyIndex, edges } = get();
      const h = pushToHistory(history, historyIndex, { nodes, edges });
      set({ nodes, isDirty: true, ...h });
    }
  },

  setEdges: (edges: WorkflowEdge[], skipHistory = false) => {
    if (skipHistory) {
      set({ edges, isDirty: true });
    } else {
      const { history, historyIndex, nodes } = get();
      const h = pushToHistory(history, historyIndex, { nodes, edges });
      set({ edges, isDirty: true, ...h });
    }
  },

  addNode: (node: WorkflowNode) => {
    const { nodes, edges, history, historyIndex } = get();
    const newNodes = [...nodes, node];
    const h = pushToHistory(history, historyIndex, { nodes: newNodes, edges });
    set({ nodes: newNodes, isDirty: true, ...h });
  },

  updateNodeData: (id: string, patch: Partial<NodeData>) => {
    set((s) => {
      const nodes = s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      );
      const isTerminal =
        patch.status === 'done' || patch.status === 'error' || patch.status === 'skipped';
      return {
        nodes,
        isDirty: true,
        completedNodeCount: isTerminal ? s.completedNodeCount + 1 : s.completedNodeCount,
      };
    });
  },

  removeNode: (id: string) => {
    const { nodes, edges, history, historyIndex } = get();
    const newNodes = nodes.filter((n) => n.id !== id);
    const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
    const h = pushToHistory(history, historyIndex, { nodes: newNodes, edges: newEdges });
    set({ nodes: newNodes, edges: newEdges, isDirty: true, ...h });
  },

  setIsRunning: (val: boolean) => set({ isRunning: val, completedNodeCount: 0 }),

  resetNodeStatuses: () => {
    set((s) => ({
      nodes: s.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', output: null, error: undefined },
      })),
      completedNodeCount: 0,
    }));
  },

  persistWorkflow: () => {
    const { workflowId, workflowName, nodes, edges } = get();
    if (!workflowId) return;
    const existing = loadWorkflow(workflowId);
    const wf: Workflow = {
      id: workflowId,
      name: workflowName,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    saveWorkflow(wf);
    set({ isDirty: false });
  },

  createNewWorkflow: () => {
    const id = uuidv4();
    const wf: Workflow = {
      id,
      name: 'Untitled Workflow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    };
    saveWorkflow(wf);
    set({
      workflowId: id,
      workflowName: 'Untitled Workflow',
      nodes: [],
      edges: [],
      isDirty: false,
      history: [{ nodes: [], edges: [] }],
      historyIndex: 0,
      completedNodeCount: 0,
    });
    return id;
  },

  undo: () => {
    const { history, historyIndex, isRunning } = get();
    if (isRunning || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    set({ nodes: entry.nodes, edges: entry.edges, historyIndex: newIndex, isDirty: true });
  },

  redo: () => {
    const { history, historyIndex, isRunning } = get();
    if (isRunning || historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    set({ nodes: entry.nodes, edges: entry.edges, historyIndex: newIndex, isDirty: true });
  },
}));
