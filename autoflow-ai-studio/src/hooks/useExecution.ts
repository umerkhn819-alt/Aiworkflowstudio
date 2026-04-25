import { useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { runWorkflow, requestAbort } from '../engine/executor';
import { saveRunEntry } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

export function useExecution() {
  const {
    nodes,
    edges,
    workflowId,
    isRunning,
    setIsRunning,
    updateNodeData,
    resetNodeStatuses,
    persistWorkflow,
  } = useWorkflowStore();

  const run = useCallback(async () => {
    if (isRunning || !workflowId) return;

    resetNodeStatuses();
    setIsRunning(true);

    try {
      const result = await runWorkflow(nodes, edges, updateNodeData);

      saveRunEntry({
        id: uuidv4(),
        workflowId,
        ranAt: new Date().toISOString(),
        durationMs: result.durationMs,
        status: result.success ? 'success' : 'error',
        nodeCount: nodes.length,
      });

      persistWorkflow();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, workflowId, isRunning, setIsRunning, updateNodeData, resetNodeStatuses, persistWorkflow]);

  const stop = useCallback(() => {
    requestAbort();
    setIsRunning(false);
  }, [setIsRunning]);

  const reset = useCallback(() => {
    resetNodeStatuses();
  }, [resetNodeStatuses]);

  return { run, stop, reset, isRunning };
}
