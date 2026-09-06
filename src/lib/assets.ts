import { existsSync } from "node:fs";
import path from "node:path";
import "server-only";

export function publicFileUrl(file: string): string | null {
  if (/^https?:\/\//.test(file)) {
    return file;
  }

  const normalized = file.replace(/^\/+/, "");
  const fullPath = path.join(process.cwd(), "public", normalized);
  return existsSync(fullPath) ? `/${normalized}` : null;
}
