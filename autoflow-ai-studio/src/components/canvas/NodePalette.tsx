import { motion } from 'framer-motion';
import { NODE_DEFINITIONS } from '../../constants/nodeRegistry';
import {
  Type, Wand2, Sparkles, PenLine, Timer, LayoutList,
  GitBranch, BrainCircuit, Languages,
} from 'lucide-react';
import type { NodeType } from '../../types/workflow';

const ICONS: Record<string, React.ReactNode> = {
  Type: <Type size={16} />,
  Wand2: <Wand2 size={16} />,
  Sparkles: <Sparkles size={16} />,
  PenLine: <PenLine size={16} />,
  Timer: <Timer size={16} />,
  LayoutList: <LayoutList size={16} />,
  GitBranch: <GitBranch size={16} />,
  BrainCircuit: <BrainCircuit size={16} />,
  Languages: <Languages size={16} />,
};

interface DraggableNodeProps {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  icon: string;
  index: number;
}

function DraggableNode({ type, label, description, color, icon, index }: DraggableNodeProps) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      draggable
      onDragStart={onDragStart}
      className="group flex items-start gap-3 p-3 rounded-xl bg-[#0C0C1A] border border-[#1E1E30] hover:border-[#2E2E50] cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-[#12121E] select-none"
    >
      <div
        className="mt-0.5 p-1.5 rounded-lg shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {ICONS[icon]}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{description}</p>
      </div>
    </motion.div>
  );
}

export function NodePalette() {
  return (
    <div className="w-60 shrink-0 flex flex-col bg-[#08080F] border-r border-[#1E1E30] overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-[#1E1E30]">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nodes</h3>
        <p className="text-[10px] text-slate-600 mt-1">Drag onto canvas · Double-click canvas to quick-add</p>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {NODE_DEFINITIONS.map((def, i) => (
          <DraggableNode key={def.type} {...def} index={i} />
        ))}
      </div>
    </div>
  );
}
