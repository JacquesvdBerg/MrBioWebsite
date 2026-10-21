import type { MetadataRoute } from "next";
import { gradeActivitiesPath, gradePath, grades, siteUrl } from "@/lib/site";
import { getPublishedThemes } from "@/lib/themes";

export const revalidate = 3600;

const pages = ["/", "/graad", "/shop", "/play-and-learn", "/video-lessons", "/weekly-facts", "/about", "/contact", "/comments"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const themes = await getPublishedThemes();
  const paths = [
    ...pages,
    ...grades.flatMap((grade) => [gradePath(grade), gradeActivitiesPath(grade)]),
    ...themes.map((theme) => theme.href),
  ];

  return paths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === "/" || path === "/weekly-facts" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/graad") || path === "/shop" ? 0.8 : 0.6,
  }));
}
