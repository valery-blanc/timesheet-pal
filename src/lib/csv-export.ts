import { TimeEntry, Client, Activity } from "@/types/timesheet";
import { format, startOfWeek, endOfWeek, getISOWeek } from "date-fns";
import { registerPlugin } from "@capacitor/core";

const FilesystemPlugin: any = registerPlugin("Filesystem");
const SharePlugin: any = registerPlugin("Share");

export type ExportScope = "day" | "week" | "all";

export async function exportToCSV(
  entries: TimeEntry[],
  clients: Client[],
  activities: Activity[],
  date: Date,
  scope: ExportScope,
  headers?: string[]
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
    case "all":
      startDate = "0000-00-00";
      endDate = "9999-99-99";
      filename = `timesheet-all.csv`;
      break;
  }

  const filtered = entries
    .filter(e => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const activityMap = new Map(activities.map(a => [a.id, a]));

  const headerRow = headers || ["Date", "Client", "Activité", "Heure début", "Heure fin", "Durée (h)"];
  const rows = [headerRow];

  for (const entry of filtered) {
    const client = clientMap.get(entry.clientId);
    const activity = activityMap.get(entry.activityId);
    rows.push([
      entry.date,
      client?.name || "?",
      activity?.label || "?",
      `${String(entry.hour).padStart(2, "0")}:00`,
      `${String(entry.hour + 1).padStart(2, "0")}:00`,
      "1",
    ]);
  }

  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");

  console.log("[Export] Starting export, rows:", filtered.length);

  try {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      console.log("[Export] Native platform detected, writing file:", filename);
      await FilesystemPlugin.writeFile({
        path: filename,
        data: btoa(unescape(encodeURIComponent("\ufeff" + csv))),
        directory: "CACHE",
      });
      const uriResult = await FilesystemPlugin.getUri({
        path: filename,
        directory: "CACHE",
      });
      console.log("[Export] URI:", uriResult.uri);
      await SharePlugin.share({
        title: "Timesheet Export",
        url: uriResult.uri,
      });
      console.log("[Export] Share completed");
      return;
    }
  } catch (err: any) {
    if (err?.message?.includes("cancel")) return;
    console.error("[Export] Native share failed:", JSON.stringify({
      message: err?.message, name: err?.name, code: err?.code, stack: err?.stack,
    }));
  }

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
