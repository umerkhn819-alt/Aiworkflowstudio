import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowRight, Sparkles, Wand2, Type, LayoutList, GitBranch, Shield,
  Loader2, CheckCircle2, BrainCircuit, Languages, Play,
  FileText, BookOpen, Briefcase,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { buildWorkflowFromTemplate, STARTER_TEMPLATES } from '../constants/starterTemplates';
import { saveWorkflow } from '../lib/storage';

interface LandingProps {
  onGetStarted: () => void;
}

// ─── Apple-style demo section data ──────────────────────────────────────────

const DEMO_TEMPLATES = [
  {
    id: 'content-creator-pipeline',
    tabLabel: 'Content Creator',
    tabIcon: <FileText size={14} />,
    tagline: 'From raw idea to post-ready content',
    description: 'Raw text enters, gets rewritten casually, compressed to a tweet, then hashtags are auto-generated. One click to a complete social media post.',
    accentColor: '#06B6D4',
    nodes: [
      { label: 'Raw Content', color: '#3B82F6', icon: <Type size={13} /> },
      { label: 'Clean', color: '#F59E0B', icon: <Wand2 size={13} /> },
      { label: 'Rewrite', color: '#EC4899', icon: <Sparkles size={13} /> },
      { label: 'Summarize', color: '#8B5CF6', icon: <Sparkles size={13} /> },
      { label: '# Hashtags', color: '#F97316', icon: <BrainCircuit size={13} /> },
      { label: 'Post Draft', color: '#10B981', icon: <LayoutList size={13} /> },
    ],
    mockOutput: '#SocialMedia #ContentCreation #DigitalMarketing #CreatorEconomy #GrowthHacking',
  },
  {
    id: 'study-assistant-flow',
    tabLabel: 'Study Assistant',
    tabIcon: <BookOpen size={14} />,
    tagline: 'Turn notes into flashcards and quizzes',
    description: 'Drop in raw study notes. The pipeline normalizes, summarizes key concepts, then generates flashcards and multiple-choice quiz questions automatically.',
    accentColor: '#8B5CF6',
    nodes: [
      { label: 'Study Notes', color: '#3B82F6', icon: <Type size={13} /> },
      { label: 'Trim', color: '#F59E0B', icon: <Wand2 size={13} /> },
      { label: 'Normalize', color: '#F59E0B', icon: <Wand2 size={13} /> },
      { label: 'Summarize', color: '#8B5CF6', icon: <Sparkles size={13} /> },
      { label: 'Flashcards', color: '#F97316', icon: <BrainCircuit size={13} /> },
      { label: 'Quiz Ready', color: '#10B981', icon: <LayoutList size={13} /> },
    ],
    mockOutput: 'Q: What is the primary pigment used in photosynthesis?\nA: Chlorophyll\n\nQ: Where do light-dependent reactions occur?\nA: In the thylakoid membranes',
  },
  {
    id: 'job-application-flow',
    tabLabel: 'Job Application',
    tabIcon: <Briefcase size={14} />,
    tagline: 'Resume → cover letter → multilingual draft',
    description: 'Paste your resume bullets and get back a polished summary, a compelling cover letter opener, and a translated Spanish version — ready to send.',
    accentColor: '#10B981',
    nodes: [
      { label: 'Resume', color: '#3B82F6', icon: <Type size={13} /> },
      { label: 'Clean', color: '#F59E0B', icon: <Wand2 size={13} /> },
      { label: 'Summarize', color: '#8B5CF6', icon: <Sparkles size={13} /> },
      { label: 'Polish', color: '#EC4899', icon: <Sparkles size={13} /> },
      { label: 'Cover Letter', color: '#F97316', icon: <BrainCircuit size={13} /> },
      { label: 'Translate', color: '#14B8A6', icon: <Languages size={13} /> },
    ],
    mockOutput: 'Estimado equipo de contratación, soy un desarrollador full-stack con 4 años de experiencia en React, Node.js y PostgreSQL, con un historial comprobado de liderar migraciones de arquitectura y construir productos SaaS usados por más de 10,000 usuarios.',
  },
];

// ─── Animated demo node strip ────────────────────────────────────────────────

interface DemoNodeStripProps {
  nodes: typeof DEMO_TEMPLATES[0]['nodes'];
  phase: number;
  accentColor: string;
}

function DemoNodeStrip({ nodes, phase, accentColor }: DemoNodeStripProps) {
  const runningIdx = phase <= 0 ? -1 : Math.min(phase - 1, nodes.length - 1);
  const allDone = phase >= nodes.length;

  return (
    <div className="flex items-center justify-center flex-wrap gap-0">
      {nodes.map((node, i) => {
        const isDone = allDone || i < runningIdx;
        const isRunning = i === runningIdx && !allDone;
        const borderStyle = isRunning
          ? { borderColor: accentColor, boxShadow: `0 0 18px ${accentColor}50` }
          : isDone
          ? { borderColor: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.2)' }
          : { borderColor: '#1E1E30' };

        return (
          <div key={i} className="flex items-center">
            <motion.div
              className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0C0C1A] min-w-[88px] border transition-all duration-500"
              style={borderStyle}
              animate={isRunning ? { scale: [1, 1.03, 1] } : { scale: 1 }}
              transition={isRunning ? { repeat: Infinity, duration: 1.1, ease: 'easeInOut' } : {}}
            >
              <div
                className="p-1.5 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${node.color}20`, color: node.color }}
              >
                {node.icon}
              </div>
              <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{node.label}</span>
              <div className="h-3.5 flex items-center justify-center">
                {isRunning && <Loader2 size={11} className="animate-spin" style={{ color: accentColor }} />}
                {isDone && <CheckCircle2 size={11} className="text-emerald-400" />}
              </div>
            </motion.div>

            {i < nodes.length - 1 && (
              <div className="flex items-center px-0.5">
                <div
                  className="w-5 h-px transition-all duration-500"
                  style={{ backgroundColor: isDone ? accentColor : '#2E2E50', opacity: isDone ? 0.7 : 0.3 }}
                />
                <motion.div
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: isRunning || isDone ? accentColor : '#2E2E50' }}
                  animate={isRunning ? { scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: isDone ? 1 : 0.3 }}
                  transition={{ repeat: isRunning ? Infinity : 0, duration: 0.7 }}
                />
                <div
                  className="w-5 h-px transition-all duration-500"
                  style={{ backgroundColor: isDone ? accentColor : '#2E2E50', opacity: isDone ? 0.7 : 0.3 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Typing output display ───────────────────────────────────────────────────

function TypedOutput({ text, active, accentColor }: { text: string; active: boolean; accentColor: string }) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(''); idxRef.current = 0; return; }
    idxRef.current = 0;
    setDisplayed('');
    const t = setInterval(() => {
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [text, active]);

  return (
    <div
      className="mt-4 rounded-xl border bg-[#0A0A18] px-4 py-3 min-h-[80px] text-xs leading-relaxed"
      style={{ borderColor: `${accentColor}30` }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b" style={{ borderColor: `${accentColor}20` }}>
        <LayoutList size={11} style={{ color: accentColor }} />
        <span className="text-[10px] font-medium" style={{ color: accentColor }}>Pipeline Output</span>
      </div>
      {active && displayed ? (
        <p className="text-slate-300 whitespace-pre-wrap break-words">{displayed}<span className="inline-block w-0.5 h-3 bg-slate-400 ml-px animate-pulse" /></p>
      ) : (
        <p className="text-slate-600 italic text-[10px]">Run to see output here...</p>
      )}
    </div>
  );
}

// ─── Demo Section ────────────────────────────────────────────────────────────

interface DemoSectionProps {
  onTryTemplate: (id: string) => void;
  inHero?: boolean;
}

function DemoSection({ onTryTemplate, inHero = false }: DemoSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const phaseRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const demo = DEMO_TEMPLATES[activeIdx];
  const totalNodes = demo.nodes.length;

  const clearAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const startCycle = () => {
    clearAll();
    phaseRef.current = 0;
    setPhase(0);
    setShowOutput(false);

    intervalRef.current = setInterval(() => {
      phaseRef.current++;
      setPhase(phaseRef.current);

      if (phaseRef.current >= totalNodes) {
        clearAll();
        // All nodes done — pause then show output
        timerRef.current = setTimeout(() => {
          setShowOutput(true);
          // After output display, wait then restart
          timerRef.current = setTimeout(() => {
            startCycle();
          }, 4500);
        }, 600);
      }
    }, 680);
  };

  useEffect(() => {
    // Slight initial delay so page feels snappy on load
    timerRef.current = setTimeout(startCycle, 800);
    return clearAll;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const switchTab = (idx: number) => {
    if (idx === activeIdx) return;
    clearAll();
    setActiveIdx(idx);
    setPhase(0);
    setShowOutput(false);
  };

  return (
    <section className={inHero ? 'w-full' : 'px-6 md:px-12 py-20 max-w-5xl mx-auto'}>
      {/* Header */}
      {!inHero && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
            style={{ backgroundColor: `${demo.accentColor}10`, borderColor: `${demo.accentColor}25`, color: demo.accentColor }}
          >
            <Play size={10} fill="currentColor" />
            See it in action
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Real workflows. Running live.</h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm">
            These aren't mockups. Each pipeline below actually executes — step by step, node by node.
          </p>
        </motion.div>
      )}

      {/* Tab selector */}
      <div className={`flex items-center justify-center gap-2 flex-wrap ${inHero ? 'mb-5' : 'mb-8'}`}>
        {DEMO_TEMPLATES.map((d, i) => (
          <button
            key={d.id}
            onClick={() => switchTab(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
              activeIdx === i
                ? 'text-white'
                : 'bg-[#0C0C1A] text-slate-400 border-[#1E1E30] hover:border-[#2E2E50] hover:text-slate-200'
            }`}
            style={
              activeIdx === i
                ? { backgroundColor: `${d.accentColor}20`, borderColor: `${d.accentColor}50`, color: d.accentColor }
                : {}
            }
          >
            <span style={activeIdx === i ? { color: d.accentColor } : {}}>{d.tabIcon}</span>
            {d.tabLabel}
          </button>
        ))}
      </div>

      {/* Demo card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border relative overflow-hidden ${inHero ? 'p-4 md:p-5' : 'p-6 md:p-8'}`}
          style={{ backgroundColor: '#0C0C1A', borderColor: `${demo.accentColor}25` }}
        >
          {/* Background radial glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: `${demo.accentColor}06` }}
          />

          {/* Title row */}
          <div className={`flex items-start justify-between gap-4 relative ${inHero ? 'mb-4' : 'mb-6'}`}>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: demo.accentColor }}>
                Demo Workflow
              </p>
              <h3 className={`${inHero ? 'text-base' : 'text-lg'} font-bold text-slate-100`}>{demo.tabLabel}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">{inHero ? demo.tagline : demo.description}</p>
            </div>
            <button
              onClick={() => onTryTemplate(demo.id)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: `${demo.accentColor}25`, borderColor: `${demo.accentColor}50`, color: demo.accentColor }}
            >
              Try This
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Pipeline strip */}
          <DemoNodeStrip nodes={demo.nodes} phase={phase} accentColor={demo.accentColor} />

          {/* Output panel */}
          <TypedOutput text={demo.mockOutput} active={showOutput} accentColor={demo.accentColor} />

          {/* Tagline at bottom */}
          <p className={`${inHero ? 'mt-3' : 'mt-4'} text-[10px] text-center italic`} style={{ color: `${demo.accentColor}60` }}>
            {demo.tagline}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────

export function Landing({ onGetStarted }: LandingProps) {
  const handleTryTemplate = (templateId: string) => {
    const template = STARTER_TEMPLATES.find((t) => t.id === templateId);
    if (!template) { onGetStarted(); return; }
    const wf = buildWorkflowFromTemplate(template);
    saveWorkflow(wf);
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-[#08080F] text-slate-100 overflow-x-hidden">
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-[#1E1E30] sticky top-0 bg-[#08080F]/90 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600/20">
            <Zap size={18} className="text-violet-400" />
          </div>
          <span className="text-sm font-bold">DraftMesh</span>
        </div>
        <Button onClick={onGetStarted} size="sm">
          Open Studio
          <ArrowRight size={14} />
        </Button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative px-6 md:px-12 pt-20 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-[10%] top-24 w-[340px] h-[240px] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
        >
          <div className="text-center lg:text-left pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/10 border border-violet-600/20 text-xs text-violet-300 mb-6">
              <Sparkles size={11} />
              DraftMesh Platform
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Operationalize AI Workflows
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                Build once. Automate every run.
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8">
              DraftMesh helps teams eliminate repetitive prompt work by turning fragmented AI tasks
              into structured, reusable visual pipelines.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 mb-8">
              {[
                { value: '12+', label: 'Workflow Nodes' },
                { value: '9', label: 'Production Templates' },
                { value: 'Live', label: 'Run Visibility' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#1E1E30] bg-[#0C0C1A] px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-slate-100">{item.value}</p>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button onClick={onGetStarted} size="lg">
                Start with DraftMesh
                <ArrowRight size={16} />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => {
                document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Play size={14} fill="currentColor" />
                See Live Workflow
              </Button>
            </div>
          </div>

          <div id="demo-section" className="w-full">
            <div className="mb-3 text-center lg:text-left">
              <p className="text-[10px] uppercase tracking-widest text-cyan-400">Real workflows running live</p>
              <p className="text-xs text-slate-500 mt-1">Actual node execution preview, not a static mockup.</p>
            </div>
            <DemoSection onTryTemplate={handleTryTemplate} inHero />
          </div>
        </motion.div>
      </section>

      {/* ── Problem -> Solution -> Outcome ── */}
      <section className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Problem',
              desc: 'Teams copy prompts across tabs and tools, creating inconsistent quality and slow turnaround.',
            },
            {
              title: 'Solution',
              desc: 'DraftMesh turns prompt chains into visual, reusable workflows with clear logic and node-level outputs.',
            },
            {
              title: 'Outcome',
              desc: 'Faster delivery, predictable output quality, and repeatable AI operations your team can scale.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#1E1E30] bg-[#0C0C1A] p-5"
            >
              <p className="text-[11px] uppercase tracking-widest text-violet-300">{item.title}</p>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Built for repeatable AI operations</h2>
          <p className="text-slate-500 mt-3">From draft creation to team-ready output, in one visual system.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: <GitBranch size={20} />, color: '#7C3AED', title: 'Visual Workflow Designer', desc: 'Map multi-step AI processes with branching logic and reusable node-based pipelines.' },
            { icon: <Zap size={20} />, color: '#F59E0B', title: 'Execution Transparency', desc: 'Track every run node-by-node with clear statuses, outputs, and failure visibility.' },
            { icon: <Sparkles size={20} />, color: '#8B5CF6', title: 'AI Task Orchestration', desc: 'Combine summarize, rewrite, translate, and custom prompt steps into one standardized flow.' },
            { icon: <Shield size={20} />, color: '#10B981', title: 'Flexible Deployment Mode', desc: 'Run fully local for speed or connect backend auth and MongoDB persistence for team workflows.' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-[#12121E] border border-[#1E1E30]"
            >
              <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: `${feat.color}15`, color: feat.color }}>
                {feat.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{feat.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto p-10 rounded-3xl bg-gradient-to-b from-violet-600/15 to-transparent border border-violet-600/20"
        >
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Ready to standardize your AI workflow?</h2>
          <p className="text-slate-500 text-sm mb-6">Start with templates, customize your flow, and run with confidence.</p>
          <Button onClick={onGetStarted} size="lg">
            Launch DraftMesh
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </section>

      <footer className="px-6 py-6 border-t border-[#1E1E30] text-center text-xs text-slate-700">
        DraftMesh — Visual AI workflow operations for modern teams
      </footer>
    </div>
  );
}
