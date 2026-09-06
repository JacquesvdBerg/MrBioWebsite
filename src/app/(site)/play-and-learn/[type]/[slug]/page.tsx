import { notFound } from "next/navigation";
import { CrosswordEngine } from "@/components/crossword-engine";
import { DiagramEngine } from "@/components/diagram-engine";
import { MatchPairsEngine } from "@/components/match-pairs-engine";
import { MemoryEngine } from "@/components/memory-engine";
import { PutInOrderEngine } from "@/components/put-in-order-engine";
import { QuizEngine } from "@/components/quiz-engine";
import { SortingEngine } from "@/components/sorting-engine";
import { TrueOrFalseEngine } from "@/components/true-or-false-engine";
import { WordSearchEngine } from "@/components/word-search-engine";
import {
  asCrossword,
  asDiagram,
  asPairs,
  asPutInOrder,
  asQuiz,
  asSorting,
  asSpeedQuiz,
  asTrueOrFalse,
  asWordSearch,
  getPublishedActivity,
} from "@/lib/activities";
import { parseQuizLength, sliceQuiz } from "@/lib/quiz-length";
import { isActivitySlug } from "@/lib/site";

type PlayPageProps = {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ vrae?: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: PlayPageProps) {
  const { type, slug } = await params;
  if (!isActivitySlug(type)) {
    return { title: "Aktiwiteit" };
  }

  const activity = await getPublishedActivity(type, slug);
  return { title: activity?.title ?? "Aktiwiteit" };
}

export default async function PlayActivityPage({
  params,
  searchParams,
}: PlayPageProps) {
  const { type, slug } = await params;
  const query = await searchParams;

  if (!isActivitySlug(type)) {
    notFound();
  }

  const activity = await getPublishedActivity(type, slug);

  if (!activity) {
    notFound();
  }

  switch (type) {
    case "quiz":
    case "speed-quiz": {
      const quiz =
        type === "quiz" ? asQuiz(activity) : asSpeedQuiz(activity);
      if (!quiz) {
        notFound();
      }
      const available = quiz.quiz.questions.length;
      const length = query.vrae
        ? parseQuizLength(query.vrae, available)
        : available;
      return (
        <QuizEngine
          title={quiz.title}
          topic={quiz.topic}
          grade={quiz.grade}
          questions={sliceQuiz(quiz.quiz.questions, length)}
          kind={type}
        />
      );
    }
    case "true-or-false": {
      const quiz = asTrueOrFalse(activity);
      if (!quiz) {
        notFound();
      }
      const available = quiz.quiz.questions.length;
      const length = query.vrae
        ? parseQuizLength(query.vrae, available)
        : available;
      return (
        <TrueOrFalseEngine
          title={quiz.title}
          topic={quiz.topic}
          grade={quiz.grade}
          questions={sliceQuiz(quiz.quiz.questions, length)}
        />
      );
    }
    case "word-search": {
      const game = asWordSearch(activity);
      if (!game) {
        notFound();
      }
      return (
        <WordSearchEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          slug={game.slug}
          words={game.game.words}
        />
      );
    }
    case "crossword": {
      const game = asCrossword(activity);
      if (!game) {
        notFound();
      }
      return (
        <CrosswordEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          entries={game.game.entries}
        />
      );
    }
    case "match-the-pairs": {
      const game = asPairs(activity);
      if (!game) {
        notFound();
      }
      return (
        <MatchPairsEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          pairs={game.game.pairs}
        />
      );
    }
    case "memory-cards": {
      const game = asPairs(activity);
      if (!game) {
        notFound();
      }
      return (
        <MemoryEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          pairs={game.game.pairs}
        />
      );
    }
    case "put-in-order": {
      const game = asPutInOrder(activity);
      if (!game) {
        notFound();
      }
      return (
        <PutInOrderEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          items={game.game.items}
        />
      );
    }
    case "diagram": {
      const game = asDiagram(activity);
      if (!game) {
        notFound();
      }
      return (
        <DiagramEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          parts={game.game.parts}
        />
      );
    }
    case "sorting": {
      const game = asSorting(activity);
      if (!game) {
        notFound();
      }
      return (
        <SortingEngine
          title={game.title}
          topic={game.topic}
          grade={game.grade}
          categories={game.game.categories}
          items={game.game.items}
        />
      );
    }
    default: {
      const _exhaustive: never = type;
      void _exhaustive;
      notFound();
    }
  }
}
