import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Printer, RefreshCw, Trash2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { stripMarkdown } from "@/lib/format";

export function AiOutputCard({
  title,
  content,
  onChange,
  onRegenerate,
  onClear,
  loading,
  filename = "output.txt",
  emptyLabel,
}: {
  title: string;
  content: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  onClear: () => void;
  loading?: boolean;
  filename?: string;
  emptyLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const cleanContent = useMemo(() => (editing ? content : stripMarkdown(content)), [content, editing]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const copy = async () => {
    await navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const blob = new Blob([cleanContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<pre style="font: 14px/1.6 ui-sans-serif,system-ui;white-space:pre-wrap;padding:24px">${cleanContent
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`,
    );
    w.document.close();
    w.print();
  };

  return (
    <Card className="overflow-hidden border-border/70 shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{title}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setEditing((e) => !e)}
            disabled={!content}
          >
            <Pencil className="h-3.5 w-3.5" />
            {editing ? "Done" : "Edit"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={copy}
            disabled={!content}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={download}
            disabled={!content}
          >
            <Download className="h-3.5 w-3.5" /> Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={print}
            disabled={!content}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RefreshCw className={"h-3.5 w-3.5 " + (loading ? "animate-spin" : "")} />
              Regenerate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-destructive hover:text-destructive"
            onClick={onClear}
            disabled={!content && !loading}
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>
      <div className="p-5">
        {loading && !content ? (
          <LoadingLines />
        ) : content ? (
          editing ? (
            <textarea
              ref={ref}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[320px] w-full resize-y rounded-lg border border-input bg-background p-3 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {content}
              {loading && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary/60 align-middle" />}
            </pre>
          )
        ) : (
          <div className="grid place-items-center rounded-lg border border-dashed border-border/70 bg-muted/30 py-14 text-center">
            <div className="max-w-sm px-4 text-sm text-muted-foreground">
              {emptyLabel ?? "Your AI output will appear here."}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function LoadingLines() {
  return (
    <div className="space-y-3">
      {[90, 75, 95, 60, 80, 70].map((w, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-full bg-gradient-to-r from-muted via-accent/60 to-muted"
          style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}
