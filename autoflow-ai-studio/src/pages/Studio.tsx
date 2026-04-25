import { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { TopBar } from '../components/layout/TopBar';
import { NodePalette } from '../components/canvas/NodePalette';
import { WorkflowCanvas } from '../components/canvas/WorkflowCanvas';
import { RunHistoryPanel } from '../components/ui/RunHistoryPanel';

interface StudioProps {
  workflowId: string;
  onNavigateBack: () => void;
}

export function Studio({ workflowId, onNavigateBack }: StudioProps) {
  const { loadFromStorage } = useWorkflowStore();

  useEffect(() => {
    loadFromStorage(workflowId);
  }, [workflowId, loadFromStorage]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#08080F]">
      <TopBar onNavigateBack={onNavigateBack} />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <WorkflowCanvas />
        <RunHistoryPanel workflowId={workflowId} />
      </div>
    </div>
  );
}
