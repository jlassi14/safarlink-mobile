import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import {
  Check,
  X,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  Package,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { DemandItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";

export interface DemandActionCardProps {
  demand: DemandItem;
  remainingKg: number;
  onAccept: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onRevoke: (id: string, name: string) => void;
  onContact?: (name: string, avatar?: string) => void;
}

export default function DemandActionCard({
  demand,
  remainingKg,
  onAccept,
  onReject,
  onRevoke,
  onContact,
}: DemandActionCardProps) {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const isAccepted = demand.status === "accepted";
  const isRejected = demand.status === "rejected";
  const isPending = demand.status === "pending";
  const weightVal = demand.weightKg || 1;
  const exceedsCapacity = isPending && weightVal > remainingKg;

  return (
    <View
      style={[
        styles.card,
        darkMode && styles.cardDark,
        isAccepted && styles.cardAccepted,
        exceedsCapacity && styles.cardExceeded,
      ]}
    >
      {/* Sender Profile & Proposed Price */}
      <View style={styles.headerRow}>
        <View style={styles.senderGroup}>
          <Image
            source={{ uri: demand.senderAvatar || MOCK_DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.senderName, darkMode && styles.textDark]}>
              {demand.senderName}
            </Text>
            <View style={styles.weightBadge}>
              <Package size={11} color={primaryColor} />
              <Text style={[styles.weightText, { color: primaryColor }]}>
                {demand.weight}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceCol}>
          <Text style={[styles.priceText, { color: primaryColor }]}>
            {demand.proposedPrice}
          </Text>
          <Text style={styles.priceSub}>
            {t("proposedReward", language)}
          </Text>
        </View>
      </View>

      {/* Notes if present */}
      {demand.notes && (
        <View style={[styles.notesBox, darkMode && styles.notesBoxDark]}>
          <Text style={[styles.notesText, darkMode && styles.textDark]}>
            "{demand.notes}"
          </Text>
        </View>
      )}

      {/* Capacity Warning Badge */}
      {exceedsCapacity && (
        <View style={styles.warningBox}>
          <AlertTriangle size={13} color="#B45309" />
          <Text style={styles.warningText}>
            {t("exceedsCapacityWarning", language)}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {isPending && (
          <>
            <TouchableOpacity
              style={[
                styles.acceptBtn,
                { backgroundColor: exceedsCapacity ? "#94A3B8" : "#10B981" },
              ]}
              onPress={() => !exceedsCapacity && onAccept(demand.id, demand.senderName)}
              disabled={exceedsCapacity}
              activeOpacity={0.85}
            >
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.btnTextWhite}>
                {t("acceptBookingBtn", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onReject(demand.id, demand.senderName)}
              activeOpacity={0.8}
            >
              <X size={14} color="#DC2626" />
              <Text style={styles.rejectBtnText}>
                {t("rejectBookingBtn", language)}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isAccepted && (
          <View style={styles.acceptedRow}>
            <View style={styles.acceptedBadge}>
              <Check size={12} color="#059669" strokeWidth={2.5} />
              <Text style={styles.acceptedBadgeText}>
                {t("bookingConfirmedBadge", language)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.revokeBtn}
              onPress={() => onRevoke(demand.id, demand.senderName)}
              activeOpacity={0.7}
            >
              <RotateCcw size={12} color="#64748B" />
              <Text style={styles.revokeBtnText}>
                {t("revertToPending", language)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isRejected && (
          <View style={styles.rejectedBadge}>
            <X size={12} color="#DC2626" />
            <Text style={styles.rejectedBadgeText}>
              {t("demandRefusedBadge", language)}
            </Text>
          </View>
        )}

        {onContact && (
          <TouchableOpacity
            style={styles.contactIconBtn}
            onPress={() => onContact(demand.senderName, demand.senderAvatar)}
            activeOpacity={0.7}
          >
            <MessageSquare size={15} color={primaryColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: "#151E2E",
    borderColor: "#1E293B",
  },
  cardAccepted: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },
  cardExceeded: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  senderGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  weightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  weightText: {
    fontSize: 12,
    fontWeight: "700",
  },
  priceCol: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "900",
  },
  priceSub: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "500",
  },
  notesBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  notesBoxDark: {
    backgroundColor: "#0B1120",
  },
  notesText: {
    fontSize: 12,
    color: "#475569",
    fontStyle: "italic",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnTextWhite: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  rejectBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  acceptedRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  acceptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  acceptedBadgeText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "800",
  },
  revokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  revokeBtnText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  rejectedBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rejectedBadgeText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  contactIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  textDark: {
    color: "#FFFFFF",
  },
});
