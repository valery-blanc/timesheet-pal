import { useState, useCallback, useRef, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { format, addDays, subDays } from "date-fns";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { useWorkHours } from "@/hooks/useWorkHours";
import { useCurrentViewDate } from "@/hooks/useCurrentViewDate";
import { TopBar } from "@/components/timesheet/TopBar";
import { ClientSelector } from "@/components/timesheet/ClientSelector";
import { ActivityChips } from "@/components/timesheet/ActivityChips";
import { TimeGrid } from "@/components/timesheet/TimeGrid";
import { BottomNav } from "@/components/navigation/BottomNav";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const store = useTimesheetStore();
  const { t } = useTranslation();
  const [workHours] = useWorkHours();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useLocalStorage<string | null>("ts-selected-client", null);
  const [selectedActivityId, setSelectedActivityId] = useLocalStorage<string | null>("ts-selected-activity", null);
  const [unfreezeConfirm, setUnfreezeConfirm] = useState(false);
  const [, setCurrentViewDate] = useCurrentViewDate();

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const isFrozen = store.isDayFrozen(dateStr);
  const dayEntries = store.getEntriesForDate(dateStr);

  // Sync current viewed date for export
  useEffect(() => {
    setCurrentViewDate(dateStr);
  }, [dateStr, setCurrentViewDate]);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) setCurrentDate(d => subDays(d, 1));
      else setCurrentDate(d => addDays(d, 1));
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, []);

  const handleCellTap = useCallback((hour: number) => {
    if (!selectedClientId || !selectedActivityId) {
      const existing = store.entries.find(e => e.date === dateStr && e.hour === hour);
      if (existing) {
        store.toggleEntry(dateStr, hour, "", "");
        return;
      }
      toast.error(t("toast.select_client_activity"));
      return;
    }
    store.toggleEntry(dateStr, hour, selectedClientId, selectedActivityId);
  }, [dateStr, selectedClientId, selectedActivityId, store, t]);

  const handleToggleFreeze = () => {
    if (isFrozen) {
      setUnfreezeConfirm(true);
    } else {
      store.toggleFreeze(dateStr);
      toast.success(t("toast.day_locked"));
    }
  };

  const confirmUnfreeze = () => {
    store.toggleFreeze(dateStr);
    setUnfreezeConfirm(false);
    toast.success(t("toast.day_unlocked"));
  };

  // Allow navigating to a specific date (from WeekView)
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setCurrentDate(new Date(e.detail + "T12:00:00"));
    };
    window.addEventListener("navigate-to-date" as any, handler);
    return () => window.removeEventListener("navigate-to-date" as any, handler);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-background pb-14">
      <div className="flex-none safe-top overflow-y-auto" style={{ height: "28%" }}>
        <div className="h-full max-w-lg mx-auto px-3 pt-2">
          <ClientSelector clients={store.clients} selectedId={selectedClientId} onSelect={setSelectedClientId} />
        </div>
      </div>

      <div className="flex-none py-1">
        <div className="max-w-lg mx-auto px-3">
          <ActivityChips activities={store.activities} selectedId={selectedActivityId} onSelect={setSelectedActivityId} />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full px-3">
        <TopBar
          date={currentDate}
          isFrozen={isFrozen}
          onPrevDay={() => setCurrentDate(d => subDays(d, 1))}
          onNextDay={() => setCurrentDate(d => addDays(d, 1))}
          onToday={() => setCurrentDate(new Date())}
          onToggleFreeze={handleToggleFreeze}
          onSave={() => toast.success(t("toast.auto_saved"))}
        />

        <div
          className="flex-1 min-h-0 overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <TimeGrid
            date={currentDate}
            entries={dayEntries}
            clients={store.clients}
            activities={store.activities}
            isFrozen={isFrozen}
            onCellTap={handleCellTap}
            startHour={workHours.start}
            endHour={workHours.end}
          />
        </div>
      </div>

      <BottomNav />

      <AlertDialog open={unfreezeConfirm} onOpenChange={setUnfreezeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("index.unlock_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("index.unlock_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnfreeze}>{t("index.unlock")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
