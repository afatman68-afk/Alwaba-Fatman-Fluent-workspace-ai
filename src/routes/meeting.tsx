import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiOutputCard } from "@/components/ai-output-card";
import { useAiRun } from "@/hooks/use-ai-run";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/meeting")({
  component: MeetingPage,
});

const SYSTEM = `You are an expert executive assistant. Convert meeting notes into a highly structured, concise, professional summary in Markdown with these sections (in this order): 
## Executive Summary
## Key Discussion Points
## Important Decisions
## Action Items (as a table with columns: Task | Owner | Deadline)
## Risks
## Outstanding Questions
## Recommended Next Steps
Only include Owners and Deadlines if reasonably inferable. Never invent people. Use tight bullets.`;

function MeetingPage() {
  const [notes, setNotes] = useState("");
  const { content, setContent, loading, run, regenerate, clear } = useAiRun();

  const summarize = () => {
    if (!notes.trim()) return;
    void run(SYSTEM, `Meeting notes:\n\n${notes}`);
  };

  return (
    <AppShell title="Meeting Notes Summarizer" eyebrow="Summarize">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/70 p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Paste your notes</div>
              <div className="text-xs text-muted-foreground">
                Anything — transcript, rough bullets, meeting minutes.
              </div>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste meeting notes to begin…"
            className="min-h-[380px] w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={summarize}
              disabled={loading || !notes.trim()}
              className="gap-2 rounded-full bg-gradient-primary shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Analyzing meeting…" : "Summarize"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setNotes("");
                clear();
              }}
              className="gap-1.5 rounded-full text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Notes are processed in memory only. Nothing is saved when you leave this page.
          </p>
        </Card>

        <div className="lg:col-span-3">
          <AiOutputCard
            title="Meeting summary"
            content={content}
            onChange={setContent}
            loading={loading}
            onRegenerate={regenerate}
            onClear={clear}
            filename="meeting-summary.md"
            emptyLabel="Paste meeting notes and click Summarize to generate an executive summary."
          />
        </div>
      </div>
    </AppShell>
  );
}
