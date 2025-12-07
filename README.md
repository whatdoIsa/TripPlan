# Matsuyama Trip Planner

마쓰야마 가족 여행(2025-12-13 ~ 2025-12-16)을 위한 인터랙티브 여행 플래너 웹 애플리케이션입니다.

## 주요 기능

### 4가지 플랜 비교
- **Plan A - 핵심만 편하게**: 가장 현실적이고 편안한 일정
- **Plan B - 핵심 + 욕심**: Plan A에 추가 명소를 더한 알찬 일정
- **Plan C - 먹방/카페 중심**: 맛집과 카페 투어 중심
- **Plan D - 비/피로 대체**: 날씨나 컨디션이 좋지 않을 때 실내 위주

### 강력한 플래너 기능
- **Google Places 실시간 검색**: 마쓰야마 주변 실제 장소를 검색하고 추가
- **인터랙티브 지도**: 모든 장소를 지도에서 핀으로 확인
- **리스트/지도 뷰 전환**: 버튼 클릭으로 간편하게 전환
- 장소 검색 (Plan 내부 검색 + 전체 Place Bank 검색)
- 드래그 앤 드롭으로 순서 변경
- 장소 추가/삭제
- 플랜 간 장소 이동
- 커스텀 장소 추가
- 장소별 상세 정보 (지역, 타입, 예상 시간, 걷기 강도, 태그, 좌표, 주소)

### 데이터 공유 및 저장
- **자동 저장**: localStorage에 자동으로 저장
- **Export/Import**: JSON 파일로 내보내기/가져오기
- **Share Link**: URL 해시를 통한 플랜 공유 (백엔드 없이 가능)

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Google Maps API Key 설정 (필수)

지도 및 장소 검색 기능을 사용하려면 Google Maps API Key가 필요합니다.

1. [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)에 접속
2. 프로젝트 생성 후 다음 API를 활성화:
   - Maps JavaScript API
   - Places API (New)
3. API Key 생성
4. 프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
```

5. `.env` 파일을 열어 API Key 입력:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 사용 방법

### 1. 플랜 선택
상단의 Plan A/B/C/D 탭을 클릭하여 원하는 플랜으로 전환합니다.

### 2. 뷰 모드 전환
- **📋 리스트 보기**: 플랜 보드와 Place Bank를 나란히 보기
- **🗺️ 지도 보기**: 현재 플랜의 장소들을 지도에서 핀으로 확인

### 3. 장소 관리
#### Google Places 검색 (NEW!)
1. 상단 툴바의 "🔍 장소 검색" 버튼 클릭
2. 검색어 입력 (예: "도고 온천", "마쓰야마 라멘", "우동 맛집")
3. 검색 결과에서 원하는 장소의 "추가" 버튼 클릭
4. Place Bank에 자동으로 추가됨 (좌표 및 주소 포함)

#### 장소 추가
- 오른쪽 **Place Bank**에서 원하는 장소의 "추가" 버튼 클릭
- 또는 상단 툴바의 "장소 추가" 버튼으로 커스텀 장소 생성

#### 장소 삭제
- 각 장소 카드의 "삭제" 버튼 클릭

#### 순서 변경
- 장소 카드 왼쪽의 ☰ 아이콘을 드래그하여 순서 변경
- 또는 ↑ ↓ 버튼으로 위/아래로 이동

#### 플랜 간 이동
- 각 장소의 "다른 플랜으로 이동" 드롭다운에서 대상 플랜 선택

### 4. 검색
- **Google Places 검색**: 마쓰야마 주변 실제 장소를 실시간으로 검색
- **Plan 내부 검색**: 현재 플랜에 추가된 장소만 검색
- **Place Bank 검색**: 전체 장소 중에서 검색
- 장소명, 지역, 타입, 태그로 검색 가능

### 5. 데이터 공유

#### Share Link (추천)
1. 상단 툴바의 "Share Link" 버튼 클릭
2. URL이 클립보드에 복사됨
3. 링크를 공유하면 받는 사람이 동일한 플랜을 볼 수 있음

#### Export/Import JSON
1. **Export**: "Export JSON" 버튼 클릭하여 JSON 파일 다운로드
2. **Import**: "Import JSON" 버튼 클릭 후 JSON 내용 붙여넣기

## 기술 스택

- **React 18** + **TypeScript**: 타입 안전성과 최신 React 기능
- **Vite**: 빠른 개발 환경
- **Tailwind CSS**: 유틸리티 우선 스타일링
- **@dnd-kit**: 접근성이 뛰어난 드래그 앤 드롭
- **@vis.gl/react-google-maps**: Google Maps React 통합
- **Google Places API**: 실시간 장소 검색
- **Google Maps JavaScript API**: 인터랙티브 지도
- **localStorage**: 자동 저장
- **URL Hash**: 백엔드 없는 공유 링크

## 프로젝트 구조

```
src/
├── components/
│   ├── Toolbar.tsx         # 상단 툴바 (장소 검색, 추가, Export/Import, Share)
│   ├── PlanTabs.tsx        # A/B/C/D 플랜 탭
│   ├── PlanBoard.tsx       # 현재 플랜 보드 (DnD 포함)
│   ├── PlanItem.tsx        # 개별 장소 카드
│   ├── PlaceBank.tsx       # 전체 장소 뱅크
│   ├── MapView.tsx         # Google Maps 지도 컴포넌트
│   └── PlaceSearchModal.tsx # Google Places 검색 모달
├── hooks/
│   └── usePersistedState.ts # localStorage + URL hash 통합 훅
├── utils/
│   └── serializer.ts       # JSON/Base64 인코딩/디코딩 유틸
├── data/
│   └── seedData.ts         # 초기 장소 및 플랜 데이터 (좌표 포함)
├── types.ts                # TypeScript 타입 정의
├── App.tsx                 # 메인 앱 컴포넌트
└── main.tsx                # 진입점
```

## 초기 장소 데이터

### 도고 온천 지역
- 도고 온천 본관
- 도고 온천 별관 아스카노유
- 이시테지
- 봇짱과 마도나 동상
- 도고 유케무리 카페

### 도심 지역
- 마쓰야마성(로프웨이)
- 오카이도/긴텐가이
- 코토리(우동)
- 마쓰야마 타이메시 아키요시 본점
- 기린노모리 마쓰야마점
- Park Side Cafe
- どらもみじ(이자카야)

## 여행 정보

- **도시**: Matsuyama
- **일정**: 2025-12-13 ~ 2025-12-16
- **숙소**: Dormy Inn Matsuyama (Okaido)

## 모바일 최적화

- 반응형 디자인으로 모바일/태블릿/데스크톱 모두 지원
- 터치 친화적인 UI
- 드래그 앤 드롭은 터치 디바이스에서도 작동

## 주의사항

- 브라우저의 localStorage를 사용하므로 브라우저 데이터를 삭제하면 저장된 플랜이 사라집니다
- Share Link는 URL이 매우 길어질 수 있으므로 복잡한 플랜은 Export JSON 사용 권장
- Import 시 유효하지 않은 JSON은 거부됩니다

## 라이선스

MIT License
