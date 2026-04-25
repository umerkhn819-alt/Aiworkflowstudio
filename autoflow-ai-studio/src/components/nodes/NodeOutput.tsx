import { useState } from 'react';
import type { NodeStatus } from '../../types/workflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface NodeOutputProps {
  status: NodeStatus;
  output: string | null;
}

export function NodeOutput({ status, output }: NodeOutputProps) {
  const [copied, setCopied] = useState(false);

  if (status === 'idle') return null;

  const bg = {
    running: 'bg-violet-500/5 border-violet-500/20',
    done: 'bg-emerald-500/5 border-emerald-500/20',
    error: 'bg-red-500/5 border-red-500/20',
    skipped: 'bg-slate-700/10 border-slate-700/20',
    idle: '',
  }[status];

  const textColor = {
    running: 'text-violet-300',
    done: 'text-emerald-200',
    error: 'text-red-300',
    skipped: 'text-slate-500',
    idle: '',
  }[status];

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`mt-2 rounded-lg border px-2.5 py-2 text-xs ${bg} ${textColor} overflow-hidden relative group`}
      >
        {status === 'running' ? (
          <span className="text-violet-400/70 italic">Processing...</span>
        ) : (
          <>
            <p className="line-clamp-4 break-words whitespace-pre-wrap pr-5">{output}</p>
            {status === 'done' && output && (
              <button
                onClick={handleCopy}
                className="absolute top-1.5 right-1.5 p-0.5 rounded text-emerald-500/50 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Copy to clipboard"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
              </button>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
