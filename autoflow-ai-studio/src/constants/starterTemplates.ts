import type { Workflow } from '../types/workflow';
import { v4 as uuidv4 } from 'uuid';

export type TemplateCategory = 'AI' | 'Transform' | 'Demo' | 'Advanced';
export type TemplateComplexity = 'Simple' | 'Medium' | 'Advanced';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  complexity: TemplateComplexity;
  nodeCount: number;
  tags: string[];
  build: () => Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>;
}

export const STARTER_TEMPLATES: Template[] = [
  // ─── SIMPLE ──────────────────────────────────────────────────────────────
  {
    id: 'summarize-rewrite',
    name: 'Summarize & Rewrite',
    description: 'Condense any text with AI then rephrase it professionally.',
    category: 'AI',
    complexity: 'Simple',
    nodeCount: 4,
    tags: ['AI', 'Summarize', 'Rewrite'],
    build: () => ({
      name: 'Summarize & Rewrite',
      nodes: [
        { id: 'n1', type: 'inputNode', position: { x: 60, y: 180 }, data: { label: 'Input Text', config: { value: 'Artificial intelligence is transforming industries at an unprecedented pace. From healthcare to finance, AI-powered tools are automating complex tasks, reducing human error, and unlocking insights from vast datasets that were previously impossible to analyze.', placeholder: '' }, status: 'idle', output: null } },
        { id: 'n2', type: 'aiSummarizeNode', position: { x: 340, y: 180 }, data: { label: 'AI Summarize', config: { mode: 'summarize', maxWords: 40 }, status: 'idle', output: null } },
        { id: 'n3', type: 'aiRewriteNode', position: { x: 620, y: 180 }, data: { label: 'AI Rewrite', config: { mode: 'rewrite', tone: 'professional' }, status: 'idle', output: null } },
        { id: 'n4', type: 'outputNode', position: { x: 900, y: 180 }, data: { label: 'Output', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
      ],
    }),
  },

  {
    id: 'casual-to-formal',
    name: 'Casual → Formal',
    description: 'Instantly convert informal writing into a polished, formal tone.',
    category: 'AI',
    complexity: 'Simple',
    nodeCount: 3,
    tags: ['AI', 'Rewrite', 'Tone'],
    build: () => ({
      name: 'Casual → Formal',
      nodes: [
        { id: 'n1', type: 'inputNode', position: { x: 60, y: 200 }, data: { label: 'Input Text', config: { value: "hey so i was thinking we could maybe try to fix this bug asap because its kinda breaking stuff for users and they're getting pretty annoyed tbh", placeholder: '' }, status: 'idle', output: null } },
        { id: 'n2', type: 'aiRewriteNode', position: { x: 360, y: 200 }, data: { label: 'AI Rewrite — Formal', config: { mode: 'rewrite', tone: 'formal' }, status: 'idle', output: null } },
        { id: 'n3', type: 'outputNode', position: { x: 660, y: 200 }, data: { label: 'Output', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ],
    }),
  },

  // ─── MEDIUM ──────────────────────────────────────────────────────────────
  {
    id: 'data-cleaner',
    name: 'Data Cleaner',
    description: 'Trim whitespace, normalize case, and strip unwanted characters in sequence.',
    category: 'Transform',
    complexity: 'Simple',
    nodeCount: 5,
    tags: ['Transform', 'Clean', 'Text'],
    build: () => ({
      name: 'Data Cleaner',
      nodes: [
        { id: 'n1', type: 'inputNode', position: { x: 60, y: 200 }, data: { label: 'Raw Input', config: { value: '  Hello World!   This IS some   MESSY   text that NEEDS cleaning.  ', placeholder: '' }, status: 'idle', output: null } },
        { id: 'n2', type: 'transformNode', position: { x: 320, y: 200 }, data: { label: 'Trim Spaces', config: { operation: 'trim' }, status: 'idle', output: null } },
        { id: 'n3', type: 'transformNode', position: { x: 580, y: 200 }, data: { label: 'Lowercase', config: { operation: 'lowercase' }, status: 'idle', output: null } },
        { id: 'n4', type: 'transformNode', position: { x: 840, y: 200 }, data: { label: 'Find & Replace', config: { operation: 'replace', find: 'messy', replace: 'clean' }, status: 'idle', output: null } },
        { id: 'n5', type: 'outputNode', position: { x: 1100, y: 200 }, data: { label: 'Clean Output', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
      ],
    }),
  },

  {
    id: 'blog-polisher',
    name: 'Blog Post Polisher',
    description: 'Trim raw notes, summarize the key idea, then rewrite it as engaging content.',
    category: 'AI',
    complexity: 'Medium',
    nodeCount: 5,
    tags: ['AI', 'Blog', 'Content'],
    build: () => ({
      name: 'Blog Post Polisher',
      nodes: [
        { id: 'n1', type: 'inputNode', position: { x: 60, y: 220 }, data: { label: 'Raw Notes', config: { value: 'climate change is bad. temperatures rising. ice caps melting. sea levels up. extreme weather events more common. need renewable energy. solar and wind power growing. electric vehicles replacing gas cars. governments setting emission targets. individuals can reduce carbon footprint by eating less meat and flying less.', placeholder: '' }, status: 'idle', output: null } },
        { id: 'n2', type: 'transformNode', position: { x: 320, y: 220 }, data: { label: 'Trim', config: { operation: 'trim' }, status: 'idle', output: null } },
        { id: 'n3', type: 'aiSummarizeNode', position: { x: 580, y: 140 }, data: { label: 'AI Summarize', config: { mode: 'summarize', maxWords: 60 }, status: 'idle', output: null } },
        { id: 'n4', type: 'aiRewriteNode', position: { x: 840, y: 140 }, data: { label: 'AI Rewrite — Creative', config: { mode: 'rewrite', tone: 'creative' }, status: 'idle', output: null } },
        { id: 'n5', type: 'outputNode', position: { x: 1100, y: 140 }, data: { label: 'Polished Post', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
      ],
    }),
  },

  {
    id: 'delay-showcase',
    name: 'Animated Pipeline Demo',
    description: 'A timed pipeline using Delay nodes to showcase step-by-step execution animations.',
    category: 'Demo',
    complexity: 'Medium',
    nodeCount: 6,
    tags: ['Demo', 'Delay', 'Animation'],
    build: () => ({
      name: 'Animated Pipeline Demo',
      nodes: [
        { id: 'n1', type: 'inputNode', position: { x: 60, y: 200 }, data: { label: 'Input', config: { value: 'AutoFlow AI Studio demonstrates how visual pipelines can chain data through multiple nodes, apply transformations, and leverage AI — all running live in your browser.', placeholder: '' }, status: 'idle', output: null } },
        { id: 'n2', type: 'delayNode', position: { x: 320, y: 200 }, data: { label: 'Pause 1.5s', config: { seconds: 1.5 }, status: 'idle', output: null } },
        { id: 'n3', type: 'transformNode', position: { x: 580, y: 200 }, data: { label: 'Uppercase', config: { operation: 'uppercase' }, status: 'idle', output: null } },
        { id: 'n4', type: 'delayNode', position: { x: 840, y: 200 }, data: { label: 'Pause 1s', config: { seconds: 1 }, status: 'idle', output: null } },
        { id: 'n5', type: 'aiSummarizeNode', position: { x: 1100, y: 200 }, data: { label: 'AI Summarize', config: { mode: 'summarize', maxWords: 30 }, status: 'idle', output: null } },
        { id: 'n6', type: 'outputNode', position: { x: 1360, y: 200 }, data: { label: 'Output', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
        { id: 'e5', source: 'n5', target: 'n6' },
      ],
    }),
  },

  // ─── ADVANCED ─────────────────────────────────────────────────────────────
  {
    id: 'dual-tone-compare',
    name: 'Dual Tone Comparison',
    description: 'Summarize once, then rewrite in both Casual and Persuasive tones to compare outputs.',
    category: 'AI',
    complexity: 'Medium',
    nodeCount: 6,
    tags: ['AI', 'Compare', 'Tone'],
    build: () => ({
      name: 'Dual Tone Comparison',
      nodes: [
        { id: 'n1', type: 'inputNode', position: { x: 300, y: 40 }, data: { label: 'Input Text', config: { value: 'Our new product uses advanced machine learning to predict customer behavior, enabling businesses to personalize experiences at scale and increase conversion rates by up to 40% within the first quarter of deployment.', placeholder: '' }, status: 'idle', output: null } },
        { id: 'n2', type: 'aiSummarizeNode', position: { x: 300, y: 220 }, data: { label: 'AI Summarize', config: { mode: 'summarize', maxWords: 45 }, status: 'idle', output: null } },
        { id: 'n3', type: 'aiRewriteNode', position: { x: 60, y: 420 }, data: { label: 'Rewrite — Casual', config: { mode: 'rewrite', tone: 'casual' }, status: 'idle', output: null } },
        { id: 'n4', type: 'aiRewriteNode', position: { x: 540, y: 420 }, data: { label: 'Rewrite — Persuasive', config: { mode: 'rewrite', tone: 'persuasive' }, status: 'idle', output: null } },
        { id: 'n5', type: 'outputNode', position: { x: 60, y: 620 }, data: { label: 'Casual Output', config: {}, status: 'idle', output: null } },
        { id: 'n6', type: 'outputNode', position: { x: 540, y: 620 }, data: { label: 'Persuasive Output', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e4', source: 'n3', target: 'n5' },
        { id: 'e5', source: 'n4', target: 'n6' },
      ],
    }),
  },

  // ─── KILLER DEMOS ─────────────────────────────────────────────────────────
  {
    id: 'content-creator-pipeline',
    name: 'Content Creator Pipeline',
    description: 'Turn raw ideas into polished social posts: rewrite, summarize, generate hashtags — all in one flow.',
    category: 'Demo',
    complexity: 'Advanced',
    nodeCount: 7,
    tags: ['Killer', 'AI', 'Social Media', 'Content'],
    build: () => ({
      name: 'Content Creator Pipeline',
      nodes: [
        {
          id: 'n1', type: 'inputNode', position: { x: 60, y: 220 },
          data: { label: 'Raw Content Idea', config: { value: 'Social media is no longer just about posting pretty pictures. In 2024, creators who win are those who understand their audience deeply, post consistently with purpose, use data to refine their strategy, and build real communities — not just follower counts. Authenticity beats perfection every single time.' }, status: 'idle', output: null },
        },
        {
          id: 'n2', type: 'transformNode', position: { x: 320, y: 220 },
          data: { label: 'Clean Input', config: { operation: 'trim' }, status: 'idle', output: null },
        },
        {
          id: 'n3', type: 'aiRewriteNode', position: { x: 580, y: 120 },
          data: { label: 'Rewrite — Casual', config: { mode: 'rewrite', tone: 'casual' }, status: 'idle', output: null },
        },
        {
          id: 'n4', type: 'aiSummarizeNode', position: { x: 840, y: 120 },
          data: { label: 'Summarize (Tweet)', config: { mode: 'summarize', maxWords: 28 }, status: 'idle', output: null },
        },
        {
          id: 'n5', type: 'aiRewriteNode', position: { x: 840, y: 320 },
          data: { label: 'Rewrite — Persuasive', config: { mode: 'rewrite', tone: 'persuasive' }, status: 'idle', output: null },
        },
        {
          id: 'n6', type: 'aiCustomNode', position: { x: 1100, y: 120 },
          data: { label: 'Hashtag Generator', config: { systemPrompt: 'Generate 5 relevant hashtags for the following text. Return only the hashtags separated by spaces, starting each with #. No explanation.' }, status: 'idle', output: null },
        },
        {
          id: 'n7', type: 'outputNode', position: { x: 1360, y: 120 },
          data: { label: 'Post Draft', config: {}, status: 'idle', output: null },
        },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n5' },
        { id: 'e4', source: 'n3', target: 'n4' },
        { id: 'e5', source: 'n4', target: 'n6' },
        { id: 'e6', source: 'n6', target: 'n7' },
      ],
    }),
  },

  {
    id: 'study-assistant-flow',
    name: 'Study Assistant Flow',
    description: 'Drop in raw study notes and get back a summary, flashcards, and quiz questions — ready to use.',
    category: 'Demo',
    complexity: 'Advanced',
    nodeCount: 7,
    tags: ['Killer', 'AI', 'Education', 'Study'],
    build: () => ({
      name: 'Study Assistant Flow',
      nodes: [
        {
          id: 'n1', type: 'inputNode', position: { x: 60, y: 220 },
          data: { label: 'Study Notes', config: { value: 'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy — usually from the sun — into chemical energy stored as glucose. This occurs in the chloroplasts using chlorophyll. The process has two main stages: the light-dependent reactions (in the thylakoid membranes) which capture energy from sunlight, and the light-independent reactions (Calvin cycle, in the stroma) which use that energy to fix CO2 into sugar. The overall equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2.' }, status: 'idle', output: null },
        },
        {
          id: 'n2', type: 'transformNode', position: { x: 320, y: 220 },
          data: { label: 'Trim & Clean', config: { operation: 'trim' }, status: 'idle', output: null },
        },
        {
          id: 'n3', type: 'transformNode', position: { x: 560, y: 220 },
          data: { label: 'Normalize Case', config: { operation: 'lowercase' }, status: 'idle', output: null },
        },
        {
          id: 'n4', type: 'aiSummarizeNode', position: { x: 800, y: 100 },
          data: { label: 'Core Concepts', config: { mode: 'summarize', maxWords: 55 }, status: 'idle', output: null },
        },
        {
          id: 'n5', type: 'aiCustomNode', position: { x: 800, y: 320 },
          data: { label: 'Flashcard Generator', config: { systemPrompt: 'Turn the following text into exactly 3 study flashcards. Use the format:\nQ: [question]\nA: [answer]\n\nKeep each card short and focused.' }, status: 'idle', output: null },
        },
        {
          id: 'n6', type: 'aiCustomNode', position: { x: 1060, y: 100 },
          data: { label: 'Quiz Generator', config: { systemPrompt: 'Create 2 multiple-choice quiz questions from the following text. For each question provide 4 options (A B C D) and mark the correct answer. Be concise.' }, status: 'idle', output: null },
        },
        {
          id: 'n7', type: 'outputNode', position: { x: 1320, y: 100 },
          data: { label: 'Study Material', config: {}, status: 'idle', output: null },
        },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n3', target: 'n5' },
        { id: 'e5', source: 'n4', target: 'n6' },
        { id: 'e6', source: 'n6', target: 'n7' },
      ],
    }),
  },

  {
    id: 'job-application-flow',
    name: 'Job Application Flow',
    description: 'Turn your resume into a polished professional summary, cover letter, and multilingual draft — in seconds.',
    category: 'Demo',
    complexity: 'Advanced',
    nodeCount: 7,
    tags: ['Killer', 'AI', 'Career', 'Job'],
    build: () => ({
      name: 'Job Application Flow',
      nodes: [
        {
          id: 'n1', type: 'inputNode', position: { x: 60, y: 220 },
          data: { label: 'Resume Snippet', config: { value: '• 4 years full-stack development experience (React, Node.js, PostgreSQL)\n• Led migration of legacy monolith to microservices, cutting deploy time by 60%\n• Built and shipped 3 production SaaS products used by 10,000+ users\n• Strong communicator — mentored 2 junior developers, ran weekly engineering syncs\n• Open source contributor — 800+ GitHub stars on personal projects' }, status: 'idle', output: null },
        },
        {
          id: 'n2', type: 'transformNode', position: { x: 320, y: 220 },
          data: { label: 'Clean Resume', config: { operation: 'trim' }, status: 'idle', output: null },
        },
        {
          id: 'n3', type: 'aiSummarizeNode', position: { x: 580, y: 220 },
          data: { label: 'Professional Summary', config: { mode: 'summarize', maxWords: 45 }, status: 'idle', output: null },
        },
        {
          id: 'n4', type: 'aiRewriteNode', position: { x: 840, y: 120 },
          data: { label: 'Polish — Professional', config: { mode: 'rewrite', tone: 'professional' }, status: 'idle', output: null },
        },
        {
          id: 'n5', type: 'aiCustomNode', position: { x: 840, y: 320 },
          data: { label: 'Cover Letter Opener', config: { systemPrompt: 'Write a compelling 3-sentence cover letter opening paragraph based on the following professional summary. Be confident, specific, and direct. Do not use generic phrases like "I am excited to apply".' }, status: 'idle', output: null },
        },
        {
          id: 'n6', type: 'aiTranslateNode', position: { x: 1100, y: 320 },
          data: { label: 'Translate to Spanish', config: { targetLanguage: 'Spanish' }, status: 'idle', output: null },
        },
        {
          id: 'n7', type: 'outputNode', position: { x: 1360, y: 220 },
          data: { label: 'Application Draft', config: {}, status: 'idle', output: null },
        },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n3', target: 'n5' },
        { id: 'e5', source: 'n4', target: 'n7' },
        { id: 'e6', source: 'n5', target: 'n6' },
        { id: 'e7', source: 'n6', target: 'n7' },
      ],
    }),
  },

  {
    id: 'full-content-pipeline',
    name: 'Full Content Production Pipeline',
    description: 'A 9-node end-to-end pipeline: clean raw input → normalize → summarize → rewrite in two tones → finalize.',
    category: 'Advanced',
    complexity: 'Advanced',
    nodeCount: 9,
    tags: ['AI', 'Transform', 'Pipeline', 'Big'],
    build: () => ({
      name: 'Full Content Production Pipeline',
      nodes: [
        // Stage 1 — Raw Input
        { id: 'n1', type: 'inputNode', position: { x: 60, y: 300 }, data: { label: 'Raw Input', config: { value: "  machine learning is a subset of artificial intelligence that enables systems to learn from data and improve over time without being explicitly programmed. it powers everything from recommendation engines on netflix and spotify to fraud detection at banks, self-driving cars, and medical imaging diagnosis. the field is growing rapidly, with new breakthroughs happening every year. businesses of all sizes are now adopting ML to automate decisions, reduce costs, and create personalised customer experiences.  ", placeholder: '' }, status: 'idle', output: null } },

        // Stage 2 — Clean
        { id: 'n2', type: 'transformNode', position: { x: 320, y: 180 }, data: { label: 'Trim Whitespace', config: { operation: 'trim' }, status: 'idle', output: null } },
        { id: 'n3', type: 'transformNode', position: { x: 320, y: 420 }, data: { label: 'Capitalize (Upper)', config: { operation: 'uppercase' }, status: 'idle', output: null } },

        // Stage 3 — Normalize (pick one branch — trim path continues)
        { id: 'n4', type: 'transformNode', position: { x: 580, y: 180 }, data: { label: 'Lowercase Normalize', config: { operation: 'lowercase' }, status: 'idle', output: null } },

        // Stage 4 — Pause for effect
        { id: 'n5', type: 'delayNode', position: { x: 840, y: 180 }, data: { label: 'Processing Pause', config: { seconds: 1 }, status: 'idle', output: null } },

        // Stage 5 — AI Summarize
        { id: 'n6', type: 'aiSummarizeNode', position: { x: 1100, y: 180 }, data: { label: 'AI Summarize', config: { mode: 'summarize', maxWords: 55 }, status: 'idle', output: null } },

        // Stage 6 — Dual Rewrite
        { id: 'n7', type: 'aiRewriteNode', position: { x: 1360, y: 80 }, data: { label: 'Rewrite — Professional', config: { mode: 'rewrite', tone: 'professional' }, status: 'idle', output: null } },
        { id: 'n8', type: 'aiRewriteNode', position: { x: 1360, y: 300 }, data: { label: 'Rewrite — Casual', config: { mode: 'rewrite', tone: 'casual' }, status: 'idle', output: null } },

        // Stage 7 — Final Output
        { id: 'n9', type: 'outputNode', position: { x: 1640, y: 180 }, data: { label: 'Final Output', config: {}, status: 'idle', output: null } },
      ],
      edges: [
        // Input → clean branches
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n1', target: 'n3' },
        // Trim path → normalize → delay → summarize
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
        { id: 'e5', source: 'n5', target: 'n6' },
        // Summarize → dual rewrite
        { id: 'e6', source: 'n6', target: 'n7' },
        { id: 'e7', source: 'n6', target: 'n8' },
        // Professional rewrite → final output
        { id: 'e8', source: 'n7', target: 'n9' },
      ],
    }),
  },
];

export function buildWorkflowFromTemplate(template: Template): Workflow {
  const base = template.build();
  return {
    ...base,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
