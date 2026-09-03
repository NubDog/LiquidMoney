/**
 * WidgetBridge.ts — Native Module interface for Android Widget and Overlay Activity
 */

import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

/**
 * Closes the transparent overlay activity when transaction is saved or user cancels
 */
export const closeOverlayActivity = (): void => {
    if (Platform.OS === 'android' && WidgetBridge?.closeOverlayActivity) {
        WidgetBridge.closeOverlayActivity();
    }
};

/**
 * Triggers an update broadcast to Android Home Screen widget
 */
export const updateWidget = (): void => {
    if (Platform.OS === 'android' && WidgetBridge?.updateWidget) {
        WidgetBridge.updateWidget();
    }
};
