# Matsuyama Trip Planner - 기능 체크리스트

## 완성된 기능

### 1. 플랜 관리
- [x] Plan A/B/C/D 탭 전환
- [x] 각 플랜별 제목과 설명 표시
- [x] 플랜별 독립적인 장소 목록 관리

### 2. 장소 검색
- [x] **Google Places API 실시간 검색** (NEW!)
- [x] Place Bank 전체 검색 (장소명, 지역, 타입, 태그)
- [x] Plan 내부 검색 (현재 플랜에 추가된 장소만)
- [x] 실시간 검색 결과 필터링

### 3. 장소 관리
- [x] **Google Places에서 검색한 장소 자동 추가** (좌표, 주소 포함)
- [x] Place Bank에서 현재 플랜으로 장소 추가
- [x] 플랜에서 장소 삭제
- [x] 플랜 간 장소 이동 (드롭다운 선택)
- [x] 커스텀 장소 직접 추가
- [x] 이미 추가된 장소는 "추가됨" 상태로 표시

### 4. 순서 변경
- [x] 드래그 앤 드롭으로 장소 순서 변경 (@dnd-kit)
- [x] 터치 디바이스 지원
- [x] 접근성 지원 (↑ ↓ 버튼)
- [x] 키보드 네비게이션 지원

### 5. 데이터 저장 및 공유
- [x] localStorage 자동 저장
- [x] JSON Export (파일 다운로드)
- [x] JSON Import (유효성 검증 포함)
- [x] Share Link (URL hash 기반, base64 인코딩)
- [x] URL hash에서 상태 자동 복원

### 6. 지도 기능 (NEW!)
- [x] **Google Maps 인터랙티브 지도**
- [x] **리스트/지도 뷰 전환 버튼**
- [x] 장소별 마커 핀 표시
- [x] 선택된 플랜의 장소만 하이라이트
- [x] 타입별 마커 색상 구분
- [x] 마커 클릭 가능

### 7. UI/UX
- [x] 반응형 디자인 (모바일/태블릿/데스크톱)
- [x] 장소별 상세 정보 표시
  - [x] 지역 (도심/도고/기타)
  - [x] 타입 (온천/식사/카페/명소/쇼핑/디저트)
  - [x] 예상 시간 (분)
  - [x] 걷기 강도 (낮음/중간/높음) with 색상 구분
  - [x] 태그
  - [x] **좌표 (위도/경도)** (NEW!)
  - [x] **주소** (NEW!)
- [x] 순번 표시
- [x] 여행 메타 정보 표시 (도시, 일정, 숙소)

### 8. 초기 데이터
- [x] 12개 장소 시드 데이터 (모두 실제 좌표 포함)
- [x] 4개 플랜 시드 (A/B/C/D)
- [x] 각 플랜별 의미있는 구성

## 기술 스택

- React 18 with TypeScript
- Vite 6
- Tailwind CSS 3
- @dnd-kit (드래그 앤 드롭)
- **@vis.gl/react-google-maps** (NEW!)
- **Google Places API** (NEW!)
- **Google Maps JavaScript API** (NEW!)
- localStorage API
- URL Hash API

## 테스트 완료

- [x] TypeScript 컴파일 성공
- [x] Production 빌드 성공
- [x] Dev 서버 실행 성공
- [x] 모든 컴포넌트 정상 렌더링

## 우선순위별 구현 현황

1. [x] 모델 + 시드 - ✅ 완료
2. [x] 탭 + Active Plan 렌더 - ✅ 완료
3. [x] Place Bank 검색/추가 - ✅ 완료
4. [x] 삭제/플랜 이동 - ✅ 완료
5. [x] DnD reorder - ✅ 완료
6. [x] localStorage - ✅ 완료
7. [x] Export/Import - ✅ 완료
8. [x] Share Link - ✅ 완료
9. [x] 모바일 polish - ✅ 완료

## 추가 개선 가능 항목 (선택적)

- [ ] 플랜 제목/설명 편집 기능
- [ ] 장소 편집 기능
- [ ] 플랜 복사 기능
- [ ] 인쇄 최적화 스타일
- [ ] PWA (오프라인 지원)
- [ ] 다크 모드
- [ ] 다국어 지원
- [ ] 지도 통합 (Google Maps API)
- [ ] 날짜별 일정 그룹핑
