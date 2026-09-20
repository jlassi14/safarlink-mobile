import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Calendar,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
  Package,
  Plane,
  Lock,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { OfferItem } from "@/lib/mockData";

export interface MyOfferItemCardProps {
  item: OfferItem;
  onNavigateDetails: (id: string) => void;
  onEdit: (item: OfferItem) => void;
  onDelete: (item: OfferItem) => void;
}

export default function MyOfferItemCard({
  item,
  onNavigateDetails,
  onEdit,
  onDelete,
}: MyOfferItemCardProps) {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const bookedFromDemands = item.demands
    ? item.demands
        .filter((d) => ["accepted", "in_transit", "delivered", "completed"].includes(d.status))
        .reduce((sum, d) => sum + (Number(d.weightKg) || 0), 0)
    : 0;

  const totalKg = Number(item.totalKg) || 0;
  const remainingKg =
    typeof item.remainingKg === "number" && !isNaN(item.remainingKg)
      ? item.remainingKg
      : Math.max(0, totalKg - bookedFromDemands);

  const bookedKg = Math.max(0, totalKg - remainingKg);
  const bookedPercent = totalKg > 0 ? Math.min(100, (bookedKg / totalKg) * 100) : 0;
  const isFullyBooked = remainingKg <= 0 || (totalKg > 0 && bookedKg >= totalKg);
  const hasAccepted = bookedKg > 0;
  const pendingCount = item.demands ? item.demands.filter((d) => d.status === "pending").length : 0;
  const acceptedCount = item.demands ? item.demands.filter((d) => ["accepted", "in_transit", "delivered", "completed"].includes(d.status)).length : 0;

  const renderLocation = (loc: string, isRight: boolean = false) => {
    if (!loc) return null;
    const parts = loc.split(" - ");
    if (parts.length >= 2) {
      const country = parts[0].trim();
      const city = parts.slice(1).join(" - ").trim();
      return (
        <View style={[styles.routeLocCol, isRight && styles.alignRight]}>
          <Text
            style={[styles.routeCityPrimary, isRight && styles.textRight, darkMode && styles.textDark]}
            numberOfLines={1}
          >
            {city}
          </Text>
          <Text
            style={[styles.routeCountrySecondary, isRight && styles.textRight]}
            numberOfLines={1}
          >
            {country}
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.routeLocCol, isRight && styles.alignRight]}>
        <Text
          style={[styles.routeCityPrimary, isRight && styles.textRight, darkMode && styles.textDark]}
          numberOfLines={2}
        >
          {loc}
        </Text>
      </View>
    );
  };

  const depDisplayDate = item.departureDate || item.flightDate;
  const destDisplayDate = item.destinationDate || item.departureDate || item.flightDate;

  return (
    <View style={[styles.card, darkMode && styles.cardDark]}>
      {/* Top Badge & Actions Row */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.statusBadge,
            isFullyBooked
              ? styles.statusBadgeFull
              : hasAccepted
              ? styles.statusBadgeAccepted
              : styles.statusBadgeActive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isFullyBooked
                  ? "#DC2626"
                  : hasAccepted
                  ? "#2563EB"
                  : "#059669",
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isFullyBooked
                ? styles.statusTextFull
                : hasAccepted
                ? styles.statusTextAccepted
                : styles.statusTextActive,
            ]}
          >
            {isFullyBooked
              ? t("statusFullyBooked", language)
              : hasAccepted
              ? t("statusActiveBookings", language)
              : t("statusAvailable", language)}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnEdit, hasAccepted && styles.disabledBtn]}
            onPress={() => onEdit(item)}
            activeOpacity={hasAccepted ? 1 : 0.7}
          >
            {hasAccepted ? (
              <Lock size={14} color="#94A3B8" />
            ) : (
              <Edit2 size={14} color={primaryColor} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete, hasAccepted && styles.disabledBtn]}
            onPress={() => onDelete(item)}
            activeOpacity={hasAccepted ? 1 : 0.7}
          >
            <Trash2 size={14} color={hasAccepted ? "#94A3B8" : "#DC2626"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Corridor Flight Route */}
      <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
        {renderLocation(item.from, false)}
        <View style={styles.routeFlightTrack}>
          <View style={styles.routeTrackLine} />
          <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
            <Plane size={11} color="#FFFFFF" />
          </View>
        </View>
        {renderLocation(item.to, true)}
      </View>

      {/* Flight Schedule: Departure Date & Arrival Date */}
      <View style={[styles.scheduleCard, darkMode && styles.scheduleCardDark]}>
        <View style={styles.scheduleRow}>
          {/* Departure Column */}
          <View style={styles.scheduleCol}>
            <View style={styles.scheduleLabelRow}>
              <View style={[styles.scheduleDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={styles.scheduleLabel}>
                {t("flightDeparture", language)}
              </Text>
            </View>
            <Text style={[styles.scheduleDateText, darkMode && styles.textDark]}>
              {depDisplayDate}
            </Text>
            {item.departureTime ? (
              <View style={styles.timeTag}>
                <Clock size={11} color="#64748B" />
                <Text style={styles.scheduleTimeText}>{item.departureTime}</Text>
              </View>
            ) : null}
          </View>

          {/* Vertical Divider */}
          <View style={styles.scheduleDivider} />

          {/* Arrival Column */}
          <View style={[styles.scheduleCol, styles.alignRight]}>
            <View style={[styles.scheduleLabelRow, styles.alignRight]}>
              <Text style={styles.scheduleLabel}>
                {t("flightArrival", language)}
              </Text>
              <View style={[styles.scheduleDot, { backgroundColor: "#10B981" }]} />
            </View>
            <Text style={[styles.scheduleDateText, styles.textRight, darkMode && styles.textDark]}>
              {destDisplayDate}
            </Text>
            {item.destinationTime ? (
              <View style={[styles.timeTag, styles.alignRight]}>
                <Clock size={11} color="#64748B" />
                <Text style={styles.scheduleTimeText}>{item.destinationTime}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Price Row */}
        <View style={styles.schedulePriceRow}>
          <Text style={styles.priceLabel}>{t("pricePerKg", language)}</Text>
          <Text style={[styles.priceText, { color: primaryColor }]}>
            {item.pricePerKg}
          </Text>
        </View>
      </View>

      {/* Capacity Progress Bar */}
      <View style={[styles.capacityBox, darkMode && styles.capacityBoxDark]}>
        <View style={styles.capacityHeader}>
          <View>
            <Text style={[styles.capacityLabel, darkMode && styles.textMutedDark]}>
              {t("remainingCapacity", language)}
            </Text>
            <Text style={[styles.capacityHighlight, isFullyBooked && styles.textDanger]}>
              {remainingKg.toFixed(1)} kg {language === "ar" ? "متاح" : language === "fr" ? "disponible" : "available"}
            </Text>
          </View>

          <View style={styles.capacityBookedCol}>
            <Text style={[styles.capacityBookedLabel, darkMode && styles.textMutedDark]}>
              {language === "ar" ? "المحجوز" : language === "fr" ? "Réservé" : "Booked"}
            </Text>
            <Text style={[styles.capacityBookedValue, darkMode && styles.textDark]}>
              {bookedKg.toFixed(1)} / {totalKg} kg
            </Text>
          </View>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${bookedPercent}%`,
                backgroundColor: isFullyBooked ? "#DC2626" : primaryColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Demands / Bookings Summary Link */}
      <TouchableOpacity
        style={[styles.demandsFooter, darkMode && styles.demandsFooterDark]}
        onPress={() => onNavigateDetails(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.demandsBadgeGroup}>
          <Package size={15} color={primaryColor} />
          <Text style={[styles.demandsFooterText, { color: primaryColor }]}>
            {t("receivedDemandsSummary", language)}
          </Text>
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <ChevronRight size={16} color="#94A3B8" />
      </TouchableOpacity>
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
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  statusBadgeAccepted: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  statusBadgeFull: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
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
  statusTextActive: { color: "#059669" },
  statusTextAccepted: { color: "#2563EB" },
  statusTextFull: { color: "#DC2626" },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionBtnEdit: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  actionBtnDelete: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  disabledBtn: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    opacity: 0.6,
  },
  routeTimelineBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  routeTimelineBoxDark: {
    backgroundColor: "#0B1120",
    borderColor: "#1E293B",
  },
  routeLocCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  routeCityPrimary: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  routeCountrySecondary: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 1,
  },
  textRight: {
    textAlign: "right",
  },
  routeFlightTrack: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginHorizontal: 8,
  },
  routeTrackLine: {
    position: "absolute",
    height: 1.5,
    left: 0,
    right: 0,
    backgroundColor: "#CBD5E1",
  },
  planeIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  scheduleCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  scheduleCardDark: {
    backgroundColor: "#0B1120",
    borderColor: "#1E293B",
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  scheduleCol: {
    flex: 1,
  },
  scheduleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scheduleLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scheduleDateText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
  },
  scheduleTimeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  scheduleDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E2E8F0",
    marginHorizontal: 10,
  },
  schedulePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  priceLabel: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: "900",
  },
  capacityBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  capacityBoxDark: {
    backgroundColor: "#0B1120",
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },
  capacityHighlight: {
    fontSize: 14,
    fontWeight: "900",
    color: "#059669",
  },
  capacityBookedCol: {
    alignItems: "flex-end",
  },
  capacityBookedLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "right",
  },
  capacityBookedValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  textDanger: {
    color: "#DC2626",
  },
  textMutedDark: {
    color: "#94A3B8",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  demandsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  demandsFooterDark: {
    backgroundColor: "#1E293B",
  },
  demandsBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  demandsFooterText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  pendingBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  textDark: {
    color: "#FFFFFF",
  },
});
