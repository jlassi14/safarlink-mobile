import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Plane, Calendar, Clock, Star, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react-native";
import { OfferItem, HomeOfferItem } from "@/lib/mockData";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { MOCK_DEFAULT_AVATAR } from "@/lib/constants";

export interface OfferCardProps {
  offer: OfferItem | HomeOfferItem | any;
  onPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  showManageDemands?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onPress,
  actionLabel,
  onActionPress,
  showManageDemands = false,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const userAvatar = offer.avatar || MOCK_DEFAULT_AVATAR;
  const userName = offer.user || offer.travelerName || "Traveler";
  const userRating = offer.rating || 4.9;
  const flightDate = offer.flightDate || offer.date || offer.departureDate || "Soon";
  const capacityText = offer.capacity || `${offer.weight || offer.totalKg + " kg"} available`;
  const priceText = offer.pricePerKg || offer.reward || "QR 35 / kg";
  const demandsCount = offer.demands ? offer.demands.length : 0;
  const acceptedDemandsCount = offer.demands ? offer.demands.filter((d: any) => d.status === "accepted").length : 0;

  return (
    <TouchableOpacity
      style={[styles.card, darkMode && styles.cardDark]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Header: Traveler Profile & Flight Date Badge */}
      <View style={styles.headerRow}>
        <View style={styles.userProfile}>
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, darkMode && styles.textDark]} numberOfLines={1}>
                {userName}
              </Text>
              <ShieldCheck size={14} color={primaryColor} />
            </View>
            <View style={styles.ratingRow}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{userRating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.datePill}>
          <Calendar size={12} color={primaryColor} />
          <Text style={[styles.dateText, { color: primaryColor }]}>{flightDate}</Text>
        </View>
      </View>

      {/* Route: Origin ➔ Plane ➔ Destination */}
      <View style={[styles.routeBox, darkMode && styles.routeBoxDark]}>
        <View style={styles.locationCol}>
          <Text style={styles.routeLabel}>{t("from", language)}</Text>
          <Text style={[styles.cityName, darkMode && styles.textDark]} numberOfLines={1}>
            {offer.from}
          </Text>
          {offer.departureTime ? (
            <View style={styles.timeTag}>
              <Clock size={10} color="#6B7280" />
              <Text style={styles.timeText}>{offer.departureTime}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.flightArrow}>
          <Plane size={15} color={primaryColor} />
          <View style={styles.flightDottedLine} />
        </View>

        <View style={[styles.locationCol, { alignItems: "flex-end" }]}>
          <Text style={styles.routeLabel}>{t("to", language)}</Text>
          <Text style={[styles.cityName, darkMode && styles.textDark]} numberOfLines={1}>
            {offer.to}
          </Text>
          {offer.destinationTime ? (
            <View style={styles.timeTag}>
              <Clock size={10} color="#6B7280" />
              <Text style={styles.timeText}>{offer.destinationTime}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Specs & Pricing Footer */}
      <View style={styles.footerRow}>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>{t("weight", language)}</Text>
          <Text style={[styles.capacityVal, { color: primaryColor }]}>{capacityText}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceTag}>{priceText}</Text>
        </View>
      </View>

      {/* Optional Manage Demands or Action Footer */}
      {showManageDemands && offer.demands ? (
        <View style={styles.demandsBar}>
          <Text style={[styles.demandsBarText, { color: primaryColor }]}>
            📦 {demandsCount} {t("incomingDemands", language)} ({acceptedDemandsCount} {t("filterAccepted", language)})
          </Text>
          <ChevronRight size={16} color={primaryColor} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  userInfo: {
    justifyContent: "center",
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
  },
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  routeBoxDark: {
    backgroundColor: "#27303F",
  },
  locationCol: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cityName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
  },
  flightArrow: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  flightDottedLine: {
    width: 26,
    height: 1,
    backgroundColor: "#CBD5E1",
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  capacityVal: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },
  priceContainer: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceTag: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },
  demandsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  demandsBarText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textDark: {
    color: "#FFFFFF",
  },
});

export default OfferCard;
