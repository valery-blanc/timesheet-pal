import { Client } from "@/types/timesheet";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface ClientSelectorProps {
  clients: Client[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ClientSelector({ clients, selectedId, onSelect }: ClientSelectorProps) {
  const { t } = useTranslation();
  const activeClients = clients.filter(c => c.active);

  return (
    <div className="flex flex-col gap-1 h-full">
      <div className="flex items-center px-1 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("client.title")}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {activeClients.length === 0 && (
            <p className="text-xs text-muted-foreground py-3 text-center">
              {t("client.none")}
            </p>
          )}
          {activeClients.map(client => (
            <button
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
                selectedId === client.id
                  ? "bg-card shadow-sm ring-2 ring-primary/30"
                  : "hover:bg-card/60 active:bg-card"
              )}
            >
              <div
                className="h-4 w-4 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: `hsl(${client.color})` }}
              />
              <span className={cn(
                "text-sm font-medium truncate",
                selectedId === client.id ? "text-foreground" : "text-muted-foreground"
              )}>
                {client.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
