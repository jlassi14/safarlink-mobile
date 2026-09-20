import {
  getMessaging,
  requestPermission,
  getToken,
  hasPermission,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
  AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { Platform, Alert, PermissionsAndroid, Linking } from "react-native";
import { router } from "expo-router";
import { notificationApi } from "./api";
import { useAppStore } from "./store";
import { showInAppBanner } from "@/components/InAppNotificationBanner";

import { handleNotificationNavigation } from "./notificationNavigation";
export { handleNotificationNavigation };

// Register background message handler
try {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log("[FCM] Background push notification received:", remoteMessage);
  });
} catch (e) {
  // Ignore in environments where messaging isn't ready
}

/**
 * Requests notification permissions and registers FCM push token with SafarLink backend.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    const messaging = getMessaging();

    // 1. Request user permission (iOS and Android 13+)
    const authStatus = await requestPermission(messaging, {
      alert: true,
      badge: true,
      sound: true,
    });

    const isAuthorized =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!isAuthorized) {
      console.log("[FCM] Push notification permission not granted. Status:", authStatus);
      return null;
    }

    // 2. Ensure device is registered for remote messages (iOS)
    if (Platform.OS === "ios" && !isDeviceRegisteredForRemoteMessages(messaging)) {
      await registerDeviceForRemoteMessages(messaging);
    }

    // 3. Obtain Firebase Cloud Messaging Token
    const fcmToken = await getToken(messaging);
    if (!fcmToken) {
      console.warn("[FCM] Failed to retrieve device FCM token");
      return null;
    }

    console.log("\n========================================================");
    console.log("🔥 [FCM FULL DEVICE TOKEN] 🔥 (Copy to test in Firebase):");
    console.log(fcmToken);
    console.log("========================================================\n");

    // 4. Send token to backend
    await notificationApi.registerPushToken(fcmToken);
    console.log("[FCM] Token registered with SafarLink backend successfully");

    return fcmToken;
  } catch (error) {
    console.error("[FCM] Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Checks whether push notification permission is granted on Android or iOS.
 */
export async function checkNotificationPermissionAsync(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      return true;
    }

    if (Platform.OS === "ios") {
      const messaging = getMessaging();
      const status = await hasPermission(messaging);
      return (
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL
      );
    }

    return true;
  } catch (err) {
    console.warn("[FCM] Error checking notification permission:", err);
    return false;
  }
}

/**
 * Requests push notification permission or opens phone App Settings if blocked/denied.
 */
export async function requestOrOpenNotificationSettings(): Promise<boolean> {
  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        await registerForPushNotificationsAsync();
        return true;
      }
      // If user selected "Don't ask again" or denied, open system Settings
      await Linking.openSettings();
      return false;
    }

    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging, {
      alert: true,
      badge: true,
      sound: true,
    });

    const isAuthorized =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (isAuthorized) {
      await registerForPushNotificationsAsync();
      return true;
    }

    await Linking.openSettings();
    return false;
  } catch (err) {
    console.warn("[FCM] Error requesting permission:", err);
    await Linking.openSettings().catch(() => {});
    return false;
  }
}

/**
 * Initializes listeners for foreground, background, and quit-state push notifications.
 * Returns an unsubscribe function.
 */
export function setupPushNotificationListeners() {
  try {
    const messaging = getMessaging();

    // 1. Listen for token refresh and sync with backend
    const unsubscribeTokenRefresh = onTokenRefresh(messaging, async (newToken) => {
      console.log("[FCM] Token refreshed:", newToken.substring(0, 15) + "...");
      try {
        await notificationApi.registerPushToken(newToken);
      } catch (err) {
        console.error("[FCM] Error syncing refreshed token:", err);
      }
    });

    // 2. Handle foreground push notification with sleek floating banner
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      console.log("[FCM] Foreground notification received:", remoteMessage);

      const title =
        remoteMessage.notification?.title ||
        (remoteMessage.data?.title as string) ||
        "SafarLink";
      const body =
        remoteMessage.notification?.body ||
        (remoteMessage.data?.body as string) ||
        (remoteMessage.data?.message as string) ||
        "";

      if (title || body) {
        showInAppBanner({
          title,
          body,
          data: remoteMessage.data,
        });

        // Immediately increment unread badge count for real-time red dot on tabs
        try {
          const currentCount = useAppStore.getState().unreadNotificationCount || 0;
          useAppStore.getState().setUnreadNotificationCount(currentCount + 1);
        } catch {}
      }
    });

    // 3. Handle notification tap when app is running in background
    const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
      messaging,
      (remoteMessage) => {
        console.log("[FCM] Notification opened from background:", remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      }
    );

    // 4. Handle notification tap that opened app from quit/dead state
    getInitialNotification(messaging)
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("[FCM] App opened from quit state via notification:", remoteMessage);
          handleNotificationNavigation(remoteMessage.data);
        }
      })
      .catch((err) => {
        console.warn("[FCM] Error getting initial notification:", err);
      });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  } catch (err) {
    console.error("[FCM] Error setting up listeners:", err);
    return () => {};
  }
}

/**
 * Unregisters the push token from SafarLink backend upon user logout.
 */
export async function unregisterPushNotificationAsync() {
  try {
    await notificationApi.removePushToken();
    console.log("[FCM] Push token unregistered successfully on logout");
  } catch (err) {
    console.warn("[FCM] Notice: failed to remove push token on logout:", err);
  }
}
