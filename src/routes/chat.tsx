import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, Trash2, Copy, Pencil, Check, User, Bot } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string };

const suggestions = [
  "Summarize this report.",
  "Draft an email.",
  "Create meeting minutes.",
  "Generate project milestones.",
  "Rewrite professionally.",
  "Explain this document.",
  "Brainstorm ideas.",
  "Create an agenda.",
  "Prepare interview questions.",
  "Improve this proposal.",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();
    const next = [...messages, userMsg];
    setMessages([...next, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "Request failed");
        throw new Error(err || "Request failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed";
      if (msg !== "The user aborted a request.") toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const clear = () => {
    abortRef.current?.abort();
    setMessages([]);
  };

  return (
    <AppShell title="AI Workplace Chat" eyebrow="Chat">
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="hidden border-border/70 p-5 lg:col-span-1 lg:block">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Suggested prompts
          </div>
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={streaming}
                className="w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Conversation history disappears when this page closes or reloads.
          </p>
        </Card>

        <Card className="flex h-[calc(100dvh-14rem)] min-h-[520px] flex-col overflow-hidden border-border/70 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Workplace Assistant</div>
              <div className="text-[11px] text-muted-foreground">
                Session-only · nothing is saved
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              disabled={!messages.length && !streaming}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <EmptyChat onPick={send} />
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  streaming={streaming && m.role === "assistant" && !m.content}
                  onEdit={(v) =>
                    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, content: v } : x)))
                  }
                />
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-border/60 bg-background/70 p-3 sm:p-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2 shadow-card focus-within:ring-2 focus-within:ring-ring">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Ask your workplace assistant…"
                className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
              />
              <Button
                type="submit"
                disabled={streaming || !input.trim()}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl bg-gradient-primary shadow-soft"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-muted-foreground">
              Press Enter to send · Shift+Enter for a new line
            </p>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

function EmptyChat({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="grid h-full place-items-center py-10 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">Ask your workplace assistant.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft, summarize, brainstorm, rewrite — nothing you type is stored.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="rounded-xl border border-border/70 bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  streaming,
  onEdit,
}: {
  msg: Msg;
  streaming: boolean;
  onEdit: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={"flex gap-3 " + (isUser ? "flex-row-reverse" : "")}>
      <div
        className={
          "grid h-8 w-8 shrink-0 place-items-center rounded-full " +
          (isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-gradient-primary text-primary-foreground")
        }
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={"min-w-0 max-w-[85%] " + (isUser ? "items-end" : "")}>
        <div
          className={
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card " +
            (isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border/70 bg-card text-card-foreground")
          }
        >
          {editing ? (
            <textarea
              value={msg.content}
              onChange={(e) => onEdit(e.target.value)}
              className="min-h-[120px] w-full resize-y rounded-lg border border-input bg-background p-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          ) : streaming ? (
            <TypingDots />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
          )}
        </div>
        {!streaming && msg.content && (
          <div className={"mt-1.5 flex gap-1 " + (isUser ? "justify-end" : "")}>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
              {editing ? "Done" : "Edit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
    </div>
  );
}
