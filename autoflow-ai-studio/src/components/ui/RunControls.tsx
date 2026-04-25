import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useExecution } from '../../hooks/useExecution';
import { showToast } from './Toast';

export function RunControls() {
  const { run, stop, reset, isRunning } = useExecution();

  const handleRun = async () => {
    const result = await run();
    if (!result) return;
    if ('error' in result && result.error) {
      showToast('error', result.error);
    } else if (result.success) {
      showToast('success', `Workflow completed in ${(result.durationMs / 1000).toFixed(1)}s`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isRunning ? (
          <motion.button
            key="stop"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={stop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 text-sm font-medium transition-all"
          >
            <Square size={14} fill="currentColor" />
            Stop
          </motion.button>
        ) : (
          <motion.button
            key="run"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium shadow-lg shadow-violet-900/40 transition-all"
          >
            <Play size={14} fill="currentColor" />
            Run
          </motion.button>
        )}
      </AnimatePresence>

      <button
        onClick={reset}
        disabled={isRunning}
        title="Reset node outputs"
        className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all disabled:opacity-30"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  );
}
