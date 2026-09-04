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
  MessageSquare,
  XCircle,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { MyApplicationItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";

export interface BookingItemCardProps {
  item: MyApplicationItem;
  onRevoke: (id: string) => void;
  onContact?: (name: string, avatar?: string) => void;
}

export default function BookingItemCard({
  item,
  onRevoke,
  onContact,
}: BookingItemCardProps) {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const getApplicationStatusColor = (st: string) => {
    switch (st) {
      case "accepted":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: t("bookingAcceptedBadge", language),
        };
      case "rejected":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: t("bookingDeclinedBadge", language),
        };
      default:
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          dot: "#F59E0B",
          label: t("bookingPendingBadge", language),
        };
    }
  };

  const statusConfig = getApplicationStatusColor(item.status);
  const displayName = item.creatorName || "Traveler";
  const displayAvatar = item.creatorAvatar || MOCK_DEFAULT_AVATAR;
  const displayRating = item.creatorRating ? item.creatorRating.toFixed(1) : "5.0";
  const displayDate = item.targetDate || item.myFlightDate || "Flexible";
  const displayWeight = item.myRequestedWeight || item.weight || "1 kg";
  const displayPrice = item.myProposedPrice || item.reward || "Free";

  return (
    <View style={[styles.card, darkMode && styles.cardDark]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.travelerRow}>
          <Image
            source={{ uri: displayAvatar }}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.travelerName, darkMode && styles.textDark]}>
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
        <Text style={{ color: "#94A3B8", fontWeight: "800" }}>➔</Text>
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
          <Text style={styles.detailBold}>{displayWeight}</Text>
        </View>
        <Text style={[styles.priceText, { color: primaryColor }]}>
          {displayPrice}
        </Text>
      </View>

      {/* Actions: Contact or Revoke */}
      <View style={styles.footerRow}>
        {item.status === "pending" ? (
          <TouchableOpacity
            style={styles.revokeBtn}
            onPress={() => onRevoke(item.id)}
            activeOpacity={0.8}
          >
            <XCircle size={14} color="#DC2626" />
            <Text style={styles.revokeBtnText}>
              {t("cancelRequestBtn", language)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {onContact && (
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: primaryColor }]}
            onPress={() => onContact(displayName, displayAvatar)}
            activeOpacity={0.85}
          >
            <MessageSquare size={13} color="#FFFFFF" />
            <Text style={styles.contactBtnText}>
              {t("contactTravelerBtn", language)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#151E2E",
    borderColor: "#1E293B",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  travelerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  travelerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  routeBoxDark: {
    backgroundColor: "#0B1120",
  },
  routeCol: {
    flex: 1,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  routeText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },
  detailBold: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  revokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  revokeBtnText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  contactBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  textDark: {
    color: "#FFFFFF",
  },
});
