import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiOutputCard } from "@/components/ai-output-card";
import { useAiRun } from "@/hooks/use-ai-run";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

const SYSTEM = `You are a productivity coach. Given the user's tasks and constraints, produce a realistic plan in Markdown with sections:
## Daily Schedule (time-blocked, one day)
## Weekly Plan (Mon–Fri high-level)
## Priority Matrix (Urgent/Important quadrants as a table)
## Deep Work Sessions
## Meeting Preparation
## Suggested Breaks
## Productivity Recommendations
Respect working hours, focus windows, and break preferences. Be specific with times and durations.`;

function TasksPage() {
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("9:00–17:00");
  const [focus, setFocus] = useState("Morning");
  const [breaks, setBreaks] = useState("10 min every 90 min, 45 min lunch");
  const { content, setContent, loading, run, regenerate, clear } = useAiRun();

  const plan = () => {
    if (!tasks.trim()) return;
    void run(
      SYSTEM,
      `Tasks (one per line, may include deadline/priority/duration):\n${tasks}\n\nWorking hours: ${hours}\nPreferred focus window: ${focus}\nBreak preferences: ${breaks}`,
    );
  };

  return (
    <AppShell title="AI Task Planner" eyebrow="Plan">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/70 p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Your workload</div>
              <div className="text-xs text-muted-foreground">One task per line.</div>
            </div>
          </div>
          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder={`e.g.\nDraft Q2 board deck — Fri — high — 3h\nReply to client emails — today — med — 30m\nReview PRs — daily — low — 45m`}
            className="min-h-[220px] w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Working hours">
              <Input value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
            <Field label="Focus window">
              <Input value={focus} onChange={(e) => setFocus(e.target.value)} />
            </Field>
            <Field label="Break preferences" className="sm:col-span-2">
              <Input value={breaks} onChange={(e) => setBreaks(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={plan}
              disabled={loading || !tasks.trim()}
              className="gap-2 rounded-full bg-gradient-primary shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Creating schedule…" : "Build my plan"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <AiOutputCard
            title="Your plan"
            content={content}
            onChange={setContent}
            loading={loading}
            onRegenerate={regenerate}
            onClear={clear}
            filename="task-plan.md"
            emptyLabel="Add tasks and constraints, then build your plan."
          />
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
