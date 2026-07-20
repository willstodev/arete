import type { ResumeLabels } from "./types.js";

const englishLabels: ResumeLabels = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages"
};

const portugueseBrazilLabels: ResumeLabels = {
  summary: "Resumo",
  skills: "Competencias",
  experience: "Experiencia",
  projects: "Projetos",
  education: "Formacao",
  certifications: "Certificacoes",
  languages: "Idiomas"
};

export function normalizeLocale(locale: string | undefined): string {
  if (!locale) {
    return "en";
  }

  if (locale === "pt" || locale.toLowerCase() === "pt-br") {
    return "pt-BR";
  }

  return "en";
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

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match?.[1] || !match[2]) {
    return value;
  }

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    year: "numeric",
    month: "short",
    timeZone: "UTC"
  }).format(date);
}
