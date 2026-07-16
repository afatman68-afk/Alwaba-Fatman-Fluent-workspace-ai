import { useEffect, useState, type ReactNode } from "react";
import { Bell, Search, HelpCircle, Moon, Sun } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

export function AppShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const { dark, toggle } = useTheme();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-subtle">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-lg sm:px-5">
          <SidebarTrigger />
          <div className="hidden min-w-0 items-center gap-2 md:flex">
            {eyebrow && (
              <Badge variant="secondary" className="rounded-full font-normal">
                {eyebrow}
              </Badge>
            )}
            <h1 className="truncate text-sm font-semibold">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search this session…"
                className="h-9 w-64 rounded-full pl-9"
                aria-label="Search current session"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8 ring-2 ring-border">
              <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
                YOU
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 md:hidden">
              {eyebrow && (
                <div className="text-xs font-medium uppercase tracking-wider text-primary">
                  {eyebrow}
                </div>
              )}
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            {children}
          </div>
          <ResponsibleFooter />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ResponsibleFooter() {
  return (
    <div className="mx-auto mt-12 max-w-6xl px-1 pb-2 text-[11px] leading-relaxed text-muted-foreground">
      <p>
        AI-generated content is provided to assist workplace productivity. Users should carefully
        review, verify, and validate all summaries, schedules, recommendations, and generated
        content before relying on them for business, legal, financial, compliance, or operational
        decisions. This application does not permanently store any user-entered information.
      </p>
    </div>
  );
}
