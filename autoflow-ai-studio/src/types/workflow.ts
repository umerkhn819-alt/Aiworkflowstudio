export type NodeStatus = 'idle' | 'running' | 'done' | 'error' | 'skipped';

export type NodeType =
  | 'inputNode'
  | 'outputNode'
  | 'transformNode'
  | 'aiSummarizeNode'
  | 'aiRewriteNode'
  | 'aiCustomNode'
  | 'aiTranslateNode'
  | 'conditionNode'
  | 'delayNode';

export interface TransformConfig {
  operation: 'uppercase' | 'lowercase' | 'trim' | 'reverse' | 'replace';
  find?: string;
  replace?: string;
}

export interface AIConfig {
  mode: 'summarize' | 'rewrite';
  maxWords?: number;
  tone?: string;
}

export interface CustomAIConfig {
  systemPrompt: string;
}

export interface TranslateConfig {
  targetLanguage: string;
}

export interface ConditionConfig {
  keyword: string;
  caseSensitive: boolean;
}

export interface DelayConfig {
  seconds: number;
}

export interface InputConfig {
  value: string;
  placeholder?: string;
}

export type NodeConfig =
  | InputConfig
  | TransformConfig
  | AIConfig
  | CustomAIConfig
  | TranslateConfig
  | ConditionConfig
  | DelayConfig
  | Record<string, unknown>;

export interface NodeData {
  label: string;
  config: NodeConfig;
  status: NodeStatus;
  output: string | null;
  error?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface RunHistoryEntry {
  id: string;
  workflowId: string;
  ranAt: string;
  durationMs: number;
  status: 'success' | 'error';
  nodeCount: number;
}
