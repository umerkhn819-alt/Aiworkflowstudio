import { useState, useRef, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { RunControls } from '../ui/RunControls';
import { SettingsModal } from '../ui/SettingsModal';
import { loadWorkflow } from '../../lib/storage';
import { exportWorkflowAsJSON } from '../../lib/exportWorkflow';
import { encodeWorkflow } from '../../lib/shareWorkflow';
import { showToast } from '../ui/Toast';
import {
  Zap, Settings, ChevronLeft, Check, Pencil, Download, Link2, Undo2, Redo2,
} from 'lucide-react';

interface TopBarProps {
  onNavigateBack: () => void;
}

export function TopBar({ onNavigateBack }: TopBarProps) {
  const {
    workflowId,
    workflowName,
    setWorkflowName,
    isDirty,
    isRunning,
    nodes,
    edges,
    history,
    historyIndex,
    undo,
    redo,
    completedNodeCount,
  } = useWorkflowStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(workflowName);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const progress = nodes.length > 0 ? (completedNodeCount / nodes.length) * 100 : 0;

  useEffect(() => {
    setDraft(workflowName);
  }, [workflowName]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commitName = () => {
    const trimmed = draft.trim() || 'Untitled Workflow';
    setWorkflowName(trimmed);
    setDraft(trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') { setDraft(workflowName); setEditing(false); }
  };

  const handleExport = () => {
    if (!workflowId) return;
    const wf = loadWorkflow(workflowId);
    if (!wf) return;
    const current = { ...wf, name: workflowName, nodes, edges };
    exportWorkflowAsJSON(current);
    showToast('success', 'Workflow exported as JSON');
  };

  const handleShare = () => {
    if (!workflowId) return;
    const wf = loadWorkflow(workflowId);
    if (!wf) return;
    const current = { ...wf, name: workflowName, nodes, edges, updatedAt: new Date().toISOString() };
    const url = encodeWorkflow(current);
    navigator.clipboard.writeText(url).then(() => {
      showToast('success', 'Share link copied to clipboard');
    });
  };

  return (
    <>
      <header className="relative h-14 flex items-center px-4 gap-4 border-b border-[#1E1E30] bg-[#08080F] shrink-0 z-10">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-200 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Workflows</span>
          </button>

          <div className="w-px h-5 bg-[#1E1E30]" />

          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-violet-400" />
            <span className="text-sm font-semibold text-slate-100 hidden md:inline">AutoFlow</span>
          </div>
        </div>

        {/* Center — workflow name */}
        <div className="flex-1 flex items-center justify-center">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={handleKeyDown}
                className="bg-[#1E1E30] border border-violet-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 text-center focus:outline-none w-48"
              />
              <button onClick={commitName} className="text-violet-400 hover:text-violet-300">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setDraft(workflowName); setEditing(true); }}
              className="flex items-center gap-2 group px-3 py-1.5 rounded-lg hover:bg-[#1E1E30] transition-all"
            >
              <span className="text-sm font-medium text-slate-200">{workflowName}</span>
              <Pencil size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />}
            </button>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AI via Backend
          </div>

          <button
            onClick={undo}
            disabled={isRunning || !canUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={redo}
            disabled={isRunning || !canRedo}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <Redo2 size={15} />
          </button>

          <RunControls />

          <button
            onClick={handleShare}
            disabled={isRunning}
            title="Copy shareable link"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all disabled:opacity-30"
          >
            <Link2 size={15} />
          </button>

          <button
            onClick={handleExport}
            disabled={isRunning}
            title="Export workflow as JSON"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all disabled:opacity-30"
          >
            <Download size={15} />
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            disabled={isRunning}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all disabled:opacity-30"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Run progress bar */}
        {isRunning && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-violet-500 z-20 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        )}
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
