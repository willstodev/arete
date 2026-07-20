const latexEscapes = new Map<string, string>([
  ["\\", "\\textbackslash{}"],
  ["{", "\\{"],
  ["}", "\\}"],
  ["$", "\\$"],
  ["&", "\\&"],
  ["#", "\\#"],
  ["%", "\\%"],
  ["_", "\\_"],
  ["~", "\\textasciitilde{}"],
  ["^", "\\textasciicircum{}"]
]);

export function escapeLatex(value: string): string {
  return value.replace(/[\\{}$&#%_~^]/gu, (char) => latexEscapes.get(char) ?? char);
}
