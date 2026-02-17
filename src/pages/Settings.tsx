import { useState } from "react";
import { useTimesheetStore } from "@/hooks/useTimesheetStore";
import { useWorkHours } from "@/hooks/useWorkHours";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CLIENT_COLORS, ACTIVITY_COLORS } from "@/types/timesheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation, LANGUAGES } from "@/lib/i18n";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const store = useTimesheetStore();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const [workHours, setWorkHours] = useWorkHours();

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientDeleteConfirm, setClientDeleteConfirm] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({ name: "", color: CLIENT_COLORS[0], notes: "", active: true });

  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityDeleteConfirm, setActivityDeleteConfirm] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({ label: "", shortCode: "", color: ACTIVITY_COLORS[0], active: true });

  // --- Client handlers ---
  const openNewClient = () => {
    const usedColors = store.clients.map(c => c.color);
    const nextColor = CLIENT_COLORS.find(c => !usedColors.includes(c)) || CLIENT_COLORS[0];
    setClientForm({ name: "", color: nextColor, notes: "", active: true });
    setEditingClientId(null);
    setClientDialogOpen(true);
  };
  const openEditClient = (id: string) => {
    const client = store.clients.find(c => c.id === id);
    if (!client) return;
    setClientForm({ name: client.name, color: client.color, notes: client.notes, active: client.active });
    setEditingClientId(id);
    setClientDialogOpen(true);
  };
  const handleSaveClient = () => {
    if (!clientForm.name.trim()) { toast.error(t("toast.name_required")); return; }
    const dup = store.clients.find(c => c.name.toLowerCase() === clientForm.name.trim().toLowerCase() && c.id !== editingClientId);
    if (dup) { toast.error(t("toast.name_exists")); return; }
    if (editingClientId) {
      store.updateClient(editingClientId, { name: clientForm.name.trim(), color: clientForm.color, notes: clientForm.notes, active: clientForm.active });
      toast.success(t("toast.client_updated"));
    } else {
      const c = store.addClient(clientForm.name.trim(), clientForm.notes);
      store.updateClient(c.id, { color: clientForm.color, active: clientForm.active });
      toast.success(t("toast.client_added"));
    }
    setClientDialogOpen(false);
  };
  const handleDeleteClient = (id: string) => {
    const ok = store.deleteClient(id);
    if (!ok) toast.error(t("toast.client_delete_fail"));
    else toast.success(t("toast.client_deleted"));
    setClientDeleteConfirm(null);
  };

  // --- Activity handlers ---
  const openNewActivity = () => {
    const usedColors = store.activities.map(a => a.color);
    const nextColor = ACTIVITY_COLORS.find(c => !usedColors.includes(c)) || ACTIVITY_COLORS[0];
    setActivityForm({ label: "", shortCode: "", color: nextColor, active: true });
    setEditingActivityId(null);
    setActivityDialogOpen(true);
  };
  const openEditActivity = (id: string) => {
    const act = store.activities.find(a => a.id === id);
    if (!act) return;
    setActivityForm({ label: act.label, shortCode: act.shortCode, color: act.color, active: act.active });
    setEditingActivityId(id);
    setActivityDialogOpen(true);
  };
  const handleSaveActivity = () => {
    if (!activityForm.label.trim()) { toast.error(t("toast.label_required")); return; }
    if (!activityForm.shortCode.trim() || activityForm.shortCode.trim().length > 3) { toast.error(t("toast.short_code_error")); return; }
    if (editingActivityId) {
      store.updateActivity(editingActivityId, { label: activityForm.label.trim(), shortCode: activityForm.shortCode.trim().toUpperCase(), color: activityForm.color, active: activityForm.active });
      toast.success(t("toast.activity_updated"));
    } else {
      const a = store.addActivity(activityForm.label.trim(), activityForm.shortCode.trim().toUpperCase());
      store.updateActivity(a.id, { color: activityForm.color, active: activityForm.active });
      toast.success(t("toast.activity_added"));
    }
    setActivityDialogOpen(false);
  };
  const handleDeleteActivity = (id: string) => {
    const ok = store.deleteActivity(id);
    if (!ok) toast.error(t("toast.activity_delete_fail"));
    else toast.success(t("toast.activity_deleted"));
    setActivityDeleteConfirm(null);
  };
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
        <div className="flex items-center gap-2 safe-top">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">{t("settings.title")}</h1>
        </div>

        <Tabs defaultValue="clients">
          <TabsList className="w-full">
            <TabsTrigger value="clients" className="flex-1">{t("settings.clients")}</TabsTrigger>
            <TabsTrigger value="activities" className="flex-1">{t("settings.activities")}</TabsTrigger>
            <TabsTrigger value="hours" className="flex-1">{t("settings.hours")}</TabsTrigger>
            <TabsTrigger value="language" className="flex-1">{t("settings.language")}</TabsTrigger>
          </TabsList>

          {/* CLIENTS TAB */}
          <TabsContent value="clients" className="flex flex-col gap-2 mt-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={openNewClient} className="gap-1">
                <Plus className="h-4 w-4" /> {t("settings.add")}
              </Button>
            </div>
            {store.clients.map(client => (
              <div key={client.id} className={cn("flex items-center gap-3 px-3 py-3 rounded-lg bg-card border border-border", !client.active && "opacity-50")}>
                <div className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${client.color})` }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{client.name}</span>
                  {client.notes && <span className="text-xs text-muted-foreground truncate block">{client.notes}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditClient(client.id)} className="h-8 w-8 shrink-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setClientDeleteConfirm(client.id)} className="h-8 w-8 shrink-0 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </TabsContent>

          {/* ACTIVITIES TAB */}
          <TabsContent value="activities" className="flex flex-col gap-2 mt-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={openNewActivity} className="gap-1">
                <Plus className="h-4 w-4" /> {t("settings.add")}
              </Button>
            </div>
            {store.activities.map((activity, idx) => (
              <div key={activity.id} className={cn("flex items-center gap-2 px-3 py-3 rounded-lg bg-card border border-border", !activity.active && "opacity-50")}>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveActivity(activity.id, -1)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5">
                    <GripVertical className="h-3 w-3 rotate-180" />
                  </button>
                  <button onClick={() => moveActivity(activity.id, 1)} disabled={idx === store.activities.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5">
                    <GripVertical className="h-3 w-3" />
                  </button>
                </div>
                <div className="h-5 w-5 rounded shrink-0" style={{ backgroundColor: `hsl(${activity.color})` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `hsl(${activity.color} / 0.15)`, color: `hsl(${activity.color})` }}>
                      {activity.shortCode}
                    </span>
                    <span className="text-sm font-medium truncate">{activity.label}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditActivity(activity.id)} className="h-8 w-8 shrink-0">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setActivityDeleteConfirm(activity.id)} className="h-8 w-8 shrink-0 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </TabsContent>

          {/* WORK HOURS TAB */}
          <TabsContent value="hours" className="flex flex-col gap-4 mt-3">
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{t("settings.hours_desc")}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>{t("settings.day_start")}</Label>
                  <Input
                    type="number" min={0} max={23} value={workHours.start}
                    onChange={e => setWorkHours({ ...workHours, start: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>{t("settings.day_end")}</Label>
                  <Input
                    type="number" min={0} max={23} value={workHours.end}
                    onChange={e => setWorkHours({ ...workHours, end: Math.min(23, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.current_range")} : {String(workHours.start).padStart(2, "0")}:00 – {String(workHours.end).padStart(2, "0")}:00
              </p>
            </div>
          </TabsContent>

          {/* LANGUAGE TAB */}
          <TabsContent value="language" className="flex flex-col gap-2 mt-3">
            <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all",
                    language === lang.code
                      ? "bg-primary/10 ring-2 ring-primary/30"
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className={cn("text-sm font-medium", language === lang.code ? "text-primary" : "text-foreground")}>
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />

      {/* Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingClientId ? t("settings.edit_client") : t("settings.new_client")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>{t("settings.name")}</Label>
              <Input value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} placeholder={t("settings.client_name_placeholder")} />
            </div>
            <div>
              <Label>{t("settings.color")}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CLIENT_COLORS.map(color => (
                  <button key={color} onClick={() => setClientForm(f => ({ ...f, color }))}
                    className={cn("h-8 w-8 rounded-full transition-transform", clientForm.color === color && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110")}
                    style={{ backgroundColor: `hsl(${color})` }} />
                ))}
              </div>
            </div>
            <div>
              <Label>{t("settings.notes")}</Label>
              <Textarea value={clientForm.notes} onChange={e => setClientForm(f => ({ ...f, notes: e.target.value }))} placeholder={t("settings.notes_placeholder")} rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settings.active")}</Label>
              <Switch checked={clientForm.active} onCheckedChange={v => setClientForm(f => ({ ...f, active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveClient} className="w-full">{t("settings.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingActivityId ? t("settings.edit_activity") : t("settings.new_activity")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>{t("settings.label")}</Label>
              <Input value={activityForm.label} onChange={e => setActivityForm(f => ({ ...f, label: e.target.value }))} placeholder={t("settings.activity_label_placeholder")} />
            </div>
            <div>
              <Label>{t("settings.short_code")}</Label>
              <Input value={activityForm.shortCode} onChange={e => setActivityForm(f => ({ ...f, shortCode: e.target.value.slice(0, 3) }))} placeholder="DEV" maxLength={3} className="uppercase" />
            </div>
            <div>
              <Label>{t("settings.color")}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ACTIVITY_COLORS.map(color => (
                  <button key={color} onClick={() => setActivityForm(f => ({ ...f, color }))}
                    className={cn("h-8 w-8 rounded-full transition-transform", activityForm.color === color && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110")}
                    style={{ backgroundColor: `hsl(${color})` }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settings.active")}</Label>
              <Switch checked={activityForm.active} onCheckedChange={v => setActivityForm(f => ({ ...f, active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveActivity} className="w-full">{t("settings.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!clientDeleteConfirm} onOpenChange={() => setClientDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.delete_client")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.delete_irreversible")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => clientDeleteConfirm && handleDeleteClient(clientDeleteConfirm)}>{t("settings.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!activityDeleteConfirm} onOpenChange={() => setActivityDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.delete_activity")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.delete_irreversible")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => activityDeleteConfirm && handleDeleteActivity(activityDeleteConfirm)}>{t("settings.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
