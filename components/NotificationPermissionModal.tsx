import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  AppState,
} from "react-native";
import {
  BellRing,
  Package,
  MessageSquare,
  Zap,
  X,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import {
  checkNotificationPermissionAsync,
  requestOrOpenNotificationSettings,
} from "@/lib/notifications";

// Global helper to manually open modal from anywhere (e.g. profile, settings, banner)
let globalShowModal: (() => void) | null = null;
export function triggerNotificationPermissionPrompt() {
  if (globalShowModal) {
    globalShowModal();
  }
}

export default function NotificationPermissionModal() {
  const { language, darkMode, isAuthenticated } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check permission status
  const evaluatePermission = async (force = false) => {
    if (!isAuthenticated) return;

    try {
      const isGranted = await checkNotificationPermissionAsync();
      if (isGranted) {
        setVisible(false);
        return;
      }

      // If not granted and not forced manually, roll a random value between 0 and 1
      if (!force) {
        const randomVal = Math.random();
        console.log(`[NotifModal] Roll: ${randomVal.toFixed(3)} (shows if >= 0.7)`);
        if (randomVal < 0.7) {
          return;
        }
      }

      setVisible(true);
    } catch (err) {
      console.warn("[NotifModal] Error evaluating permission:", err);
    }
  };

  useEffect(() => {
    globalShowModal = () => {
      evaluatePermission(true);
    };

    // Initial check when user is logged in
    const timer = setTimeout(() => {
      evaluatePermission(false);
    }, 1500);

    // Re-check when app returns from phone Settings to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkNotificationPermissionAsync().then((granted) => {
          if (granted) {
            setVisible(false);
          }
        });
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
      globalShowModal = null;
    };
  }, [isAuthenticated]);

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleActivate = async () => {
    setChecking(true);
    try {
      const granted = await requestOrOpenNotificationSettings();
      if (granted) {
        setVisible(false);
      }
    } catch (err) {
      console.warn("[NotifModal] Activation error:", err);
    } finally {
      setChecking(false);
    }
  };

  if (!visible) return null;

  const content = {
    fr: {
      title: "Ne manquez aucune alerte",
      subtitle:
        "Activez les notifications pour recevoir vos réservations, demandes et paiements en temps réel.",
      item1: "Réservations & Colis",
      item1Sub: "Alertes instantanées dès qu'un voyageur ou expéditeur réserve.",
      item2: "Messages & Propositions",
      item2Sub: "Ne manquez aucune opportunité de transport sur vos trajets.",
      item3: "Mises à jour en temps réel",
      item3Sub: "Restez informé(e) même lorsque l'application est fermée.",
      btnActivate: "Activer les notifications",
      btnLater: "Plus tard",
    },
    ar: {
      title: "لا تفوّت أي إشعار مهم",
      subtitle:
        "قم بتفعيل الإشعارات لتلقي الحجوزات والطلبات وتأكيدات الدفع في الوقت الفعلي.",
      item1: "الحجوزات والطرود",
      item1Sub: "تنبيهات فورية عند قيام مسافر أو مرسل بحجز وزن على رحلتك.",
      item2: "الرسائل والعروض",
      item2Sub: "لا تضيع أي فرصة نقل مربحة على مساراتك اليومية.",
      item3: "تحديثات حية ومستمرة",
      item3Sub: "ابقَ على اطلاع دائم حتى عند إغلاق التطبيق.",
      btnActivate: "تفعيل الإشعارات الآن",
      btnLater: "لاحقاً",
    },
    en: {
      title: "Never miss an update",
      subtitle:
        "Enable notifications to get real-time alerts for bookings, requests, and payments.",
      item1: "Bookings & Luggage",
      item1Sub: "Instant alerts when someone books space on your trip.",
      item2: "Messages & Offers",
      item2Sub: "Never miss an opportunity on your active routes.",
      item3: "Live Updates",
      item3Sub: "Stay informed even when SafarLink is closed.",
      btnActivate: "Enable Notifications",
      btnLater: "Maybe Later",
    },
  }[language] || {
    title: "Ne manquez aucune alerte",
    subtitle:
      "Activez les notifications pour recevoir vos réservations, demandes et paiements en temps réel.",
    item1: "Réservations & Colis",
    item1Sub: "Alertes instantanées dès qu'un voyageur réserve.",
    item2: "Messages & Propositions",
    item2Sub: "Ne manquez aucune opportunité sur vos trajets.",
    item3: "Mises à jour en temps réel",
    item3Sub: "Restez informé(e) même si l'application est fermée.",
    btnActivate: "Activer les notifications",
    btnLater: "Plus tard",
  };

  const isRtl = language === "ar";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Pressable
          style={[
            styles.card,
            darkMode ? styles.cardDark : styles.cardLight,
            isRtl && styles.cardRtl,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeBtn, darkMode && styles.closeBtnDark]}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={darkMode ? "#9CA3AF" : "#64748B"} />
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.outerGlow, darkMode && styles.outerGlowDark]}>
              <View style={[styles.iconCircle, darkMode && styles.iconCircleDark]}>
                <BellRing size={32} color="#00A3E0" />
              </View>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text
            style={[
              styles.title,
              darkMode ? styles.textDark : styles.textLight,
              isRtl && styles.textRtl,
            ]}
          >
            {content.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              darkMode ? styles.subtextDark : styles.subtextLight,
              isRtl && styles.textRtl,
            ]}
          >
            {content.subtitle}
          </Text>

          {/* Feature List */}
          <View style={[styles.featureList, darkMode && styles.featureListDark]}>
            {/* Feature 1 */}
            <View
              style={[
                styles.featureItem,
                isRtl && styles.featureItemRtl,
              ]}
            >
              <View style={styles.featureIconBadge}>
                <Package size={16} color="#00A3E0" />
              </View>
              <View style={[styles.featureTextCol, isRtl && styles.featureTextColRtl]}>
                <Text
                  style={[
                    styles.featureTitle,
                    darkMode ? styles.textDark : styles.textLight,
                    isRtl && styles.textRtl,
                  ]}
                >
                  {content.item1}
                </Text>
                <Text
                  style={[
                    styles.featureSub,
                    darkMode ? styles.subtextDark : styles.subtextLight,
                    isRtl && styles.textRtl,
                  ]}
                >
                  {content.item1Sub}
                </Text>
              </View>
            </View>

            {/* Feature 2 */}
            <View
              style={[
                styles.featureItem,
                isRtl && styles.featureItemRtl,
              ]}
            >
              <View style={[styles.featureIconBadge, { backgroundColor: "#F0FDF4" }]}>
                <MessageSquare size={16} color="#16A34A" />
              </View>
              <View style={[styles.featureTextCol, isRtl && styles.featureTextColRtl]}>
                <Text
                  style={[
                    styles.featureTitle,
                    darkMode ? styles.textDark : styles.textLight,
                    isRtl && styles.textRtl,
                  ]}
                >
                  {content.item2}
                </Text>
                <Text
                  style={[
                    styles.featureSub,
                    darkMode ? styles.subtextDark : styles.subtextLight,
                    isRtl && styles.textRtl,
                  ]}
                >
                  {content.item2Sub}
                </Text>
              </View>
            </View>

            {/* Feature 3 */}
            <View
              style={[
                styles.featureItem,
                isRtl && styles.featureItemRtl,
              ]}
            >
              <View style={[styles.featureIconBadge, { backgroundColor: "#FFF7ED" }]}>
                <Zap size={16} color="#EA580C" />
              </View>
              <View style={[styles.featureTextCol, isRtl && styles.featureTextColRtl]}>
                <Text
                  style={[
                    styles.featureTitle,
                    darkMode ? styles.textDark : styles.textLight,
                    isRtl && styles.textRtl,
                  ]}
                >
                  {content.item3}
                </Text>
                <Text
                  style={[
                    styles.featureSub,
                    darkMode ? styles.subtextDark : styles.subtextLight,
                    isRtl && styles.textRtl,
                  ]}
                >
                  {content.item3Sub}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, checking && { opacity: 0.7 }]}
              onPress={handleActivate}
              activeOpacity={0.85}
              disabled={checking}
            >
              <BellRing size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>
                {checking ? "..." : content.btnActivate}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, darkMode && styles.secondaryBtnDark]}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.secondaryBtnText,
                  darkMode && styles.secondaryBtnTextDark,
                ]}
              >
                {content.btnLater}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
  },
  cardDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
    borderWidth: 1,
  },
  cardRtl: {
    direction: "rtl",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeBtnDark: {
    backgroundColor: "#374151",
  },
  iconContainer: {
    marginBottom: 16,
  },
  outerGlow: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(0, 163, 224, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  outerGlowDark: {
    backgroundColor: "rgba(0, 163, 224, 0.2)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(0, 163, 224, 0.3)",
  },
  iconCircleDark: {
    backgroundColor: "#1E293B",
    borderColor: "rgba(0, 163, 224, 0.4)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  textLight: {
    color: "#0F172A",
  },
  textDark: {
    color: "#F8FAFC",
  },
  subtextLight: {
    color: "#64748B",
  },
  subtextDark: {
    color: "#94A3B8",
  },
  textRtl: {
    textAlign: "right",
  },
  featureList: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  featureListDark: {
    backgroundColor: "#111827",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureItemRtl: {
    flexDirection: "row-reverse",
  },
  featureIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTextColRtl: {
    alignItems: "flex-end",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 11,
    lineHeight: 16,
  },
  btnRow: {
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#00A3E0",
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A3E0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryBtn: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  secondaryBtnDark: {},
  secondaryBtnText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryBtnTextDark: {
    color: "#94A3B8",
  },
});
