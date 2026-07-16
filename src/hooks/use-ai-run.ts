import { useState } from "react";
import { runAi } from "@/lib/ai.functions";
import { toast } from "sonner";

export function useAiRun() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<{ system: string; prompt: string } | null>(null);

  const run = async (system: string, prompt: string) => {
    setLoading(true);
    setContent("");
    setLastPrompt({ system, prompt });
    try {
      const { text } = await runAi({ data: { system, prompt } });
      setContent(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    if (lastPrompt) void run(lastPrompt.system, lastPrompt.prompt);
  };

  const clear = () => {
    setContent("");
    setLastPrompt(null);
  };

  return { content, setContent, loading, run, regenerate, clear };
}
