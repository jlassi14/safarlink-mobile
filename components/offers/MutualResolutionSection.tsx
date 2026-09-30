import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Star,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { bookingApi, proposalApi } from "@/lib/api";
import RatingModal from "@/components/RatingModal";

export interface MutualResolutionSectionProps {
  bookingId?: string;
  proposalId?: string;
  itemType?: "BOOKING" | "PROPOSAL";
  role: "SENDER" | "TRAVELER";
  senderAction?: "COMPLETED" | "CANCELLED" | null;
  travelerAction?: "COMPLETED" | "CANCELLED" | null;
  bookingStatus: string;
  paymentStatus?: string;
  totalPrice?: number | string;
  currency?: string;
  onActionSubmitted?: (action: "COMPLETED" | "CANCELLED") => void;
}

export default function MutualResolutionSection({
  bookingId,
  proposalId,
  itemType = "BOOKING",
  role,
  senderAction: initialSenderAction,
  travelerAction: initialTravelerAction,
  bookingStatus,
  paymentStatus,
  totalPrice,
  currency = "$",
  onActionSubmitted,
}: MutualResolutionSectionProps) {
  const { language, darkMode } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [senderAction, setSenderAction] = useState<"COMPLETED" | "CANCELLED" | null>(
    initialSenderAction || null
  );
  const [travelerAction, setTravelerAction] = useState<"COMPLETED" | "CANCELLED" | null>(
    initialTravelerAction || null
  );
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

  // Sync if props change
  React.useEffect(() => {
    setSenderAction(initialSenderAction || null);
    setTravelerAction(initialTravelerAction || null);
  }, [initialSenderAction, initialTravelerAction]);

  const normStatus = bookingStatus?.toLowerCase();
  // Show resolution only at the end when package is delivered, completed, or disputed
  const isResolutionEligible =
    normStatus === "delivered" ||
    normStatus === "completed" ||
    normStatus === "disputed";

  if (!isResolutionEligible) {
    return null;
  }

  const myAction = role === "SENDER" ? senderAction : travelerAction;
  const partnerAction = role === "SENDER" ? travelerAction : senderAction;
  const partnerRoleLabel =
    role === "SENDER"
      ? language === "ar"
        ? "المسافر"
        : language === "fr"
        ? "Voyageur"
        : "Traveler"
      : language === "ar"
      ? "المرسل"
      : language === "fr"
      ? "Expéditeur"
      : "Sender";

  const isBothCompleted = senderAction === "COMPLETED" && travelerAction === "COMPLETED";
  const isBothCancelled = senderAction === "CANCELLED" && travelerAction === "CANCELLED";
  const isDisputed =
    normStatus === "disputed" ||
    (Boolean(senderAction) && Boolean(travelerAction) && senderAction !== travelerAction);

  const getActionBadge = (action?: "COMPLETED" | "CANCELLED" | null) => {
    if (action === "COMPLETED") {
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        label:
          language === "ar"
            ? "تم التأكيد ✓"
            : language === "fr"
            ? "Confirmé ✓"
            : "Confirmed ✓",
        icon: CheckCircle2,
      };
    }
    if (action === "CANCELLED") {
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        label:
          language === "ar"
            ? "تم الإلغاء ✗"
            : language === "fr"
            ? "Annulé ✗"
            : "Cancelled ✗",
        icon: XCircle,
      };
    }
    return {
      bg: darkMode ? "#1E293B" : "#F1F5F9",
      text: darkMode ? "#94A3B8" : "#64748B",
      border: darkMode ? "#334155" : "#E2E8F0",
      label:
        language === "ar"
          ? "في الانتظار ⏳"
          : language === "fr"
          ? "En attente ⏳"
          : "Pending ⏳",
      icon: Clock,
    };
  };

  const senderBadge = getActionBadge(senderAction);
  const travelerBadge = getActionBadge(travelerAction);

  const handleAction = (action: "COMPLETED" | "CANCELLED") => {
    if (submitting) return;

    const isConfirm = action === "COMPLETED";
    const title = isConfirm
      ? language === "ar"
        ? "تأكيد إتمام الطلب"
        : language === "fr"
        ? "Confirmer la transaction"
        : "Confirm Completion"
      : language === "ar"
      ? "تأكيد إلغاء الطلب"
      : language === "fr"
      ? "Confirmer l'annulation"
      : "Confirm Cancellation";

    const message = isConfirm
      ? language === "ar"
        ? "هل تؤكد استلام/إتمام التوصيل بنجاح؟ عند تأكيد الطرفين، سيتم تحرير المبلغ للمسافر تلقائياً."
        : language === "fr"
        ? "Confirmez-vous la livraison conforme ? Dès que les 2 parties confirment, les fonds retenus seront débloqués pour le voyageur."
        : "Confirm successful completion? When both parties confirm, escrow funds will be released to the traveler."
      : language === "ar"
      ? "هل تريد إلغاء هذه العملية؟ إذا اختار الطرف الآخر الإلغاء أيضاً، فسيتم استرجاع المبلغ بالكامل للمرسل."
      : language === "fr"
      ? "Voulez-vous annuler ? Si l'autre partie choisit également l'annulation, les fonds seront intégralement remboursés à l'expéditeur."
      : "Do you want to cancel? If both parties choose cancel, the full amount will be refunded to the sender.";

    Alert.alert(title, message, [
      {
        text: language === "ar" ? "رجوع" : language === "fr" ? "Retour" : "Back",
        style: "cancel",
      },
      {
        text: isConfirm
          ? language === "ar"
            ? "نعم، تأكيد"
            : language === "fr"
            ? "Confirmer"
            : "Confirm"
          : language === "ar"
          ? "نعم، إلغاء"
          : language === "fr"
          ? "Annuler"
          : "Cancel",
        style: isConfirm ? "default" : "destructive",
        onPress: async () => {
          const prevSenderAction = senderAction;
          const prevTravelerAction = travelerAction;
          try {
            setSubmitting(true);
            if (role === "SENDER") {
              setSenderAction(action);
            } else {
              setTravelerAction(action);
            }

            const res =
              itemType === "PROPOSAL" && proposalId
                ? await proposalApi.submitProposalAction(proposalId, action)
                : await bookingApi.submitBookingAction(bookingId!, action, role);
            if (res.data?.success) {
              const updated = res.data.data;
              if (updated) {
                setSenderAction(updated.senderAction ?? null);
                setTravelerAction(updated.travelerAction ?? null);
              }
              onActionSubmitted?.(action);

              // Feedback alerts based on backend status
              if (updated?.status === "COMPLETED") {
                Alert.alert(
                  language === "ar" ? "اكتملت العملية 🎉" : "Transaction Finalisée 🎉",
                  language === "ar"
                    ? "قام الطرفان بالتأكيد! تم تحرير المبلغ بنجاح للمسافر."
                    : "Les deux parties ont confirmé ! Le paiement a été libéré au voyageur."
                );
                setTimeout(() => setShowRatingModal(true), 1000);
              } else if (updated?.status === "CANCELLED") {
                Alert.alert(
                  language === "ar" ? "تم الإلغاء بنجاح 🔄" : "Annulation Validée 🔄",
                  language === "ar"
                    ? "وافق الطرفان على الإلغاء. تم استرجاع المبلغ للمرسل."
                    : "Les deux parties ont annulé. Le montant a été remboursé à l'expéditeur."
                );
                setTimeout(() => setShowRatingModal(true), 1000);
              } else {
                Alert.alert(
                  language === "ar" ? "تم تسجيل اختيارك ⏳" : "Choix Enregistré ⏳",
                  language === "ar"
                    ? `تم تسجيل اختيارك (${action === "COMPLETED" ? "تأكيد" : "إلغاء"}). في انتظار قرار ${partnerRoleLabel} (1/2).`
                    : `Votre choix (${action === "COMPLETED" ? "Confirmer" : "Annuler"}) a été enregistré. En attente de la décision de : ${partnerRoleLabel} (1/2).`
                );
              }
            } else {
              if (role === "SENDER") {
                setSenderAction(prevSenderAction);
              } else {
                setTravelerAction(prevTravelerAction);
              }
              Alert.alert("Error", res.data?.message || "Failed to submit action");
            }
          } catch (err: any) {
            if (role === "SENDER") {
              setSenderAction(prevSenderAction);
            } else {
              setTravelerAction(prevTravelerAction);
            }
            const msg = err?.response?.data?.message || err?.message || "Error submitting action";
            Alert.alert("Error", msg);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header title */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <ShieldCheck size={16} color="#059669" />
          <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
            {language === "ar"
              ? "القرار المشترك (تأكيد أو إلغاء)"
              : language === "fr"
              ? "Confirmation Mutuelle (2/2)"
              : "Mutual Resolution (2/2)"}
          </Text>
        </View>
      </View>

      {/* Real-time Status Board showing BOTH decisions */}
      <View style={[styles.boardContainer, darkMode && styles.boardContainerDark]}>
        {/* Traveler Decision Row */}
        <View style={styles.participantRow}>
          <View style={styles.participantLabelGroup}>
            <Text style={[styles.participantRole, darkMode && styles.textDark]}>
              {language === "ar" ? "المسافر:" : language === "fr" ? "Voyageur :" : "Traveler:"}
            </Text>
            {role === "TRAVELER" && (
              <Text style={styles.youTag}>
                ({language === "ar" ? "أنت" : language === "fr" ? "Vous" : "You"})
              </Text>
            )}
          </View>
          <View
            style={[
              styles.statusChip,
              { backgroundColor: travelerBadge.bg, borderColor: travelerBadge.border },
            ]}
          >
            <travelerBadge.icon size={12} color={travelerBadge.text} />
            <Text style={[styles.statusChipText, { color: travelerBadge.text }]}>
              {travelerBadge.label}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, darkMode && styles.dividerDark]} />

        {/* Sender Decision Row */}
        <View style={styles.participantRow}>
          <View style={styles.participantLabelGroup}>
            <Text style={[styles.participantRole, darkMode && styles.textDark]}>
              {language === "ar" ? "المرسل:" : language === "fr" ? "Expéditeur :" : "Sender:"}
            </Text>
            {role === "SENDER" && (
              <Text style={styles.youTag}>
                ({language === "ar" ? "أنت" : language === "fr" ? "Vous" : "You"})
              </Text>
            )}
          </View>
          <View
            style={[
              styles.statusChip,
              { backgroundColor: senderBadge.bg, borderColor: senderBadge.border },
            ]}
          >
            <senderBadge.icon size={12} color={senderBadge.text} />
            <Text style={[styles.statusChipText, { color: senderBadge.text }]}>
              {senderBadge.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Dynamic Explanation Notice Banner */}
      {isBothCompleted ? (
        <View style={[styles.summaryBanner, styles.bannerSuccess]}>
          <CheckCircle2 size={15} color="#059669" />
          <Text style={[styles.summaryBannerText, { color: "#059669" }]}>
            {language === "ar"
              ? "تم تأكيد العملية من الطرفين (2/2) — تم تحرير المبلغ وإرساله تلقائياً للمسافر عبر PayPal 💰"
              : language === "fr"
              ? "Accord mutuel validé (2/2) — Montant libéré et transféré automatiquement au voyageur via PayPal 💰"
              : "Mutual confirmation complete (2/2) — Payout automatically transferred to traveler via PayPal 💰"}
          </Text>
        </View>
      ) : isBothCancelled ? (
        <View style={[styles.summaryBanner, styles.bannerDanger]}>
          <RotateCcw size={15} color="#DC2626" />
          <Text style={[styles.summaryBannerText, { color: "#DC2626" }]}>
            {language === "ar"
              ? "تم الإلغاء بالاتفاق المتبادل (2/2) — تم استرجاع الأموال للمرسل."
              : language === "fr"
              ? "Annulation mutuelle validée (2/2) — Remboursement intégral au client."
              : "Mutual cancellation complete (2/2) — Full refund returned to sender."}
          </Text>
        </View>
      ) : isDisputed ? (
        <View style={[styles.summaryBanner, styles.bannerWarning]}>
          <AlertTriangle size={15} color="#D97706" />
          <Text style={[styles.summaryBannerText, { color: "#D97706" }]}>
            {language === "ar"
              ? "اختلاف في القرارات (أحدهما أكد والآخر ألغى) — الإدارة تراجع الطلب."
              : language === "fr"
              ? "Divergence de choix (1 confirmation vs 1 annulation) — En cours d'arbitrage."
              : "Disputed actions (1 confirm vs 1 cancel) — SafarLink is reviewing."}
          </Text>
        </View>
      ) : myAction ? (
        <View style={[styles.summaryBanner, styles.bannerPending]}>
          <Clock size={15} color="#475569" />
          <Text style={[styles.summaryBannerText, { color: darkMode ? "#94A3B8" : "#475569" }]}>
            {language === "ar"
              ? `سجلت قرارك (${myAction === "COMPLETED" ? "تأكيد" : "إلغاء"}). في انتظار قرار ${partnerRoleLabel} (1/2).`
              : language === "fr"
              ? `Votre choix est enregistré (${myAction === "COMPLETED" ? "Confirmé" : "Annulé"}). En attente de ${partnerRoleLabel} (1/2).`
              : `Your choice is recorded (${myAction}). Waiting for ${partnerRoleLabel} (1/2).`}
          </Text>
        </View>
      ) : (
        <View style={[styles.summaryBanner, styles.bannerInfo]}>
          <Clock size={15} color="#0284C7" />
          <Text style={[styles.summaryBannerText, { color: "#0284C7" }]}>
            {language === "ar"
              ? "يجب على الطرفين الضغط على 'تأكيد' لتحرير المبلغ، أو 'إلغاء' لاسترجاعه."
              : language === "fr"
              ? "Les 2 parties doivent confirmer pour libérer les fonds, ou annuler pour rembourser."
              : "Both parties must confirm to release funds, or cancel to refund."}
          </Text>
        </View>
      )}

      {/* Rating Trigger Button when deal is finalized */}
      {(isBothCompleted || normStatus === "completed" || isBothCancelled) && (
        <TouchableOpacity
          style={styles.ratingTriggerBtn}
          onPress={() => setShowRatingModal(true)}
          activeOpacity={0.8}
        >
          <Star size={16} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingTriggerText}>
            {language === "ar" ? "تقييم الطرف الآخر ⭐" : "Évaluer cette transaction ⭐"}
          </Text>
        </TouchableOpacity>
      )}

      {/* The 2 Action Buttons: Only show if not fully finalized (both completed or both cancelled) and status is not completed/cancelled */}
      {normStatus !== "completed" && normStatus !== "cancelled" && !isBothCompleted && !isBothCancelled && (
        <View style={styles.buttonsRow}>
          {/* Button 1: Confirmer */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.confirmBtn,
              myAction === "COMPLETED" && styles.confirmBtnLocked,
              myAction === "CANCELLED" && styles.btnFadedDisabled,
              (submitting || Boolean(myAction)) && styles.btnDisabled,
            ]}
            onPress={() => handleAction("COMPLETED")}
            disabled={submitting || Boolean(myAction)}
            activeOpacity={0.8}
          >
            {submitting && myAction !== "CANCELLED" ? (
              <ActivityIndicator size="small" color={myAction === "COMPLETED" ? "#4D6553" : "#059669"} />
            ) : (
              <>
                <CheckCircle2
                  size={14}
                  color={
                    myAction === "COMPLETED"
                      ? "#4D6553"
                      : myAction === "CANCELLED"
                      ? "#94A3B8"
                      : "#059669"
                  }
                />
                <Text
                  style={[
                    styles.btnText,
                    myAction === "COMPLETED"
                      ? styles.btnTextGreenLocked
                      : myAction === "CANCELLED"
                      ? styles.btnTextMuted
                      : styles.btnTextGreen,
                  ]}
                  numberOfLines={1}
                >
                  {myAction === "COMPLETED"
                    ? language === "ar"
                      ? "✓ تم التأكيد"
                      : language === "fr"
                      ? "✓ Confirmé"
                      : "✓ Confirmed"
                    : language === "ar"
                    ? "تأكيد"
                    : language === "fr"
                    ? "Confirmer"
                    : "Confirm"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Button 2: Annuler */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.cancelBtn,
              myAction === "CANCELLED" && styles.cancelBtnLocked,
              myAction === "COMPLETED" && styles.btnFadedDisabled,
              (submitting || Boolean(myAction)) && styles.btnDisabled,
            ]}
            onPress={() => handleAction("CANCELLED")}
            disabled={submitting || Boolean(myAction)}
            activeOpacity={0.8}
          >
            {submitting && myAction !== "COMPLETED" ? (
              <ActivityIndicator size="small" color={myAction === "CANCELLED" ? "#7D6363" : "#DC2626"} />
            ) : (
              <>
                <XCircle
                  size={14}
                  color={
                    myAction === "CANCELLED"
                      ? "#7D6363"
                      : myAction === "COMPLETED"
                      ? "#94A3B8"
                      : "#DC2626"
                  }
                />
                <Text
                  style={[
                    styles.btnText,
                    myAction === "CANCELLED"
                      ? styles.btnTextRedLocked
                      : myAction === "COMPLETED"
                      ? styles.btnTextMuted
                      : styles.btnTextRed,
                  ]}
                  numberOfLines={1}
                >
                  {myAction === "CANCELLED"
                    ? language === "ar"
                      ? "✗ تم الإلغاء"
                      : language === "fr"
                      ? "✗ Annulé"
                      : "✗ Cancelled"
                    : language === "ar"
                    ? "إلغاء"
                    : language === "fr"
                    ? "Annuler"
                    : "Cancel"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        bookingId={itemType === "BOOKING" ? bookingId : undefined}
        proposalId={itemType === "PROPOSAL" ? proposalId : undefined}
        targetUserName={partnerRoleLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  containerDark: {
    backgroundColor: "#0F172A",
    borderColor: "#1E293B",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  textDark: {
    color: "#F1F5F9",
  },
  boardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  boardContainerDark: {
    backgroundColor: "#151E2E",
    borderColor: "#1E293B",
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  participantLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  participantRole: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  youTag: {
    fontSize: 11,
    fontWeight: "500",
    color: "#0284C7",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 2,
  },
  dividerDark: {
    backgroundColor: "#1E293B",
  },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  summaryBannerText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    lineHeight: 15,
  },
  bannerSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  bannerDanger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  bannerWarning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  bannerPending: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  bannerInfo: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  confirmBtn: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  cancelBtn: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  confirmBtnLocked: {
    backgroundColor: "#EDF2EE",
    borderColor: "#C2D1C5",
  },
  cancelBtnLocked: {
    backgroundColor: "#F7F1F1",
    borderColor: "#DFD1D1",
  },
  btnText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  btnTextGreen: {
    color: "#059669",
  },
  btnTextRed: {
    color: "#DC2626",
  },
  btnTextGreenLocked: {
    color: "#4D6553",
    fontWeight: "700",
  },
  btnTextRedLocked: {
    color: "#7D6363",
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.95,
  },
  btnFadedDisabled: {
    opacity: 0.35,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  btnTextMuted: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  ratingTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  ratingTriggerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
  },
});
