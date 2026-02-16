import { useState } from "react";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CLIENT_COLORS } from "@/types/timesheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClientsPage() {
  const store = useTimesheetStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", color: CLIENT_COLORS[0], notes: "", active: true });

  const openNew = () => {
    const usedColors = store.clients.map(c => c.color);
    const nextColor = CLIENT_COLORS.find(c => !usedColors.includes(c)) || CLIENT_COLORS[0];
    setForm({ name: "", color: nextColor, notes: "", active: true });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const client = store.clients.find(c => c.id === id);
    if (!client) return;
    setForm({ name: client.name, color: client.color, notes: client.notes, active: client.active });
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    const duplicate = store.clients.find(c => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editingId);
    if (duplicate) { toast.error("Ce nom existe déjà"); return; }

    if (editingId) {
      store.updateClient(editingId, { name: form.name.trim(), color: form.color, notes: form.notes, active: form.active });
      toast.success("Client mis à jour");
    } else {
      const c = store.addClient(form.name.trim(), form.notes);
      store.updateClient(c.id, { color: form.color, active: form.active });
      toast.success("Client ajouté");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const ok = store.deleteClient(id);
    if (!ok) { toast.error("Impossible: des entrées existent pour ce client"); }
    else { toast.success("Client supprimé"); }
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-3 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between safe-top">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Clients</h1>
          </div>
          <Button size="sm" onClick={openNew} className="gap-1">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          {store.clients.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Aucun client. Commencez par en ajouter un !</p>
          )}
          {store.clients.map(client => (
            <div
              key={client.id}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg bg-card border border-border",
                !client.active && "opacity-50"
              )}
            >
              <div className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${client.color})` }} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{client.name}</span>
                {client.notes && <span className="text-xs text-muted-foreground truncate block">{client.notes}</span>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(client.id)} className="h-8 w-8 shrink-0">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(client.id)} className="h-8 w-8 shrink-0 text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le client" : "Nouveau client"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom du client" />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CLIENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform",
                      form.color === color && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                    )}
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes optionnelles" rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Actif</Label>
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
