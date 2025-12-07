import React from "react";
import { Place, PlanKey } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PlanItemProps {
  place: Place;
  index: number;
  onDelete: () => void;
  onMoveToPlan: (targetPlan: PlanKey) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  currentPlan: PlanKey;
}

export const PlanItem: React.FC<PlanItemProps> = ({
  place,
  index,
  onDelete,
  onMoveToPlan,
  onMoveUp,
  onMoveDown,
  currentPlan,
}) => {
  // 숙소 ID
  const HOTEL_ID = "hotel-dormy-inn";
  const isHotel = place.id === HOTEL_ID;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    disabled: isHotel, // 숙소는 드래그 비활성화
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getWalkLoadColor = (load?: string) => {
    switch (load) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWalkLoadText = (load?: string) => {
    switch (load) {
      case "low":
        return "낮음";
      case "medium":
        return "중간";
      case "high":
        return "높음";
      default:
        return "-";
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-lg p-4 mb-2 shadow-sm ${isHotel ? 'border-blue-400 bg-blue-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className={`text-xl mt-1 ${isHotel ? 'text-gray-300 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600'}`}
        >
          ☰
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="inline-block bg-blue-600 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-2">
                {index + 1}
              </span>
              <span className="font-bold text-lg">{place.name}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {place.area}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              {place.type}
            </span>
            {place.estMin && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                {place.estMin}분
              </span>
            )}
            {place.walkLoad && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${getWalkLoadColor(place.walkLoad)}`}>
                걷기: {getWalkLoadText(place.walkLoad)}
              </span>
            )}
          </div>

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {place.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {isHotel ? (
              <div className="text-xs text-blue-600 font-medium py-1">
                🏨 숙소는 이동/삭제할 수 없습니다
              </div>
            ) : (
              <>
                <select
                  onChange={(e) => {
                    const target = e.target.value as PlanKey;
                    if (target) onMoveToPlan(target);
                    e.target.value = "";
                  }}
                  className="text-xs border rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="" disabled>
                    다른 플랜으로 이동
                  </option>
                  {(["A", "B", "C", "D"] as PlanKey[])
                    .filter((key) => key !== currentPlan)
                    .map((key) => (
                      <option key={key} value={key}>
                        Plan {key}
                      </option>
                    ))}
                </select>

                {onMoveUp && (
                  <button
                    onClick={onMoveUp}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    aria-label="위로 이동"
                  >
                    ↑
                  </button>
                )}

                {onMoveDown && (
                  <button
                    onClick={onMoveDown}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    aria-label="아래로 이동"
                  >
                    ↓
                  </button>
                )}

                <button
                  onClick={onDelete}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
