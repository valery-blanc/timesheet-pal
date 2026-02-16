export interface Client {
  id: string;
  name: string;
  color: string; // HSL string like "210 80% 60%"
  active: boolean;
  notes: string;
  lastUsed: number; // timestamp
  createdAt: number;
}

export interface Activity {
  id: string;
  label: string;
  color: string;
  shortCode: string; // 2-3 chars
  active: boolean;
  order: number;
  createdAt: number;
}

export interface TimeEntry {
  date: string; // YYYY-MM-DD
  hour: number; // 8-18
  clientId: string;
  activityId: string;
}

export interface FrozenDay {
  date: string; // YYYY-MM-DD
  frozenAt: number;
}

// 20 client colors (HSL hue values spread evenly + varied saturation/lightness)
export const CLIENT_COLORS: string[] = [
  "0 75% 55%",     // Red
  "15 80% 55%",    // Vermillion
  "30 85% 55%",    // Orange
  "45 80% 50%",    // Amber
  "60 70% 45%",    // Yellow
  "90 55% 50%",    // Lime
  "120 45% 45%",   // Green
  "150 55% 45%",   // Teal
  "175 60% 42%",   // Cyan
  "195 75% 45%",   // Sky
  "210 70% 50%",   // Blue
  "230 65% 55%",   // Indigo
  "255 55% 55%",   // Violet
  "280 60% 55%",   // Purple
  "300 50% 50%",   // Magenta
  "330 65% 55%",   // Pink
  "350 70% 55%",   // Rose
  "20 60% 40%",    // Brown
  "200 15% 45%",   // Slate
  "160 40% 40%",   // Emerald
];

// 10 activity colors
export const ACTIVITY_COLORS: string[] = [
  "210 90% 55%",   // Bright Blue
  "150 70% 45%",   // Green
  "30 90% 55%",    // Orange
  "280 70% 55%",   // Purple
  "350 80% 55%",   // Red
  "180 60% 45%",   // Teal
  "45 85% 50%",    // Amber
  "330 70% 55%",   // Pink
  "120 50% 40%",   // Forest
  "255 60% 50%",   // Indigo
];
