package com.church.memory.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.util.TypedValue
import android.widget.RemoteViews
import android.widget.Toast
import com.church.memory.app.MainActivity
import com.church.memory.app.R

/**
 * 암송 구절 위젯 Provider (Large 4x5)
 * 단일 부서: 지난 주 + 이번 주 + 다음 주
 * 전체(all): 유치부 + 초등부 + 중고등부 이번 주
 */
class VerseLargeWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_REFRESH) {
            val appWidgetIds = intent.getIntArrayExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS)
            if (appWidgetIds != null) {
                val appWidgetManager = AppWidgetManager.getInstance(context)
                for (id in appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, id)
                }
            }
            Toast.makeText(context, "새로고침 완료", Toast.LENGTH_SHORT).show()
        } else {
            super.onReceive(context, intent)
        }
    }

    companion object {
        const val ACTION_REFRESH = "com.church.memory.app.widget.REFRESH_LARGE"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences("widget_config", Context.MODE_PRIVATE)
            val ageGroup = prefs.getString("widget_${appWidgetId}_age_group", "kindergarten") ?: "kindergarten"

            val views = RemoteViews(context.packageName, R.layout.widget_large)

            if (ageGroup == "all") {
                updateAllMode(context, views)
            } else {
                updateSingleMode(context, views, ageGroup)
            }

            // 앱 열기 Intent (CLEAR_TOP으로 기존 화면 재사용, CLEAR_TASK 사용 시 위젯 확대 유발)
            val openTab = if (ageGroup == "all") "home" else ageGroup
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("open_tab", openTab)
            }
            val pendingIntent = PendingIntent.getActivity(
                context, appWidgetId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container_large, pendingIntent)

            // 새로고침 Intent (커스텀 액션으로 Toast 표시)
            val refreshIntent = Intent(context, VerseLargeWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, intArrayOf(appWidgetId))
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context, appWidgetId, refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_refresh_large, refreshPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * 단일 부서 모드: 지난 주 / 이번 주 / 다음 주
         */
        private fun updateSingleMode(context: Context, views: RemoteViews, ageGroup: String) {
            val widgetData = getWidgetData(context, ageGroup)

            val title = when (ageGroup) {
                "kindergarten" -> "유치부"
                "elementary" -> "초등부"
                "youth" -> "중고등부"
                else -> "유치부"
            }

            views.setTextViewText(R.id.widget_title_large, title)

            // 라벨 설정
            views.setTextViewText(R.id.last_week_label, "지난 주")
            views.setTextViewText(R.id.this_week_label, "★ 이번 주")
            views.setTextViewText(R.id.next_week_label, "다음 주")

            if (widgetData != null) {
                // 지난 주
                if (widgetData.lastWeek != null) {
                    views.setTextViewText(R.id.last_week_lesson, widgetData.lastWeek.lessonName)
                    views.setTextViewText(R.id.last_week_content, "\"${widgetData.lastWeek.content}\"")
                    views.setTextViewText(R.id.last_week_reference, widgetData.lastWeek.reference)
                    applyAdaptiveTextSize(views, R.id.last_week_content, R.id.last_week_lesson, R.id.last_week_reference, widgetData.lastWeek.content.length)
                } else {
                    views.setTextViewText(R.id.last_week_lesson, "")
                    views.setTextViewText(R.id.last_week_content, "데이터 없음")
                    views.setTextViewText(R.id.last_week_reference, "")
                }

                // 이번 주
                if (widgetData.thisWeek != null) {
                    views.setTextViewText(R.id.this_week_lesson, widgetData.thisWeek.lessonName)
                    views.setTextViewText(R.id.this_week_content, "\"${widgetData.thisWeek.content}\"")
                    views.setTextViewText(R.id.this_week_reference, widgetData.thisWeek.reference)
                    applyAdaptiveTextSize(views, R.id.this_week_content, R.id.this_week_lesson, R.id.this_week_reference, widgetData.thisWeek.content.length)
                } else {
                    views.setTextViewText(R.id.this_week_lesson, "")
                    views.setTextViewText(R.id.this_week_content, "데이터 없음")
                    views.setTextViewText(R.id.this_week_reference, "")
                }

                // 다음 주
                if (widgetData.nextWeek != null) {
                    views.setTextViewText(R.id.next_week_lesson, widgetData.nextWeek.lessonName)
                    views.setTextViewText(R.id.next_week_content, "\"${widgetData.nextWeek.content}\"")
                    views.setTextViewText(R.id.next_week_reference, widgetData.nextWeek.reference)
                    applyAdaptiveTextSize(views, R.id.next_week_content, R.id.next_week_lesson, R.id.next_week_reference, widgetData.nextWeek.content.length)
                } else {
                    views.setTextViewText(R.id.next_week_lesson, "")
                    views.setTextViewText(R.id.next_week_content, "데이터 없음")
                    views.setTextViewText(R.id.next_week_reference, "")
                }
            }
        }

        /**
         * 전체 모드: 유치부 / 초등부 / 중고등부 이번 주
         */
        private fun updateAllMode(context: Context, views: RemoteViews) {
            views.setTextViewText(R.id.widget_title_large, "이번 주 암송")

            val departments = listOf(
                Triple("kindergarten", "유치부", "#E91E63"),
                Triple("elementary", "초등부", "#1976D2"),
                Triple("youth", "중고등부", "#388E3C")
            )

            val sectionIds = listOf(
                Triple(R.id.last_week_label, R.id.last_week_lesson, Triple(R.id.last_week_content, R.id.last_week_reference, 0)),
                Triple(R.id.this_week_label, R.id.this_week_lesson, Triple(R.id.this_week_content, R.id.this_week_reference, 0)),
                Triple(R.id.next_week_label, R.id.next_week_lesson, Triple(R.id.next_week_content, R.id.next_week_reference, 0))
            )

            for (i in departments.indices) {
                val (group, label, _) = departments[i]
                val (labelId, lessonId, contentIds) = sectionIds[i]
                val (contentId, referenceId, _) = contentIds

                val widgetData = getWidgetData(context, group)

                views.setTextViewText(labelId, label)

                if (widgetData?.thisWeek != null) {
                    views.setTextViewText(lessonId, widgetData.thisWeek.lessonName)
                    views.setTextViewText(contentId, "\"${widgetData.thisWeek.content}\"")
                    views.setTextViewText(referenceId, widgetData.thisWeek.reference)
                    applyAdaptiveTextSize(views, contentId, lessonId, referenceId, widgetData.thisWeek.content.length)
                } else {
                    views.setTextViewText(lessonId, "")
                    views.setTextViewText(contentId, "데이터 없음")
                    views.setTextViewText(referenceId, "")
                }
            }
        }

        /**
         * 글자 수 기반 동적 폰트 크기 (4x5 위젯 섹션용)
         * 4x5 위젯은 3개 섹션으로 나뉘므로 4x2보다 보수적인 크기
         * | 글자 수   | content | lesson | reference | maxLines |
         * |----------|---------|--------|-----------|----------|
         * | ≤ 30     | 14sp    | 15sp   | 11sp      | 3        |
         * | 31~60    | 13sp    | 14sp   | 11sp      | 4        |
         * | 61~100   | 12sp    | 13sp   | 10sp      | 5        |
         * | 101~150  | 11sp    | 12sp   | 10sp      | 6        |
         * | 151+     | 10sp    | 11sp   | 10sp      | 7        |
         */
        private fun applyAdaptiveTextSize(
            views: RemoteViews,
            contentId: Int,
            lessonId: Int,
            referenceId: Int,
            contentLength: Int
        ) {
            var contentSp = 10f
            var lessonSp = 11f
            var refSp = 10f
            var maxLines = 7

            when {
                contentLength <= 30  -> { contentSp = 14f; lessonSp = 15f; refSp = 11f; maxLines = 3 }
                contentLength <= 60  -> { contentSp = 13f; lessonSp = 14f; refSp = 11f; maxLines = 4 }
                contentLength <= 100 -> { contentSp = 12f; lessonSp = 13f; refSp = 10f; maxLines = 5 }
                contentLength <= 150 -> { contentSp = 11f; lessonSp = 12f; refSp = 10f; maxLines = 6 }
            }

            views.setTextViewTextSize(contentId, TypedValue.COMPLEX_UNIT_SP, contentSp)
            views.setTextViewTextSize(lessonId, TypedValue.COMPLEX_UNIT_SP, lessonSp)
            views.setTextViewTextSize(referenceId, TypedValue.COMPLEX_UNIT_SP, refSp)
            views.setInt(contentId, "setMaxLines", maxLines)
        }

        private fun getWidgetData(context: Context, ageGroup: String): WidgetData? {
            val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
            val key = "widget_data_$ageGroup"
            val jsonData = prefs.getString(key, null) ?: return null

            return try {
                val json = org.json.JSONObject(jsonData)

                val lastWeek = json.optJSONObject("lastWeek")?.let {
                    VerseData(
                        lessonName = it.optString("lessonName", ""),
                        content = it.optString("content", ""),
                        reference = it.optString("reference", ""),
                        date = it.optString("date", "")
                    )
                }

                val thisWeek = json.optJSONObject("thisWeek")?.let {
                    VerseData(
                        lessonName = it.optString("lessonName", ""),
                        content = it.optString("content", ""),
                        reference = it.optString("reference", ""),
                        date = it.optString("date", "")
                    )
                }

                val nextWeek = json.optJSONObject("nextWeek")?.let {
                    VerseData(
                        lessonName = it.optString("lessonName", ""),
                        content = it.optString("content", ""),
                        reference = it.optString("reference", ""),
                        date = it.optString("date", "")
                    )
                }

                WidgetData(lastWeek, thisWeek, nextWeek)
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }

    data class VerseData(
        val lessonName: String,
        val content: String,
        val reference: String,
        val date: String
    )

    data class WidgetData(
        val lastWeek: VerseData?,
        val thisWeek: VerseData?,
        val nextWeek: VerseData?
    )
}
