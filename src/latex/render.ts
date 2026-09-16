import type { ResumeFact, ResumeModel } from "../resume/types.js";
import { escapeLatex } from "./escape.js";

const MAX_SKILLS = 24;
const MAX_EXPERIENCE_BULLETS = 4;
const MAX_EXPERIENCE_TECHNOLOGIES = 14;
const MAX_PROJECT_BULLETS = 2;
const MAX_PROJECT_TECHNOLOGIES = 8;

export function renderLatex(resume: ResumeModel): string {
  const lines = [
    "\\documentclass[10pt,a4paper]{article}",
    "\\usepackage[margin=0.55in]{geometry}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage{enumitem}",
    "\\usepackage{hyperref}",
    "\\usepackage{lastpage}",
    "\\usepackage{refcount}",
    "\\usepackage{titlesec}",
    "\\pagestyle{empty}",
    "\\setlength{\\parindent}{0pt}",
    "\\setlength{\\tabcolsep}{0pt}",
    "\\setlist[itemize]{leftmargin=1.05em, topsep=2pt, itemsep=1pt, parsep=0pt}",
    "\\titleformat{\\section}{\\Large\\bfseries}{}{0pt}{}[\\titlerule]",
    "\\titlespacing*{\\section}{0pt}{10pt}{6pt}",
    "\\newcommand{\\areteEntry}[4]{\\textbf{#1}\\hfill\\textbf{#2}\\\\\\emph{#3}\\hfill\\emph{#4}\\\\}",
    "\\AtEndDocument{\\ifnum\\getpagerefnumber{LastPage}>1\\errmessage{Arete one-page rule failed: generated resume exceeds one page}\\fi}",
    "\\begin{document}",
    `\\begin{center}{\\huge ${fact(resume.name)}}\\\\`,
    resume.headline ? `${fact(resume.headline)}\\\\` : "",
    contactLine(resume),
    "\\end{center}"
  ].filter(Boolean);

  if (resume.summary) {
    lines.push(section(resume.labels.summary, [fact(resume.summary)]));
  }

  if (resume.skills.length > 0) {
    lines.push(
      section(resume.labels.skills, [limitFacts(resume.skills, MAX_SKILLS).map(fact).join(", ")])
    );
  }

  if (resume.experiences.length > 0) {
    lines.push(`\\section*{${escapeLatex(resume.labels.experience)}}`);
    for (const experience of resume.experiences) {
      lines.push(
        entryHeader(experience.employer, experience.location, experience.title, experience.dates)
      );
      lines.push(
        itemize([
          ...limitFacts(experience.bullets, MAX_EXPERIENCE_BULLETS).map(fact),
          technologiesLine(
            experience.technologies,
            MAX_EXPERIENCE_TECHNOLOGIES,
            resume.labels.technologies
          )
        ])
      );
    }
  }

  if (resume.projects.length > 0) {
    lines.push(`\\section*{${escapeLatex(resume.labels.projects)}}`);
    for (const project of resume.projects) {
      const date = project.date ? ` \\hfill ${fact(project.date)}` : "";
      lines.push(`\\textbf{${fact(project.name)}}${date}`);
      lines.push(
        itemize([
          ...limitFacts(project.bullets, MAX_PROJECT_BULLETS).map(fact),
          technologiesLine(
            project.technologies,
            MAX_PROJECT_TECHNOLOGIES,
            resume.labels.technologies
          )
        ])
      );
    }
  }

  if (resume.education.length > 0) {
    lines.push(`\\section*{${escapeLatex(resume.labels.education)}}`);
    for (const education of resume.education) {
      const date = education.date ? ` \\hfill ${fact(education.date)}` : "";
      lines.push(
        `\\textbf{${fact(education.credential)}} -- ${fact(education.institution)}${date}\\par`
      );
    }
  }

  if (resume.certifications.length > 0) {
    lines.push(
      section(
        resume.labels.certifications,
        resume.certifications.map((item) => fact(item.text))
      )
    );
  }

  if (resume.languages.length > 0) {
    lines.push(
      section(
        resume.labels.languages,
        resume.languages.map((item) => fact(item.text))
      )
    );
  }

  lines.push("\\end{document}");
  return `${lines.join("\n")}\n`;
}

function fact(value: ResumeFact): string {
  return escapeLatex(value.text);
}

function contactLine(resume: ResumeModel): string {
  const parts = [
    resume.location ? fact(resume.location) : undefined,
    ...resume.contacts.map(fact)
  ].filter((part): part is string => Boolean(part));
  return parts.join(" $\\cdot$ ");
}

function entryHeader(
  name: ResumeFact,
  location: ResumeFact | undefined,
  role: ResumeFact,
  dates: ResumeFact
): string {
  return `\\areteEntry{${fact(name)}}{${location ? fact(location) : ""}}{${fact(role)}}{${fact(dates)}}`;
}

function section(title: string, bodyLines: string[]): string {
  return [`\\section*{${escapeLatex(title)}}`, ...bodyLines.map((line) => `${line}\\par`)].join(
    "\n"
  );
}

function technologiesLine(
  technologies: ResumeFact[],
  limit: number,
  label: string
): string | undefined {
  if (technologies.length === 0) {
    return undefined;
  }
  return `\\textbf{${escapeLatex(label)}:} ${limitFacts(technologies, limit).map(fact).join(", ")}.`;
}

function itemize(items: (string | undefined)[]): string {
  return [
    "\\begin{itemize}",
    ...items.filter((item): item is string => Boolean(item)).map((item) => `\\item ${item}`),
    "\\end{itemize}"
  ].join("\n");
}

function limitFacts(facts: ResumeFact[], limit: number): ResumeFact[] {
  return facts.slice(0, limit);
}

export function renderWarnings(resume: ResumeModel): string[] {
  const warnings: string[] = [];
  const check = (facts: ResumeFact[], limit: number, label: string) => {
    if (facts.length > limit) {
      warnings.push(
        `${label}: omitted ${facts.length - limit} item(s) for the one-page budget; review source order.`
      );
    }
  };
  check(resume.skills, MAX_SKILLS, "Skills");
  resume.experiences.forEach((experience, index) => {
    check(experience.bullets, MAX_EXPERIENCE_BULLETS, `Experience ${index + 1} bullets`);
    check(
      experience.technologies,
      MAX_EXPERIENCE_TECHNOLOGIES,
      `Experience ${index + 1} technologies`
    );
  });
  resume.projects.forEach((project, index) => {
    check(project.bullets, MAX_PROJECT_BULLETS, `Project ${index + 1} bullets`);
    check(project.technologies, MAX_PROJECT_TECHNOLOGIES, `Project ${index + 1} technologies`);
  });
  return warnings;
}
