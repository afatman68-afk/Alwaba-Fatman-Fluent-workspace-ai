import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState<number[]>([16]);
  const [animations, setAnimations] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.fontSize = `${fontSize[0]}px`;
    document.documentElement.style.setProperty(
      "--motion-reduce",
      reduceMotion || !animations ? "1" : "0",
    );
  }, [theme, fontSize, animations, reduceMotion]);

  return (
    <AppShell title="Settings" eyebrow="Preferences">
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          Settings are visual-only and live for this browser session. Nothing is saved — refreshing
          resets to defaults.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 p-5">
          <div className="mb-4 text-sm font-semibold">Appearance</div>
          <div className="space-y-5">
            <Row label="Theme">
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label={`Font size (${fontSize[0]}px)`}>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={13}
                max={20}
                step={1}
                className="w-56"
              />
            </Row>
          </div>
        </Card>

        <Card className="border-border/70 p-5">
          <div className="mb-4 text-sm font-semibold">Accessibility</div>
          <div className="space-y-5">
            <Row label="Enable animations">
              <Switch checked={animations} onCheckedChange={setAnimations} />
            </Row>
            <Row label="Reduce motion">
              <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
            </Row>
          </div>
        </Card>

        <Card className="border-border/70 p-5">
          <div className="mb-4 text-sm font-semibold">Language</div>
          <Row label="Interface language">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Card>

        <Card className="border-border/70 p-5">
          <div className="mb-4 text-sm font-semibold">Data & privacy</div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This application never stores your content. No accounts, cookies, local storage,
            analytics, or telemetry. All AI requests happen in memory during this session and
            are discarded when you close the tab.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm text-foreground">{label}</Label>
      {children}
    </div>
  );
}
