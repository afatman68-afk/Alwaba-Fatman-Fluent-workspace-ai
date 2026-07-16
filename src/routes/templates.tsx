import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiOutputCard } from "@/components/ai-output-card";
import { useAiRun } from "@/hooks/use-ai-run";
import { BookTemplate, Sparkles } from "lucide-react";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

type Template = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  system: string;
  prompt: string;
};

const TEMPLATES: Template[] = [
  {
    id: "meeting",
    name: "Meeting Summary",
    tag: "Meetings",
    desc: "Structured summary with decisions, actions, and owners.",
    system:
      "You are an expert executive assistant. Produce a concise, structured meeting summary in Markdown with sections: Executive Summary, Discussion Points, Decisions, Action Items (table), Risks, Next Steps.",
    prompt: "Summarize the following meeting notes:\n\n<paste notes here>",
  },
  {
    id: "project",
    name: "Project Planning",
    tag: "Planning",
    desc: "Milestones, deliverables, dependencies, and risks.",
    system:
      "You are a senior program manager. Produce a project plan in Markdown with: Goals, Milestones (with dates), Deliverables, Dependencies, Risks & Mitigations, RACI.",
    prompt:
      "Project: <name>\nObjective: <what success looks like>\nTeam: <roles>\nTimeline: <window>",
  },
  {
    id: "email",
    name: "Email Writing",
    tag: "Comms",
    desc: "Draft a professional email in the tone you choose.",
    system:
      "You are a professional writing coach. Draft a concise, well-structured email. Ask no questions — infer reasonable defaults.",
    prompt: "Recipient: <who>\nGoal: <what>\nTone: professional & warm\nKey points:\n- <point>",
  },
  {
    id: "research",
    name: "Research Briefing",
    tag: "Research",
    desc: "Executive-style briefing on any topic.",
    system:
      "You are an expert business analyst. Produce a Markdown briefing with: Executive Summary, Key Insights, Findings, Business Impact, Advantages, Disadvantages, Recommendations, Follow-up Questions.",
    prompt: "Topic or question: <what>",
  },
  {
    id: "swot",
    name: "SWOT Analysis",
    tag: "Strategy",
    desc: "Strengths, weaknesses, opportunities, threats.",
    system:
      "You are a strategy consultant. Produce a SWOT analysis in Markdown as a 2x2 table with 3–5 crisp bullets per quadrant, followed by a Recommendations section.",
    prompt: "Subject: <company / product / initiative>\nContext: <one paragraph>",
  },
  {
    id: "proposal",
    name: "Business Proposal",
    tag: "Sales",
    desc: "Opportunity, approach, pricing, and next steps.",
    system:
      "You are a proposal writer. Produce a business proposal in Markdown with: Overview, Understanding of Needs, Proposed Approach, Deliverables, Timeline, Pricing (placeholder), Why Us, Next Steps.",
    prompt: "Client: <name>\nProblem: <what>\nDesired outcome: <what>",
  },
  {
    id: "marketing",
    name: "Marketing Ideas",
    tag: "Marketing",
    desc: "Channel-by-channel campaign ideas with hooks.",
    system:
      "You are a growth marketer. Produce 6–10 marketing ideas across channels (organic social, paid, content, email, partnerships) with a headline hook, target, and success metric for each.",
    prompt: "Product/Service: <what>\nAudience: <who>\nBudget: <range>",
  },
  {
    id: "review",
    name: "Performance Review",
    tag: "People",
    desc: "Balanced, evidence-based performance summary.",
    system:
      "You are an HR business partner. Produce a balanced performance review in Markdown with: Summary, Strengths (with evidence), Growth Areas, Goals for Next Period, Development Plan. Use neutral, professional tone.",
    prompt: "Role: <title>\nPeriod: <window>\nHighlights:\n- <bullets>",
  },
  {
    id: "outline",
    name: "Presentation Outline",
    tag: "Comms",
    desc: "Section-by-section outline with talking points.",
    system:
      "You are a keynote coach. Produce a presentation outline in Markdown with: Objective, Audience, Opening Hook, Sections (with 3–5 talking points each), Suggested Visuals, Call to Action.",
    prompt: "Topic: <what>\nAudience: <who>\nDuration: <minutes>",
  },
  {
    id: "risk",
    name: "Risk Assessment",
    tag: "Ops",
    desc: "Register of risks with likelihood, impact, and mitigations.",
    system:
      "You are a risk manager. Produce a risk register in Markdown as a table with columns: Risk | Category | Likelihood (L/M/H) | Impact (L/M/H) | Mitigation | Owner. Follow with a Top 3 Priorities section.",
    prompt: "Initiative: <what>\nContext: <one paragraph>",
  },
];

function TemplatesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Template | null>(null);
  const [prompt, setPrompt] = useState("");
  const { content, setContent, loading, run, regenerate, clear } = useAiRun();

  const choose = (t: Template) => {
    setSelected(t);
    setPrompt(t.prompt);
    clear();
  };

  const generate = () => {
    if (!selected || !prompt.trim()) return;
    void run(selected.system, prompt);
  };

  return (
    <AppShell title="Prompt Templates" eyebrow="Library">
      {!selected ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Card
              key={t.id}
              className="group flex h-full flex-col border-border/70 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
                  <BookTemplate className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary" className="mb-1 rounded-full text-[10px] font-normal">
                    {t.tag}
                  </Badge>
                  <div className="truncate text-sm font-semibold">{t.name}</div>
                </div>
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t.desc}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full" onClick={() => choose(t)}>
                  Use template
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => {
                    choose(t);
                    setTimeout(() => void navigate({ to: "/chat" }), 0);
                  }}
                >
                  Open in chat
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="border-border/70 p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
                  {selected.tag}
                </Badge>
                <div className="mt-1 text-sm font-semibold">{selected.name}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelected(null);
                  clear();
                }}
              >
                Back to templates
              </Button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">{selected.desc}</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[300px] w-full resize-y rounded-xl border border-input bg-background p-3 font-mono text-[13px] leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="mt-3 gap-2 rounded-full bg-gradient-primary shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Preparing response…" : "Generate"}
            </Button>
          </Card>
          <div className="lg:col-span-3">
            <AiOutputCard
              title={selected.name}
              content={content}
              onChange={setContent}
              loading={loading}
              onRegenerate={regenerate}
              onClear={clear}
              filename={`${selected.id}.md`}
              emptyLabel="Fill in the placeholders and click Generate."
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
