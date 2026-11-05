import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export interface AppUsageEntry {
    packageName: string;
    /** Total foreground time in milliseconds inside the queried window. */
    foregroundMs: number;
}

interface DetoxMonitorNativeModule {
    hasUsageAccess(): Promise<boolean>;
    openUsageAccessSettings(): void;
    getForegroundPackageName(): Promise<string | null>;
    getAppUsageBetween(startMs: number, endMs: number): Promise<AppUsageEntry[]>;
    getAppLabel(packageName: string): Promise<string | null>;
}

let nativeModule: DetoxMonitorNativeModule | null = null;
try {
    nativeModule = requireNativeModule<DetoxMonitorNativeModule>('DetoxMonitor');
} catch {
    // Native module missing (Expo Go, web, or an old binary): callers fall
    // back to AppState-based detection.
    nativeModule = null;
}

/**
 * True only where real usage monitoring exists. Android implements it via
 * UsageStatsManager. iOS returns false for now: DeviceActivity/Screen Time
 * needs the Family Controls entitlement, so iOS keeps the AppState fallback
 * in DetoxTimer until that entitlement is granted.
 */
export function isDetoxMonitorAvailable(): boolean {
    return nativeModule != null && Platform.OS === 'android';
}

export async function hasUsageAccess(): Promise<boolean> {
    if (!nativeModule) return false;
    return nativeModule.hasUsageAccess();
}

export function openUsageAccessSettings(): void {
    nativeModule?.openUsageAccessSettings();
}

export async function getForegroundPackageName(): Promise<string | null> {
    if (!nativeModule) return null;
    return nativeModule.getForegroundPackageName();
}

export async function getAppUsageBetween(
    startMs: number,
    endMs: number,
): Promise<AppUsageEntry[]> {
    if (!nativeModule) return [];
    return nativeModule.getAppUsageBetween(startMs, endMs);
}

export async function getAppLabel(packageName: string): Promise<string | null> {
    if (!nativeModule) return null;
    return nativeModule.getAppLabel(packageName);
}
