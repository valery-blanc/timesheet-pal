import { Activity } from "@/types/timesheet";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { Link } from "react-router-dom";

interface ActivityChipsProps {
  activities: Activity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ActivityChips({ activities, selectedId, onSelect }: ActivityChipsProps) {
  const { t } = useTranslation();
  const activeActivities = activities.filter(a => a.active);

  return (
    <div className="flex flex-col gap-1 h-full">
      <div className="flex items-center px-1 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("activity.title")}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-1.5 whitespace-nowrap pb-1">
          {activeActivities.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">
              {t("activity.none").split("{link}").map((part, i) => {
                if (i === 0) return part;
                const [linkText, rest] = part.split("{/link}");
                return <span key={i}><Link to="/settings?tab=activities" className="underline text-primary font-medium">{linkText}</Link>{rest}</span>;
              })}
            </p>
          )}
          {activeActivities.map(activity => (
            <button
              key={activity.id}
              onClick={() => onSelect(activity.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all shrink-0",
                selectedId === activity.id
                  ? "shadow-sm ring-2 ring-offset-1 ring-offset-background"
                  : "opacity-70 hover:opacity-100 active:opacity-100"
              )}
              style={{
                backgroundColor: `hsl(${activity.color} / ${selectedId === activity.id ? 0.2 : 0.1})`,
                color: `hsl(${activity.color})`,
                boxShadow: selectedId === activity.id ? `0 0 0 2px hsl(${activity.color} / 0.3)` : undefined,
              }}
            >
              <span className="font-bold">{activity.shortCode}</span>
              <span>{activity.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
