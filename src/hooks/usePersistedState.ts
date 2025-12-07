import { useState, useEffect } from "react";
import { AppState } from "../types";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  decodeStateFromHash,
} from "../utils/serializer";
import { initialAppState } from "../data/seedData";

// 숙소 ID
const HOTEL_ID = "hotel-dormy-inn";

// 마이그레이션: 모든 플랜의 모든 날짜에 숙소가 첫 번째에 있는지 확인
const ensureHotelFirst = (state: AppState): AppState => {
  let migratedState = { ...state };

  // 1. placeBank 업데이트: seedData의 최신 장소 데이터로 업데이트 (좌표 포함)
  const updatedPlaceBank = migratedState.placeBank.map((place) => {
    const seedPlace = initialAppState.placeBank.find((p) => p.id === place.id);
    if (seedPlace) {
      // seedData에 있는 장소면 최신 데이터로 업데이트 (좌표 포함)
      return seedPlace;
    }
    // seedData에 없는 사용자 추가 장소는 그대로 유지
    return place;
  });

  // seedData에만 있고 placeBank에 없는 장소 추가 (새로운 장소)
  initialAppState.placeBank.forEach((seedPlace) => {
    if (!updatedPlaceBank.some((p) => p.id === seedPlace.id)) {
      updatedPlaceBank.push(seedPlace);
    }
  });

  migratedState = {
    ...migratedState,
    placeBank: updatedPlaceBank,
  };

  // 2. 숙소가 placeBank 맨 앞에 있는지 확인
  const hotelIndex = migratedState.placeBank.findIndex((p) => p.id === HOTEL_ID);
  if (hotelIndex > 0) {
    const hotel = migratedState.placeBank[hotelIndex];
    const newPlaceBank = [...migratedState.placeBank];
    newPlaceBank.splice(hotelIndex, 1);
    newPlaceBank.unshift(hotel);
    migratedState = {
      ...migratedState,
      placeBank: newPlaceBank,
    };
  }

  // 3. 모든 플랜의 모든 날짜에 숙소가 첫 번째에 있는지 확인
  const migratedPlans = { ...migratedState.plans };

  Object.keys(migratedPlans).forEach((planKey) => {
    const plan = migratedPlans[planKey as keyof typeof migratedPlans];
    if (plan.days) {
      plan.days = plan.days.map((day) => {
        const items = [...day.items];

        // 숙소가 없으면 추가
        if (!items.includes(HOTEL_ID)) {
          return { ...day, items: [HOTEL_ID, ...items] };
        }

        // 숙소가 첫 번째가 아니면 이동
        const hotelIndex = items.indexOf(HOTEL_ID);
        if (hotelIndex > 0) {
          items.splice(hotelIndex, 1);
          items.unshift(HOTEL_ID);
          return { ...day, items };
        }

        return day;
      });
    }
  });

  return { ...migratedState, plans: migratedPlans };
};

export const usePersistedState = (): [
  AppState,
  React.Dispatch<React.SetStateAction<AppState>>
] => {
  const [state, setState] = useState<AppState>(() => {
    // Priority: URL hash > localStorage > seed data
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeStateFromHash(hash);
      if (decoded) {
        return ensureHotelFirst(decoded);
      }
    }

    const stored = loadFromLocalStorage();
    if (stored) {
      return ensureHotelFirst(stored);
    }

    return ensureHotelFirst(initialAppState);
  });

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  return [state, setState];
};
