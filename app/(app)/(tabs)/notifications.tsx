import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
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
  Gift,
  Users,
  Sparkles,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  notificationApi,
  BackendNotificationItem,
  NotificationType,
} from "@/lib/api";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsList, setNotificationsList] = useState<BackendNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationApi.getNotifications(1, 50);
      if (response?.data?.success && response.data.data) {
        setNotificationsList(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("[Notifications] Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error("[Notifications] Mark all read error:", err);
    }
  };

  const handleNotificationPress = async (item: BackendNotificationItem) => {
    // 1. Mark as read locally and on server
    if (!item.isRead) {
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      notificationApi.markAsRead(item.id).catch(() => {});
    }

    // 2. Navigation based on notification type
    if (item.type === "REFERRAL_REWARD" || item.type === "REFERRAL_SIGNUP") {
      router.push("/(app)/referral");
    } else if (item.targetId) {
      router.push({
        pathname: "/(app)/offer-details",
        params: { offerId: item.targetId },
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const deletedItem = notificationsList.find((n) => n.id === id);
      setNotificationsList((prev) => prev.filter((n) => n.id !== id));
      if (deletedItem && !deletedItem.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error("[Notifications] Delete error:", err);
    }
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "REFERRAL_REWARD":
        return <Gift size={18} color="#10B981" />;
      case "REFERRAL_SIGNUP":
        return <Users size={18} color="#0284C7" />;
      case "DEMAND_RECEIVED":
        return <Package size={18} color="#2563EB" />;
      case "REQUEST_ACCEPTED":
        return <CheckCircle2 size={18} color="#059669" />;
      case "REQUEST_REJECTED":
        return <XCircle size={18} color="#DC2626" />;
      case "SYSTEM":
      default:
        return <Bell size={18} color="#6366F1" />;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return language === "ar" ? "الآن" : "À l'instant";
      if (diffMins < 60) return language === "ar" ? `منذ ${diffMins} د` : `${diffMins} min`;
      if (diffHours < 24) return language === "ar" ? `منذ ${diffHours} س` : `${diffHours} h`;
      if (diffDays === 1) return language === "ar" ? "أمس" : "Hier";
      if (diffDays < 7) return language === "ar" ? `منذ ${diffDays} أيام` : `${diffDays} j`;

      return date.toLocaleDateString(language === "ar" ? "ar-TN" : language === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return createdAt;
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

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
              colors={["#2563EB"]}
            />
          }
        >
          {/* Notifications List */}
          <View style={styles.listContainer}>
            {notificationsList.length > 0 ? (
              notificationsList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    darkMode && styles.notifCardDark,
                    !item.isRead && styles.notifCardUnread,
                    !item.isRead && darkMode && styles.notifCardUnreadDark,
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.8}
                >
                  {!item.isRead && <View style={styles.unreadDot} />}

                  <View style={styles.iconContainer}>
                    <View style={[styles.typeIconBox, darkMode && styles.typeIconBoxDark]}>
                      {getNotifIcon(item.type)}
                    </View>
                  </View>

                  <View style={styles.contentBody}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.notifTitle, darkMode && styles.textDark]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatNotificationTime(item.createdAt)}
                      </Text>
                    </View>

                    <Text style={styles.notifBodyText} numberOfLines={2}>
                      {item.message}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteNotification(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={14} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Bell size={42} color="#9CA3AF" style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyText, darkMode && styles.textDark]}>
                  {t("noNotificationsYet", language)}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  unreadBadgePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  markReadBtnDark: {
    backgroundColor: "#374151",
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    position: "relative",
  },
  notifCardDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  notifCardUnread: {
    backgroundColor: "#F0F7FF",
    borderColor: "#BFDBFE",
  },
  notifCardUnreadDark: {
    backgroundColor: "#1E2A4A",
    borderColor: "#1E3A8A",
  },
  unreadDot: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
  },
  iconContainer: {
    marginRight: 12,
  },
  typeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconBoxDark: {
    backgroundColor: "#374151",
  },
  contentBody: {
    flex: 1,
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
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  notifBodyText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  textDark: {
    color: "#F9FAFB",
  },
});
