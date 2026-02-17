import { TimeEntry, Client, Activity } from "@/types/timesheet";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { format, isWeekend } from "date-fns";
import { useEffect, useRef } from "react";

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

export function TimeGrid({ date, entries, clients, activities, isFrozen, onCellTap, startHour = 0, endHour = 23 }: TimeGridProps) {
  const HOURS = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
  const dateStr = format(date, "yyyy-MM-dd");
  const isWe = isWeekend(date);
  const clientMap = new Map(clients.map(c => [c.id, c]));
  const activityMap = new Map(activities.map(a => [a.id, a]));
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Auto-scroll to 8h on first mount
  useEffect(() => {
    if (scrollRef.current && !hasScrolled.current) {
      const row = scrollRef.current.querySelector('[data-hour="8"]');
      if (row) {
        row.scrollIntoView({ block: "start" });
        hasScrolled.current = true;
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-0.5" ref={scrollRef}>
      {isFrozen && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[hsl(var(--frozen))] text-xs text-muted-foreground mb-1">
          <Lock className="h-3 w-3" />
          <span>Journée verrouillée</span>
        </div>
      )}
      <div className="rounded-xl overflow-hidden border border-border bg-card">
        {HOURS.map(hour => {
          const entry = entries.find(e => e.date === dateStr && e.hour === hour);
          const client = entry ? clientMap.get(entry.clientId) : null;
          const activity = entry ? activityMap.get(entry.activityId) : null;

          return (
            <button
              key={hour}
              data-hour={hour}
              onClick={() => onCellTap(hour)}
              disabled={isFrozen}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left transition-all border-b border-border last:border-b-0",
                isFrozen && "opacity-60 cursor-not-allowed",
                !entry && isWe && "bg-[hsl(var(--weekend))]",
                !entry && !isWe && "hover:bg-muted/50 active:bg-muted",
              )}
              style={entry && client ? {
                backgroundColor: `hsl(${client.color} / 0.12)`,
                borderLeft: `4px solid hsl(${activity?.color || client.color})`,
              } : undefined}
            >
              <span className={cn(
                "text-xs font-mono w-10 shrink-0",
                entry ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {String(hour).padStart(2, "0")}:00
              </span>

              {entry && client && activity ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${client.color})` }}
                  />
                  <span className="text-sm font-medium truncate">{client.name}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `hsl(${activity.color} / 0.15)`,
                      color: `hsl(${activity.color})`,
                    }}
                  >
                    {activity.shortCode}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/50">—</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
