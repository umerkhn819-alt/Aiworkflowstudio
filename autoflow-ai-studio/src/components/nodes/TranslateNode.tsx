import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData, TranslateConfig } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { Languages, Zap } from 'lucide-react';

const LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Chinese', 'Arabic', 'Hindi', 'Korean', 'Russian', 'Dutch',
];

export function TranslateNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();
  const config = nodeData.config as TranslateConfig;

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#14B8A6"
      label="AI Translate"
      icon={<Languages size={14} />}
      selected={selected}
    >
      <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
        <Zap size={11} className="text-emerald-400" />
        <span className="text-[10px] text-emerald-400">Backend AI (mock fallback)</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 shrink-0">Translate to</label>
        <select
          value={config.targetLanguage ?? 'Spanish'}
          onChange={(e) =>
            updateNodeData(id, {
              config: { targetLanguage: e.target.value },
            })
          }
          disabled={isRunning}
          className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 disabled:opacity-60"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle type="target" position={Position.Left} className="!left-[-6px]" />
      <Handle type="source" position={Position.Right} className="!right-[-6px]" />
    </NodeWrapper>
  );
}
