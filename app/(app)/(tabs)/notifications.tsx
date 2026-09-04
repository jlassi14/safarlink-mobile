import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import {
  Bell,
  CheckCheck,
  Package,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { MOCK_NOTIFICATIONS, NotificationItem } from "@/lib/constants";

export { type NotificationItem };

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;

  // Notifications State (exclusively 2 types: Demands & Package Requests)
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    // Mark as read
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    // Navigate to offer details if targetId exists
    if (item.targetId) {
      router.push({
        pathname: "/(app)/offer-details",
        params: { offerId: item.targetId },
      });
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotifIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "demand_received":
        return <Package size={18} color="#2563EB" />;
      case "request_accepted":
        return <CheckCircle2 size={18} color="#059669" />;
      case "request_rejected":
        return <XCircle size={18} color="#DC2626" />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Screen Header */}
      <View style={[styles.header, darkMode && styles.headerDark, { paddingTop: topPadding }]}>
        <View style={styles.headerLeftGroup}>
          <Bell size={22} color="#2563EB" />
          <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
            {t("notifications", language)}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadgePill}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount} {t("newNotificationsBadge", language)}
              </Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markReadBtn, darkMode && styles.markReadBtnDark]}
            onPress={handleMarkAllRead}
            activeOpacity={0.8}
          >
            <CheckCheck size={16} color="#2563EB" />
            <Text style={styles.markReadText}>
              {t("markAllRead", language)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notifications List (Demands & Requests) */}
        <View style={styles.listContainer}>
          {notificationsList.length > 0 ? (
            notificationsList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notifCard,
                  darkMode && styles.notifCardDark,
                  !item.read && styles.notifCardUnread,
                  !item.read && darkMode && styles.notifCardUnreadDark,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.8}
              >
                {!item.read && <View style={styles.unreadDot} />}

                <View style={styles.iconContainer}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.typeIconBox, darkMode && styles.typeIconBoxDark]}>
                      {getNotifIcon(item.type)}
                    </View>
                  )}
                </View>

                <View style={styles.contentBody}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, darkMode && styles.textDark]} numberOfLines={1}>
                      {item.titleKey ? t(item.titleKey, language) : (language === "ar" ? item.titleAr : language === "fr" ? (item.titleFr || item.titleEn) : item.titleEn)}
                    </Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>

                  <Text style={styles.notifBodyText} numberOfLines={2}>
                    {item.bodyKey ? t(item.bodyKey, language) : (language === "ar" ? item.bodyAr : language === "fr" ? (item.bodyFr || item.bodyEn) : item.bodyEn)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteNotification(item.id)}
                >
                  <Trash2 size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Bell size={40} color="#9CA3AF" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>
                {t("noNotificationsYet", language)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  safeAreaDark: {
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerDark: {
    backgroundColor: "#1F2937",
    borderBottomColor: "#374151",
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
  },
  unreadBadgePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  markReadBtnDark: {
    backgroundColor: "#374151",
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  textDark: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
  },
  listContainer: {
    gap: 10,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  notifCardDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  notifCardUnread: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  notifCardUnreadDark: {
    backgroundColor: "#1E293B",
    borderColor: "#2563EB",
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  iconContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  typeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconBoxDark: {
    backgroundColor: "#374151",
  },
  contentBody: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  notifBodyText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
