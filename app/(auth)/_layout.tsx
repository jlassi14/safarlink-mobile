import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAppStore } from "@/lib/store";

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated, hasHydrated } = useAppStore();

  const isFullyVerified =
    user?.isVerified === true ||
    (user?.isEmailVerified === true && user?.isPhoneVerified === true);

  useEffect(() => {
    if (!hasHydrated) return;

    const currentScreen = segments[segments.length - 1];

    if (isAuthenticated) {
      if (isFullyVerified) {
        router.replace("/(app)/(tabs)/home");
      } else if (currentScreen !== "otp") {
        router.replace("/(auth)/otp");
      }
    }
  }, [hasHydrated, isAuthenticated, isFullyVerified, segments]);

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
