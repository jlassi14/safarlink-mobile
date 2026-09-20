import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import {
  Calendar,
  Star,
  ShieldCheck,
  Lock,
  ChevronRight,
  Package,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { MyApplicationItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";

export interface BookingItemCardProps {
  item: MyApplicationItem;
  onRevoke?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDispute?: (id: string) => void;
  onContact?: (name: string, avatar?: string) => void;
  onActionSubmitted?: () => void;
  onPress?: (id: string) => void;
}

export default function BookingItemCard({
  item,
  onPress,
}: BookingItemCardProps) {
  const router = useRouter();
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#00A3E0";

  const getApplicationStatusColor = (st: string) => {
    switch (st.toLowerCase()) {
      case "accepted":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: language === "ar" ? "مقبول 🔒" : language === "fr" ? "Accepté 🔒" : "Accepted 🔒",
        };
      case "in_transit":
        return {
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
          dot: "#3B82F6",
          label: language === "ar" ? "في الطريق ✈️" : language === "fr" ? "En vol ✈️" : "In Transit ✈️",
        };
      case "delivered":
        return {
          bg: "#FAF5FF",
          text: "#7C3AED",
          border: "#DDD6FE",
          dot: "#8B5CF6",
          label: language === "ar" ? "تم التوصيل 📦" : language === "fr" ? "Livré 📦" : "Delivered 📦",
        };
      case "completed":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: language === "ar" ? "مكتمل ✅" : language === "fr" ? "Terminé ✅" : "Completed ✅",
        };
      case "disputed":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "نزاع ⚠️" : language === "fr" ? "Litige ⚠️" : "Disputed ⚠️",
        };
      case "rejected":
      case "cancelled":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "ملغى ✗" : language === "fr" ? "Annulé ✗" : "Cancelled ✗",
        };
      default:
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          dot: "#F59E0B",
          label: language === "ar" ? "قيد الانتظار ⏳" : language === "fr" ? "En attente ⏳" : "Pending ⏳",
        };
    }
  };

  const displayName = item.creatorName || "Traveler";
  const displayAvatar = item.creatorAvatar || MOCK_DEFAULT_AVATAR;
  const displayRating = item.creatorRating ? item.creatorRating.toFixed(1) : "5.0";
  const displayDate = item.targetDate || item.myFlightDate || "Flexible";
  const displayWeight = item.myRequestedWeight || item.weight || "1 kg";
  const displayPrice =
    item.myProposedPrice ||
    item.reward ||
    (item.totalPrice ? `${item.totalPrice} ${item.currency || "QAR"}` : "Free");

  const statusConfig = getApplicationStatusColor(item.status);
  const payStatus = item.paymentStatus?.toUpperCase();

  const handlePress = () => {
    console.log("[BookingItemCard] Clicked on booking item:", item.id);
    if (onPress) {
      onPress(item.id);
    } else {
      try {
        router.push({
          pathname: "/(app)/booking-details" as any,
          params: { id: item.id },
        });
      } catch (err) {
        console.warn("[BookingItemCard] Navigation fallback:", err);
        router.push(`/booking-details?id=${item.id}` as any);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, darkMode && styles.cardDark]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Top Header: Traveler Info & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.travelerRow}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          <View style={styles.travelerInfoCol}>
            <Text
              style={[styles.travelerName, darkMode && styles.textDark]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayName}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{displayRating}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Flight Route Corridor */}
      <View style={[styles.routeBox, darkMode && styles.routeBoxDark]}>
        <View style={styles.routeCol}>
          <Text style={[styles.routeText, darkMode && styles.textDark]} numberOfLines={1}>
            {item.from}
          </Text>
        </View>
        <Text style={{ color: "#94A3B8", fontWeight: "800", marginHorizontal: 8 }}>➔</Text>
        <View style={[styles.routeCol, styles.alignRight]}>
          <Text style={[styles.routeText, darkMode && styles.textDark]} numberOfLines={1}>
            {item.to}
          </Text>
        </View>
      </View>

      {/* Booking Details: Date, Weight & Price */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={12} color="#64748B" />
          <Text style={styles.detailText}>{displayDate}</Text>
        </View>

        <View style={styles.detailItem}>
          <Package size={12} color="#64748B" />
          <Text style={[styles.detailBold, darkMode && styles.textDark]}>{displayWeight}</Text>
        </View>

        <Text style={[styles.priceText, { color: primaryColor }]}>
          {displayPrice}
        </Text>
      </View>

      {/* Footer Bar: Escrow Chip + Clickable "Voir détails ›" */}
      <View style={[styles.footerRow, darkMode && styles.footerRowDark]}>
        <View style={styles.escrowIndicator}>
          {payStatus === "HELD" ? (
            <>
              <Lock size={12} color="#16A34A" />
              <Text style={styles.escrowHeldText}>
                {language === "ar" ? "الضمان مفعل" : "Escrow Sécurisé"}
              </Text>
            </>
          ) : payStatus === "RELEASED" ? (
            <>
              <ShieldCheck size={12} color="#0284C7" />
              <Text style={styles.escrowReleasedText}>
                {language === "ar" ? "الأرباح محولة" : "Fonds Transférés"}
              </Text>
            </>
          ) : (
            <Text style={styles.escrowNoneText}>
              {language === "ar" ? "حجز مباشر" : "SafarLink Direct"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewDetailsText, { color: primaryColor }]}>
            {language === "ar"
              ? "عرض التفاصيل"
              : language === "fr"
              ? "Voir détails"
              : "View details"}
          </Text>
          <ChevronRight size={14} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: "#111827",
    borderColor: "#1F2937",
  },
  textDark: {
    color: "#F8FAFC",
  },

  // ── TOP ROW ──
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  travelerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  travelerInfoCol: {
    flex: 1,
  },
  travelerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── ROUTE ──
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  routeBoxDark: {
    backgroundColor: "#1E293B",
  },
  routeCol: {
    flex: 1,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  routeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  // ── DETAILS ROW ──
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#64748B",
  },
  detailBold: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
  },

  // ── FOOTER ROW ──
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerRowDark: {
    borderTopColor: "#1F2937",
  },
  escrowIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  escrowHeldText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
  },
  escrowReleasedText: {
    fontSize: 11,
    color: "#0284C7",
    fontWeight: "600",
  },
  escrowNoneText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
