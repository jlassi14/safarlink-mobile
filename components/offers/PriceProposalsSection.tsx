import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  RefreshCw,
  Send,
  X,
  Plane,
  Package,
  Calendar,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { priceProposalApi, PriceProposalItem } from "@/lib/api";
import { colors } from "@/lib/theme";

interface PriceProposalsSectionProps {
  offerId: string;
  currency?: string;
  hideHeader?: boolean;
  activeFilter?: "all" | "pending" | "accepted" | "rejected";
  onProposalAccepted?: (proposal: PriceProposalItem) => void;
  onProposalsCountChange?: (count: number) => void;
}

export default function PriceProposalsSection({
  offerId,
  currency = "USD",
  hideHeader = false,
  activeFilter = "all",
  onProposalAccepted,
  onProposalsCountChange,
}: PriceProposalsSectionProps) {
  const router = useRouter();
  const { language, darkMode, user } = useAppStore();
  const [proposals, setProposals] = useState<PriceProposalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Counter-offer state
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [selectedProposalForCounter, setSelectedProposalForCounter] = useState<PriceProposalItem | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const primaryColor = colors.primary || "#00A3E0";
  const isArabic = language === "ar";

  const fetchProposals = async () => {
    if (!offerId || offerId.startsWith("off_mock")) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await priceProposalApi.getProposals({ offerId });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setProposals(res.data.data);
        if (onProposalsCountChange) {
          onProposalsCountChange(res.data.data.length);
        }
      }
    } catch (err) {
      console.error("Failed to load price proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [offerId]);

  const handleAccept = async (proposal: PriceProposalItem) => {
    const weight = proposal.weightKg || 1;
    const totalAmount = (weight * proposal.proposedPrice).toFixed(1);

    Alert.alert(
      isArabic ? "قبول عرض السعر" : "Accepter l'offre de prix",
      isArabic
        ? `هل توافق على سعر ${proposal.proposedPrice} $/kg (المجموع: ${totalAmount} $) لهذا الحجز؟`
        : `Confirmez-vous accepter le tarif de ${proposal.proposedPrice} $/kg (Total : ${totalAmount} $) pour cette réservation ?`,
      [
        { text: isArabic ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: isArabic ? "تأكيد القبول" : "Confirmer",
          style: "default",
          onPress: async () => {
            setActionLoadingId(proposal.id);
            try {
              const res = await priceProposalApi.acceptProposal(proposal.id);
              if (res.data?.success && res.data.data) {
                setProposals((prev) =>
                  prev.map((p) =>
                    p.id === proposal.id
                      ? { ...p, status: "ACCEPTED" }
                      : p.status === "PENDING"
                      ? { ...p, status: "REJECTED" }
                      : p
                  )
                );
                if (onProposalAccepted) {
                  onProposalAccepted(res.data.data);
                }
                Alert.alert(
                  isArabic ? "تم القبول 🎉" : "Offre acceptée 🎉",
                  isArabic
                    ? "تم قبول السعر بنجاح وتم إشعار المرسل لإتمام الحجز."
                    : "Le prix a été validé. L'expéditeur a été notifié pour finaliser la réservation."
                );
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                (isArabic ? "فشل قبول الاقتراح" : "Erreur lors de l'acceptation");
              Alert.alert(isArabic ? "خطأ" : "Erreur", msg);
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (proposal: PriceProposalItem) => {
    Alert.alert(
      isArabic ? "رفض عرض السعر" : "Refuser l'offre de prix",
      isArabic
        ? `هل تريد رفض اقتراح السعر (${proposal.proposedPrice} $/kg)؟`
        : `Voulez-vous refuser l'offre de ${proposal.proposedPrice} $/kg ?`,
      [
        { text: isArabic ? "تراجع" : "Annuler", style: "cancel" },
        {
          text: isArabic ? "رفض" : "Refuser",
          style: "destructive",
          onPress: async () => {
            setActionLoadingId(proposal.id);
            try {
              const res = await priceProposalApi.rejectProposal(proposal.id);
              if (res.data?.success) {
                setProposals((prev) =>
                  prev.map((p) =>
                    p.id === proposal.id ? { ...p, status: "REJECTED" } : p
                  )
                );
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                (isArabic ? "فشل رفض الاقتراح" : "Erreur lors du refus");
              Alert.alert(isArabic ? "خطأ" : "Erreur", msg);
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenCounter = (proposal: PriceProposalItem) => {
    setSelectedProposalForCounter(proposal);
    setCounterPriceInput("");
    setCounterModalVisible(true);
  };

  const handleSendCounter = async () => {
    if (!selectedProposalForCounter) return;
    const pNum = parseFloat(counterPriceInput);
    if (!pNum || isNaN(pNum) || pNum <= 0) {
      Alert.alert(
        isArabic ? "تنبيه" : "Attention",
        isArabic ? "يرجى إدخال مبلغ صحيح." : "Veuillez entrer un montant valide."
      );
      return;
    }
    setSubmittingCounter(true);
    try {
      await priceProposalApi.createProposal({
        receiverId: selectedProposalForCounter.senderId,
        proposedPrice: pNum,
        weightKg: selectedProposalForCounter.weightKg || undefined,
        currency: "$",
        offerId: selectedProposalForCounter.offerId || offerId,
      });

      await priceProposalApi.rejectProposal(selectedProposalForCounter.id).catch(() => {});

      setCounterModalVisible(false);
      setSelectedProposalForCounter(null);
      setCounterPriceInput("");
      await fetchProposals();

      Alert.alert(
        isArabic ? "تم إرسال الاقتراح المضاد 🚀" : "Contre-offre envoyée 🚀",
        isArabic
          ? `تم إرسال اقتراحك الجديد (${pNum} $/kg) إلى المرسل بنجاح.`
          : `Votre contre-proposition de ${pNum} $/kg a été transmise à l'expéditeur.`
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erreur";
      Alert.alert(isArabic ? "خطأ" : "Erreur", msg);
    } finally {
      setSubmittingCounter(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={primaryColor} />
      </View>
    );
  }

  const filteredProposals = proposals.filter((p) => {
    if (!activeFilter || activeFilter === "all") return true;
    if (activeFilter === "pending") return p.status === "PENDING";
    if (activeFilter === "accepted") return p.status === "ACCEPTED";
    if (activeFilter === "rejected") return p.status === "REJECTED";
    return true;
  });

  if (filteredProposals.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, hideHeader && { marginTop: 4 }, darkMode && styles.containerDark]}>
      {/* Section Title */}
      {!hideHeader && (
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: primaryColor + "15" }]}>
            <Coins size={16} color={primaryColor} />
          </View>
          <Text style={[styles.sectionTitle, darkMode && styles.textWhite]}>
            {isArabic ? "المفاوضات وعروض الأسعار" : "Négociations & Offres reçues"}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: primaryColor + "20" }]}>
            <Text style={[styles.countBadgeText, { color: primaryColor }]}>
              {filteredProposals.length}
            </Text>
          </View>
        </View>
      )}

      {/* Proposals List */}
      {filteredProposals.map((item) => {
        const isActionLoading = actionLoadingId === item.id;
        const isMySentProposal = Boolean(user?.id && item.senderId === user.id);
        const displayName = isMySentProposal
          ? (isArabic ? `عرضك المضاد إلى ${item.receiver?.name || "المرسل"}` : `Votre contre-offre à ${item.receiver?.name || "l'expéditeur"}`)
          : (item.sender?.name || (isArabic ? "مرسل" : "Expéditeur"));
        const displayAvatar = isMySentProposal ? item.receiver?.avatar : item.sender?.avatar;
        const displayRating = isMySentProposal ? (item.receiver?.averageRating || 5.0) : (item.sender?.averageRating || 5.0);

        const weight = item.weightKg || 1;
        const originalPrice = item.offer?.pricePerKg ? Number(item.offer.pricePerKg) : null;
        const proposedTotal = Number((weight * item.proposedPrice).toFixed(1));

        const rawDepDate = item.offer?.departureDate ? new Date(item.offer.departureDate) : null;
        const formattedDepDate = rawDepDate && !isNaN(rawDepDate.getTime())
          ? rawDepDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
          : item.offer?.departureDate || null;

        const rawDestDate = item.offer?.destinationDate ? new Date(item.offer.destinationDate) : null;
        const formattedDestDate = rawDestDate && !isNaN(rawDestDate.getTime())
          ? rawDestDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
          : item.offer?.destinationDate || formattedDepDate;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              darkMode && styles.cardDark,
              item.status === "ACCEPTED" && styles.cardAccepted,
              item.status === "REJECTED" && styles.cardRejected,
            ]}
            onPress={() => {
              router.push({
                pathname: "/(app)/booking-details" as any,
                params: { id: item.id, type: "proposal" },
              });
            }}
            activeOpacity={0.85}
          >
            {/* Top row: Participant info + Status badge */}
            <View style={styles.cardHeader}>
              <View style={styles.senderInfo}>
                {displayAvatar ? (
                  <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: primaryColor + "20" }]}>
                    <Text style={[styles.avatarInitial, { color: primaryColor }]}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.senderCol}>
                  <Text style={[styles.senderNameText, darkMode && styles.textWhite]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{Number(displayRating).toFixed(1)}</Text>
                    <Text style={[styles.roleTag, darkMode && styles.textMutedDark]}>
                      • {isMySentProposal ? (isArabic ? "المستلم" : "Destinataire") : (isArabic ? "Expéditeur" : "Expéditeur")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  item.status === "ACCEPTED" && styles.statusBadgeAccepted,
                  item.status === "REJECTED" && styles.statusBadgeRejected,
                  item.status === "PENDING" && (isMySentProposal ? styles.statusBadgeCounterSent : styles.statusBadgePending),
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    item.status === "ACCEPTED" && { backgroundColor: "#10B981" },
                    item.status === "REJECTED" && { backgroundColor: "#EF4444" },
                    item.status === "PENDING" && { backgroundColor: isMySentProposal ? "#3B82F6" : "#F59E0B" },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.status === "ACCEPTED" && styles.textAccepted,
                    item.status === "REJECTED" && styles.textRejected,
                    item.status === "PENDING" && (isMySentProposal ? styles.textCounterSent : styles.textPending),
                  ]}
                >
                  {item.status === "ACCEPTED"
                    ? isArabic ? "مقبول ✅" : "Accepté ✅"
                    : item.status === "REJECTED"
                    ? isArabic ? "مرفوض ❌" : "Refusé ❌"
                    : isMySentProposal
                    ? isArabic ? "اقتراح مضاد 💬" : "Contre-offre 💬"
                    : isArabic ? "قيد الانتظار ⏳" : "En attente ⏳"}
                </Text>
              </View>
            </View>

            {/* Flight Corridor: Departure date directly under departure, Arrival date directly under destination */}
            {(item.offer?.from || item.offer?.to) && (
              <View style={[styles.flightRouteDatesCard, darkMode && styles.flightRouteDatesCardDark]}>
                {/* Left: Departure */}
                <View style={styles.flightLocCol}>
                  <Text style={[styles.flightCityName, darkMode && styles.textWhite]} numberOfLines={1}>
                    {item.offer.from || "Départ"}
                  </Text>
                  <View style={styles.flightDateRow}>
                    <Calendar size={11} color="#64748B" />
                    <Text style={[styles.flightDateText, darkMode && styles.textMutedDark]} numberOfLines={1}>
                      {formattedDepDate || "Flexible"}
                    </Text>
                  </View>
                  {item.offer.departureTime ? (
                    <View style={styles.flightTimeRow}>
                      <Clock size={10} color="#94A3B8" />
                      <Text style={[styles.flightTimeText, darkMode && styles.textMutedDark]} numberOfLines={1}>
                        {item.offer.departureTime}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Center Track */}
                <View style={styles.flightTrackCenter}>
                  <View style={styles.flightTrackLine} />
                  <View style={[styles.flightPlaneBadge, { backgroundColor: primaryColor }]}>
                    <Plane size={11} color="#FFFFFF" />
                  </View>
                </View>

                {/* Right: Destination */}
                <View style={[styles.flightLocCol, styles.alignRight]}>
                  <Text style={[styles.flightCityName, styles.textRight, darkMode && styles.textWhite]} numberOfLines={1}>
                    {item.offer.to || "Destination"}
                  </Text>
                  <View style={[styles.flightDateRow, styles.rowRight]}>
                    <Calendar size={11} color="#64748B" />
                    <Text style={[styles.flightDateText, styles.textRight, darkMode && styles.textMutedDark]} numberOfLines={1}>
                      {formattedDestDate || formattedDepDate || "Flexible"}
                    </Text>
                  </View>
                  {item.offer.destinationTime ? (
                    <View style={[styles.flightTimeRow, styles.rowRight]}>
                      <Clock size={10} color="#94A3B8" />
                      <Text style={[styles.flightTimeText, styles.textRight, darkMode && styles.textMutedDark]} numberOfLines={1}>
                        {item.offer.destinationTime}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Complete Negotiation & Booking Specs Grid */}
            <View style={[styles.specsGrid, darkMode && styles.specsGridDark]}>
              {/* Requested Weight */}
              <View style={styles.specCell}>
                <View style={styles.specHeaderRow}>
                  <Package size={12} color="#64748B" />
                  <Text style={[styles.specLabel, darkMode && styles.textMutedDark]}>
                    {isArabic ? "الوزن المطلوب" : "Poids demandé"}
                  </Text>
                </View>
                <Text style={[styles.specValue, darkMode && styles.textWhite]}>
                  {weight} kg
                </Text>
              </View>

              {/* Original flight rate */}
              <View style={styles.specCell}>
                <View style={styles.specHeaderRow}>
                  <Coins size={12} color="#64748B" />
                  <Text style={[styles.specLabel, darkMode && styles.textMutedDark]}>
                    {isArabic ? "السعر الأصلي" : "Prix vol"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.specValue,
                    originalPrice && originalPrice !== item.proposedPrice ? styles.strikethrough : null,
                    darkMode && styles.textWhite,
                  ]}
                >
                  {originalPrice ? `${originalPrice} $/kg` : "—"}
                </Text>
              </View>

              {/* Proposed Rate per kg */}
              <View style={[styles.specCell, styles.specCellHighlight, { borderColor: primaryColor + "40" }]}>
                <Text style={[styles.specLabelHighlight, { color: primaryColor }]}>
                  {isMySentProposal
                    ? (isArabic ? "سعرك المقترح" : "Votre offre")
                    : (isArabic ? "Tarif proposé" : "Tarif proposé")}
                </Text>
                <Text style={[styles.specValueHighlight, { color: primaryColor }]}>
                  {item.proposedPrice} $/kg
                </Text>
              </View>

              {/* Total Estimated Earnings */}
              <View style={[styles.specCell, styles.specCellTotal]}>
                <Text style={[styles.specLabel, darkMode && styles.textMutedDark]}>
                  {isArabic ? "المجموع المقترح" : "Total estimé"}
                </Text>
                <Text style={[styles.specValueTotal, { color: "#059669" }]}>
                  {proposedTotal} $
                </Text>
              </View>
            </View>

            {/* Card Action Hint Footer */}
            <View style={styles.cardFooterRow}>
              <Text style={[styles.cardFooterText, { color: primaryColor }]}>
                {isArabic ? "عرض التفاصيل والرد على الاقتراح" : "Voir les détails & Décider"}
              </Text>
              <ChevronRight size={14} color={primaryColor} />
            </View>
          </TouchableOpacity>
        );
      })}

      {/* ── COUNTER-OFFER MODAL ── */}
      <Modal
        visible={counterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCounterModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, darkMode && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.textWhite]}>
                {isArabic ? "تقديم اقتراح سعر مضاد 💬" : "Faire une contre-offre 💬"}
              </Text>
              <TouchableOpacity onPress={() => setCounterModalVisible(false)}>
                <X size={20} color={darkMode ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, darkMode && styles.textMutedDark]}>
              {isArabic
                ? `اقترح سعراً جديداً لكل كغ للمرسل (${selectedProposalForCounter?.sender?.name || ""}) بدلاً من ${selectedProposalForCounter?.proposedPrice} $/kg:`
                : `Proposez un nouveau tarif par kg à l'expéditeur au lieu de ${selectedProposalForCounter?.proposedPrice} $/kg :`}
            </Text>

            <View style={[styles.inputRow, darkMode && styles.inputRowDark]}>
              <TextInput
                style={[styles.modalInput, darkMode && styles.textWhite]}
                placeholder={isArabic ? "السعر لكل كغ..." : "ex: 30"}
                placeholderTextColor={darkMode ? "#64748B" : "#94A3B8"}
                keyboardType="decimal-pad"
                value={counterPriceInput}
                onChangeText={setCounterPriceInput}
                autoFocus
              />
              <Text style={[styles.currencyLabel, { color: primaryColor }]}>
                $/kg
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, darkMode && styles.modalCancelBtnDark]}
                onPress={() => setCounterModalVisible(false)}
                disabled={submittingCounter}
              >
                <Text style={styles.modalCancelText}>
                  {isArabic ? "إلغاء" : "Annuler"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: primaryColor }]}
                onPress={handleSendCounter}
                disabled={submittingCounter}
              >
                {submittingCounter ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.btnContent}>
                    <Send size={14} color="#FFFFFF" />
                    <Text style={styles.modalSubmitText}>
                      {isArabic ? "إرسال السعر" : "Envoyer"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 12,
  },
  containerDark: {},
  loadingBox: {
    padding: 16,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  cardAccepted: {
    borderColor: "#A7F3D0",
    backgroundColor: "#F0FDF4",
  },
  cardRejected: {
    opacity: 0.65,
    borderColor: "#FECACA",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  senderCol: {
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: "700",
  },
  senderNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
  },
  roleTag: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginLeft: 3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeAccepted: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  statusBadgeRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  statusBadgePending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  statusBadgeCounterSent: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  textAccepted: {
    color: "#059669",
  },
  textRejected: {
    color: "#DC2626",
  },
  textPending: {
    color: "#D97706",
  },
  textCounterSent: {
    color: "#2563EB",
  },

  // Flight Route & Dates Corridor Card
  flightRouteDatesCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  flightRouteDatesCardDark: {
    backgroundColor: "#0F172A",
    borderColor: "#1E293B",
  },
  flightLocCol: {
    flex: 1,
  },
  flightCityName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  flightDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  flightDateText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  flightTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flightTimeText: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "500",
  },
  flightTrackCenter: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  flightTrackLine: {
    position: "absolute",
    height: 1.5,
    width: "100%",
    backgroundColor: "#CBD5E1",
  },
  flightPlaneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  rowRight: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  textRight: {
    textAlign: "right",
  },

  // Complete Specs Grid
  specsGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  specsGridDark: {
    backgroundColor: "#0F172A",
    borderColor: "#1E293B",
  },
  specCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  specCellHighlight: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  specCellTotal: {
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    paddingLeft: 6,
  },
  specHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 3,
  },
  specLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  specLabelHighlight: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 3,
  },
  specValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  specValueHighlight: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  specValueTotal: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
    fontSize: 11,
  },

  // Summary box
  summaryBox: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryBoxDark: {
    backgroundColor: "#1E293B",
  },
  summaryText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "500",
    lineHeight: 16,
  },

  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Action Buttons
  actionButtonsContainer: {
    gap: 8,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFF5F5",
  },
  rejectBtnDark: {
    backgroundColor: "#450A0A",
    borderColor: "#7F1D1D",
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
  counterBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  counterBtnDark: {
    backgroundColor: "#0C4A6E20",
  },
  counterBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  acceptFullBtn: {
    width: "100%",
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptFullBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Notes
  waitingNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 2,
    padding: 10,
    borderRadius: 9,
    backgroundColor: "#FEF3C7",
  },
  waitingNoteText: {
    fontSize: 11.5,
    color: "#B45309",
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  lockedNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 2,
    padding: 10,
    borderRadius: 9,
    backgroundColor: "#ECFDF5",
  },
  lockedNoteText: {
    fontSize: 11.5,
    color: "#059669",
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textMutedDark: {
    color: "#94A3B8",
  },

  // ── MODAL STYLES ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCardDark: {
    backgroundColor: "#1E293B",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputRowDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  modalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    paddingVertical: 12,
  },
  currencyLabel: {
    fontSize: 15,
    fontWeight: "800",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  modalCancelBtnDark: {
    backgroundColor: "#334155",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  modalSubmitBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
