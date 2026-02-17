import { useLocalStorage } from "./useLocalStorage";

export interface WorkHours {
  start: number;
  end: number;
}

export function useWorkHours(): [WorkHours, (v: WorkHours) => void] {
  const [value, setValue] = useLocalStorage<WorkHours>("ts-work-hours", { start: 8, end: 18 });
  return [value, setValue];
}
