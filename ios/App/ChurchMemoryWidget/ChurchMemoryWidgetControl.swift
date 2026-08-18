//
//  ChurchMemoryWidget — iOS Widget Extension
//  (파일명이 ChurchMemoryWidgetControl.swift이지만 내용은 메인 위젯 코드입니다.
//   Swift는 파일명과 내부 타입명이 일치할 필요가 없습니다.)
//
//  안드로이드 widget과 동일한 UX:
//   - Medium(systemMedium): 한 부서의 "이번 주" 암송 구절
//   - Large(systemLarge): 한 부서의 지난/이번/다음 주 암송 구절
//   - 위젯 길게 눌러 부서(유치부/초등부/중고등부) 선택
//
//  데이터는 App Group(`group.com.church.memory.app`)의 UserDefaults를 통해
//  메인 앱(@capacitor/preferences)이 저장한 JSON을 읽어옴.
//  키: widget_data_kindergarten | widget_data_elementary | widget_data_youth
//

import WidgetKit
import SwiftUI
import AppIntents

// MARK: - 데이터 모델 (메인 앱이 저장하는 JSON 형태와 일치)

struct WidgetVerseData: Codable {
    let lessonName: String
    let content: String
    let reference: String
    let date: String
}

struct WidgetData: Codable {
    let ageGroup: String
    let lastWeek: WidgetVerseData?
    let thisWeek: WidgetVerseData?
    let nextWeek: WidgetVerseData?
    let lastUpdated: Double
}

// MARK: - 부서(Configuration용 AppEnum)

enum AgeGroupOption: String, CaseIterable, AppEnum {
    case kindergarten
    case elementary
    case youth

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "암송 부서"
    static var caseDisplayRepresentations: [AgeGroupOption: DisplayRepresentation] = [
        .kindergarten: "유치부",
        .elementary: "초등부",
        .youth: "중고등부"
    ]

    var displayName: String {
        switch self {
        case .kindergarten: return "유치부"
        case .elementary: return "초등부"
        case .youth: return "중고등부"
        }
    }

    /// 안드로이드 위젯 색상 토큰과 동일
    var accentColor: Color {
        switch self {
        case .kindergarten: return Color(red: 0.86, green: 0.15, blue: 0.47)  // #DB2777
        case .elementary:   return Color(red: 0.15, green: 0.39, blue: 0.92)  // #2563EB
        case .youth:        return Color(red: 0.09, green: 0.64, blue: 0.29)  // #16A34A
        }
    }

    var prefsKey: String { "widget_data_\(rawValue)" }
}

// MARK: - Configuration Intent

struct VerseWidgetConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "암송 부서"
    static var description = IntentDescription("위젯에 표시할 부서를 선택하세요.")

    @Parameter(title: "부서", default: .kindergarten)
    var ageGroup: AgeGroupOption
}

// MARK: - 데이터 로딩 (App Group UserDefaults)

private let appGroupID = "group.com.church.memory.app"

func loadWidgetData(for ageGroup: AgeGroupOption) -> WidgetData? {
    guard let defaults = UserDefaults(suiteName: appGroupID) else { return nil }
    guard let json = defaults.string(forKey: ageGroup.prefsKey),
          let data = json.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(WidgetData.self, from: data)
}

// MARK: - Timeline Entry

struct VerseEntry: TimelineEntry {
    let date: Date
    let ageGroup: AgeGroupOption
    let data: WidgetData
}

// MARK: - Timeline Provider

struct VerseTimelineProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> VerseEntry {
        VerseEntry(date: Date(), ageGroup: .kindergarten, data: Self.sampleData())
    }

    func snapshot(for configuration: VerseWidgetConfigIntent, in context: Context) async -> VerseEntry {
        let data = loadWidgetData(for: configuration.ageGroup) ?? Self.sampleData()
        return VerseEntry(date: Date(), ageGroup: configuration.ageGroup, data: data)
    }

    func timeline(for configuration: VerseWidgetConfigIntent, in context: Context) async -> Timeline<VerseEntry> {
        let data = loadWidgetData(for: configuration.ageGroup) ?? Self.sampleData()
        let entry = VerseEntry(date: Date(), ageGroup: configuration.ageGroup, data: data)
        // 안드로이드 위젯과 동일하게 1시간 주기 갱신
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
        return Timeline(entries: [entry], policy: .after(next))
    }

    private static func sampleData() -> WidgetData {
        WidgetData(
            ageGroup: "kindergarten",
            lastWeek: WidgetVerseData(lessonName: "지난 과", content: "데이터를 불러오는 중…", reference: "—", date: ""),
            thisWeek: WidgetVerseData(lessonName: "이번 과", content: "앱을 한 번 실행하면 위젯에 암송 구절이 표시됩니다.", reference: "—", date: ""),
            nextWeek: WidgetVerseData(lessonName: "다음 과", content: "데이터를 불러오는 중…", reference: "—", date: ""),
            lastUpdated: Date().timeIntervalSince1970 * 1000
        )
    }
}

// MARK: - 자수 기반 동적 폰트 (위젯 카드 안에 가능한 한 다 들어가게)

private func mediumContentFont(for length: Int) -> (size: CGFloat, lineLimit: Int) {
    switch length {
    case 0..<50:    return (14, 4)
    case 50..<100:  return (13, 5)
    case 100..<150: return (12, 6)
    case 150..<200: return (11, 7)
    default:        return (10, 9)
    }
}

private func largeContentFont(for length: Int, isThis: Bool) -> (size: CGFloat, lineLimit: Int) {
    let extra = isThis ? 2 : 0
    switch length {
    case 0..<50:    return (12, 3 + extra)
    case 50..<100:  return (11, 4 + extra)
    case 100..<150: return (10, 5 + extra)
    default:        return (9, 6 + extra)
    }
}

// MARK: - Medium View (systemMedium — 4x2: 이번 주 한 구절)

struct MediumWidgetView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Text("\(entry.ageGroup.displayName) · 이번 주")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.secondary)
                Spacer()
            }

            if let v = entry.data.thisWeek {
                if !v.lessonName.isEmpty {
                    Text(v.lessonName)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                }
                let f = mediumContentFont(for: v.content.count)
                Text("\u{201C}\(v.content)\u{201D}")
                    .font(.system(size: f.size))
                    .foregroundColor(.primary)
                    .lineLimit(f.lineLimit)
                    .minimumScaleFactor(0.6)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: false)
                Spacer(minLength: 0)
                HStack {
                    Spacer()
                    Text(v.reference)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(entry.ageGroup.accentColor)
                }
            } else {
                Spacer()
                Text("이번 주 암송 구절이 없습니다")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            }
        }
    }
}

// MARK: - Large View (systemLarge — 4x5: 지난/이번/다음 주)

struct LargeWidgetView: View {
    let entry: VerseEntry

    var body: some View {
        VStack(spacing: 6) {
            section(label: "지난 주", verse: entry.data.lastWeek, isThis: false)
            section(label: "★ 이번 주", verse: entry.data.thisWeek, isThis: true)
            section(label: "다음 주", verse: entry.data.nextWeek, isThis: false)
        }
    }

    @ViewBuilder
    private func section(label: String, verse: WidgetVerseData?, isThis: Bool) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(isThis ? entry.ageGroup.accentColor : .secondary)

            if let v = verse {
                if !v.lessonName.isEmpty {
                    Text(v.lessonName)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                }
                let f = largeContentFont(for: v.content.count, isThis: isThis)
                Text(v.content)
                    .font(.system(size: f.size))
                    .foregroundColor(.primary)
                    .lineLimit(f.lineLimit)
                    .minimumScaleFactor(0.6)
                    .multilineTextAlignment(.leading)
                HStack {
                    Spacer()
                    Text(v.reference)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(entry.ageGroup.accentColor)
                }
            } else {
                Text("암송 구절이 없습니다")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(isThis ? entry.ageGroup.accentColor.opacity(0.10) : Color(.systemGray6))
        )
    }
}

// MARK: - Entry View (사이즈별 분기)

struct ChurchMemoryWidgetEntryView: View {
    var entry: VerseEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            MediumWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget definition

struct ChurchMemoryWidget: Widget {
    let kind: String = "ChurchMemoryWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: VerseWidgetConfigIntent.self, provider: VerseTimelineProvider()) { entry in
            ChurchMemoryWidgetEntryView(entry: entry)
                .containerBackground(.background, for: .widget)
        }
        .configurationDisplayName("교회학교 암송")
        .description("이번 주 / 지난 주 / 다음 주 암송 구절을 표시합니다.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Widget Bundle (entry point — @main)

@main
struct ChurchMemoryWidgetBundle: WidgetBundle {
    var body: some Widget {
        ChurchMemoryWidget()
    }
}
