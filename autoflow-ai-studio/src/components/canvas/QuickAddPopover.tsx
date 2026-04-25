import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { NODE_DEFINITIONS } from '../../constants/nodeRegistry';
import { Type, Wand2, Sparkles, PenLine, Timer, LayoutList, GitBranch, BrainCircuit, Languages } from 'lucide-react';
import type { NodeType } from '../../types/workflow';

const ICONS: Record<string, React.ReactNode> = {
  Type: <Type size={13} />,
  Wand2: <Wand2 size={13} />,
  Sparkles: <Sparkles size={13} />,
  PenLine: <PenLine size={13} />,
  Timer: <Timer size={13} />,
  LayoutList: <LayoutList size={13} />,
  GitBranch: <GitBranch size={13} />,
  BrainCircuit: <BrainCircuit size={13} />,
  Languages: <Languages size={13} />,
};

interface QuickAddPopoverProps {
  x: number;
  y: number;
  onSelect: (type: NodeType) => void;
  onClose: () => void;
}

export function QuickAddPopover({ x, y, onSelect, onClose }: QuickAddPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Clamp to viewport
  const POPOVER_W = 200;
  const POPOVER_H = NODE_DEFINITIONS.length * 34 + 44;
  const left = Math.min(x + 8, window.innerWidth - POPOVER_W - 12);
  const top = Math.min(y + 8, window.innerHeight - POPOVER_H - 12);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.12 }}
        className="fixed z-50 w-48 bg-[#12121E] border border-[#2E2E50] rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        style={{ left, top }}
      >
        <div className="px-3 py-2 border-b border-[#1E1E30]">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Add Node</p>
        </div>
        <div className="py-1">
          {NODE_DEFINITIONS.map((def) => (
            <button
              key={def.type}
              onClick={() => onSelect(def.type)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#1E1E30] transition-colors text-left group"
            >
              <span
                className="p-1 rounded"
                style={{ backgroundColor: `${def.color}20`, color: def.color }}
              >
                {ICONS[def.icon]}
              </span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{def.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
