const MOCK_SUMMARIES = [
  "This text explores key concepts in a clear and concise manner, highlighting the most important ideas for the reader.",
  "A brief overview of the main topic, summarizing the essential points into a digestible format.",
  "The core message revolves around understanding, clarity, and effective communication of complex ideas.",
];

const MOCK_REWRITES = [
  "Reimagined with fresh perspective: the content has been restructured to flow more naturally and engage readers more effectively.",
  "A polished rendition of the original, crafted to captivate attention while preserving the essence of the message.",
  "Transformed into a compelling narrative that speaks directly to the audience with precision and impact.",
];

const MOCK_CUSTOM = [
  "Based on your instructions, here is a thoughtfully crafted response that addresses the key points of the input.",
  "Following the provided guidance, this output has been generated to meet the specified requirements effectively.",
  "In accordance with the custom prompt, the text has been processed and refined to deliver a meaningful result.",
];

const MOCK_TRANSLATIONS: Record<string, string> = {
  Spanish: "Este es un texto de demostración traducido al español.",
  French: "Ceci est un texte de démonstration traduit en français.",
  German: "Dies ist ein Demo-Text, der ins Deutsche übersetzt wurde.",
  Italian: "Questo è un testo dimostrativo tradotto in italiano.",
  Portuguese: "Este é um texto de demonstração traduzido para o português.",
  Japanese: "これはデモ用の日本語翻訳テキストです。",
  Chinese: "这是一段翻译成中文的演示文本。",
  Arabic: "هذا نص توضيحي مترجم إلى العربية.",
  Hindi: "यह हिंदी में अनुवादित एक डेमो पाठ है।",
  Korean: "이것은 한국어로 번역된 데모 텍스트입니다.",
  Russian: "Это демонстрационный текст, переведённый на русский язык.",
  Dutch: "Dit is een demotekst vertaald naar het Nederlands.",
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callMockAI(
  prompt: string,
  mode: 'summarize' | 'rewrite'
): Promise<string> {
  await delay(900 + Math.random() * 600);

  if (mode === 'summarize') {
    const preview = prompt.slice(0, 40).trim();
    return `[Demo] Summary of "${preview}...": ${randomItem(MOCK_SUMMARIES)}`;
  }

  return `[Demo] Rewrite: ${randomItem(MOCK_REWRITES)}`;
}

export async function callMockAICustom(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  await delay(900 + Math.random() * 600);
  const preview = prompt.slice(0, 40).trim();
  const promptPreview = systemPrompt.slice(0, 30).trim();
  return `[Demo] Custom ("${promptPreview}...") applied to "${preview}...": ${randomItem(MOCK_CUSTOM)}`;
}

export async function callMockAITranslate(
  prompt: string,
  language: string
): Promise<string> {
  await delay(800 + Math.random() * 500);
  const mockTranslation = MOCK_TRANSLATIONS[language] ?? `[Demo] Translation to ${language}: (mock output for "${prompt.slice(0, 30).trim()}...")`;
  return mockTranslation;
}
