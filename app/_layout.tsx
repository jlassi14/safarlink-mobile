import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  const darkMode = useAppStore((state) => state.darkMode);
  const backgroundColor = darkMode ? colors.background.dark : colors.background.light;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

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
      </Stack>
      <StatusBar style={darkMode ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}
