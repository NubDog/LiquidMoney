package com.liquidmoney.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.SizeF
import android.widget.RemoteViews
import com.liquidmoney.R
import com.liquidmoney.TransparentOverlayActivity

class QuickTransactionWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle?
    ) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
        updateAppWidget(context, appWidgetManager, appWidgetId)
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val pendingIntent = createLaunchPendingIntent(context)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+ Responsive Layouts
                val viewsMap = mapOf(
                    SizeF(80f, 40f) to buildRemoteViews(context, R.layout.widget_quick_transaction, pendingIntent),
                    SizeF(220f, 40f) to buildRemoteViews(context, R.layout.widget_quick_transaction_wide, pendingIntent),
                    SizeF(80f, 85f) to buildRemoteViews(context, R.layout.widget_quick_transaction_tall, pendingIntent),
                    SizeF(220f, 85f) to buildRemoteViews(context, R.layout.widget_quick_transaction_large, pendingIntent)
                )
                val views = RemoteViews(viewsMap)
                appWidgetManager.updateAppWidget(appWidgetId, views)
            } else {
                // Fallback for Android 11 and below based on current widget options
                val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
                val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
                val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)

                val isTall = minHeight >= 80
                val isWide = minWidth >= 220

                val layoutId = when {
                    isTall && isWide -> R.layout.widget_quick_transaction_large
                    isTall -> R.layout.widget_quick_transaction_tall
                    isWide -> R.layout.widget_quick_transaction_wide
                    else -> R.layout.widget_quick_transaction
                }

                val views = buildRemoteViews(context, layoutId, pendingIntent)
                appWidgetManager.updateAppWidget(appWidgetId, views)
            }
        }

        private fun createLaunchPendingIntent(context: Context): PendingIntent {
            val intent = Intent(context, TransparentOverlayActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            return PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        private fun buildRemoteViews(
            context: Context,
            layoutId: Int,
            pendingIntent: PendingIntent
        ): RemoteViews {
            val views = RemoteViews(context.packageName, layoutId)
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            try {
                views.setOnClickPendingIntent(R.id.btn_add_transaction, pendingIntent)
            } catch (_: Exception) {}
            return views
        }
    }
}
