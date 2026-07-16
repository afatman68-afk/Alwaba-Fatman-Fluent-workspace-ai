import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AiOutputCard } from "@/components/ai-output-card";
import { WeekTimeGrid } from "@/components/week-time-grid";
import { useAiRun } from "@/hooks/use-ai-run";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Sparkles, ListChecks, LayoutGrid } from "lucide-react";
import {
  defaultSeed,
  parsePlanToBlocks,
  type PlanBlock,
} from "@/lib/plan-parse";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

const SYSTEM = `You are a productivity coach. Given the user's tasks and constraints, produce a realistic plan.

Structure the response with these UPPERCASE section headers, each on its own line:
DAILY SCHEDULE
WEEKLY PLAN
PRIORITY MATRIX
DEEP WORK SESSIONS
MEETING PREPARATION
SUGGESTED BREAKS
PRODUCTIVITY RECOMMENDATIONS

Inside DAILY SCHEDULE and WEEKLY PLAN, write one time block per line using this exact shape so it can be parsed:
<Day> HH:MM-HH:MM <Title>
Example:
Mon 09:00-10:30 Deep work: draft board deck
Tue 13:00-13:45 Client review call

Respect the user's working hours, focus window, and break preferences. Use 24-hour time. Do not use markdown symbols.`;

function TasksPage() {
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("9:00-17:00");
  const [focus, setFocus] = useState("Morning");
  const [breaks, setBreaks] = useState("10 min every 90 min, 45 min lunch");
  const { content, setContent, loading, run, regenerate, clear } = useAiRun();
  const [blocks, setBlocks] = useState<PlanBlock[]>(() => defaultSeed());

  // When a new plan finishes generating, extract blocks and merge into the grid.
  useEffect(() => {
    if (!content || loading) return;
    const parsed = parsePlanToBlocks(content);
    if (parsed.length) setBlocks(parsed);
  }, [content, loading]);

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
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            The AI plan populates the calendar below. Drag blocks to fine-tune — nothing is saved.
          </p>
        </Card>

        <div className="lg:col-span-3">
          <Tabs defaultValue="calendar">
            <TabsList className="mb-3">
              <TabsTrigger value="calendar" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Calendar
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-1.5">
                <ListChecks className="h-3.5 w-3.5" /> Text plan
              </TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="mt-0">
              <WeekTimeGrid blocks={blocks} setBlocks={setBlocks} />
              <p className="mt-2 px-1 text-[11px] text-muted-foreground">
                Tip: drag from the middle to move, drag the bottom handle to resize. Hover a
                block to reveal the remove button.
              </p>
            </TabsContent>
            <TabsContent value="text" className="mt-0">
              <AiOutputCard
                title="Your plan"
                content={content}
                onChange={setContent}
                loading={loading}
                onRegenerate={regenerate}
                onClear={clear}
                filename="task-plan.txt"
                emptyLabel="Add tasks and constraints, then build your plan."
              />
            </TabsContent>
          </Tabs>
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
