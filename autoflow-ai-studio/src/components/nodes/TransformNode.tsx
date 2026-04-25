import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData, TransformConfig } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { Wand2 } from 'lucide-react';

const OPERATIONS = [
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'trim', label: 'Trim whitespace' },
  { value: 'reverse', label: 'Reverse text' },
  { value: 'replace', label: 'Find & Replace' },
];

export function TransformNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();
  const config = nodeData.config as TransformConfig;

  const update = (patch: Partial<TransformConfig>) => {
    updateNodeData(id, { config: { ...config, ...patch } });
  };

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#F59E0B"
      label="Transform"
      icon={<Wand2 size={14} />}
      selected={selected}
    >
      <select
        value={config.operation}
        onChange={(e) => update({ operation: e.target.value as TransformConfig['operation'] })}
        disabled={isRunning}
        className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
      >
        {OPERATIONS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {config.operation === 'replace' && (
        <div className="mt-2 flex flex-col gap-1.5">
          <input
            type="text"
            value={config.find ?? ''}
            onChange={(e) => update({ find: e.target.value })}
            placeholder="Find..."
            disabled={isRunning}
            className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 disabled:opacity-60"
          />
          <input
            type="text"
            value={config.replace ?? ''}
            onChange={(e) => update({ replace: e.target.value })}
            placeholder="Replace with..."
            disabled={isRunning}
            className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 disabled:opacity-60"
          />
        </div>
      )}

      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle type="target" position={Position.Left} className="!left-[-6px]" />
      <Handle type="source" position={Position.Right} className="!right-[-6px]" />
    </NodeWrapper>
  );
}
