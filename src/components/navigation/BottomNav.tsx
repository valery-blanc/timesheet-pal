import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, CalendarDays, Settings, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExportDialog } from "@/components/timesheet/ExportDialog";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { useCurrentViewDate } from "@/hooks/useCurrentViewDate";
import { useTranslation } from "@/lib/i18n";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useTimesheetStore();
  const { t } = useTranslation();
  const [exportOpen, setExportOpen] = useState(false);
  const [currentViewDate] = useCurrentViewDate();

  const tabs = [
    { path: "/", label: t("nav.timesheet"), icon: Clock },
    { path: "/week", label: t("nav.week"), icon: CalendarDays },
    { path: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <div className="flex items-stretch">
          {tabs.map(tab => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 transition-colors touch-target",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setExportOpen(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 transition-colors touch-target text-muted-foreground"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t("nav.send")}</span>
          </button>
        </div>
      </nav>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        date={new Date(currentViewDate + "T12:00:00")}
        entries={store.entries}
        clients={store.clients}
        activities={store.activities}
      />
    </>
  );
}
