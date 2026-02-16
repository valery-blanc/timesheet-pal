import { useNavigate, useLocation } from "react-router-dom";
import { Clock, CalendarDays, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", label: "Timesheet", icon: Clock },
  { path: "/week", label: "Semaine", icon: CalendarDays },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/activities", label: "Activités", icon: Briefcase },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
      </div>
    </nav>
  );
}
