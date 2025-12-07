import React, { useState, useMemo } from "react";
import { Plan, Place, PlanKey, AppState } from "../types";
import { PlanItem } from "./PlanItem";
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface PlanBoardProps {
  plan: Plan;
  places: Place[];
  state: AppState;
  onStateChange: (state: AppState) => void;
}

export const PlanBoard: React.FC<PlanBoardProps> = ({ plan, places, state, onStateChange }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const planPlaces = useMemo(() => {
    return plan.items
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => p !== undefined);
  }, [plan.items, places]);

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return planPlaces;
    const query = searchQuery.toLowerCase();
    return planPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.area.toLowerCase().includes(query) ||
        place.type.toLowerCase().includes(query) ||
        place.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [planPlaces, searchQuery]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = plan.items.indexOf(active.id as string);
    const newIndex = plan.items.indexOf(over.id as string);

    const newItems = arrayMove(plan.items, oldIndex, newIndex);

    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [plan.key]: {
          ...plan,
          items: newItems,
        },
      },
    });
  };

  const handleDelete = (placeId: string) => {
    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [plan.key]: {
          ...plan,
          items: plan.items.filter((id) => id !== placeId),
        },
      },
    });
  };

  const handleMoveToPlan = (placeId: string, targetPlan: PlanKey) => {
    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [plan.key]: {
          ...plan,
          items: plan.items.filter((id) => id !== placeId),
        },
        [targetPlan]: {
          ...state.plans[targetPlan],
          items: [...state.plans[targetPlan].items, placeId],
        },
      },
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = arrayMove(plan.items, index, index - 1);
    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [plan.key]: {
          ...plan,
          items: newItems,
        },
      },
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === plan.items.length - 1) return;
    const newItems = arrayMove(plan.items, index, index + 1);
    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [plan.key]: {
          ...plan,
          items: newItems,
        },
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{plan.title}</h2>
        {plan.description && <p className="text-gray-600 mt-1">{plan.description}</p>}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="플랜 내 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-2 text-sm text-gray-600">
        총 {filteredPlaces.length}개 장소
        {searchQuery && ` (전체 ${planPlaces.length}개 중)`}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={plan.items} strategy={verticalListSortingStrategy}>
          {filteredPlaces.map((place, index) => (
            <PlanItem
              key={place.id}
              place={place}
              index={plan.items.indexOf(place.id)}
              onDelete={() => handleDelete(place.id)}
              onMoveToPlan={(target) => handleMoveToPlan(place.id, target)}
              onMoveUp={index > 0 ? () => handleMoveUp(plan.items.indexOf(place.id)) : undefined}
              onMoveDown={
                index < planPlaces.length - 1
                  ? () => handleMoveDown(plan.items.indexOf(place.id))
                  : undefined
              }
              currentPlan={plan.key}
            />
          ))}
        </SortableContext>
      </DndContext>

      {filteredPlaces.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {searchQuery ? "검색 결과가 없습니다" : "아직 추가된 장소가 없습니다"}
        </div>
      )}
    </div>
  );
};
