import ExpoModulesCore

/// iOS stub. Real monitoring needs the DeviceActivity / Screen Time API,
/// which requires Apple's Family Controls entitlement. Until that is
/// granted, every call reports "unavailable" and the JS layer keeps using
/// the AppState-based fallback in DetoxTimer (leaving the app = distraction).
public class DetoxMonitorModule: Module {
    public func definition() -> ModuleDefinition {
        Name("DetoxMonitor")

        AsyncFunction("hasUsageAccess") { () -> Bool in
            false
        }

        Function("openUsageAccessSettings") {
            // No equivalent settings screen without Family Controls.
        }

        AsyncFunction("getForegroundPackageName") { () -> String? in
            nil
        }

        AsyncFunction("getAppUsageBetween") { (_: Double, _: Double) -> [[String: Any]] in
            []
        }

        AsyncFunction("getAppLabel") { (_: String) -> String? in
            nil
        }
    }
}
