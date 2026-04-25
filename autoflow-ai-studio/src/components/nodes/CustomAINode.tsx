import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData, CustomAIConfig } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { BrainCircuit, Zap } from 'lucide-react';

export function CustomAINode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();
  const config = nodeData.config as CustomAIConfig;

  const update = (patch: Partial<CustomAIConfig>) => {
    updateNodeData(id, { config: { ...config, ...patch } });
  };

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#F97316"
      label="AI Custom Prompt"
      icon={<BrainCircuit size={14} />}
      selected={selected}
    >
      <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
        <Zap size={11} className="text-emerald-400" />
        <span className="text-[10px] text-emerald-400">Backend AI (mock fallback)</span>
      </div>

      <div>
        <label className="text-[10px] text-slate-500 mb-1 block">System prompt</label>
        <textarea
          value={config.systemPrompt ?? ''}
          onChange={(e) => update({ systemPrompt: e.target.value })}
          placeholder="You are a helpful assistant. Respond in bullet points..."
          disabled={isRunning}
          rows={3}
          className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none transition-colors disabled:opacity-60"
        />
      </div>

      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle type="target" position={Position.Left} className="!left-[-6px]" />
      <Handle type="source" position={Position.Right} className="!right-[-6px]" />
    </NodeWrapper>
  );
}
