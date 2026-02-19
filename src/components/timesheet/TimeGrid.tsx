import { TimeEntry, Client, Activity } from "@/types/timesheet";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { format, isWeekend } from "date-fns";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

interface TimeGridProps {
  date: Date;
  entries: TimeEntry[];
  clients: Client[];
  activities: Activity[];
  isFrozen: boolean;
  onCellTap: (hour: number) => void;
  startHour?: number;
  endHour?: number;
}

function formatSlot(hour: number): string {
  const h = Math.floor(hour);
  const m = hour % 1 === 0.5 ? "30" : "00";
  return `${String(h).padStart(2, "0")}:${m}`;
}

export function TimeGrid({ date, entries, clients, activities, isFrozen, onCellTap, startHour = 0, endHour = 23 }: TimeGridProps) {
  const { t } = useTranslation();
  const HOURS = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
  const dateStr = format(date, "yyyy-MM-dd");
  const isWe = isWeekend(date);
  const clientMap = new Map(clients.map(c => [c.id, c]));
  const activityMap = new Map(activities.map(a => [a.id, a]));
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (scrollRef.current && !hasScrolled.current) {
      const row = scrollRef.current.querySelector('[data-hour="8"]');
      if (row) {
        row.scrollIntoView({ block: "start" });
        hasScrolled.current = true;
      }
    }
  }, []);

  const getEntry = (hour: number) => entries.find(e => e.date === dateStr && e.hour === hour);

  const handleLeftClick = (hour: number) => {
    // Click left = toggle both halves (full hour)
    const leftEntry = getEntry(hour);
    const rightEntry = getEntry(hour + 0.5);
    if (leftEntry || rightEntry) {
      // Clear both
      if (leftEntry) onCellTap(hour);
      if (rightEntry) onCellTap(hour + 0.5);
    } else {
      // Fill both
      onCellTap(hour);
      onCellTap(hour + 0.5);
    }
  };

  const handleRightClick = (hour: number) => {
    // Click right = toggle only the :30 slot
    onCellTap(hour + 0.5);
  };

  return (
    <div className="flex flex-col gap-0.5" ref={scrollRef}>
      {isFrozen && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[hsl(var(--frozen))] text-xs text-muted-foreground mb-1">
          <Lock className="h-3 w-3" />
          <span>{t("timegrid.frozen")}</span>
        </div>
      )}
      <div className="rounded-xl overflow-hidden border border-border bg-card">
        {HOURS.map(hour => {
          const leftEntry = getEntry(hour);
          const rightEntry = getEntry(hour + 0.5);
          const leftClient = leftEntry ? clientMap.get(leftEntry.clientId) : null;
          const leftActivity = leftEntry ? activityMap.get(leftEntry.activityId) : null;
          const rightClient = rightEntry ? clientMap.get(rightEntry.clientId) : null;
          const rightActivity = rightEntry ? activityMap.get(rightEntry.activityId) : null;

          const sameContent = leftEntry && rightEntry && leftEntry.clientId === rightEntry.clientId && leftEntry.activityId === rightEntry.activityId;
          const bothEmpty = !leftEntry && !rightEntry;

          return (
            <div
              key={hour}
              data-hour={hour}
              className={cn(
                "w-full flex items-center border-b border-border last:border-b-0",
                isFrozen && "opacity-60 cursor-not-allowed",
              )}
            >
              {/* Hour label */}
              <span className={cn(
                "text-xs font-mono w-10 shrink-0 px-2 py-2 self-center",
                (leftEntry || rightEntry) ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {String(hour).padStart(2, "0")}:00
              </span>

              {sameContent ? (
                /* Merged full row: same client+activity on both halves */
                <button
                  onClick={() => !isFrozen && handleLeftClick(hour)}
                  disabled={isFrozen}
                  className="flex-[2] flex items-center gap-1.5 px-2 py-2 min-w-0 transition-all"
                  style={{
                    backgroundColor: `hsl(${leftClient!.color} / 0.12)`,
                  }}
                >
                  <span className="text-sm font-medium">{leftClient!.name}</span>
                  <span
                    className="text-[10px] font-bold px-1 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: `hsl(${leftActivity!.color} / 0.15)`,
                      color: `hsl(${leftActivity!.color})`,
                    }}
                  >
                    {leftActivity!.shortCode}
                  </span>
                </button>
              ) : (
                <>
                  {/* Left half (:00) */}
                  <button
                    onClick={() => !isFrozen && handleLeftClick(hour)}
                    disabled={isFrozen}
                    className={cn(
                      "flex-1 flex items-center gap-1.5 px-2 py-2 min-w-0 transition-all border-r border-border/50",
                      !leftEntry && isWe && "bg-[hsl(var(--weekend))]",
                      !leftEntry && !isWe && "hover:bg-muted/50 active:bg-muted",
                    )}
                    style={leftEntry && leftClient ? {
                      backgroundColor: `hsl(${leftClient.color} / 0.12)`,
                    } : undefined}
                  >
                    {leftEntry && leftClient && leftActivity ? (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn("text-sm font-medium", rightEntry ? "truncate" : "")}>{leftClient.name}</span>
                        <span
                          className="text-[10px] font-bold px-1 py-0.5 rounded shrink-0"
                          style={{
                            backgroundColor: `hsl(${leftActivity.color} / 0.15)`,
                            color: `hsl(${leftActivity.color})`,
                          }}
                        >
                          {leftActivity.shortCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </button>

                  {/* Right half (:30) */}
                  <button
                    onClick={() => !isFrozen && handleRightClick(hour)}
                    disabled={isFrozen}
                    className={cn(
                      "flex-1 flex items-center gap-1.5 px-2 py-2 min-w-0 transition-all",
                      !rightEntry && isWe && "bg-[hsl(var(--weekend))]",
                      !rightEntry && !isWe && "hover:bg-muted/50 active:bg-muted",
                    )}
                    style={rightEntry && rightClient ? {
                      backgroundColor: `hsl(${rightClient.color} / 0.12)`,
                    } : undefined}
                  >
                    {rightEntry && rightClient && rightActivity ? (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn("text-sm font-medium", leftEntry ? "truncate" : "")}>{rightClient.name}</span>
                        <span
                          className="text-[10px] font-bold px-1 py-0.5 rounded shrink-0"
                          style={{
                            backgroundColor: `hsl(${rightActivity.color} / 0.15)`,
                            color: `hsl(${rightActivity.color})`,
                          }}
                        >
                          {rightActivity.shortCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
