export type SourceRef = {
  file: string;
  section: string;
  line: number;
};

export type SourcedText = {
  value: string;
  source: SourceRef;
};

export type ContactInfo = {
  email: SourcedText;
  phone?: SourcedText;
  linkedIn?: SourcedText;
  github?: SourcedText;
  website?: SourcedText;
};

export type CandidateIdentity = {
  name: SourcedText;
  headline?: SourcedText;
  location?: SourcedText;
  contact: ContactInfo;
};

export type Experience = {
  title: SourcedText;
  employer: SourcedText;
  start: SourcedText;
  end: SourcedText;
  location?: SourcedText;
  bullets: SourcedText[];
  technologies: SourcedText[];
};

export type Project = {
  name: SourcedText;
  date?: SourcedText;
  bullets: SourcedText[];
  technologies: SourcedText[];
};

export type Education = {
  credential: SourcedText;
  institution: SourcedText;
  date?: SourcedText;
};

export type Certification = {
  name: SourcedText;
  issuer?: SourcedText;
  date?: SourcedText;
};

export type Language = {
  name: SourcedText;
  proficiency: SourcedText;
};

export type Candidate = {
  schemaVersion: 1;
  locale?: string;
  identity: CandidateIdentity;
  summary?: SourcedText;
  skills: SourcedText[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
};

export type ParsedCandidate = Candidate;
