//text analysis

export const analyzeText = (text) => {
  const clean = text || "";
  const lines = clean.split(/\r?\n/).filter((l) => l.trim() !== "");
  const words = clean.trim().split(/\s+/).filter(Boolean);
  const hashtags = clean.match(/#[\p{L}\p{N}_]+/gu) || [];
  const mentions = clean.match(/@[\p{L}\p{N}_]+/gu) || [];
  const emojis = clean.match(/\p{RGI_Emoji}/gv) || [];


  const suggestions = [];

  if (words.length > 0 && words.length > 280) {
    suggestions.push("Your content is quite long; consider trimming it for short-form platforms.");
  }
  if (hashtags.length === 0) {
    suggestions.push("Try adding 1–3 relevant hashtags to improve discoverability.");
  } else if (hashtags.length > 6) {
    suggestions.push("Consider reducing the number of hashtags; 2–5 focused tags is usually ideal.");
  }
  if (!/[!?]$/.test(clean.trim())) {
    suggestions.push("Consider ending with a question or call-to-action to encourage engagement.");
  }

  return {
    wordCount: words.length,
    charCount: clean.length,
    lineCount: lines.length,
    hashtagsCount: hashtags.length,
    mentionsCount: mentions.length,
    emojiCount: emojis.length,
    suggestions,
  };
};

export const buildReport = (text, analysis) => {
  if (!text) return "No text extracted.";
  const a = analysis || analyzeText(text);

  let report = "Social Media Content Analysis Report\n\n";
  report += `Words: ${a.wordCount}\n`;
  report += `Characters: ${a.charCount}\n`;
  report += `Lines: ${a.lineCount}\n`;
  report += `Hashtags: ${a.hashtagsCount}\n`;
  report += `Mentions: ${a.mentionsCount}\n`;
  report += `Emojis: ${a.emojiCount}\n\n`;

  if (a.suggestions.length) {
    report += "Suggestions:\n";
    a.suggestions.forEach((s, idx) => {
      report += `${idx + 1}. ${s}\n`;
    });
  } else {
    report += "Suggestions:\nLooks good! No major issues detected.\n";
  }

  report += "\n---\n\nExtracted Text:\n\n";
  report += text.trim();

  return report;
};
