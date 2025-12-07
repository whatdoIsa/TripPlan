import { AppState } from "../types";

const STORAGE_KEY = "matsuyama-trip-planner-state";

export const saveToLocalStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

export const loadFromLocalStorage = (): AppState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AppState;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
};

export const encodeStateToHash = (state: AppState): string => {
  try {
    const json = JSON.stringify(state);
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.error("Failed to encode state:", error);
    return "";
  }
};

export const decodeStateFromHash = (hash: string): AppState | null => {
  try {
    const json = decodeURIComponent(atob(hash));
    return JSON.parse(json) as AppState;
  } catch (error) {
    console.error("Failed to decode state:", error);
    return null;
  }
};

export const validateAppState = (state: unknown): state is AppState => {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;

  if (!Array.isArray(s.placeBank)) return false;
  if (!s.plans || typeof s.plans !== "object") return false;
  if (!s.meta || typeof s.meta !== "object") return false;

  const plans = s.plans as Record<string, unknown>;
  const requiredKeys = ["A", "B", "C", "D"];

  for (const key of requiredKeys) {
    if (!plans[key]) return false;
  }

  return true;
};

export const exportToJSON = (state: AppState): string => {
  return JSON.stringify(state, null, 2);
};

export const importFromJSON = (json: string): AppState | null => {
  try {
    const parsed = JSON.parse(json);
    if (validateAppState(parsed)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Failed to import JSON:", error);
    return null;
  }
};
