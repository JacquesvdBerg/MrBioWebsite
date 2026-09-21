// CAPS (KABV) year plan per grade and term. Grades 10–12 are the teacher's
// list. Grades 8–9 have four quarters ready for that list.

import type { Grade } from "@/lib/site";

export type SyllabusTerm = {
  term: 1 | 2 | 3 | 4;
  title: string;
  topics: string[];
};

export type GradeSyllabus = {
  grade: Grade;
  summary: string;
  playlist: string;
  terms: SyllabusTerm[];
};

export const seniorGrades = [10, 11, 12] as const;

export type SeniorGrade = (typeof seniorGrades)[number];

export function isSeniorGrade(grade: number): grade is SeniorGrade {
  return (seniorGrades as readonly number[]).includes(grade);
}

function openYear(grade: 8 | 9): GradeSyllabus {
  return {
    grade,
    summary: "Vier kwartale. Die jaarplan word hier geplaas sodra dit deurgestuur is.",
    playlist: "",
    terms: [1, 2, 3, 4].map((term) => ({
      term: term as 1 | 2 | 3 | 4,
      title: `Kwartaal ${term}`,
      topics: ["Onderwerpe kom hier."],
    })),
  };
}

export const syllabus: Record<Grade, GradeSyllabus> = {
  8: openYear(8),
  9: openYear(9),
  10: {
    grade: 10,
    summary: "Chemie van lewe, selle, weefsels, ekosisteme en biodiversiteit.",
    playlist: "https://www.youtube.com/playlist?list=PLHZVYsyyT3ylyhr8ms6P48_oHrac08_sN",
    terms: [
      {
        term: 1,
        title: "Chemie van lewe en selle",
        topics: [
          "Organiese en anorganiese verbindings",
          "Ensieme",
          "Selstruktuur",
          "Mitose",
          "Kanker",
        ],
      },
      {
        term: 2,
        title: "Weefsels, organe en vervoer",
        topics: [
          "Plantweefsels en organe",
          "Vervoer in plante",
          "Diereweefsels",
          "Muskuloskeletale stelsel",
          "Sirkulasiestelsel",
        ],
      },
      {
        term: 3,
        title: "Geskiedenis van lewe en ekosisteme",
        topics: [
          "Fossiele en uitsterwings",
          "Die biosfeer",
          "Ekosisteme",
          "Energievloei",
          "Omgewingsiklusse",
        ],
      },
      {
        term: 4,
        title: "Biodiversiteit en klassifikasie",
        topics: [
          "Biodiversiteit",
          "Geskiedenis van lewe op Aarde",
          "Die 5-koninkryk-klassifikasiestelsel",
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
        title: "Biodiversiteit en klassifikasie",
        topics: [
          "Mikro-organismes",
          "Klassifikasie van plante",
          "Klassifikasie van diere",
        ],
      },
      {
        term: 2,
        title: "Lewensprosesse in plante en diere",
        topics: [
          "Fotosintese",
          "Selrespirasie",
          "Dierevoeding en die spysverteringstelsel",
        ],
      },
      {
        term: 3,
        title: "Gaswisseling, uitskeiding en ekologie",
        topics: [
          "Asemhalingstelsel",
          "Uitskeiding in mense (nierstelsel)",
          "Populasie-ekologie",
        ],
      },
      {
        term: 4,
        title: "Menslike impak op die omgewing",
        topics: ["Waterkrisis", "Besoedeling", "Kossekuriteit"],
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
          "DNA: die kode van die lewe",
          "RNA en proteïensintese",
          "Meiose",
          "Reproduksie in gewerweldes",
        ],
      },
      {
        term: 2,
        title: "Mens: voortplanting en regulering",
        topics: [
          "Menslike voortplanting",
          "Endokriene stelsel",
          "Homeostase",
          "Senuweestelsel en sintuie",
        ],
      },
      {
        term: 3,
        title: "Plantreaksies, genetika en evolusie",
        topics: [
          "Planthormone",
          "Genetika en oorerwing",
          "Evolusie: teorieë en bewyse",
        ],
      },
      {
        term: 4,
        title: "Menslike evolusie en eksamen",
        topics: [
          "Menslike evolusie (fossielbewyse)",
          "Eksamenvoorbereiding: Vraestel 1",
          "Eksamenvoorbereiding: Vraestel 2",
        ],
      },
    ],
  },
};
