# 📖 교회 암송수첩 v2 — Design.md

> **이 문서는 v1 → v2 디자인 업그레이드를 코드베이스(Tailwind + shadcn/ui + Capacitor)에 반영하기 위한 단일 소스입니다.**
> 시안 프로토타입은 `교회 암송수첩 v2.html` 참조. 본 문서만 보고 빌드 가능하도록 작성.

**문서 버전**: v2.0
**작성일**: 2026-05-04
**작성자**: 김재현 (with Claude Design)
**대상**: Claude Code (실제 React/Tailwind 코드베이스 반영)

---

## 0. 한눈에 보는 변경점 (v1 → v2)

| 영역 | v1 (As-Is) | v2 (To-Be) |
|------|-----------|------------|
| **무드** | 청록(Teal) 글래스모피즘 일변도 | 따뜻한 오프화이트 + 파스텔 글로우 + iOS 26 Liquid Glass |
| **부서 컬러** | 아이콘 색만 다름 (핑크/블루/그린) | 부서별 surface/glow/accent까지 톤 통일 (피치/민트/라벤더) |
| **하단 네비** | 5탭 평면 + `bg-white/90 backdrop-blur` | Floating Liquid Glass pill + 활성 탭 검정 캡슐 |
| **타이포** | 평면적 위계 | 큰 디스플레이 숫자 (Inter 200) + 본문 한글 |
| **다크모드** | 변수 정의만 있음, UI 없음 | **완전 지원** + 우측 floating 토글 |
| **카드** | 글래스 (`rounded-2xl` + `bg-white/70`) | Solid surface + 미세 그림자 + 큰 라운드 (22-28px) |
| **이번 주 강조** | primary 그라데이션 배경 | 큰 주차 숫자(WEEK 19) + 부서 액센트 + 글로우 코너 |
| **메인 홈** | 부서 3개 + 진행률 + 스트릭 | 큰 스트릭 숫자 + 부서 카드 + 통계 + 빠른 진입 |
| **캘린더** | 월별 그리드 + 점 | 그리드 + **다가오는 일정 타임라인** (점-선) |

---

## 1. 디자인 원칙 (Design Principles)

### 1-1. 톤 & 무드
- **차분한 따뜻함** — 신앙적 깊이 + 모던 모바일 감성
- **숨 쉬는 여백** — 카드 사이 14px 이상, 패딩 18-26px
- **부서별 시그니처** — 유치부 피치🍑 / 초등부 민트🌿 / 중고등부 라벤더💜 (배경/글로우/액센트 통일)
- **Liquid Glass** — 하단 네비, 떠있는 컨트롤은 backdrop-blur(28px) saturate(180%) + inset shine
- **타이포로 위계** — 큰 숫자(주차/스트릭/통계)로 시선 집중, 본문은 차분하게

### 1-2. 다크모드 철학
- 단순 색 반전이 아닌 **별도의 디자인** — 페이지 배경 `#0A0A0A`, surface `#1A1A1A`
- 부서 액센트는 **채도/밝기 낮춘 글로우 톤** — 어둠 위에서 은은하게 빛남
- Ambient glow 투명도 35% → 8%로 축소 (어두운 분위기 유지)

---

## 2. 디자인 토큰 (Design Tokens)

### 2-1. 컬러 — 베이스 (Light / Dark)

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `pageBg` | `#FAFAF7` | `#0A0A0A` | 페이지 배경 |
| `pageBgWarm` | `#F7F4EE` | `#111111` | 따뜻한 보조 배경 |
| `surface` | `#FFFFFF` | `#1A1A1A` | 카드, 흰 영역 |
| `surfaceMuted` | `#F5F2EC` | `#141414` | 보조 chip/버튼 배경 |
| `ink` | `#0E0E0C` | `#FFFFFF` | 본문/타이틀 |
| `inkSoft` | `#3A3A36` | `#D4D4D2` | 본문 보조 |
| `inkMuted` | `#7A7873` | `#8A8A85` | 메타/캡션 |
| `inkFaint` | `#B5B2AA` | `#52524E` | 매우 흐린 보조 |
| `border` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.08)` | 카드 테두리 |
| `borderStrong` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.14)` | 강조 구분선 |

### 2-2. 컬러 — 부서별 시그니처 (Department Palette)

#### Light 모드
| 부서 | accent | accentSoft | chip | chipText | surface (카드 배경) |
|------|--------|------------|------|----------|---------------------|
| 유치부 (피치) | `#E07A4D` | `#FFE9DA` | `#FCE2D1` | `#A4593A` | `#FBEFE5` |
| 초등부 (민트) | `#5A8C61` | `#E5F1E2` | `#DDEED9` | `#3F6B47` | `#EEF6EB` |
| 중고등부 (라벤더) | `#6B61A8` | `#EDEAF7` | `#E2DEF2` | `#4F4877` | `#EFEDF7` |

#### Dark 모드
| 부서 | accent | accentSoft | chip | chipText | surface |
|------|--------|------------|------|----------|---------|
| 유치부 | `#FCA470` | `rgba(252,160,110,0.12)` | `rgba(252,200,165,0.16)` | `#FCC8A5` | `#1F1814` |
| 초등부 | `#7ECB8D` | `rgba(120,200,140,0.12)` | `rgba(150,220,165,0.15)` | `#9DD6A8` | `#141B16` |
| 중고등부 | `#9C8FE0` | `rgba(150,138,220,0.12)` | `rgba(180,170,235,0.16)` | `#B4AAEB` | `#181624` |

#### 부서별 글로우 (코너 장식용 radial gradient)
```css
/* Light */
--glow-kindergarten: radial-gradient(circle at 30% 30%, rgba(252, 200, 165, 0.6), transparent 60%);
--glow-elementary:   radial-gradient(circle at 30% 30%, rgba(186, 226, 192, 0.65), transparent 60%);
--glow-youth:        radial-gradient(circle at 30% 30%, rgba(196, 188, 232, 0.6), transparent 60%);

/* Dark */
--glow-kindergarten-dark: radial-gradient(circle at 30% 30%, rgba(252, 160, 110, 0.35), transparent 60%);
--glow-elementary-dark:   radial-gradient(circle at 30% 30%, rgba(120, 200, 140, 0.3),  transparent 60%);
--glow-youth-dark:        radial-gradient(circle at 30% 30%, rgba(150, 138, 220, 0.3),  transparent 60%);
```

### 2-3. Ambient Glow (페이지 배경 번짐)
페이지 전체에 `position: absolute; inset: 0; pointer-events: none;`로 깔리는 글로우 레이어.

```css
/* Light */
background:
  radial-gradient(ellipse 80% 50% at 80% 10%, rgba(255, 200, 160, 0.35), transparent 60%),
  radial-gradient(ellipse 70% 40% at 10% 30%, rgba(200, 220, 255, 0.3),  transparent 60%),
  radial-gradient(ellipse 60% 40% at 50% 80%, rgba(220, 240, 215, 0.35), transparent 60%);

/* Dark — 투명도 대폭 축소 */
background:
  radial-gradient(ellipse 90% 50% at 80% 5%,  rgba(255, 180, 130, 0.08), transparent 60%),
  radial-gradient(ellipse 80% 50% at 5%  30%, rgba(140, 160, 230, 0.06), transparent 60%),
  radial-gradient(ellipse 70% 40% at 50% 90%, rgba(160, 200, 170, 0.06), transparent 60%);
```

### 2-4. 타이포그래피
- **한글**: `Noto Sans KR` (300/400/500/600/700)
- **영문/숫자**: `Inter` (200/300/400/500/600/700)
- **시스템 폴백**: `-apple-system, BlinkMacSystemFont, sans-serif`

#### 타이포 스케일
| 역할 | weight | size | letter-spacing | line-height | 사용 예 |
|------|--------|------|----------------|-------------|---------|
| Display XL | 200 (Inter) | 64-72px | -0.04em | 0.9 | 스트릭 큰 숫자, 통계 |
| Display L | 300 (Inter) | 44-52px | -0.04em | 0.9 | 주차 숫자 (WEEK 19) |
| Display M | 300 (Inter) | 32-36px | -0.03em | 1.0 | 카운터 |
| H1 / Page Title | 600 (Noto KR) | 22-26px | -0.01em | 1.2 | 페이지 큰 타이틀 |
| H2 | 600 (Noto KR) | 18px | -0.005em | 1.3 | 섹션 헤더 |
| Body L | 400 (Noto KR) | 16-18px | 0 | 1.6 | 본문 구절 (긴 글자) |
| Body | 400 (Noto KR) | 14-15px | 0 | 1.5 | 본문 |
| Caption | 600 (Noto KR) | 11-12px | 0.02em | 1.3 | 메타/라벨 |
| Eyebrow | 600 (Inter) | 10-11px | 0.08em (uppercase) | 1.2 | "WEEK 19", "STREAK" |

#### 동적 폰트 스케일 (구절 본문)
글자 수에 따라 5단계 자동 조정 (v1 그대로 유지):
- ≤30자: clamp(20px, 4.5dvh, 28px)
- ≤60자: clamp(18px, 3.5dvh, 24px)
- ≤100자: clamp(16px, 3dvh, 20px)
- ≤150자: clamp(15px, 2.5dvh, 18px)
- 151+자: clamp(14px, 2.2dvh, 16px)

### 2-5. 모양 토큰
| 토큰 | 값 | 용도 |
|------|-----|------|
| radius-sm | 8-10px | 작은 버튼, dot |
| radius-md | 14-16px | 일반 버튼, 작은 카드 |
| radius-lg | 18-22px | 카드 |
| radius-xl | 24-28px | 메인 카드, 통계 카드 |
| radius-pill | 32px | Liquid Glass 네비, 큰 캡슐 |
| radius-full | 9999px | 원형 버튼 |

### 2-6. 그림자
```css
/* Light */
--shadow-card-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-card-md: 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10);
--shadow-glass:   0 1px 2px rgba(0,0,0,0.06), 0 12px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
--shadow-toggle:  0 8px 20px rgba(0,0,0,0.08);

/* Dark — 더 강하게, 검정으로 */
--shadow-card-sm-dark: 0 1px 2px rgba(0,0,0,0.3);
--shadow-card-md-dark: 0 1px 2px rgba(0,0,0,0.3), 0 12px 32px -12px rgba(0,0,0,0.5);
--shadow-glass-dark:   0 1px 2px rgba(0,0,0,0.4), 0 12px 30px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
--shadow-toggle-dark:  0 8px 20px rgba(0,0,0,0.4);
```

### 2-7. Liquid Glass 효과 (재사용 가능 레시피)
```css
.liquid-glass {
  position: relative;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  background: rgba(255, 255, 255, 0.55);     /* dark: rgba(40,40,40,0.55) */
  border: 0.5px solid rgba(255, 255, 255, 0.5); /* dark: rgba(255,255,255,0.12) */
  box-shadow: var(--shadow-glass);
  overflow: hidden;
}
.liquid-glass::before { /* inner shine */
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  border-radius: inherit;
  box-shadow:
    inset 1.5px 1.5px 1.5px rgba(255,255,255,0.85),
    inset -1px -1px 1.5px rgba(255,255,255,0.4);
  /* dark:
    inset 1px 1px 1.5px rgba(255,255,255,0.15),
    inset -1px -1px 1.5px rgba(255,255,255,0.05); */
}
.liquid-glass::after { /* top gloss */
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 50%;
  pointer-events: none;
  border-radius: inherit inherit 0 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
  /* dark: rgba(255,255,255,0.08) → 0 */
}
```

---

## 3. 레이아웃 & 네비게이션

### 3-1. 전체 셸 (변경 없음)
```
┌─────────────────────────────────┐
│  [페이지 헤더]                    │  ← 상단 인셋, no fixed bar
├─────────────────────────────────┤
│   [스크롤 콘텐츠]  pb-100         │
│                                 │
│       (Liquid Glass Nav)        │ ← floating, bottom: 14px
└─────────────────────────────────┘
```
- `max-w-md mx-auto` 컨테이너 유지
- iOS 안전 영역(`env(safe-area-inset-*)`) 처리 유지

### 3-2. Liquid Glass 하단 네비
**구조:**
- 화면 하단에 `bottom: 14px`로 떠있는 pill (border-radius: 32px)
- 중앙 정렬 (`left: 50%; transform: translateX(-50%)`)
- 5개 탭 + **별도 floating 다크모드 토글 (오른쪽)**

**탭 구성** (라벨 제거, 아이콘만):
1. Home (`Icons.Home`)
2. 유치 (`Icons.Baby`)
3. 초등 (`Icons.Users`)
4. 중고 (`Icons.Graduation`)
5. 달력 (`Icons.Calendar`)

**탭 사이즈:** `width: 52px, height: 44px, borderRadius: 22px`
**활성 탭:** 검정 캡슐 배경 (Light: `rgba(14,14,12,0.92)`, Dark: `rgba(255,255,255,0.92)`), 아이콘 컬러 반전, stroke 2.2

**다크모드 토글** (네비 우측 8px gap):
- 48×48 원형 캡슐
- 같은 Liquid Glass 효과
- 아이콘: 🌙 (라이트) / ☀️ (다크) — 또는 lucide의 Moon/Sun

### 3-3. 라우트 맵 (v1 유지)
변경 없음. `/`, `/kindergarten`, `/elementary`, `/youth`, `/home`, `/calendar`, `/monthly-verse`, `/verse-overview/:ageGroup`, `/bookmarks`, `/badges`, `/settings`

---

## 4. 핵심 컴포넌트 리디자인

### 4-1. VerseCard (이번 주 카드)
**구조:**
```
┌──────────────────────────────────┐
│ ◉ 부서 chip          🔖 (북마크)  │ ← 상단: dept chip + 북마크 캡슐
│                                  │
│  WEEK 19  ──── 5/4 (일)          │ ← Eyebrow + 날짜
│                                  │
│  "구절 본문 텍스트가 여기에..."    │ ← Body L (동적 스케일)
│                                  │
│  ─────────────────────────────   │
│  시편 23:1            [공유][📷]   │ ← 출처 + 액션
└──────────────────────────────────┘
```

**스타일:**
- `padding: 24px 22px 20px`
- `borderRadius: 28px`
- `background: TOKENS.surface`
- `border: 1px solid TOKENS.border`
- `boxShadow: var(--shadow-card-md)`
- `position: relative; overflow: hidden;`
- 우측 상단에 부서 글로우 레이어 (`P.glow`, 200×180px, 절대 위치)

**상단 chip:** 부서별 `chip` 배경 + `chipText` 컬러, padding `4px 10px`, radius 12px, font-size 11px
**WEEK 19 (Eyebrow):** Inter 200, 44-52px, letter-spacing -0.04em, line-height 0.9
**본문:** 동적 스케일, `color: TOKENS.ink`
**구분선:** `borderTop: 1px solid TOKENS.border`, paddingTop 14px
**액션 버튼:** 28×28 원형 + `surfaceMuted` 배경, 호버 시 `borderStrong`

### 4-2. VerseCard (지난주 / 다음주 — 비활성)
- `padding: 14px 18px`
- `borderRadius: 22px`
- `background: TOKENS.surface`
- `border: 1px solid TOKENS.border`
- `boxShadow: var(--shadow-card-sm)`
- WEEK 라벨 작게 (Inter 300, 14px), 본문 1줄 truncate (ellipsis)
- opacity 0.85

### 4-3. Bottom Navigation (Liquid Glass) — 위 3-2 참조

### 4-4. Header (페이지 상단)
**구조:**
```
[부서 chip (있으면)]   [우측 액션]
큰 타이틀
서브타이틀 (옵션)
```
- 페이지 상단 padding: `26px 22px 18px`
- 큰 타이틀: H1 (22-26px, Noto KR 600)
- 서브타이틀: Caption (12px, `inkMuted`)

### 4-5. 통계 카드 (Home의 스트릭 등)
- `padding: 20-22px`
- `borderRadius: 24px`
- `background: TOKENS.surface`
- 큰 숫자 (Display XL, Inter 200, 64-72px)
- 레이블 (Caption, `inkMuted`)
- 두 통계가 나란히 있을 때 `width: 1px; height: 40px; background: borderStrong`로 구분

### 4-6. 부서 카드 (Home)
- `background: P.surface` (부서별 surface — 라이트는 파스텔, 다크는 거의 검정에 가까운 부서 톤)
- `padding: 20px`
- `borderRadius: 22px`
- 우측 상단에 `P.glow` 레이어 (절대 위치, 약 60-80% 영역)
- 진행률 바: 높이 3px, `background: TOKENS.border`, fill `P.accent`

### 4-7. 캘린더 셀
- 7×N 그리드 (`gap: 2px`)
- `aspectRatio: 1/1.05`
- 오늘 셀: `background: TOKENS.ink`, `color: TOKENS.surface`, radius 10
- 일요일: `#C45A4A`, 토요일: `#5A7CC4`, 평일: `TOKENS.ink`
- 이벤트 점: 4×4 dot, 부서별 `accent` 또는 service `ink` 또는 etc `#C49952`

### 4-8. 다가오는 일정 타임라인
- 좌측 14×14 원 (`border: 2px solid accent`, fill: 첫 항목만 채움)
- 다음 항목까지 1.5px 세로선 (`background: borderStrong`)
- 각 항목: 14px gap, paddingBottom 18px (마지막 제외 0)

### 4-9. 학습 진도 (Verse 페이지)
주별 7일 도트 그리드:
```
[월][화][수][목][금][토][일]
[✓ ][✓ ][✓ ][  ][  ][  ][  ]
```
- 28×28 box, radius 8
- 완료: `background: P.accent` + 흰 체크
- 미완료: `background: TOKENS.surfaceMuted`

### 4-10. Floating 다크모드 토글
- 4-3에 함께 기술

---

## 5. 페이지별 명세

### 5-1. Home (`/home`)
**구성 (위→아래):**
1. **Header** — "안녕하세요" + 오늘 날짜 + 우측 설정 버튼 (`surfaceMuted` 36×36 원형)
2. **스트릭 통계 카드** — 큰 숫자 12 (연속 학습일) | 큰 숫자 23 (암송 완료) + 우측 캘린더 진입 버튼 (`ink` 38×38)
3. **부서 카드 3개** (스택)
   - 부서 chip + `surface` 배경 + glow
   - 진행률 바 + 회차 텍스트
4. **빠른 진입 그리드** — 2열: 배지 / 북마크 (각각 surface 카드, `ink` 아이콘)

### 5-2. 부서 페이지 (`/kindergarten`, `/elementary`, `/youth`)
**구성:**
1. **Header** — 부서 chip + 큰 타이틀(부서명) + 서브타이틀(나이대) + 우측 "전체" 버튼
2. **(초등부만) 월암송 진입 카드** — `surface`, P.glow 코너, 클릭 시 `/monthly-verse`
3. **이번 주 VerseCard** — 4-1 사양
4. **지난 주 / 다음 주 VerseCard** — 4-2 사양
5. **학습 진도 카드** — 4-9 사양

### 5-3. 캘린더 (`/calendar`)
**구성:**
1. Header — "캘린더" + "2026년 5월" + 좌우 화살표 (`surfaceMuted` 32×32)
2. 월 그리드 카드 (4-7)
3. 다가오는 일정 타임라인 카드 (4-8)

### 5-4. 전체 목록 (`/verse-overview/:ageGroup`)
- Header — 부서 chip + "유치부 전체" + "N / 52주"
- 진행률 바 (높이 4px)
- 주차별 리스트 (현재 주는 `P.surface`, 외에는 `TOKENS.surface`)

### 5-5. 북마크 / 배지 / 월암송
- 모두 `TOKENS.surface` 카드 베이스
- 배지: 4열 그리드, 미획득은 `surfaceMuted` + opacity 0.55

---

## 6. 인터랙션 / 모션
v1 Framer Motion 패턴 유지. 추가:
- **다크모드 전환**: 페이지 배경 0.3s ease 트랜지션 (`background: transition: background 0.3s`)
- **Liquid Glass 활성 탭**: 0.2s ease 배경 페이드
- **토글 호버**: 미세한 scale(1.05)

---

## 7. 다크모드 구현 가이드

### 7-1. 토글 위치
**Floating 우측 캡슐** — 하단 Liquid Glass 네비 옆 8px gap
- `next-themes` 설치되어 있음 → `useTheme()` 활용
- `data-theme="dark"` 또는 `class="dark"` 토글
- localStorage에 사용자 선택 저장

### 7-2. CSS 변수 매핑 (`client/src/index.css`)
```css
:root {
  --page-bg: #FAFAF7;
  --surface: #FFFFFF;
  --surface-muted: #F5F2EC;
  --ink: #0E0E0C;
  --ink-soft: #3A3A36;
  --ink-muted: #7A7873;
  --border: rgba(0,0,0,0.06);
  /* ...섹션 2-1 전체 */
}
.dark {
  --page-bg: #0A0A0A;
  --surface: #1A1A1A;
  --surface-muted: #141414;
  --ink: #FFFFFF;
  --ink-soft: #D4D4D2;
  --ink-muted: #8A8A85;
  --border: rgba(255,255,255,0.08);
  /* ...섹션 2-1 전체 */
}
```

### 7-3. 부서 팔레트 매핑 (Tailwind 확장)
`tailwind.config.ts`:
```ts
extend: {
  colors: {
    'page-bg': 'var(--page-bg)',
    'surface': 'var(--surface)',
    'surface-muted': 'var(--surface-muted)',
    'ink': 'var(--ink)',
    'ink-soft': 'var(--ink-soft)',
    'ink-muted': 'var(--ink-muted)',
    'border-soft': 'var(--border)',
    // 부서별
    'dept-kg': 'var(--dept-kg-accent)',
    'dept-el': 'var(--dept-el-accent)',
    'dept-yt': 'var(--dept-yt-accent)',
  }
}
```
부서 변수도 light/dark에 각각 정의.

### 7-4. 컴포넌트 컬러 사용 규칙
- **하드코딩 금지** — `bg-white`, `text-black` ❌
- 항상 토큰 사용 — `bg-surface`, `text-ink` ✅
- 부서 컬러는 props로 받아서 inline style 또는 `data-dept` 속성 + CSS

---

## 8. Tailwind 유틸리티 클래스 재정의

```css
@layer components {
  .surface-card {
    @apply rounded-[22px] border border-[color:var(--border)] bg-surface;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10);
  }
  .dark .surface-card {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 12px 32px -12px rgba(0,0,0,0.5);
  }

  .verse-card-active {
    @apply surface-card relative overflow-hidden;
    padding: 24px 22px 20px;
    border-radius: 28px;
  }

  .liquid-glass {
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    background: rgba(255, 255, 255, 0.55);
    border: 0.5px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 12px 30px rgba(0,0,0,0.12);
  }
  .dark .liquid-glass {
    background: rgba(40, 40, 40, 0.55);
    border: 0.5px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 12px 30px rgba(0,0,0,0.5);
  }

  .display-xl { font-family: 'Inter', sans-serif; font-weight: 200; font-size: 64px; letter-spacing: -0.04em; line-height: 0.9; }
  .display-l  { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 48px; letter-spacing: -0.04em; line-height: 0.9; }
  .eyebrow    { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; }
}
```

---

## 9. 적용 워크플로우 (Claude Code 작업 순서)

### Phase 1 — 토큰 / 인프라
1. `client/src/index.css`의 `:root` / `.dark` CSS 변수 **전면 교체** (섹션 7-2)
2. `tailwind.config.ts` 확장 (섹션 7-3)
3. `next-themes`로 ThemeProvider 셋업 + localStorage 연동
4. `@layer components`에 새 유틸 클래스 추가 (섹션 8)

### Phase 2 — 핵심 컴포넌트
5. `verse-card.tsx` — 4-1, 4-2 사양으로 리라이트
6. `bottom-navigation.tsx` — Liquid Glass pill로 리라이트 (4-3, 3-2)
7. `theme-toggle.tsx` (신규) — Floating 우측 캡슐 토글
8. 헤더 컴포넌트 추출 (`PageHeader.tsx`) — 4-4

### Phase 3 — 페이지
9. `pages/home.tsx` — 5-1
10. `pages/age-group.tsx` — 5-2
11. `pages/calendar.tsx` — 5-3 (다가오는 일정 타임라인 추가)
12. `pages/verse-overview.tsx` — 5-4
13. `pages/bookmarks.tsx`, `pages/badges.tsx`, `pages/monthly-verse.tsx` — 5-5

### Phase 4 — QA
14. 라이트/다크 모드 모든 페이지 시각 회귀
15. iOS Safari 안전 영역 + dvh 단위 확인
16. Capacitor 빌드 확인 (`npm run build`)
17. 색상 대비비 (WCAG AA) — 특히 `inkMuted` on `surface`

---

## 10. 마이그레이션 시 주의사항

### 10-1. 보존해야 할 v1 자산
- ✅ 동적 폰트 스케일 로직 (글자 수 5단계)
- ✅ `html2canvas` 캡처 기능
- ✅ 라우팅 (Wouter)
- ✅ localStorage 캐싱
- ✅ Capacitor 통합
- ✅ shadcn/ui 프리미티브 (Button, Dialog, Toast 등) — 컬러 토큰만 새로 매핑

### 10-2. 제거 / 대체
- ❌ `.glassmorphism` 유틸 → `.surface-card` 또는 `.liquid-glass`로 분리
- ❌ `.gradient-primary` (teal→emerald) → 부서별 `accent` + `glow`로 대체
- ❌ Body 배경 `from-teal-50 via-cyan-50 to-emerald-50` → `bg-page-bg` + ambient glow 레이어
- ❌ 부서 시그니처 컬러를 아이콘 색만 다르게 → surface/glow까지 적용

### 10-3. 신규 추가
- 🆕 다크모드 토글 + 변수 (Phase 1)
- 🆕 Floating Liquid Glass 네비
- 🆕 큰 숫자 디스플레이 타이포 (Inter 200/300)
- 🆕 캘린더 다가오는 일정 타임라인
- 🆕 Ambient glow 페이지 배경 레이어

---

## 11. 시안 참조

| 시안 파일 | 용도 |
|----------|------|
| `교회 암송수첩 v2.html` | **메인 시안** — 모든 페이지 인터랙티브 프로토타입 |
| `v2/tokens.jsx` | 컬러/팔레트 JS 객체 (참조용) |
| `v2/verse-card.jsx` | VerseCard 구현 예시 |
| `v2/pages-main.jsx` | Home / 부서 / 캘린더 페이지 예시 |
| `v2/pages-extra.jsx` | 전체목록 / 북마크 / 배지 / 월암송 예시 |
| `v2/app.jsx` | App 셸 + Liquid Glass 네비 + 다크 토글 |

> 시안의 코드는 React 인라인 스타일 기반 프로토타입입니다.
> Claude Code는 이를 **참조하되**, 실제 코드베이스의 Tailwind + shadcn 패턴으로 변환해주세요.

---

## 12. FAQ

**Q. 기존 `--primary` (teal) 토큰은?**
A. v2에서는 단일 primary가 없고 **부서별 accent**로 분기됩니다. shadcn/ui 컴포넌트의 primary는 `--ink` (검정/흰색)로 매핑하세요.

**Q. 부서별 glow는 SVG로? CSS로?**
A. CSS radial-gradient 그대로 사용. `position: absolute`로 카드 우상단에 깔고 `pointer-events: none`.

**Q. Liquid Glass의 backdrop-filter가 안 먹는 디바이스?**
A. iOS 15+, Android Chrome 76+ 지원. 폴백으로 `background: rgba(255,255,255,0.85)` (불투명 흰색).

**Q. 다크모드는 시스템 설정 자동 따라가나요?**
A. `next-themes`의 `defaultTheme="system"` + 사용자가 명시적으로 토글하면 localStorage에 저장. Settings 페이지에서 [시스템 / 라이트 / 다크] 3옵션 제공 권장.

---

**다음 단계**: 이 문서로 Claude Code가 Phase 1 → 4 순서로 빌드.
