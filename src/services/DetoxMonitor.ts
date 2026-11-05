import {
    isDetoxMonitorAvailable,
    hasUsageAccess,
    openUsageAccessSettings,
    getAppUsageBetween,
    getAppLabel,
} from 'detox-monitor';

export interface Distraction {
    packageName: string;
    /** Human-readable app name when Android can resolve it. */
    label: string;
    foregroundMs: number;
}

const OWN_PACKAGE = 'com.digitaldetox.game';

/** Packages that should never count as a distraction. */
function isIgnoredPackage(packageName: string): boolean {
    if (packageName === OWN_PACKAGE) return true;
    if (packageName === 'com.android.systemui') return true;
    if (packageName === 'com.google.android.permissioncontroller') return true;
    // Home screens: time on the launcher is "away" time, judged by the
    // AppState duration rule in DetoxTimer, not as a named distraction app.
    if (packageName.toLowerCase().includes('launcher')) return true;
    return false;
}

/**
 * Real app-usage monitoring backed by the local `detox-monitor` Expo module
 * (Android UsageStatsManager). Replaces the old mock that faked distractions
 * with Math.random().
 *
 * Where the native module is missing (Expo Go, iOS for now) or the user has
 * not granted Usage access, queries return null and DetoxTimer falls back
 * to its AppState-based "app was backgrounded" rule.
 */
export const DetoxMonitor = {
    /** True on Android builds that include the native module. */
    isNativeAvailable: (): boolean => isDetoxMonitorAvailable(),

    checkPermission: async (): Promise<boolean> => {
        if (!isDetoxMonitorAvailable()) {
            // No way to verify without the native module; do not block the
            // user (AppState fallback still applies).
            return true;
        }
        return hasUsageAccess();
    },

    /** Opens the system "Usage access" settings screen (Android). */
    requestPermission: async (): Promise<boolean> => {
        if (!isDetoxMonitorAvailable()) return true;
        openUsageAccessSettings();
        return hasUsageAccess();
    },

    /**
     * The most-used non-ignored app since `startMs`, if it was in the
     * foreground for at least 3 seconds. Null when monitoring is
     * unavailable, permission is missing, or nothing else was used.
     */
    getDistractionSince: async (startMs: number): Promise<Distraction | null> => {
        if (!isDetoxMonitorAvailable()) return null;
        if (!(await hasUsageAccess())) return null;

        const usage = await getAppUsageBetween(startMs, Date.now());
        const top = usage.find((entry) => !isIgnoredPackage(entry.packageName));
        if (!top || top.foregroundMs < 3000) return null;

        const label = (await getAppLabel(top.packageName)) ?? top.packageName;
        return { packageName: top.packageName, label, foregroundMs: top.foregroundMs };
    },

    /**
     * Legacy check kept for callers that only need a boolean.
     * Returns TRUE when no distraction app was used in the last minute.
     */
    checkAppUsage: async (): Promise<boolean> => {
        const distraction = await DetoxMonitor.getDistractionSince(Date.now() - 60_000);
        return distraction === null;
    },
};
