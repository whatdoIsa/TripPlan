import { useState } from "react";
import { PlanKey } from "./types";
import { usePersistedState } from "./hooks/usePersistedState";
import { Toolbar } from "./components/Toolbar";
import { PlanTabs } from "./components/PlanTabs";
import { DayPlannerWithBank } from "./components/DayPlannerWithBank";

function App() {
  const [state, setState] = usePersistedState();
  const [activePlan, setActivePlan] = useState<PlanKey>("A");

  const currentPlan = state.plans[activePlan];

  return (
    <div className="min-h-screen bg-gray-100">
      <Toolbar state={state} onStateChange={setState} />
      <PlanTabs activePlan={activePlan} onPlanChange={setActivePlan} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DayPlannerWithBank
            plan={currentPlan}
            places={state.placeBank}
            state={state}
            onStateChange={setState}
            activePlan={activePlan}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 현재 플랜 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-3">현재 플랜: {currentPlan.title}</h3>
            <p className="text-sm text-blue-700 mb-3">{currentPlan.description}</p>
            <div className="text-sm text-blue-800 mb-3">
              <p>도시: {state.meta.city}</p>
              <p>일정: {state.meta.dateRange}</p>
              <p>숙소: {state.meta.base}</p>
            </div>
            {currentPlan.days && currentPlan.days.length > 0 && (
              <div className="border-t border-blue-300 pt-3">
                <h4 className="font-semibold text-blue-900 mb-2">일정 상세:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentPlan.days.map((day, index) => {
                    const date = new Date(day.date);
                    const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
                    const dayPlaces = day.items
                      .map(id => state.placeBank.find(p => p.id === id))
                      .filter((p): p is typeof state.placeBank[0] => p !== undefined);
                    const totalTime = dayPlaces.reduce((sum, p) => sum + (p.estMin || 0), 0);

                    return (
                      <div key={index} className="bg-white rounded p-2 text-xs">
                        <div className="font-bold text-blue-900 mb-1">
                          Day {index + 1} - {day.date} ({dayName})
                        </div>
                        <div className="text-gray-600 mb-1">
                          {dayPlaces.length}개 장소 · 약 {totalTime}분
                        </div>
                        <ul className="space-y-0.5 ml-2">
                          {dayPlaces.map((place, idx) => (
                            <li key={place.id} className="flex items-center gap-1">
                              <span className="text-blue-600 font-bold">{idx + 1}.</span>
                              <span className="truncate">{place.name}</span>
                              <span className="text-gray-500">({place.type})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 전체 장소 정보 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">전체 장소 ({state.placeBank.length}개)</h3>
            <div className="text-sm text-green-800 max-h-96 overflow-y-auto">
              <ul className="space-y-1">
                {state.placeBank.map(place => (
                  <li key={place.id} className="flex items-center gap-2 bg-white rounded p-2">
                    <span className="font-medium flex-1 truncate">{place.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-green-200 rounded whitespace-nowrap">{place.area}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-200 rounded whitespace-nowrap">{place.type}</span>
                    {place.rating && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-200 rounded whitespace-nowrap">⭐{place.rating.toFixed(1)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
