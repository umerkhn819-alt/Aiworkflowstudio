import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

/**
 * Debounced auto-save: persists current workflow to localStorage
 * 800ms after any change to nodes/edges/name.
 */
export function useWorkflowStorage() {
  const { nodes, edges, workflowName, isDirty, persistWorkflow } = useWorkflowStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persistWorkflow();
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges, workflowName, isDirty, persistWorkflow]);
}
