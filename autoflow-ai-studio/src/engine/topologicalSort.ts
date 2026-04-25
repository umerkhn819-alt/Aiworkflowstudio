import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

/**
 * Kahn's algorithm BFS-based topological sort.
 * Returns nodes in execution order.
 * Throws if a cycle is detected.
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const nodeMap = new Map<string, WorkflowNode>(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: WorkflowNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodeMap.get(current);
    if (node) sorted.push(node);

    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error('Workflow contains a cycle. Please remove circular connections.');
  }

  return sorted;
}

/**
 * Given a target node, find the source node id(s) feeding into it.
 */
export function getSourceNodeIds(nodeId: string, edges: WorkflowEdge[]): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source);
}

/**
 * Given a target node, return the full edges feeding into it (needed for handle-aware input resolution).
 */
export function getSourceEdges(nodeId: string, edges: WorkflowEdge[]): WorkflowEdge[] {
  return edges.filter((e) => e.target === nodeId);
}
