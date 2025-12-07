export type WalkLoad = "low" | "medium" | "high";

export type PlaceType = "온천" | "식사" | "카페" | "명소" | "쇼핑" | "디저트" | string;

export type Area = "도심" | "도고" | "기타" | string;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  area: Area;
  type: PlaceType;
  estMin?: number;
  walkLoad?: WalkLoad;
  tags?: string[];
  coordinates?: Coordinates;
  address?: string;
  placeId?: string; // Google Places ID
  photoUrl?: string; // Google Places Photo URL
  rating?: number; // Google Places rating
}

export type PlanKey = "A" | "B" | "C" | "D";

export interface DayPlan {
  date: string; // "2025-12-13" format
  items: string[]; // Place IDs
}

export interface Plan {
  key: PlanKey;
  title: string;
  description?: string;
  items: string[]; // Place IDs (legacy - for backward compatibility)
  days?: DayPlan[]; // New day-based structure
}

export interface AppMeta {
  city: string;
  dateRange: string;
  base: string;
}

export interface AppState {
  placeBank: Place[];
  plans: Record<PlanKey, Plan>;
  meta: AppMeta;
}
