package com.church.memory.app.widget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import android.view.View
import com.church.memory.app.R

/**
 * 위젯 부서 선택 Configuration Activity
 * 위젯 추가 시 유치부/초등부/중고등부/전체 중 선택
 */
class WidgetConfigActivity : Activity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setResult(RESULT_CANCELED)

        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        setContentView(R.layout.widget_config)

        findViewById<View>(R.id.btn_kindergarten).setOnClickListener {
            selectAgeGroup("kindergarten")
        }

        findViewById<View>(R.id.btn_elementary).setOnClickListener {
            selectAgeGroup("elementary")
        }

        findViewById<View>(R.id.btn_youth).setOnClickListener {
            selectAgeGroup("youth")
        }
    }

    private fun selectAgeGroup(ageGroup: String) {
        val prefs = getSharedPreferences("widget_config", MODE_PRIVATE)
        prefs.edit()
            .putString("widget_${appWidgetId}_age_group", ageGroup)
            .apply()

        val appWidgetManager = AppWidgetManager.getInstance(this)

        // 위젯 ID로 소유 Provider를 판별하여 해당 Provider만 업데이트
        val widgetInfo = appWidgetManager.getAppWidgetInfo(appWidgetId)
        val providerName = widgetInfo?.provider?.className ?: ""

        if (providerName.contains("VerseLargeWidgetProvider")) {
            VerseLargeWidgetProvider.updateAppWidget(this, appWidgetManager, appWidgetId)
        } else {
            VerseWidgetProvider.updateAppWidget(this, appWidgetManager, appWidgetId)
        }

        val resultValue = Intent().apply {
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        setResult(RESULT_OK, resultValue)
        finish()
    }
}
