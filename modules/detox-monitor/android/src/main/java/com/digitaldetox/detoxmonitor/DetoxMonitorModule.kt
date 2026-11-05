package com.digitaldetox.detoxmonitor

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Real app-usage monitoring via UsageStatsManager.
 *
 * Replaces the previous mock that simulated distractions with Math.random().
 * Requires the user to grant "Usage access" in system settings; without it
 * the query APIs return empty results and JS falls back gracefully.
 */
class DetoxMonitorModule : Module() {

    private val context: Context
        get() = appContext.reactContext
            ?: throw IllegalStateException("DetoxMonitor: no React context available")

    override fun definition() = ModuleDefinition {
        Name("DetoxMonitor")

        AsyncFunction("hasUsageAccess") {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            }
            mode == AppOpsManager.MODE_ALLOWED
        }

        Function("openUsageAccessSettings") {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }

        AsyncFunction("getForegroundPackageName") {
            val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val end = System.currentTimeMillis()
            val begin = end - 10 * 60 * 1000L
            val events = usm.queryEvents(begin, end)
            val event = UsageEvents.Event()
            var lastPackage: String? = null
            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                    lastPackage = event.packageName
                }
            }
            lastPackage
        }

        AsyncFunction("getAppUsageBetween") { startMs: Double, endMs: Double ->
            val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val events = usm.queryEvents(startMs.toLong(), endMs.toLong())
            val event = UsageEvents.Event()
            val resumedAt = mutableMapOf<String, Long>()
            val totals = mutableMapOf<String, Long>()

            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                when (event.eventType) {
                    UsageEvents.Event.ACTIVITY_RESUMED ->
                        resumedAt[event.packageName] = event.timeStamp
                    UsageEvents.Event.ACTIVITY_PAUSED -> {
                        val start = resumedAt.remove(event.packageName)
                        if (start != null) {
                            totals[event.packageName] =
                                (totals[event.packageName] ?: 0L) + (event.timeStamp - start)
                        }
                    }
                }
            }
            // Sessions still open at the end of the window count until endMs.
            for ((pkg, start) in resumedAt) {
                totals[pkg] = (totals[pkg] ?: 0L) + (endMs.toLong() - start)
            }

            totals.entries
                .filter { it.value > 0 }
                .sortedByDescending { it.value }
                .map { mapOf("packageName" to it.key, "foregroundMs" to it.value.toDouble()) }
        }

        AsyncFunction("getAppLabel") { packageName: String ->
            try {
                val pm = context.packageManager
                val info = pm.getApplicationInfo(packageName, 0)
                pm.getApplicationLabel(info).toString()
            } catch (e: PackageManager.NameNotFoundException) {
                null
            }
        }
    }
}
