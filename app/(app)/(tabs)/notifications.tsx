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
  ShieldCheck,
  Clock,
  AlertTriangle,
  Plane,
  Lock,
  CreditCard,
  RotateCcw,
  BellOff,
  ChevronRight,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  notificationApi,
  BackendNotificationItem,
  NotificationType,
} from "@/lib/api";
import { checkNotificationPermissionAsync } from "@/lib/notifications";
import { triggerNotificationPermissionPrompt } from "@/components/NotificationPermissionModal";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode, setUnreadNotificationCount } = useAppStore();

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsList, setNotificationsList] = useState<BackendNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      checkNotificationPermissionAsync().then((granted) => {
        setIsPermissionGranted(granted);
      });
      const response = await notificationApi.getNotifications(1, 50);
      if (response?.data?.success && response.data.data) {
        setNotificationsList(response.data.data.notifications || []);
        const unread = response.data.data.unreadCount || 0;
        setUnreadCount(unread);
        setUnreadNotificationCount(unread);
      }
    } catch (err) {
      console.error("[Notifications] Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setUnreadNotificationCount]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setUnreadNotificationCount(0);
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
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        setUnreadNotificationCount(next);
        return next;
      });
      notificationApi.markAsRead(item.id).catch(() => {});
    }

    // 2. Navigation based on notification type
    if (item.type === "REFERRAL_REWARD" || item.type === "REFERRAL_SIGNUP") {
      router.push("/(app)/referral");
      return;
    }

    if (item.type === "ACCOUNT_VERIFIED") {
      router.push("/(app)/(tabs)/profile");
      return;
    }

    // 3. Demand & Proposal Notifications -> Navigate to Requests screen
    const isDemandRelated =
      item.type === "DEMAND_RECEIVED" ||
      item.type === "REQUEST_ACCEPTED" ||
      item.type === "REQUEST_REJECTED" ||
      item.type === "PROPOSAL_CANCELLED" ||
      item.title.toLowerCase().includes("proposition") ||
      item.title.toLowerCase().includes("proposal") ||
      item.title.toLowerCase().includes("colis") ||
      item.title.toLowerCase().includes("demande") ||
      item.title.toLowerCase().includes("شحنة") ||
      item.title.toLowerCase().includes("طلب") ||
      item.message.toLowerCase().includes("colis") ||
      item.message.toLowerCase().includes("proposition") ||
      item.message.toLowerCase().includes("demande");

    if (isDemandRelated) {
      const isApplicant =
        item.type === "REQUEST_ACCEPTED" ||
        item.type === "REQUEST_REJECTED" ||
        item.message.toLowerCase().includes("votre proposition") ||
        item.message.toLowerCase().includes("your proposal");

      router.push({
        pathname: "/(app)/(tabs)/requests",
        params: {
          mode: isApplicant ? "my_applications" : "my_demands",
          targetId: item.targetId || undefined,
          t: Date.now().toString(),
        },
      });
      return;
    }

    // 4. Booking notifications -> Navigate to Booking Details
    if (
      item.type === "BOOKING_CREATED" ||
      item.type === "BOOKING_ACCEPTED" ||
      item.type === "BOOKING_REJECTED" ||
      item.type === "ACTION_SUBMITTED" ||
      item.type === "BOOKING_COMPLETED" ||
      item.type === "BOOKING_CANCELLED" ||
      item.type === "BOOKING_DISPUTED" ||
      item.type === "PAYMENT_HELD" ||
      item.type === "PAYMENT_RELEASED" ||
      item.type === "PAYMENT_REFUNDED"
    ) {
      if (item.targetId) {
        router.push({
          pathname: "/(app)/booking-details",
          params: { id: item.targetId },
        });
      } else {
        router.push("/(app)/(tabs)/home");
      }
      return;
    }

    // 5. Offer notifications
    if (item.type === "OFFER_FULLY_BOOKED") {
      if (item.targetId) {
        router.push({
          pathname: "/(app)/offer-details",
          params: { offerId: item.targetId, from: "notifications" },
        });
      } else {
        router.push("/(app)/(tabs)/offers");
      }
      return;
    }

    // 6. Safe fallback
    if (item.targetId) {
      router.push({
        pathname: "/(app)/offer-details",
        params: { offerId: item.targetId, from: "notifications" },
      });
    } else {
      router.push("/(app)/(tabs)/home");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const deletedItem = notificationsList.find((n) => n.id === id);
      setNotificationsList((prev) => prev.filter((n) => n.id !== id));
      if (deletedItem && !deletedItem.isRead) {
        setUnreadCount((prev) => {
          const next = Math.max(0, prev - 1);
          setUnreadNotificationCount(next);
          return next;
        });
      }
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error("[Notifications] Delete error:", err);
    }
  };

  const getNotifConfig = (type: NotificationType) => {
    switch (type) {
      case "BOOKING_CREATED":
        return {
          icon: <Package size={18} color="#2563EB" />,
          bg: "#EFF6FF",
          darkBg: "#1E3A8A",
          tag: language === "ar" ? "حجز جديد" : "Réservation",
          tagColor: "#2563EB",
          tagBg: "#DBEAFE",
        };
      case "BOOKING_ACCEPTED":
        return {
          icon: <CheckCircle2 size={18} color="#059669" />,
          bg: "#ECFDF5",
          darkBg: "#064E3B",
          tag: language === "ar" ? "مقبول" : "Acceptée",
          tagColor: "#059669",
          tagBg: "#D1FAE5",
        };
      case "BOOKING_REJECTED":
        return {
          icon: <XCircle size={18} color="#DC2626" />,
          bg: "#FEF2F2",
          darkBg: "#450A0A",
          tag: language === "ar" ? "مرفوض" : "Refusée",
          tagColor: "#DC2626",
          tagBg: "#FEE2E2",
        };
      case "ACTION_SUBMITTED":
        return {
          icon: <Clock size={18} color="#D97706" />,
          bg: "#FFFBEB",
          darkBg: "#451A03",
          tag: language === "ar" ? "إجراء مطلوب" : "Action requise",
          tagColor: "#D97706",
          tagBg: "#FEF3C7",
        };
      case "BOOKING_COMPLETED":
        return {
          icon: <CheckCheck size={18} color="#16A34A" />,
          bg: "#F0FDF4",
          darkBg: "#14532D",
          tag: language === "ar" ? "مكتمل" : "Terminée",
          tagColor: "#16A34A",
          tagBg: "#DCFCE7",
        };
      case "BOOKING_CANCELLED":
        return {
          icon: <XCircle size={18} color="#E11D48" />,
          bg: "#FFF1F2",
          darkBg: "#4C0519",
          tag: language === "ar" ? "ملغى" : "Annulée",
          tagColor: "#E11D48",
          tagBg: "#FFE4E6",
        };
      case "BOOKING_DISPUTED":
        return {
          icon: <AlertTriangle size={18} color="#EA580C" />,
          bg: "#FFF7ED",
          darkBg: "#431407",
          tag: language === "ar" ? "نزاع" : "Litige",
          tagColor: "#EA580C",
          tagBg: "#FFEDD5",
        };
      case "DEMAND_RECEIVED":
        return {
          icon: <Package size={18} color="#0284C7" />,
          bg: "#F0F9FF",
          darkBg: "#0C4A6E",
          tag: language === "ar" ? "طلب" : "Demande",
          tagColor: "#0284C7",
          tagBg: "#E0F2FE",
        };
      case "REQUEST_ACCEPTED":
        return {
          icon: <CheckCircle2 size={18} color="#10B981" />,
          bg: "#ECFDF5",
          darkBg: "#064E3B",
          tag: language === "ar" ? "مقبول" : "Acceptée",
          tagColor: "#10B981",
          tagBg: "#D1FAE5",
        };
      case "REQUEST_REJECTED":
        return {
          icon: <XCircle size={18} color="#EF4444" />,
          bg: "#FEF2F2",
          darkBg: "#7F1D1D",
          tag: language === "ar" ? "مرفوض" : "Refusée",
          tagColor: "#EF4444",
          tagBg: "#FEE2E2",
        };
      case "PROPOSAL_CANCELLED":
        return {
          icon: <XCircle size={18} color="#F43F5E" />,
          bg: "#FFF1F2",
          darkBg: "#881337",
          tag: language === "ar" ? "عرض ملغى" : "Proposition annulée",
          tagColor: "#F43F5E",
          tagBg: "#FFE4E6",
        };
      case "REFERRAL_SIGNUP":
        return {
          icon: <Users size={18} color="#0284C7" />,
          bg: "#F0F9FF",
          darkBg: "#0C4A6E",
          tag: language === "ar" ? "إحالة جديدة" : "Filleul",
          tagColor: "#0284C7",
          tagBg: "#E0F2FE",
        };
      case "REFERRAL_REWARD":
        return {
          icon: <Gift size={18} color="#10B981" />,
          bg: "#ECFDF5",
          darkBg: "#064E3B",
          tag: language === "ar" ? "أرباح إحالة" : "Gains 1%",
          tagColor: "#10B981",
          tagBg: "#D1FAE5",
        };
      case "ACCOUNT_VERIFIED":
        return {
          icon: <ShieldCheck size={18} color="#0D9488" />,
          bg: "#F0FDFA",
          darkBg: "#134E4A",
          tag: language === "ar" ? "حساب موثق" : "Compte vérifié",
          tagColor: "#0D9488",
          tagBg: "#CCFBF1",
        };
      case "OFFER_FULLY_BOOKED":
        return {
          icon: <Plane size={18} color="#6366F1" />,
          bg: "#EEF2FF",
          darkBg: "#312E81",
          tag: language === "ar" ? "رحلة ممتلئة" : "Vol Complet",
          tagColor: "#6366F1",
          tagBg: "#E0E7FF",
        };
      case "PAYMENT_HELD":
        return {
          icon: <Lock size={18} color="#059669" />,
          bg: "#ECFDF5",
          darkBg: "#064E3B",
          tag: language === "ar" ? "ضمان مالي" : "Séquestre",
          tagColor: "#059669",
          tagBg: "#D1FAE5",
        };
      case "PAYMENT_RELEASED":
        return {
          icon: <CreditCard size={18} color="#16A34A" />,
          bg: "#F0FDF4",
          darkBg: "#14532D",
          tag: language === "ar" ? "تم التحويل" : "Paiement viré",
          tagColor: "#16A34A",
          tagBg: "#DCFCE7",
        };
      case "PAYMENT_REFUNDED":
        return {
          icon: <RotateCcw size={18} color="#64748B" />,
          bg: "#F8FAFC",
          darkBg: "#1E293B",
          tag: language === "ar" ? "مسترجع" : "Remboursé",
          tagColor: "#64748B",
          tagBg: "#E2E8F0",
        };
      case "SYSTEM":
      default:
        return {
          icon: <Bell size={18} color="#6366F1" />,
          bg: "#EEF2FF",
          darkBg: "#312E81",
          tag: language === "ar" ? "تنبيه" : "Système",
          tagColor: "#6366F1",
          tagBg: "#E0E7FF",
        };
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
          {/* Permission Deactivated Notice Banner */}
          {!isPermissionGranted && (
            <TouchableOpacity
              style={[styles.permissionNotice, darkMode && styles.permissionNoticeDark]}
              onPress={() => triggerNotificationPermissionPrompt()}
              activeOpacity={0.85}
            >
              <View style={styles.permissionNoticeIconWrap}>
                <BellOff size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permissionNoticeTitle, darkMode && styles.textDark]}>
                  {language === "ar"
                    ? "الإشعارات معطلة على هذا الجهاز"
                    : language === "fr"
                    ? "Notifications désactivées"
                    : "Notifications are disabled"}
                </Text>
                <Text style={styles.permissionNoticeSub}>
                  {language === "ar"
                    ? "اضغط لتفعيل الإشعارات وتلقي الحجوزات والرسائل فوراً."
                    : language === "fr"
                    ? "Touchez ici pour les activer et recevoir vos réservations."
                    : "Tap to enable and receive instant booking alerts."}
                </Text>
              </View>
              <ChevronRight size={18} color={darkMode ? "#9CA3AF" : "#64748B"} />
            </TouchableOpacity>
          )}

          {/* Notifications List */}
          <View style={styles.listContainer}>
            {notificationsList.length > 0 ? (
              notificationsList.map((item) => {
                const config = getNotifConfig(item.type);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.notifCard,
                      darkMode && styles.notifCardDark,
                      !item.isRead && styles.notifCardUnread,
                      !item.isRead && darkMode && styles.notifCardUnreadDark,
                    ]}
                  >
                    {!item.isRead && <View style={styles.unreadDot} />}

                    <TouchableOpacity
                      style={styles.notifMainContent}
                      onPress={() => handleNotificationPress(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainer}>
                        <View
                          style={[
                            styles.typeIconBox,
                            { backgroundColor: darkMode ? config.darkBg : config.bg },
                          ]}
                        >
                          {config.icon}
                        </View>
                      </View>

                      <View style={styles.contentBody}>
                        <View style={styles.titleRow}>
                          <View style={styles.titleWithTag}>
                            <Text
                              style={[styles.notifTitle, darkMode && styles.textDark]}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            <View
                              style={[
                                styles.typeBadge,
                                { backgroundColor: darkMode ? config.darkBg : config.tagBg },
                              ]}
                            >
                              <Text style={[styles.typeBadgeText, { color: config.tagColor }]}>
                                {config.tag}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.timeText}>
                            {formatNotificationTime(item.createdAt)}
                          </Text>
                        </View>

                        <Text style={styles.notifBodyText} numberOfLines={2}>
                          {item.message}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteNotification(item.id)}
                      activeOpacity={0.6}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Trash2 size={16} color={darkMode ? "#94A3B8" : "#9CA3AF"} />
                    </TouchableOpacity>
                  </View>
                );
              })
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
    alignItems: "center",
    justifyContent: "center",
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
  titleWithTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
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
  notifMainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
  permissionNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 12,
  },
  permissionNoticeDark: {
    backgroundColor: "#431407",
    borderColor: "#7C2D12",
  },
  permissionNoticeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionNoticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C2410C",
    marginBottom: 2,
  },
  permissionNoticeSub: {
    fontSize: 11,
    color: "#9A3412",
    lineHeight: 15,
  },
});
