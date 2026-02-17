import { useLocalStorage } from "./useLocalStorage";
import { format } from "date-fns";

export function useCurrentViewDate() {
  return useLocalStorage<string>("ts-current-view-date", format(new Date(), "yyyy-MM-dd"));
}
