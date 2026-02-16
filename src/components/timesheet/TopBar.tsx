import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Lock, Unlock, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const isToday = format(new Date(), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-2 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onPrevDay} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <button onClick={onToday} className="flex flex-col items-center px-2">
            <span className="text-lg font-bold leading-tight capitalize">
              {format(date, "EEE d", { locale: fr })}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {format(date, "MMMM yyyy", { locale: fr })}
            </span>
          </button>
          <Button variant="ghost" size="icon" onClick={onNextDay} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
          {!isToday && (
            <Button variant="outline" size="sm" onClick={onToday} className="text-xs h-7 ml-1">
              Auj.
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFreeze}
            className={cn("h-9 w-9", isFrozen && "text-primary")}
          >
            {isFrozen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onExport} className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
