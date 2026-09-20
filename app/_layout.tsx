import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import {
  registerForPushNotificationsAsync,
  setupPushNotificationListeners,
} from "@/lib/notifications";
import InAppNotificationBanner from "@/components/InAppNotificationBanner";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";

// Intercept browser auth redirects for PayPal
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const darkMode = useAppStore((state) => state.darkMode);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const backgroundColor = darkMode ? colors.background.dark : colors.background.light;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = setupPushNotificationListeners();

    if (hasHydrated && isAuthenticated) {
      registerForPushNotificationsAsync().catch(() => {});
    }

    return () => {
      unsubscribe();
    };
  }, [hasHydrated, isAuthenticated]);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: backgroundColor,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="paypal-return" options={{ headerShown: false }} />
      </Stack>
      <InAppNotificationBanner />
      <NotificationPermissionModal />
      <StatusBar style={darkMode ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}
