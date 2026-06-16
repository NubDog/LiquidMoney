package com.liquidmoney

import android.view.Choreographer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class FPSMonitorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener, Choreographer.FrameCallback {

    private var isTracking = false
    private var lastFrameTimeNanos: Long = 0
    private var lastReportTime: Long = 0
    private var frameCount = 0

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "FPSMonitor"
    }

    override fun onHostResume() {
        startTracking()
    }

    override fun onHostPause() {
        stopTracking()
    }

    override fun onHostDestroy() {
        stopTracking()
    }

    private fun startTracking() {
        if (!isTracking) {
            isTracking = true
            lastFrameTimeNanos = 0
            lastReportTime = 0
            frameCount = 0
            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    private fun stopTracking() {
        if (isTracking) {
            isTracking = false
            Choreographer.getInstance().removeFrameCallback(this)
        }
    }

    override fun doFrame(frameTimeNanos: Long) {
        if (!isTracking) return

        if (lastFrameTimeNanos != 0L) {
            frameCount++
            val timeDiffNanos = frameTimeNanos - lastReportTime
            
            // Cập nhật FPS mỗi 500ms
            if (timeDiffNanos >= 500_000_000L) {
                val fps = (frameCount * 1_000_000_000L / timeDiffNanos).toInt()
                sendEvent("onFPSUpdate", fps)
                
                frameCount = 0
                lastReportTime = frameTimeNanos
            }
        } else {
            lastReportTime = frameTimeNanos
        }
        
        lastFrameTimeNanos = frameTimeNanos
        Choreographer.getInstance().postFrameCallback(this)
    }

    private fun sendEvent(eventName: String, fps: Int) {
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, fps)
        }
    }
}
