import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Package,
  CheckCircle2,
  XCircle,
  Bell,
  Plane,
  ShieldCheck,
  Gift,
  X,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { handleNotificationNavigation } from "@/lib/notificationNavigation";

export interface InAppNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Global listener hook
type Listener = (payload: InAppNotificationPayload) => void;
let globalListener: Listener | null = null;

export function showInAppBanner(payload: InAppNotificationPayload) {
  if (globalListener) {
    globalListener(payload);
  }
}

export default function InAppNotificationBanner() {
  const insets = useSafeAreaInsets();
  const darkMode = useAppStore((state) => state.darkMode);

  const [visible, setVisible] = useState(false);
  const [currentNotif, setCurrentNotif] = useState<InAppNotificationPayload | null>(null);

  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<any>(null);

  const topOffset = Math.max(insets.top, Platform.OS === "ios" ? 44 : 20) + 8;

  useEffect(() => {
    globalListener = (payload: InAppNotificationPayload) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      setCurrentNotif(payload);
      setVisible(true);

      // Slide in animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4.5 seconds
      hideTimerRef.current = setTimeout(() => {
        dismissBanner();
      }, 4500);
    };

    return () => {
      globalListener = null;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const dismissBanner = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setCurrentNotif(null);
    });
  };

  const handlePress = () => {
    if (!currentNotif) return;
    const data = currentNotif.data;
    dismissBanner();
    if (data) {
      handleNotificationNavigation(data);
    }
  };

  if (!visible || !currentNotif) return null;

  const type = currentNotif.data?.type || "";

  const renderIcon = () => {
    if (type.startsWith("BOOKING_") || type === "DEMAND_RECEIVED") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
          <Package size={20} color="#2563EB" />
        </View>
      );
    }
    if (type.includes("ACCEPTED") || type.includes("COMPLETED")) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
          <CheckCircle2 size={20} color="#059669" />
        </View>
      );
    }
    if (type.includes("REJECTED") || type.includes("CANCELLED")) {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#FEF2F2" }]}>
          <XCircle size={20} color="#EF4444" />
        </View>
      );
    }
    if (type === "OFFER_FULLY_BOOKED") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#EEF2FF" }]}>
          <Plane size={20} color="#6366F1" />
        </View>
      );
    }
    if (type === "REFERRAL_REWARD") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
          <Gift size={20} color="#059669" />
        </View>
      );
    }
    if (type === "ACCOUNT_VERIFIED") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#F0FDFA" }]}>
          <ShieldCheck size={20} color="#0D9488" />
        </View>
      );
    }
    return (
      <View style={[styles.iconCircle, { backgroundColor: "#F1F5F9" }]}>
        <Bell size={20} color="#00A3E0" />
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          top: topOffset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          styles.card,
          darkMode ? styles.cardDark : styles.cardLight,
        ]}
        onPress={handlePress}
        activeOpacity={0.88}
      >
        {renderIcon()}

        <View style={styles.contentCol}>
          <View style={styles.topRow}>
            <Text
              style={[
                styles.title,
                darkMode ? styles.textDark : styles.textLight,
              ]}
              numberOfLines={1}
            >
              {currentNotif.title}
            </Text>
            <Text style={styles.timeTag}>À l'instant</Text>
          </View>

          <Text
            style={[
              styles.body,
              darkMode ? styles.bodyDark : styles.bodyLight,
            ]}
            numberOfLines={2}
          >
            {currentNotif.body}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={dismissBanner}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={15} color={darkMode ? "#94A3B8" : "#9CA3AF"} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 99999,
    elevation: 99999,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    flex: 1,
    marginRight: 6,
    letterSpacing: 0.2,
  },
  timeTag: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "600",
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  textLight: {
    color: "#0F172A",
  },
  textDark: {
    color: "#F8FAFC",
  },
  bodyLight: {
    color: "#475569",
  },
  bodyDark: {
    color: "#CBD5E1",
  },
  closeBtn: {
    padding: 6,
    marginLeft: 6,
  },
});
