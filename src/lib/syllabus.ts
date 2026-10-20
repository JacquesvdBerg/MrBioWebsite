// CAPS (KABV) year plan per grade and term. Grades 10–12 follow the teacher's
// "Opvoedkundige materiaal te koop" list (October 2026). Grades 8–9 only list
// the quarters he has material for.

import type { Grade } from "@/lib/site";

export type SyllabusTerm = {
  term: 1 | 2 | 3 | 4;
  title: string;
  topics: string[];
};

export type GradeSyllabus = {
  grade: Grade;
  summary: string;
  /** Second half of the page heading when a grade has fewer than four quarters. */
  tagline?: string;
  playlist: string;
  terms: SyllabusTerm[];
};

export const seniorGrades = [10, 11, 12] as const;

export type SeniorGrade = (typeof seniorGrades)[number];

export function isSeniorGrade(grade: number): grade is SeniorGrade {
  return (seniorGrades as readonly number[]).includes(grade);
}

// Gr 8: for now only KW1 and KW2 have material. Topics are the lessons in the
// teacher's GR8 playlist, which labels each video by quarter.
const grade8: GradeSyllabus = {
  grade: 8,
  summary: "Natuurwetenskappe: kwartaal 1 en 2 is beskikbaar. Meer volg binnekort.",
  tagline: "Meer volg.",
  playlist: "https://www.youtube.com/playlist?list=PLFZb-n-QApHk",
  terms: [
    {
      term: 1,
      title: "Lewe en lewende dinge",
      topics: [
        "Fotosintese",
        "Respirasie",
        "Ekologie en ekosisteme",
        "Voedselkettings en voedselwebbe",
        "Aanpassings",
        "Mikro-organismes",
      ],
    },
    { term: 2, title: "Materie en materiale", topics: ["Materie en materiale"] },
  ],
};

// Gr 9: MnrBio only covers the biology component (KW1 and KW4). KW2 and KW3
// are Skeinat, which is not taught here, so they are left out.
const grade9: GradeSyllabus = {
  grade: 9,
  summary: "Die biologie-deel van Natuurwetenskappe: kwartaal 1 en 4.",
  tagline: "Net biologie.",
  playlist: "https://www.youtube.com/playlist?list=PLHZVYsyyT3ymScZU0e_N7Oipf7OCUHSgQ",
  terms: [
    { term: 1, title: "Biologie", topics: ["Onderwerpe kom hier."] },
    { term: 4, title: "Biologie", topics: ["Onderwerpe kom hier."] },
  ],
};

export const syllabus: Record<Grade, GradeSyllabus> = {
  8: grade8,
  9: grade9,
  10: {
    grade: 10,
    summary: "Chemie van lewe, selle, weefsels, ekosisteme en biodiversiteit.",
    playlist: "https://www.youtube.com/playlist?list=PLHZVYsyyT3ylyhr8ms6P48_oHrac08_sN",
    terms: [
      {
        term: 1,
        title: "Chemie van lewe, selle en plantweefsels",
        topics: [
          "Chemie van lewe",
          "Selle (struktuur en funksie)",
          "Mitose",
          "Plantweefsels",
        ],
      },
      {
        term: 2,
        title: "Weefsels, ondersteuning en vervoer",
        topics: [
          "Diereweefsels",
          "Ondersteuning en vervoer in plante",
          "Ondersteuningstelsel in diere (skelet)",
          "Menslike sirkulasiestelsel",
        ],
      },
      {
        term: 3,
        title: "Geskiedenis van lewe en biodiversiteit",
        topics: [
          "Geskiedenis van lewe op aarde",
          "Biodiversiteit en klassifikasie",
          "Omgewingstudies",
        ],
      },
      {
        term: 4,
        title: "Hersiening en eindeksamen",
        topics: [
          "Hersiening van kwartaal 1 tot 3",
          "Eindeksamen",
        ],
      },
    ],
  },
  11: {
    grade: 11,
    summary: "Klassifikasie, lewensprosesse, gaswisseling en die omgewing.",
    playlist: "https://www.youtube.com/playlist?list=PLHZVYsyyT3ykuHIpYrcI4J-K6ZKtq74G-",
    terms: [
      {
        term: 1,
        title: "Mikro-organismes en biodiversiteit",
        topics: [
          "Mikro-organismes",
          "Biodiversiteit van plante",
          "Biodiversiteit van diere",
        ],
      },
      {
        term: 2,
        title: "Fotosintese, respirasie en voeding",
        topics: [
          "Fotosintese",
          "Selrespirasie",
          "Dierevoeding",
        ],
      },
      {
        term: 3,
        title: "Gaswisseling, uitskeiding en ekologie",
        topics: [
          "Gaswisseling",
          "Ekskresie (uitskeiding)",
          "Bevolkingsekologie",
        ],
      },
      {
        term: 4,
        title: "Menslike impak op die omgewing",
        topics: [
          "Menslike impak op die omgewing",
        ],
      },
    ],
  },
  12: {
    grade: 12,
    summary: "DNA, voortplanting, homeostase, genetika en evolusie.",
    playlist: "https://www.youtube.com/playlist?list=PLHZVYsyyT3ymJZrjpiC9eVdYpYunniEe4",
    terms: [
      {
        term: 1,
        title: "DNA, meiose en voortplanting",
        topics: [
          "DNA/RNA",
          "Meiose",
          "Voortplanting (gewerweldes en mense)",
        ],
      },
      {
        term: 2,
        title: "Genetika en reaksie op die omgewing",
        topics: [
          "Genetika (oorerwing)",
          "Menslike reaksie op die omgewing (senustelsel)",
          "Endokriene stelsel",
          "Homeostase",
          "Plante se reaksie op die omgewing",
        ],
      },
      {
        term: 3,
        title: "Evolusie",
        topics: [
          "Evolusie deur natuurlike seleksie",
          "Menslike evolusie",
        ],
      },
      {
        term: 4,
        title: "Hersiening en eindeksamen",
        topics: [
          "Voorbereiding vir Vraestel 1",
          "Voorbereiding vir Vraestel 2",
        ],
      },
    ],
  },
};
