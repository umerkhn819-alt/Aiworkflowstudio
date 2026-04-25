import { BaseEdge, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';

export function EdgeAnimated({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const { isRunning } = useWorkflowStore();

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#7C3AED' : isRunning ? '#5B21B6' : '#2E2E50',
          strokeWidth: 2,
          transition: 'stroke 0.3s',
        }}
      />
      {/* Animated dash overlay during execution */}
      {isRunning && (
        <path
          d={edgePath}
          fill="none"
          stroke="#7C3AED"
          strokeWidth={2}
          strokeDasharray="8 12"
          strokeLinecap="round"
          opacity={0.8}
          style={{
            animation: 'dash-flow 1s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
}
