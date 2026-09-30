import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Coins, X, CheckCircle2, TrendingDown, Send, ShieldCheck } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { priceProposalApi, PriceProposalItem } from "@/lib/api";
import { colors } from "@/lib/theme";

export interface PriceProposalModalProps {
  visible: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName?: string;
  offerId?: string;
  demandId?: string;
  currentStandardPrice?: number;
  currency?: string;
  onProposalSent?: (proposal: PriceProposalItem) => void;
}

export default function PriceProposalModal({
  visible,
  onClose,
  receiverId,
  receiverName = "le voyageur",
  offerId,
  demandId,
  currentStandardPrice,
  currency = "$",
  onProposalSent,
}: PriceProposalModalProps) {
  const { language, darkMode } = useAppStore();
  const [proposedPrice, setProposedPrice] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const primaryColor = colors.primary || "#00A3E0";
  const isArabic = language === "ar";

  const handleSendProposal = async () => {
    const priceNum = parseFloat(proposedPrice);
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(
        isArabic ? "تنبيه" : "Attention",
        isArabic
          ? "يرجى إدخال مبلغ صحيح أكبر من الصفر."
          : "Veuillez entrer un montant valide supérieur à 0."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await priceProposalApi.createProposal({
        receiverId,
        proposedPrice: priceNum,
        currency,
        offerId,
        demandId,
      });

      if (res.data?.success && res.data.data) {
        setSubmitted(true);
        if (onProposalSent) {
          onProposalSent(res.data.data);
        }
        setTimeout(() => {
          setSubmitted(false);
          setProposedPrice("");
          onClose();
        }, 1800);
      } else {
        const errorMsg = res.data?.message || res.data?.error || "Échec de l'envoi de l'offre";
        Alert.alert(isArabic ? "خطأ" : "Erreur", errorMsg);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        (isArabic ? "فشل إرسال الاقتراح. يرجى المحاولة مجدداً." : "Impossible d'envoyer l'offre de prix.");
      Alert.alert(isArabic ? "خطأ" : "Erreur", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPercent = (discountPercent: number) => {
    if (!currentStandardPrice || currentStandardPrice <= 0) return;
    const discounted = currentStandardPrice * (1 - discountPercent / 100);
    setProposedPrice(discounted.toFixed(2));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
            <View style={[styles.card, darkMode && styles.cardDark]}>
              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeBtn, darkMode && styles.closeBtnDark]}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={darkMode ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>

              {submitted ? (
                /* Success Feedback Screen */
                <View style={styles.successBox}>
                  <CheckCircle2 size={54} color="#10B981" />
                  <Text style={[styles.successTitle, darkMode && styles.textWhite]}>
                    {isArabic ? "تم إرسال اقتراح السعر ! 🎉" : "Proposition de prix envoyée ! 🎉"}
                  </Text>
                  <Text style={[styles.successSubtitle, darkMode && styles.textMutedDark]}>
                    {isArabic
                      ? `تم إشعار ${receiverName} باقتراحك. ستتلقى تنبيهاً فور قبوله أو رده.`
                      : `Votre proposition a été transmise à ${receiverName}. Vous recevrez une notification dès sa réponse.`}
                  </Text>
                </View>
              ) : (
                /* Proposal Form Screen */
                <View>
                  {/* Header */}
                  <View style={styles.headerRow}>
                    <View style={[styles.iconWrap, { backgroundColor: primaryColor + "15" }]}>
                      <Coins size={22} color={primaryColor} />
                    </View>
                    <View style={styles.headerTextCol}>
                      <Text style={[styles.modalTitle, darkMode && styles.textWhite]}>
                        {isArabic ? "المفاوضة على السعر" : "Négocier le prix"}
                      </Text>
                      <Text style={[styles.modalSubtitle, darkMode && styles.textMutedDark]}>
                        {isArabic
                          ? `اقترح سعراً مخصصاً لـ ${receiverName}`
                          : `Proposez un tarif personnalisé à ${receiverName}`}
                      </Text>
                    </View>
                  </View>

                  {/* Current Standard Rate Info Box */}
                  {currentStandardPrice !== undefined && currentStandardPrice > 0 && (
                    <View style={[styles.infoBanner, darkMode && styles.infoBannerDark]}>
                      <View style={styles.infoBannerRow}>
                        <TrendingDown size={16} color="#6366F1" />
                        <Text style={[styles.infoBannerText, darkMode && styles.textWhite]}>
                          {isArabic ? "السعر القياسي التقديري:" : "Tarif standard estimé :"}
                        </Text>
                        <Text style={styles.infoBannerPrice}>
                          {currentStandardPrice.toFixed(2)} {currency}
                        </Text>
                      </View>

                      {/* Quick discount chips */}
                      <View style={styles.chipsRow}>
                        <Text style={[styles.chipsHint, darkMode && styles.textMutedDark]}>
                          {isArabic ? "اقتراحات سريعة:" : "Suggestions :"}
                        </Text>
                        <TouchableOpacity
                          style={[styles.chipBtn, darkMode && styles.chipBtnDark]}
                          onPress={() => handleQuickPercent(10)}
                        >
                          <Text style={styles.chipBtnText}>-10%</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.chipBtn, darkMode && styles.chipBtnDark]}
                          onPress={() => handleQuickPercent(15)}
                        >
                          <Text style={styles.chipBtnText}>-15%</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.chipBtn, darkMode && styles.chipBtnDark]}
                          onPress={() => handleQuickPercent(20)}
                        >
                          <Text style={styles.chipBtnText}>-20%</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Input Label & Field */}
                  <Text style={[styles.inputLabel, darkMode && styles.textWhite]}>
                    {isArabic ? "السعر المقترح لكل كيلوغرام:" : "Tarif par kg proposé :"}
                  </Text>
                  <View style={[styles.inputWrapper, darkMode && styles.inputWrapperDark]}>
                    <TextInput
                      style={[styles.priceInput, darkMode && styles.textWhite]}
                      value={proposedPrice}
                      onChangeText={(val) => setProposedPrice(val.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      placeholderTextColor="#94A3B8"
                      keyboardType="decimal-pad"
                      autoFocus
                    />
                    <View style={styles.currencyBadge}>
                      <Text style={styles.currencyText}>$/kg</Text>
                    </View>
                  </View>

                  <View style={styles.guaranteeRow}>
                    <ShieldCheck size={14} color="#10B981" />
                    <Text style={[styles.guaranteeText, darkMode && styles.textMutedDark]}>
                      {isArabic
                        ? "إذا تم قبول الاقتراح، سيتم تثبيت السعر مباشرة عند الحجز بدون تغيير."
                        : "Si acceptée, ce prix verrouillera directement votre transaction."}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.cancelBtn, darkMode && styles.cancelBtnDark]}
                      onPress={onClose}
                      disabled={submitting}
                    >
                      <Text style={[styles.cancelBtnText, darkMode && styles.textWhite]}>
                        {isArabic ? "إلغاء" : "Annuler"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.submitBtn, { backgroundColor: primaryColor }]}
                      onPress={handleSendProposal}
                      disabled={submitting || !proposedPrice.trim()}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <View style={styles.btnContent}>
                          <Send size={15} color="#FFFFFF" />
                          <Text style={styles.submitBtnText}>
                            {isArabic ? "إرسال الاقتراح" : "Envoyer l'offre"}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardContainer: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  cardDark: {
    backgroundColor: "#1E293B",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeBtnDark: {
    backgroundColor: "#334155",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingRight: 32,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  infoBanner: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  infoBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#475569",
  },
  infoBannerPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6366F1",
    marginLeft: "auto",
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  chipsHint: {
    fontSize: 11,
    color: "#64748B",
  },
  chipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#EEF2FF",
  },
  chipBtnDark: {
    backgroundColor: "#312E81",
  },
  chipBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4F46E5",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 10,
  },
  inputWrapperDark: {
    borderColor: "#334155",
    backgroundColor: "#0F172A",
  },
  priceInput: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },
  currencyBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  guaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  guaranteeText: {
    fontSize: 11,
    color: "#64748B",
    flex: 1,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnDark: {
    borderColor: "#334155",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  submitBtn: {
    flex: 1.8,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textMutedDark: {
    color: "#94A3B8",
  },
});
