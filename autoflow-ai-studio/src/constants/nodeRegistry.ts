import type { NodeType } from '../types/workflow';

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  icon: string;
  defaultConfig: Record<string, unknown>;
}

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'inputNode',
    label: 'Input Text',
    description: 'Starting point — provide text for the pipeline',
    color: '#3B82F6',
    icon: 'Type',
    defaultConfig: { value: '', placeholder: 'Enter your text here...' },
  },
  {
    type: 'transformNode',
    label: 'Transform',
    description: 'Modify text: uppercase, lowercase, trim, reverse, replace',
    color: '#F59E0B',
    icon: 'Wand2',
    defaultConfig: { operation: 'uppercase' },
  },
  {
    type: 'conditionNode',
    label: 'Condition',
    description: 'Route flow based on whether input contains a keyword',
    color: '#06B6D4',
    icon: 'GitBranch',
    defaultConfig: { keyword: '', caseSensitive: false },
  },
  {
    type: 'aiSummarizeNode',
    label: 'AI Summarize',
    description: 'Use AI to condense text into a short summary',
    color: '#8B5CF6',
    icon: 'Sparkles',
    defaultConfig: { mode: 'summarize', maxWords: 50 },
  },
  {
    type: 'aiRewriteNode',
    label: 'AI Rewrite',
    description: 'Use AI to rephrase and polish the text',
    color: '#EC4899',
    icon: 'PenLine',
    defaultConfig: { mode: 'rewrite', tone: 'professional' },
  },
  {
    type: 'aiCustomNode',
    label: 'AI Custom Prompt',
    description: 'Write your own AI system prompt for full control',
    color: '#F97316',
    icon: 'BrainCircuit',
    defaultConfig: { systemPrompt: '' },
  },
  {
    type: 'aiTranslateNode',
    label: 'AI Translate',
    description: 'Translate text into any of 12 languages using AI',
    color: '#14B8A6',
    icon: 'Languages',
    defaultConfig: { targetLanguage: 'Spanish' },
  },
  {
    type: 'delayNode',
    label: 'Delay',
    description: 'Pause execution for a set number of seconds',
    color: '#6B7280',
    icon: 'Timer',
    defaultConfig: { seconds: 2 },
  },
  {
    type: 'outputNode',
    label: 'Output',
    description: 'Display the final result of the workflow',
    color: '#10B981',
    icon: 'LayoutList',
    defaultConfig: {},
  },
];

export const NODE_DEF_MAP = Object.fromEntries(
  NODE_DEFINITIONS.map((d) => [d.type, d])
) as Record<NodeType, NodeDefinition>;
