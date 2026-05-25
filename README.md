# 교회학교 암송 수첩 — 출시·운영 가이드

플레이스토어/앱스토어 출시와 이후 업데이트 운영을 위한 핵심 가이드. 코드 변경은 `Log.md`, 디자인 토큰은 `Design2.md` 를 따로 참고.

---

## 1. 앱 식별 정보 (고정값 — **절대 변경 금지**)

| 항목 | 값 |
|---|---|
| Android `applicationId` / `namespace` | `com.church.memory.app` |
| iOS Bundle ID (Capacitor `appId`) | `com.church.memory.app` |
| 앱 이름 (`appName`) | `교회학교 암송 수첩` |
| 초기 버전 | `versionCode 1`, `versionName "1.0"` |

> 패키지명(applicationId / Bundle ID)을 한 번이라도 바꾸면 스토어는 **완전히 다른 앱**으로 인식한다. 기존 사용자에겐 업데이트가 안 보이고, 새로 받으면 데이터가 처음부터 시작된다. 1.0 출시 이후로는 이 값을 절대 건드리지 말 것.

---

## 2. 버전 올리는 규칙

| 변수 | 의미 | 다음 출시 예시 (1.1) |
|---|---|---|
| `versionCode` (정수) | 스토어 내부 비교용. **무조건 단조 증가**. 1 → 2 → 3 … | `2` |
| `versionName` (문자열) | 사용자에게 보이는 버전. 자유롭게 표기. | `"1.1"` |

수정 위치:
- `android/app/build.gradle` — `defaultConfig { versionCode N; versionName "X.Y" }`
- `capacitor.config.ts` — `appendUserAgent: 'ChurchMemoryApp/X.Y'`
- `android/app/src/main/assets/capacitor.config.json` 및 `ios/App/App/capacitor.config.json` 의 `appendUserAgent` 도 동일 값으로 (다음 `npx cap sync` 시 자동 동기화되긴 하나 명시적으로 맞춰주는 게 안전)
- iOS 출시 시 Xcode 의 `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` 도 같은 값으로 맞춰서 빌드 → 업로드

⚠️ `versionCode` 를 한 번이라도 줄이거나 같은 값으로 다시 올리면 스토어가 업로드를 거절. 실수로 5 까지 올렸다가 4 로 되돌리는 건 불가능. 무조건 앞으로만.

---

## 3. 서명키 관리 (Android, 가장 중요)

업데이트가 같은 앱으로 인식되려면 **APK/AAB 서명에 사용한 키스토어가 항상 동일**해야 한다. 키를 잃어버리면 같은 패키지로 업데이트하는 길이 영구적으로 막힌다.

### 권장 절차
1. 출시용 keystore (`.jks` / `.keystore`) 한 번 생성하고 **여러 위치에 백업** (로컬 + 클라우드 + 외장 디스크 등 최소 3곳).
2. keystore 비밀번호 + 키 alias + 키 비밀번호도 같은 수준으로 안전하게 보관 (1Password / Bitwarden 등).
3. **Play App Signing 활성화 권장** — Play Console 에서 활성화하면 Google 이 최종 서명키를 보관해주고, 업로드 키만 분실해도 새 업로드 키로 교체할 수 있다 (분실 리스크 1차 안전장치).
4. `.keystore` 파일은 절대 깃에 커밋하지 말 것. `.gitignore` 에 `*.jks`, `*.keystore` 추가.

### 키 분실 시 결과
- Play App Signing 활성화 X: 같은 패키지로 업데이트 영구 불가. 새 패키지명으로 신규 등록 → 모든 사용자 데이터 손실.
- Play App Signing 활성화 O: Google 에 키 교체 요청 가능. 데이터·평점 유지하며 복구 가능.

---

## 4. 사용자 데이터 보존 메커니즘

플레이스토어 자동 업데이트 시 사용자가 쌓은 데이터는 **그대로 유지된다.** 단 §1, §3 조건이 충족될 때.

| 데이터 | 저장 방식 | 위치 |
|---|---|---|
| 북마크 | `@capacitor/preferences` | Android SharedPreferences |
| 포인트·뱃지·스트릭 | WebView `localStorage` | 앱 데이터 디렉터리 (WebView 내부) |
| 암송 구절 시드 | `localStorage` | 동일 |
| 캘린더 이벤트 | `localStorage` + `Filesystem(Documents)` | 동일 + 앱 전용 Documents/ |

데이터가 초기화되는 경우 (피해야 함):
1. `applicationId` 변경 → 새 앱으로 인식
2. 서명키 변경 → 설치 자체 거부 (재설치 필요)
3. 사용자가 직접 "앱 데이터 지우기" 수행
4. 사용자가 앱 삭제 후 재설치
5. 자동 백업 비활성화 + 데이터 손상

데이터 구조 변경 (예: `localStorage` 키 이름 변경) 이 필요한 업데이트에서는 **마이그레이션 코드** (옛 키 읽어서 새 키로 옮기기) 를 반드시 한 번 넣고 다음 버전에서 제거할 것.

---

## 5. 빌드 / 동기화 절차

### 기본 빌드 (코드 변경 후 매번)
```powershell
npm run build
npx cap sync android        # ← 빠뜨리면 옛 자산이 APK 에 들어감
# 또는: npx cap sync ios
```

### Android Studio 에서 APK 빌드
1. Android Studio 로 `android/` 프로젝트 열기
2. `Build → Generate Signed Bundle / APK` → AAB (Play Store 권장)
3. keystore 선택 → release 빌드
4. 결과물: `android/app/release/app-release.aab`

### iOS 빌드 (Xcode)
- iOS 네이티브 프로젝트는 `npx cap sync ios` 시 생성. `ios/App/App.xcworkspace` 를 Xcode 로 열어 Archive → App Store Connect 업로드.
- Bundle ID 가 `com.church.memory.app` 와 일치하는 App Store Connect 앱과 프로비저닝 프로파일 미리 준비.

### Clean 빌드가 필요할 때
패키지명 변경 같은 큰 구조 변경 후엔 캐시 잔재 제거:
```powershell
# Android
cd android
./gradlew clean
# 또는 Android Studio → Build → Clean Project

# Capacitor
rm -rf node_modules/.cache
rm -rf dist
npm run build && npx cap sync
```

---

## 6. 디바이스 디버깅 (Android)

```powershell
cd "C:\Users\user\AppData\Local\Android\Sdk\platform-tools"
.\adb logcat *:E AndroidRuntime:V chromium:V Capacitor:V > crash.log
```

자가서명 APK 설치 시 "Play Protect 무한 검사" 가 걸리면: Play 스토어 → 프로필 → Play Protect → 검사 일시 OFF.

---

## 7. 자주 만난 함정 (체크리스트)

- [ ] `npm run build` 후 `npx cap sync` 안 함 → 옛 자산 그대로
- [ ] Capacitor 설정 변경 시 `android/app/src/main/assets/capacitor.config.json` 이 sync 로 덮어쓰기됨 (정본은 루트 `capacitor.config.ts`)
- [ ] SW 캐시로 옛 페이지 뜸 → `client/public/sw.js` 의 킬 스위치 동작 확인
- [ ] `backdrop-filter` 중첩 → Android WebView GPU 크래시. 1중첩만 사용
- [ ] 위젯 동작 안 함 → Manifest 의 `<action>` 명과 Kotlin `ACTION_REFRESH` 상수, 그리고 위젯 XML 의 `android:configure` FQN 셋이 모두 일치하는지 확인
- [ ] `versionCode` 를 같은 값으로 두 번 올림 → 스토어 업로드 거부
- [ ] 키스토어 분실 → Play App Signing 활성화 안 되어 있었다면 복구 불가

---

## 8. 데이터 사이클 (참고)

| 부서 | 데이터 범위 | 사이클 | wrap 동작 |
|---|---|---|---|
| 유치부 | 2024-01-07 ~ 2033-12-17 (520주) | 52주 | 2034부터 1~52주차 반복 |
| 초등부 | 2024-01-07 ~ 2033-12-17 (520주) | 104주 | 2034부터 1~104주차 반복 |
| 중고등부 | 2024-01-07 ~ 2034-01-07 (523주) | 156주 | 2034.1부터 1~156주차 반복 |
| 초등월암송 | 2024.1 ~ 2033.12 (120개월) | 12개월 | 같은 월의 가장 최근 연도 데이터 적용 |

원본 엑셀(`client/public/seed.json` 으로 변환된 시드) 은 무수정. 룩업 로직만 wrap.

---

## 9. 출시 직전 최종 체크리스트

### 코드
- [ ] `npm run lint` 또는 `npx tsc --noEmit` 통과
- [ ] `console.log` / 디버그 코드 제거
- [ ] 하드코딩된 비밀값 (`.env` 의 API 키 등) 없는지 확인
- [ ] `versionCode` / `versionName` / `appendUserAgent` 세 곳 모두 같은 버전인지 확인

### Android
- [ ] keystore 백업 완료 (3곳 이상)
- [ ] Play App Signing 활성화
- [ ] 앱 아이콘 모든 해상도(mipmap-mdpi~xxxhdpi) 정상
- [ ] 권한 (`AndroidManifest.xml`) 실제 사용하는 것만 남았는지 확인 (INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS)
- [ ] Release AAB 빌드 후 내부 테스트 트랙으로 한 번 올려서 실 디바이스 설치/실행 검증
- [ ] 데이터 보존 검증: 1.0 설치 → 데이터 쌓기 → 1.1 더미 빌드(versionCode 2) 로 업데이트 → 데이터 살아있는지 확인

### iOS (다음 단계)
- [ ] Apple Developer Program 가입
- [ ] App Store Connect 앱 등록 (Bundle ID: `com.church.memory.app`)
- [ ] 스크린샷·앱 설명 준비
- [ ] iOS 자동 백업 (iCloud) 동작 확인

### 스토어 등록 정보
- [ ] 앱 이름·짧은 설명·자세한 설명
- [ ] 스크린샷 (Phone 최소 2장, 권장 5장)
- [ ] 그래픽 이미지 (Play: 1024×500 피처 그래픽)
- [ ] 카테고리 (교육)
- [ ] 콘텐츠 등급 (Play 콘텐츠 등급 설문)
- [ ] 개인정보처리방침 URL (필수 — 데이터 수집·외부 전송 없음을 명시)
- [ ] 개발자 연락처

---

## 10. 1.0 이후 업데이트 권장 흐름

1. `feature/X` 브랜치에서 작업 → `main` 머지
2. `Log.md` 에 변경 내역 추가
3. 버전 번호 올림:
   - `android/app/build.gradle` 의 `versionCode` +1, `versionName` 갱신
   - `capacitor.config.ts` 와 두 capacitor.config.json 의 `appendUserAgent` 동일 값으로
4. `npm run build && npx cap sync android`
5. Android Studio 에서 release AAB 빌드 → Play Console "내부 테스트" 트랙 업로드
6. 실 디바이스 1~2대에서 OTA 자동 업데이트로 받아 데이터 살아있는지 검증
7. 문제없으면 프로덕션 트랙으로 승격

---

**문서 작성**: 2026-05-23
**대상 버전**: 1.0 (versionCode 1) 첫 출시 준비 시점
