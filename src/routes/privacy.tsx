import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Ban, EyeOff, Trash2, Zap, Info } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Fluent AI" },
      {
        name: "description",
        content:
          "Fluent AI is stateless by design: no accounts, no cookies, no databases, and nothing is stored between sessions.",
      },
    ],
  }),
  component: PrivacyPage,
});

const items = [
  {
    icon: Ban,
    title: "No databases, no accounts",
    body: "There is no backend database and no authentication. You never create an account.",
  },
  {
    icon: EyeOff,
    title: "No cookies or tracking",
    body: "No cookies, local storage, session storage, IndexedDB, analytics, or telemetry are used for your content.",
  },
  {
    icon: Trash2,
    title: "Automatic erasure",
    body: "Everything you type lives in memory only. Refreshing or closing this tab permanently clears it.",
  },
  {
    icon: Zap,
    title: "Ephemeral AI requests",
    body: "Prompts are sent to the AI provider only to generate a response and are not retained by this app.",
  },
];

function PrivacyPage() {
  return (
    <AppShell title="Privacy Notice" eyebrow="Stateless by design">
      <section className="mb-6 rounded-3xl border border-border/70 bg-gradient-primary p-6 text-primary-foreground shadow-elegant sm:p-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5" /> Privacy-first
        </div>
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
          Nothing you type is ever saved.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/85">
          This assistant is fully stateless. There is no persistent memory of any kind — every
          session starts fresh and ends when you close the tab.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <Card key={it.title} className="border-border/70 p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <it.icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold">{it.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex items-start gap-3 border-border/70 bg-accent/30 p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground">
          <strong>Responsible AI notice.</strong> AI-generated content is provided to assist
          workplace productivity. Users should carefully review, verify, and validate all
          summaries, schedules, recommendations, and generated content before relying on them for
          business, legal, financial, compliance, or operational decisions. This application does
          not permanently store any user-entered information.
        </p>
      </Card>
    </AppShell>
  );
}
