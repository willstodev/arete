import type { ResumeFact, ResumeModel } from "../resume/types.js";
import { escapeLatex } from "./escape.js";

export function renderLatex(resume: ResumeModel): string {
  const lines = [
    "\\documentclass[10pt,letterpaper]{article}",
    "\\usepackage[margin=0.65in]{geometry}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage{enumitem}",
    "\\usepackage{hyperref}",
    "\\usepackage{titlesec}",
    "\\pagestyle{empty}",
    "\\setlength{\\parindent}{0pt}",
    "\\setlist[itemize]{leftmargin=*, topsep=2pt, itemsep=1pt}",
    "\\titleformat{\\section}{\\large\\bfseries}{}{0pt}{}[\\titlerule]",
    "\\begin{document}",
    `\\begin{center}{\\LARGE ${fact(resume.name)}}\\\\`,
    resume.headline ? `${fact(resume.headline)}\\\\` : "",
    contactLine(resume),
    "\\end{center}"
  ].filter(Boolean);

  if (resume.summary) {
    lines.push(section(resume.labels.summary, [fact(resume.summary)]));
  }

  if (resume.skills.length > 0) {
    lines.push(section(resume.labels.skills, [resume.skills.map(fact).join(", ")]));
  }

  if (resume.experiences.length > 0) {
    lines.push(`\\section*{${escapeLatex(resume.labels.experience)}}`);
    for (const experience of resume.experiences) {
      const location = experience.location ? ` \\hfill ${fact(experience.location)}` : "";
      lines.push(
        `\\textbf{${fact(experience.title)}} -- ${fact(experience.employer)}${location}\\\\`
      );
      lines.push(`\\emph{${fact(experience.dates)}}`);
      lines.push(itemize(experience.bullets.map(fact)));
      if (experience.technologies.length > 0) {
        lines.push(`\\textit{Technologies: ${experience.technologies.map(fact).join(", ")}}`);
      }
    }
  }

  if (resume.projects.length > 0) {
    lines.push(`\\section*{${escapeLatex(resume.labels.projects)}}`);
    for (const project of resume.projects) {
      const date = project.date ? ` \\hfill ${fact(project.date)}` : "";
      lines.push(`\\textbf{${fact(project.name)}}${date}`);
      lines.push(itemize(project.bullets.map(fact)));
      if (project.technologies.length > 0) {
        lines.push(`\\textit{Technologies: ${project.technologies.map(fact).join(", ")}}`);
      }
    }
  }

  if (resume.education.length > 0) {
    lines.push(`\\section*{${escapeLatex(resume.labels.education)}}`);
    for (const education of resume.education) {
      const date = education.date ? ` \\hfill ${fact(education.date)}` : "";
      lines.push(
        `\\textbf{${fact(education.credential)}} -- ${fact(education.institution)}${date}`
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
  return `${lines.join("\n\n")}\n`;
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

function section(title: string, bodyLines: string[]): string {
  return [`\\section*{${escapeLatex(title)}}`, ...bodyLines].join("\n\n");
}

function itemize(items: string[]): string {
  return ["\\begin{itemize}", ...items.map((item) => `\\item ${item}`), "\\end{itemize}"].join(
    "\n"
  );
}
