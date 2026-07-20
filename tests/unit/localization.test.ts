import { describe, expect, it } from "vitest";
import {
  formatDateRange,
  labelsForLocale,
  normalizeLocale
} from "../../src/resume/localization.js";

describe("localization", () => {
  it("normalizes supported locales", () => {
    expect(normalizeLocale(undefined)).toBe("en");
    expect(normalizeLocale("pt-br")).toBe("pt-BR");
    expect(normalizeLocale("fr-FR")).toBe("en");
  });

  it("provides localized labels and date ranges", () => {
    expect(labelsForLocale("pt-BR").experience).toBe("Experiencia");
    expect(formatDateRange("2021-03", "Present", "en")).toContain("Present");
    expect(formatDateRange("2021-03", "Present", "pt-BR")).toContain("Atual");
    expect(formatDateRange("Spring 2021", "Present", "en")).toBe("Spring 2021 - Present");
  });
});
