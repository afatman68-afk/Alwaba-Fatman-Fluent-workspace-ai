import { useMemo, useRef, useState } from "react";
import { X, GripHorizontal, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buildIcs, fmtTime, type BlockCategory, type PlanBlock } from "@/lib/plan-parse";
import { toast } from "sonner";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT = 56; // px per hour
const SNAP = 15; // minutes
const START_HOUR = 7;
const END_HOUR = 20;
const TOTAL_MIN = (END_HOUR - START_HOUR) * 60;

const CAT_META: Record<BlockCategory, { label: string; color: string; bar: string; bg: string }> =
  {
    deep: {
      label: "Deep Work",
      color: "text-primary",
      bar: "bg-primary",
      bg: "bg-primary/10 border-primary/25",
    },
    meeting: {
      label: "Meeting",
      color: "text-info",
      bar: "bg-info",
      bg: "bg-info/10 border-info/25",
    },
    break: {
      label: "Break",
      color: "text-success",
      bar: "bg-success",
      bg: "bg-success/10 border-success/30",
    },
    admin: {
      label: "Admin",
      color: "text-warning",
      bar: "bg-warning",
      bg: "bg-warning/15 border-warning/40",
    },
  };

function snap(min: number) {
  return Math.round(min / SNAP) * SNAP;
}

export function WeekTimeGrid({
  blocks,
  setBlocks,
}: {
  blocks: PlanBlock[];
  setBlocks: (updater: (b: PlanBlock[]) => PlanBlock[]) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origDay: number;
    origStart: number;
    origDuration: number;
    colWidth: number;
  } | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i),
    [],
  );

  const onPointerDown = (
    e: React.PointerEvent,
    block: PlanBlock,
    mode: "move" | "resize",
  ) => {
    if (!gridRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const grid = gridRef.current.getBoundingClientRect();
    const colWidth = grid.width / 7;
    dragRef.current = {
      id: block.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origDay: block.day,
      origStart: block.start,
      origDuration: block.duration,
      colWidth,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const dMin = snap((dy / HOUR_HEIGHT) * 60);
    if (d.mode === "move") {
      const dDay = Math.round(dx / d.colWidth);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== d.id) return b;
          const nextStart = Math.min(
            Math.max(d.origStart + dMin, START_HOUR * 60),
            END_HOUR * 60 - b.duration,
          );
          const nextDay = Math.min(Math.max(d.origDay + dDay, 0), 6);
          return { ...b, day: nextDay, start: nextStart };
        }),
      );
    } else {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== d.id) return b;
          const nextDur = Math.min(
            Math.max(d.origDuration + dMin, 15),
            END_HOUR * 60 - b.start,
          );
          return { ...b, duration: nextDur };
        }),
      );
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    dragRef.current = null;
  };

  const removeBlock = (id: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id));

  const addBlock = (b: Omit<PlanBlock, "id">) => {
    setBlocks((prev) => [...prev, { ...b, id: crypto.randomUUID() }]);
    setOpenAdd(false);
  };

  const exportIcs = () => {
    if (!blocks.length) {
      toast.error("Nothing to export yet.");
      return;
    }
    const blob = new Blob([buildIcs(blocks)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "week-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar file downloaded");
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Week calendar</div>
          <div className="text-[11px] text-muted-foreground">
            Drag blocks to move · drag the bottom handle to resize · session-only
          </div>
        </div>
        <Popover open={openAdd} onOpenChange={setOpenAdd}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-full">
              <Plus className="h-3.5 w-3.5" /> Add block
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <AddBlockForm onAdd={addBlock} />
          </PopoverContent>
        </Popover>
        <Button
          size="sm"
          variant="ghost"
          onClick={exportIcs}
          className="gap-1.5 rounded-full"
        >
          <Download className="h-3.5 w-3.5" /> .ics
        </Button>
      </div>

      <div className="flex overflow-x-auto">
        {/* Hour gutter */}
        <div className="sticky left-0 z-10 shrink-0 bg-card">
          <div className="h-9 border-b border-border/70" />
          {hours.slice(0, -1).map((h) => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="w-14 border-b border-border/40 pr-2 pt-1 text-right text-[10px] font-medium text-muted-foreground"
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="min-w-[560px] flex-1">
          <div className="grid grid-cols-7">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="h-9 border-b border-l border-border/70 px-2 pt-2 text-xs font-semibold text-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div
            ref={gridRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative grid grid-cols-7"
            style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
          >
            {/* background hour lines per column */}
            {DAY_LABELS.map((d, di) => (
              <div key={d} className="relative border-l border-border/70">
                {hours.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-border/30"
                  />
                ))}
                {/* Blocks for this column */}
                {blocks
                  .filter((b) => b.day === di)
                  .map((b) => {
                    const top = ((b.start - START_HOUR * 60) / TOTAL_MIN) *
                      ((END_HOUR - START_HOUR) * HOUR_HEIGHT);
                    const height = (b.duration / TOTAL_MIN) *
                      ((END_HOUR - START_HOUR) * HOUR_HEIGHT);
                    const meta = CAT_META[b.category];
                    return (
                      <div
                        key={b.id}
                        onPointerDown={(e) => onPointerDown(e, b, "move")}
                        style={{
                          top,
                          height: Math.max(height, 26),
                          left: 4,
                          right: 4,
                        }}
                        className={`group absolute cursor-grab touch-none select-none overflow-hidden rounded-lg border shadow-sm transition-shadow active:cursor-grabbing active:shadow-md ${meta.bg}`}
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`} />
                        <div className="flex h-full flex-col px-2 py-1.5 pl-2.5">
                          <div className="flex items-start justify-between gap-1">
                            <div className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
                              {meta.label}
                            </div>
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => removeBlock(b.id)}
                              className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-background hover:text-destructive group-hover:opacity-100"
                              aria-label="Remove block"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                            {b.title}
                          </div>
                          <div className="mt-auto text-[10px] text-muted-foreground">
                            {fmtTime(b.start)}–{fmtTime(b.start + b.duration)}
                          </div>
                        </div>
                        <div
                          onPointerDown={(e) => onPointerDown(e, b, "resize")}
                          className="absolute inset-x-0 bottom-0 flex h-2.5 cursor-ns-resize items-center justify-center text-muted-foreground/60 hover:text-foreground"
                        >
                          <GripHorizontal className="h-2.5 w-2.5" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBlockForm({ onAdd }: { onAdd: (b: Omit<PlanBlock, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("0");
  const [start, setStart] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const [cat, setCat] = useState<BlockCategory>("deep");

  const submit = () => {
    const [h, m] = start.split(":").map((n) => parseInt(n, 10));
    if (!title.trim() || isNaN(h) || isNaN(m)) return;
    onAdd({
      day: parseInt(day, 10),
      start: h * 60 + m,
      duration: Math.max(15, parseInt(duration, 10) || 30),
      title: title.trim(),
      category: cat,
    });
    setTitle("");
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Draft deck" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Day</Label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAY_LABELS.map((d, i) => (
                <SelectItem key={d} value={String(i)}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Category</Label>
          <Select value={cat} onValueChange={(v) => setCat(v as BlockCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deep">Deep Work</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="break">Break</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Start</Label>
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Minutes</Label>
          <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
      </div>
      <Button onClick={submit} className="w-full rounded-full bg-gradient-primary shadow-soft">
        Add to calendar
      </Button>
    </div>
  );
}
