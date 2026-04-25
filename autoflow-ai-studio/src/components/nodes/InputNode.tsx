import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { useWorkflowStore } from '../../store/workflowStore';
import { Type } from 'lucide-react';

export function InputNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const { updateNodeData, isRunning } = useWorkflowStore();

  const config = nodeData.config as { value?: string; placeholder?: string };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {
      config: { ...config, value: e.target.value },
    });
  };

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#3B82F6"
      label="Input Text"
      icon={<Type size={14} />}
      selected={selected}
    >
      <textarea
        value={config.value ?? ''}
        onChange={handleChange}
        placeholder={config.placeholder ?? 'Enter your text here...'}
        disabled={isRunning}
        rows={3}
        className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none transition-colors disabled:opacity-60"
      />
      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle
        type="source"
        position={Position.Right}
        className="!right-[-6px]"
      />
    </NodeWrapper>
  );
}
