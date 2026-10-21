// CAPS (KABV) year plan per grade and term. Grades 10–12 follow the teacher's
// "Opvoedkundige materiaal te koop" list (October 2026).

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

// Gr 8 and 9 list every quarter so parents can see the whole year, even where
// the teacher only sells material for some quarters (see the shop). Gr 8 KW1
// follows the lessons in his GR8 playlist; the rest is the KABV
// Natuurwetenskappe year plan.
const grade8: GradeSyllabus = {
  grade: 8,
  summary: "Natuurwetenskappe, kwartaal vir kwartaal. Die skyfies vir kwartaal 1 en 2 is reeds te koop.",
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
    {
      term: 2,
      title: "Materie en materiale",
      topics: ["Atome", "Die deeltjiemodel van materie", "Chemiese reaksies"],
    },
    {
      term: 3,
      title: "Energie en verandering",
      topics: [
        "Statiese elektrisiteit",
        "Energie-oordrag in elektriese stelsels",
        "Serie- en parallelstroombane",
        "Sigbare lig",
      ],
    },
    {
      term: 4,
      title: "Planeet Aarde en die ruimte",
      topics: ["Die sonnestelsel", "Buite die sonnestelsel", "Kyk die ruimte in"],
    },
  ],
};

// Gr 9: the teacher covers the biology quarters (KW1 and KW4); KW2 and KW3 are
// the Skeinat part. KW4's biology topics still have to come from him.
const grade9: GradeSyllabus = {
  grade: 9,
  summary:
    "Natuurwetenskappe, kwartaal vir kwartaal. Die skyfies vir die biologie (kwartaal 1 en 4) is te koop.",
  playlist: "https://www.youtube.com/playlist?list=PLHZVYsyyT3ymScZU0e_N7Oipf7OCUHSgQ",
  terms: [
    {
      term: 1,
      title: "Lewe en lewende dinge",
      topics: [
        "Selle as die basiese eenhede van lewe",
        "Stelsels in die menslike liggaam",
        "Menslike voortplanting",
        "Sirkulasie- en respiratoriese stelsels",
        "Spysverteringstelsel",
      ],
    },
    {
      term: 2,
      title: "Materie en materiale",
      topics: [
        "Verbindings",
        "Chemiese reaksies",
        "Reaksies van metale en niemetale met suurstof",
        "Sure, basisse en pH",
        "Reaksies van sure met basisse, metaaloksiede en metale",
      ],
    },
    {
      term: 3,
      title: "Energie en verandering",
      topics: [
        "Kragte",
        "Elektriese selle as energiestelsels",
        "Weerstand",
        "Serie- en parallelstroombane",
        "Veiligheid met elektrisiteit",
        "Energie en die nasionale elektrisiteitsnetwerk",
        "Koste van elektrisiteit",
      ],
    },
    { term: 4, title: "Biologie", topics: ["Onderwerpe volg binnekort."] },
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
