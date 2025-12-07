import React, { useMemo, useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Place } from "../types";

interface SimpleMapViewProps {
  places: Place[];
  selectedPlaces: string[];
}

// 교통수단 추천 함수
const recommendTransport = (distanceInMeters: number): {
  method: string;
  icon: string;
  cost: string;
  color: string;
  note: string;
} => {
  // 도보: 800m 이하
  if (distanceInMeters <= 800) {
    return {
      method: "도보",
      icon: "🚶",
      cost: "무료",
      color: "text-green-700 bg-green-100",
      note: "걸어서 이동 가능",
    };
  }

  // 전차(시내전차): 800m~3km, 마쓰야마 시내 주요 이동
  if (distanceInMeters <= 3000) {
    return {
      method: "전차",
      icon: "🚃",
      cost: "¥180/인",
      color: "text-blue-700 bg-blue-100",
      note: "시내전차 이용",
    };
  }

  // 버스: 3km 이상
  return {
    method: "버스",
    icon: "🚌",
    cost: "¥200~500/인",
    color: "text-purple-700 bg-purple-100",
    note: "노선버스 이용",
  };
};

export const SimpleMapView: React.FC<SimpleMapViewProps> = ({ places, selectedPlaces }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    totalDistance: string;
    totalDuration: string;
    totalCost: string;
    segments: Array<{
      from: string;
      to: string;
      distance: string;
      duration: string;
      distanceValue: number;
      transport: ReturnType<typeof recommendTransport>;
    }>
  } | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  const selectedPlacesData = useMemo(() => {
    return selectedPlaces
      .map(id => places.find(p => p.id === id))
      .filter((p): p is Place => p !== undefined && p.coordinates !== undefined);
  }, [places, selectedPlaces]);

  const allPlacesWithCoords = useMemo(() => {
    return places.filter(p => p.coordinates);
  }, [places]);

  useEffect(() => {
    if (!apiKey || !mapRef.current) {
      setError("API Key가 설정되지 않았습니다");
      setIsLoading(false);
      return;
    }

    setOptions({
      key: apiKey,
      v: "weekly",
    });

    Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
      importLibrary("routes"),
    ])
      .then(() => {
        const google = globalThis.google;
        if (!mapRef.current) return;

        // 중심점 계산
        const center = selectedPlacesData.length > 0
          ? {
              lat: selectedPlacesData.reduce((sum, p) => sum + p.coordinates!.lat, 0) / selectedPlacesData.length,
              lng: selectedPlacesData.reduce((sum, p) => sum + p.coordinates!.lng, 0) / selectedPlacesData.length,
            }
          : { lat: 33.8416, lng: 132.7656 };

        const map = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: 14,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
        });

        const bounds = new google.maps.LatLngBounds();

        // 선택된 장소들에 번호 마커 추가
        selectedPlacesData.forEach((place, index) => {
          const marker = new google.maps.Marker({
            position: place.coordinates!,
            map: map,
            label: {
              text: (index + 1).toString(),
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: 15,
            },
            title: `${index + 1}. ${place.name}`,
            zIndex: 1000 + index,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 0; min-width: 280px; max-width: 320px;">
                ${place.photoUrl ? `
                  <img src="${place.photoUrl}" alt="${place.name}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;" />
                ` : ""}
                <div style="padding: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="background: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                      ${index + 1}
                    </span>
                    <h3 style="margin: 0; font-weight: bold; font-size: 16px; color: #1f2937;">
                      ${place.name}
                    </h3>
                  </div>
                  ${place.rating ? `
                    <div style="margin-bottom: 8px;">
                      <span style="color: #ca8a04; font-weight: 600; font-size: 14px;">⭐ ${place.rating.toFixed(1)}</span>
                    </div>
                  ` : ""}
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
                    <span style="padding: 4px 8px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 500;">${place.area}</span>
                    <span style="padding: 4px 8px; background: #e9d5ff; color: #6b21a8; border-radius: 4px; font-size: 12px; font-weight: 500;">${place.type}</span>
                    ${place.estMin ? `<span style="padding: 4px 8px; background: #f3f4f6; color: #374151; border-radius: 4px; font-size: 12px; font-weight: 500;">${place.estMin}분</span>` : ""}
                  </div>
                  ${place.tags && place.tags.length > 0 ? `
                    <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
                      ${place.tags.map(tag => `<span style="padding: 2px 6px; background: #e5e7eb; color: #4b5563; border-radius: 9999px; font-size: 11px;">${tag}</span>`).join("")}
                    </div>
                  ` : ""}
                  ${place.address ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">${place.address}</p>` : ""}
                  ${place.coordinates ? `
                    <a href="https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; color: #2563eb; font-size: 12px; text-decoration: none; font-weight: 500;">
                      Google Maps에서 보기 →
                    </a>
                  ` : ""}
                </div>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          bounds.extend(place.coordinates!);
        });

        // 선택되지 않은 장소들에 회색 마커 추가
        allPlacesWithCoords.forEach((place) => {
          if (!selectedPlaces.includes(place.id)) {
            const marker = new google.maps.Marker({
              position: place.coordinates!,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#9ca3af",
                fillOpacity: 0.6,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 8,
              },
              title: place.name,
              zIndex: 1,
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 0; min-width: 280px; max-width: 320px;">
                  ${place.photoUrl ? `
                    <img src="${place.photoUrl}" alt="${place.name}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;" />
                  ` : ""}
                  <div style="padding: 12px;">
                    <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1f2937;">
                      ${place.name}
                    </h3>
                    ${place.rating ? `
                      <div style="margin-bottom: 8px;">
                        <span style="color: #ca8a04; font-weight: 600; font-size: 14px;">⭐ ${place.rating.toFixed(1)}</span>
                      </div>
                    ` : ""}
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
                      <span style="padding: 4px 8px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 500;">${place.area}</span>
                      <span style="padding: 4px 8px; background: #e9d5ff; color: #6b21a8; border-radius: 4px; font-size: 12px; font-weight: 500;">${place.type}</span>
                      ${place.estMin ? `<span style="padding: 4px 8px; background: #f3f4f6; color: #374151; border-radius: 4px; font-size: 12px; font-weight: 500;">${place.estMin}분</span>` : ""}
                    </div>
                    ${place.tags && place.tags.length > 0 ? `
                      <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
                        ${place.tags.map(tag => `<span style="padding: 2px 6px; background: #e5e7eb; color: #4b5563; border-radius: 9999px; font-size: 11px;">${tag}</span>`).join("")}
                      </div>
                    ` : ""}
                    <p style="margin: 8px 0; font-size: 12px; color: #9ca3af; font-style: italic; border-top: 1px solid #e5e7eb; padding-top: 8px;">
                      현재 플랜에 포함되지 않음
                    </p>
                    ${place.address ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">${place.address}</p>` : ""}
                    ${place.coordinates ? `
                      <a href="https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 8px; color: #2563eb; font-size: 12px; text-decoration: none; font-weight: 500;">
                        Google Maps에서 보기 →
                      </a>
                    ` : ""}
                  </div>
                </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });
          }
        });

        // 경로선 그리기 및 이동시간 계산
        if (selectedPlacesData.length > 1) {
          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // 기본 마커 숨김 (우리가 이미 만든 번호 마커 사용)
            polylineOptions: {
              strokeColor: "#2563eb",
              strokeWeight: 4,
              strokeOpacity: 0.7,
            },
          });

          // waypoints 생성 (첫 장소와 마지막 장소 제외)
          const waypoints = selectedPlacesData.slice(1, -1).map(place => ({
            location: place.coordinates!,
            stopover: true,
          }));

          const request: google.maps.DirectionsRequest = {
            origin: selectedPlacesData[0].coordinates!,
            destination: selectedPlacesData[selectedPlacesData.length - 1].coordinates!,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING,
          };

          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);

              // 이동시간, 거리, 교통수단 계산
              let totalDistance = 0;
              let totalDuration = 0;
              const segments: Array<{
                from: string;
                to: string;
                distance: string;
                duration: string;
                distanceValue: number;
                transport: ReturnType<typeof recommendTransport>;
              }> = [];

              const transportCosts: number[] = [];

              result.routes[0].legs.forEach((leg, index) => {
                const distanceValue = leg.distance?.value || 0;
                totalDistance += distanceValue;
                totalDuration += leg.duration?.value || 0;

                const transport = recommendTransport(distanceValue);

                // 비용 계산 (도보는 0, 전차는 180, 버스는 평균 350)
                if (transport.method === "전차") {
                  transportCosts.push(180);
                } else if (transport.method === "버스") {
                  transportCosts.push(350);
                } else {
                  transportCosts.push(0);
                }

                segments.push({
                  from: selectedPlacesData[index].name,
                  to: selectedPlacesData[index + 1].name,
                  distance: leg.distance?.text || "",
                  duration: leg.duration?.text || "",
                  distanceValue: distanceValue,
                  transport: transport,
                });
              });

              const totalCostValue = transportCosts.reduce((sum, cost) => sum + cost, 0);

              setRouteInfo({
                totalDistance: (totalDistance / 1000).toFixed(1) + " km",
                totalDuration: Math.round(totalDuration / 60) + " 분",
                totalCost: totalCostValue === 0 ? "무료" : `약 ¥${totalCostValue}/인`,
                segments: segments,
              });
            }
          });
        }

        // 선택된 장소가 있으면 모든 마커가 보이도록 지도 조정
        if (selectedPlacesData.length > 0) {
          map.fitBounds(bounds);
          // 너무 확대되지 않도록 최대 줌 레벨 제한
          const listener = google.maps.event.addListener(map, "idle", () => {
            if (map.getZoom()! > 16) map.setZoom(16);
            google.maps.event.removeListener(listener);
          });
        }

        setIsLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error loading Google Maps:", err);
        setError("지도 로딩 중 오류가 발생했습니다: " + err.message);
        setIsLoading(false);
      });
  }, [apiKey, selectedPlacesData, allPlacesWithCoords, selectedPlaces]);

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-semibold mb-2">Google Maps API Key가 필요합니다</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">지도 로딩 오류</p>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 지도 */}
      <div className="w-full rounded-lg overflow-hidden border-2 border-gray-400" style={{ height: "600px", position: "relative" }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-bounce">🗺️</div>
              <p className="text-gray-700 font-medium">지도 로딩 중...</p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedPlacesData.length}개 장소를 표시합니다
              </p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* 이동시간, 거리, 교통수단 정보 */}
      {routeInfo && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-bold text-green-900 mb-3">🚶 이동 경로 정보</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">총 이동 거리</p>
              <p className="text-2xl font-bold text-green-700">{routeInfo.totalDistance}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">총 이동 시간</p>
              <p className="text-2xl font-bold text-blue-700">{routeInfo.totalDuration}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">예상 교통비</p>
              <p className="text-2xl font-bold text-orange-700">{routeInfo.totalCost}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold mb-3 text-gray-900">구간별 교통수단 및 비용:</p>
            <div className="space-y-3">
              {routeInfo.segments.map((seg, idx) => (
                <div key={idx} className="border-l-4 border-blue-400 pl-3 py-2 bg-gray-50 rounded-r">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {idx + 1}. {seg.from} → {seg.to}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${seg.transport.color}`}>
                      {seg.transport.icon} {seg.transport.method}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      📏 {seg.distance} · ⏱️ {seg.duration}
                    </span>
                    <span className="font-semibold text-orange-600">
                      {seg.transport.cost}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{seg.transport.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                💡 <strong>팁:</strong> 마쓰야마 시내전차는 1일 승차권(¥800)을 구매하면 하루종일 이용 가능합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 마커 범례 */}
      {selectedPlacesData.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-3">🗺️ 지도 마커 안내</h4>
          <div className="mb-3 text-sm text-blue-800">
            <p>• <strong className="text-blue-600">파란색 번호 마커</strong>: 현재 플랜에 포함된 장소 (순서대로)</p>
            <p>• <strong className="text-gray-500">회색 작은 마커</strong>: 전체 장소 중 플랜에 미포함</p>
            <p>• <strong className="text-blue-600">파란색 경로선</strong>: 걸어서 이동하는 추천 경로</p>
            <p className="mt-2">💡 마커를 클릭하면 상세 정보를 볼 수 있습니다</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            {selectedPlacesData.map((place, index) => (
              <div key={place.id} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-700 truncate">{place.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 장소 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 선택된 장소들 */}
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 text-blue-900">
            📍 현재 플랜 ({selectedPlacesData.length}개)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedPlacesData.map((place, index) => (
              <div key={place.id} className="bg-white rounded p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900">{place.name}</h4>
                    <p className="text-sm text-gray-600">{place.type} · {place.area}</p>
                    {place.estMin && (
                      <p className="text-xs text-gray-500">예상 시간: {place.estMin}분</p>
                    )}
                    {place.coordinates && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Google Maps에서 보기 →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {selectedPlacesData.length === 0 && (
              <p className="text-center text-gray-500 py-4">선택된 장소가 없습니다</p>
            )}
          </div>
        </div>

        {/* 전체 장소들 */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 text-gray-900">
            🗺️ 전체 장소 ({allPlacesWithCoords.length}개)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allPlacesWithCoords.map((place) => {
              const isSelected = selectedPlaces.includes(place.id);
              const selectedIndex = selectedPlacesData.findIndex(p => p.id === place.id);
              return (
                <div
                  key={place.id}
                  className={`rounded p-3 shadow-sm ${
                    isSelected ? "bg-blue-100 border-2 border-blue-300" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isSelected ? (
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {selectedIndex + 1}
                      </span>
                    ) : (
                      <span className="text-lg">
                        {place.type === "온천" && "♨️"}
                        {place.type === "식사" && "🍽️"}
                        {place.type === "카페" && "☕"}
                        {place.type === "명소" && "🏛️"}
                        {place.type === "쇼핑" && "🛍️"}
                        {place.type === "디저트" && "🍰"}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                        {place.name}
                      </h4>
                      <p className="text-sm text-gray-600">{place.type} · {place.area}</p>
                      {place.coordinates && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Google Maps에서 보기 →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
