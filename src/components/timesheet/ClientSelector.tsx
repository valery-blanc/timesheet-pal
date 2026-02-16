import { Client } from "@/types/timesheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientSelectorProps {
  clients: Client[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ClientSelector({ clients, selectedId, onSelect }: ClientSelectorProps) {
  const navigate = useNavigate();
  const activeClients = clients.filter(c => c.active);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</span>
        <button
          onClick={() => navigate("/clients")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-3 w-3" />
          Gérer
        </button>
      </div>
      <ScrollArea className="max-h-[28vh]">
        <div className="flex flex-col gap-1">
          {activeClients.length === 0 && (
            <p className="text-xs text-muted-foreground py-3 text-center">
              Aucun client. <button onClick={() => navigate("/clients")} className="underline text-primary">Ajouter un client</button>
            </p>
          )}
          {activeClients.map(client => (
            <button
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all touch-target",
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
      </ScrollArea>
    </div>
  );
}
