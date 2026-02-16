import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExportScope, exportToCSV } from "@/lib/csv-export";
import { TimeEntry, Client, Activity } from "@/types/timesheet";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  entries: TimeEntry[];
  clients: Client[];
  activities: Activity[];
}

export function ExportDialog({ open, onOpenChange, date, entries, clients, activities }: ExportDialogProps) {
  const [scope, setScope] = useState<ExportScope>("week");

  const handleExport = () => {
    exportToCSV(entries, clients, activities, date, scope);
    onOpenChange(false);
  };

  const scopes: { value: ExportScope; label: string }[] = [
    { value: "day", label: "Journée" },
    { value: "week", label: "Semaine" },
    { value: "month", label: "Mois" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Exporter en CSV</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {scopes.map(s => (
              <Button
                key={s.value}
                variant={scope === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => setScope(s.value)}
                className="flex-1"
              >
                {s.label}
              </Button>
            ))}
          </div>
          <Button onClick={handleExport}>Télécharger</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
