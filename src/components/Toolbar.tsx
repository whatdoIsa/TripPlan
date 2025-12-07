import React, { useState } from "react";
import { AppState, Place, WalkLoad } from "../types";
import { exportToJSON, importFromJSON, encodeStateToHash } from "../utils/serializer";
import { PlaceSearchModal } from "./PlaceSearchModal";
import { APIProvider } from "@vis.gl/react-google-maps";
import { initialAppState } from "../data/seedData";

interface ToolbarProps {
  state: AppState;
  onStateChange: (state: AppState) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ state, onStateChange }) => {
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [importText, setImportText] = useState("");
  const [newPlace, setNewPlace] = useState<{
    name: string;
    area: string;
    type: string;
    estMin: number;
    walkLoad: WalkLoad;
  }>({
    name: "",
    area: "도심",
    type: "명소",
    estMin: 30,
    walkLoad: "low",
  });

  const handleAddPlace = () => {
    if (!newPlace.name.trim()) return;

    const place: Place = {
      id: `custom-${Date.now()}`,
      ...newPlace,
    };

    // 최상단에 추가
    onStateChange({
      ...state,
      placeBank: [place, ...state.placeBank],
    });

    setNewPlace({
      name: "",
      area: "도심",
      type: "명소",
      estMin: 30,
      walkLoad: "low",
    });
    setShowAddPlace(false);
  };

  const handleExport = () => {
    const json = exportToJSON(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matsuyama-trip-plan.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const imported = importFromJSON(importText);
    if (imported) {
      onStateChange(imported);
      setImportText("");
      setShowImport(false);
      alert("성공적으로 불러왔습니다!");
    } else {
      alert("유효하지 않은 JSON 파일입니다.");
    }
  };

  const handleShare = () => {
    const hash = encodeStateToHash(state);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;

    navigator.clipboard
      .writeText(url)
      .then(() => alert("공유 링크가 클립보드에 복사되었습니다!"))
      .catch(() => alert("링크 복사에 실패했습니다."));
  };

  const handleAddPlaceFromSearch = (place: Place) => {
    // 최상단에 추가
    onStateChange({
      ...state,
      placeBank: [place, ...state.placeBank],
    });
  };

  const handleReset = () => {
    if (confirm("모든 데이터를 초기화하고 기본 장소 목록으로 되돌립니다. 계속하시겠습니까?")) {
      localStorage.removeItem("tripPlanState");
      window.location.hash = "";
      onStateChange(initialAppState);
      alert("초기화되었습니다!");
    }
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <div className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-3">Matsuyama Trip Planner</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPlaceSearch(true)}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition text-sm font-medium"
          >
            🔍 장소 검색
          </button>
          <button
            onClick={() => setShowAddPlace(!showAddPlace)}
            className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition text-sm font-medium"
          >
            장소 추가
          </button>
          <button
            onClick={handleExport}
            className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition text-sm font-medium"
          >
            Export JSON
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition text-sm font-medium"
          >
            Import JSON
          </button>
          <button
            onClick={handleShare}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm font-medium"
          >
            Share Link
          </button>
          <button
            onClick={handleReset}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-medium"
          >
            🔄 초기화
          </button>
        </div>

        {showAddPlace && (
          <div className="mt-4 bg-white text-gray-800 p-4 rounded shadow">
            <h3 className="font-bold mb-2">새 장소 추가</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="장소명"
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={newPlace.area}
                onChange={(e) => setNewPlace({ ...newPlace, area: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="도심">도심</option>
                <option value="도고">도고</option>
                <option value="기타">기타</option>
              </select>
              <select
                value={newPlace.type}
                onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="온천">온천</option>
                <option value="식사">식사</option>
                <option value="카페">카페</option>
                <option value="명소">명소</option>
                <option value="쇼핑">쇼핑</option>
                <option value="디저트">디저트</option>
              </select>
              <input
                type="number"
                placeholder="예상 시간(분)"
                value={newPlace.estMin}
                onChange={(e) => setNewPlace({ ...newPlace, estMin: parseInt(e.target.value) })}
                className="border p-2 rounded"
              />
              <select
                value={newPlace.walkLoad}
                onChange={(e) =>
                  setNewPlace({ ...newPlace, walkLoad: e.target.value as WalkLoad })
                }
                className="border p-2 rounded"
              >
                <option value="low">걷기 - 낮음</option>
                <option value="medium">걷기 - 중간</option>
                <option value="high">걷기 - 높음</option>
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAddPlace}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                추가
              </button>
              <button
                onClick={() => setShowAddPlace(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {showImport && (
          <div className="mt-4 bg-white text-gray-800 p-4 rounded shadow">
            <h3 className="font-bold mb-2">JSON Import</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="JSON 데이터를 붙여넣으세요..."
              className="w-full border p-2 rounded h-32"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleImport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                불러오기
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {showPlaceSearch && apiKey && (
        <APIProvider apiKey={apiKey}>
          <PlaceSearchModal
            onClose={() => setShowPlaceSearch(false)}
            onAddPlace={handleAddPlaceFromSearch}
          />
        </APIProvider>
      )}
    </div>
  );
};
