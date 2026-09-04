import React, { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";

export default function AppLayout() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAppStore();

  const isFullyVerified =
    user?.isVerified === true ||
    (user?.isEmailVerified === true && user?.isPhoneVerified === true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    } else if (!isFullyVerified) {
      router.replace("/(auth)/otp");
    }
  }, [hasHydrated, isAuthenticated, isFullyVerified]);

  return <Slot />;
}
