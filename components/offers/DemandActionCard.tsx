import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import {
  Star,
  Package,
  Lock,
  ShieldCheck,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Phone,
  PhoneCall,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { DemandItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";

export interface DemandActionCardProps {
  demand: DemandItem;
  remainingKg?: number;
  onAccept?: (id: string, name: string) => void;
  onReject?: (id: string, name: string) => void;
  onRevoke?: (id: string, name: string) => void;
  onMarkInTransit?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onContact?: (name: string, avatar?: string) => void;
  onPress?: (id: string) => void;
}

export default function DemandActionCard({
  demand,
  remainingKg = 0,
  onPress,
}: DemandActionCardProps) {
  const router = useRouter();
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#00A3E0";

  const isAccepted = demand.status === "accepted";
  const isInTransit = demand.status === "in_transit";
  const isDelivered = demand.status === "delivered";
  const isCompleted = demand.status === "completed";
  const isRejected = demand.status === "rejected" || demand.status === "cancelled";
  const isPending = demand.status === "pending";

  const payStatus = demand.paymentStatus?.toUpperCase();
  const isPaymentSecured = payStatus === "HELD" || payStatus === "AUTHORIZED";
  const isWaitingSenderPayment = !demand.isPriceProposal && isPending && !isPaymentSecured;

  const getStatusBadge = () => {
    if (isCompleted) {
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: language === "ar" ? "مكتمل ✅" : language === "fr" ? "Terminé ✅" : "Completed ✅",
      };
    }
    if (demand.isPriceProposal && isAccepted) {
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: language === "ar" ? "سعر متفق عليه 🤝" : language === "fr" ? "Prix convenu 🤝" : "Price Agreed 🤝",
      };
    }
    if (isAccepted) {
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: language === "ar" ? "مقبول 🔒" : language === "fr" ? "Accepté 🔒" : "Accepted 🔒",
      };
    }
    if (isInTransit) {
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: language === "ar" ? "في الطريق ✈️" : language === "fr" ? "En vol ✈️" : "In Transit ✈️",
      };
    }
    if (isDelivered) {
      return {
        bg: "#FAF5FF",
        text: "#7C3AED",
        border: "#DDD6FE",
        dot: "#8B5CF6",
        label: language === "ar" ? "تم التوصيل 📦" : language === "fr" ? "Livré 📦" : "Delivered 📦",
      };
    }
    if (isRejected) {
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: language === "ar" ? "ملغى ✗" : language === "fr" ? "Refusé ✗" : "Declined ✗",
      };
    }
    if (demand.isPriceProposal) {
      if (demand.isCounterOffer && isPending) {
        return {
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
          dot: "#3B82F6",
          label: language === "ar" ? "اقتراح مضاد مرسل 💬" : language === "fr" ? "Contre-offre envoyée 💬" : "Counter-offer sent 💬",
        };
      }
      if (isPending) {
        return {
          bg: "#FEF3C7",
          text: "#B45309",
          border: "#FDE68A",
          dot: "#F59E0B",
          label: language === "ar" ? "عرض سعر مستلم 💬" : language === "fr" ? "Offre reçue 💬" : "Offer received 💬",
        };
      }
    }
    // Booking pending payment from sender
    if (isWaitingSenderPayment) {
      return {
        bg: "#FFFBEB",
        text: "#D97706",
        border: "#FDE68A",
        dot: "#F59E0B",
        label: language === "ar" ? "في انتظار الدفع 💳" : language === "fr" ? "Paiement en attente 💳" : "Payment Pending 💳",
      };
    }
    // Booking pending traveler confirmation (payment is already held in escrow)
    if (isPending && isPaymentSecured) {
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: language === "ar" ? "في انتظار قرارك ⏳" : language === "fr" ? "À confirmer ⏳" : "To Confirm ⏳",
      };
    }
    return {
      bg: "#FFFBEB",
      text: "#D97706",
      border: "#FDE68A",
      dot: "#F59E0B",
      label: language === "ar" ? "قيد الانتظار ⏳" : language === "fr" ? "En attente ⏳" : "Pending ⏳",
    };
  };

  const statusConfig = getStatusBadge();

  const senderName = demand.senderName || "Expéditeur";
  const senderAvatar = demand.senderAvatar || MOCK_DEFAULT_AVATAR;
  const senderRating = demand.senderRating ? demand.senderRating.toFixed(1) : "5.0";
  const displayWeight = demand.weight || `${demand.weightKg || 1} kg`;
  const displayPrice =
    demand.proposedPrice ||
    demand.price ||
    (demand.totalPrice ? `${demand.totalPrice} ${demand.currency || "USD"}` : "Offre");

  const handlePress = () => {
    console.log("[DemandActionCard] Clicked demand:", demand.id);
    if (onPress) {
      onPress(demand.id);
    } else {
      try {
        router.push({
          pathname: "/(app)/booking-details" as any,
          params: { id: demand.id },
        });
      } catch (err) {
        console.warn("[DemandActionCard] Navigation fallback:", err);
        router.push(`/booking-details?id=${demand.id}` as any);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, darkMode && styles.cardDark, isAccepted && styles.cardAccepted]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Top Header: Sender Profile & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.senderRow}>
          <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          <View style={styles.senderInfoCol}>
            <Text
              style={[styles.senderName, darkMode && styles.textDark]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {senderName}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{senderRating}</Text>
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

      {/* Package Specs & Earnings Row */}
      <View style={[styles.specsBox, darkMode && styles.specsBoxDark]}>
        <View style={styles.specItem}>
          <Package size={13} color="#64748B" />
          <Text style={[styles.specText, darkMode && styles.textDark]}>
            {displayWeight}
          </Text>
          {demand.packageCategory && (
            <Text style={styles.specSub}>• {demand.packageCategory}</Text>
          )}
        </View>

        <Text style={[styles.priceText, { color: primaryColor }]}>
          {displayPrice}
        </Text>
      </View>

      {/* Tunisia Domestic Delivery Indicator for Traveler (Type + Address, NO Price) */}
      {demand.deliveryMethod && (
        <View style={[styles.deliveryNoticeBox, darkMode && styles.deliveryNoticeBoxDark]}>
          <View style={styles.deliveryNoticeRow}>
            <Truck size={13} color="#2563EB" />
            <Text style={[styles.deliveryNoticeText, darkMode && styles.deliveryNoticeTextDark]}>
              <Text style={styles.deliveryNoticeLabel}>
                {language === "ar" ? "طريقة التوصيل: " : "Mode de livraison : "}
              </Text>
              {demand.deliveryMethod === "FAMILY"
                ? t("deliveryMethodFamily", language)
                : demand.deliveryMethod === "COURIER"
                ? t("deliveryMethodCourier", language)
                : t("deliveryMethodIFastPro", language)}
            </Text>
          </View>

          {/* FAMILY: Display Contact Person and Phone Number with Call Action */}
          {demand.deliveryMethod === "FAMILY" && (demand.deliveryContactName || demand.deliveryContactPhone) && (
            <View
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTopWidth: 1,
                borderTopColor: darkMode ? "#1E293B" : "#E2E8F0",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                <Phone size={12} color="#059669" />
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: "700",
                    color: darkMode ? "#34D399" : "#059669",
                  }}
                  numberOfLines={1}
                >
                  {demand.deliveryContactName ? `${demand.deliveryContactName} • ` : ""}
                  {demand.deliveryContactPhone || "—"}
                </Text>
              </View>

              {demand.deliveryContactPhone ? (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: "#05966918",
                    paddingHorizontal: 8,
                    paddingVertical: 3.5,
                    borderRadius: 6,
                  }}
                  onPress={() =>
                    Linking.openURL(
                      `tel:${demand.deliveryContactPhone?.replace(/\s+/g, "")}`
                    ).catch(() => {})
                  }
                  activeOpacity={0.7}
                >
                  <PhoneCall size={11} color="#059669" />
                  <Text style={{ fontSize: 10.5, fontWeight: "800", color: "#059669" }}>
                    {language === "ar" ? "اتصال" : "Appeler"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {Boolean(demand.deliveryAddress && demand.deliveryAddress.trim()) && (
            <View style={styles.deliveryAddressRow}>
              <MapPin size={12} color="#64748B" />
              <Text
                style={[styles.deliveryAddressText, darkMode && styles.deliveryAddressTextDark]}
                numberOfLines={2}
              >
                {demand.deliveryAddress}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer Row: Escrow State + "Voir détails ›" Button */}
      <View style={[styles.footerRow, darkMode && styles.footerRowDark]}>
        <View style={styles.escrowIndicator}>
          {payStatus === "HELD" ? (
            <>
              <Lock size={12} color="#16A34A" />
              <Text style={styles.escrowHeldText}>
                {isPending
                  ? (language === "ar" ? "أموال الضمان مؤمنة • بانتظار قرارك" : "Fonds Sécurisés • À confirmer")
                  : (language === "ar" ? "أموال الضمان مؤمنة" : "Fonds Sécurisés Escrow")}
              </Text>
            </>
          ) : payStatus === "RELEASED" ? (
            <>
              <ShieldCheck size={12} color="#0284C7" />
              <Text style={styles.escrowReleasedText}>
                {language === "ar" ? "تم استلام الأرباح" : "Gains Transférés"}
              </Text>
            </>
          ) : isWaitingSenderPayment ? (
            <>
              <Clock size={12} color="#D97706" />
              <Text style={styles.escrowPendingText}>
                {language === "ar"
                  ? "في انتظار دفع المرسل (Escrow)"
                  : language === "fr"
                  ? "En attente du paiement de l'expéditeur"
                  : "Waiting for sender payment"}
              </Text>
            </>
          ) : demand.isPriceProposal ? (
            <Text style={styles.escrowPendingText}>
              {demand.status === "accepted"
                ? (language === "ar" ? "في انتظار إتمام الحجز والدفع" : "En attente de réservation et paiement")
                : demand.isCounterOffer
                ? (language === "ar" ? "في انتظار رد العميل" : "En attente du client")
                : (language === "ar" ? "في انتظار قرارك" : "En attente de votre réponse")}
            </Text>
          ) : isPending ? (
            <Text style={styles.escrowPendingText}>
              {language === "ar" ? "في انتظار قرارك" : "En attente de votre réponse"}
            </Text>
          ) : (
            <Text style={styles.escrowNoneText}>
              {language === "ar" ? "معاملة مباشرة" : "SafarLink Direct"}
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
  cardAccepted: {
    borderColor: "#A7F3D0",
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
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  senderInfoCol: {
    flex: 1,
  },
  senderName: {
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

  // ── SPECS BOX ──
  specsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  specsBoxDark: {
    backgroundColor: "#1E293B",
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  specText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  specSub: {
    fontSize: 11,
    color: "#64748B",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
  },

  // ── DELIVERY NOTICE ──
  deliveryNoticeBox: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 4,
  },
  deliveryNoticeBoxDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  deliveryNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deliveryNoticeLabel: {
    fontWeight: "700",
    color: "#1E40AF",
  },
  deliveryNoticeText: {
    fontSize: 11,
    color: "#1E40AF",
    fontWeight: "600",
    flex: 1,
  },
  deliveryNoticeTextDark: {
    color: "#93C5FD",
  },
  deliveryAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 2,
  },
  deliveryAddressText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  deliveryAddressTextDark: {
    color: "#94A3B8",
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
  escrowPendingText: {
    fontSize: 11,
    color: "#D97706",
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
