# Plan

## 1. Royal Blue palette
Update `src/styles.css` so `--primary` is a true royal blue (approx `#4169E1`, `oklch(0.52 0.20 265)`) with a slightly deeper glow. Adjust `--gradient-primary`, `--ring`, sidebar primary, and dark-mode variants to match. All components already read semantic tokens, so nothing else needs to change.

## 2. Clean AI responses
Ask the model in every system prompt (meeting, tasks, research, chat, templates) to return plain, professional prose without markdown symbols — no `#`, `*`, `_`, backticks, or table pipes. Use plain headings in ALL CAPS or `Title:` style and simple `- ` bullets only where needed.

Also add a lightweight client-side sanitizer `stripMarkdown(text)` in `src/lib/format.ts` that removes leftover `#`, `**`, `__`, `` ` ``, and stray `|` separators before displaying, so older/streamed responses look clean too. Apply it in `AiOutputCard` and the chat message renderer.

## 3. Task Planner calendar time-grid
Add a new `WeekTimeGrid` component under `src/components/week-time-grid.tsx`:

- 7-day column grid (Mon–Sun), hourly rows from the user's working-hours range (default 7:00–20:00, 30-min slots).
- Blocks are absolutely positioned inside each day column with `top`/`height` computed from start/duration.
- Each block shows title, time range, and a colored left border by category (Deep Work, Meeting, Break, Admin).
- Drag to move (whole block) using pointer events; snap to 15-min increments.
- Bottom edge drag-handle to resize duration; min 15 min.
- Blocks can be moved across days by dragging horizontally.
- "Add block" button opens a small inline form (title, day, start, duration, category).
- Delete via an X on hover.

Parser: after the AI generates a plan, run `parsePlanToBlocks(text)` that extracts lines matching patterns like `Mon 09:00–10:30 Deep work: Draft deck` into structured blocks. If parsing yields nothing, seed with a couple of example blocks so the grid is never empty.

Tabs on the Task Planner page: `Text plan` (existing `AiOutputCard`) and `Calendar` (the new grid). State lives in React only — refresh clears it. Include an "Export .ics" button that builds an iCalendar string in-memory and triggers a download (still session-only, no storage).

## Technical notes
- Pointer events (`pointerdown`/`move`/`up`) with `setPointerCapture` for smooth drag; no external dnd library.
- `useState<Block[]>` at the page level; no persistence.
- `crypto.randomUUID()` for block ids.
- Time math in minutes-since-midnight; render helpers convert to `HH:MM`.
- Grid uses CSS grid for day columns + a positioned inner layer for blocks.
- `.ics` generated with `Blob` + `URL.createObjectURL`, same pattern as existing download.

## Files touched
- `src/styles.css` — royal blue tokens
- `src/lib/format.ts` — new `stripMarkdown`
- `src/lib/ai.functions.ts` / `src/routes/api/chat.ts` — tighten system prompts (or per-page system strings)
- `src/routes/meeting.tsx`, `src/routes/tasks.tsx`, `src/routes/research.tsx`, `src/routes/templates.tsx`, `src/routes/chat.tsx` — updated system text + sanitized display
- `src/components/ai-output-card.tsx`, `src/routes/chat.tsx` — apply `stripMarkdown` before rendering
- `src/components/week-time-grid.tsx` — new draggable grid
- `src/lib/plan-parse.ts` — new plan-text parser + `.ics` export
- `src/routes/tasks.tsx` — Tabs (Text plan / Calendar), integrate grid
