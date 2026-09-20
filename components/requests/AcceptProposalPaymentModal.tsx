import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import {
  ShieldCheck,
  Lock,
  Plane,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  CreditCard,
  Truck,
  MapPin,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { BackendProposalItem, proposalApi } from "@/lib/api";

interface AcceptProposalPaymentModalProps {
  visible: boolean;
  proposal: BackendProposalItem | null;
  demand: any;
  onClose: () => void;
  onSuccess: (updatedProposal: BackendProposalItem) => void;
}

export default function AcceptProposalPaymentModal({
  visible,
  proposal,
  demand,
  onClose,
  onSuccess,
}: AcceptProposalPaymentModalProps) {
  const { language, darkMode } = useAppStore();
  const isArabic = language === "ar";
  const primaryColor = colors.primary || "#00A3E0";

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "mock">("paypal");

  if (!proposal || !demand) return null;

  const rewardAmount = demand.reward || 0;
  const currency = demand.currency || "QAR";
  const deliveryFee = demand.deliveryFee || 0;
  const totalAmount = rewardAmount + deliveryFee;

  const handleConfirmAccept = async () => {
    setLoading(true);
    try {
      const mockCaptureId = `cap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const res = await proposalApi.acceptProposal(proposal.id, {
        paypalCaptureId: mockCaptureId,
        paymentMethod: paymentMethod,
      });

      if (res.data?.success && res.data.data) {
        onSuccess(res.data.data);
        onClose();
      } else {
        alert(res.data?.message || "Erreur lors de l'acceptation");
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || "Erreur de paiement";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={loading ? undefined : onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={loading ? undefined : onClose}
      >
        <Pressable
          style={[
            styles.sheet,
            darkMode ? styles.sheetDark : styles.sheetLight,
            isArabic && styles.sheetRtl,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Grabber */}
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Text
                style={[
                  styles.title,
                  darkMode ? styles.textDark : styles.textLight,
                  isArabic && styles.textRtl,
                ]}
              >
                {isArabic
                  ? "قبول العرض وتأمين الدفع"
                  : "Accepter l'offre & Sécuriser"}
              </Text>
              <Text style={styles.subtitle}>
                {isArabic
                  ? "سيتم تجميد المبلغ في حساب الضمان حتى استلام شحنتك"
                  : "Les fonds sont bloqués sous séquestre jusqu'à la livraison"}
              </Text>
            </View>
            {!loading && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={darkMode ? "#9CA3AF" : "#64748B"} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Escrow Security Badge */}
            <View
              style={[
                styles.securityBox,
                darkMode && styles.securityBoxDark,
              ]}
            >
              <ShieldCheck size={24} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.securityTitle,
                    darkMode ? styles.textDark : styles.textLight,
                    isArabic && styles.textRtl,
                  ]}
                >
                  {isArabic ? "ضمان SafarLink المالي" : "Garantie Séquestre SafarLink"}
                </Text>
                <Text
                  style={[
                    styles.securityDesc,
                    isArabic && styles.textRtl,
                  ]}
                >
                  {isArabic
                    ? "أموالك محمية 100%. لن يتم تحويل المبلغ للمسافر إلا بعد أن تؤكد بنفسك استلام شحنتك سليمة."
                    : "Vos fonds sont 100% sécurisés. Le voyageur ne recevra sa récompense qu'une fois la remise confirmée."}
                </Text>
              </View>
            </View>

            {/* Traveler & Flight Summary */}
            <View
              style={[
                styles.sectionCard,
                darkMode && styles.sectionCardDark,
              ]}
            >
              <View style={styles.sectionHeader}>
                <Plane size={18} color={primaryColor} />
                <Text
                  style={[
                    styles.sectionTitle,
                    darkMode ? styles.textDark : styles.textLight,
                    isArabic && styles.textRtl,
                  ]}
                >
                  {isArabic ? "تفاصيل رحلة المسافر" : "Détails du voyageur"}
                </Text>
              </View>

              <Text
                style={[
                  styles.travelerName,
                  darkMode ? styles.textDark : styles.textLight,
                  isArabic && styles.textRtl,
                ]}
              >
                {proposal.traveler?.name || "Voyageur"}
              </Text>

              <View style={styles.infoRow}>
                <Calendar size={14} color="#64748B" />
                <Text style={styles.infoText}>
                  {isArabic ? "تاريخ الرحلة:" : "Date de vol:"}{" "}
                  {new Date(proposal.flightDate).toLocaleDateString()}
                </Text>
                <Clock size={14} color="#64748B" style={{ marginLeft: 12 }} />
                <Text style={styles.infoText}>
                  {proposal.flightTime || "14:30"}
                </Text>
              </View>

              {proposal.notes && (
                <Text style={styles.notesText}>
                  « {proposal.notes} »
                </Text>
              )}
            </View>

            {/* Price Breakdown */}
            <View
              style={[
                styles.sectionCard,
                darkMode && styles.sectionCardDark,
              ]}
            >
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {isArabic ? "مكافأة النقل المتفق عليها" : "Récompense de transport"}
                </Text>
                <Text
                  style={[
                    styles.priceValue,
                    darkMode ? styles.textDark : styles.textLight,
                  ]}
                >
                  {currency} {rewardAmount}
                </Text>
              </View>

              {deliveryFee > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    {isArabic ? "رسوم التوصيل الداخلي (تونس)" : "Frais de livraison Tunisie"}
                  </Text>
                  <Text
                    style={[
                      styles.priceValue,
                      darkMode ? styles.textDark : styles.textLight,
                    ]}
                  >
                    {currency} {deliveryFee}
                  </Text>
                </View>
              )}

              <View style={styles.totalDivider} />

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>
                  {isArabic ? "المجموع الكلي للحجز" : "Total à sécuriser"}
                </Text>
                <Text style={[styles.totalValue, { color: primaryColor }]}>
                  {currency} {totalAmount}
                </Text>
              </View>
            </View>

            {/* Payment Method Selector */}
            <View style={styles.paymentMethodsContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === "paypal" && styles.paymentOptionActive,
                  darkMode && styles.paymentOptionDark,
                ]}
                onPress={() => setPaymentMethod("paypal")}
                activeOpacity={0.8}
              >
                <CreditCard
                  size={20}
                  color={paymentMethod === "paypal" ? "#00A3E0" : "#64748B"}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[
                      styles.paymentOptionTitle,
                      darkMode ? styles.textDark : styles.textLight,
                    ]}
                  >
                    {isArabic ? "بايبال / بطاقة بنكية" : "PayPal / Carte Bancaire"}
                  </Text>
                  <Text style={styles.paymentOptionSub}>
                    {isArabic ? "دفع فوري مؤمن تحت الضمان" : "Capture sécurisée sous séquestre"}
                  </Text>
                </View>
                {paymentMethod === "paypal" && (
                  <CheckCircle2 size={18} color="#00A3E0" />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: primaryColor },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleConfirmAccept}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Lock size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.confirmBtnText}>
                    {isArabic
                      ? `دفع وتأمين (${currency} ${totalAmount})`
                      : `Payer et Sécuriser (${currency} ${totalAmount})`}
                  </Text>
                </>
              )}
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetLight: {
    backgroundColor: "#FFFFFF",
  },
  sheetDark: {
    backgroundColor: "#1F2937",
  },
  sheetRtl: {
    direction: "rtl",
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  scrollBody: {
    paddingBottom: 16,
    gap: 14,
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    alignItems: "center",
  },
  securityBoxDark: {
    backgroundColor: "#064E3B",
    borderColor: "#047857",
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 11,
    color: "#047857",
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionCardDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  travelerName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
  },
  notesText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#64748B",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  paymentMethodsContainer: {
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  paymentOptionActive: {
    borderColor: "#00A3E0",
    backgroundColor: "#F0F9FF",
  },
  paymentOptionDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  paymentOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  paymentOptionSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  bottomBar: {
    paddingTop: 12,
  },
  confirmBtn: {
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A3E0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  textLight: {
    color: "#0F172A",
  },
  textDark: {
    color: "#F8FAFC",
  },
  textRtl: {
    textAlign: "right",
  },
});
