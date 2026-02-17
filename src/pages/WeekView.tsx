import { useState, useRef, useEffect } from "react";
import { format, startOfWeek, addDays, isWeekend } from "date-fns";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCurrentViewDate } from "@/hooks/useCurrentViewDate";
import { useTranslation } from "@/lib/i18n";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekViewPage() {
  const store = useTimesheetStore();
  const navigate = useNavigate();
  const { t, dateLocale } = useTranslation();
  const [, setCurrentViewDate] = useCurrentViewDate();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const clientMap = new Map(store.clients.map(c => [c.id, c]));
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      const row = tableRef.current.querySelector('[data-hour="8"]');
      if (row) row.scrollIntoView({ block: "start" });
    }
  }, []);

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const thisWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    setCurrentViewDate(dateStr);
    navigate("/");
    // Dispatch event so Index picks up the date
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("navigate-to-date", { detail: dateStr }));
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-2 py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between safe-top">
          <Button variant="ghost" size="icon" onClick={prevWeek} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <button onClick={thisWeek} className="text-center">
            <span className="text-sm font-bold">
              {t("weekview.week_of")} {format(weekStart, "d MMM", { locale: dateLocale })}
            </span>
          </button>
          <Button variant="ghost" size="icon" onClick={nextWeek} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div ref={tableRef} className="overflow-auto rounded-xl border border-border bg-card flex-1" style={{ maxHeight: "60vh" }}>
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-20 bg-card">
              <tr>
                <th className="sticky left-0 bg-card z-30 px-1.5 py-2 text-muted-foreground font-medium w-12">{t("weekview.hour")}</th>
                {days.map(day => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const frozen = store.isDayFrozen(dateStr);
                  const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;
                  return (
                    <th key={dateStr} className={cn(
                      "px-1 py-2 text-center font-medium min-w-[60px] cursor-pointer hover:bg-muted/50 transition-colors",
                      isWeekend(day) && "text-muted-foreground/50",
                      isToday && "text-primary"
                    )}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="capitalize">{format(day, "EEE", { locale: dateLocale })}</span>
                        <span className={cn("text-[11px]", isToday && "bg-primary text-primary-foreground rounded-full px-1.5 py-0.5")}>
                          {format(day, "d")}
                        </span>
                        {frozen && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} data-hour={hour} className="border-t border-border">
                  <td className="sticky left-0 bg-card z-10 px-1.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                    {String(hour).padStart(2, "0")}:00
                  </td>
                  {days.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const entry = store.entries.find(e => e.date === dateStr && e.hour === hour);
                    const client = entry ? clientMap.get(entry.clientId) : null;
                    return (
                      <td
                        key={dateStr}
                        className={cn(
                          "px-0.5 py-0.5 text-center",
                          isWeekend(day) && !entry && "bg-[hsl(var(--weekend))]"
                        )}
                      >
                        {client && (
                          <div
                            className="rounded h-5 w-full flex items-center justify-center px-0.5"
                            style={{ backgroundColor: `hsl(${client.color} / 0.3)` }}
                            title={client.name}
                          >
                            <span className="text-[8px] font-medium truncate leading-none" style={{ color: `hsl(${client.color})` }}>
                              {client.name}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {days.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            const count = store.entries.filter(e => e.date === dateStr).length;
            return (
              <div key={dateStr} className="flex-1 min-w-[60px] text-center py-2 rounded-lg bg-card border border-border">
                <div className="text-lg font-bold">{count}h</div>
                <div className="text-[10px] text-muted-foreground capitalize">{format(day, "EEE", { locale: dateLocale })}</div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
