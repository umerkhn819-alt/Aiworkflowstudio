import type { Workflow } from '../types/workflow';

export function encodeWorkflow(workflow: Workflow): string {
  const clean: Workflow = {
    ...workflow,
    nodes: workflow.nodes.map((n) => ({
      ...n,
      data: { ...n.data, status: 'idle', output: null, error: undefined },
    })),
  };
  const json = JSON.stringify(clean);
  const encoded = btoa(encodeURIComponent(json));
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('wf', encoded);
  return url.toString();
}

export function decodeWorkflow(param: string): Workflow | null {
  try {
    const json = decodeURIComponent(atob(param));
    const wf = JSON.parse(json) as Workflow;
    if (!wf.id || !wf.name || !Array.isArray(wf.nodes) || !Array.isArray(wf.edges)) {
      return null;
    }
    return wf;
  } catch {
    return null;
  }
}
