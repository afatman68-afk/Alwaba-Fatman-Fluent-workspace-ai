// Session-only helpers to clean AI output and format lines.

export function stripMarkdown(input: string): string {
  if (!input) return "";
  let s = input;

  // Fenced code blocks -> plain
  s = s.replace(/```[\w-]*\n?/g, "").replace(/```/g, "");
  // Inline code
  s = s.replace(/`([^`]+)`/g, "$1");
  // Bold / italic markers
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/(^|\W)\*([^*\n]+)\*/g, "$1$2");
  s = s.replace(/(^|\W)_([^_\n]+)_/g, "$1$2");
  // Headings (#, ##, ...)
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  // Blockquotes
  s = s.replace(/^\s{0,3}>\s?/gm, "");
  // Table pipe separators like |---|---|
  s = s.replace(/^\s*\|?\s*:?-{2,}:?(\s*\|\s*:?-{2,}:?)*\s*\|?\s*$/gm, "");
  // Table row pipes -> spaced separators
  s = s.replace(/^\s*\|(.+)\|\s*$/gm, (_, inner: string) =>
    inner
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean)
      .join("  ·  "),
  );
  // Bullet markers -> "- "
  s = s.replace(/^\s*[*+•]\s+/gm, "- ");
  // Collapse 3+ blank lines
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}
