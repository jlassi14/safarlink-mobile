import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Home, Tag, PlusCircle, Package, User, Bell } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { notificationApi } from "@/lib/api";

export default function TabsLayout() {
  const language = useAppStore((state) => state.language);
  const darkMode = useAppStore((state) => state.darkMode);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const unreadNotificationCount = useAppStore((state) => state.unreadNotificationCount);
  const setUnreadNotificationCount = useAppStore((state) => state.setUnreadNotificationCount);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi
        .getUnreadCount()
        .then((res) => {
          if (res?.data?.success && typeof res.data.data?.unreadCount === "number") {
            setUnreadNotificationCount(res.data.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, setUnreadNotificationCount]);

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: darkMode ? "#9CA3AF" : "#6B7280",
        tabBarStyle: {
          backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: darkMode ? "#374151" : "#F3F4F6",
          height: 54 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("home", language),
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: language === "ar" ? "العروض" : language === "fr" ? "Offres" : "Offers",
          tabBarIcon: ({ color, size }) => <Tag size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t("create", language),
          tabBarIcon: () => (
            <View style={styles.createTabBadge}>
              <PlusCircle size={24} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: language === "ar" ? "الطلبات" : language === "fr" ? "Demandes" : "Requests",
          tabBarIcon: ({ color, size }) => <Package size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t("notifications", language),
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: "relative" }}>
              <Bell size={size || 22} color={color} />
              {unreadNotificationCount > 0 && (
                <View style={styles.tabUnreadBadgeDot} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createTabBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabUnreadBadgeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
});
