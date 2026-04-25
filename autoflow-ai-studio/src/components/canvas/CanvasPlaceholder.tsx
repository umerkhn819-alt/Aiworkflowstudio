import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';

export function CanvasPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none"
    >
      <div className="flex flex-col items-center gap-3 text-center max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#12121E] border border-[#1E1E30] flex items-center justify-center">
          <MousePointerClick size={24} className="text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Drop nodes here</p>
          <p className="text-xs text-slate-700 mt-1">
            Drag nodes from the left panel onto the canvas, then connect them to build a pipeline.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
