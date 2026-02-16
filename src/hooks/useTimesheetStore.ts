import { useLocalStorage } from "./useLocalStorage";
import { Client, Activity, TimeEntry, FrozenDay, CLIENT_COLORS, ACTIVITY_COLORS } from "@/types/timesheet";
import { useCallback } from "react";

const generateId = () => crypto.randomUUID();

export function useTimesheetStore() {
  const [clients, setClients] = useLocalStorage<Client[]>("ts-clients", []);
  const [activities, setActivities] = useLocalStorage<Activity[]>("ts-activities", []);
  const [entries, setEntries] = useLocalStorage<TimeEntry[]>("ts-entries", []);
  const [frozenDays, setFrozenDays] = useLocalStorage<FrozenDay[]>("ts-frozen", []);

  // Client CRUD
  const addClient = useCallback((name: string, notes: string = "") => {
    const usedColors = clients.map(c => c.color);
    const availableColor = CLIENT_COLORS.find(c => !usedColors.includes(c)) || CLIENT_COLORS[clients.length % CLIENT_COLORS.length];
    const newClient: Client = {
      id: generateId(), name, color: availableColor, active: true, notes,
      lastUsed: Date.now(), createdAt: Date.now(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, [clients, setClients]);

  const updateClient = useCallback((id: string, updates: Partial<Omit<Client, "id" | "createdAt">>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setClients]);

  const deleteClient = useCallback((id: string) => {
    const hasEntries = entries.some(e => e.clientId === id);
    if (hasEntries) return false;
    setClients(prev => prev.filter(c => c.id !== id));
    return true;
  }, [entries, setClients]);

  // Activity CRUD
  const addActivity = useCallback((label: string, shortCode: string) => {
    const usedColors = activities.map(a => a.color);
    const availableColor = ACTIVITY_COLORS.find(c => !usedColors.includes(c)) || ACTIVITY_COLORS[activities.length % ACTIVITY_COLORS.length];
    const newActivity: Activity = {
      id: generateId(), label, color: availableColor, shortCode, active: true,
      order: activities.length, createdAt: Date.now(),
    };
    setActivities(prev => [...prev, newActivity]);
    return newActivity;
  }, [activities, setActivities]);

  const updateActivity = useCallback((id: string, updates: Partial<Omit<Activity, "id" | "createdAt">>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setActivities]);

  const deleteActivity = useCallback((id: string) => {
    const hasEntries = entries.some(e => e.activityId === id);
    if (hasEntries) return false;
    setActivities(prev => prev.filter(a => a.id !== id));
    return true;
  }, [entries, setActivities]);

  const reorderActivities = useCallback((orderedIds: string[]) => {
    setActivities(prev => orderedIds.map((id, i) => {
      const act = prev.find(a => a.id === id)!;
      return { ...act, order: i };
    }));
  }, [setActivities]);

  // Time entries
  const toggleEntry = useCallback((date: string, hour: number, clientId: string, activityId: string) => {
    if (frozenDays.some(f => f.date === date)) return false;
    const existing = entries.find(e => e.date === date && e.hour === hour);
    if (existing) {
      setEntries(prev => prev.filter(e => !(e.date === date && e.hour === hour)));
    } else {
      if (!clientId || !activityId) return false;
      setEntries(prev => [...prev, { date, hour, clientId, activityId }]);
      // Update client lastUsed
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, lastUsed: Date.now() } : c));
    }
    return true;
  }, [entries, frozenDays, setEntries, setClients]);

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  const getEntriesForRange = useCallback((startDate: string, endDate: string) => {
    return entries.filter(e => e.date >= startDate && e.date <= endDate);
  }, [entries]);

  // Freeze
  const isDayFrozen = useCallback((date: string) => {
    return frozenDays.some(f => f.date === date);
  }, [frozenDays]);

  const toggleFreeze = useCallback((date: string) => {
    if (isDayFrozen(date)) {
      setFrozenDays(prev => prev.filter(f => f.date !== date));
    } else {
      setFrozenDays(prev => [...prev, { date, frozenAt: Date.now() }]);
    }
  }, [isDayFrozen, setFrozenDays]);

  return {
    clients: clients.sort((a, b) => b.lastUsed - a.lastUsed),
    activities: activities.sort((a, b) => a.order - b.order),
    entries, frozenDays,
    addClient, updateClient, deleteClient,
    addActivity, updateActivity, deleteActivity, reorderActivities,
    toggleEntry, getEntriesForDate, getEntriesForRange,
    isDayFrozen, toggleFreeze,
  };
}
