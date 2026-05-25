# 📖 교회 암송수첩 앱 — Design.md

> 이 문서는 **현재 앱의 디자인 시스템과 UI 구조 전체**를 정리한 디자인 명세서입니다.
> Claude Design / 디자이너에게 전달하여 UI를 업그레이드한 뒤, 결과를 다시 개발에 반영하기 위한 단일 진실 공급원(Single Source of Truth) 역할을 합니다.

---

## 1. 앱 개요 (Product Summary)

| 항목 | 내용 |
|------|------|
| **앱 이름** | 교회 암송수첩 (Church Memory Master) |
| **핵심 기능** | 매주/매월 교회 암송 말씀 표시, 부서별 진도 관리, 캘린더, 배지/스트릭 게임화 |
| **플랫폼** | iOS + Android (Capacitor 기반 하이브리드) + 모바일 웹 |
| **레이아웃 컨셉** | 모바일 전용. `max-w-md` 컨테이너 / 하단 5탭 네비게이션 |
| **언어** | 한국어 우선 (Noto Sans KR) |
| **데이터 소스** | 엑셀(`church_verses.xlsx`, `calendar_events.xlsx`) + localStorage 캐싱 |

### 1-1. 타깃 사용자
- **유치부**: 5–7세 (보호자가 함께 사용) — 짧은 구절, 큰 글자, 친근한 색감
- **초등부**: 8–13세 — 1년 단위 + 월암송 시스템
- **중고등부**: 14–18세 — 깊이 있는 구절, 3년 사이클
- **공통 페르소나**: 교회 교사, 부모, 학생 본인

### 1-2. 핵심 사용자 여정 (Primary User Flows)
1. 앱 실행 → 스플래시 → 부서 탭(기본 유치부)
2. **이번 주 말씀 카드** 확인 → 공유/캡처/북마크
3. **전체 목록**으로 연간 진도 확인
4. **캘린더**에서 교회 일정 + 암송 일정 확인
5. **메인화면**에서 3개 부서 한눈에 보기 + 진행률
6. **배지/스트릭**으로 학습 동기 유지

---

## 2. 브랜드 아이덴티티 (Brand Identity)

### 2-1. 무드/톤
- **따뜻하고 신앙적인 차분함** + **모던 모바일 앱 감성**
- 글래스모피즘(Glassmorphism)을 적극 활용 — 반투명 흰색 카드, 부드러운 그라데이션 배경
- 하늘/바다 계열의 청록(Teal)·청록(Cyan)·에메랄드(Emerald)가 메인

### 2-2. 컬러 시스템 (현재)

#### Light 모드 CSS Variables (`client/src/index.css`)
| 토큰 | 값 (HSL) | 용도 |
|------|---------|------|
| `--primary` | `hsl(180, 89%, 36%)` (진한 Teal) | 주요 CTA, 활성 상태 |
| `--secondary` | `hsl(45, 93%, 47%)` (Amber/Gold) | 보조 강조 |
| `--accent` | `hsl(166, 73%, 45%)` (Emerald) | 그라데이션 끝 색 |
| `--destructive` | `hsl(0, 84%, 60%)` | 삭제/경고 |
| `--background` | `hsl(0, 0%, 100%)` (White) | 페이지 배경 |
| `--foreground` | `hsl(20, 14%, 4%)` | 본문 텍스트 |
| `--muted` | `hsl(60, 5%, 96%)` | 비활성 영역 |
| `--border` | `hsl(20, 6%, 90%)` | 카드/구분선 |

#### 그라데이션 (시그니처)
- **Body 배경**: `bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50`
- **Primary 그라데이션**: `linear-gradient(135deg, hsl(180, 89%, 36%) 0%, hsl(166, 73%, 45%) 100%)`
- **Secondary 그라데이션**: `linear-gradient(135deg, hsl(45, 93%, 47%) 0%, hsl(34, 93%, 54%) 100%)`
- **상단 헤더**: `from-blue-50 to-teal-50`

#### 부서별 시그니처 컬러
| 부서 | 아이콘 배경 | 아이콘 색 | 무드 |
|------|-----------|----------|------|
| 유치부 (Kindergarten) | `bg-pink-100` | `text-pink-600` | 따뜻함, 친근함 (Baby 아이콘) |
| 초등부 (Elementary) | `bg-blue-100` | `text-blue-600` | 신뢰감, 학구적 (Users 아이콘) |
| 중고등부 (Youth) | `bg-green-100` | `text-green-600` | 성장, 비전 (GraduationCap 아이콘) |

### 2-3. 타이포그래피
- **한글**: `Noto Sans KR` (300/400/500/600/700)
- **영문**: `Inter` (300/400/500/600/700)
- **폰트 시스템**: 한글 우선, 영문은 보조
- **동적 스케일링**: 구절 길이에 따라 폰트 크기를 5단계로 자동 조정 (≤30 / ≤60 / ≤100 / ≤150 / 151+ 글자)
  - `clamp(min, dvh-based, max)` 패턴으로 디바이스 높이에 반응
  - 상한을 두어 짧은 구절이 과하게 커지지 않도록 제어
- **사이즈 가이드(현재)**:
  - 페이지 타이틀: `text-lg ~ text-xl font-bold`
  - 카드 헤더: `font-semibold`
  - 본문: 동적 (대략 14–22px)
  - 캡션/메타: `text-[10px] ~ text-xs`

### 2-4. 모양/스타일 토큰
- **모서리 둥글기**: `--radius: 0.5rem` 기본, 카드는 `rounded-2xl` (16px)
- **그림자**: `shadow-lg` → 호버 시 `shadow-xl`
- **백드롭 블러**: `backdrop-blur-sm` (글래스모피즘 핵심)
- **테두리**: `border border-gray-100` 또는 `border-gray-200`

### 2-5. 핵심 유틸리티 클래스 (현재)
```css
.glassmorphism      /* bg-white/70 backdrop-blur-sm border border-gray-100 */
.gradient-primary   /* teal → emerald 135deg */
.gradient-secondary /* gold → orange 135deg */
.verse-card         /* glassmorphism + rounded-2xl + p-4 sm:p-5 + shadow-lg */
.verse-card-active  /* 이번 주 카드 — primary 그라데이션 배경 + 진한 테두리 */
.nav-button         /* 하단 탭 버튼 */
.nav-button-active  /* 활성 탭 — primary 컬러 + 10% 투명 배경 */
```

---

## 3. 레이아웃 & 네비게이션 구조

### 3-1. 전체 레이아웃
```
┌─────────────────────────────────┐
│  [고정 헤더] (부서 아이콘+제목)   │  ← fixed top, gradient bg
├─────────────────────────────────┤
│                                 │
│   [메인 콘텐츠]                  │  ← scrollable, pb-20
│   - 카드 (verse-card)           │
│   - 리스트 / 그리드              │
│                                 │
├─────────────────────────────────┤
│  [하단 5탭 네비게이션]            │  ← fixed bottom, blur bg
│  유치부 │ 초등부 │ 메인 │ 중고등 │ 캘린더 │
└─────────────────────────────────┘
```

### 3-2. 라우트 맵 (`client/src/App.tsx`)
| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | AgeGroup (유치부) | 기본 진입점 |
| `/kindergarten` | AgeGroup (유치부) | |
| `/elementary` | AgeGroup (초등부) | |
| `/youth` | AgeGroup (중고등부) | |
| `/home` | Home | 3개 부서 한눈 + 진행률 + 스트릭 |
| `/calendar` | Calendar | 월별 캘린더 + 일정/암송 |
| `/monthly-verse` | MonthlyVerse | 초등부 월암송 전용 |
| `/verse-overview/:ageGroup` | VerseOverview | 부서별 전체 연간 목록 |
| `/bookmarks` | Bookmarks | 북마크한 구절 모음 |
| `/my-progress` | MyProgress | 학습 진행 상황 |
| `/badges` | Badges | 배지 컬렉션 (게임화) |
| `/settings` | Settings | 글자 크기, 알림, 시작 화면 등 |
| `/splash` | Splash | 스플래시 |

### 3-3. 하단 네비게이션 (Bottom Nav)
- 5개 탭, 가운데(메인화면) 강조 가능
- 각 탭: 아이콘(`w-4 h-4`) + 라벨(`text-[10px]`)
- 활성: `text-primary bg-primary/10`
- 비활성: `text-gray-600 hover:bg-gray-50`
- 배경: `bg-white/90 backdrop-blur-lg border-t`
- iOS 노치 대응: `padding-bottom: env(safe-area-inset-bottom)`

---

## 4. 페이지별 디자인 명세

### 4-1. 스플래시 (`splash-screen.tsx`)
- 첫 진입 시 표시
- 그라데이션 배경 + 앱 로고 + 페이드인/아웃 애니메이션 (Framer Motion)
- 데이터 로딩 동안 표시

### 4-2. 부서 페이지 (Age Group)
**가장 핵심적인 페이지.** 3장의 구절 카드를 세로 스택으로 보여줌.

```
┌───────────────────────────────┐
│ 🍼 유치부 (5-7세)    🏆 [전체목록] │ ← 헤더 (sticky)
├───────────────────────────────┤
│ ┌───────────────────────┐     │
│ │ 지난 주 (회색, 작게)    │     │ ← verse-card (비활성)
│ │ "구절 텍스트"           │     │
│ │ 시편 23:1              │     │
│ └───────────────────────┘     │
│                               │
│ ┌───────────────────────┐ ⭐  │
│ │ 이번 주 ⭐ (강조)        │     │ ← verse-card-active
│ │ "구절 텍스트"           │     │
│ │ 시편 23:1              │     │
│ │ [공유] [캡처] [북마크]   │     │
│ └───────────────────────┘     │
│                               │
│ ┌───────────────────────┐     │
│ │ 다음 주 (회색, 작게)    │     │ ← verse-card (비활성)
│ │ ...                   │     │
│ └───────────────────────┘     │
└───────────────────────────────┘
```

- **이번 주 카드**: `verse-card-active` — primary 그라데이션 배경, 큰 폰트, 액션 버튼 표시
- **지난/다음 주**: `verse-card` — 글래스 + 회색 톤, 폰트 작게
- **초등부**는 헤더에 "월암송" 진입 칩 추가
- **콘텐츠 자동 스케일링**: 글자 수 기반 5단계 폰트 조정

### 4-3. 메인 홈 (`home.tsx`)
- 3개 부서를 한 번에 모두 표시 (작은 카드 3개 또는 스택)
- **진행률 표시**: 1년 사이클(52주), 부서별 사이클 진행률 (유치부 1년 / 초등부 2년 / 중고등부 3년)
- **스트릭 카운터** (StreakCounter): 연속 학습 일수
- **캘린더 모달** 진입 가능
- **이번 달 안내**: "1/2/3년 1사이클" 문구로 사용자 위치 표시 (최근 추가됨)

### 4-4. 캘린더 (`calendar.tsx` + `calendar-modal.tsx`)
- 월별 그리드 뷰
- 각 셀: 날짜 + 점(이벤트 인디케이터)
- 부서별 색상 점 + 일정 점
- 상단에 월 이동 컨트롤 (좌우 화살표)

### 4-5. 전체 목록 (`verse-overview.tsx`)
- 한 부서의 1년치 구절 목록
- 주차별 그룹핑 + 현재 주 강조
- 스크롤로 전체 사이클 탐색

### 4-6. 월암송 (`monthly-verse.tsx`) — 초등부 전용
- 매월 외워야 하는 핵심 구절
- 큰 카드 1장 + 진도 점 그리드(WeeklyDotGrid)

### 4-7. 북마크 / 진행률 / 배지
- **Bookmarks**: 카드 리스트, 제거 버튼
- **MyProgress**: 그래프(Recharts) + 통계
- **Badges**: 4–6열 그리드, 획득/미획득 상태(`badge-card.tsx`)

### 4-8. 설정 (`settings.tsx`)
- 리스트형 (iOS 스타일)
- 항목: 글자 크기, 알림, 시작 화면, 데이터 초기화, 정보

---

## 5. 핵심 컴포넌트 카탈로그

| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `VerseCard` | `components/verse-card.tsx` | **핵심 카드.** 동적 폰트, 공유/캡처/북마크 액션 |
| `BottomNavigation` | `components/bottom-navigation.tsx` | 하단 5탭 |
| `CaptureButton` | `components/capture-button.tsx` | html2canvas로 카드 이미지 캡처/저장 |
| `CalendarModal` | `components/calendar-modal.tsx` | 월별 캘린더 팝업 |
| `SplashScreen` | `components/splash-screen.tsx` | 시작 스플래시 |
| `StreakCounter` | `components/streak-counter.tsx` | 연속 학습 일수 |
| `BadgeCard` | `components/badge-card.tsx` | 배지 1개 표시 |
| `WeeklyDotGrid` | `components/weekly-dot-grid.tsx` | 주간 진도 점 그리드 |
| `FlashcardModal` | `components/flashcard-modal.tsx` | 암송 플래시카드 학습 모드 |
| `ExitConfirmDialog` | `components/exit-confirm-dialog.tsx` | Android 뒤로가기 종료 확인 |
| `PointsEarnedToast` | `components/points-earned-toast.tsx` | 포인트 획득 토스트 |
| `ScrollToTop` | `components/scroll-to-top.tsx` | 라우트 변경 시 상단 이동 |
| **shadcn/ui** | `components/ui/*` | Button, Dialog, Toast, Tabs 등 50+ Radix 기반 |

---

## 6. 인터랙션 / 모션

- **라이브러리**: Framer Motion
- **카드 진입**: 페이드 + slight Y 이동
- **이번 주 카드**: 약한 스케일 강조 + 별 아이콘
- **버튼 호버**: `hover:shadow-xl`, `transition-all duration-300`
- **하단 탭 전환**: `transition-all duration-200`
- **공유/캡처 토스트**: 우측 하단에서 슬라이드인

---

## 7. 모바일/반응형 고려사항
- `max-w-md mx-auto` 컨테이너 (모바일 폭 고정)
- iOS 안전 영역(`env(safe-area-inset-*)`) 처리
- `dvh` 단위 사용으로 iOS Safari 주소창 변동 대응
- 터치 타겟 최소 44px 권장 (현재 일부 버튼은 더 작음 — 개선 포인트)
- 캡처 시 디바이스 픽셀 비율 보존

---

## 8. 다크 모드
- CSS 변수로 정의되어 있으나 **현재 토글 UI 없음** (`.dark` 클래스만 정의)
- `next-themes` 패키지는 설치되어 있음
- → 향후 설정 화면에 다크모드 토글 추가 가능

---

## 9. 알려진 디자인 이슈 / 개선 후보

> **이 섹션은 디자이너가 우선적으로 봐주면 좋은 영역입니다.**

### 🎨 비주얼
1. **글래스모피즘이 다소 평범** — 더 풍부한 그라데이션, 미세한 노이즈 텍스처, 광택감 검토
2. **부서별 시그니처가 약함** — 현재 아이콘 색상만 다름. 카드/배경에 부서별 무드 컬러 더 강하게 반영
3. **이번 주 카드 강조가 부족** — 단순 그라데이션 배경. 리본/배지/3D 깊이감 등 시그니처 강조 필요
4. **타이포그래피 위계가 평면적** — 디스플레이용 큰 인용 부호, 세리프 강조 등 도입 검토
5. **컬러 팔레트가 청록 일변도** — 부서별 따뜻한 톤(유치부 핑크, 초등부 블루, 중고등부 그린)을 헤더 그라데이션에도 반영

### 📱 UX
6. **하단 5탭이 좁음** — 라벨 10px, 아이콘 16px. 가운데 "메인화면"을 FAB(Floating Action Button)식 강조 검토
7. **북마크/캡처 버튼 위치가 분산됨** — 카드 액션 영역 통합 디자인 필요
8. **빈 상태(Empty State) 디자인 미흡** — 데이터 없을 때 안내 화면 강화
9. **로딩 상태 부재** — 스켈레톤 UI 도입
10. **배지/진행률이 차분함** — 게임화 요소 강화 (애니메이션, 축하 효과)

### ♿ 접근성
11. 폰트 동적 스케일은 좋으나 **고대비 모드** 부재
12. 컬러 대비비 일부 미흡 (회색 톤 메타 텍스트)
13. 포커스 링 디자인 일관성 부족

### 🌙 기능
14. **다크 모드 미완성** — 토글 + 변수 검수 필요
15. **온보딩 부재** — 첫 사용자 안내 플로우

---

## 10. 디자인 산출물에 포함되면 좋은 것 (요청사항)

디자이너/Claude Design 측에 이 Design.md를 전달할 때 **아래를 포함한 결과물**을 받고 싶습니다:

1. ✅ **컬러 토큰 재정의** (CSS 변수 형식, light/dark 모두)
2. ✅ **타이포그래피 스케일 표** (h1–h6, body, caption / 한·영 각각)
3. ✅ **부서별 무드보드** (유치부/초등부/중고등부)
4. ✅ **각 페이지별 와이어프레임 또는 목업** (특히 부서 페이지, 메인 홈, 캘린더)
5. ✅ **핵심 컴포넌트 리디자인** (VerseCard, BottomNavigation, 진행률 카드)
6. ✅ **모션 가이드** (페이지 전환, 카드 진입, 강조)
7. ✅ **다크 모드 컬러 매핑**
8. ✅ **빈 상태 / 로딩 / 에러 상태** 디자인
9. ✅ **아이콘 가이드** (현재 lucide-react 사용 — 일관성 검토)
10. ✅ **Tailwind/CSS 변수로 변환 가능한 형태**의 토큰 (개발 반영 용이)

---

## 11. 기술 제약 (디자인 반영 시 참고)

- **Tailwind CSS 3.4** + **shadcn/ui (Radix UI)** 기반
- **Framer Motion**으로 애니메이션
- **Capacitor 7** (iOS/Android 네이티브 빌드) — 네이티브 컴포넌트가 아닌 웹뷰
- **Wouter** 라우팅 (가벼운 SPA)
- **date-fns**로 날짜 처리 (주: 일–토)
- 폰트는 Google Fonts 외 **시스템 한글 폰트 폴백** 가능
- 이미지/아이콘은 SVG 우선 (lucide-react)
- 한국어 가독성 최우선 (한글 자형, 자간, 행간)

---

## 12. 파일 위치 빠른 참조

```
client/src/
├── App.tsx                    # 라우팅 + 데이터 부트스트랩
├── index.css                  # 컬러 토큰, .glassmorphism, .verse-card 등
├── pages/
│   ├── home.tsx               # 메인 홈
│   ├── age-group.tsx          # 부서별 페이지 (핵심)
│   ├── calendar.tsx           # 캘린더
│   ├── monthly-verse.tsx      # 월암송 (초등부)
│   ├── verse-overview.tsx     # 전체 목록
│   ├── bookmarks.tsx          # 북마크
│   ├── my-progress.tsx        # 진행률
│   ├── badges.tsx             # 배지
│   ├── settings.tsx           # 설정
│   └── splash.tsx             # 스플래시
├── components/
│   ├── verse-card.tsx         # 핵심 카드 컴포넌트
│   ├── bottom-navigation.tsx  # 하단 5탭
│   ├── splash-screen.tsx      # 스플래시
│   ├── streak-counter.tsx     # 스트릭
│   ├── badge-card.tsx         # 배지
│   ├── calendar-modal.tsx     # 캘린더 팝업
│   ├── flashcard-modal.tsx    # 플래시카드
│   ├── capture-button.tsx     # 이미지 캡처
│   └── ui/                    # shadcn/ui 프리미티브
└── lib/
    ├── storage.ts             # localStorage 래퍼
    ├── excel-parser.ts        # 엑셀 파싱
    └── date-utils.ts          # 날짜 유틸
tailwind.config.ts             # Tailwind 테마 (CSS 변수와 연결)
```

---

## 13. 디자인 업그레이드 후 적용 워크플로우

> 디자이너 산출물을 받은 후 개발자가 따라야 할 절차

1. **컬러 토큰 갱신**: `client/src/index.css`의 `:root`, `.dark` 변수 교체
2. **Tailwind 확장**: `tailwind.config.ts`에 새 토큰 추가
3. **컴포넌트 리디자인 반영**: `verse-card.tsx`, `bottom-navigation.tsx` 등 핵심부터
4. **페이지별 레이아웃 조정**: `pages/*.tsx`
5. **모션 토큰 추가**: Framer Motion variants 통일
6. **다크 모드 토글 UI**: `settings.tsx`에 추가
7. **빌드 확인**: `npm run build` (iOS/Android 모두 패키징되는지 확인)
8. **시각 회귀 테스트**: 각 부서 페이지 + 캘린더 + 홈 스크린샷 비교

---

**문서 버전**: v1.0
**작성일**: 2026-05-04
**작성자**: 김재현 (with Claude Code)
**다음 단계**: 이 문서를 Claude Design에 전달 → 업그레이드된 디자인 가이드 회신 → 개발 반영
