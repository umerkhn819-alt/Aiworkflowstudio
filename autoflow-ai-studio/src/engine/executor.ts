import type { WorkflowNode, WorkflowEdge, NodeData, NodeType } from '../types/workflow';
import { topologicalSort, getSourceEdges } from './topologicalSort';
import { inputHandler } from './nodeHandlers/inputHandler';
import { outputHandler } from './nodeHandlers/outputHandler';
import { transformHandler } from './nodeHandlers/transformHandler';
import { aiHandler } from './nodeHandlers/aiHandler';
import { delayHandler } from './nodeHandlers/delayHandler';
import { conditionHandler } from './nodeHandlers/conditionHandler';
import { customAIHandler } from './nodeHandlers/customAIHandler';
import { translateHandler } from './nodeHandlers/translateHandler';
import type { TransformConfig, AIConfig, DelayConfig, ConditionConfig, CustomAIConfig, TranslateConfig } from '../types/workflow';

export type NodeUpdateCallback = (id: string, patch: Partial<NodeData>) => void;

let abortRequested = false;

export function requestAbort() {
  abortRequested = true;
}

export function resetAbort() {
  abortRequested = false;
}

// Context stores string | null. null means "branch not taken" (from condition).
type Context = Map<string, string | null>;

function resolveInput(
  nodeId: string,
  edges: WorkflowEdge[],
  context: Context
): string | null {
  const incoming = getSourceEdges(nodeId, edges);
  if (incoming.length === 0) return '';

  for (const edge of incoming) {
    const key = edge.sourceHandle
      ? `${edge.source}:${edge.sourceHandle}`
      : edge.source;

    if (context.has(key)) {
      return context.get(key) ?? null;
    }
  }
  return null;
}

async function executeNode(
  node: WorkflowNode,
  input: string,
  context: Context
): Promise<void> {
  const type = node.type as NodeType;

  if (type === 'conditionNode') {
    const result = await conditionHandler(input, node.data.config as ConditionConfig);
    // Store per-handle outputs
    context.set(`${node.id}:true`, result.matched ? result.input : null);
    context.set(`${node.id}:false`, !result.matched ? result.input : null);
    // Base output for display
    context.set(node.id, result.input);
    return;
  }

  let output: string;
  switch (type) {
    case 'inputNode':
      output = await inputHandler(input, node.data.config);
      break;
    case 'outputNode':
      output = await outputHandler(input);
      break;
    case 'transformNode':
      output = await transformHandler(input, node.data.config as TransformConfig);
      break;
    case 'aiSummarizeNode':
      output = await aiHandler(input, { ...(node.data.config as AIConfig), mode: 'summarize' });
      break;
    case 'aiRewriteNode':
      output = await aiHandler(input, { ...(node.data.config as AIConfig), mode: 'rewrite' });
      break;
    case 'aiCustomNode':
      output = await customAIHandler(input, node.data.config as CustomAIConfig);
      break;
    case 'aiTranslateNode':
      output = await translateHandler(input, node.data.config as TranslateConfig);
      break;
    case 'delayNode':
      output = await delayHandler(input, node.data.config as DelayConfig);
      break;
    default:
      output = input;
  }

  context.set(node.id, output);
}

export async function runWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  onNodeUpdate: NodeUpdateCallback
): Promise<{ success: boolean; durationMs: number }> {
  resetAbort();
  const startTime = Date.now();

  if (nodes.length === 0) {
    throw new Error('Workflow has no nodes. Add some nodes and connect them.');
  }

  const ordered = topologicalSort(nodes, edges);
  const context: Context = new Map();

  for (const node of ordered) {
    if (abortRequested) {
      onNodeUpdate(node.id, { status: 'idle' });
      break;
    }

    // Resolve input — may be null if branch was not taken
    const input = resolveInput(node.id, edges, context);

    if (input === null) {
      // Branch not taken — mark as skipped, propagate null
      onNodeUpdate(node.id, { status: 'skipped', output: 'Skipped — branch not taken' });
      context.set(node.id, null);
      continue;
    }

    onNodeUpdate(node.id, { status: 'running', output: null });

    try {
      await executeNode(node, input, context);

      const output = context.get(node.id) ?? null;
      if (node.type === 'conditionNode') {
        const cfg = node.data.config as ConditionConfig;
        const trueVal = context.get(`${node.id}:true`);
        const branched = trueVal != null;
        onNodeUpdate(node.id, {
          status: 'done',
          output: `If "${cfg.keyword}": ${branched ? 'TRUE' : 'FALSE'} branch taken`,
        });
      } else {
        onNodeUpdate(node.id, { status: 'done', output });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onNodeUpdate(node.id, { status: 'error', output: message });
      context.set(node.id, null);
      return { success: false, durationMs: Date.now() - startTime };
    }
  }

  return { success: !abortRequested, durationMs: Date.now() - startTime };
}
