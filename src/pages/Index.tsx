import { useState, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { TopBar } from "@/components/timesheet/TopBar";
import { ClientSelector } from "@/components/timesheet/ClientSelector";
import { ActivityChips } from "@/components/timesheet/ActivityChips";
import { TimeGrid } from "@/components/timesheet/TimeGrid";
import { ExportDialog } from "@/components/timesheet/ExportDialog";
import { BottomNav } from "@/components/navigation/BottomNav";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const store = useTimesheetStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [unfreezeConfirm, setUnfreezeConfirm] = useState(false);

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const isFrozen = store.isDayFrozen(dateStr);
  const dayEntries = store.getEntriesForDate(dateStr);

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
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-3 py-2 flex flex-col gap-3">
        <TopBar
          date={currentDate}
          isFrozen={isFrozen}
          onPrevDay={() => setCurrentDate(d => subDays(d, 1))}
          onNextDay={() => setCurrentDate(d => addDays(d, 1))}
          onToday={() => setCurrentDate(new Date())}
          onToggleFreeze={handleToggleFreeze}
          onExport={() => setExportOpen(true)}
          onSave={() => toast.success("Données sauvegardées automatiquement")}
        />

        <ClientSelector
          clients={store.clients}
          selectedId={selectedClientId}
          onSelect={setSelectedClientId}
        />

        <ActivityChips
          activities={store.activities}
          selectedId={selectedActivityId}
          onSelect={setSelectedActivityId}
        />

        <TimeGrid
          date={currentDate}
          entries={dayEntries}
          clients={store.clients}
          activities={store.activities}
          isFrozen={isFrozen}
          onCellTap={handleCellTap}
        />
      </div>

      <BottomNav />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        date={currentDate}
        entries={store.entries}
        clients={store.clients}
        activities={store.activities}
      />

      <AlertDialog open={unfreezeConfirm} onOpenChange={setUnfreezeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déverrouiller cette journée ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela permettra de modifier les entrées de cette journée.
            </AlertDialogDescription>
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
