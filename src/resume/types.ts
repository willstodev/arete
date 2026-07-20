import type { SourceRef } from "../candidate/types.js";

export type ResumeFact = {
  text: string;
  sources: SourceRef[];
};

export type ResumeExperience = {
  title: ResumeFact;
  employer: ResumeFact;
  dates: ResumeFact;
  location?: ResumeFact;
  bullets: ResumeFact[];
  technologies: ResumeFact[];
};

export type ResumeProject = {
  name: ResumeFact;
  date?: ResumeFact;
  bullets: ResumeFact[];
  technologies: ResumeFact[];
};

export type ResumeEducation = {
  credential: ResumeFact;
  institution: ResumeFact;
  date?: ResumeFact;
};

export type ResumeCertification = {
  text: ResumeFact;
};

export type ResumeLanguage = {
  text: ResumeFact;
};

export type ResumeLabels = {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
  languages: string;
};

export type ResumeModel = {
  locale: string;
  labels: ResumeLabels;
  name: ResumeFact;
  headline?: ResumeFact;
  location?: ResumeFact;
  contacts: ResumeFact[];
  summary?: ResumeFact;
  skills: ResumeFact[];
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
};
