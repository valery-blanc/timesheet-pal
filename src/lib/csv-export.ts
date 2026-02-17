import { TimeEntry, Client, Activity } from "@/types/timesheet";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getISOWeek } from "date-fns";

export type ExportScope = "day" | "week" | "month";

export async function exportToCSV(
  entries: TimeEntry[],
  clients: Client[],
  activities: Activity[],
  date: Date,
  scope: ExportScope
) {
  let startDate: string, endDate: string, filename: string;
  const d = date;

  switch (scope) {
    case "day":
      startDate = endDate = format(d, "yyyy-MM-dd");
      filename = `timesheet-${startDate}.csv`;
      break;
    case "week":
      startDate = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      endDate = format(endOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      filename = `timesheet-${format(d, "yyyy")}-W${String(getISOWeek(d)).padStart(2, "0")}.csv`;
      break;
    case "month":
      startDate = format(startOfMonth(d), "yyyy-MM-dd");
      endDate = format(endOfMonth(d), "yyyy-MM-dd");
      filename = `timesheet-${format(d, "yyyy-MM")}.csv`;
      break;
  }

  const filtered = entries
    .filter(e => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const activityMap = new Map(activities.map(a => [a.id, a]));

  const rows = [["Date", "Client", "Activité", "Heure début", "Heure fin", "Durée (h)"]];

  for (const entry of filtered) {
    const client = clientMap.get(entry.clientId);
    const activity = activityMap.get(entry.activityId);
    rows.push([
      entry.date,
      client?.name || "Inconnu",
      activity?.label || "Inconnue",
      `${String(entry.hour).padStart(2, "0")}:00`,
      `${String(entry.hour + 1).padStart(2, "0")}:00`,
      "1",
    ]);
  }

  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");

  // Native platform: use Capacitor global (no imports needed, plugins are injected at runtime)
  try {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      const Filesystem = cap.Plugins?.Filesystem;
      const Share = cap.Plugins?.Share;
      if (Filesystem && Share) {
        await Filesystem.writeFile({
          path: filename,
          data: btoa("\ufeff" + csv),
          directory: "CACHE",
        });
        const uriResult = await Filesystem.getUri({
          path: filename,
          directory: "CACHE",
        });
        await Share.share({
          title: "Timesheet Export",
          url: uriResult.uri,
        });
        return;
      }
    }
  } catch (err) {
    if ((err as any)?.message?.includes("cancel")) return;
    console.error("Native share failed, falling back to web:", err);
  }

  // Web: try Web Share API with file
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const file = new File([blob], filename, { type: "text/csv;charset=utf-8;" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Timesheet Export" });
      return;
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
    }
  }

  // Fallback: direct download
  downloadFile(blob, filename);
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
