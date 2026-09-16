import type { ResumeLabels } from "./types.js";
import { ValidationError } from "../diagnostics/errors.js";

const englishLabels: ResumeLabels = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  technologies: "Key Technologies"
};

const portugueseBrazilLabels: ResumeLabels = {
  summary: "Resumo",
  skills: "Competências",
  experience: "Experiência",
  projects: "Projetos",
  education: "Formação",
  certifications: "Certificações",
  languages: "Idiomas",
  technologies: "Tecnologias"
};

export function normalizeLocale(locale: string | undefined): string {
  if (!locale) {
    return "en";
  }

  if (locale.toLowerCase() === "pt" || locale.toLowerCase() === "pt-br") {
    return "pt-BR";
  }

  if (locale.toLowerCase() === "en") return "en";
  throw new ValidationError(`Unsupported locale "${locale}". Supported locales: en, pt-BR.`);
}

export function labelsForLocale(locale: string): ResumeLabels {
  switch (normalizeLocale(locale)) {
    case "pt-BR":
      return portugueseBrazilLabels;
    default:
      return englishLabels;
  }
}

export function formatDateRange(start: string, end: string, locale: string): string {
  return `${formatDate(start, locale)} - ${formatDate(end, locale)}`;
}

function formatDate(value: string, locale: string): string {
  if (/^present$/i.test(value)) {
    return normalizeLocale(locale) === "pt-BR" ? "Atual" : "Present";
  }

  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match?.[1] || !match[2]) {
    return value;
  }

  const date = new Date(0);
  date.setUTCFullYear(Number(match[1]), Number(match[2]) - 1, 1);
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    year: "numeric",
    month: "short",
    timeZone: "UTC"
  }).format(date);
}
