import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExportScope, exportToCSV } from "@/lib/csv-export";
import { TimeEntry, Client, Activity } from "@/types/timesheet";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();

  const handleExport = () => {
    const headers = [t("csv.date"), t("csv.client"), t("csv.activity"), t("csv.start"), t("csv.end"), t("csv.duration")];
    exportToCSV(entries, clients, activities, date, scope, headers);
    onOpenChange(false);
  };

  const scopes: { value: ExportScope; label: string }[] = [
    { value: "day", label: t("export.day") },
    { value: "week", label: t("export.week") },
    { value: "all", label: t("export.all") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("export.title")}</DialogTitle>
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
          <Button onClick={handleExport}>{t("export.send")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
