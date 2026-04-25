import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData, ConditionConfig } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();
  const config = nodeData.config as ConditionConfig;

  const update = (patch: Partial<ConditionConfig>) => {
    updateNodeData(id, { config: { ...config, ...patch } });
  };

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#06B6D4"
      label="Condition"
      icon={<GitBranch size={14} />}
      selected={selected}
    >
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-[10px] text-slate-500 mb-1 block">If input contains</label>
          <input
            type="text"
            value={config.keyword ?? ''}
            onChange={(e) => update({ keyword: e.target.value })}
            placeholder="keyword..."
            disabled={isRunning}
            className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.caseSensitive ?? false}
            onChange={(e) => update({ caseSensitive: e.target.checked })}
            disabled={isRunning}
            className="w-3 h-3 accent-cyan-500"
          />
          <span className="text-[10px] text-slate-500">Case sensitive</span>
        </label>
      </div>

      {/* Branch labels */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[10px] font-medium text-emerald-400">TRUE</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[10px] font-medium text-red-400">FALSE</span>
          <div className="w-2 h-2 rounded-full bg-red-400" />
        </div>
      </div>

      <NodeOutput status={nodeData.status} output={nodeData.output} />

      <Handle type="target" position={Position.Left} className="!left-[-6px]" />
      {/* True handle — top right */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '55%', right: -6 }}
        className="!bg-emerald-500 !border-emerald-400"
      />
      {/* False handle — bottom right */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '75%', right: -6 }}
        className="!bg-red-500 !border-red-400"
      />
    </NodeWrapper>
  );
}
