import React, { useState } from "react";
import { Plan, Place, AppState, DayPlan, PlanKey } from "../types";
import { DayPlanner } from "./DayPlanner";
import { PlaceBank } from "./PlaceBank";

interface DayPlannerWithBankProps {
  plan: Plan;
  places: Place[];
  state: AppState;
  onStateChange: (state: AppState) => void;
  activePlan: PlanKey;
}

export const DayPlannerWithBank: React.FC<DayPlannerWithBankProps> = ({
  plan,
  places,
  state,
  onStateChange,
  activePlan,
}) => {
  const [selectedDay, setSelectedDay] = useState(0);

  // 숙소 ID
  const HOTEL_ID = "hotel-dormy-inn";

  // 일자별 플랜이 없으면 기본값으로 초기화 (숙소 포함)
  const days: DayPlan[] = plan.days || [
    { date: "2025-12-13", items: [HOTEL_ID] },
    { date: "2025-12-14", items: [HOTEL_ID] },
    { date: "2025-12-15", items: [HOTEL_ID] },
    { date: "2025-12-16", items: [HOTEL_ID] },
  ];

  const handleAddToDay = (placeId: string) => {
    const currentDayPlan = days[selectedDay];

    // 이미 추가된 장소인지 확인
    if (currentDayPlan.items.includes(placeId)) return;

    // 새로운 장소 추가 (숙소가 첫 번째에 없으면 추가)
    let newItems = [...currentDayPlan.items, placeId];

    // 숙소가 없으면 맨 앞에 추가
    if (!newItems.includes(HOTEL_ID)) {
      newItems = [HOTEL_ID, ...newItems];
    }

    const newDays = [...days];
    newDays[selectedDay] = { ...currentDayPlan, items: newItems };

    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [plan.key]: {
          ...plan,
          days: newDays,
        },
      },
    });
  };

  return (
    <>
      <DayPlanner
        plan={plan}
        places={places}
        state={state}
        onStateChange={onStateChange}
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
      />
      <PlaceBank
        places={places}
        currentPlan={activePlan}
        planItems={days[selectedDay]?.items || []}
        state={state}
        onStateChange={onStateChange}
        onAddToDay={handleAddToDay}
      />
    </>
  );
};
