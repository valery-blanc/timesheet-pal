import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Lock, Unlock, Share2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  date: Date;
  isFrozen: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onToggleFreeze: () => void;
  onExport: () => void;
  onSave: () => void;
}

export function TopBar({ date, isFrozen, onPrevDay, onNextDay, onToday, onToggleFreeze, onExport, onSave }: TopBarProps) {
  const navigate = useNavigate();
  const isToday = format(new Date(), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" onClick={onPrevDay} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button onClick={onToday} className="flex flex-col items-center px-1.5">
          <span className="text-sm font-bold leading-tight capitalize">
            {format(date, "EEE d", { locale: fr })}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(date, "MMMM yyyy", { locale: fr })}
          </span>
        </button>
        <Button variant="ghost" size="icon" onClick={onNextDay} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isToday && (
          <Button variant="outline" size="sm" onClick={onToday} className="text-[10px] h-6 ml-0.5 px-2">
            Auj.
          </Button>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFreeze}
          className={cn("h-8 w-8", isFrozen && "text-primary")}
        >
          {isFrozen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate("/week")} className="h-8 w-8">
          <CalendarDays className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onExport} className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
