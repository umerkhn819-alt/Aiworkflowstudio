import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadWorkflows, deleteWorkflow, saveWorkflow } from '../lib/storage';
import type { Workflow, WorkflowNode } from '../types/workflow';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Zap, Trash2, ArrowRight, GitBranch, Clock, Layers, Sparkles, Wand2, Timer, Cpu, Upload, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { showToast } from '../components/ui/Toast';
import { STARTER_TEMPLATES, buildWorkflowFromTemplate } from '../constants/starterTemplates';
import type { TemplateCategory } from '../constants/starterTemplates';

interface WorkflowsProps {
  onOpenWorkflow: (id: string) => void;
  onNavigateHome: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const CATEGORY_ICONS: Record<TemplateCategory, React.ReactNode> = {
  AI: <Sparkles size={13} />,
  Transform: <Wand2 size={13} />,
  Demo: <Timer size={13} />,
  Advanced: <Cpu size={13} />,
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  AI: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Transform: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Demo: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Advanced: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

const COMPLEXITY_COLORS = {
  Simple: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const ALL_CATEGORIES: Array<'All' | TemplateCategory> = ['All', 'AI', 'Transform', 'Demo', 'Advanced'];

function isValidWorkflowFile(data: unknown): data is Workflow {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.name === 'string' &&
    Array.isArray(o.nodes) &&
    Array.isArray(o.edges)
  );
}

export function Workflows({ onOpenWorkflow, onNavigateHome }: WorkflowsProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | TemplateCategory>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setWorkflows(loadWorkflows());
  useEffect(() => { refresh(); }, []);

  const handleCreate = () => {
    const wf: Workflow = {
      id: uuidv4(),
      name: 'Untitled Workflow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    };
    saveWorkflow(wf);
    onOpenWorkflow(wf.id);
  };

  const handleFromTemplate = (templateId: string) => {
    const template = STARTER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const wf = buildWorkflowFromTemplate(template);
    saveWorkflow(wf);
    onOpenWorkflow(wf.id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleting(id);
    setTimeout(() => {
      deleteWorkflow(id);
      refresh();
      setDeleting(null);
    }, 300);
  };

  const handleRename = (e: React.MouseEvent, wf: Workflow) => {
    e.stopPropagation();
    const newName = prompt('Rename workflow:', wf.name);
    if (newName?.trim()) {
      saveWorkflow({ ...wf, name: newName.trim(), updatedAt: new Date().toISOString() });
      refresh();
    }
  };

  const handleDuplicate = (e: React.MouseEvent, wf: Workflow) => {
    e.stopPropagation();
    const now = new Date().toISOString();
    const copy: Workflow = {
      ...wf,
      id: uuidv4(),
      name: `Copy of ${wf.name}`,
      createdAt: now,
      updatedAt: now,
      nodes: wf.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', output: null, error: undefined },
      })) as WorkflowNode[],
    };
    saveWorkflow(copy);
    refresh();
    showToast('success', 'Workflow duplicated');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!isValidWorkflowFile(data)) {
          showToast('error', 'Invalid workflow JSON: need name, nodes, and edges');
          return;
        }
        const now = new Date().toISOString();
        const imported: Workflow = {
          id: uuidv4(),
          name: data.name,
          createdAt: now,
          updatedAt: now,
          nodes: (data.nodes as WorkflowNode[]).map((n) => ({
            ...n,
            data: { ...n.data, status: 'idle', output: null, error: undefined },
          })),
          edges: data.edges,
        };
        saveWorkflow(imported);
        showToast('success', 'Workflow imported');
        onOpenWorkflow(imported.id);
        refresh();
      } catch {
        showToast('error', 'Could not parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const filteredTemplates =
    activeCategory === 'All'
      ? STARTER_TEMPLATES
      : STARTER_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#08080F] flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex items-center px-6 border-b border-[#1E1E30]">
        <button onClick={onNavigateHome} className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-violet-600/20 group-hover:bg-violet-600/30 transition-colors">
            <Zap size={16} className="text-violet-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">AutoFlow AI Studio</span>
        </button>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* ── Your Workflows ── */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Your Workflows</h1>
            <p className="text-sm text-slate-500 mt-1">
              {workflows.length === 0
                ? 'No workflows yet — start from a template or create a blank one.'
                : `${workflows.length} workflow${workflows.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleImportClick} size="md">
              <Upload size={16} />
              Import JSON
            </Button>
            <Button onClick={handleCreate} size="md">
              <Plus size={16} />
              New Workflow
            </Button>
          </div>
        </div>

        {/* Workflow cards */}
        {workflows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            <AnimatePresence>
              {workflows.map((wf, i) => (
                <motion.div
                  key={wf.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: deleting === wf.id ? 0 : 1,
                    y: 0,
                    scale: deleting === wf.id ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onOpenWorkflow(wf.id)}
                  className="group relative flex flex-col p-5 rounded-2xl bg-[#12121E] border border-[#1E1E30] hover:border-[#2E2E50] cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center mb-4">
                    <GitBranch size={18} className="text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate pr-12">
                    {wf.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {wf.nodes.length} node{wf.nodes.length !== 1 ? 's' : ''} · {wf.edges.length} edge{wf.edges.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-600">
                    <Clock size={10} />
                    <span>Updated {timeAgo(wf.updatedAt)}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleRename(e, wf)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1E1E30] transition-all text-xs" title="Rename">
                      <span className="text-[11px]">✏️</span>
                    </button>
                    <button onClick={(e) => handleDuplicate(e, wf)} className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all" title="Duplicate">
                      <Copy size={13} />
                    </button>
                    <button onClick={(e) => handleDelete(e, wf.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400">
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Templates Section ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-slate-500" />
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {workflows.length === 0 ? 'Start from a template' : 'Add from template'}
            </h2>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#1E1E30] text-[10px] text-slate-500">
              {STARTER_TEMPLATES.length}
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-5">
            Each template opens directly in the Studio — fully wired and ready to run.
          </p>

          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-900/30'
                    : 'bg-[#0C0C1A] text-slate-500 border-[#1E1E30] hover:border-[#2E2E50] hover:text-slate-300'
                }`}
              >
                {cat !== 'All' && CATEGORY_ICONS[cat as TemplateCategory]}
                {cat}
                {cat !== 'All' && (
                  <span className="opacity-60">
                    {STARTER_TEMPLATES.filter((t) => t.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((tmpl, i) => {
                const isAdvanced = tmpl.complexity === 'Advanced';
                const isKiller = tmpl.tags.includes('Killer');
                return (
                  <motion.button
                    key={tmpl.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleFromTemplate(tmpl.id)}
                    className={`group text-left p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                      isKiller
                        ? 'bg-gradient-to-br from-[#0F1A2A] to-[#12121E] border-sky-500/25 hover:border-sky-500/60'
                        : isAdvanced
                        ? 'bg-gradient-to-br from-[#14102A] to-[#12121E] border-violet-500/20 hover:border-violet-500/50'
                        : 'bg-[#12121E] border-[#1E1E30] hover:border-[#2E2E50] hover:bg-[#14142A]'
                    }`}
                  >
                    {/* Killer glow */}
                    {isKiller && (
                      <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/6 rounded-full blur-3xl pointer-events-none" />
                    )}
                    {/* Advanced glow */}
                    {!isKiller && isAdvanced && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/8 rounded-full blur-2xl pointer-events-none" />
                    )}

                    {/* Top row: category + complexity badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${CATEGORY_COLORS[tmpl.category]}`}>
                        {CATEGORY_ICONS[tmpl.category]}
                        {tmpl.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${COMPLEXITY_COLORS[tmpl.complexity]}`}>
                        {tmpl.complexity}
                      </span>
                      {isKiller && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          ⚡ Demo
                        </span>
                      )}
                      {!isKiller && isAdvanced && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-600/20 text-violet-300 border border-violet-500/30">
                          ✦ Featured
                        </span>
                      )}
                    </div>

                    {/* Title + description */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className={`text-sm font-semibold transition-colors ${isAdvanced ? 'text-slate-100 group-hover:text-white' : 'text-slate-200 group-hover:text-white'}`}>
                          {tmpl.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {tmpl.description}
                        </p>
                      </div>
                      <ArrowRight size={15} className="text-slate-600 group-hover:text-violet-400 transition-colors shrink-0 mt-0.5" />
                    </div>

                    {/* Footer: node count + tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                        <GitBranch size={10} />
                        <span>{tmpl.nodeCount} nodes</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {tmpl.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-[#1A1A2E] text-[9px] text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
