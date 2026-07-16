import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

const PLAIN_TEXT_RULE = `
Formatting rules (strict):
- Reply in plain professional text. No markdown symbols.
- Do not use #, *, _, backticks, or table pipe characters.
- Section titles: write them as UPPERCASE labels on their own line (e.g. EXECUTIVE SUMMARY).
- Bullets: use "- " at the start of a line. Nothing else.
- Do not draw ASCII tables. If tabular, write one item per line with fields separated by " — ".
- Keep it concise and scannable.
`.trim();

const Input = z.object({
  system: z.string().min(1),
  prompt: z.string().min(1).max(50000),
});

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    try {
      const { text } = await generateText({
        model: gateway(DEFAULT_MODEL),
        system: `${data.system}\n\n${PLAIN_TEXT_RULE}`,
        prompt: data.prompt,
      });
      return { text };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string };
      if (e?.statusCode === 429) throw new Error("Rate limit reached. Please try again shortly.");
      if (e?.statusCode === 402) throw new Error("AI credits exhausted. Add credits to continue.");
      throw new Error(e?.message ?? "AI request failed");
    }
  });
