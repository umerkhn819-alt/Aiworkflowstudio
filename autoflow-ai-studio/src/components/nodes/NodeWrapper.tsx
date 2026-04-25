import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { NodeStatus } from '../../types/workflow';
import { Loader2, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';

interface NodeWrapperProps {
  status: NodeStatus;
  color: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
  selected?: boolean;
}

export function NodeWrapper({ status, color, label, icon, children, selected }: NodeWrapperProps) {
  const statusClass = {
    idle: '',
    running: 'node-running',
    done: 'node-done',
    error: 'node-error',
    skipped: 'node-skipped',
  }[status];

  const statusIcon = {
    idle: null,
    running: <Loader2 size={13} className="animate-spin text-violet-400" />,
    done: <CheckCircle2 size={13} className="text-emerald-400" />,
    error: <AlertCircle size={13} className="text-red-400" />,
    skipped: <MinusCircle size={13} className="text-slate-500" />,
  }[status];

  const isSkipped = status === 'skipped';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: isSkipped ? 0.45 : 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`
        relative min-w-[220px] max-w-[260px] rounded-xl border
        bg-[#12121E] border-[#1E1E30]
        transition-all duration-300
        ${statusClass}
        ${selected ? 'border-violet-500 shadow-lg shadow-violet-900/30' : ''}
      `}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl border-b border-[#1E1E30]"
        style={{ borderTopColor: isSkipped ? '#374151' : color, borderTopWidth: 2 }}
      >
        <span style={{ color: isSkipped ? '#374151' : color }} className="flex items-center">{icon}</span>
        <span className="text-xs font-semibold text-slate-300 flex-1 truncate">{label}</span>
        {statusIcon && <span className="ml-auto">{statusIcon}</span>}
      </div>

      {/* Body */}
      <div className={`px-3 py-3 ${isSkipped ? 'opacity-50' : ''}`}>{children}</div>
    </motion.div>
  );
}
