import { useState, useCallback, useRef } from "react";
import { format, addDays, subDays } from "date-fns";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { useWorkHours } from "@/hooks/useWorkHours";
import { TopBar } from "@/components/timesheet/TopBar";
import { ClientSelector } from "@/components/timesheet/ClientSelector";
import { ActivityChips } from "@/components/timesheet/ActivityChips";
import { TimeGrid } from "@/components/timesheet/TimeGrid";
import { BottomNav } from "@/components/navigation/BottomNav";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const store = useTimesheetStore();
  const [workHours] = useWorkHours();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [unfreezeConfirm, setUnfreezeConfirm] = useState(false);

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const isFrozen = store.isDayFrozen(dateStr);
  const dayEntries = store.getEntriesForDate(dateStr);

  // Swipe handling for day navigation
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
      toast.error("Sélectionnez un client et une activité");
      return;
    }
    store.toggleEntry(dateStr, hour, selectedClientId, selectedActivityId);
  }, [dateStr, selectedClientId, selectedActivityId, store]);

  const handleToggleFreeze = () => {
    if (isFrozen) {
      setUnfreezeConfirm(true);
    } else {
      store.toggleFreeze(dateStr);
      toast.success("Journée verrouillée");
    }
  };

  const confirmUnfreeze = () => {
    store.toggleFreeze(dateStr);
    setUnfreezeConfirm(false);
    toast.success("Journée déverrouillée");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background pb-14">
      {/* Client section */}
      <div className="flex-none safe-top overflow-y-auto" style={{ height: "28%" }}>
        <div className="h-full max-w-lg mx-auto px-3 pt-2">
          <ClientSelector clients={store.clients} selectedId={selectedClientId} onSelect={setSelectedClientId} />
        </div>
      </div>

      {/* Activity section - single line */}
      <div className="flex-none py-1">
        <div className="max-w-lg mx-auto px-3">
          <ActivityChips activities={store.activities} selectedId={selectedActivityId} onSelect={setSelectedActivityId} />
        </div>
      </div>

      {/* Toolbar + Time grid */}
      <div className="flex-1 min-h-0 flex flex-col max-w-lg mx-auto w-full px-3">
        <TopBar
          date={currentDate}
          isFrozen={isFrozen}
          onPrevDay={() => setCurrentDate(d => subDays(d, 1))}
          onNextDay={() => setCurrentDate(d => addDays(d, 1))}
          onToday={() => setCurrentDate(new Date())}
          onToggleFreeze={handleToggleFreeze}
          onSave={() => toast.success("Données sauvegardées automatiquement")}
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
            <AlertDialogTitle>Déverrouiller cette journée ?</AlertDialogTitle>
            <AlertDialogDescription>Cela permettra de modifier les entrées de cette journée.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnfreeze}>Déverrouiller</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
