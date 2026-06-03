# 교회학교 암송 앱 - 개발 로그

## 프로젝트 개요
- **앱 이름**: 교회학교 암송 수첩
- **패키지**: `com.church.memory.app.v15`
- **버전**: 2.4 (versionCode 15)
- **기술 스택**: React + TypeScript + Capacitor (Android/iOS 하이브리드 앱)
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **데이터**: Excel 파일 기반 암송 구절 관리

---

## 커밋 히스토리 (총 52개 커밋)

### 초기 설정
| 커밋 | 내용 |
|------|------|
| `d70e2ea` | Initial commit |
| `1a40d6b` | UI 전면 리뉴얼 + 프로젝트 셋업 |
| `b9ea3bf` | 구절/사용자 정보 저장소 추가 |
| `67299f8` | Excel 파일 기반 데이터 관리 설명 |
| `22d0b2e` | 최신 암송 리스트 업로드 |

### 핵심 기능 개발
| 커밋 | 내용 |
|------|------|
| `416a9b2` | 폰트 추가 + Excel 파싱 수정 |
| `85276e0` | 앱 반응성 개선, 연습 기능 제거, 화면 캡처 추가 |
| `6bfc978` | 메인 화면 간소화, 주간 진행 표시 제거 |
| `10fa1f4` | 구절/이벤트 데이터 앱 코드에 직접 포함 |
| `0adb37a` | 실제 구절 데이터 업데이트 + Excel 날짜 변환 수정 |

### iOS 빌드/배포
| 커밋 | 내용 |
|------|------|
| `0b5a6da` | 디바이스 설치 지원 |
| `47f0a2e` | iOS AdHoc OTA 워크플로 |
| `2d2ccbf` | unsigned IPA 워크플로 추가 |
| `5a16da6` | iOS 캡처/공유, ICS 내보내기, 아이콘, Excel 파서 |
| `da10772` ~ `c3de85f` | iOS 빌드 워크플로 반복 수정 |
| `aae56b2` | iOS seed.json 빌드/권한/갤러리 저장 개선 |
| `726d220` | iOS seed.json 적용/권한 주입/워크플로 정리 |

### 데이터/캘린더
| 커밋 | 내용 |
|------|------|
| `a96a28f` | 캘린더 seed: 미래 이벤트만 + 강제 reseed + fallback |
| `0c7634a` | 구절 로딩: Excel 전용으로 복원, seed는 이벤트만 |
| `359130f` | 커리큘럼 진행률에 '1/2/3년 1사이클' 문구 추가 |

---

## 현재 작업 상태 (미커밋 변경사항)

### 수정된 파일 (Modified)

#### Android
- `android/build.gradle` - Kotlin 플러그인 classpath 추가
- `android/app/build.gradle` - Kotlin 플러그인 적용 + kotlin-stdlib 의존성
- `android/app/src/main/AndroidManifest.xml` - 위젯 receiver + config activity 등록
- `android/app/src/main/res/values/strings.xml` - 위젯 설명 문자열 추가
- `android/app/capacitor.build.gradle` - Capacitor 빌드 설정 변경
- `android/capacitor.settings.gradle` - Capacitor 설정 변경
- `android/app/src/main/java/com/church/memory/app/*/MainActivity.java` - 각 버전별 MainActivity 수정

#### Client (프론트엔드)
- `client/src/App.tsx` - 앱 라우팅/구조 변경
- `client/src/pages/home.tsx` - 홈 화면 수정
- `client/src/pages/calendar.tsx` - 캘린더 페이지 수정
- `client/src/pages/settings.tsx` - 설정 페이지 수정
- `client/src/pages/age-group.tsx` - 부서별 페이지 수정
- `client/src/pages/splash.tsx` - 스플래시 화면 수정
- `client/src/components/verse-card.tsx` - 구절 카드 컴포넌트 수정
- `client/src/components/scroll-to-top.tsx` - 스크롤 컴포넌트 수정
- `client/src/hooks/use-monthly-verse.ts` - 월별 구절 훅 수정
- `client/src/lib/database.ts` - 데이터베이스 유틸 수정
- `client/src/lib/excel-parser.ts` - Excel 파서 수정
- `client/src/lib/excel-template.ts` - Excel 템플릿 수정
- `client/src/lib/capture-utils.ts` - 캡처 유틸 수정
- `client/src/lib/csv-utils.ts` - CSV 유틸 수정
- `client/src/lib/calendar-cleaner.ts` - 캘린더 클리너 수정
- `client/src/lib/calendar-template.ts` - 캘린더 템플릿 수정
- `client/src/lib/notifications.ts` - 알림 유틸 수정

#### iOS
- `ios/App/App/public/index.html` - iOS 웹뷰 엔트리 변경
- `ios/App/App/public/firebase-messaging-sw.js` - FCM 서비스 워커 수정
- iOS 빌드 에셋 교체 (CACHE-KILLER 파일들)

#### 기타
- `.gitignore` - 무시 규칙 변경
- `package.json`, `package-lock.json` - 의존성 변경
- `.github/workflows/ios-*.yml` - iOS CI 워크플로 수정

### 신규 파일 (Untracked)

#### Android 위젯 (이번 세션에서 작업)
- `android/app/src/main/java/com/church/memory/app/v15/widget/VerseWidgetProvider.kt` - Medium 위젯 Provider
- `android/app/src/main/java/com/church/memory/app/v15/widget/VerseLargeWidgetProvider.kt` - Large 위젯 Provider
- `android/app/src/main/java/com/church/memory/app/v15/widget/WidgetConfigActivity.kt` - 부서 선택 Activity
- `android/app/src/main/java/com/church/memory/app/v4/widget/` - (레거시, v15로 이동됨)
- `android/app/src/main/res/xml/verse_widget_info.xml` - Medium 위젯 메타데이터
- `android/app/src/main/res/xml/verse_large_widget_info.xml` - Large 위젯 메타데이터
- `android/app/src/main/res/layout/widget_config.xml` - 부서 선택 레이아웃
- `android/app/src/main/res/layout/widget_medium.xml` - Medium 위젯 레이아웃
- `android/app/src/main/res/layout/widget_large.xml` - Large 위젯 레이아웃
- `android/app/src/main/res/drawable/widget_background.xml` - 위젯 배경 (둥근 모서리)
- `android/app/src/main/res/values/widget_colors.xml` - 부서별 색상 정의

#### Client 신규 기능
- `client/src/components/exit-confirm-dialog.tsx` - 종료 확인 다이얼로그
- `client/src/components/flashcard-modal.tsx` - 플래시카드 모달
- `client/src/lib/back-handler.ts` - 뒤로가기 핸들러
- `client/src/lib/bookmarks.ts` - 북마크 유틸
- `client/src/lib/flashcard-utils.ts` - 플래시카드 유틸
- `client/src/lib/font-size-settings.ts` - 글꼴 크기 설정
- `client/src/lib/widget-data.ts` - 위젯 데이터 (TS 레이어)
- `client/src/pages/bookmarks.tsx` - 북마크 페이지
- `client/src/pages/verse-overview.tsx` - 구절 개요 페이지

#### 기타
- `client/public/seed.json` - 시드 데이터
- `ios/App/App/public/seed.json` - iOS용 시드 데이터
- `clear-storage.js` - 스토리지 초기화 스크립트

---

## Android 위젯 기능 구현 상세 (2026-02-14)

### 작업 배경
위젯 핵심 로직(Provider, XML 레이아웃, TS 데이터 레이어)이 60% 구현된 상태였으나, 다음 문제로 빌드 불가:
1. 패키지 불일치 (v4 ↔ v15)
2. Manifest 미등록
3. Kotlin 빌드 미설정
4. 구문 오류 (`companion fun` → `companion object`)

### 수행한 작업

#### 1. Kotlin 빌드 지원 추가
- `android/build.gradle`: `kotlin-gradle-plugin:1.9.24` classpath 추가
- `android/app/build.gradle`: `kotlin-android` 플러그인 + `kotlin-stdlib` 의존성

#### 2. 위젯 Kotlin 파일 v15 패키지로 이동
- `VerseWidgetProvider.kt`: v4 → v15 패키지 변경, 불필요한 Capacitor import 제거, `R.id.widget_background` 참조 제거
- `VerseLargeWidgetProvider.kt`: v4 → v15 패키지 변경, `companion fun {` → `companion object {` 구문 오류 수정

#### 3. 위젯 메타데이터 XML 생성
- `verse_widget_info.xml`: Medium 위젯 (250x110dp, 1시간 업데이트)
- `verse_large_widget_info.xml`: Large 위젯 (250x250dp, 1시간 업데이트)

#### 4. 부서 선택 Configuration Activity
- `WidgetConfigActivity.kt`: 유치부(분홍)/초등부(파랑)/중고등부(초록) 3버튼
- `widget_config.xml`: 다이얼로그 스타일 레이아웃
- SharedPreferences에 `widget_{id}_age_group` 저장

#### 5. AndroidManifest.xml 등록
- Medium 위젯 receiver (`VerseWidgetProvider`)
- Large 위젯 receiver (`VerseLargeWidgetProvider`)
- 위젯 설정 Activity (`WidgetConfigActivity`, Dialog 테마)

#### 6. strings.xml 업데이트
- `widget_medium_desc`: "이번 주 교회학교 암송 구절"
- `widget_large_desc`: "주간 암송 구절 (3주)"

### 위젯 데이터 흐름
```
[앱 실행] → widget-data.ts가 CapacitorStorage에 JSON 저장
    ↓
[위젯 업데이트] → Provider가 CapacitorStorage에서 JSON 읽기
    ↓
[위젯 표시] → RemoteViews로 레이아웃에 데이터 바인딩
```

### 위젯 종류
| 위젯 | 크기 | 내용 |
|------|------|------|
| Medium | 250x110dp | 이번 주 암송 1개 |
| Large | 250x250dp | 지난 주 + 이번 주 + 다음 주 |

---

## 중고등부 커리큘럼 진행률 버그 수정 (2026-02-14)

### 문제
메인화면 커리큘럼 진행률에서 중고등부가 **71%**로 표시됨. 실제로는 2025년 12월에 3년 사이클이 100% 완료되었고, 2026년 1월부터 새 사이클이 시작되어야 함.

### 원인
`client/src/pages/home.tsx` 진행률 계산 로직에 2가지 오류:

1. **anchor 불일치**: 유치부/초등부/중고등부 모두 `2024-01-01` anchor를 공유했으나, 중고등부 3년 사이클은 `2023-01-01`에 시작해서 `2025-12-31`에 끝남
2. **사이클 주기 오류**: 중고등부 사이클을 `157주`로 계산했으나, 3년 = `156주` (52*3)가 맞음

```
// 수정 전 (잘못된 계산)
anchor = 2024-01-01 (공통)
weeksSinceAnchor ≈ 110주
progressYouth = (110 % 157) / 157 = 70% → 71% ❌

// 수정 후 (올바른 계산)
youthAnchor = 2023-01-01 (중고등부 전용)
weeksSinceYouthAnchor ≈ 162주
progressYouth = (162 % 156) / 156 = 6/156 → 4% ✅
```

### 수정 내용
- **파일**: `client/src/pages/home.tsx` (line 48-53)
- 중고등부 전용 anchor를 `2023-01-01`로 분리
- 사이클 주기를 `157주` → `156주` (52*3)로 수정
- 유치부/초등부는 기존 anchor(`2024-01-01`) 유지, 영향 없음

### 사이클 정리
| 부서 | 사이클 | anchor | 현재 사이클 기간 | 현재 진행률 |
|------|--------|--------|-----------------|------------|
| 유치부 | 1년 (52주) | 2024-01-01 | 2026.1 ~ 2026.12 | ~12% |
| 초등부 | 2년 (104주) | 2024-01-01 | 2026.1 ~ 2027.12 | ~6% |
| 중고등부 | 3년 (156주) | 2023-01-01 | 2026.1 ~ 2028.12 | ~4% |

---

## Android 빌드 오류 수정 + 구절 카드 자동 비율 조절 (2026-02-17)

### 1. Android 빌드 오류 수정

**문제**: `assembleDebug` 시 `v4/widget/VerseWidgetProvider.kt`에서 `Unresolved reference: R`, `Unresolved reference: Capacitor` 오류 발생 (21개 에러)

**원인**:
- `build.gradle`에 `main.java.exclude '**/v4/**'`가 있지만 `.kt` 파일에는 exclude가 완전히 적용되지 않음
- `v4/widget/` 디렉토리가 untracked 상태로 남아있어 빌드에 포함됨
- v4 위젯 파일들이 잘못된 import (`com.church.memory.app.v4.R`, `com.getcapacitor.android.Capacitor`) 사용

**해결**: `v4/widget/` 디렉토리 삭제 (v15/widget에 동일한 정상 코드가 이미 존재)

### 2. 구절 카드 텍스트 잘림 문제 해결

**문제**: 부서별 탭(유치부/초등부/중고등부)에서 지난 주, 이번 주, 다음 주 3개 카드를 한 화면에 표시할 때, 긴 암송 구절의 텍스트가 잘려서 보이지 않음 (특히 중고등부 이사야 40장 26절)

**원인**:
- 3개 카드가 `flex-1` (균등 분할)로 고정 → 긴 구절 카드도 1/3 높이만 할당
- `overflow-hidden`으로 넘치는 텍스트 잘림
- compact 모드 폰트 크기가 너무 큼 (text-base 16px)

**해결 - 자동 비율 조절 시스템 구현**:

#### `verse-card.tsx` 변경
- `contentScale` prop 추가 (`'relaxed' | 'normal' | 'dense'`)
- `overflow-hidden` 제거
- 3단계 자동 폰트 크기:
  | Scale | 조건 | 제목 | 구절 내용 | 행간 | 패딩 |
  |-------|------|------|----------|------|------|
  | `relaxed` | 총 120자 미만 | 16px | 14px (text-sm) | leading-relaxed | p-3 |
  | `normal` | 120~250자 | 15px | 13px | leading-relaxed | p-2.5 |
  | `dense` | 250자 초과 | 14px (text-sm) | 12px (text-xs) | leading-snug | p-2 |

#### `age-group.tsx` 변경
- 3개 구절의 **총 글자 수** 계산 → `contentScale` 자동 결정
- 각 카드에 **비례 flex** 적용: `flex: ${Math.max(30, contentLength + 20)} 1 0%`
  - 긴 구절 카드에 더 많은 공간 배분 (기존 `flex-1` 균등 배분 → 내용 비례 배분)
- 카드 간격 `gap-3` → `gap-2`로 축소하여 콘텐츠 공간 확보

**결과**: 유치부(짧은 구절)/초등부(보통)/중고등부(긴 구절) 모두 한 화면에 텍스트 잘림 없이 표시

---

## 위젯 기능 고도화: 4x4 Large + Config 리디자인 + "전체" 모드 (2026-02-17)

### 1. Widget 4x4 (Large) 레이아웃 완성
- `widget_large.xml`: 헤더 + 3개 섹션(지난 주/이번 주/다음 주) 각각 `layout_weight="1"`
- 이번 주 섹션 강조 배경 + bold 처리
- `VerseLargeWidgetProvider.kt`: `updateSingleMode()` / `updateAllMode()` companion 메서드 구현

### 2. Widget Config 리디자인
- `widget_config.xml`: 3열 카드형 부서 선택 UI (유치부/초등부/중고등부)
- `widget_config_card.xml`: 흰색 카드 배경 (12dp 둥근 모서리, 1dp 테두리)
- `widget_config_card_accent.xml`: 파란색 강조 카드 (#EEF2FF)
- `WidgetConfigActivity.kt`: `Button` → `View` 타입으로 변경 (카드가 LinearLayout이므로)
- "메인화면 구성" accent 카드 추가 (btn_all)

### 3. "전체(all)" 모드 구현
- **Medium 위젯**: 3부서 이번 주 reference를 한 줄씩 표시
- **Large 위젯**: 3개 섹션을 유치부/초등부/중고등부 이번 주로 재활용
- `widget_config`에 "all" ageGroup 저장 → Provider에서 분기 처리
- 전체 모드 클릭 시 `open_tab = "home"`으로 메인화면 열기

---

## UI 높이 축소 + 다이얼로그 중앙 정렬 + 캡처 수정 (2026-02-17)

### 1. 부서별 탭 여백 축소
- **파일**: `client/src/pages/age-group.tsx`
- 헤더: `pt-8 pb-2` → `pt-6 pb-1`, `h-10` → `h-8`
- 콘텐츠: `mt-[76px]` → `mt-[58px]`, 카드 간격 `gap-2` → `gap-1`, `py-0.5` 추가
- 높이 계산: `calc(100dvh - 116px)` → `calc(100dvh - 96px)`

### 2. 메인 화면 개선
- **파일**: `client/src/pages/home.tsx`
- 헤더 축소: `pt-8 pb-2` → `pt-6 pb-1`, `h-10` → `h-8`
- "이번 주 암송 말씀" → "이번 주" (소제목 축약)
- 외부 `verse-card` 래퍼 제거 → 3부서 직접 `flex-col` 배치
- 각 부서: `verse-card flex-1 min-h-0 p-2.5`, 아이콘 `w-5 h-5`
- 높이: `calc(100dvh - 104px)`
- 하단 섹션(진행 중인 행사 + 커리큘럼 진행률) `space-y-4 py-4`로 감싸기

### 3. 구절 카드 패딩 타이트닝
- **파일**: `client/src/components/verse-card.tsx`
- `scaleStyles` 전체 축소:
  | Scale | 패딩 | 제목 | 내용 | 행간 |
  |-------|------|------|------|------|
  | relaxed | p-3→p-2 | text-base→text-[15px] | text-sm 유지 | leading-relaxed→leading-snug |
  | normal | p-2.5→p-2 | text-[15px]→text-sm | text-[13px] | leading-relaxed→leading-snug |
  | dense | p-2→p-1.5 | text-sm→text-[13px] | text-xs | leading-snug→leading-tight |
- 모든 headerGap, lessonGap → `mb-0.5` 또는 `mb-0`

### 4. 캘린더 삭제 팝업 중앙 정렬 수정
- **파일**: `client/src/pages/calendar.tsx`
- **문제**: `mx-4`가 `fixed left-[50%] translate-x-[-50%]`과 충돌하여 오른쪽으로 쏠림
- **해결**: 두 Dialog 모두 `mx-4` → `max-w-[calc(100vw-2rem)]`

### 5. 캡처 이미지 상단 여백 수정
- **파일**: `client/src/lib/capture-utils.ts`
- **문제**: html2canvas가 `pt-8` (32px) 상태바 패딩을 흰 여백으로 캡처
- **해결**: 캡처 전 header `paddingTop: '8px'`, main `marginTop: '40px'` 일시 설정
- 캡처 후 원래 값 복원 + finally 블록에서 안전 복원

### 6. 캘린더 헤더 축소
- 캘린더 탭 헤더도 동일하게 `pt-8` → `pt-6` 축소

---

## 6개 기능 일괄 구현 (2026-02-18)

### 1. 위젯 폰트/아이콘 통일
- **파일**: `widget_medium.xml`, `widget_large.xml`, `widget_config.xml`
- 이모지(📗📘📙📚🔄◀⭐▶✝️) → 텍스트 라벨
  - 위젯 제목: `📗 유치부 - 이번 주` → `유치부 · 이번 주`
  - 새로고침: `🔄` → `↻` (앱 primary 색상)
  - 주 라벨: `◀ 지난 주` / `⭐ 이번 주` / `▶ 다음 주` → `지난 주` / `★ 이번 주` / `다음 주`
  - config 카드: 이모지 → 부서 첫글자 아이콘(유/초/중/전) + 부서별 컬러
- `widget_colors.xml`: 앱 primary 색상(#6C63FF), 텍스트/배경 컬러 체계 추가
- `VerseWidgetProvider.kt`, `VerseLargeWidgetProvider.kt`: 이모지 유니코드 → 한글 텍스트

### 2. 스플래시 화면 수정
- **파일**: `client/src/components/splash-screen.tsx`
- "교회학교 암송 말씀" → "교회학교 암송 수첩"
- 타이틀 카드: `rounded-2xl` 제거 (직각 모서리)
- 로딩 인디케이터: `rounded-full` 제거 (직각 모서리)

### 3. 메인화면 버튼 재배치
- **파일**: `client/src/pages/home.tsx`
- 헤더 우측: "교육목표" + "설정" 세로 배치 → "설정" 버튼만 유지
- "이번 주" 타이틀 행에 "교육목표" 버튼 추가 (오른쪽 정렬, 높이 가운데)
- 결과:
  ```
  [🏠 메인화면 🔖]                    [⚙ 설정]
  [이번 주]                         [🖼 교육목표]
  ```

### 4. 캘린더 CSV 버튼 통합
- **파일**: `client/src/pages/calendar.tsx`
- 헤더 "내보내기" + "업로드" 두 버튼 → "CSV파일" 단일 버튼
- 클릭 시 Dialog 팝업:
  - "내보내기": 현재 일정을 CSV로 저장
  - "업로드": CSV/Excel 파일에서 일정 가져오기
- `FileSpreadsheet` 아이콘 사용 (lucide-react)
- `showCsvModal` 상태 추가

### 5. 캘린더 일정 알림 기능
- **파일**: `client/src/lib/notifications.ts`
  - `scheduleCalendarNotifications()`: 미래 이벤트에 대해 알림 등록
    - 당일 오전 9시: "오늘 일정: {제목}"
    - 전날 오후 8시: "내일 일정: {제목}"
    - ID 범위 10000~19999 (기존 알림과 충돌 방지)
  - `cancelCalendarNotifications()`: 캘린더 알림만 선택 취소
- **파일**: `client/src/pages/settings.tsx`
  - "캘린더 일정 알림" 토글 추가 (Switch 컴포넌트)
  - `cm_calendar_alarm_on` localStorage 키로 상태 저장
  - 저장 시 `calendarAlarmOn` 상태에 따라 알림 등록/취소

### 6. 전체목록 자동스크롤 수정 (유치부/초등부)
- **파일**: `client/src/pages/verse-overview.tsx`
- **문제**: 유치부/초등부에서 전체목록 진입 시 이번 주 암송 구절로 자동 스크롤이 안 됨 (중고등부만 동작)
- **원인 분석**:
  1. 날짜 파싱 불일치: `new Date(verse.date)` vs `new Date(verse.date + 'T00:00:00')` → 시간대 차이로 날짜 비교 실패 가능
  2. `cycleVerses` 슬라이싱: `slice(0, maxLessons)`로 현재 주 구절이 잘릴 수 있음 (다년 데이터에서 첫 N개만 취하므로)
- **해결**:
  1. `new Date(verse.date)` → `new Date(verse.date + 'T00:00:00')` (로컬 시간대 보장)
  2. `allVerses`에서 먼저 현재 주 구절 검색 → `cycleVerses`에서 ID 또는 reference로 재매칭
  3. 스크롤 딜레이 300ms → 500ms (DOM 렌더링 대기)
  4. `verses?.length` 의존성 추가 (데이터 로드 완료 후 스크롤 트리거)

---

## UI 개선 + 위젯 4차 수정 (2026-02-18)

### 1. 캡처 버튼 위치 이동
- **파일**: `client/src/components/capture-button.tsx`, `client/src/pages/age-group.tsx`
- fixed 포지션 → inline 헤더 내부 배치
- 부서 탭(유치부/초등부/중고등부) 헤더 우측에 제목과 높이 정렬
- 기존 `w-14` 스페이서 → `<CaptureButton />` 교체

### 2. 초등월암송 폰트 축소 + 한 화면 표시
- **파일**: `client/src/pages/monthly-verse.tsx`
- 헤더: `pt-12` → `pt-8`, `pb-4` → `pb-2`, 제목 `text-xl` → `text-lg`
- 콘텐츠: `py-6` → `py-3`, `space-y-6` → `space-y-4`
- Quote 아이콘: `w-16 h-16` → `w-12 h-12`, `mb-6` → `mb-3`
- 구절 내용: `text-lg sm:text-xl` → `text-sm sm:text-base`
- 장절 + 복사 버튼 한 줄로 합침 (`border-t` 구분선)
- 헤더에 CaptureButton 추가

### 3. 메인화면 개선
- **파일**: `client/src/pages/home.tsx`
- 설정 버튼: 알약형 링크 → 원형 아이콘 버튼 (`w-8 h-8 rounded-full bg-gray-100`)
- 설정을 북마크 옆으로 이동 (좌측 그룹)
- 헤더 우측에 CaptureButton 추가
- 소제목: "이번 주" → "부서 별 암송" (`text-base font-bold text-gray-800`)

### 4. 전체목록(verse-overview) 뒤로가기 수정
- **파일**: `client/src/pages/verse-overview.tsx`
- `<Link href="/">` → `<Link href="/home">` (2곳)
- 기존: `/` 경로 → 유치부 탭으로 이동 (AgeGroup 컴포넌트가 기본값)
- 수정: `/home` 경로 → 메인 홈 화면으로 올바르게 복귀

### 5. 위젯 4x2: "all" 모드 제거 + 크기 고정
- **파일**: `VerseWidgetProvider.kt`, `verse_widget_info.xml`
- `updateAllMode()` 함수 제거, `ageGroup == "all"` 시 kindergarten으로 fallback
- 코드 단순화: companion object에 단일 로직만 유지
- `verse_widget_info.xml`: `resizeMode="horizontal|vertical"` → `resizeMode="none"` (크기 변경 불가)

### 6. 위젯 4x4: 패딩 증가 (둥근 모서리 대응)
- **파일**: `widget_large.xml`
- 외부 padding: `14dp` → `18dp`
- 제목 앞 띄어쓰기 2칸 추가 (`"  유치부"`) → 디바이스 둥근 모서리로 인한 텍스트 잘림 방지

### 7. 위젯 공과명 색상 통일 (블랙)
- **파일**: `widget_large.xml`
- `last_week_lesson`, `this_week_lesson`, `next_week_lesson` 모두:
  - 기존: `@color/app_primary` 또는 `@color/app_primary_dark` (보라색)
  - 변경: `@color/text_primary` (#1F2937, 블랙)

### 8. 위젯 새로고침 피드백 (Toast)
- **파일**: `VerseWidgetProvider.kt`, `VerseLargeWidgetProvider.kt`, `AndroidManifest.xml`
- 커스텀 액션 추가:
  - `REFRESH_MEDIUM` (4x2 위젯)
  - `REFRESH_LARGE` (4x4 위젯)
- `onReceive()` 오버라이드: 커스텀 액션 수신 시 위젯 업데이트 + `Toast("새로고침 완료")` 표시
- Manifest에 커스텀 intent-filter 액션 등록
- 참고: RemoteViews 제약으로 아이콘 회전 애니메이션 불가, Toast로 피드백 대체

---

## UI 모던 리디자인: 퀴즈 선택 + 위젯 설정 (2026-02-18)

### 1. 암송 퀴즈 난이도 선택 화면 리디자인
- **파일**: `client/src/components/flashcard-modal.tsx`
- **Before**: 이모지(⭐🎓🏆) + 컬러풀 보더 박스 (전형적 AI 생성 스타일)
- **After**: 좌측 액센트 바(3px) + 클린 화이트 카드 + 태그 배지
  - 쉬움: emerald 액센트 + "선택형" 태그
  - 보통: amber 액센트 + "선택형" 태그
  - 완전 암송: violet 액센트 + "직접 입력" 태그
- 이모지 전면 제거: 선택 화면, 플레이 모드 헤더, 완료 화면
- 완료 화면: 이모지 → primary 컬러 CheckCircle 아이콘
- 구절 미리보기: 라인 클램프(2줄) + 장절 표시

### 2. 위젯 설정(Config) 화면 리디자인
- **파일**: `widget_config.xml`, drawable 3개
- **Before**: 3열 그리드 → "유치/초등/중고" 텍스트 세로 줄바꿈 + 불규칙 폰트
- **After**: 수직 리스트 카드 레이아웃
  - 각 카드: 좌측 컬러 인디케이터(5dp) + 부서명(15sp bold) + 연령대(11sp muted) + 화살표
  - 유치부(pink) / 초등부(blue) / 중고등부(green) / 전체(primary)
  - 구분선으로 개별 부서와 전체 보기 분리
- **새 drawable**: `widget_config_indicator.xml` (3dp 라운드 바), `widget_config_divider.xml`
- **수정 drawable**: `widget_config_card.xml` (14dp 라운드, 더 연한 보더), `widget_config_card_accent.xml` (보라톤)
- 모든 텍스트 수평 배치, 일관된 폰트 크기 (15sp/11sp), 줄바꿈 문제 해소

---

## 다음 해야 할 작업

### 검증
- [x] `cd android && ./gradlew assembleDebug` - Android 빌드 성공 확인 ✅ (2026-02-17)
- [ ] 에뮬레이터에서 위젯 추가 테스트
- [ ] 부서 선택 → 데이터 표시 → 새로고침 → 앱 열기 동작 확인

### 추가 고려사항
- [x] v4/widget/ 레거시 파일 정리 (삭제) ✅ (2026-02-17)
- [ ] widget-data.ts에서 CapacitorStorage 데이터 저장 로직 연동 확인
- [ ] 위젯 자동 업데이트 (앱 열 때마다 위젯 갱신 트리거)
- [ ] 위젯 삭제 시 SharedPreferences 정리 (onDeleted 구현)

---

## UI/UX 개선 (2026-02-18)

### 1. 공과명-암송구절 사이 빈 줄 추가
- **파일**: `verse-card.tsx`, `home.tsx`
- verse-card: lessonName과 blockquote 사이에 `h-1`(compact) / `h-2`(일반) spacer 추가
- home: 3부서 카드의 lessonName div에 `mb-1` 추가

### 2. 메인화면 텍스트/레이아웃 수정
- **파일**: `home.tsx`
- "부서 별 암송" → "부서별 암송" (띄어쓰기 수정)
- 섹션 타이틀 크기 통일: `text-xl font-semibold` → `text-base font-bold`
- 카드 영역 높이: `calc(100dvh - 104px)` → `calc(100dvh - 118px)`
- 카드 패딩: `p-2.5` → `p-2` (3부서 모두)

### 3. 캘린더 알림 시간 설정 기능
- **파일**: `settings.tsx`, `notifications.ts`
- settings: 캘린더 알림 ON 시 전날/당일 시간 선택 UI 표시 (time picker)
- notifications: `scheduleCalendarNotifications()`에 사용자 지정 시간 파라미터 추가
- Android 전용 'calendar' 알림 채널 생성
- 알림 제목에 일정명 포함 ("오늘 일정: {제목}", "내일 일정: {제목}")
- localStorage 키: `cm_calendar_dayof_time`, `cm_calendar_daybefore_time`

### 4. 위젯 설정 나이 설명 제거
- **파일**: `widget_config.xml`
- 유치부 "5-7세", 초등부 "8-13세", 중고등부 "14-18세", 전체 "3부서 이번 주 한눈에" TextView 제거

### 5. 초등월암송 중복 캡처 버튼 제거
- **파일**: `monthly-verse.tsx`
- 최상단 독립 `<CaptureButton />` 제거 (헤더 내부 캡처 버튼만 유지)
- 디버깅용 `console.log` 제거

### 6. 캘린더 상단 여백 축소
- **파일**: `calendar.tsx`
- 메인 영역: `pt-24` → `pt-20`
- 월 네비게이션: `mt-6` → `mt-3`

### 7. 캡처 시 텍스트 밀림 수정
- **파일**: `capture-utils.ts`
- 캡처 버튼 숨김: `display: 'none'` → `visibility: 'hidden'` (레이아웃 리플로우 방지)
- 복원: `display: ''` → `visibility: ''`

### 8. 반응형 폰트 시스템 (dvh 기반 황금비율)
- **파일**: `verse-card.tsx`, `home.tsx`
- **문제**: 고정 픽셀 크기(`text-xs`=12px, `text-[13px]`)로 인해 큰 화면(갤럭시 폴드4 등)에서 카드 대비 글자가 작음
- **해결**: CSS `clamp()` + `dvh`(dynamic viewport height) 단위로 화면 크기에 비례하는 반응형 폰트
- **황금비율(φ=1.618) 비례**:
  - Title: `clamp(15px, 2.3dvh, 26px)` — ×√φ ≈ 1.27x
  - Lesson: `clamp(14px, 2dvh, 23px)` — ×φ^¼ ≈ 1.13x
  - Content: `clamp(13px, 1.8dvh, 20px)` — base (1.0x)
  - Citation: `clamp(10px, 1.4dvh, 16px)` — ×1/√φ ≈ 0.79x
- **디바이스별 예상 크기** (content 기준):
  - 일반폰 (800px): ~14.4px / Fold4 inner (829px): ~14.9px / iPad (1080px): ~19.4px→20px
- `verse-card.tsx`: scaleStyles → responsiveScales + typeClasses 분리 (크기=inline style, 색상=Tailwind)
- `home.tsx`: cardSizes 상수로 3부서 카드 통일 적용 (패딩, 레이블, 공과명, 본문, 인용 모두 반응형)
- contentScale(relaxed/normal/dense)는 유지하되, 각 단계도 dvh 기반으로 자동 스케일

---

## 암송 체크 & 진행 추적 + 포인트/뱃지 시스템 (2026-02-18)

### 배경
마이루틴 앱, Duolingo 스트릭, Nike Run Club 뱃지 시스템을 참고한 게임화(gamification) 콘텐츠 추가. 롤백 용이한 구조 (새 파일 11개 삭제 + 기존 파일 5개에서 ~35줄 revert).

### 신규 파일 (11개)

#### Data Layer (4개)
- `client/src/lib/progress-storage.ts` - Capacitor Preferences 기반 완료 기록/스트릭/통계 CRUD
  - 타입: `CompletionRecord`, `DailyProgress`, `UserStats`, `DayStatus`
  - 함수: `saveCompletion()`, `getUserStats()`, `getWeeklyGrid()`, `getTodayCompletions()`
  - 스트릭 자동 계산: 어제 활동 → +1, 이틀 공백 + freeze 남아있으면 유지, 그 외 리셋
  - Storage key prefix: `cm_progress_`
- `client/src/lib/badge-definitions.ts` - 12개 뱃지 정적 정의 + 포인트 설정
  - 카테고리: streak(첫 걸음/3일/7일/30일), count(10/50/100회), difficulty(전문가1/10/30회), special(올 부서/1000pt)
  - `POINTS_CONFIG`: easy=10, hard=25, expert=50, streakBonus=5(연속일×), dailyFirst=10
- `client/src/lib/badge-engine.ts` - 뱃지 해금 조건 평가 엔진
  - `evaluateBadges(stats, completions, previouslyUnlocked)` → 새로 해금된 뱃지 목록 반환
- `client/src/lib/points-calculator.ts` - 난이도별 포인트 계산
  - `calculatePoints(difficulty, stats, isTodayFirst)` → `{ base, streakBonus, dailyFirst, total }`

#### Hook (1개)
- `client/src/hooks/use-progress.ts` - 통합 React hook
  - 반환: `{ stats, weeklyGrid, completions, unlockedBadgeIds, newBadges, lastPoints, recordCompletion(), clearNewBadges(), refresh() }`
  - `recordCompletion()`: 포인트 계산 → 저장 → 스트릭 업데이트 → 뱃지 평가 → 주간 그리드 새로고침

#### Components (4개)
- `client/src/components/streak-counter.tsx` - 🔥 연속 암송 카운터 위젯
  - 0일: 회색 배경, 1일+: orange gradient 배경
  - `compact` prop으로 크기 조절 (h-6/h-8)
- `client/src/components/weekly-dot-grid.tsx` - 마이루틴 스타일 7일 도트 그리드
  - 월~일 7칸, 완료=초록 도트(횟수 표시), 미완료=회색 도트
  - 오늘 날짜는 ring 강조
- `client/src/components/points-earned-toast.tsx` - 포인트 획득 애니메이션
  - framer-motion 기반 팝업: "+{n} 포인트" + 보너스 상세 + 새 뱃지 알림
- `client/src/components/badge-card.tsx` - 뱃지 카드 (해금/잠금)
  - 해금: 컬러 아이콘 + 이름, 잠금: 회색 자물쇠
  - lucide icon 동적 매핑 (ICON_MAP)

#### Pages (2개)
- `client/src/pages/my-progress.tsx` - 통계 대시보드
  - 스트릭 카운터, 총 포인트, 주간 달성률(프로그레스 바), 주간 도트 그리드
  - 뱃지 컬렉션 링크, 최근 기록 목록 (최근 10개)
- `client/src/pages/badges.tsx` - 뱃지 컬렉션
  - 3×n 그리드, 카테고리별 분류 (연속 암송/횟수 달성/난이도 도전/특별 업적)
  - 수집 진행률 바, 뱃지 탭 시 상세 모달

### 기존 파일 수정 (5개)

#### `App.tsx` (+3줄)
- import: MyProgressPage, BadgesPage
- Route 추가: `/my-progress`, `/badges`

#### `bottom-navigation.tsx` (~10줄)
- 6번째 탭 추가: "내 암송" (Trophy 아이콘, `/my-progress`)
- 6탭 대응: `min-w-[52px]`→`[44px]`, `px-2`→`px-1`, `text-[10px]`→`[9px]`

#### `flashcard-modal.tsx` (~15줄)
- `handleComplete()`에 `recordCompletion(verse, difficulty)` 호출 추가
- 완료 화면에 `PointsEarnedToast` 컴포넌트 표시
- `reset()`에 `setShowPoints(false)`, `clearNewBadges()` 추가

#### `home.tsx` (+3줄)
- import StreakCounter + 헤더 좌측 그룹에 `<StreakCounter compact />` 추가

#### `age-group.tsx` (+5줄)
- import StreakCounter + 헤더 우측에 `<StreakCounter compact />` 추가

### 포인트 시스템
| 난이도 | 기본 | 스트릭 보너스 | 첫 암송 보너스 | 예시 (7일 연속) |
|--------|------|-------------|--------------|----------------|
| 쉬움 | 10 | 7×5=35 | +10 | 55pt |
| 보통 | 25 | 7×5=35 | +10 | 70pt |
| 완전 암송 | 50 | 7×5=35 | +10 | 95pt |

---

## 캡처 버튼 스타일 변경 (2026-02-18)

### 변경 내용
- **파일**: `client/src/components/capture-button.tsx`
- **Before**: `h-8 px-2.5` 사각형 outline Button + 카메라 아이콘 + "캡처" 텍스트
- **After**: `w-8 h-8 rounded-full bg-gray-100` 원형 버튼 + 카메라 아이콘만 (글자 없음)
- 북마크 버튼(`w-8 h-8 rounded-full bg-amber-100`)과 동일한 스타일 통일
- `Button` 컴포넌트 import 제거 (네이티브 `<button>` 사용)
- 적용 범위: 유치부, 초등부, 중고등부, 메인화면, 초등월암송 (공통 컴포넌트이므로 자동 적용)

---

## 내비게이션 바 5탭 복원 + 암송 뱃지 진입 변경 + 데이터 영속성 + 뱃지 확장 (2026-02-22)

### 1. 내비게이션 바 5개 탭으로 복원
- **파일**: `client/src/components/bottom-navigation.tsx`
- "내 암송" (Trophy) 6번째 탭 제거 → 기존 5탭 복원
- 탭 스타일 복원: `min-w-[44px]` → `min-w-[52px]`, `px-1` → `px-2`, `text-[9px]` → `text-[10px]`
- 탭 순서: 유치부 / 초등부 / 메인화면 / 중고등부 / 캘린더

### 2. 스트릭 카운터 → "암송 뱃지" 페이지 이동 링크
- **파일**: `client/src/components/streak-counter.tsx`
- 기존 `<div>` → `<Link href="/my-progress"><a>` 래핑
- 메인화면, 유치부, 초등부, 중고등부 헤더의 불씨 마크(🔥 + 숫자) 클릭 → "/my-progress" 페이지 이동
- wouter Link import 추가

### 3. "내 암송" → "암송 뱃지" 이름 변경
- **파일**: `client/src/pages/my-progress.tsx` — 페이지 타이틀 변경
- **파일**: `client/src/pages/badges.tsx` — 뒤로가기 링크 텍스트 변경

### 4. 로컬 데이터 영속성 보장 (앱 업데이트 시 초기화 방지)
- **파일**: `client/src/lib/progress-storage.ts`
- **현재 방식**: Capacitor Preferences API 사용
  - Android: SharedPreferences → 앱 업데이트 시 유지 ✅
  - iOS: UserDefaults → 앱 업데이트 시 유지 ✅
  - 삭제 조건: 사용자가 수동으로 "앱 데이터 삭제" 또는 앱 재설치 시에만 초기화
- **추가 구현**:
  - `CURRENT_DATA_VERSION` 상수 + `ensureDataVersion()` 함수: 향후 스키마 변경 시 자동 마이그레이션 대응
  - `exportProgressData()`: 전체 진행 데이터를 JSON 문자열로 내보내기 (수동 백업)
  - `importProgressData()`: JSON 문자열에서 진행 데이터 복원
  - `ProgressBackup` 타입: version, exportedAt, completions, stats, unlockedBadges
  - `checkPerfectWeekFromCompletions()`: 완벽한 한 주 달성 여부 검사 (뱃지 조건용)

### 5. 뱃지 8개 추가 (12개 → 20개)
- **파일**: `client/src/lib/badge-definitions.ts`
- **파일**: `client/src/lib/badge-engine.ts`
- **파일**: `client/src/components/badge-card.tsx`

#### 추가된 뱃지 목록
| ID | 이름 | 카테고리 | 아이콘 | 색상 | 해금 조건 |
|----|------|---------|--------|------|----------|
| `streak_14` | 2주 연속 | streak | Target | orange-400 | 14일 연속 암송 |
| `streak_60` | 두 달 챔피언 | streak | Mountain | red-600 | 60일 연속 암송 |
| `count_200` | 이백 달성 | count | Rocket | blue-600 | 총 200회 암송 |
| `count_500` | 오백 마스터 | count | Heart | indigo-600 | 총 500회 암송 |
| `all_difficulty` | 전 난이도 클리어 | difficulty | Brain | pink-500 | 쉬움/보통/완전 암송 각 1회 이상 |
| `points_5000` | 5천 포인트 | special | Compass | cyan-600 | 총 5000 포인트 |
| `points_10000` | 만 포인트 달성 | special | Sun | yellow-500 | 총 10000 포인트 |
| `weekly_perfect` | 완벽한 한 주 | special | CalendarCheck | emerald-600 | 월~일 7일 모두 암송 |

#### 카테고리별 뱃지 수
| 카테고리 | 기존 | 추가 | 합계 |
|---------|------|------|------|
| 연속 암송 (streak) | 4 | 2 | 6 |
| 횟수 달성 (count) | 3 | 2 | 5 |
| 난이도 도전 (difficulty) | 3 | 1 | 4 |
| 특별 업적 (special) | 2 | 3 | 5 |
| **총합** | **12** | **8** | **20** |

#### badge-engine.ts 조건 추가
- `streak_14`: `currentStreak >= 14 || longestStreak >= 14`
- `streak_60`: `currentStreak >= 60 || longestStreak >= 60`
- `count_200`: `totalCompletions >= 200`
- `count_500`: `totalCompletions >= 500`
- `all_difficulty`: easy/hard/expert 각 1회 이상 (Set으로 검사)
- `points_5000`: `totalPoints >= 5000`
- `points_10000`: `totalPoints >= 10000`
- `weekly_perfect`: `checkPerfectWeekFromCompletions()` — 월~일 7일 연속 완료 검사

#### badge-card.tsx ICON_MAP 추가
- Target, Mountain, Rocket, Heart, Brain, Compass, Sun, CalendarCheck (lucide-react)

---

## 캘린더 상단 여백 추가 축소 + 과거 일정 자동 숨김 (2026-02-22)

### 1. 캘린더 상단 여백 절반 축소
- **파일**: `client/src/pages/calendar.tsx`
- 메인 영역: `pt-20` → `pt-16` (80px → 64px)
- 월 네비게이션: `mt-3` → `mt-1.5` (12px → 6px)
- 변경 이력: `pt-24` → `pt-20` → `pt-16`, `mt-6` → `mt-3` → `mt-1.5`

### 2. 과거 일정 자동 숨김 처리
- **파일**: `client/src/pages/calendar.tsx`
- `isEventPast()` 유틸 함수 추가: 이벤트의 종료일(`endDate`) 또는 날짜(`date`)가 오늘 이전이면 `true`
- **적용 범위**:
  - 캘린더 그리드 점(dot): `getEventsOnDate()` 내부에서 과거 이벤트 필터링 → 지난 날짜에 점이 표시되지 않음
  - 이번 달 행사 리스트: `calendarData.events`를 `isEventPast()`로 필터링 → 지난 이벤트 미표시
  - 일정 삭제 모달: 삭제 대상 목록에서도 과거 이벤트 제외
- **기존 안전한 부분**: 메인화면 "진행 중인 행사"는 이미 `target >= start && target <= end` 필터 적용 → 추가 수정 불필요
- **결과**: 2025년 8월 등 과거 일정이 캘린더에서 자동으로 숨겨짐. 데이터는 삭제되지 않고 보존됨 (단순 필터링).

---

## 스플래시 화면 배경 사각형 완전 제거 (2026-02-22)

### 변경 내용
- **파일**: `client/src/components/splash-screen.tsx`
- **제목 영역**: `bg-white/90 backdrop-blur-sm shadow-xl` 제거 → 배경 없이 글자만 표시
  - 글자 색상: `text-gray-800` → `text-white drop-shadow-lg` (배경 이미지 위 가독성)
  - 서브 타이틀: `text-gray-600` → `text-white/80 drop-shadow-md`
- **로딩 인디케이터**: `bg-white/80 backdrop-blur-sm shadow-xl` 래퍼 div 제거 → 글자+도트만 표시
  - 도트 색상: `bg-blue-500` → `bg-white drop-shadow-md`
  - 텍스트: `text-gray-700` → `text-white drop-shadow-md`
- **결과**: 스플래시 배경 이미지 위에 사각형 박스 없이 글자와 도트만 투명하게 떠있는 형태

---

## 부서 탭 카드 균등 1/3 + 내비 잘림 수정 (2026-02-22)

### 문제
유치부/초등부/중고등부 탭에서 "다음 주" 카드 하단이 내비게이션 바에 의해 잘려서 둥근 모서리와 그림자가 보이지 않음.

### 원인
높이 계산 `calc(100dvh - 96px)`에서 내비게이션 바 높이(~48px)를 빼지 않았음. 또한 글자 양에 따른 비례 flex 배분으로 카드 크기가 불균등했음.

### 수정 내용
- **파일**: `client/src/pages/age-group.tsx`
- **높이 계산 보정**: `calc(100dvh - 96px)` → `calc(100dvh - 114px)`
  - 58px(헤더) + 48px(내비바) + 8px(그림자 안전 여백) = 114px
- **카드 크기 균등화**: 글자 양 비례 flex(`flexValues[idx]`) → `flex-1`(균등 1/3)
  - `getFlexGrow()` 함수 및 `flexValues` 제거
  - 각 카드 `<div className="flex-1 min-h-0">`
- **폰트 밀도는 유지**: `contentScale`(relaxed/normal/dense) 자동 결정 로직 유지 → 긴 구절은 폰트가 작아져서 1/3 안에 수용

### 결과
```
┌──────────────────┐
│ 헤더 (58px)       │
├──────────────────┤
│ 지난 주    [1/3]  │
│──────────────────│
│ 이번 주    [1/3]  │
│──────────────────│
│ 다음 주    [1/3]  │
│ ↕ 그림자 여유(8px)│
├──────────────────┤
│ 내비게이션 (48px)  │
└──────────────────┘
```

---

## 메인화면 부서별 암송 카드 한 화면 수정 (2026-02-22)

### 문제
메인화면의 유치부/초등부/중고등부 3장 카드도 하단이 내비게이션 바 아래로 잘림.

### 수정 내용
- **파일**: `client/src/pages/home.tsx`
- **높이 계산 보정**: `calc(100dvh - 118px)` → `calc(100dvh - 142px)`
  - 58px(헤더) + 28px(타이틀행 "부서별 암송") + 48px(내비바) + 8px(그림자 여유) = 142px
- **카드 간격 축소**: `gap-1.5`(6px) → `gap-1`(4px) — 부서 탭과 통일

---

## 위젯 확대 방지 + 4x2→4x1 변경 + 메인화면 옵션 제거 (2026-02-22)

### 1. 4x4 위젯 확대(zoom) 문제 해결
**문제**: 위젯 클릭 → 앱 실행 → 돌아오면 위젯이 확대되어 제목 글자("중고등부"의 "ㅈ") 잘림
**원인**: `resizeMode="horizontal|vertical"` + 텍스트 단위 `sp`(사용자 글꼴 설정 연동)

**수정**:
- **파일**: `android/app/src/main/res/xml/verse_large_widget_info.xml`
  - `resizeMode="horizontal|vertical"` → `resizeMode="none"` (크기 변경 불가)
- **파일**: `android/app/src/main/res/layout/widget_large.xml`
  - 모든 `textSize` 단위: `sp` → `dp` (15sp→15dp, 12sp→12dp, 11sp→11dp, 10sp→10dp, 16sp→16dp)
  - `dp`는 화면 밀도만 고려하여 고정 크기 유지 (사용자 글꼴 설정에 영향받지 않음)

### 2. Medium 위젯 4x2 → 4x1 변경
- **파일**: `android/app/src/main/res/xml/verse_widget_info.xml`
  - `minHeight="110dp"` → `minHeight="40dp"` (4x1 높이)
- **파일**: `android/app/src/main/res/layout/widget_medium.xml` — 전면 재구성
  - **Before**: 세로 레이아웃 (제목 + 공과명 + 암송 내용 3줄 + 장절) → 4x2에서도 빡빡
  - **After**: 가로 레이아웃 (좌: 제목+내용1줄+장절, 우: 새로고침) → 4x1에 최적화
  - 공과명(`widget_lesson_name`)은 `visibility="gone"`으로 숨김 (Provider 호환 유지)
  - 모든 텍스트: `sp` → `dp` (확대 방지)
  - 암송 내용: `maxLines="1"` + `ellipsize="end"` (한 줄 표시)
- **파일**: `android/app/src/main/res/values/strings.xml`
  - `widget_medium_desc`: "이번 주 교회학교 암송 구절" → "이번 주 암송 구절 (4x1)"
- **파일**: `android/app/src/main/AndroidManifest.xml`
  - 주석 업데이트: "Medium 위젯 (4x2)" → "Medium 위젯 (4x1)"

### 3. 위젯 Config에서 "전체 보기(메인화면)" 제거
- **파일**: `android/app/src/main/res/layout/widget_config.xml`
  - 구분선 + "전체 보기"(`btn_all`) LinearLayout 전체 삭제
  - 선택 가능: 유치부 / 초등부 / 중고등부 (3개만)
- **파일**: `android/app/src/main/java/.../WidgetConfigActivity.kt`
  - `btn_all` onClick 리스너 제거

### 위젯 종류 정리 (수정 후)
| 위젯 | 크기 | 내용 | resizeMode | 텍스트 |
|------|------|------|------------|--------|
| Small (4x1) | 250x40dp | 이번 주 암송 1줄 | none | dp |
| Large (4x4) | 250x250dp | 지난/이번/다음 주 | none | dp |

---

## 부서 탭 카드 상하 여백 균등화 + 위젯 확대 재수정 (2026-02-22)

### 1. 부서 탭(유치부/초등부/중고등부) 카드 상단 여백 추가
- **파일**: `client/src/pages/age-group.tsx`
- **문제**: "지난 주" 카드 윗면이 헤더 경계에 2px만 떨어져 답답한 느낌
- **원인**: `py-0.5`(2px 양쪽) + calc 안 8px safety가 하단에만 적용 → 상단 2px vs 하단 10px 불균형
- **수정**:
  - 높이: `calc(100dvh - 114px)` → `calc(100dvh - 106px)` (58px 헤더 + 48px 내비 = 106px만 차감)
  - 패딩: `py-0.5`(2px) → `py-2`(8px) — 상하 균등 8px 여백
  - 카드 크기 `flex-1` 균등 배분은 유지
- **결과**: 상단("지난 주"↔헤더)과 하단("다음 주"↔내비바) 여백이 동일하게 8px

### 2. 4x4 위젯 확대(zoom) 문제 2차 수정
- **이전 수정**: `resizeMode="none"` + `sp→dp` (효과 없었음)
- **원인 분석**: `FLAG_ACTIVITY_CLEAR_TASK`가 앱을 완전히 종료/재시작 → 런처가 위젯 크기 재계산하며 확대
- **수정 내용**:
  1. **Intent 플래그 변경** (`VerseLargeWidgetProvider.kt`):
     - Before: `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK` (앱 종료 후 재시작)
     - After: `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TOP | FLAG_ACTIVITY_SINGLE_TOP` (기존 화면 재사용)
  2. **maxResize 제약 추가** (`verse_large_widget_info.xml`):
     - `maxResizeWidth="250dp"`, `maxResizeHeight="250dp"` — 런처가 최대 크기를 초과하지 못하도록 강제
     - `targetCellWidth="4"`, `targetCellHeight="4"` — API 31+ 정확한 셀 지정

### 3. 4x1 위젯 동일 수정 적용
- **코드 검증**: `widget_medium.xml`(수평 1줄 레이아웃) + `VerseWidgetProvider.kt`(thisWeek만 읽기) 모두 정상
- **수정 내용**:
  - `VerseWidgetProvider.kt`: 동일 Intent 플래그 변경 (`CLEAR_TASK` → `CLEAR_TOP | SINGLE_TOP`)
  - `verse_widget_info.xml`: `maxResizeWidth="250dp"`, `maxResizeHeight="40dp"`, `targetCellWidth="4"`, `targetCellHeight="1"` 추가
  - Provider 주석: "Medium 4x2" → "Medium 4x1"
- **중요**: 4x1 위젯에서 아직 3주가 보이는 문제는 **APK 재빌드/재설치 후 기존 위젯 삭제 → 재추가** 필요
  - Android는 위젯 레이아웃 XML을 캐시하므로, APK 업데이트만으로는 기존 위젯 레이아웃이 갱신되지 않을 수 있음
  - 새 위젯을 추가하면 새 `widget_medium.xml` (수평 1줄)이 적용됨

### 위젯 Intent 플래그 변경 이유
| 플래그 | 동작 | 위젯 영향 |
|--------|------|----------|
| `CLEAR_TASK` | 앱 프로세스 종료 후 새 Activity 생성 | 런처가 프로세스 죽음을 감지 → 위젯 크기 재계산 (확대) |
| `CLEAR_TOP + SINGLE_TOP` | 기존 Activity를 최상단으로 가져옴 | 프로세스 유지 → 런처 위젯 크기 변경 없음 |

---

## 위젯 Config 색상 통일 + 암송 뱃지 제목 정렬 + 뱃지 순서 변경 (2026-02-22)

### 1. 위젯 부서 선택(Config) 인디케이터 색상 → 앱 아이콘 색상 통일
- **파일**: `android/app/src/main/res/values/widget_colors.xml`, `android/app/src/main/res/layout/widget_config.xml`
- **문제**: 위젯 부서 선택 화면의 좌측 컬러 바가 앱 내 부서 아이콘 색상과 불일치
- **수정**:
  - `widget_colors.xml`에 Tailwind 색상 추가: `pink_600`(#DB2777), `blue_600`(#2563EB), `green_600`(#16A34A)
  - `widget_config.xml` 인디케이터: `@color/pink_700` → `@color/pink_600`, `blue_700` → `blue_600`, `green_700` → `green_600`
- **색상 대응표**:
  | 부서 | 앱 아이콘 (Tailwind) | 위젯 Before | 위젯 After |
  |------|---------------------|-------------|------------|
  | 유치부 | pink-600 (#DB2777) | #C2185B | #DB2777 |
  | 초등부 | blue-600 (#2563EB) | #1976D2 | #2563EB |
  | 중고등부 | green-600 (#16A34A) | #388E3C | #16A34A |

### 2. "암송 뱃지" 페이지 제목 가운데 정렬
- **파일**: `client/src/pages/my-progress.tsx`, `client/src/pages/badges.tsx`
- **문제**: 왼쪽 뒤로가기 버튼(~40px)과 오른쪽 스페이서(w-16=64px) 크기 불일치로 제목이 중앙에서 벗어남
- **수정**: `<h1>`에 `absolute left-1/2 -translate-x-1/2` 적용 → 부모 컨테이너에 `relative` 추가
- 두 페이지 모두 동일 패턴 적용 (암송 뱃지 / 뱃지 컬렉션)

### 3. 뱃지 컬렉션 표시 순서 변경
- **파일**: `client/src/lib/badge-definitions.ts`
- BADGES 배열 순서가 카테고리별 표시 순서를 결정 (`BADGES.filter(b => b.category === key)`)

#### 난이도 도전 (difficulty) 순서 변경
| 순서 | Before | After |
|------|--------|-------|
| 1 | 완전 암송 도전 | 완전 암송 도전 |
| 2 | 암송 달인 | **전 난이도 클리어** (이동) |
| 3 | 말씀의 사람 | 암송 달인 |
| 4 | 전 난이도 클리어 | 말씀의 사람 |

#### 특별 업적 (special) 순서 변경
| 순서 | Before | After |
|------|--------|-------|
| 1 | 모든 부서 정복 | 천 포인트 돌파 |
| 2 | 천 포인트 돌파 | 5천 포인트 |
| 3 | 5천 포인트 | 만 포인트 달성 |
| 4 | 만 포인트 달성 | 완벽한 한 주 |
| 5 | 완벽한 한 주 | **모든 부서 정복** (맨 마지막) |

---

## 캡처 이미지 텍스트 밀림 근본 수정 (2026-02-22)

### 문제
캡처 버튼으로 저장된 이미지에서 제목과 글자들이 원래 위치보다 아래로 밀리는 현상 지속.

### 근본 원인
`html2canvas`는 `position: fixed` 요소의 좌표를 정확히 계산하지 못함.
- 헤더가 `fixed top-0`인데, html2canvas가 이를 normal flow와 혼합 계산하면서 위치 오차 발생
- 기존 우회 방법(paddingTop/marginTop 임시 조정)은 증상만 완화하고 근본 해결 못함

### 이전 방식 (문제)
```
캡처 전: header.paddingTop = '8px', main.marginTop = '40px'
캡처 후: 원복
→ fixed 포지셔닝은 그대로 → html2canvas 위치 계산 오류 여전
```

### 새 방식 (해결): fixed → static 전환
```
캡처 전: header.position = 'relative' (fixed 제거)
         main.marginTop = '0px' (static 헤더가 공간 차지하므로 불필요)
         nav.display = 'none' (하단 내비 숨김)
캡처 후: 모든 스타일 원복
→ html2canvas가 보는 레이아웃이 완전한 static → 위치 계산 정확
```

### 수정 파일

#### `client/src/lib/capture-utils.ts` — 전면 재작성
- **핵심 변경**: 캡처 전 `header.position = 'relative'` + `main.marginTop = '0px'` + `nav.display = 'none'`
- **안전한 원복 시스템**: 변경할 모든 CSS 속성을 `originals[]` 배열에 저장 → `restoreAll()`로 일괄 원복
  - try/catch 성공/실패 모두에서 원복 호출
- **파일 저장 로직 분리**: `saveOrShare()` 헬퍼 함수로 추출 (캡처 로직과 저장 로직 분리)
- **개선점**:
  - `finally`에서의 불안정한 조건부 복원 → `restoreAll()` 안전 원복으로 대체
  - paddingTop/marginTop 미세 조정 해킹 → position 자체 변경으로 근본 해결
  - DOM reflow 대기: 100ms → 50ms (불필요한 대기 축소)

#### `client/src/components/bottom-navigation.tsx`
- `<nav>` 태그에 `data-bottom-nav` 속성 추가
- 캡처 시 `document.querySelector('[data-bottom-nav]')`로 내비바 탐색 → `display: none`으로 숨김

### 캡처 시 DOM 변환 전후 비교
```
[캡처 전]                          [캡처 중 (50ms)]
┌─ header (fixed top-0) ──┐      ┌─ header (relative) ────┐
│  pt-6 pb-1              │      │  pt-6 pb-1             │
│  제목 + 아이콘           │      │  제목 + 아이콘          │
└──────────────────────────┘      ├─ main (mt: 0) ─────────┤
┌─ main (mt-[58px]) ──────┐      │  카드1 / 카드2 / 카드3  │
│  카드1 / 카드2 / 카드3    │      └──────────────────────────┘
└──────────────────────────┘      (nav: display none)
┌─ nav (fixed bottom-0) ──┐
│  유치부 | 초등부 | ...    │
└──────────────────────────┘
```

---

## 메인화면 "부서별 암송" 상단 여백 추가 (2026-02-22)

### 변경 내용
- **파일**: `client/src/pages/home.tsx`
- **문제**: "부서별 암송" 제목과 "교육목표" 아이콘이 헤더 경계에 딱 붙어 답답함
- **수정**: 부서 탭(age-group.tsx)과 동일한 방식 적용
  - 타이틀행 + 카드를 감싸는 외부 wrapper div 추가: `py-2` + `calc(100dvh - 106px)`
  - 타이틀행에 `flex-shrink-0` 추가 (크기 고정)
  - 카드 컨테이너에 `flex-1 min-h-0` 추가 (남은 공간을 카드가 채움)
- **결과**: 상단 8px + 하단 8px 균등 여백, 3부서 카드 한 화면 유지

---

## 캡처 라이브러리 교체: html2canvas → html-to-image (2026-02-22)

### 배경
html2canvas의 고질적인 fixed 요소 위치 계산 오류로 캡처 이미지에서 텍스트가 밀리는 문제.
fixed→static 전환 우회도 삼성 노트10 WebView에서 효과 없음.

### 근본적 방식 차이
| | html2canvas (제거) | html-to-image (새로 적용) |
|--|---|---|
| **렌더링** | DOM을 읽어서 캔버스에 직접 다시 그림 | DOM → SVG foreignObject → Canvas |
| **fixed 처리** | 자체 좌표 계산 (오류 발생) | **브라우저 렌더링 엔진이 처리** (정확) |
| **위치 밀림** | 고질적 문제 | 원리적으로 불가 |
| **번들 크기** | ~200KB | ~10KB |

### 수정 파일
- **`package.json`**: `html-to-image` 의존성 추가 (`npm install html-to-image`)
- **`client/src/lib/capture-utils.ts`**: 전면 재작성
  - `import { toPng } from 'html-to-image'` 사용
  - DOM 조작 최소화: 캡처 버튼/내비바만 `visibility: hidden`으로 숨김
  - fixed→static 전환 해킹 완전 제거 (불필요)
  - `toPng(document.body, { pixelRatio: 2, filter })` 호출
  - `filter` 콜백으로 캡처 버튼과 내비바 제외

### 코드 비교 (핵심 부분)
```typescript
// Before (html2canvas): DOM 조작 필요
header.style.position = 'relative';  // fixed 해제
mainEl.style.marginTop = '0px';       // 마진 제거
const canvas = await html2canvas(document.body, { ... });

// After (html-to-image): DOM 조작 불필요
const dataUrl = await toPng(document.body, {
  pixelRatio: 2,
  filter: (node) => !node.hasAttribute?.('data-capture-button'),
});
```

---

## 위젯 레이아웃: layout_weight → 고정 dp (2026-02-22)

### 배경
삼성 One UI 런처에서 `layout_weight` 기반 비례 레이아웃의 크기가 앱 전환 후 재계산되면서 위젯이 확대되는 문제.

### 수정 내용

#### `widget_large.xml` (4x4)
- **3개 섹션(지난 주/이번 주/다음 주)**: `height="0dp" layout_weight="1"` → `height="58dp"` (고정)
- **각 섹션 내 본문 텍스트**: `height="0dp" layout_weight="1"` → `height="wrap_content" maxLines="2"` (고정)
- **헤더**: `wrap_content` → `24dp` (고정)
- **패딩**: `18dp` → `16dp`, 섹션 내부 `8dp` → `6dp` (고정 높이에 맞춤)
- **크기 계산**: 16*2(pad) + 24+6(header) + 58*3(sections) + 4*2(margin) = 250dp (위젯 전체 높이에 정확히 맞음)

#### `widget_medium.xml` (4x1)
- **루트 높이**: `match_parent` → `40dp` (고정)
- **패딩**: 미세 조정 (8dp → 6dp)
- **새로고침 버튼**: `wrap_content` → `24dp x 24dp` (고정)
- 좌측 콘텐츠 weight="1"은 수평 방향이므로 유지 (삼성 이슈는 수직 weight에서 발생)

### 변경 원리
| | Before (weight 기반) | After (고정 dp) |
|--|---|---|
| **섹션 높이** | `height="0dp" weight="1"` (비례) | `height="58dp"` (고정) |
| **본문 높이** | `height="0dp" weight="1"` (나머지 채움) | `wrap_content maxLines="2"` (고정) |
| **런처 재계산** | weight 비율 재계산 → 크기 변동 | 고정값이라 재계산 불가 |

---

## 암송 연습 보기 버그 수정 + 한글 입력 수정 + UI 변경 (2026-03-11)

### 1. 암송 연습 빈칸 보기에서 정답 누락 버그 수정

#### 문제
쉬움/보통 모드에서 빈칸의 정답이 보기에 없어서 문제를 풀 수 없는 경우 발생.

#### 원인 (2가지)

**원인 A: 셔플 후 slice로 정답 잘림**
- `flashcard-utils.ts:122-124`에서 정답+오답을 합친 뒤 셔플 → `.slice(0, 15)`로 자름
- 보통 모드(정답 10개 + 오답 8개 = 18개)에서 셔플 후 뒤쪽에 있는 정답이 잘려나감
- 예: 정답 10개 중 3개가 slice 이후 소실 → 해당 빈칸은 절대 맞출 수 없음

**원인 B: 중복 단어가 usedChoices Set에서 전부 제거**
- "만일 우리가 우리 죄를 자백하면 저는 미쁘시고 의로우사 우리 죄를 사하시며" 같은 구절에서 "우리", "죄를"이 여러 번 등장
- `usedChoices`가 `Set<string>`이라서 "우리"를 한 번 선택하면 보기의 모든 "우리"가 사라짐
- 두 번째 빈칸의 정답 "우리"가 보기에서 없어짐

#### 수정 내용

**파일: `client/src/lib/flashcard-utils.ts`**
- 보기 생성: 정답을 먼저 전부 확보 → 남은 자리를 오답으로 채움 (셔플 후 slice 제거)
- 오답 개수: `max(15 - 정답수, 4)` → 전체 보기 ~15개 유지, 최소 오답 4개 보장
- 오답 후보 중복 제거 (Set 사용)

```typescript
// Before (정답 잘릴 수 있음)
choices = [...correctAnswers, ...wrongAnswers]
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.min(15, correctAnswers.length + 8));

// After (정답 반드시 포함)
const wrongCount = Math.max(15 - correctAnswers.length, 4);
const wrongAnswers = generateWrongAnswers(words, correctAnswers, wrongCount);
choices = [...correctAnswers, ...wrongAnswers]
  .sort(() => Math.random() - 0.5);
```

**파일: `client/src/components/flashcard-modal.tsx`**
- `usedChoices: Set<string>` → `usedChoiceIndices: Set<number>` (인덱스 기반 추적)
- "우리"가 보기에 2번 있으면, 1번 사용해도 나머지 1개는 보기에 유지
- Easy/Hard 모드 보기 렌더링: `.filter(choice => !usedChoices.has(choice))` → `.filter(({ idx }) => !usedChoiceIndices.has(idx))`

### 2. 한글 입력 시 글자가 스페이스 후에야 보이는 문제 (부분 해결)

#### 문제
검색, 일정 등록, 완전 암송 모드 등 텍스트 입력 시 한글을 입력하면 글자가 보이지 않다가 스페이스를 눌러야 표시됨.

#### 원인
React의 controlled input (`value={state}` + `onChange`)에서 한글 IME 조합 중 React가 `input.value`를 상태값으로 덮어쓰면서 조합이 중단됨. Android WebView(Capacitor)에서 특히 심각.

#### 시도 1: composition 이벤트 (실패)
- `compositionStart`에서 `onChange` 억제 → `compositionEnd`에서 한번에 반영
- **결과**: Capacitor Android WebView에서 composition 이벤트가 발생하지 않아 효과 없음

#### 시도 2: uncontrolled input 전환 (검색은 성공, 텍스트 입력은 미해결)
- `value` prop을 네이티브 input에 전달하지 않음 (React가 input.value를 덮어쓰지 않음)
- `defaultValue`로 초기값 설정, `onInput`(네이티브 이벤트)으로 상태 업데이트
- `useEffect`로 프로그래밍 방식 값 변경 동기화 (검색 초기화 X 버튼 등)
- **결과**: Input(검색) 정상 동작 ✅, Textarea(일정 등록, 완전 암송) 미해결 ❌

#### 수정된 파일

**파일: `client/src/components/ui/input.tsx`** — uncontrolled 방식으로 전면 재작성
- `value` prop → `defaultValue`로 변환 (React의 DOM 값 덮어쓰기 차단)
- `onChange` → `onInput` 브릿지 (네이티브 input 이벤트 사용)
- 내부 `innerRef` + `setRef` 콜백으로 ref 병합
- `useEffect`에서 빈 값 또는 포커스 없을 때 DOM 값 동기화

**파일: `client/src/components/ui/textarea.tsx`** — 동일 방식 적용
- Input과 동일한 uncontrolled 패턴
- 현재 Textarea는 검색과 달리 한글 입력 문제 미해결 (추가 조사 필요)

**파일: `client/src/pages/calendar.tsx`**
- 일정 제목 입력의 `e.preventDefault()` 제거 (IME 입력 방해)
- 디버그용 `console.log` 제거
- `onBlur` 핵 제거, 디버그 텍스트("현재 입력값") 제거

#### 남은 과제
- Textarea(일정 등록 제목/설명, 완전 암송 직접 입력)에서 한글 입력 문제 지속
- Capacitor Android WebView에서 textarea의 composition/input 이벤트 동작 추가 조사 필요
- 가능한 대안: Capacitor `captureInput` 설정 확인, native keyboard plugin 검토

### 3. Android Gradle 빌드 오류 수정

#### 문제
`Task 'prepareKotlinBuildScriptModel' not found in project ':capacitor-cordova-android-plugins'`

#### 원인
`capacitor-cordova-android-plugins`는 `com.android.library`만 적용하고 Kotlin 플러그인이 없는데, Android Studio(Gradle 8.13)가 모든 서브프로젝트에 해당 태스크를 요구.

#### 수정
- **파일**: `android/build.gradle`
- Kotlin 플러그인이 없는 서브프로젝트에 빈 `prepareKotlinBuildScriptModel` 태스크 자동 등록

```groovy
subprojects { sub ->
    sub.afterEvaluate {
        if (sub.tasks.findByName('prepareKotlinBuildScriptModel') == null) {
            sub.tasks.register('prepareKotlinBuildScriptModel') {}
        }
    }
}
```

### 4. 스플래시 화면 제목 색상 변경
- **파일**: `client/src/components/splash-screen.tsx`
- "교회학교 암송 수첩" 제목: `text-white drop-shadow-lg` → `text-gray-700 drop-shadow-sm` (진한 회색)

### 5. 앱 이름 변경: "교회학교 암송" → "교회학교 암송 수첩"

| 파일 | 용도 |
|------|------|
| `android/app/src/main/res/values/strings.xml` | Android 앱 이름 + Activity 타이틀 |
| `android/app/src/main/assets/capacitor.config.json` | Android Capacitor 설정 |
| `ios/App/App/capacitor.config.json` | iOS Capacitor 설정 |
| `capacitor.config.ts` | Capacitor 루트 설정 |
| `client/public/manifest.json` | PWA 매니페스트 |
| `ios/App/App/public/manifest.json` | iOS PWA 매니페스트 |

---

## 주의사항
- 현재 앱은 v15 패키지(`com.church.memory.app.v15`)를 사용 중
- v4~v14 MainActivity.java 파일들은 레거시 호환을 위해 존재
- Excel 파일이 데이터 소스이며, seed.json은 이벤트 전용
- iOS 빌드는 GitHub Actions CI를 통해 수행
- 진행 데이터(암송 기록/뱃지/포인트)는 Capacitor Preferences에 저장되어 앱 업데이트 시에도 유지됨
- 위젯 텍스트는 dp 단위 사용 (사용자 글꼴 설정에 의한 확대/잘림 방지)
- 위젯 Intent는 `CLEAR_TOP | SINGLE_TOP` 사용 (CLEAR_TASK는 위젯 확대 유발)
- 위젯 레이아웃 변경 후 디바이스에서 기존 위젯 삭제 → 재추가 필요 (Android 레이아웃 캐시)

---

## 앱 메인 색상 변경: 보라색 → 틸(#0AAFAF) (2026-04-28)

### 변경 개요
- **목적**: 앱 전체 프라이머리 색상을 보라색 계열에서 틸(Teal, #0AAFAF)로 전면 교체
- **톤 변화 체계**:
  | 용도 | 변경 전 | 변경 후 |
  |------|---------|---------|
  | Primary | `hsl(251, 82%, 67%)` / `#6C63FF` | `hsl(180, 89%, 36%)` / `#0AAFAF` |
  | Primary Dark | `#5A52D5` | `#088C8C` |
  | Primary Light | `#EEF2FF` | `#E0F7F7` |
  | Very Light (배경) | `#F5F3FF` | `#F0FAFA` |
  | Stroke/Border | `#EDE9FE` | `#CCF0F0` |
  | Theme Color | `#7c3aed` | `#0AAFAF` |
  | Dark Mode Primary | - | `hsl(180, 75%, 45%)` (약간 밝게) |

### 수정 파일 목록 (17개)

#### CSS 변수 & 글로벌 스타일 (1개)
- **`client/src/index.css`**
  - `:root` → `--primary: hsl(180, 89%, 36%)`, `--primary-foreground: hsl(0, 0%, 100%)`
  - `.dark` → `--primary: hsl(180, 75%, 45%)`
  - `body` 그라디언트: `blue-50/indigo-50/purple-50` → `teal-50/cyan-50/emerald-50`
  - `.gradient-primary`, `.verse-card-active`, `.nav-button-active`: 모두 `hsl(180, 89%, 36%)` 반영

#### PWA 설정 & HTML (4개)
- **`client/public/manifest.json`** — `theme_color: #0AAFAF`
- **`client/index.html`** — `meta[theme-color]: #0AAFAF`
- **`ios/App/App/public/manifest.json`** — `theme_color: #0AAFAF`
- **`ios/App/App/public/index.html`** — `meta[theme-color]: #0AAFAF`

#### Android 위젯 리소스 (2개)
- **`android/app/src/main/res/values/widget_colors.xml`**
  - `app_primary`: `#0AAFAF`, `app_primary_dark`: `#088C8C`, `app_primary_light`: `#E0F7F7`
  - `section_accent`: `#E0F7F7`
- **`android/app/src/main/res/drawable/widget_config_card_accent.xml`**
  - `solid`: `#F0FAFA`, `stroke`: `#CCF0F0`

#### 인라인 HSL 값 변경 (3개)
- **`client/src/App.tsx`** — 배경 그라디언트 `hsl(251→180)`
- **`client/src/components/calendar-modal.tsx`** — 이벤트 날짜/행사 배경색 `hsl(251→180)`
- **`client/src/pages/calendar.tsx`** — 이벤트 날짜 배경색 `hsl(251→180)`

#### Tailwind 클래스 변환 (7개)
- **`client/src/components/flashcard-modal.tsx`**
  - `border-l-violet-500` → `border-l-teal-500`
  - `bg-purple-50` → `bg-teal-50`, `text-purple-700` → `text-teal-700`
- **`client/src/components/splash-screen.tsx`**
  - `from-blue-500 via-indigo-600 to-purple-700` → `from-teal-500 via-teal-600 to-cyan-700`
- **`client/src/components/points-earned-toast.tsx`**
  - `violet-*` / `purple-*` → `teal-*` / `cyan-*`
- **`client/src/lib/badge-definitions.ts`**
  - `text-indigo-500` → `text-teal-500`, `text-purple-500` → `text-teal-600`
  - `text-violet-500` → `text-teal-500`, `text-indigo-600` → `text-teal-600`
- **`client/src/pages/badges.tsx`**
  - `violet-*` / `purple-*` → `teal-*` / `cyan-*` (진행률 바, 뱃지 아이콘 배경)
- **`client/src/pages/my-progress.tsx`**
  - `violet-*` → `teal-*` (뱃지 컬렉션 링크, 난이도 배지)
- **`client/src/pages/calendar.tsx`**
  - EVENT_COLORS: `bg-purple-500` → `bg-teal-500`, `bg-indigo-500` → `bg-cyan-500`
  - 헤더 아이콘: `bg-purple-100` → `bg-teal-100`, `text-purple-600` → `text-teal-600`

#### 헤더 그라디언트 통일 (5개, 위 파일들 중 포함)
- `home.tsx`, `age-group.tsx`, `verse-overview.tsx`, `bookmarks.tsx` — `to-purple-50` → `to-teal-50`
- `home.tsx` — `bg-indigo-100` → `bg-teal-100`, `text-indigo-600` → `text-teal-600`

### 비고
- iOS 빌드 아티팩트(`ios/App/App/public/assets/`)에 이전 색상이 남아있으나, 다음 빌드 시 자동 반영
- Tailwind의 `text-primary`, `bg-primary` 등 CSS 변수 참조 클래스는 `--primary` 변경으로 자동 반영됨

---

# 🎨 v2.5 디자인 대규모 업데이트 (2026-05-04 ~ 05-05)

> **목표**: 청록 일변도 v1 → 따뜻한 오프화이트 + 부서별 시그니처 컬러 + iOS 26 Liquid Glass + 다크모드. 추가로 사이클 wrap 로직, 카드 뒤집기 토글, 뱃지 시스템 확장, 안정성(SW 킬스위치, ErrorBoundary) 정비.

---

## 1. 디자인 토큰 전면 교체 (Design2.md 적용)

### `client/src/index.css`
- **v2 베이스 토큰**: `--page-bg`, `--surface`, `--surface-muted`, `--ink`, `--ink-soft`, `--ink-muted`, `--ink-faint`, `--border-soft`, `--border-strong`
- **부서별 시그니처 (light/dark)**:
  - 유치부 (피치 #E07A4D), 초등부 (민트 #5A8C61), 중고등부 (라벤더 #6B61A8)
  - 각 부서별 `accent / accent-soft / chip / chip-text / surface / glow` 토큰
- **Ambient Glow 페이지 배경 레이어** — radial-gradient 3겹 (light에서 35% / dark에서 8%)
- **그림자 토큰** — `--shadow-card-sm/md/glass/toggle` 라이트/다크 분리
- **Liquid Glass 레시피** — `.liquid-glass` 클래스 (backdrop-blur 16px + saturate 160% + inner shine + top gloss)
- **디스플레이 타이포** — `.display-xl/l/m`, `.eyebrow`, `Inter 200/300` 가중치
- **부서 chip 유틸** — `.dept-chip[data-dept="..."]`
- **부서 글로우 데코** — `.dept-glow[data-dept="..."]` 절대 위치 코너 장식
- **shadcn/ui 호환 매핑** — primary/secondary/muted를 v2 토큰에 매핑
- **다크 모드 변수** — `.dark` 셀렉터에 별도 매핑 (단순 색 반전 X, 별도 디자인)

### `tailwind.config.ts`
- v2 토큰 컬러 추가 (`page-bg`, `surface`, `ink`, `dept-kg/el/yt-*` 등)

---

## 2. 다크모드 정식 지원

### `client/src/App.tsx`
- `next-themes`의 `ThemeProvider`를 최상위에 적용 (`attribute="class"`, `defaultTheme="system"`, `storageKey="cm_theme"`, `enableSystem`)
- 기존 `bg-gradient-to-br from-teal-50...` body 그라데이션 → `var(--page-bg)` + `.ambient-glow-layer`

### `client/src/pages/settings.tsx`
- **테마 카드** 신설 — 라이트/다크/시스템 3옵션 토글 (Sun/Moon/Monitor 아이콘)
- 활성 옵션은 v2 액센트 → 후에 **`.nav-tab-active-glass`** 투명 글래스로 변경

---

## 3. Floating Liquid Glass 하단 네비

### `client/src/components/bottom-navigation.tsx`
- 화면 폭 전체 fixed → **중앙 정렬 떠있는 알약 (pill)**
- `bottom: env(safe-area-inset-bottom) + 14px`, `transform: translateX(-50%)`
- `borderRadius: 32px`, padding 6px, gap 2px
- 라벨 제거, **아이콘만** (52×44, radius 22)
- 활성 탭은 `nav-tab-active-glass` (반투명 글래스 + inner shine)
- 활성 탭은 `<Link>` 대신 `<button>`으로 렌더 → 클릭 시 `age-group-tab-reclick` 커스텀 이벤트 발행 (카드 뒤집기 토글에 사용)

---

## 4. VerseCard 전면 재설계

### `client/src/components/verse-card.tsx`
- **3가지 렌더 모드**:
  1. **균등 모드 (`equalMode={true}`)** — 3장 동일 크기, 본문 전체 표시, 글자수 7단계 자동 폰트
     - 상단: 부서 라벨 + 플래시카드/북마크 작은 아이콘
     - 본문 자동 스케일 (≤30자: 16-21px ~ 261+자: 10-12px)
     - 하단: reference + 복사 버튼
  2. **비활성 (지난 주/다음 주)** — 작은 카드, 92px 고정, 1~2줄 truncate, 우측 라벨 "**과" (lessonName 추출) 또는 "**W" 폴백
  3. **액티브 (이번 주)** — 큰 카드 (flex-1), 부서 chip + 큰 북마크 + 부서 glow + 본문 자동 스케일 + 하단 reference/복사/암송연습 버튼
- **글자수 자동 폰트 스케일** (`getActiveContentSize`, `getEqualContentSize`) — 7단계
- **공과명 추출 헬퍼** (`getLessonLabel`) — "18과 이삭을 바친 아브라함" → "18과"
- **FlashcardModal** 모든 분기에 마운트 (Fragment 래핑) — 균등 모드에서도 정상 동작

### `client/src/pages/age-group.tsx`
- 강조 모드: 지난 주 92px / 이번 주 flex-1 / 다음 주 92px
- 균등 모드: 3장 모두 flex-1
- **AnimatePresence** + 페이드+스케일 트랜지션 (rotateY 3D는 GPU 부담으로 제거)
- `equalMode` localStorage 저장 (`cm_equal_mode`)

---

## 5. 사이클 Wrap 로직 (영구 자동 반복)

### `client/src/lib/date-utils.ts` (신규 함수)
- **`CYCLE_WEEKS`** — 유치부 52, 초등부 104, 중고등부 156
- **`getVerseForWeek(verses, targetDate, ageGroup)`** — 데이터 범위 안 정확 매칭, 밖이면 `weekIndex % cycleLen` wrap
- **`getMonthlyVerseForMonth(monthlyVerses, year, month)`** — 12개월 사이클 wrap

### `client/src/hooks/use-verses.ts` / `use-monthly-verse.ts`
- 새 유틸 사용으로 통일. 엑셀 데이터(2024~2033) 종료 후에도 자동으로 처음부터 무한 반복.

---

## 6. 메인 홈 페이지 강화

### `client/src/pages/home.tsx`
- 3개 부서 카드 각각에 **복사 + 암송연습 버튼** (reference 라인 우측 끝)
- `flashcardVerse` state로 모달 제어
- 부서 카드 영역 높이 `100dvh - 148px` → **`100dvh - 130px`** (+18px) — 중고등부 긴 본문 짤림 해소
- 헤더, 부서 카드 모두 v2 토큰 + 부서별 chip 컬러 적용
- 진행률 바 모두 부서 accent 컬러로

---

## 7. 캘린더 / 북마크 / 월암송 / 진행률 / 배지 페이지 v2 토큰화

### `client/src/pages/calendar.tsx`
- 헤더 backdrop-blur 제거 → `var(--page-bg)` 솔리드
- "이번 달 행사" + 행사 항목 모두 `var(--ink/-soft/-muted)` 토큰
- 날짜 셀 — 오늘 = ink 솔리드, 이벤트 = surface-muted, 일/토 = 빨강/파랑

### `client/src/pages/bookmarks.tsx`
- "저장된 암송 구절 (N개)" + 본문 + 빈 상태 모두 v2 토큰
- 다크모드 자동 흰색

### `client/src/pages/monthly-verse.tsx`
- "초등월암송" 헤더 + 본문 + 월 네비 + reference + 복사 버튼 v2 토큰
- 본문 `whitespace: pre-line` → `whitespace: normal` + `wordBreak: keep-all` + `content.replace(/\s+/g, ' ')` — 어색한 줄바꿈 제거, 띄어쓰기만 보존

### `client/src/pages/my-progress.tsx`
- 스트릭/포인트 카드에 부서 글로우 적용
- **달성률 카드 주↔월 토글** — 카드 클릭으로 전환, "탭하여 주간/월간 보기" hint chip
- 월간 달성률: `완료 일수 / 이번 달 전체 일수` (이전엔 오늘까지의 일수로 계산해 부풀려졌던 문제 수정)
- 섹션 간격 `space-y-5` → `space-y-6` + 뱃지 컬렉션 링크에 `!mt-6` 명시

### `client/src/pages/badges.tsx`
- 뱃지 클릭 시 **말풍선 스타일 작은 팝업** (max 260px, 14px padding, radius 16)
- 우상단 작은 X 버튼 (24×24)
- 외부 탭/X 버튼/안드로이드 뒤로가기로 닫힘 (`history.pushState` + `popstate` 리스너)
- 진행도 카드 + 카테고리 헤더 모두 v2 토큰

### `client/src/components/badge-card.tsx`
- 하드코딩 컬러 → 토큰 (`var(--surface)`, `var(--ink-soft)`)
- 긴 뱃지 이름 줄바꿈 수정: `wordBreak: keep-all` + `WebkitLineClamp: 2` + `minHeight: 2.4em` (모든 카드 높이 정렬)
- 신규 아이콘 import: `Diamond`, `Layers`, `CalendarDays`

### `client/src/lib/badge-definitions.ts` — 뱃지 4개 추가 (총 24개)
| 카테고리 | 뱃지명 | 조건 | 아이콘 |
|----------|--------|------|--------|
| count | 일천 마스터 | 총 1000회 암송 | Crown |
| difficulty | 무결점 챔피언 | 완전 암송 1회 무실수 | Diamond |
| difficulty | 삼총사 | 하루에 3난이도 모두 통과 | Layers |
| special | 월간 마스터 | 한 달 매일 암송 | CalendarDays |

---

## 8. 설정 페이지 — 다크모드 토글 + About 정보

### `client/src/pages/settings.tsx`
- **테마 토글** (라이트/다크/시스템 3옵션 글래스 버튼)
- 알림 / 시작화면 / 시간 입력 모두 v2 토큰화
- 시작화면 라디오 활성 → liquid glass 스타일
- **저장 버튼** — solid `var(--ink)` 배경 + `var(--surface)` 흰 글자 (라이트/다크 모두 명확)

### About 카드 (페이지 하단)
```
교회학교 암송 수첩
Version 1.0.0
Developed by Kim Hakseong
(Cheong-ju Nambu Church)
청주남부교회 김학성 형제 개발
─────
Contact Us
Have a question or found a bug?
makseong@gmail.com   ← mailto 링크 (subject 자동 채움)
─────
© 2026 Kim Hakseong (Cheong-ju Nambu Church). All rights reserved.
© 2026 김학성 형제 (청주남부교회). 모든 권리 보유.
```
- 모든 라인 동일한 `var(--ink-muted)` 채도

---

## 9. FlashcardModal 정비

### `client/src/components/flashcard-modal.tsx`
- DialogContent에 **`flashcard-force-light`** 클래스 — 다크모드에서도 항상 흰 배경 + 검정 글자 (내부에 hardcoded `text-gray-*`, `bg-white` 등이 많아 다크에서 흰글자/흰배경 충돌 방지)
- **난이도 선택 카드 좌측 컬러 바 → 부서 액센트**:
  - 쉬움 → 유치부 피치 (`var(--dept-kg-accent)`)
  - 보통 → 초등부 민트 (`var(--dept-el-accent)`)
  - 완전 암송 → 중고등부 라벤더 (`var(--dept-yt-accent)`)
- **완료 화면 버튼** 색상 명시:
  - 다시 도전하기 → solid `#1a1a1a` + 흰 글자
  - 완료 → 흰 배경 + 검정 테두리(1.5px) + 검정 글자

### `client/src/index.css` — `.flashcard-force-light` 클래스
- `color: #1a1a1a !important` (모든 자식)
- `background: #ffffff !important`
- 컬러 텍스트(blue/orange/red/green/emerald 등)는 명도 조정해 보존

---

## 10. 캡처 버튼 / 스플래시 정리

### `client/src/components/capture-button.tsx`
- `bg-gray-100 / text-gray-600` 하드코딩 → `var(--surface-muted) / var(--ink-soft)` 토큰

### `client/src/components/splash-screen.tsx`
- "교회학교 암송 수첩" + "Church Memory Master" 제목 오버레이 + 감싸던 motion.div 통째로 제거 (스플래시 이미지만)

---

## 11. 안정성 강화 — SW 킬스위치 + ErrorBoundary

### Service Worker 킬 스위치 (스타일 원복 이슈 해결)
**증상**: 폰에서 1분 후 크래시 → 재시작 시 옛 스타일로 표시 → 다시 크래시.
**원인**: 옛 SW가 `/`(index.html) + `manifest.json` 캐시. 새 APK 설치 후에도 캐시된 옛 페이지 서빙.

#### `client/public/sw.js` — 킬 스위치로 교체
- `install` → `skipWaiting()` (즉시 활성)
- `activate` → 모든 cache 삭제 + `clients.claim()` + 자기 자신 `unregister()`
- `fetch` → 캐시 미사용, 무조건 네트워크 직행

#### `client/index.html` — 인라인 정리 스크립트 (head)
- `main.tsx` 로드 **전에** 동기적으로 SW unregister + caches.delete 시도
- 첫 페이지 로드부터 옛 캐시 개입 차단

### ErrorBoundary (`client/src/components/error-boundary.tsx`, App.tsx 최상위 래핑)
- React 에러 발생 시 흰 화면 대신 안내 화면 + "다시 시도" + "데이터 초기화" 버튼
- 데이터 초기화 시: localStorage / sessionStorage / SW / Cache API 모두 비우고 페이지 reload

### GPU 압박 완화
- **Liquid Glass blur 28px → 16px**, saturate 180% → 160%, alpha 0.55 → 0.78
- `transform: translateZ(0)` + `will-change: transform` (GPU 합성 레이어 안정화)
- `@supports not (backdrop-filter)` 폴백 (불투명 흰색)
- **활성 탭 `nav-tab-active-glass`** — backdrop-filter 제거 (부모 `.liquid-glass`가 이미 적용. 중첩 시 Android WebView 크래시 위험)
- **모든 페이지 헤더의 `backdrop-blur-*` 제거** → 솔리드 `var(--page-bg)`로 변경 (home/age-group/calendar/bookmarks/verse-overview/monthly-verse/splash)

### 모션 경량화
- 카드 뒤집기 rotateY 3D / preserve-3d / perspective → **opacity + scale fade** (0.22초)
- VerseCard 내부 `motion.div` → 일반 `div` (카드 단위 진입 애니메이션 비필수)

---

## 12. 신규/주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `client/src/components/error-boundary.tsx` | React 에러 안전망 + 데이터 초기화 |
| `client/src/lib/date-utils.ts` | `CYCLE_WEEKS`, `getVerseForWeek`, `getMonthlyVerseForMonth` |
| `client/public/sw.js` | 자가 정리 SW 킬 스위치 |

---

## 13. 워크플로우 / 트러블슈팅 메모

### 빌드 절차 (코드 변경 시 반드시)
```powershell
npm run build
npx cap sync android
# Android Studio → Build APK
# 폰 설치 (Play Protect 끈 상태, 기존 앱 완전 제거 후 권장)
```

### 디바이스 디버깅
```powershell
cd "C:\Users\user\AppData\Local\Android\Sdk\platform-tools"
.\adb logcat *:E AndroidRuntime:V chromium:V Capacitor:V > crash.log
```

### 자주 만난 함정
1. **Capacitor sync 누락** — `npm run build` 후 `npx cap sync android` 안 하면 옛 자산이 APK에 들어감 → 옛 스타일로 보임
2. **SW 캐시** — `client/public/sw.js`가 옛 페이지 캐시. 킬 스위치로 자가 정리하도록 교체
3. **Backdrop-filter 중첩** — Android WebView GPU 압박 → 1중첩만, 부모만 적용
4. **Play Protect 무한 검사** — 자가서명 APK 설치 시 Play 스토어 → Play Protect → 검사 OFF

---

## 14. 데이터 / 사이클 정리

| 부서 | 데이터 | 사이클 | wrap 후 동작 |
|------|--------|--------|-------------|
| 유치부 | 2024-01-07 ~ 2033-12-17 (520주) | 52주 | 2034부터 1~52주차 무한 반복 |
| 초등부 | 2024-01-07 ~ 2033-12-17 (520주) | 104주 | 2034부터 1~104주차 무한 반복 |
| 중고등부 | 2024-01-07 ~ 2034-01-07 (523주) | 156주 | 2034.1부터 1~156주차 무한 반복 |
| 초등월암송 | 2024.1 ~ 2033.12 (120개월) | 12개월 | 같은 월의 가장 최근 연도 데이터 자동 적용 |

원본 엑셀 무수정. 룩업 로직만 wrap.

---

## 15. 이번 v2.5 라운드 변경 파일 요약

### 신규
- `client/src/components/error-boundary.tsx`

### 전면 재작성
- `client/src/index.css` — v2 토큰 + 신규 유틸 클래스 다수
- `client/src/components/verse-card.tsx` — 3 모드 (강조 비활성/액티브, 균등)
- `client/src/components/bottom-navigation.tsx` — Floating Liquid Glass pill
- `client/src/components/badge-card.tsx` — v2 토큰 + 줄바꿈 안전화
- `client/public/sw.js` — 킬 스위치
- `client/src/pages/settings.tsx` — 테마 토글 + About 카드

### 부분 수정
- `client/src/App.tsx` — ThemeProvider, ErrorBoundary, ambient glow
- `client/src/main.tsx` — (기존 SW unregister 로직 보강)
- `client/index.html` — 인라인 SW/캐시 정리 스크립트
- `client/src/components/capture-button.tsx` — 토큰화
- `client/src/components/splash-screen.tsx` — 제목 텍스트 제거
- `client/src/components/flashcard-modal.tsx` — flashcard-force-light + 부서 액센트 + 완료 버튼
- `client/src/lib/date-utils.ts` — 사이클 wrap 함수
- `client/src/lib/badge-definitions.ts` — 뱃지 24개로 확장
- `client/src/hooks/use-verses.ts`, `use-monthly-verse.ts` — wrap 적용
- `client/src/pages/home.tsx` — 부서 카드 + 액션 버튼 + 높이 조정
- `client/src/pages/age-group.tsx` — equalMode 토글 + AnimatePresence
- `client/src/pages/calendar.tsx` — v2 토큰
- `client/src/pages/bookmarks.tsx` — v2 토큰
- `client/src/pages/monthly-verse.tsx` — v2 토큰 + 줄바꿈 정리
- `client/src/pages/badges.tsx` — 말풍선 팝업 + 뒤로가기
- `client/src/pages/my-progress.tsx` — 주↔월 토글 + 간격 + 분모 수정
- `client/src/pages/verse-overview.tsx` — v2 토큰
- `tailwind.config.ts` — v2 컬러 토큰

---

## 16. v2.6 텍스트 짤림·레이아웃 정합 라운드 (2026-05-23)

캡처 사진 31~40.jpg 기반의 사용자 피드백 7건 처리. 핵심 목표는 (a) 어떤 길이의 암송 구절도 카드 안에서 짤리지 않게, (b) 어느 탭을 들어가도 마지막 카드 아랫 변이 메인화면과 일치하게 정렬, (c) 다크/라이트 공용 화면의 색 충돌 제거.

### 16-1. 자동 폰트 스케일에 자간(letterSpacing)·장평(scaleX) 추가
- **파일**: `client/src/pages/home.tsx`, `client/src/components/verse-card.tsx`
- **원리**: 기존 글자수 기반 폰트 축소만으론 짤림이 남아, 동일 버킷에서 자간/장평까지 함께 압축하여 한 줄에 더 많은 글자가 들어가도록.
- **장평 구현**: 자식 div 에 `transform: scaleX(s)` + `width: ${100/s}%` + `transform-origin: left top`. 레이아웃 폭은 1/s 만큼 넓어져 더 많이 wrap, 시각 폭은 다시 컨테이너에 맞춰져 overflow 없음.
- **튜닝**:
  - `home.tsx getHomeCardScale()` — 임계값 30→50→80→120→170 으로 세분화. 60~120자 구간의 max·lineHeight 를 한 단계 더 축소(17px·1.45 → 14px·1.34, 16px·1.4 → 13px·1.3). 자간 -0.3~-0.5px, 장평 0.95~0.97.
  - `verse-card.tsx getEqualContentSize()` — 임계값 30→50→80→120→170→230 으로 재정렬. 80~120자대 본문(가장 빈번한 구간)이 13px·lh 1.28 로 떨어져 1줄 추가 확보. 자간 -0.5px, 장평 0.95.
  - `getActiveContentSize()` — (80,120] 구간을 17px·lh 1.38 로 한 단계 축소, 자간 -0.4px, 장평 0.96.

### 16-2. 부서탭 카드 하단 라인을 메인화면과 정렬
- **파일**: `client/src/pages/age-group.tsx`
- 컨테이너 높이를 메인화면(`home.tsx`)이 사용하는 reserve 와 정확히 동일한 `calc(100dvh - 130px)` 로 통일 (이전 148px → 116px 시도 후 nav 침범 → 130px 로 확정).
- 결과: 메인화면·유치부·초등부·중고등부 어느 탭이든, 그리고 탭을 한번 더 눌러 equalMode 로 전환해도 마지막 카드의 아랫 변이 같은 라인에 정렬. 네비게이션 바를 침범하지 않으면서 빈 공간 최소화.

### 16-3. 강조 모드(emphasized) 지난/다음 주 카드 높이 균등화·확대
- **파일**: `client/src/pages/age-group.tsx`
- 지난 주·다음 주 카드 높이 `92px → 108px`. 둘 동일하게 유지하면서 약간 키워, 이번 주 카드와의 비율을 더 균형 있게.

### 16-4. 북마크 카드의 부서 아이콘(픽토그램) 제거
- **파일**: `client/src/pages/bookmarks.tsx`
- 좌측 32×32 원형 부서 아이콘 박스 제거 → 본문(부서명·공과명·장절) 가용 폭 +44px 확보. "유치부"·"중고등부" 같은 부서명이 더 이상 캐리지 리턴되지 않음.
- 미사용 import (`Baby`, `Users`, `GraduationCap`) 및 `AGE_GROUP_INFO`의 `icon`·`bgColor` 필드 정리.

### 16-5. FlashcardModal 완료 화면 검은 버튼 텍스트 가시화
- **파일**: `client/src/index.css`, `client/src/components/flashcard-modal.tsx`
- 원인: `.flashcard-force-light *` 의 `color: #1a1a1a !important` 가 인라인 `color: #ffffff` 를 덮어써 "다시 도전하기" 버튼 글자가 안 보임.
- 해결: `.flashcard-dark-cta` 오버라이드 클래스(`color: #fff !important`) 신설하여 해당 버튼에 부착.

### 16-6. 교육목표(splash) 이미지 수직 위치 보정
- **파일**: `client/src/pages/splash.tsx`
- 헤더가 차지하는 영역만큼 시각 중심이 아래로 밀려있던 문제 해결.
- `bg-center` → `backgroundPosition: 'center 30%'` 로 변경, 이미지가 화면 전체 기준 중앙에 더 가깝게 위치.

### 변경 파일 요약 (v2.6)
- `client/src/pages/home.tsx` — `getHomeCardScale()` 6단계로 세분화 + letterSpacing/scaleX 추가, 3개 부서 카드 본문 div 에 wrapper 적용
- `client/src/components/verse-card.tsx` — `getEqualContentSize()`/`getActiveContentSize()` 6~7단계 재튜닝 + letterSpacing/scaleX, equalMode 본문과 active blockquote 에 wrapper 적용
- `client/src/pages/age-group.tsx` — 컨테이너 reserve 130px, 강조 모드 last/next 108px
- `client/src/pages/bookmarks.tsx` — 부서 아이콘 박스 + 미사용 import 제거
- `client/src/index.css` — `.flashcard-dark-cta` 오버라이드 추가
- `client/src/components/flashcard-modal.tsx` — "다시 도전하기" 버튼에 `flashcard-dark-cta` 부착
- `client/src/pages/splash.tsx` — `backgroundPosition: 'center 30%'`

### 트러블슈팅 메모 (이번 라운드)
- **scaleX 만으로는 레이아웃이 안 바뀜**: `transform` 은 시각 변환만 하고 wrap 폭은 그대로. 자식 div 에 `width: ${100/scaleX}%` 를 같이 주어야 wrap 폭이 실제로 넓어져 줄 수가 줄어듦.
- **`!important` 충돌 처리**: `.flashcard-force-light *` 처럼 와일드카드+!important 가 깔린 컨테이너 안에서는 React 인라인 style 도 못 이김. 대상 element 에 전용 클래스 + 같은 specificity 의 `!important` 룰 필요.
- **컨테이너 reserve 와 floating nav 의 관계**: `bottom-navigation` 이 `position: fixed` 이므로 컨테이너는 그 높이만큼 reserve 해야 침범 안 됨. nav 가 `bottom: env(safe-area-inset-bottom) + 14px` 에 56px 높이로 떠 있어, 최소 reserve ≈ 70 + safe + 헤더(58) ≈ 128~140px 사이. 130px 가 home 과 정렬되는 안전한 값.
- **카드 1/3 분할에서의 폰트 임계값**: equalMode 는 카드당 height ≈ (100dvh - 162) / 3 ≈ 240px 정도(820dvh 기준). 본문 영역은 chrome 제외 약 160px. 100자 본문이 13px·lh 1.3 일 때 약 7줄 필요해서 거의 한계. 이보다 길어지는 미래 구절에 대비해 임계값을 보수적으로 더 촘촘히.

---

## 17. v1.0 출시 준비 — 패키지명 정리 & 버전 리셋 (2026-05-23)

플레이스토어 첫 출시를 앞두고, 그간 `vN` 이 박혀 있던 임시 패키지명을 영구 고정형으로 정리하고 버전 번호를 1.0 으로 리셋. **이 시점 이후 패키지명·서명키는 절대 변경 금지** — 변경 시 Play Store 가 별개 앱으로 인식해 기존 사용자에게 업데이트가 안 가고 데이터(북마크·포인트·뱃지·캘린더)도 함께 끊김.

### 17-1. 패키지명 `com.church.memory.app.v15` → `com.church.memory.app`
- **android/app/build.gradle** — `namespace` / `applicationId` 둘 다 갱신, 불필요해진 `sourceSets { main.java.exclude '**/v4/**' }` 제거.
- **capacitor.config.ts**, **android/app/src/main/assets/capacitor.config.json**, **ios/App/App/capacitor.config.json** — `appId` 일괄 갱신.
- **android/app/src/main/AndroidManifest.xml** — 위젯 커스텀 action 이름 `com.church.memory.app.v15.widget.REFRESH_{MEDIUM,LARGE}` → `com.church.memory.app.widget.REFRESH_{MEDIUM,LARGE}`.
- **res/xml/verse_widget_info.xml**, **verse_large_widget_info.xml** — `android:configure` FQN 갱신.
- **Java/Kotlin 소스 재배치**
  - `MainActivity.java` 는 이미 `com.church.memory.app` 경로에 존재 → 그대로 사용.
  - 위젯 3종(`VerseWidgetProvider.kt`, `VerseLargeWidgetProvider.kt`, `WidgetConfigActivity.kt`) 을 `com/church/memory/app/widget/` 으로 신규 작성. `package` 선언, `import com.church.memory.app.{MainActivity,R}`, `ACTION_REFRESH` 상수까지 새 패키지로 갱신.
  - `com/church/memory/app/v4`~`v15/` 디렉터리 12개 삭제 (이전 임시 패키지 잔재).

### 17-2. 버전 1.0 리셋
- `android/app/build.gradle`: `versionCode 15 → 1`, `versionName "2.4" → "1.0"`
- `capacitor.config.ts` / 동기화된 `capacitor.config.json` 2개 (android/ios): `appendUserAgent "ChurchMemoryApp/2.3" → "ChurchMemoryApp/1.0"`

### 17-3. 정리 후 자바/코틀린 트리
```
android/app/src/main/java/com/church/memory/app/
├── MainActivity.java
└── widget/
    ├── VerseWidgetProvider.kt
    ├── VerseLargeWidgetProvider.kt
    └── WidgetConfigActivity.kt
```

### 17-4. 트러블슈팅 메모
- **`npx cap sync android` 가 assets capacitor.config.json 을 덮어씀**: 루트 `capacitor.config.ts` 가 정본. sync 후 assets/ios 의 json 도 동일 값으로 덮여쓰여 일관성 유지됨.
- **위젯 커스텀 action 이름은 PendingIntent 매칭에 사용**: Manifest 의 intent-filter action 명과 Kotlin `ACTION_REFRESH` 상수가 정확히 일치해야 새로고침 버튼이 동작.
- **데이터 보존 메커니즘 (자동 업데이트 시 유지)**
  - 북마크 → `@capacitor/preferences` (Android SharedPreferences)
  - 포인트·뱃지·스트릭·암송 시드·캘린더 이벤트 → WebView `localStorage`
  - 캘린더 ICS 등 → `@capacitor/filesystem` (Documents/Cache)
  - 모두 앱 데이터 디렉터리에 들어가므로 같은 `applicationId` + 같은 서명키로 업데이트하면 자동 보존. 사용자가 직접 "앱 데이터 지우기" 하지 않는 한 안전.

---

**문서 갱신**: 2026-05-23
**작성**: Claude Code 세션 (v2.6 디자인 + v1.0 출시 준비 라운드)

---

## 18. 출시 준비 — Play Console 등록 & iOS 이전 준비 (2026-06-03)

### 18-1. iOS 이전 준비
- 작업 PC → Mac mini M4(기본형, 16GB/256GB)로 이전 결정. Xcode 로컬 빌드로 실기기 테스트 후 앱스토어 발행 시나리오 확정.
- 현재 PC의 미커밋 변경 132개 파일(+14,511/-4,453) 정리 후 push.
  - `참고사진/`(21MB 로컬 자료), `clear-storage.js`(디버그 스니펫) → `.gitignore` 추가로 제외.
  - 안드로이드 더미 패키지(v4~v15) 12개 삭제, 위젯 3종 및 새 페이지/컴포넌트 다수 추가 반영.
  - 커밋: `4b7629e [feat] 안드로이드 최적화 및 iOS 이전 준비`.
- iOS 네이티브 폴더 부재 확인 — `ios/App.xcworkspace`, `Podfile`, `Info.plist` 모두 git에 없음. 이는 정상(GitHub Actions에서 매번 `rm -rf ios && npx cap add ios`로 재생성하는 구조).
- Mac mini 진행 절차 안내:
  ```bash
  npm ci && npm run build
  rm -rf ios && npx cap add ios && npx cap sync ios
  node scripts/generate-ios-icons.cjs
  /usr/libexec/PlistBuddy -c 'Add :NSPhotoLibraryAddUsageDescription string "..."' ios/App/App/Info.plist
  cd ios/App && pod install && open App.xcworkspace
  ```

### 18-2. Google Play Console 앱 등록 진행
- 개발자 인증 완료, 앱 만들기 단계 진입.
- 앱 메타데이터:
  - **앱 이름**: `교회학교 암송 수첩` (JBCH 브랜드명 제거 결정)
  - **패키지 이름**: `com.church.memory.app` (코드와 일치, 평생 변경 불가)
  - 기본 언어 한국어, 무료, 앱
- Android Studio에서 **Generate Signed App Bundle (AAB)** 진행.
  - 새 keystore 생성: `church-memory-release.jks`
  - 인증서 정보에서 JBCH 표기 제거 (Organization 등은 `Church Memory App` 등으로)
  - **백업 필수** 강조: keystore 파일 + 비밀번호 3개 분실 시 같은 패키지명으로 영원히 업데이트 불가.
- AAB 빌드 완료.

### 18-3. 개인정보처리방침 작성 & 호스팅
- `docs/privacy-policy.html` + `docs/index.html` 신규 작성, GitHub Pages 호스팅용.
- 내용 핵심: **외부 서버 전송 없음**, 모든 데이터(진도/북마크/배지 등) 로컬 저장만, 광고/분석 SDK 없음.
- 권한 4종(인터넷/알림/사진/마이크) 각각 용도 명시.
- 연락처: `makseong@gmail.com`
- 커밋: `2ae96ce [docs] 개인정보처리방침 페이지 추가`.
- URL (Pages 활성화 후): `https://kim-hakseong.github.io/ChurchMemoryMaster/privacy-policy.html`

### 18-4. 스토어 설명문 초안 작성
- **짧은 설명** (80자 이내): "교회학교 친구들을 위한 암송 수첩. 연령별 말씀, 진도 추적, 위젯, 알림으로 매일 꾸준히."
- **자세한 설명** (약 700자): 9개 주요 기능 (연령별 말씀/이번달 말씀/진도 추적/배지·포인트/북마크/플래시카드/캘린더/알림/위젯/캡처·공유), 개인정보 보호 강조, 추천 사용자 그룹, 연락처 포함.

### 18-5. 신규 개인 계정 12명/14일 정책 발견
- **2023년 11월부터** Google이 신규 **개인(Personal) 개발자 계정**에 강제하는 규정 확인:
  - 비공개(Closed) 테스트 트랙에서 **12명 이상 옵트인 + 14일 연속** 후 "프로덕션 액세스 신청" 가능
  - 검토 1~7일 → 통과 시 프로덕션 출시 가능
- 면제 대상: 2023년 11월 이전 등록 계정, 기업(Organization) 계정
- 공개(Open) 테스트도 이 요구사항 충족 못함 확인.

### 18-6. 사업자 계정 전환 결정 (간이사업자 활용)
- 사용자가 기존 **간이사업자** 보유 중. Organization 계정 등록 가능 확인.
- 결정 근거:
  - 12명/14일 룰 면제 (즉시 출시 가능)
  - **사업 경비 처리** 가능: Mac mini M4 / Apple Developer $99 / Google Play $25 / 노트북 / 인터넷 등
  - 향후 여러 앱 계속 개발 예정 → 장기적으로 무조건 유리
  - 간이과세 매출로 세금 처리 깔끔
- 필요 절차:
  1. **D-U-N-S 번호 무료 신청** (한국기업데이터 NICE D&B, 1~4주 소요)
  2. 새 Google Play 계정 등록 ($25 추가) — 기존 개인 계정은 Organization으로 변환 불가
  3. Apple Developer도 동일하게 Organization으로 등록 권장
- **현재 앱 처리 전략 (결정 보류)**:
  - 옵션 1 (권장): 현재 개인 계정에서 단톡방으로 12명 모집 → 14일 후 출시 → 사업자 계정으로 앱 이전(Transfer, 1~2주)
  - 옵션 2: D-U-N-S 받을 때까지 한 달 대기 후 사업자 계정으로 첫 출시 (느리지만 깔끔)

### 18-7. 다음 세션에서 이어갈 작업
- [ ] D-U-N-S 번호 신청 (무료, 한국기업데이터 사이트)
- [ ] 현재 앱 출시 전략 최종 결정 (옵션 1 vs 옵션 2)
- [ ] GitHub Pages 활성화 후 개인정보처리방침 URL 동작 확인
- [ ] Play Console 비공개 테스트 트랙에 AAB 업로드 (옵션 1 시)
- [ ] 스토어 등록정보 채우기:
  - 그래픽 이미지 1024×500 PNG 제작 (필수)
  - 휴대전화 스크린샷 최소 2장 캡처
  - 앱 콘텐츠 정책 항목 (개인정보처리방침 URL, 콘텐츠 등급 설문, 데이터 보안 양식 등)
- [ ] Mac mini M4 환경 세팅 (Xcode, Node 20, CocoaPods, fastlane)
- [ ] iOS 실기기 빌드 테스트 (본인 아이폰)
- [ ] Apple Developer 사업자 계정 등록 (사업자 계정 결정 시)

### 18-8. 트러블슈팅 메모
- **Google Play 패키지 이름 한글 불가**: `com.example.myapp` 형식 강제. 코드의 `applicationId`와 100% 일치 필수, 한 번 등록 후 변경 불가.
- **공개(Open) 테스트로 우회 시도는 무의미**: 신규 개인 계정의 14일 룰은 비공개(Closed) 테스트만 충족 인정.
- **개인 계정 → Organization 계정 직접 변환 불가**: 새 계정 별도 등록 후 앱 이전 신청 필요. 이전 시 데이터/리뷰/통계 유지.
- **Mac mini 256GB SSD 디스크 압박 예상**: Xcode ~40GB + 시뮬레이터 ~15GB + Pods/node_modules ~5GB. 시뮬레이터는 최신 iOS 1개만 유지 권장.

---

**문서 갱신**: 2026-06-03
**작성**: Claude Code 세션 (Play Console 등록 + 사업자 계정 전환 검토 라운드)
