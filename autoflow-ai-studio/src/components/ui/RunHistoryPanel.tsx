import { useState, useEffect } from 'react';
import { loadRunHistory } from '../../lib/storage';
import type { RunHistoryEntry } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';
import { History, CheckCircle2, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RunHistoryPanelProps {
  workflowId: string;
}

export function RunHistoryPanel({ workflowId }: RunHistoryPanelProps) {
  const [entries, setEntries] = useState<RunHistoryEntry[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { isRunning } = useWorkflowStore();

  useEffect(() => {
    setEntries(loadRunHistory(workflowId));
  }, [workflowId, isRunning]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`shrink-0 flex flex-col border-l border-[#1E1E30] bg-[#08080F] transition-all duration-300 ${collapsed ? 'w-10' : 'w-64'}`}>
      {/* Header */}
      <div className="h-10 flex items-center px-3 border-b border-[#1E1E30] gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
        {!collapsed && (
          <>
            <History size={13} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Run History</span>
          </>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
          >
            {entries.length === 0 ? (
              <p className="text-[10px] text-slate-600 italic text-center mt-4">No runs yet. Click Run to execute the workflow.</p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0C0C1A] border border-[#1E1E30]"
                >
                  {entry.status === 'success' ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={13} className="text-red-400 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">{formatTime(entry.ranAt)}</p>
                    <p className="text-[10px] text-slate-600">{(entry.durationMs / 1000).toFixed(1)}s · {entry.nodeCount} nodes</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
