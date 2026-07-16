import { createFileRoute } from "@tanstack/react-router";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

type Body = { messages: { role: "user" | "assistant" | "system"; content: string }[] };

const SYSTEM = `You are an AI Workplace Productivity Assistant. Provide clear, structured, professional answers. Use markdown headings and bullet lists when helpful. Be concise and actionable. Remind users to review AI content before relying on it for business decisions when relevant.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) return new Response("Bad request", { status: 400 });

        const gateway = createLovableAiGatewayProvider(key);
        const modelMessages: ModelMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        try {
          const result = streamText({
            model: gateway(DEFAULT_MODEL),
            system: SYSTEM,
            messages: modelMessages,
          });
          return result.toTextStreamResponse();
        } catch (err: unknown) {
          const e = err as { statusCode?: number; message?: string };
          const status = e?.statusCode === 429 ? 429 : e?.statusCode === 402 ? 402 : 500;
          return new Response(e?.message ?? "AI request failed", { status });
        }
      },
    },
  },
});
