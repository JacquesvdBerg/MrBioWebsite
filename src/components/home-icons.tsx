import {
  BookIcon,
  BrainIcon,
  CartIcon,
  ChatIcon,
  DocumentIcon,
  LeafIcon,
  PlayIcon,
  PuzzleIcon,
  YoutubeIcon,
} from "@/components/icons";
import type { homeFeatures, homeShortcuts } from "@/lib/site";

type FeatureIconName = (typeof homeFeatures)[number]["icon"];
type ShortcutIconName = (typeof homeShortcuts)[number]["icon"];

export function FeatureIcon({
  name,
  className,
}: {
  name: FeatureIconName;
  className?: string;
}) {
  switch (name) {
    case "leaf":
      return <LeafIcon className={className} />;
    case "book":
      return <BookIcon className={className} />;
    case "play":
      return <PlayIcon className={className} />;
    case "puzzle":
      return <PuzzleIcon className={className} />;
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}

export function ShortcutIcon({
  name,
  className,
}: {
  name: ShortcutIconName;
  className?: string;
}) {
  switch (name) {
    case "document":
      return <DocumentIcon className={className} />;
    case "brain":
      return <BrainIcon className={className} />;
    case "youtube":
      return <YoutubeIcon className={className} />;
    case "chat":
      return <ChatIcon className={className} />;
    case "cart":
      return <CartIcon className={className} />;
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}
