import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, ActivityIndicator } from "react-native";
import { Plane, Package } from "lucide-react-native";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { PostType } from "./PostTypeSwitcher";

interface CreatePostConfirmModalProps {
  visible: boolean;
  postType: PostType;
  fromLocation: string;
  toLocation: string;
  dateText: string;
  weightText: string;
  priceOrRewardText: string;
  descriptionText?: string;
  deliveryMethodText?: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const CreatePostConfirmModal: React.FC<CreatePostConfirmModalProps> = ({
  visible,
  postType,
  fromLocation,
  toLocation,
  dateText,
  weightText,
  priceOrRewardText,
  descriptionText,
  deliveryMethodText,
  loading,
  onConfirm,
  onClose,
}) => {
  const { language, darkMode } = useAppStore();
  const isOffer = postType === "offer";
  const primaryColor = colors.primary || "#2563EB";

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : onClose}>
        <Pressable
          style={[styles.card, darkMode && styles.cardDark]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon Bubble */}
          <View style={styles.iconBubble}>
            {isOffer ? (
              <Plane size={26} color={primaryColor} />
            ) : (
              <Package size={26} color={primaryColor} />
            )}
          </View>

          <Text style={[styles.title, darkMode && styles.textDark]}>
            {isOffer
              ? t("publishOfferModalTitle", language)
              : t("publishRequestModalTitle", language)}
          </Text>
          <Text style={styles.subtitle}>
            {isOffer
              ? t("publishOfferModalSubtitle", language)
              : t("publishRequestModalSubtitle", language)}
          </Text>

          {/* Details Breakdown Box */}
          <View style={[styles.summaryBox, darkMode && styles.summaryBoxDark]}>
            <View style={styles.row}>
              <Text style={styles.label}>{t("route", language)}:</Text>
              <Text style={[styles.val, darkMode && styles.textDark]}>
                {fromLocation.split("-")[0].trim()} ➔ {toLocation.split("-")[0].trim()}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{t("date", language)}:</Text>
              <Text style={[styles.val, darkMode && styles.textDark]}>{dateText}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{t("weight", language)}:</Text>
              <Text style={[styles.val, { color: primaryColor, fontWeight: "700" }]}>
                {weightText}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                {isOffer
                  ? t("pricePerKgLabel", language).split("*")[0].trim()
                  : t("reward", language)}
                :
              </Text>
              <Text style={[styles.val, { color: colors.accent || "#F89A1C", fontWeight: "800" }]}>
                {priceOrRewardText}
              </Text>
            </View>

            {deliveryMethodText ? (
              <View style={styles.row}>
                <Text style={styles.label}>🇹🇳 {language === "ar" ? "طريقة التوصيل" : language === "fr" ? "Livraison TN" : "TN Delivery"}:</Text>
                <Text style={[styles.val, { color: "#2563EB", fontWeight: "700" }]}>
                  {deliveryMethodText}
                </Text>
              </View>
            ) : null}

            {descriptionText ? (
              <View style={[styles.row, { alignItems: "flex-start" }]}>
                <Text style={styles.label}>{t("description", language)}:</Text>
                <Text
                  style={[styles.val, darkMode && styles.textDark, { flex: 1, textAlign: "right" }]}
                  numberOfLines={2}
                >
                  {descriptionText}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.cancelBtn, loading && { opacity: 0.5 }]} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>{t("cancel", language)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: primaryColor }, loading && { opacity: 0.65 }]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  {isOffer ? t("yesPublishOffer", language) : t("yesPublishRequest", language)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDark: {
    backgroundColor: "#1F2937",
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 14,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 7,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryBoxDark: {
    backgroundColor: "#27303F",
    borderColor: "#374151",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  val: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  confirmBtn: {
    flex: 1.4,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1798E5",
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textDark: {
    color: "#FFFFFF",
  },
});

export default CreatePostConfirmModal;
