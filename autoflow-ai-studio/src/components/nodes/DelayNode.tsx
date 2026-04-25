import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData, DelayConfig } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { Timer } from 'lucide-react';

export function DelayNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();
  const config = nodeData.config as DelayConfig;

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#6B7280"
      label="Delay"
      icon={<Timer size={14} />}
      selected={selected}
    >
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 shrink-0">Wait</label>
        <input
          type="number"
          value={config.seconds ?? 2}
          onChange={(e) =>
            updateNodeData(id, {
              config: { seconds: parseFloat(e.target.value) || 1 },
            })
          }
          min={0.5}
          max={10}
          step={0.5}
          disabled={isRunning}
          className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gray-500 disabled:opacity-60"
        />
        <span className="text-xs text-slate-500 shrink-0">sec</span>
      </div>
      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle type="target" position={Position.Left} className="!left-[-6px]" />
      <Handle type="source" position={Position.Right} className="!right-[-6px]" />
    </NodeWrapper>
  );
}
