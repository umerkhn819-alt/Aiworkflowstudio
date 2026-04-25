import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData, AIConfig } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { Sparkles, PenLine, Zap } from 'lucide-react';

interface AINodeProps extends NodeProps {
  mode: 'summarize' | 'rewrite';
}

export function AINode({ id, data, selected, mode }: AINodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();
  const config = nodeData.config as AIConfig;

  const update = (patch: Partial<AIConfig>) => {
    updateNodeData(id, { config: { ...config, ...patch, mode } });
  };

  const isSummarize = mode === 'summarize';

  return (
    <NodeWrapper
      status={nodeData.status}
      color={isSummarize ? '#8B5CF6' : '#EC4899'}
      label={isSummarize ? 'AI Summarize' : 'AI Rewrite'}
      icon={isSummarize ? <Sparkles size={14} /> : <PenLine size={14} />}
      selected={selected}
    >
      <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
        <Zap size={11} className="text-emerald-400" />
        <span className="text-[10px] text-emerald-400">Backend AI (mock fallback)</span>
      </div>

      {isSummarize ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 shrink-0">Max words</label>
          <input
            type="number"
            value={config.maxWords ?? 50}
            onChange={(e) => update({ maxWords: parseInt(e.target.value) || 50 })}
            min={10}
            max={300}
            disabled={isRunning}
            className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 disabled:opacity-60"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 shrink-0">Tone</label>
          <select
            value={config.tone ?? 'professional'}
            onChange={(e) => update({ tone: e.target.value })}
            disabled={isRunning}
            className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 disabled:opacity-60"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="persuasive">Persuasive</option>
            <option value="creative">Creative</option>
            <option value="formal">Formal</option>
          </select>
        </div>
      )}

      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle type="target" position={Position.Left} className="!left-[-6px]" />
      <Handle type="source" position={Position.Right} className="!right-[-6px]" />
    </NodeWrapper>
  );
}

export function AISummarizeNode(props: NodeProps) {
  return <AINode {...props} mode="summarize" />;
}

export function AIRewriteNode(props: NodeProps) {
  return <AINode {...props} mode="rewrite" />;
}
