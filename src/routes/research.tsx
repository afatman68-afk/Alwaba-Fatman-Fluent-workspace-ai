import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiOutputCard } from "@/components/ai-output-card";
import { useAiRun } from "@/hooks/use-ai-run";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

const SYSTEM = `You are an expert business analyst. Given a research question, topic, article, report, or document, produce a Markdown briefing with sections:
## Executive Summary
## Key Insights
## Important Findings
## Business Impact
## Advantages
## Disadvantages
## Recommendations
## Future Considerations
## Suggested Follow-up Questions
Be objective, concise, and specific. Flag assumptions when the input is thin.`;

function ResearchPage() {
  const [input, setInput] = useState("");
  const { content, setContent, loading, run, regenerate, clear } = useAiRun();

  const go = () => {
    if (!input.trim()) return;
    void run(SYSTEM, input);
  };

  return (
    <AppShell title="AI Research Assistant" eyebrow="Research">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/70 p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">What should we look into?</div>
              <div className="text-xs text-muted-foreground">
                A question, topic, article, or report.
              </div>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Research a new topic… paste an article, ask a question, or drop a report."
            className="min-h-[380px] w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={go}
              disabled={loading || !input.trim()}
              className="gap-2 rounded-full bg-gradient-primary shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Researching topic…" : "Generate briefing"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <AiOutputCard
            title="Research briefing"
            content={content}
            onChange={setContent}
            loading={loading}
            onRegenerate={regenerate}
            onClear={clear}
            filename="research-briefing.md"
            emptyLabel="Enter a topic, question, or paste content to generate a briefing."
          />
        </div>
      </div>
    </AppShell>
  );
}
