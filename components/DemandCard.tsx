import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Package, MapPin, Clock, ArrowRight, Send, CheckCircle2 } from "lucide-react-native";
import { DemandItem, MyPackageRequest } from "@/lib/mockData";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { MOCK_DEFAULT_AVATAR } from "@/lib/constants";

export interface DemandCardProps {
  demand: DemandItem | MyPackageRequest | any;
  onPress?: () => void;
  showActions?: boolean;
  showDeliverAction?: boolean;
  showStatusBadge?: boolean;
  isProposed?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onRevoke?: () => void;
}

export const DemandCard: React.FC<DemandCardProps> = ({
  demand,
  onPress,
  showActions = false,
  showDeliverAction = false,
  showStatusBadge = false,
  isProposed = false,
  onAccept,
  onReject,
  onRevoke,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const senderName = demand.senderName || demand.user || "Sender";
  const senderAvatar = demand.senderAvatar || demand.avatar || MOCK_DEFAULT_AVATAR;
  const getCleanWeight = (rawWeight: string) => {
    if (!rawWeight) return "1.0 kg";
    const match = rawWeight.match(/(\d+(?:\.\d+)?\s*kg)/i);
    if (match) return match[1].toLowerCase();
    const numMatch = rawWeight.match(/\d+(?:\.\d+)?/);
    if (numMatch) return `${numMatch[0]} kg`;
    return rawWeight;
  };

  const weightText = getCleanWeight(demand.weight || `${demand.weightKg || "1.0"} kg`);
  const rewardText = demand.proposedPrice || demand.reward || "QR 100";
  const status = demand.status || "pending";
  const dateText = demand.createdAt || demand.date || "Today";
  const notes = demand.notes || demand.description || "";
  const fromLoc = demand.from || "";
  const toLoc = demand.to || "";

  const getStatusColor = (st: string) => {
    switch (st) {
      case "accepted":
        return { bg: "#EFF6FF", text: primaryColor, label: t("filterAccepted", language) };
      case "rejected":
        return { bg: "#FEF2F2", text: "#DC2626", label: t("filterRejected", language) };
      default:
        return { bg: "#FFFBEB", text: "#D97706", label: t("statusPending", language) };
    }
  };

  const statusInfo = getStatusColor(status);

  const receivePrefix =
    language === "ar"
      ? "تاريخ الاستلام: "
      : language === "fr"
      ? "Réception: "
      : "Receive by: ";

  return (
    <View style={[styles.card, darkMode && styles.cardDark]}>
      {/* Header: Sender Profile & Optional Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.senderProfile}>
          <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          <View style={styles.senderInfo}>
            <Text style={[styles.senderName, darkMode && styles.textDark]} numberOfLines={1}>
              {senderName}
            </Text>
            <Text style={[styles.cardDateSubtext, darkMode && styles.cardDateSubtextDark]} numberOfLines={1}>
              {receivePrefix}{dateText}
            </Text>
          </View>
        </View>

        {showStatusBadge && (
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        )}
      </View>

      {/* Route: Depart (Left), Arrow (Center), Destination (Right) */}
      {fromLoc && toLoc ? (
        <View style={[styles.routeBox, darkMode && styles.routeBoxDark]}>
          <Text style={[styles.routeTextCity, darkMode && styles.textDark]} numberOfLines={1}>
            {fromLoc}
          </Text>
          <Text style={styles.routeTextArrow}>➔</Text>
          <Text style={[styles.routeTextCity, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
            {toLoc}
          </Text>
        </View>
      ) : null}

      {/* Specs Footer: Spaced across Left (Weight) and Right (Action Button) */}
      <View style={styles.footerRow}>
        <View style={styles.specGroup}>
          <View style={styles.weightBadge}>
            <Text style={[styles.weightText, { color: primaryColor }]}>{weightText}</Text>
          </View>
        </View>

        {/* Direct Propose Delivery CTA (Only opens modal if NOT proposed yet, and only on button click) */}
        {showDeliverAction && !showActions && (
          isProposed ? (
            <View
              style={[
                styles.deliverActionBtnInline,
                styles.deliverActionBtnDisabled,
                darkMode && styles.deliverActionBtnDisabledDark,
              ]}
            >
              <Text
                style={[
                  styles.deliverActionBtnText,
                  { color: darkMode ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                {language === "ar"
                  ? "تم تقديم العرض"
                  : language === "fr"
                    ? "Envoyé"
                    : "Sent"}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.deliverActionBtnInline, { backgroundColor: primaryColor }]}
              onPress={onPress}
              activeOpacity={0.85}
            >
              <Text style={styles.deliverActionBtnText}>{t("applyAsTraveler", language)}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Optional In-Card Decision Actions */}
      {showActions ? (
        <View style={styles.actionButtonsRow}>
          {status === "pending" && onAccept && onReject ? (
            <>
              <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: primaryColor }]} onPress={onAccept}>
                <Text style={styles.acceptBtnText}>{t("accept", language)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                <Text style={styles.rejectBtnText}>{t("reject", language)}</Text>
              </TouchableOpacity>
            </>
          ) : status === "accepted" && onRevoke ? (
            <TouchableOpacity style={styles.revokeBtn} onPress={onRevoke}>
              <Text style={styles.revokeBtnText}>{t("revokeAcceptance", language)}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
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
  senderProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  cardDateSubtext: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
    fontWeight: "500",
  },
  cardDateSubtextDark: {
    color: "#9CA3AF",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
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
  routeTextCity: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  routeTextArrow: {
    fontSize: 13,
    color: "#9CA3AF",
    marginHorizontal: 6,
  },
  textRight: {
    textAlign: "right",
  },
  notesText: {
    fontSize: 12,
    color: "#4B5563",
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 16,
  },
  notesTextDark: {
    color: "#D1D5DB",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dateTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dateTagText: {
    fontSize: 11,
    color: "#6B7280",
  },
  rewardBadge: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#D97706",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  rejectBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  revokeBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  revokeBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  deliverActionBtnInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7.5,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  deliverActionBtnDisabled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  deliverActionBtnDisabledDark: {
    backgroundColor: "#334155",
    borderColor: "#475569",
    shadowOpacity: 0,
    elevation: 0,
  },
  deliverActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  textDark: {
    color: "#FFFFFF",
  },
});

export default DemandCard;
