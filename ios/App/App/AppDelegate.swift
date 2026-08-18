import UIKit
import Capacitor
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    /// 위젯 데이터 동기화 설정
    /// - Capacitor Preferences는 `UserDefaults.standard`에 키 prefix를 붙여 저장합니다.
    /// - Widget Extension은 별도 프로세스라 standard에 접근 불가 → App Group UserDefaults 필요.
    /// - 이 메서드가 standard UserDefaults의 위젯 키들을 App Group으로 복사하고 위젯을 갱신합니다.
    private let appGroupID = "group.com.church.memory.app"
    private let capacitorPrefix = "CapacitorStorage." // @capacitor/preferences default
    private let widgetDataKeys = [
        "widget_data_kindergarten",
        "widget_data_elementary",
        "widget_data_youth"
    ]

    private func syncWidgetData() {
        let standard = UserDefaults.standard
        guard let groupDefaults = UserDefaults(suiteName: appGroupID) else {
            NSLog("[WidgetSync] App Group UserDefaults 접근 실패: \(appGroupID)")
            return
        }

        var didChange = false
        for key in widgetDataKeys {
            // Capacitor Preferences가 저장한 prefix 키 우선 조회, 폴백으로 prefix 없는 키도 확인
            let value = standard.string(forKey: capacitorPrefix + key) ?? standard.string(forKey: key)
            guard let value = value else { continue }
            if groupDefaults.string(forKey: key) != value {
                groupDefaults.set(value, forKey: key)
                didChange = true
            }
        }

        if didChange {
            NSLog("[WidgetSync] App Group으로 위젯 데이터 동기화 완료, 위젯 reload")
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }

    private func scheduleWidgetSync() {
        // 즉시 한 번 + JS가 데이터를 비동기로 저장할 시간 확보를 위해 지연 호출
        syncWidgetData()
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in self?.syncWidgetData() }
        DispatchQueue.main.asyncAfter(deadline: .now() + 8) { [weak self] in self?.syncWidgetData() }
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        scheduleWidgetSync()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        scheduleWidgetSync()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
