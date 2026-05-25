# 플레이스토어 출시 가이드 (v1.0 첫 출시)

> 이어서 작업 재개용. 각 단계 완료할 때마다 체크박스 표시.
> 막히는 부분 있으면 Claude 한테 해당 단계 번호 알려주고 물어보면 됨.

---

## 1단계: Google Play 개발자 계정 만들기

- [ ] https://play.google.com/console 접속 → Google 계정으로 로그인
- [ ] **개발자 계정 등록비 $25 (1회성, 평생)** 결제
- [ ] 본인 인증 — **개인** vs **단체(법인/교회)** 선택
  - 교회 명의 출시 → 단체 (D-U-N-S 번호 / 사업자등록증 필요할 수 있음)
  - 빠른 출시 우선 → 개인 (나중에 단체로 이전 가능)
- [ ] 신원확인 (여권/주민등록증) 제출 — 며칠 ~ 1주일 걸림. 이거 끝나야 앱 등록 가능

> 단체 등록은 신원확인 + 단체 인증 두 단계라 더 오래 걸림. 첫 출시 빨리 원하면 개인 권장.

---

## 2단계: 출시용 서명 키스토어 만들기 ⚠️ 가장 중요

이 키 잃어버리면 영구 복구 불가. 한 번 만들고 백업 철저히.

PowerShell 에서:
```powershell
keytool -genkey -v -keystore church-memory-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias church-memory
```
(JDK 가 PATH 에 있어야 함. Android Studio 설치되어 있으면 보통 있음)

질문에 답하기:
- **키스토어 비밀번호**: 강한 비밀번호 (Bitwarden/1Password 에 저장)
- 이름·조직 등은 영문 입력 권장
- **키 alias 비밀번호**: 키스토어 비밀번호와 같게 설정해도 됨

생성된 `church-memory-release.jks` 를 **3곳에 백업**:
- [ ] 로컬 안전한 폴더
- [ ] 클라우드 (Google Drive / OneDrive 등 본인 계정)
- [ ] 외장 USB 또는 다른 클라우드

`.gitignore` 에 추가:
```
*.jks
*.keystore
keystore.properties
```

---

## 3단계: Gradle 에 서명 정보 연결

`android/keystore.properties` 파일 생성 (깃에는 X):
```properties
storeFile=../../church-memory-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=church-memory
keyPassword=YOUR_KEY_PASSWORD
```
경로는 키스토어 실제 위치에 맞춰 조정.

`android/app/build.gradle` 수정 — `android { … }` 블록 안에 추가:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... 기존 내용
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release  // 이 줄 추가
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

> 이 단계는 Claude 와 같이 작업 권장. 키스토어 만들고 나서 진행.

---

## 4단계: 출시용 AAB 빌드

Android Studio 에서:
1. `Build → Generate Signed Bundle / APK`
2. **Android App Bundle (AAB)** 선택 → Next
3. 위에서 만든 `.jks` 파일 선택, 비밀번호 입력
4. Build Variants: **release** 선택 → Finish
5. 빌드 완료되면 `android/app/release/app-release.aab` 가 생김

이 AAB 파일이 플레이스토어에 업로드할 파일.

---

## 5단계: Play Console 에서 앱 만들기

1. Play Console → **앱 만들기**
2. 입력 항목:
   - 앱 이름: `교회학교 암송 수첩`
   - 기본 언어: 한국어
   - 앱 또는 게임: **앱**
   - 무료 또는 유료: **무료**
   - 선언 (정책 동의 체크박스 3개)

생성되면 좌측 메뉴에 여러 항목 — 빨간 점 있는 항목들 다 채워야 함.

---

## 6단계: 스토어 등록 정보 채우기

### "기본 스토어 등록정보"
- [ ] 앱 이름 (50자)
- [ ] 짧은 설명 (80자)
- [ ] 자세한 설명 (4000자)
- [ ] 앱 아이콘: **512×512 PNG** (32비트, 배경 투명 X)
- [ ] 그래픽 이미지: **1024×500 PNG/JPG** (앱 상세 페이지 상단 큰 배너)
- [ ] 스크린샷: **휴대전화용 최소 2장 (16:9 또는 9:16, 가장자리 320~3840px)** — 권장 5~8장. `참고사진/` 폴더에서 골라 쓰면 됨

### "앱 콘텐츠"
- [ ] 개인정보처리방침 URL — **필수** (§7 참조)
- [ ] 광고: 광고 없음
- [ ] 앱 액세스: "모든 기능에 액세스 가능, 제한 없음"
- [ ] 콘텐츠 등급 설문 (10~15분, 자동 등급 부여)
- [ ] 타겟층 및 콘텐츠 (대상 연령대: 5세 이상 정도)
- [ ] 데이터 보안: **데이터 수집·전송 안 함** 으로 답변 (이 앱은 모든 데이터 로컬 저장)
- [ ] 정부 앱 여부: 아니오
- [ ] 국가 보안 앱 여부: 아니오

### "스토어 설정"
- [ ] 카테고리: **교육**
- [ ] 연락처 정보 (이메일 필수)

---

## 7단계: 개인정보처리방침 만들기

데이터 수집·전송이 없어도 **개인정보처리방침 URL 은 필수**.

내용 (한국어, 영문 둘 다 권장):
```
- 이 앱은 사용자의 개인정보를 수집하지 않습니다.
- 모든 데이터(북마크, 포인트, 캘린더 등)는 사용자 기기 내부에만 저장됩니다.
- 외부 서버로 어떤 데이터도 전송하지 않습니다.
- 광고를 표시하지 않으며, 제3자 추적 도구를 사용하지 않습니다.
- 권한 사용: 마이크 (암송 연습 시 음성 인식 — 기기 내 처리, 외부 전송 없음)
- 문의: [이메일]
```

> 원하면 Claude 한테 한·영 풀버전 작성 부탁 가능.

GitHub Pages 에 올리기 가장 간단:
1. 새 public 레포 만들기 (예: `church-memory-privacy`)
2. `index.html` 또는 `privacy.md` 로 내용 작성
3. Settings → Pages → Source: main branch → Save
4. `https://<username>.github.io/church-memory-privacy/` 접속 가능해지면 그 URL 사용

---

## 8단계: 내부 테스트 트랙으로 첫 업로드 (프로덕션 직행 금지)

좌측 메뉴 → **테스트 → 내부 테스트**:
1. 새 버전 만들기 → AAB 업로드
2. 출시명: `1.0 (1)` 같이 입력
3. 출시 노트 (한국어): "최초 출시"
4. 검토 및 출시
5. **테스터 추가** — Google 계정 이메일 (본인 + 동료 몇 명) 등록
6. 활성화 후 받은 **옵트인 링크**를 테스터 폰에서 열어 가입 → 폰의 Play Store 에서 설치

검증 체크리스트:
- [ ] 설치 정상 동작
- [ ] 모든 탭 / 기능 작동
- [ ] 데이터(북마크·포인트) 쌓이는지
- [ ] **versionCode 2 더미 빌드로 한 번 업데이트해보기 — 데이터 살아남는지 확인** (이게 가장 중요)

---

## 9단계: 프로덕션 출시

내부 테스트에서 문제 없으면:
1. Play Console → **프로덕션** → 새 버전 만들기
2. 내부 테스트에 올렸던 동일 AAB 를 그대로 승격 (또는 재업로드)
3. 출시 전 검토 — 빨간 점/경고가 모두 사라졌는지 확인
4. **검토를 위해 제출**

Google 심사: 보통 **1~3일** (첫 출시는 7일까지도). 승인되면 자동으로 스토어 노출.

---

## 추천 진행 순서 (병렬 가능한 것들)

**먼저 시작 (시간 걸리는 것)**
1. §1 개발자 계정 등록 (신원확인 며칠 걸림)
2. §7 개인정보처리방침 (GitHub Pages 배포)

**계정 승인 기다리는 동안**
3. §2~3 키스토어 생성 + Gradle 연결
4. §4 AAB 빌드 (테스트로 한 번 만들어보기)
5. §6 준비물: 아이콘 512px / 그래픽 1024×500 / 스크린샷 5~8장

**계정 승인 후**
6. §5 앱 만들기
7. §6 스토어 등록정보 입력
8. §8 내부 테스트 업로드 + 검증
9. §9 프로덕션 출시

---

## 막힐 때 자주 만나는 함정

- **AAB 업로드 거부**: `versionCode` 가 이미 사용된 값. 무조건 단조 증가
- **서명 안 됨 에러**: `keystore.properties` 경로 잘못 됨, 비밀번호 오타
- **개인정보처리방침 URL 거부**: HTTPS 가 아니면 거부. GitHub Pages 는 자동 HTTPS
- **그래픽 이미지 사이즈 거부**: 정확히 1024×500 이어야 함 (다른 비율 불가)
- **콘텐츠 등급 설문 후 변경 안 됨**: 답변 한 번 더 돌릴 수 있음, 무서워 말고 정확히
- **데이터 보안 섹션**: 마이크 권한 있다고 "데이터 수집" 으로 표시하면 안 됨 — 이 앱은 음성을 기기 내에서만 처리하고 외부 전송 X, 그러니 "수집 안 함" 으로 답변

---

**문서 작성**: 2026-05-24 (작업 중단 시점)
**현재 상태**: 코드는 v1.0 출시 준비 완료. Play Console 등록 시작 전.
**다음 액션**: §1 개발자 계정 등록부터 시작
