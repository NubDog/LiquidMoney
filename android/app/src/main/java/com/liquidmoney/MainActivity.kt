package com.liquidmoney

import android.os.Bundle
import android.os.Build
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Ép xung màn hình (Force High Refresh Rate: 90Hz/120Hz/144Hz)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val display = windowManager.defaultDisplay
        val supportedModes = display.supportedModes
        var maxRefreshRate = 0f
        var preferredModeId = 0
        
        for (mode in supportedModes) {
            if (mode.refreshRate > maxRefreshRate) {
                maxRefreshRate = mode.refreshRate
                preferredModeId = mode.modeId
            }
        }
        
        if (preferredModeId != 0) {
            val layoutParams = window.attributes
            layoutParams.preferredDisplayModeId = preferredModeId
            window.attributes = layoutParams
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
