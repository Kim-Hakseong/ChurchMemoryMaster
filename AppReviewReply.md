# App Review 회신 (Guideline 2.1 — Information Needed)

> 2026-08-19 수신. 코드 결함이 아니라 **정보 요청**에 의한 반려.
> 아래 본문을 App Store Connect → 해당 제출 → **"앱 심사에 회신"** 에 붙여넣고,
> 화면 녹화 영상을 첨부하면 됩니다.
> 같은 내용을 **버전 페이지 → 앱 심사 정보 → 메모** 에도 넣어두면 다음 제출부터 재발하지 않습니다.

---

## 회신 본문 (영문 — 그대로 복사)

```
Thank you for the review. Please find the requested information below.
A screen recording captured on a physical iPhone is attached.

1. SCREEN RECORDING
Attached. The recording was captured on a physical iPhone 16 running iOS 26.5.2.
It starts from launching the app and walks through the core user flow:
- Home screen showing this week's memory verse for all three age groups
- Opening an age group to see last week / this week / next week verses
- Memorization practice: Easy (fill in 3-5 blanks), Normal (fill in 7-10 blanks),
  and Full Recitation (type the whole verse, or speak it using the microphone)
- The microphone permission prompt and speech-to-text input
- Points, streak and badges earned after completing a recitation
- Full verse list with search
- Church calendar
- Settings (notification schedule, theme, font size)
- Adding the Home Screen widget and switching its age group

The app has no account registration, no login, no account deletion flow,
no paid content, no in-app purchase or subscription, and no user-generated
content that is shared with other users. The only permission prompts are
microphone / speech recognition (optional) and notifications (optional);
both are shown in the recording.

2. DEVICES AND OS TESTED
- iPhone 16 (iPhone17,3), iOS 26.5.2 — physical device
The app is iPhone-only (device family 1). Minimum supported version is iOS 15.0.
The Home Screen widget requires iOS 17.0 or later.

3. APP FUNCTION AND TARGET AUDIENCE
"교회학교 암송 수첩" (Church School Memory Notebook) is a Bible verse memorization
app for Korean church school students and their teachers.

Problem it solves: each week, church school students are given one short verse to
memorize, following the church's own curriculum. Until now students and parents had
to look through printed bulletins or scroll back through group chat messages to find
which verse belongs to the current week. This app shows the correct verse for the
current week automatically, per age group (preschool / elementary / middle-high),
and provides simple practice modes so the verse can actually be memorized.

Target audience: church school students (roughly ages 5-18), their parents, and
teachers. Rated 4+; there is no objectionable content.

4. HOW TO SET UP AND ACCESS THE MAIN FEATURES
No login, no account and no sample data are required. All content is bundled in the
app and is available immediately after installation.

- This week's verse: shown on the home screen on first launch. Tap an age group card
  to see last week / this week / next week.
- Memorization practice: tap the graduation-cap icon on a verse card, then choose
  Easy / Normal / Full Recitation.
- Voice input: in Full Recitation, tap the microphone button at the bottom right of
  the text field, allow the microphone and speech recognition prompts, speak the
  verse, then tap the microphone again to stop. Voice input is optional; the same
  screen accepts typing.
- Home Screen widget: launch the app once, then long-press the Home Screen, tap "+",
  search for the app, and add the medium or large widget. Long-press the widget and
  choose an age group.
- Notifications: Settings tab, enable notifications and add a weekday and time.

5. EXTERNAL SERVICES, TOOLS AND PLATFORMS
The app does not use any external service, backend server, or third-party SDK.
- There is no server operated by the developer; the app makes no network requests.
- No analytics, no advertising SDK, no crash reporting, no authentication service,
  no payment processor and no AI service are used.
- All user data (memorization progress, points, badges, bookmarks,
  settings, calendar entries) is stored only on the device.
- The only platform capability used is Apple's on-device Speech framework
  (SFSpeechRecognizer) for the optional voice input feature, and local notifications.
The app is built with Capacitor, which renders the bundled HTML/CSS/JS locally in a
WKWebView. It does not load any remote web content.

6. REGIONAL DIFFERENCES
There are none. The app is offered only in South Korea and only in Korean. All
features behave identically for every user; there is no region-specific content,
pricing or feature gating.

7. REGULATED INDUSTRY / THIRD-PARTY MATERIAL
The app does not operate in a regulated industry.
The content consists of the church school's own curriculum: a lesson list prepared by
the church, each lesson paired with one short Bible verse excerpt (a single verse,
typically one sentence) used for memorization, plus the church's own event calendar.
Bible verses are quoted briefly for religious education purposes and each quotation
is accompanied by its book, chapter and verse reference. The verses are taken from the
Korean Revised Version (개역한글, first published 1961), a translation whose term of
protection under Korean copyright law has expired. No full chapters, no full books and
no complete Bible text are distributed, and the app does not function as a Bible reader.

Privacy policy: https://kim-hakseong.github.io/ChurchMemoryMaster/privacy-policy.html

Please let us know if any further information would be helpful.
```

---

## 화면 녹화 만들기

### 방법 A — 맥에 연결해서 QuickTime 으로 (권장, 화질 좋음)

1. 아이폰을 맥에 USB 로 연결
2. **QuickTime Player** 실행 → 메뉴 `파일 > 새로운 동영상 녹화`
3. 녹화 버튼 옆 **∨** 를 눌러 카메라를 **"김학성의 iPhone"** 으로 선택
4. 녹화 → 아래 순서대로 시연 → 정지 → 저장

### 방법 B — 아이폰 자체 화면 기록

설정 > 제어 센터에 "화면 기록" 추가 후 제어 센터에서 녹화.
(끝나면 사진 앱에서 맥으로 옮기면 됩니다)

### 녹화에 반드시 담을 순서

**앱 실행부터 시작해야 합니다** (홈 화면에서 아이콘을 누르는 장면부터).

1. 홈 화면에서 앱 아이콘 탭 → 실행
2. 메인 화면 — 유치부·초등부·중고등부 3개 카드
3. 부서 하나 탭 → 지난주/이번주/다음주 구절
4. 암송 연습 진입 → **쉬움** 한 번 풀기
5. 다시 들어가 **완전 암송** → 마이크 버튼 탭 → **권한 팝업이 뜨는 장면** → 허용 → 말하기 → 글자가 입력되는 것 → 마이크 다시 눌러 종료 → 암송 확인
6. 포인트/뱃지 획득 화면
7. 전체 목록 → **검색** 해보기
8. 캘린더 탭
9. 설정 → 알림 켜기 (**알림 권한 팝업 장면 포함**)
10. 홈 화면으로 나가서 **위젯 추가** → 위젯에 이번 주 말씀 표시 → 길게 눌러 부서 변경

> 권한 팝업(마이크·음성인식·알림)이 뜨는 장면은 Apple 이 명시적으로 요구한 항목입니다.
> 이미 권한을 허용해 둔 상태라면, 앱을 삭제하고 다시 설치한 뒤 녹화하면 팝업이 다시 뜹니다.

**길이**: 2~4분이면 충분합니다. 파일이 크면(500MB 이상) 압축하거나 Dropbox/Google Drive
링크를 회신 본문에 함께 적어주세요.

---

## 회신 절차

1. App Store Connect → **배포 → 앱 심사** → 해당 제출 열기
2. 메시지 하단 **"앱 심사에 회신"** 클릭
3. 위 영문 본문 붙여넣기 + 녹화 영상 첨부
4. 전송

그 다음 **버전 페이지 → 앱 심사 정보 → 메모** 에도 같은 본문(1번 항목 제외)을 넣어두면
다음 버전 제출 때 같은 요청을 다시 받지 않습니다.

> 이번 건은 빌드를 다시 올릴 필요가 없습니다. 회신만으로 심사가 재개됩니다.
