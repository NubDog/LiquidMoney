package com.liquidmoney

import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Ép Android chạy ở mức 120Hz (hoặc cao nhất có thể) mà không cần cấu hình Game Booster
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val displayManager = windowManager.defaultDisplay
        val modes = displayManager.supportedModes
        
        // Tìm Mode 120Hz (hoặc gần 120Hz nhất)
        val mode120 = modes.minByOrNull { Math.abs(it.refreshRate - 120f) }
        
        if (mode120 != null) {
            window.attributes = window.attributes.apply {
                preferredDisplayModeId = mode120.modeId
            }
        }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "LiquidMoney"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
