import { useState } from "react";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ACTIVITY_COLORS } from "@/types/timesheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ActivitiesPage() {
  const store = useTimesheetStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", shortCode: "", color: ACTIVITY_COLORS[0], active: true });

  const openNew = () => {
    const usedColors = store.activities.map(a => a.color);
    const nextColor = ACTIVITY_COLORS.find(c => !usedColors.includes(c)) || ACTIVITY_COLORS[0];
    setForm({ label: "", shortCode: "", color: nextColor, active: true });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const act = store.activities.find(a => a.id === id);
    if (!act) return;
    setForm({ label: act.label, shortCode: act.shortCode, color: act.color, active: act.active });
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim()) { toast.error("Libellé requis"); return; }
    if (!form.shortCode.trim() || form.shortCode.trim().length > 3) { toast.error("Code court: 1-3 caractères"); return; }

    if (editingId) {
      store.updateActivity(editingId, { label: form.label.trim(), shortCode: form.shortCode.trim().toUpperCase(), color: form.color, active: form.active });
      toast.success("Activité mise à jour");
    } else {
      const a = store.addActivity(form.label.trim(), form.shortCode.trim().toUpperCase());
      store.updateActivity(a.id, { color: form.color, active: form.active });
      toast.success("Activité ajoutée");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const ok = store.deleteActivity(id);
    if (!ok) { toast.error("Impossible: des entrées existent pour cette activité"); }
    else { toast.success("Activité supprimée"); }
    setDeleteConfirm(null);
  };

  // Simple reorder: move up/down
  const moveActivity = (id: string, direction: -1 | 1) => {
    const sorted = [...store.activities];
    const idx = sorted.findIndex(a => a.id === id);
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === sorted.length - 1)) return;
    const newOrder = sorted.map(a => a.id);
    [newOrder[idx], newOrder[idx + direction]] = [newOrder[idx + direction], newOrder[idx]];
    store.reorderActivities(newOrder);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-3 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between safe-top">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Activités</h1>
          </div>
          <Button size="sm" onClick={openNew} className="gap-1">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          {store.activities.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">Aucune activité. Commencez par en ajouter une !</p>
          )}
          {store.activities.map((activity, idx) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-center gap-2 px-3 py-3 rounded-lg bg-card border border-border",
                !activity.active && "opacity-50"
              )}
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveActivity(activity.id, -1)}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                >
                  <GripVertical className="h-3 w-3 rotate-180" />
                </button>
                <button
                  onClick={() => moveActivity(activity.id, 1)}
                  disabled={idx === store.activities.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              </div>
              <div
                className="h-5 w-5 rounded shrink-0"
                style={{ backgroundColor: `hsl(${activity.color})` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `hsl(${activity.color} / 0.15)`, color: `hsl(${activity.color})` }}>
                    {activity.shortCode}
                  </span>
                  <span className="text-sm font-medium truncate">{activity.label}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => openEdit(activity.id)} className="h-8 w-8 shrink-0">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(activity.id)} className="h-8 w-8 shrink-0 text-destructive">
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
            <DialogTitle>{editingId ? "Modifier l'activité" : "Nouvelle activité"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Libellé</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex: Développement" />
            </div>
            <div>
              <Label>Code court (1-3 car.)</Label>
              <Input value={form.shortCode} onChange={e => setForm(f => ({ ...f, shortCode: e.target.value.slice(0, 3) }))} placeholder="DEV" maxLength={3} className="uppercase" />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ACTIVITY_COLORS.map(color => (
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
            <div className="flex items-center justify-between">
              <Label>Active</Label>
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
            <AlertDialogTitle>Supprimer cette activité ?</AlertDialogTitle>
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
