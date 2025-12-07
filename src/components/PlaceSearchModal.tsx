import React, { useState } from "react";
import { Place } from "../types";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface PlaceSearchModalProps {
  onClose: () => void;
  onAddPlace: (place: Place) => void;
}

export const PlaceSearchModal: React.FC<PlaceSearchModalProps> = ({ onClose, onAddPlace }) => {
  const placesLib = useMapsLibrary("places");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!placesLib || !searchQuery.trim()) return;

    setIsSearching(true);
    const service = new placesLib.PlacesService(document.createElement("div"));

    const request: google.maps.places.TextSearchRequest = {
      query: `${searchQuery} Matsuyama Japan`,
      region: "jp",
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    });
  };

  const handleAddToPlaceBank = (result: google.maps.places.PlaceResult) => {
    if (!result.place_id || !result.name) return;

    // 사진 URL 가져오기
    let photoUrl: string | undefined;
    if (result.photos && result.photos.length > 0) {
      photoUrl = result.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
    }

    const newPlace: Place = {
      id: `google-${result.place_id}`,
      name: result.name,
      area: "기타",
      type: determineType(result.types || []),
      estMin: 60,
      walkLoad: "low",
      coordinates: result.geometry?.location
        ? {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          }
        : undefined,
      address: result.formatted_address,
      placeId: result.place_id,
      tags: result.types?.slice(0, 3) || [],
      photoUrl: photoUrl,
      rating: result.rating,
    };

    onAddPlace(newPlace);
    onClose();
  };

  const determineType = (types: string[]): string => {
    if (types.includes("restaurant") || types.includes("food")) return "식사";
    if (types.includes("cafe")) return "카페";
    if (types.includes("spa")) return "온천";
    if (types.includes("tourist_attraction") || types.includes("point_of_interest")) return "명소";
    if (types.includes("shopping_mall") || types.includes("store")) return "쇼핑";
    return "명소";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">장소 검색 (Google Places)</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="마쓰야마 주변 장소 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isSearching ? "검색 중..." : "검색"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              예: "도고 온천", "마쓰야마 라멘", "우동 맛집" 등
            </p>
          </div>

          <div className="space-y-3">
            {searchResults.length === 0 && !isSearching && (
              <p className="text-center text-gray-500 py-8">
                검색 결과가 없습니다. 위에서 장소를 검색해보세요.
              </p>
            )}

            {searchResults.map((result, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-gray-900">{result.name}</h3>
                    {result.formatted_address && (
                      <p className="text-sm text-gray-600 mb-2">{result.formatted_address}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {result.types?.slice(0, 3).map((type, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    {result.rating && (
                      <p className="text-sm text-yellow-700 font-medium mt-2">
                        ⭐ {result.rating} ({result.user_ratings_total || 0} reviews)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToPlaceBank(result)}
                    className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap font-medium"
                  >
                    추가
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
