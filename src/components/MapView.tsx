import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Place } from "../types";

interface MapViewProps {
  places: Place[];
  selectedPlaces: string[];
  onPlaceClick?: (placeId: string) => void;
}

const MATSUYAMA_CENTER = { lat: 33.8416, lng: 132.7656 };

export const MapView: React.FC<MapViewProps> = ({ places, selectedPlaces }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (!apiKey) {
      setError("API Key가 설정되지 않았습니다");
      setIsLoading(false);
      return;
    }

    if (!mapRef.current) return;

    setOptions({
      key: apiKey,
      v: "weekly",
    });

    console.log("Loading Google Maps...");

    Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
      importLibrary("places"),
    ])
      .then(() => {
        console.log("Google Maps loaded successfully");
        const google = globalThis.google;

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: MATSUYAMA_CENTER,
          zoom: 14,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
        });

        console.log("Map created, adding markers...");

        const placesWithCoords = places.filter((p) => p.coordinates);
        console.log(`Adding ${placesWithCoords.length} markers`);

        placesWithCoords.forEach((place) => {
          const isSelected = selectedPlaces.includes(place.id);
          let color = "#6b7280";

          if (isSelected) {
            color = "#2563eb"; // blue
          } else {
            switch (place.type) {
              case "온천":
                color = "#dc2626";
                break;
              case "식사":
                color = "#ea580c";
                break;
              case "카페":
                color = "#ca8a04";
                break;
              case "명소":
                color = "#16a34a";
                break;
              case "쇼핑":
                color = "#9333ea";
                break;
            }
          }

          const svgMarker = {
            path: "M12 0C5.372 0 0 5.372 0 12c0 6.628 12 19.5 12 19.5S24 18.628 24 12c0-6.628-5.372-12-12-12z",
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: isSelected ? 1.8 : 1.4,
            anchor: new google.maps.Point(12, 31),
          };

          const marker = new google.maps.Marker({
            position: place.coordinates!,
            map: map,
            title: place.name,
            icon: svgMarker,
            zIndex: isSelected ? 1000 : 1,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1f2937;">
                  ${place.name}
                </h3>
                <div style="font-size: 14px; color: #6b7280;">
                  <p style="margin: 4px 0;"><strong>타입:</strong> ${place.type}</p>
                  <p style="margin: 4px 0;"><strong>지역:</strong> ${place.area}</p>
                  ${place.estMin ? `<p style="margin: 4px 0;"><strong>예상 시간:</strong> ${place.estMin}분</p>` : ""}
                  ${place.address ? `<p style="margin: 4px 0; font-size: 12px;">${place.address}</p>` : ""}
                </div>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          console.log(`Added marker for ${place.name}`);
        });

        setIsLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error loading Google Maps:", err);
        setError("지도 로딩 중 오류가 발생했습니다: " + err.message);
        setIsLoading(false);
      });
  }, [apiKey, places, selectedPlaces]);

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-semibold mb-2">Google Maps API Key가 필요합니다</p>
        <p className="text-sm text-yellow-700">
          프로젝트 루트에 .env 파일을 생성하고 아래 내용을 추가하세요:
        </p>
        <code className="block mt-2 bg-yellow-100 p-2 rounded text-sm text-gray-800">
          VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
        </code>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">지도 로딩 오류</p>
        <p className="text-sm text-red-700">{error}</p>
        <p className="text-xs text-red-600 mt-2">
          Google Cloud Console에서 Maps JavaScript API가 활성화되어 있는지 확인하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-gray-400" style={{ height: "600px", position: "relative" }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">🗺️</div>
            <p className="text-gray-700 font-medium">지도 로딩 중...</p>
            <p className="text-sm text-gray-500 mt-2">
              {places.filter((p) => p.coordinates).length}개 장소를 표시합니다
            </p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "600px" }} />
    </div>
  );
};
