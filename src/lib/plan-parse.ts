export type BlockCategory = "deep" | "meeting" | "break" | "admin";

export interface PlanBlock {
  id: string;
  day: number; // 0=Mon..6=Sun
  start: number; // minutes since midnight
  duration: number; // minutes
  title: string;
  category: BlockCategory;
}

const DAY_MAP: Record<string, number> = {
  mon: 0, monday: 0,
  tue: 1, tues: 1, tuesday: 1,
  wed: 2, weds: 2, wednesday: 2,
  thu: 3, thur: 3, thurs: 3, thursday: 3,
  fri: 4, friday: 4,
  sat: 5, saturday: 5,
  sun: 6, sunday: 6,
};

const CAT_HINTS: { re: RegExp; cat: BlockCategory }[] = [
  { re: /\b(deep\s*work|focus|writing|coding|design|draft)\b/i, cat: "deep" },
  { re: /\b(meeting|standup|sync|call|1:1|review|interview|workshop)\b/i, cat: "meeting" },
  { re: /\b(break|lunch|walk|rest|coffee|pause)\b/i, cat: "break" },
  { re: /\b(admin|email|inbox|planning|triage|slack)\b/i, cat: "admin" },
];

function inferCategory(title: string): BlockCategory {
  for (const h of CAT_HINTS) if (h.re.test(title)) return h.cat;
  return "admin";
}

function toMinutes(h: number, m: number, ampm?: string) {
  let hh = h;
  if (ampm) {
    const a = ampm.toLowerCase();
    if (a === "pm" && hh < 12) hh += 12;
    if (a === "am" && hh === 12) hh = 0;
  }
  return hh * 60 + m;
}

// Match e.g. "Mon 09:00–10:30 Draft deck", "Tuesday 1:00pm - 2:30pm Standup"
const LINE_RE =
  /(?:^|\b)(mon(?:day)?|tue(?:s(?:day)?)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b[^A-Za-z0-9]{0,4}(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[:\-–—]?\s*(.+?)$/gim;

export function parsePlanToBlocks(text: string): PlanBlock[] {
  if (!text) return [];
  const blocks: PlanBlock[] = [];
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim().replace(/^[-*•]\s+/, "");
    LINE_RE.lastIndex = 0;
    const m = LINE_RE.exec(line);
    if (!m) continue;
    const [, dayStr, h1, m1, ap1, h2, m2, ap2, titleRaw] = m;
    const day = DAY_MAP[dayStr.toLowerCase()];
    if (day === undefined) continue;
    const start = toMinutes(parseInt(h1, 10), parseInt(m1 || "0", 10), ap1 || ap2);
    let end = toMinutes(parseInt(h2, 10), parseInt(m2 || "0", 10), ap2 || ap1);
    if (end <= start) end = start + 30;
    const title = titleRaw.replace(/[|`*_#>]+/g, "").trim().slice(0, 120) || "Untitled";
    blocks.push({
      id: crypto.randomUUID(),
      day,
      start,
      duration: end - start,
      title,
      category: inferCategory(title),
    });
  }
  return blocks;
}

export function defaultSeed(): PlanBlock[] {
  return [
    { id: crypto.randomUUID(), day: 0, start: 9 * 60, duration: 90, title: "Deep work: priority project", category: "deep" },
    { id: crypto.randomUUID(), day: 0, start: 11 * 60, duration: 30, title: "Team standup", category: "meeting" },
    { id: crypto.randomUUID(), day: 0, start: 12 * 60 + 30, duration: 45, title: "Lunch break", category: "break" },
    { id: crypto.randomUUID(), day: 1, start: 10 * 60, duration: 60, title: "Client review", category: "meeting" },
    { id: crypto.randomUUID(), day: 2, start: 9 * 60, duration: 120, title: "Deep work: writing", category: "deep" },
    { id: crypto.randomUUID(), day: 3, start: 14 * 60, duration: 60, title: "Inbox & admin", category: "admin" },
  ];
}

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function icsDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00Z"
  );
}

export function buildIcs(blocks: PlanBlock[]): string {
  // Anchor to the Monday of this week.
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Mon=0..Sun=6
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fluent AI//Task Planner//EN",
  ];
  for (const b of blocks) {
    const start = new Date(monday);
    start.setDate(monday.getDate() + b.day);
    start.setMinutes(b.start);
    const end = new Date(start.getTime() + b.duration * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@fluent-ai.local`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${b.title.replace(/[,;\\]/g, " ")}`,
      `CATEGORIES:${b.category}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
