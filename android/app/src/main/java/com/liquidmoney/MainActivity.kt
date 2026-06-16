package com.liquidmoney

import android.os.Bundle
import android.os.Build
import android.view.WindowManager
import android.view.Surface
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
  }

  override fun onResume() {
    super.onResume()

    // Can thiệp sâu phần cứng (Deep Hardware Override: 120Hz/144Hz)
    // Thực thi ở onResume để đảm bảo RN không reset lại cài đặt khi reload màn hình
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        // Lớp 2: Android 11+ dùng setFrameRate siêu mượt, không gây lỗi GPU scale
        window.decorView.post {
            window.setFrameRate(144f, Surface.FRAME_RATE_COMPATIBILITY_DEFAULT)
        }
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        // Lớp 3: Android 6-10 dùng preferredDisplayModeId nhưng có Khóa Độ Phân Giải
        val display = windowManager.defaultDisplay
        val currentMode = display.mode
        val supportedModes = display.supportedModes
        var maxRefreshRate = currentMode.refreshRate
        var preferredModeId = currentMode.modeId
        
        for (mode in supportedModes) {
            // Rất quan trọng: Chỉ chọn chế độ có CÙNG độ phân giải để chống GPU bị "lú" (Stuttering)
            if (mode.physicalWidth == currentMode.physicalWidth && 
                mode.physicalHeight == currentMode.physicalHeight && 
                mode.refreshRate > maxRefreshRate) {
                
                maxRefreshRate = mode.refreshRate
                preferredModeId = mode.modeId
            }
        }
        
        if (preferredModeId != currentMode.modeId) {
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
