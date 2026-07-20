import matter from "gray-matter";
import { candidateSchema } from "./schema.js";
import type {
  Candidate,
  Certification,
  Education,
  Experience,
  Language,
  Project,
  SourceRef,
  SourcedText
} from "./types.js";
import { ValidationError } from "../diagnostics/errors.js";

type Section = {
  title: string;
  line: number;
  lines: { text: string; line: number }[];
};

type Entry = {
  heading: SourcedText;
  lines: { text: string; line: number }[];
};

export function parseCandidateMarkdown(markdown: string, file: string): Candidate {
  const parsed = matter(markdown);
  if (parsed.data.schemaVersion !== 1) {
    throw new ValidationError(`Invalid candidate source ${file}: schemaVersion must be 1`);
  }
  const locale = typeof parsed.data.locale === "string" ? parsed.data.locale : undefined;
  const body = parsed.content;
  const sections = splitSections(body);

  const identity = parseIdentity(requiredSection(sections, "Identity", file), file);
  const summarySection = sections.get("Summary");
  const summary = summarySection ? firstParagraph(summarySection, file) : undefined;

  const candidate: Candidate = {
    schemaVersion: 1,
    identity,
    skills: parseListSection(sections.get("Skills"), file),
    experiences: parseExperience(sections.get("Experience"), file),
    projects: parseProjects(sections.get("Projects"), file),
    education: parseEducation(sections.get("Education"), file),
    certifications: parseCertifications(sections.get("Certifications"), file),
    languages: parseLanguages(sections.get("Languages"), file)
  };
  if (locale) {
    candidate.locale = locale;
  }
  if (summary) {
    candidate.summary = summary;
  }

  const result = candidateSchema.safeParse(candidate);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "candidate"}: ${issue.message}`)
      .join("; ");
    throw new ValidationError(`Invalid candidate source ${file}: ${issues}`);
  }

  return candidate;
}

function splitSections(markdown: string): Map<string, Section> {
  const sections = new Map<string, Section>();
  let current: Section | undefined;
  const lines = markdown.split(/\r?\n/);

  lines.forEach((text, index) => {
    const line = index + 1;
    const match = /^##\s+(.+?)\s*$/.exec(text);
    if (match?.[1]) {
      current = { title: match[1], line, lines: [] };
      sections.set(current.title, current);
      return;
    }

    if (current) {
      current.lines.push({ text, line });
    }
  });

  return sections;
}

function requiredSection(sections: Map<string, Section>, title: string, file: string): Section {
  const section = sections.get(title);
  if (!section) {
    throw new ValidationError(`Missing required section "${title}" in ${file}`);
  }
  return section;
}

function source(file: string, section: string, line: number): SourceRef {
  return { file, section, line };
}

function sourced(value: string, file: string, section: string, line: number): SourcedText {
  return { value: value.trim(), source: source(file, section, line) };
}

function parseIdentity(section: Section, file: string): Candidate["identity"] {
  const fields = new Map<string, SourcedText>();

  for (const row of section.lines) {
    const match = /^([A-Za-z][A-Za-z ]+):\s*(.*)$/.exec(row.text);
    if (match?.[1] && match[2]?.trim()) {
      fields.set(match[1].trim().toLowerCase(), sourced(match[2], file, section.title, row.line));
    }
  }

  const name = fields.get("name");
  const email = fields.get("email");
  const headline = fields.get("headline");
  const location = fields.get("location");
  const phone = fields.get("phone");
  const linkedIn = fields.get("linkedin");
  const github = fields.get("github");
  const website = fields.get("website");
  if (!name || !email) {
    throw new ValidationError(`Identity in ${file} must include Name and Email`);
  }

  return {
    name,
    ...(headline ? { headline } : {}),
    ...(location ? { location } : {}),
    contact: {
      email,
      ...(phone ? { phone } : {}),
      ...(linkedIn ? { linkedIn } : {}),
      ...(github ? { github } : {}),
      ...(website ? { website } : {})
    }
  };
}

function firstParagraph(section: Section, file: string): SourcedText | undefined {
  const row = section.lines.find((line) => line.text.trim() && !line.text.trim().startsWith("#"));
  return row ? sourced(row.text, file, section.title, row.line) : undefined;
}

function parseListSection(section: Section | undefined, file: string): SourcedText[] {
  if (!section) {
    return [];
  }

  return section.lines.flatMap((row) => {
    const match = /^-\s+(.+)$/.exec(row.text);
    return match?.[1] ? [sourced(match[1], file, section.title, row.line)] : [];
  });
}

function splitEntries(section: Section | undefined, file: string): Entry[] {
  if (!section) {
    return [];
  }

  const entries: Entry[] = [];
  let current: Entry | undefined;

  for (const row of section.lines) {
    const match = /^###\s+(.+?)\s*$/.exec(row.text);
    if (match?.[1]) {
      current = { heading: sourced(match[1], file, section.title, row.line), lines: [] };
      entries.push(current);
      continue;
    }

    if (current) {
      current.lines.push(row);
    }
  }

  return entries;
}

function parseExperience(section: Section | undefined, file: string): Experience[] {
  return splitEntries(section, file).map((entry) => {
    const parts = splitPipe(entry.heading.value);
    if (parts.length < 4) {
      throw new ValidationError(
        `Experience heading at ${file}:${entry.heading.source.line} must be "Title | Employer | Start - End | Location"`
      );
    }

    const [title, employer, dates, location] = parts;
    const dateParts = splitDateRange(dates ?? "", file, entry.heading.source.line);

    return {
      title: sourced(title ?? "", file, "Experience", entry.heading.source.line),
      employer: sourced(employer ?? "", file, "Experience", entry.heading.source.line),
      start: sourced(dateParts.start, file, "Experience", entry.heading.source.line),
      end: sourced(dateParts.end, file, "Experience", entry.heading.source.line),
      ...(location
        ? { location: sourced(location, file, "Experience", entry.heading.source.line) }
        : {}),
      bullets: parseBullets(entry, file, "Experience"),
      technologies: parseTechnologies(entry, file, "Experience")
    };
  });
}

function parseProjects(section: Section | undefined, file: string): Project[] {
  return splitEntries(section, file).map((entry) => {
    const [name, date] = splitPipe(entry.heading.value);
    if (!name) {
      throw new ValidationError(`Project heading at ${file}:${entry.heading.source.line} is empty`);
    }

    return {
      name: sourced(name, file, "Projects", entry.heading.source.line),
      ...(date ? { date: sourced(date, file, "Projects", entry.heading.source.line) } : {}),
      bullets: parseBullets(entry, file, "Projects"),
      technologies: parseTechnologies(entry, file, "Projects")
    };
  });
}

function parseEducation(section: Section | undefined, file: string): Education[] {
  return splitEntries(section, file).map((entry) => {
    const [credential, institution, date] = splitPipe(entry.heading.value);
    if (!credential || !institution) {
      throw new ValidationError(
        `Education heading at ${file}:${entry.heading.source.line} must be "Credential | Institution | Date"`
      );
    }

    return {
      credential: sourced(credential, file, "Education", entry.heading.source.line),
      institution: sourced(institution, file, "Education", entry.heading.source.line),
      ...(date ? { date: sourced(date, file, "Education", entry.heading.source.line) } : {})
    };
  });
}

function parseCertifications(section: Section | undefined, file: string): Certification[] {
  if (!section) {
    return [];
  }

  return section.lines.flatMap((row) => {
    const match = /^-\s+(.+)$/.exec(row.text);
    if (!match?.[1]) {
      return [];
    }

    const [name, issuer, date] = splitPipe(match[1]);
    if (!name) {
      return [];
    }

    return [
      {
        name: sourced(name, file, section.title, row.line),
        ...(issuer ? { issuer: sourced(issuer, file, section.title, row.line) } : {}),
        ...(date ? { date: sourced(date, file, section.title, row.line) } : {})
      }
    ];
  });
}

function parseLanguages(section: Section | undefined, file: string): Language[] {
  if (!section) {
    return [];
  }

  return section.lines.flatMap((row) => {
    const match = /^-\s+(.+?):\s*(.+)$/.exec(row.text);
    if (!match?.[1] || !match[2]) {
      return [];
    }

    return [
      {
        name: sourced(match[1], file, section.title, row.line),
        proficiency: sourced(match[2], file, section.title, row.line)
      }
    ];
  });
}

function parseBullets(entry: Entry, file: string, section: string): SourcedText[] {
  return entry.lines.flatMap((row) => {
    const match = /^-\s+(.+)$/.exec(row.text);
    return match?.[1] ? [sourced(match[1], file, section, row.line)] : [];
  });
}

function parseTechnologies(entry: Entry, file: string, section: string): SourcedText[] {
  const row = entry.lines.find((line) => /^Technologies:\s*/.test(line.text));
  if (!row) {
    return [];
  }

  return row.text
    .replace(/^Technologies:\s*/, "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => sourced(value, file, section, row.line));
}

function splitPipe(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitDateRange(value: string, file: string, line: number): { start: string; end: string } {
  const match = /^(.+?)\s+-\s+(.+)$/.exec(value);
  if (!match?.[1] || !match[2]) {
    throw new ValidationError(`Date range at ${file}:${line} must be "Start - End"`);
  }

  return { start: match[1].trim(), end: match[2].trim() };
}
