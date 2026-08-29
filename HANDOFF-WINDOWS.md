# 윈도우 작업 인수인계 — Play Store 업데이트 (2026-08-18 맥 작업분 반영)

> **이 문서를 윈도우 Claude Code 에 그대로 주면 됩니다.**
> 프롬프트 예: `HANDOFF-WINDOWS.md 읽고 그대로 진행해줘.`
>
> 맥미니에서 App Store 첫 출시(심사 제출)를 마쳤고, 그 과정에서 **안드로이드에도 영향이 있는
> 공용 코드 수정**이 여럿 생겼습니다. 이 문서는 그 내용을 윈도우 환경에 안전하게 반영하고
> Play Store 업데이트를 내보내기 위한 절차입니다.

---

## 0. 한 줄 요약

`git pull` → `npm ci` → **versionCode 올리기** → `npm run build` → `npx cap sync android`
→ Android Studio 에서 **기존 키스토어**로 AAB 서명 → Play Console 내부 테스트 → 프로덕션.

---

## 1. 먼저: 꼬이지 않게 git 정리

윈도우 쪽에 커밋 안 된 작업이 남아 있을 수 있습니다. **pull 전에 반드시 상태부터 확인하세요.**

```bash
git status
git log --oneline -5
```

### 경우 A — 변경 사항 없음 (깨끗함)

```bash
git pull origin main
```

### 경우 B — 커밋 안 된 변경이 있음

버릴 수 없는 작업이면 먼저 커밋하거나 stash 합니다.

```bash
# 남겨야 하는 작업이면
git add -A && git commit -m "wip: 윈도우 로컬 작업 백업"
git pull --rebase origin main

# 임시로 치워두려면
git stash push -u -m "윈도우 로컬 작업"
git pull origin main
git stash pop      # 충돌 나면 아래 참고
```

### 충돌이 났다면

맥에서 오늘 건드린 파일은 아래 4개뿐입니다. **이 파일에서 충돌이 나면 맥 쪽(원격) 것을 채택**하세요.
오늘 실기기 테스트로 검증한 수정이라 로컬 버전보다 최신입니다.

- `client/src/pages/verse-overview.tsx`
- `client/src/components/flashcard-modal.tsx`
- `client/src/hooks/use-header-height.ts` (신규)
- `package.json` / `package-lock.json`

```bash
git checkout --theirs <파일경로>   # pull(merge) 중 충돌 시
git add <파일경로>
```

그 외 `ios/`, `docs/`, `Log.md`, `AppStore.md` 에서 충돌이 나면 역시 원격 것을 쓰면 됩니다.

> `ios/` 폴더는 맥 전용입니다. 윈도우에서는 **절대 건드리지 마세요.**
> (수정·삭제하면 맥에서 다시 아카이브할 때 서명/프로젝트가 깨집니다)

---

## 2. 무엇이 바뀌었나 — 안드로이드에 영향 있는 것

### ⚠️ 2-1. verse-overview 무한 리렌더 수정 (중요)

`client/src/pages/verse-overview.tsx` 가 **검색과 무관하게 상시 무한 리렌더** 중이었습니다.
계측 결과 가만히 둔 5초 동안 북마크 조회 effect 가 **793회**(초당 약 160회) 실행됐습니다.
그때마다 구절 수만큼 비동기 북마크 조회를 다시 돌리고 있었으므로 **안드로이드 사용자도
배터리·발열 영향을 받고 있었을 것**입니다.

원인: `verses` 가 매 렌더마다 `.filter()` 로 새 배열이 되는데 북마크 `useEffect` 의존성이
`[verses]` 였고, 내부에서 `setBookmarkedVerses(new Set())` 을 호출해 루프가 끊기지 않음.

수정: 파생 배열을 `useMemo` 로 안정화. 재측정 결과 0회.

### ⚠️ 2-2. 헤더 겹침 수정 → 화면이 21px 내려갑니다

전체 목록 화면에서 고정 헤더 높이는 rem 기반이라 폰트 배율을 따라 커지는데, 본문이 비워두는
상단 여백은 `144px` 고정이었습니다. 그래서 목록이 헤더 밑으로 파고들고 있었습니다.

- 안드로이드/웹: **13px** 겹침
- iOS(폰트 1.25배): 42px 겹침

`useHeaderHeight` 훅(ResizeObserver 실측)으로 헤더 높이 + 8px 을 쓰도록 바꿨습니다.
결과적으로 **안드로이드에서 목록이 21px(겹침 13 + 여백 8) 아래로 내려갑니다.**
가려져 있던 게 제대로 보이는 것이지만, 기존 사용자에겐 화면이 바뀐 것으로 보입니다.

> home / age-group / bookmarks 페이지에도 같은 패턴이 남아 있습니다(각 3px, 3px, 9px).
> 겹침 구간에 누를 요소가 없고 기존 레이아웃 튜닝(Log 16-2)을 건드리게 되어 **일부러 두었습니다.**
> 윈도우에서도 건드리지 마세요.

### ⚠️ 2-3. 음성 인식이 네이티브 플러그인으로 바뀜

기존에는 `webkitSpeechRecognition`(Web Speech API)을 썼는데, **WebView 에서는 이 API 가
동작하지 않습니다**(iOS WKWebView 는 완전 미지원, Android WebView 도 제대로 지원 안 함).
즉 지금까지 안드로이드에서도 음성 암송이 사실상 안 됐을 가능성이 높습니다.

`@capacitor-community/speech-recognition@7.0.1` 로 전환했습니다.
- 네이티브: 마이크 버튼 **토글**(다시 눌러야 종료), 실시간 부분 결과 반영
- 웹: 기존 경로 유지
- `RECORD_AUDIO` 권한은 이미 매니페스트에 있어 추가 작업 없음
- **`npx cap sync android` 를 반드시 실행해야 플러그인이 등록됩니다**

### 2-4. 암송 확인 버튼 글자 가시화

"완전 암송" 화면의 `암송 확인` 버튼이 검은 배경 + 검은 글자였습니다.
기존 `.flashcard-dark-cta` 클래스를 붙여 흰 글자로 고쳤습니다.

### 2-5. 안드로이드에 영향 없는 것 (참고만)

- `ios/` 전체, `scripts/generate-ios-icons.cjs` (아이콘 알파 제거 — iOS 전용)
- `docs/privacy-policy.html` (개인정보 처리방침에 음성 인식 조항 추가 — 내용만 갱신,
  URL 은 그대로라 Play Console 재입력 불필요)
- `AppStore.md`, `Log.md` 20장

---

## 3. 실행 절차

```bash
# 1) 최신 코드
git pull origin main

# 2) 의존성 (새 플러그인 설치됨)
npm ci

# 3) 버전 올리기 — 아래 4번 참고 (필수!)

# 4) 웹 빌드 + 안드로이드 동기화
npm run build
npx cap sync android
```

`cap sync` 출력에 아래처럼 플러그인 8개가 잡히면 정상입니다.

```
@capacitor-community/media
@capacitor-community/speech-recognition   ← 이번에 추가된 것
@capacitor/app
@capacitor/filesystem
@capacitor/local-notifications
@capacitor/preferences
@capacitor/share
```

---

## 4. 버전 올리기 (안 하면 Play Console 이 거부)

`android/app/build.gradle` — 현재 값은 `versionCode 1` / `versionName "1.0"` 입니다.

```gradle
versionCode 2
versionName "1.0.1"
```

`versionCode` 는 반드시 이전보다 커야 하고, 한 번 쓴 번호는 재사용할 수 없습니다.

---

## 5. AAB 빌드 (서명)

> ⚠️ **빌드 전에 반드시 `npm install` → `npm run build` → `npx cap sync android` 를 거칠 것.**
> `android/app/src/main/assets/public/` 은 `cap sync` 없이는 갱신되지 않아서, 맥에서 고친
> 내용이 하나도 안 들어간 AAB 가 나간다. 실제로 2026-08-29 시점에 이 폴더가 3개월 낡아
> 있었다.


### 현재 사용 중인 키 (2026-08-29 교체됨)

```
키스토어 경로 : C:\Users\user\keystores\church-memory-2026.jks
키 별칭       : key0
비밀번호      : C:\Users\user\keystores\새키_비밀번호.txt 에 기록
SHA-256       : A3:95:38:44:77:DB:89:40:02:DC:BA:1A:3C:BB:18:6F:
                6E:E9:53:87:E1:35:3A:E3:AA:5E:0A:8C:17:9E:42:A1
```

> ⚠️ **비밀번호는 24자리 랜덤이라 기억으로 되살릴 수 없습니다.**
> 비밀번호 관리자 + 클라우드에 반드시 백업하세요.

**CLI 빌드 (권장)** — `android/keystore.properties` 가 이미 이 키를 가리키고 있습니다.
```bat
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
cd android
gradlew.bat bundleRelease
```
결과물: `android\app\build\outputs\bundle\release\app-release.aab`

**Android Studio 로 하려면** `Build > Generate Signed Bundle / APK` → **Android App Bundle**
→ 위 `.jks` 선택 → Build Variant: `release`

### 왜 키를 교체했나

첫 AAB(2026-06-03)를 서명한 옛 키 `C:\Users\user\keystores\church-memory-key` 는
**비밀번호를 분실**했다. 이 PC 전체를 뒤졌지만 어디에도 기록이 없었고, Android Studio 의
비밀번호 금고(`c.kdbx`)도 키 생성일보다 앞서 있어 저장된 적이 없었다.

다행히 **Play Console 에 업로드된 번들이 0건**이라 업로드 키가 아직 고정되지 않은 상태였다.
그래서 재설정 신청(수일 소요) 없이 새 키를 만들어 첫 업로드에 그대로 쓸 수 있었다.

- 옛 키(`church-memory-key`)와 `keystore-backup-2026-08-29.zip` 은 이제 쓸모없다.
  다만 새 키로 업로드가 완전히 끝난 뒤에 정리할 것.
- `Android 개발자 인증` 페이지의 지문 `C7:CE:DC:37:...` 은 **Play 앱 서명 키**(구글 보관)라
  업로드 키를 바꿔도 그대로다. 손댈 필요 없다.

> ⚠️ 앞으로는 이 키가 유일하다. 다른 키로 서명하면 업데이트로 인정되지 않는다.
> (맥에는 키스토어가 없습니다. 그래서 Play Store 빌드는 윈도우에서 해야 합니다)

---

## 6. Play Console

**프로덕션 직행하지 말고 내부 테스트를 먼저 거치세요.**

1. 테스트 → **내부 테스트** → 새 버전 만들기 → AAB 업로드
2. 출시 노트(한국어):

```
• 전체 목록 화면 성능 개선 (불필요한 화면 갱신 제거)
• 검색 중 화면이 저절로 움직이던 문제 수정
• 검색창이 목록과 겹쳐 눌리지 않던 문제 수정
• 음성 암송 기능 개선 — 이제 마이크 버튼을 다시 눌러 종료합니다
• 암송 확인 버튼 글자가 보이지 않던 문제 수정
```

3. 테스터 폰에 설치 후 확인 (아래 체크리스트)
4. 문제 없으면 **프로덕션**으로 승격

### 테스트 체크리스트

- [ ] **기존 앱 위에 업데이트했을 때 암송 기록·북마크·설정이 살아남는가** ← 가장 중요
- [ ] 전체 목록 화면에서 검색 시 깜빡임 없는가
- [ ] 검색어 입력 중 화면이 저절로 스크롤되지 않는가
- [ ] 검색창이 편하게 눌리는가
- [ ] 완전 암송 → 마이크 버튼 → 권한 팝업 → 음성이 텍스트로 입력되는가
- [ ] 마이크를 다시 누르면 인식이 멈추는가
- [ ] `암송 확인` 버튼 글자가 보이는가
- [ ] 목록이 21px 내려간 것이 어색하지 않은가
- [ ] 홈 위젯 정상 동작 (안드로이드 위젯은 이번에 건드리지 않음)

> 데이터 보존 확인은 되돌릴 수 없는 항목입니다. 반드시 내부 테스트에서 먼저 확인하세요.
> (이번 라운드에서 저장소 구조는 건드리지 않았으므로 문제없을 것으로 예상됩니다)

---

## 7. Play Console 설문 관련

- **데이터 보안**: 기존 답변(수집·전송 없음) 그대로 두면 됩니다.
  음성 인식은 OS(Google) 기능을 호출할 뿐 앱이 오디오를 수집·전송하지 않습니다.
- **개인정보처리방침 URL**: 변경 없음 (`https://kim-hakseong.github.io/ChurchMemoryMaster/privacy-policy.html`)
  내용만 갱신되었고 URL 은 동일하므로 재입력 불필요.
- **권한**: `RECORD_AUDIO` 는 이전부터 매니페스트에 있었으므로 신규 권한 고지 대상 아님.

---

## 8. 하지 말아야 할 것

- `ios/` 폴더 수정·삭제 (맥 전용, 건드리면 서명/프로젝트 깨짐)
- home / age-group / bookmarks 의 헤더 여백 수정 (의도적으로 남겨둔 것)
- `versionCode` 를 1 로 되돌리기
- 키스토어를 새로 만들기
- `.jks` / `keystore.properties` 를 git 에 커밋 (`.gitignore` 에 규칙 추가해 두었습니다)

---

## 9. 맥 쪽 현재 상태 (참고)

- App Store: `1.0 (1)` **심사 대기 중** (제출 2026-08-18 22:52, 제출 ID `c16e2880-bf1c-4737-a10d-e7a0b210094b`)
- Apple ID `6802671002` / 번들 ID `com.church.memory.app`
- 심사 결과가 나오면 Log.md 에 21장으로 이어서 기록할 예정
- 자세한 경위는 `Log.md` 20장, App Store 등록 문구는 `AppStore.md` 참조

---

## 10. 작업 후

Play Store 업데이트가 끝나면 `Log.md` 에 짧게 남겨주세요 (버전, 출시일, 특이사항).
맥·윈도우 양쪽에서 같은 Log.md 를 쓰므로 **섹션 번호가 겹치지 않도록** 마지막 번호를 확인하고 이어서 쓰면 됩니다.
(과거에 양쪽이 각각 18장을 써서 충돌한 적이 있습니다 — 현재 마지막은 **20장**입니다)
