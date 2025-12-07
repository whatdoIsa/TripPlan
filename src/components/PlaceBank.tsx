import React, { useState, useMemo } from "react";
import { Place, PlanKey, AppState } from "../types";

interface PlaceBankProps {
  places: Place[];
  currentPlan: PlanKey;
  planItems: string[];
  state: AppState;
  onStateChange: (state: AppState) => void;
  onAddToDay?: (placeId: string) => void; // 일자별 보기용
}

export const PlaceBank: React.FC<PlaceBankProps> = ({
  places,
  currentPlan,
  planItems,
  state,
  onStateChange,
  onAddToDay,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  const HOTEL_ID = "hotel-dormy-inn";

  const filteredPlaces = useMemo(() => {
    // 숙소는 PlaceBank에서 숨김
    const placesWithoutHotel = places.filter(p => p.id !== HOTEL_ID);

    if (!searchQuery.trim()) return placesWithoutHotel;
    const query = searchQuery.toLowerCase();
    return placesWithoutHotel.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.area.toLowerCase().includes(query) ||
        place.type.toLowerCase().includes(query) ||
        place.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [places, searchQuery]);

  // 추천 장소 로직 - 현재 플랜에 없는 장소 중 평점 높은 순 (숙소 제외)
  const recommendedPlaces = useMemo(() => {
    return places
      .filter(p => p.id !== HOTEL_ID)
      .filter(p => !planItems.includes(p.id))
      .filter(p => p.rating !== undefined)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [places, planItems]);

  const handleAddToPlan = (placeId: string) => {
    if (planItems.includes(placeId)) return;

    // 일자별 보기인 경우
    if (onAddToDay) {
      onAddToDay(placeId);
      return;
    }

    // 일반 리스트 보기인 경우
    onStateChange({
      ...state,
      plans: {
        ...state.plans,
        [currentPlan]: {
          ...state.plans[currentPlan],
          items: [...state.plans[currentPlan].items, placeId],
        },
      },
    });
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
    <div className="bg-gray-50 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Place Bank</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="전체 장소 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 추천 장소 섹션 */}
      {recommendedPlaces.length > 0 && !searchQuery && (
        <div className="mb-4">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="w-full flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-medium"
          >
            <span>✨ AI 추천 장소 ({recommendedPlaces.length}개)</span>
            <span>{showRecommendations ? "▼" : "▶"}</span>
          </button>

          {showRecommendations && (
            <div className="mt-3 space-y-3 pb-3 border-b-2 border-purple-300">
              {recommendedPlaces.map((place) => {
                const isInPlan = planItems.includes(place.id);
                return (
                  <div key={place.id} className="bg-white border-2 border-purple-200 rounded-lg overflow-hidden shadow-sm">
                    {place.photoUrl && (
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{place.name}</h4>
                          {place.rating && (
                            <div className="text-xs text-yellow-600 font-medium">
                              ⭐ {place.rating.toFixed(1)} (평점 높음!)
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToPlan(place.id)}
                          disabled={isInPlan}
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium transition ${
                            isInPlan
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {isInPlan ? "✓" : "➕"}
                        </button>
                      </div>
                      <div className="flex gap-1 text-xs">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                          {place.type}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {place.area}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mb-2 text-sm text-gray-600">
        {filteredPlaces.length}개 장소
        {searchQuery && ` (전체 ${places.length}개 중)`}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredPlaces.map((place) => {
          const isInPlan = planItems.includes(place.id);

          return (
            <div key={place.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
              {/* 사진 */}
              {place.photoUrl && (
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="w-full h-40 object-cover"
                />
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{place.name}</h3>
                    {place.rating && (
                      <div className="text-sm text-yellow-600 font-medium">
                        ⭐ {place.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToPlan(place.id)}
                    disabled={isInPlan}
                    className={`ml-2 px-3 py-1 rounded text-sm font-medium transition ${
                      isInPlan
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isInPlan ? "✓" : "➕"}
                  </button>
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
                  <div className="flex flex-wrap gap-1">
                    {place.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {searchQuery ? "검색 결과가 없습니다" : "장소가 없습니다"}
        </div>
      )}
    </div>
  );
};
