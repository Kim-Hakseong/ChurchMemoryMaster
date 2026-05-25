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
 * 암송 구절 위젯 Provider (Medium 4x2)
 * 단일 부서 전용: 이번 주 암송만 표시
 */
class VerseWidgetProvider : AppWidgetProvider() {

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
        const val ACTION_REFRESH = "com.church.memory.app.widget.REFRESH_MEDIUM"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences("widget_config", Context.MODE_PRIVATE)
            var ageGroup = prefs.getString("widget_${appWidgetId}_age_group", "kindergarten") ?: "kindergarten"

            // 4x2 위젯은 단일 부서만 지원 ("all" → 유치부 fallback)
            if (ageGroup == "all") ageGroup = "kindergarten"

            val views = RemoteViews(context.packageName, R.layout.widget_medium)

            val widgetData = getWidgetData(context, ageGroup)

            val title = when (ageGroup) {
                "kindergarten" -> "유치부"
                "elementary" -> "초등부"
                "youth" -> "중고등부"
                else -> "유치부"
            }

            views.setTextViewText(R.id.widget_title, "$title · 이번 주")

            if (widgetData != null) {
                views.setTextViewText(R.id.widget_lesson_name, widgetData.lessonName)
                views.setTextViewText(R.id.widget_content, "\"${widgetData.content}\"")
                views.setTextViewText(R.id.widget_reference, widgetData.reference)

                // 글자 수 기반 동적 폰트 크기 적용
                applyAdaptiveTextSize(views, widgetData.content.length)
            } else {
                views.setTextViewText(R.id.widget_lesson_name, "데이터 없음")
                views.setTextViewText(R.id.widget_content, "앱에서 데이터를 불러와주세요")
                views.setTextViewText(R.id.widget_reference, "")
            }

            // 앱 열기 Intent (CLEAR_TOP으로 기존 화면 재사용, CLEAR_TASK 사용 시 위젯 확대 유발)
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("open_tab", ageGroup)
            }
            val pendingIntent = PendingIntent.getActivity(
                context, appWidgetId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // 새로고침 Intent (커스텀 액션으로 Toast 표시)
            val refreshIntent = Intent(context, VerseWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, intArrayOf(appWidgetId))
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context, appWidgetId, refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_refresh, refreshPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * 글자 수 기반 동적 폰트 크기 (4x2 위젯용)
         * | 글자 수   | content | lesson | reference | maxLines |
         * |----------|---------|--------|-----------|----------|
         * | ≤ 20     | 18sp    | 16sp   | 13sp      | 3        |
         * | 21~40    | 16sp    | 15sp   | 12sp      | 3        |
         * | 41~70    | 15sp    | 14sp   | 12sp      | 4        |
         * | 71~110   | 14sp    | 14sp   | 11sp      | 5        |
         * | 111~150  | 13sp    | 13sp   | 11sp      | 6        |
         * | 151+     | 12sp    | 12sp   | 11sp      | 7        |
         */
        private fun applyAdaptiveTextSize(views: RemoteViews, contentLength: Int) {
            var contentSp = 12f
            var lessonSp = 12f
            var refSp = 11f
            var maxLines = 7

            when {
                contentLength <= 20  -> { contentSp = 18f; lessonSp = 16f; refSp = 13f; maxLines = 3 }
                contentLength <= 40  -> { contentSp = 16f; lessonSp = 15f; refSp = 12f; maxLines = 3 }
                contentLength <= 70  -> { contentSp = 15f; lessonSp = 14f; refSp = 12f; maxLines = 4 }
                contentLength <= 110 -> { contentSp = 14f; lessonSp = 14f; refSp = 11f; maxLines = 5 }
                contentLength <= 150 -> { contentSp = 13f; lessonSp = 13f; refSp = 11f; maxLines = 6 }
            }

            views.setTextViewTextSize(R.id.widget_content, TypedValue.COMPLEX_UNIT_SP, contentSp)
            views.setTextViewTextSize(R.id.widget_lesson_name, TypedValue.COMPLEX_UNIT_SP, lessonSp)
            views.setTextViewTextSize(R.id.widget_reference, TypedValue.COMPLEX_UNIT_SP, refSp)
            views.setInt(R.id.widget_content, "setMaxLines", maxLines)
        }

        private fun getWidgetData(context: Context, ageGroup: String): WidgetVerseData? {
            val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
            val key = "widget_data_$ageGroup"
            val jsonData = prefs.getString(key, null) ?: return null

            return try {
                val json = org.json.JSONObject(jsonData)
                val thisWeek = json.optJSONObject("thisWeek") ?: return null

                WidgetVerseData(
                    lessonName = thisWeek.optString("lessonName", ""),
                    content = thisWeek.optString("content", ""),
                    reference = thisWeek.optString("reference", ""),
                    date = thisWeek.optString("date", "")
                )
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }

    data class WidgetVerseData(
        val lessonName: String,
        val content: String,
        val reference: String,
        val date: String
    )
}
