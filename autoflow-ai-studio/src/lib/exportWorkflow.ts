import type { Workflow } from '../types/workflow';

export function exportWorkflowAsJSON(workflow: Workflow): void {
  const clean: Workflow = {
    ...workflow,
    nodes: workflow.nodes.map((n) => ({
      ...n,
      data: { ...n.data, status: 'idle', output: null },
    })),
  };

  const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
