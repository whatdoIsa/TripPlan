import React, { useState } from "react";
import { Plan, Place, AppState, DayPlan } from "../types";
import { PlanItem } from "./PlanItem";
import { SimpleMapView } from "./SimpleMapView";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DayPlannerProps {
  plan: Plan;
  places: Place[];
  state: AppState;
  onStateChange: (state: AppState) => void;
  selectedDay?: number;
  onDayChange?: (day: number) => void;
}

export const DayPlanner: React.FC<DayPlannerProps> = ({
  plan,
  places,
  state,
  onStateChange,
  selectedDay: externalSelectedDay,
  onDayChange
}) => {
  const [internalSelectedDay, setInternalSelectedDay] = useState(0);
  const selectedDay = externalSelectedDay !== undefined ? externalSelectedDay : internalSelectedDay;
  const setSelectedDay = onDayChange || setInternalSelectedDay;
  const [viewMode, setViewMode] = useState<"schedule" | "map">("schedule");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 숙소 ID (고정)
  const HOTEL_ID = "hotel-dormy-inn";

  // 일자별 플랜이 없으면 기본값으로 초기화 (숙소를 첫 번째로 추가)
  const days: DayPlan[] = plan.days || [
    { date: "2025-12-13", items: [HOTEL_ID] },
    { date: "2025-12-14", items: [HOTEL_ID] },
    { date: "2025-12-15", items: [HOTEL_ID] },
    { date: "2025-12-16", items: [HOTEL_ID] },
  ];

  const currentDayPlan = days[selectedDay];
  const dayPlaces = currentDayPlan.items
    .map((id) => places.find((p) => p.id === id))
    .filter((p): p is Place => p !== undefined);

  // 각 날짜의 총 소요시간 계산
  const calculateDayDuration = (dayPlan: DayPlan) => {
    const dayItems = dayPlan.items
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => p !== undefined);
    return dayItems.reduce((sum, place) => sum + (place.estMin || 0), 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // 숙소는 드래그 불가
    if (active.id === HOTEL_ID) {
      alert("숙소는 이동할 수 없습니다. 항상 첫 번째 위치에 고정됩니다.");
      return;
    }

    const oldIndex = currentDayPlan.items.indexOf(active.id as string);
    const newIndex = currentDayPlan.items.indexOf(over.id as string);

    // 숙소(첫 번째)를 건드리지 않도록 방지
    if (newIndex === 0) {
      alert("숙소는 항상 첫 번째 위치에 있어야 합니다.");
      return;
    }

    const newItems = arrayMove(currentDayPlan.items, oldIndex, newIndex);

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

  const handleDelete = (placeId: string) => {
    // 숙소는 삭제 불가
    if (placeId === HOTEL_ID) {
      alert("숙소는 삭제할 수 없습니다. 모든 일정은 숙소에서 시작합니다.");
      return;
    }

    const newItems = currentDayPlan.items.filter((id) => id !== placeId);
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

  const handleMoveToOtherPlan = (placeId: string, targetPlanKey: string) => {
    handleDelete(placeId);
    const targetPlan = state.plans[targetPlanKey as keyof typeof state.plans];
    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [targetPlanKey]: {
          ...targetPlan,
          items: [...targetPlan.items, placeId],
        },
      },
    });
  };

  // 동선 최적화 - 가장 가까운 순서로 재정렬 (숙소는 항상 첫 번째)
  const handleOptimizeRoute = () => {
    console.log("=== 동선 최적화 시작 ===");
    console.log("현재 일정:", currentDayPlan.items);

    // 숙소를 제외한 장소들만 가져오기
    const dayPlaces = currentDayPlan.items
      .filter(id => id !== HOTEL_ID)
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => p !== undefined && p.coordinates !== undefined);

    console.log("좌표가 있는 장소 개수:", dayPlaces.length);
    console.log("장소 목록:", dayPlaces.map(p => ({ name: p.name, id: p.id, coords: p.coordinates })));

    if (dayPlaces.length < 3) {
      alert("동선 최적화를 위해서는 숙소를 제외하고 좌표가 있는 장소가 3개 이상 필요합니다.");
      return;
    }

    // 숙소 좌표 가져오기
    const hotel = places.find(p => p.id === HOTEL_ID);
    if (!hotel || !hotel.coordinates) {
      console.error("숙소를 찾을 수 없습니다:", hotel);
      alert("숙소 정보를 찾을 수 없습니다.");
      return;
    }

    console.log("숙소 좌표:", hotel.coordinates);

    // 간단한 최근접 이웃 알고리즘 (Nearest Neighbor)
    const optimized: string[] = [HOTEL_ID]; // 숙소는 항상 첫 번째
    const remaining = [...dayPlaces];
    const placeMap = new Map(dayPlaces.map(p => [p.id, p]));

    // 숙소에서 가장 가까운 장소 찾기
    let nearestIndex = 0;
    let minDistance = Infinity;
    remaining.forEach((place, index) => {
      const distance = calculateDistance(hotel.coordinates!, place.coordinates!);
      console.log(`숙소 -> ${place.name}: ${distance.toFixed(2)}km`);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    console.log(`첫 번째 장소: ${remaining[nearestIndex].name} (${minDistance.toFixed(2)}km)`);
    optimized.push(remaining[nearestIndex].id);
    remaining.splice(nearestIndex, 1);

    // 가장 가까운 장소를 계속 찾아서 추가
    while (remaining.length > 0) {
      const lastId = optimized[optimized.length - 1];
      const last = placeMap.get(lastId)!;
      let nearestIndex = 0;
      let minDistance = Infinity;

      remaining.forEach((place, index) => {
        const distance = calculateDistance(
          last.coordinates!,
          place.coordinates!
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      console.log(`${last.name} -> ${remaining[nearestIndex].name}: ${minDistance.toFixed(2)}km`);
      optimized.push(remaining[nearestIndex].id);
      remaining.splice(nearestIndex, 1);
    }

    console.log("최적화된 순서:", optimized);

    const newDays = [...days];
    newDays[selectedDay] = { ...currentDayPlan, items: optimized };

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

    alert("동선이 최적화되었습니다!");
  };

  // 두 좌표 사이의 거리 계산 (Haversine formula)
  const calculateDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) => {
    const R = 6371; // 지구 반경 (km)
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">{plan.title}</h2>
        {plan.description && <p className="text-gray-600 text-sm mb-3 sm:mb-4">{plan.description}</p>}

        {/* 날짜 탭 */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-3 sm:mb-4 -mx-3 px-3 sm:mx-0 sm:px-0">
          {days.map((day, index) => {
            const duration = calculateDayDuration(day);
            const date = new Date(day.date);
            const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

            return (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition ${
                  selectedDay === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="font-bold text-sm sm:text-base">Day {index + 1}</div>
                <div className="text-xs whitespace-nowrap">{day.date} ({dayName})</div>
                <div className="text-xs mt-1">
                  {day.items.length}개 · {duration}분
                </div>
              </button>
            );
          })}
        </div>

        {/* 일정/지도 탭 */}
        <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 border-b">
          <button
            onClick={() => setViewMode("schedule")}
            className={`px-3 sm:px-4 py-2 font-medium transition border-b-2 text-sm sm:text-base ${
              viewMode === "schedule"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📅 <span className="hidden xs:inline">일정 목록</span><span className="xs:hidden">일정</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 sm:px-4 py-2 font-medium transition border-b-2 text-sm sm:text-base ${
              viewMode === "map"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            🗺️ <span className="hidden xs:inline">지도 보기</span><span className="xs:hidden">지도</span>
          </button>
        </div>
      </div>

      {/* 일정 목록 뷰 */}
      {viewMode === "schedule" && (
        <div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                📅 Day {selectedDay + 1} 일정
              </h3>
              <button
                onClick={handleOptimizeRoute}
                className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs sm:text-sm font-medium whitespace-nowrap"
                title="동선 최적화"
              >
                🔄 <span className="hidden xs:inline">동선 </span>최적화
              </button>
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              총 {dayPlaces.length}개 장소 · 약 {calculateDayDuration(currentDayPlan)}분
            </div>
          </div>

          {currentDayPlan.items.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-500 px-4">
                <span className="hidden sm:inline">오른쪽 </span>Place Bank에서 ➕ 버튼을 클릭하여 장소를 추가하세요
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentDayPlan.items}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {dayPlaces.map((place, index) => (
                    <PlanItem
                      key={place.id}
                      place={place}
                      index={index}
                      onDelete={() => handleDelete(place.id)}
                      onMoveToPlan={(targetPlan) => handleMoveToOtherPlan(place.id, targetPlan)}
                      currentPlan={plan.key}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* 지도 뷰 */}
      {viewMode === "map" && (
        <div>
          {currentDayPlan.items.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-500 px-4">
                일정에 장소를 추가하면 지도에 표시됩니다
              </p>
            </div>
          ) : (
            <SimpleMapView
              places={places}
              selectedPlaces={currentDayPlan.items}
            />
          )}
        </div>
      )}
    </div>
  );
};
