import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData } from '../../types/workflow';
import { NodeWrapper } from './NodeWrapper';
import { NodeOutput } from './NodeOutput';
import { LayoutList } from 'lucide-react';

export function OutputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;

  return (
    <NodeWrapper
      status={nodeData.status}
      color="#10B981"
      label="Output"
      icon={<LayoutList size={14} />}
      selected={selected}
    >
      {nodeData.status === 'idle' && (
        <p className="text-xs text-slate-600 italic">Results will appear here after running.</p>
      )}
      <NodeOutput status={nodeData.status} output={nodeData.output} />
      <Handle
        type="target"
        position={Position.Left}
        className="!left-[-6px]"
      />
    </NodeWrapper>
  );
}
