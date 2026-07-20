import { describe, expect, it } from "vitest";
import { escapeLatex } from "../../src/latex/escape.js";

describe("escapeLatex", () => {
  it("escapes LaTeX control characters in candidate text", () => {
    expect(escapeLatex("Built A&B_100% using {x} #1 $value")).toBe(
      "Built A\\&B\\_100\\% using \\{x\\} \\#1 \\$value"
    );
  });
});
