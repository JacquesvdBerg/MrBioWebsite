import "server-only";
import { requireOpenAiKey } from "@/lib/openai-key";

export async function requestOpenAiJson<T>(input: {
  schemaName: string;
  schema: Record<string, unknown>;
  system: string;
  user: string;
}): Promise<T> {
  const apiKey = await requireOpenAiKey();
  const request = () =>
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.4,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: input.schemaName,
            strict: true,
            schema: input.schema,
          },
        },
      }),
    });

  // A new OpenAI account has a low tokens-per-minute limit, and a grade runs
  // several games at once. Wait and try again instead of failing the game.
  let response = await request();
  for (let attempt = 1; response.status === 429 && attempt <= 3; attempt++) {
    const wait = Number(response.headers.get("retry-after")) || 15 * attempt;
    await new Promise((resolve) => setTimeout(resolve, Math.min(wait, 45) * 1000));
    response = await request();
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI ${response.status}: ${detail.slice(0, 400)}`);
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty OpenAI response");
  }

  return JSON.parse(content) as T;
}
