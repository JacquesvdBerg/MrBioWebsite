import { notFound } from "next/navigation";
import { ThemeTemplate } from "@/components/theme-template";
import { getPublishedTheme, getPublishedThemes } from "@/lib/themes";

type ThemePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const themes = await getPublishedThemes();
  return themes.map((theme) => ({ slug: theme.slug }));
}

export async function generateMetadata({ params }: ThemePageProps) {
  const { slug } = await params;
  const theme = await getPublishedTheme(slug);

  return {
    title: theme?.title ?? "Tema",
    description: theme?.blurb,
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { slug } = await params;
  const theme = await getPublishedTheme(slug);

  if (!theme) {
    notFound();
  }

  return <ThemeTemplate theme={theme} />;
}
