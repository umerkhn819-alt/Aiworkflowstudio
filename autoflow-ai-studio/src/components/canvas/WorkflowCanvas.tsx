import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Connection, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { useWorkflowStore } from '../../store/workflowStore';
import { useWorkflowStorage } from '../../hooks/useWorkflowStorage';
import { NODE_DEF_MAP } from '../../constants/nodeRegistry';
import type { NodeType, WorkflowNode, WorkflowEdge } from '../../types/workflow';

import { InputNode } from '../nodes/InputNode';
import { OutputNode } from '../nodes/OutputNode';
import { TransformNode } from '../nodes/TransformNode';
import { AISummarizeNode, AIRewriteNode } from '../nodes/AINode';
import { DelayNode } from '../nodes/DelayNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { CustomAINode } from '../nodes/CustomAINode';
import { TranslateNode } from '../nodes/TranslateNode';
import { EdgeAnimated } from './EdgeAnimated';
import { CanvasPlaceholder } from './CanvasPlaceholder';
import { QuickAddPopover } from './QuickAddPopover';

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  transformNode: TransformNode,
  aiSummarizeNode: AISummarizeNode,
  aiRewriteNode: AIRewriteNode,
  aiCustomNode: CustomAINode,
  aiTranslateNode: TranslateNode,
  conditionNode: ConditionNode,
  delayNode: DelayNode,
};

const edgeTypes = {
  default: EdgeAnimated,
};

function WorkflowCanvasInner() {
  const { nodes, edges, setNodes, setEdges, addNode, isRunning, undo, redo } = useWorkflowStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [quickAdd, setQuickAdd] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);

  useWorkflowStorage();

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes as never) as unknown as WorkflowNode[], true);
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges as never) as unknown as WorkflowEdge[], true);
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const { edges: cur } = useWorkflowStore.getState();
      setEdges(addEdge(connection, cur as never) as unknown as WorkflowEdge[]);
    },
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const dropNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const def = NODE_DEF_MAP[type];
      if (!def) return;
      const newNode: WorkflowNode = {
        id: `n_${uuidv4()}`,
        type,
        position,
        data: {
          label: def.label,
          config: { ...def.defaultConfig },
          status: 'idle',
          output: null,
        },
      };
      addNode(newNode);
    },
    [addNode]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !NODE_DEF_MAP[type]) return;

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left - 100,
        y: e.clientY - rect.top - 40,
      };

      dropNode(type, position);
    },
    [dropNode]
  );

  const onPaneDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isRunning) return;
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setQuickAdd({ x: e.clientX, y: e.clientY, flowX: flowPos.x, flowY: flowPos.y });
    },
    [isRunning, screenToFlowPosition]
  );

  const handleQuickAdd = useCallback(
    (type: NodeType) => {
      if (!quickAdd) return;
      dropNode(type, { x: quickAdd.flowX - 110, y: quickAdd.flowY - 40 });
      setQuickAdd(null);
    },
    [quickAdd, dropNode]
  );

  return (
    <div ref={wrapperRef} className="flex-1 h-full relative">
      {nodes.length === 0 && <CanvasPlaceholder />}
      <ReactFlow
        nodes={nodes as never}
        edges={edges as never}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneContextMenu={(e) => e.preventDefault()}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={!isRunning}
        nodesConnectable={!isRunning}
        elementsSelectable={!isRunning}
        deleteKeyCode="Delete"
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        onPaneDoubleClick={onPaneDoubleClick}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1E1E30"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const def = NODE_DEF_MAP[(node.type as NodeType)];
            return def?.color ?? '#1E1E30';
          }}
          maskColor="rgba(8,8,15,0.8)"
          style={{ bottom: 16, right: 16 }}
        />
      </ReactFlow>

      {quickAdd && (
        <QuickAddPopover
          x={quickAdd.x}
          y={quickAdd.y}
          onSelect={handleQuickAdd}
          onClose={() => setQuickAdd(null)}
        />
      )}
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
