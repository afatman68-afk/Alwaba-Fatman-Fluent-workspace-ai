import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CalendarClock,
  Search,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const features = [
  {
    to: "/meeting",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into an executive summary with action items, owners, and risks.",
    tag: "Summarize",
  },
  {
    to: "/tasks",
    icon: CalendarClock,
    title: "AI Task Planner",
    desc: "Build a focused schedule with deep-work blocks, priorities, and smart breaks.",
    tag: "Plan",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    desc: "Distill topics, reports, and articles into insights and recommendations.",
    tag: "Research",
  },
  {
    to: "/chat",
    icon: MessageSquare,
    title: "AI Workplace Chat",
    desc: "A conversational workspace for drafting, brainstorming, and rewriting.",
    tag: "Chat",
  },
] as const;

function Dashboard() {
  return (
    <AppShell title="Dashboard" eyebrow="Overview">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-primary p-6 text-primary-foreground shadow-elegant sm:p-10">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <Badge className="mb-4 rounded-full border-white/30 bg-white/15 text-primary-foreground hover:bg-white/20">
            <ShieldCheck className="mr-1 h-3 w-3" /> Stateless · Private · Session-only
          </Badge>
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Do focused work, faster —{" "}
            <span className="italic opacity-90">without leaving a trace.</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            Summarize meetings, plan your day, research topics, and chat with an AI teammate.
            Nothing you type is saved — refreshing this page clears everything.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link to="/chat">
                <Sparkles className="h-4 w-4" /> Start a session
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            >
              <Link to="/templates">
                Browse templates <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading title="Quick actions" hint="Jump straight into a workflow" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="group">
              <Card className="h-full border-border/70 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold leading-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <PreviewCard
          title="Recent activity"
          icon={Activity}
          items={[
            "Session started — nothing recorded",
            "Local memory only",
            "Refresh to reset the workspace",
          ]}
        />
        <PreviewCard
          title="Meeting preview"
          icon={FileText}
          items={[
            "Executive summary",
            "Decisions · Action items · Owners",
            "Risks & next steps",
          ]}
        />
        <PreviewCard
          title="Planner preview"
          icon={CalendarClock}
          items={["Deep work blocks", "Priority matrix", "Suggested breaks"]}
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4 text-primary" /> Research preview
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>· Executive summary of any topic</li>
            <li>· Advantages, disadvantages, business impact</li>
            <li>· Suggested follow-up questions</li>
          </ul>
        </Card>
        <Card className="border-border/70 p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-primary" /> Chat preview
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>· Draft emails, agendas, and updates</li>
            <li>· Rewrite copy in a professional tone</li>
            <li>· Brainstorm ideas with a teammate</li>
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="flex flex-wrap items-center gap-3 border-border/70 bg-accent/30 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Try a prompt template</div>
            <div className="text-xs text-muted-foreground">
              Populate any workspace with a proven structure.
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/templates">Open templates</Link>
          </Button>
        </Card>
      </section>
    </AppShell>
  );
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function PreviewCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Activity;
  items: string[];
}) {
  return (
    <Card className="border-border/70 p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>· {i}</li>
        ))}
      </ul>
    </Card>
  );
}
