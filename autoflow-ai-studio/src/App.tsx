import { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Workflows } from './pages/Workflows';
import { Studio } from './pages/Studio';
import { ToastContainer, showToast } from './components/ui/Toast';
import { decodeWorkflow } from './lib/shareWorkflow';
import { saveWorkflow } from './lib/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Workflow, WorkflowNode } from './types/workflow';

type Page = 'landing' | 'workflows' | 'studio';

function normalizeSharedWorkflow(wf: Workflow): Workflow {
  const now = new Date().toISOString();
  return {
    ...wf,
    id: uuidv4(),
    name: wf.name || 'Shared Workflow',
    createdAt: now,
    updatedAt: now,
    nodes: (wf.nodes || []).map(
      (n: WorkflowNode) => ({
        ...n,
        data: { ...n.data, status: 'idle', output: null, error: undefined },
      })
    ) as WorkflowNode[],
    edges: wf.edges || [],
  };
}

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [sharedHandled, setSharedHandled] = useState(false);

  useEffect(() => {
    if (sharedHandled) return;
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const enc = params.get('wf');
      if (!enc) {
        setSharedHandled(true);
        return;
      }
      const decoded = decodeWorkflow(enc);
      if (!decoded) {
        showToast('error', 'Invalid or corrupted share link');
        setSharedHandled(true);
        return;
      }
      const toSave = normalizeSharedWorkflow(decoded);
      saveWorkflow(toSave);
      setActiveWorkflowId(toSave.id);
      setPage('studio');
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      setSharedHandled(true);
      showToast('success', 'Shared workflow opened');
    }, 0);
    return () => clearTimeout(t);
  }, [sharedHandled]);

  const openWorkflow = (id: string) => {
    setActiveWorkflowId(id);
    setPage('studio');
  };

  return (
    <>
      {page === 'landing' && (
        <Landing onGetStarted={() => setPage('workflows')} />
      )}
      {page === 'workflows' && (
        <Workflows
          onOpenWorkflow={openWorkflow}
          onNavigateHome={() => setPage('landing')}
        />
      )}
      {page === 'studio' && activeWorkflowId && (
        <Studio
          workflowId={activeWorkflowId}
          onNavigateBack={() => setPage('workflows')}
        />
      )}
      <ToastContainer />
    </>
  );
}
