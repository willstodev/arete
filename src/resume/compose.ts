import type { Candidate, SourcedText } from "../candidate/types.js";
import type {
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeFact,
  ResumeLanguage,
  ResumeModel,
  ResumeProject
} from "./types.js";
import { formatDateRange, labelsForLocale, normalizeLocale } from "./localization.js";

export type ComposeOptions = {
  locale?: string;
};

export function composeResume(candidate: Candidate, options: ComposeOptions = {}): ResumeModel {
  const locale = normalizeLocale(options.locale ?? candidate.locale);

  return {
    locale,
    labels: labelsForLocale(locale),
    name: fact(candidate.identity.name),
    ...(candidate.identity.headline ? { headline: fact(candidate.identity.headline) } : {}),
    ...(candidate.identity.location ? { location: fact(candidate.identity.location) } : {}),
    contacts: contactFacts(candidate),
    ...(candidate.summary ? { summary: fact(candidate.summary) } : {}),
    skills: candidate.skills.map(fact),
    experiences: candidate.experiences.map((experience): ResumeExperience => {
      return {
        title: fact(experience.title),
        employer: fact(experience.employer),
        dates: {
          text: formatDateRange(experience.start.value, experience.end.value, locale),
          sources: [experience.start.source, experience.end.source]
        },
        ...(experience.location ? { location: fact(experience.location) } : {}),
        bullets: experience.bullets.map(fact),
        technologies: experience.technologies.map(fact)
      };
    }),
    projects: candidate.projects.map((project): ResumeProject => {
      return {
        name: fact(project.name),
        ...(project.date ? { date: fact(project.date) } : {}),
        bullets: project.bullets.map(fact),
        technologies: project.technologies.map(fact)
      };
    }),
    education: candidate.education.map((education): ResumeEducation => {
      return {
        credential: fact(education.credential),
        institution: fact(education.institution),
        ...(education.date ? { date: fact(education.date) } : {})
      };
    }),
    certifications: candidate.certifications.map((certification): ResumeCertification => {
      const parts = [certification.name, certification.issuer, certification.date].filter(
        (item): item is SourcedText => Boolean(item)
      );
      return {
        text: {
          text: parts.map((part) => part.value).join(" | "),
          sources: parts.map((part) => part.source)
        }
      };
    }),
    languages: candidate.languages.map((language): ResumeLanguage => {
      return {
        text: {
          text: `${language.name.value}: ${language.proficiency.value}`,
          sources: [language.name.source, language.proficiency.source]
        }
      };
    })
  };
}

function fact(text: SourcedText): ResumeFact {
  return { text: text.value, sources: [text.source] };
}

function contactFacts(candidate: Candidate): ResumeFact[] {
  const contact = candidate.identity.contact;
  return [contact.email, contact.phone, contact.linkedIn, contact.github, contact.website]
    .filter((item): item is SourcedText => Boolean(item))
    .map(fact);
}
