import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";

export default function Index() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAppStore();

  const isFullyVerified =
    user?.isVerified === true ||
    (user?.isEmailVerified === true && user?.isPhoneVerified === true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated) {
      if (isFullyVerified) {
        router.replace("/(app)/(tabs)/home");
      } else {
        router.replace("/(auth)/otp");
      }
    } else {
      router.replace("/(auth)/login");
    }
  }, [hasHydrated, isAuthenticated, isFullyVerified]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00A3E0" }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}

