import { useState, useCallback, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      window.dispatchEvent(new StorageEvent("storage", { key }));
      return newValue;
    });
  }, [key]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const item = localStorage.getItem(key);
          if (item !== null) setStoredValue(JSON.parse(item));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return [storedValue, setValue];
}
