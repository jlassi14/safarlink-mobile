import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Calendar,
  Star,
  ShieldCheck,
  Lock,
  ChevronRight,
  Package,
  Pencil,
  X,
  Send,
  Plane,
  Clock,
  MessageSquare,
  CheckCircle2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { MyApplicationItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import { priceProposalApi } from "@/lib/api";

export interface BookingItemCardProps {
  item: MyApplicationItem;
  onRevoke?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDispute?: (id: string) => void;
  onContact?: (name: string, avatar?: string) => void;
  onActionSubmitted?: () => void;
  onPress?: (id: string) => void;
}

export default function BookingItemCard({
  item,
  onPress,
  onActionSubmitted,
  onRevoke,
  onComplete,
  onDispute,
  onContact,
}: BookingItemCardProps) {
  const router = useRouter();
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#00A3E0";

  // Update proposal price state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(
    typeof item.totalPrice === "number" ? item.totalPrice : parseFloat(String(item.totalPrice || 0)) || 0
  );
  const [updatedPriceInput, setUpdatedPriceInput] = useState(String(item.totalPrice || ""));
  const [updatingPrice, setUpdatingPrice] = useState(false);

  React.useEffect(() => {
    if (item.totalPrice !== undefined && item.totalPrice !== null) {
      const p = typeof item.totalPrice === "number" ? item.totalPrice : parseFloat(String(item.totalPrice)) || 0;
      setCurrentPrice(p);
      setUpdatedPriceInput(String(p));
    }
  }, [item.totalPrice]);

  const handleUpdatePrice = async () => {
    const pNum = parseFloat(updatedPriceInput);
    if (!pNum || isNaN(pNum) || pNum <= 0) {
      Alert.alert(
        language === "ar" ? "تنبيه" : "Attention",
        language === "ar" ? "يرجى إدخال مبلغ صحيح." : "Veuillez entrer un montant valide."
      );
      return;
    }
    setUpdatingPrice(true);
    try {
      const res = await priceProposalApi.updateProposal(item.id, pNum);
      if (res.data?.success) {
        setCurrentPrice(pNum); // Instantly update displayed price in the card without waiting or reload!
        setUpdateModalVisible(false);
        if (onActionSubmitted) onActionSubmitted();
        Alert.alert(
          language === "ar" ? "تم تعديل السعر ✏️" : "Prix modifié ✏️",
          language === "ar"
            ? `تم تحديث سعرك المقترح بنجاح إلى ${pNum} $/kg.`
            : `Votre proposition a été mise à jour à ${pNum} $/kg.`
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erreur";
      Alert.alert(language === "ar" ? "خطأ" : "Erreur", msg);
    } finally {
      setUpdatingPrice(false);
    }
  };

  const getApplicationStatusColor = (st: string) => {
    const sLower = (st || "").toLowerCase();
    const bStatus = (item.bookingStatus || "").toUpperCase();
    if (bStatus === "COUNTER_OFFER_RECEIVED") {
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: language === "ar" ? "اقتراح مضاد من المسافر 💬" : language === "fr" ? "Contre-offre reçue 💬" : "Counter-Offer Received 💬",
      };
    }

    if (bStatus === "PROPOSAL_PENDING" || sLower === "proposal_pending") {
      return {
        bg: "#FFFBEB",
        text: "#D97706",
        border: "#FDE68A",
        dot: "#F59E0B",
        label: language === "ar" ? "عرض سعر قيد الرد 💬" : language === "fr" ? "Offre de prix en attente ⏳" : "Price Offer Pending ⏳",
      };
    }

    if (bStatus === "PROPOSAL_ACCEPTED" || sLower === "proposal_accepted") {
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: language === "ar" ? "تم قبول السعر 🎉" : language === "fr" ? "Prix accepté 🎉" : "Price Accepted 🎉",
      };
    }

    if (bStatus === "PROPOSAL_REJECTED" || sLower === "proposal_rejected") {
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: language === "ar" ? "تم رفض السعر ✗" : language === "fr" ? "Prix refusé ✗" : "Price Rejected ✗",
      };
    }

    switch (sLower) {
      case "accepted":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: language === "ar" ? "مقبول 🔒" : language === "fr" ? "Accepté 🔒" : "Accepted 🔒",
        };
      case "in_transit":
        return {
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
          dot: "#3B82F6",
          label: language === "ar" ? "في الطريق ✈️" : language === "fr" ? "En vol ✈️" : "In Transit ✈️",
        };
      case "delivered":
        return {
          bg: "#FAF5FF",
          text: "#7C3AED",
          border: "#DDD6FE",
          dot: "#8B5CF6",
          label: language === "ar" ? "تم التوصيل 📦" : language === "fr" ? "Livré 📦" : "Delivered 📦",
        };
      case "completed":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: language === "ar" ? "مكتمل ✅" : language === "fr" ? "Terminé ✅" : "Completed ✅",
        };
      case "disputed":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "نزاع ⚠️" : language === "fr" ? "Litige ⚠️" : "Disputed ⚠️",
        };
      case "pending":
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          dot: "#F59E0B",
          label: language === "ar" ? "قيد الانتظار ⏳" : language === "fr" ? "En attente ⏳" : "Pending ⏳",
        };
      case "rejected":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "مرفوض ✗" : language === "fr" ? "Refusé ✗" : "Declined ✗",
        };
      case "cancelled":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "ملغى ✗" : language === "fr" ? "Annulé ✗" : "Cancelled ✗",
        };
      default: {
        if (sLower === "pending") {
          return {
            bg: "#FFFBEB",
            text: "#D97706",
            border: "#FDE68A",
            dot: "#F59E0B",
            label: language === "ar" ? "قيد الانتظار ⏳" : language === "fr" ? "En attente ⏳" : "Pending ⏳",
          };
        }
        const pStatus = item.paymentStatus?.toUpperCase();
        if ((item.status === "accepted" || sLower === "accepted") && (pStatus === "PENDING" || pStatus === "UNPAID")) {
          return {
            bg: "#FFFBEB",
            text: "#D97706",
            border: "#FDE68A",
            dot: "#F59E0B",
            label: language === "ar" ? "في انتظار الدفع 💳" : language === "fr" ? "Paiement en attente 💳" : "Payment Pending 💳",
          };
        }
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          dot: "#F59E0B",
          label: language === "ar" ? "قيد الانتظار ⏳" : language === "fr" ? "En attente ⏳" : "Pending ⏳",
        };
      }
    }
  };

  const displayName = item.creatorName || "Traveler";
  const displayAvatar = item.creatorAvatar || MOCK_DEFAULT_AVATAR;
  const displayRating = item.creatorRating ? item.creatorRating.toFixed(1) : "5.0";
  const displayDate = item.targetDate || item.myFlightDate || "Flexible";
  const displayWeight = item.requestedWeightKg
    ? `${item.requestedWeightKg} kg`
    : item.myRequestedWeight && item.myRequestedWeight !== "Négociation"
    ? item.myRequestedWeight
    : item.weight || "1 kg";
  const displayPrice =
    item.isPriceProposal || (item.bookingStatus && item.bookingStatus.includes("PROPOSAL"))
      ? `${currentPrice} $/kg`
      : item.myProposedPrice
      ? item.myProposedPrice.replace(/QAR|USD|EUR|TND/gi, "$")
      : item.reward
      ? item.reward.replace(/QAR|USD|EUR|TND/gi, "$")
      : (currentPrice ? `${currentPrice} $` : "Free");

  const statusConfig = getApplicationStatusColor(item.status);
  const payStatus = item.paymentStatus?.toUpperCase();

  const handlePress = () => {
    console.log("[BookingItemCard] Clicked on booking item:", item.id, "isPriceProposal:", item.isPriceProposal);

    if (onPress) {
      onPress(item.id);
      return;
    }

    if (item.isPriceProposal) {
      if (item.bookingStatus === "COUNTER_OFFER_RECEIVED") {
        Alert.alert(
          language === "ar" ? "اقتراح مضاد من المسافر 💬" : "Contre-offre du voyageur 💬",
          language === "ar"
            ? `المسافر يقترح عليك سعر ${currentPrice} $/kg. هل تقبل هذا السعر للمتابعة إلى الحجز والدفع؟`
            : `Le voyageur vous propose un tarif de ${currentPrice} $/kg. Acceptez-vous cette contre-offre pour finaliser votre réservation ?`,
          [
            { text: language === "ar" ? "إغلاق" : "Fermer", style: "cancel" },
            {
              text: language === "ar" ? "رفض" : "Refuser",
              style: "destructive",
              onPress: async () => {
                try {
                  await priceProposalApi.rejectProposal(item.id);
                  if (onActionSubmitted) onActionSubmitted();
                  Alert.alert(
                    language === "ar" ? "تم الرفض" : "Offre refusée",
                    language === "ar" ? "تم رفض الاقتراح المضاد." : "Vous avez refusé cette contre-offre."
                  );
                } catch (e: any) {
                  Alert.alert("Erreur", e?.message || "Erreur");
                }
              },
            },
            {
              text: language === "ar" ? "قبول وحجز ✅" : "Accepter & Réserver ✅",
              onPress: async () => {
                try {
                  const res = await priceProposalApi.acceptProposal(item.id);
                  if (res.data?.success) {
                    if (onActionSubmitted) onActionSubmitted();
                    if (item.targetPostId) {
                      router.push({
                        pathname: "/(app)/offer-details",
                        params: { offerId: item.targetPostId, acceptedProposalId: item.id },
                      });
                    }
                  }
                } catch (e: any) {
                  Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Erreur");
                }
              },
            },
          ]
        );
      } else if (item.bookingStatus === "PROPOSAL_ACCEPTED") {
        Alert.alert(
          language === "ar" ? "عرض سعر مقبول 🎉" : "Offre de prix acceptée 🎉",
          language === "ar"
            ? `وافق المسافر على سعرك (${currentPrice} $/kg). يمكنك الذهاب لتفاصيل الرحلة لإتمام الحجز.`
            : `Le voyageur a accepté votre tarif (${currentPrice} $/kg). Vous pouvez finaliser la réservation.`,
          [
            { text: language === "ar" ? "إغلاق" : "Fermer", style: "cancel" },
            {
              text: language === "ar" ? "عرض الرحلة" : "Voir le vol",
              onPress: () => {
                if (item.targetPostId) {
                  router.push({
                    pathname: "/(app)/offer-details",
                    params: { offerId: item.targetPostId, acceptedProposalId: item.id },
                  });
                }
              },
            },
          ]
        );
      } else if (item.bookingStatus === "PROPOSAL_PENDING") {
        Alert.alert(
          language === "ar" ? "طلب تفاوض قيد الرد 💬" : "Offre de prix en attente 💬",
          language === "ar"
            ? `عرضك الحالي: ${currentPrice} $/kg.\nالمسافر لم يقبل بعد. هل تريد تعديل سعرك؟`
            : `Votre proposition actuelle : ${currentPrice} $/kg.\nLe voyageur n'a pas encore répondu. Souhaitez-vous ajuster votre prix ?`,
          [
            { text: language === "ar" ? "إغلاق" : "Fermer", style: "cancel" },
            {
              text: language === "ar" ? "تعديل السعر ✏️" : "Modifier le prix ✏️",
              onPress: () => {
                setUpdatedPriceInput(String(currentPrice || ""));
                setUpdateModalVisible(true);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          language === "ar" ? "حالة العرض" : "Statut de l'offre",
          language === "ar" ? "تم رفض هذا العرض من المسافر." : "Cette offre de prix a été refusée par le voyageur."
        );
      }
      return;
    }

    if (onPress) {
      onPress(item.id);
      return;
    }

    const targetType =
      item.type === "delivery_proposal"
        ? "delivery_proposal"
        : item.isPriceProposal
        ? "proposal"
        : "booking";

    try {
      router.push({
        pathname: "/(app)/booking-details" as any,
        params: { id: item.id, type: targetType },
      });
    } catch (err) {
      console.warn("[BookingItemCard] Navigation fallback:", err);
      router.push(`/booking-details?id=${item.id}&type=${targetType}` as any);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, darkMode && styles.cardDark]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Top Header: Traveler Info & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.travelerRow}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          <View style={styles.travelerInfoCol}>
            <Text
              style={[styles.travelerName, darkMode && styles.textDark]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
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

      {/* Flight Corridor: Departure with date underneath, Destination with date underneath */}
      <View style={[styles.flightRouteDatesCard, darkMode && styles.flightRouteDatesCardDark]}>
        {/* Departure City + Date underneath */}
        <View style={styles.flightLocCol}>
          <Text style={[styles.flightCityName, darkMode && styles.textDark]} numberOfLines={1}>
            {item.from || "Départ"}
          </Text>
          <View style={styles.flightDateUnderRowLeft}>
            <Calendar size={11} color="#64748B" />
            <Text style={[styles.flightDateUnderText, darkMode && styles.textDark]} numberOfLines={1}>
              {item.myFlightDate || "Flexible"}
            </Text>
          </View>
          {item.departureTime ? (
            <View style={styles.flightTimeUnderRowLeft}>
              <Clock size={10} color="#94A3B8" />
              <Text style={[styles.flightTimeUnderText, darkMode && styles.textMutedDark]} numberOfLines={1}>
                {item.departureTime}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Track icon */}
        <View style={styles.flightTrackCenter}>
          <View style={styles.flightTrackLine} />
          <View style={[styles.flightPlaneBadge, { backgroundColor: primaryColor }]}>
            <Plane size={11} color="#FFFFFF" />
          </View>
        </View>

        {/* Destination City + Date underneath */}
        <View style={[styles.flightLocCol, styles.alignRight]}>
          <Text style={[styles.flightCityName, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
            {item.to || "Destination"}
          </Text>
          <View style={styles.flightDateUnderRowRight}>
            <Calendar size={11} color="#64748B" />
            <Text style={[styles.flightDateUnderText, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
              {item.destinationDate || item.myArrivalDate || (language === "ar" ? "وصول تقديري" : "Estimée")}
            </Text>
          </View>
          {item.destinationTime ? (
            <View style={styles.flightTimeUnderRowRight}>
              <Clock size={10} color="#94A3B8" />
              <Text style={[styles.flightTimeUnderText, styles.textRight, darkMode && styles.textMutedDark]} numberOfLines={1}>
                {item.destinationTime}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Specs Grid: Mon Poids, Dispo Vol, Prix Original, Offre/Prix */}
      <View style={[styles.specsGrid, darkMode && styles.specsGridDark]}>
        {/* Mon Poids / Poids colis */}
        <View style={styles.specBox}>
          <Text style={styles.specLabel} numberOfLines={1}>
            {item.type === "delivery_proposal"
              ? (language === "ar" ? "وزن الطرد" : "Poids colis")
              : (language === "ar" ? "الوزن المطلوب" : "Mon poids")}
          </Text>
          <View style={styles.specValRow}>
            <Package size={11} color="#0284C7" />
            <Text style={[styles.specBoldVal, darkMode && styles.textDark]}>
              {displayWeight}
            </Text>
          </View>
        </View>

        {/* Dispo Vol / Capacité */}
        <View style={styles.specBox}>
          <Text style={styles.specLabel} numberOfLines={1}>
            {item.type === "delivery_proposal"
              ? (language === "ar" ? "القدرة المقترحة" : "Capacité")
              : (language === "ar" ? "المتاح بالرحلة" : "Dispo vol")}
          </Text>
          <Text style={[styles.specBoldVal, { color: "#16A34A" }]}>
            {item.remainingKg !== undefined && item.remainingKg !== null
              ? `${item.remainingKg} kg`
              : item.totalKg
              ? `${item.totalKg} kg`
              : "—"}
          </Text>
        </View>

        {/* Prix Vol Original / Tarif Colis */}
        <View style={styles.specBox}>
          <Text style={styles.specLabel} numberOfLines={1}>
            {item.type === "delivery_proposal"
              ? (language === "ar" ? "سعر الطرد" : "Tarif colis")
              : (language === "ar" ? "السعر الأصلي" : "Prix vol")}
          </Text>
          <Text style={[styles.specValMuted, darkMode && styles.textMutedDark]}>
            {item.originalPricePerKg || "—"}
          </Text>
        </View>

        {/* Offre / Prix Convenu + Mini Pencil Edit Icon */}
        <View style={[styles.specBox, styles.alignRight]}>
          <Text style={styles.specLabel} numberOfLines={1}>
            {item.bookingStatus === "COUNTER_OFFER_RECEIVED"
              ? (language === "ar" ? "المقترح" : "Contre-offre")
              : (language === "ar" ? "سعرك المقترح" : "Votre offre")}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceHighlight, { color: primaryColor }]}>
              {displayPrice}
            </Text>
            {item.bookingStatus === "PROPOSAL_PENDING" && (
              <TouchableOpacity
                style={styles.pencilCircleBtn}
                onPress={() => {
                  setUpdatedPriceInput(String(currentPrice || ""));
                  setUpdateModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Modifier"
              >
                <Pencil size={11} color={primaryColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Footer Bar: Escrow Chip + Clickable "Voir détails ›" */}
      <View style={[styles.footerRow, darkMode && styles.footerRowDark]}>
        <View style={styles.escrowIndicator}>
          {payStatus === "HELD" ? (
            <>
              <Lock size={12} color="#16A34A" />
              <Text style={styles.escrowHeldText}>
                {language === "ar" ? "الضمان مفعل" : "Escrow Sécurisé"}
              </Text>
            </>
          ) : payStatus === "RELEASED" ? (
            <>
              <ShieldCheck size={12} color="#0284C7" />
              <Text style={styles.escrowReleasedText}>
                {language === "ar" ? "الأرباح محولة" : "Fonds Transférés"}
              </Text>
            </>
          ) : payStatus === "PENDING" || payStatus === "UNPAID" ? (
            <>
              <Clock size={12} color="#D97706" />
              <Text style={{ fontSize: 11, color: "#D97706", fontWeight: "600" }}>
                {language === "ar" ? "في انتظار الدفع" : "Paiement en attente"}
              </Text>
            </>
          ) : (
            <Text style={styles.escrowNoneText}>
              {language === "ar" ? "حجز مباشر" : "SafarLink Direct"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewDetailsText, { color: primaryColor }]}>
            {language === "ar"
              ? "عرض التفاصيل"
              : language === "fr"
              ? "Voir détails"
              : "View details"}
          </Text>
          <ChevronRight size={14} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* ── CONTEXTUAL ACTIONS ROW ── */}
      {item.status === "accepted" ? (
        <View style={{ flexDirection: "column", gap: 8, width: "100%", marginTop: 10 }}>
          <View style={styles.escrowBannerBox}>
            <ShieldCheck size={14} color="#16A34A" />
            <Text style={styles.escrowBannerText}>
              {language === "ar"
                ? "🔒 المبلغ مؤمن في الضمان: سيتم تحرير أرباحك فور تأكيد الاستلام."
                : "🔒 Paiement garanti sous séquestre : vos gains vous seront versés dès livraison confirmée."}
            </Text>
          </View>

          {onComplete && (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: "#16A34A" }]}
              onPress={() => onComplete(item.id)}
              activeOpacity={0.85}
            >
              <Package size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.primaryActionBtnText}>
                {language === "ar" ? "تأكيد تسليم الشحنة 📦" : "Marquer comme livré 📦"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: primaryColor, flex: 1 }]}
              onPress={() => {
                if (onContact) {
                  onContact(displayName, displayAvatar);
                } else {
                  router.push({
                    pathname: "/(app)/chat/[id]" as any,
                    params: { id: `chat_${item.id}` },
                  });
                }
              }}
              activeOpacity={0.85}
            >
              <MessageSquare size={13} color="#FFFFFF" />
              <Text style={styles.secondaryActionBtnText}>
                {language === "ar" ? "مراسلة 💬" : "Contacter 💬"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionBtn,
                {
                  backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                  borderColor: primaryColor + "40",
                  borderWidth: 1,
                  paddingHorizontal: 12,
                },
              ]}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryActionBtnText, { color: primaryColor }]}>
                {language === "ar" ? "التفاصيل ➔" : "Détails ➔"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : item.status === "delivered" ? (
        <View style={{ flexDirection: "column", gap: 8, width: "100%", marginTop: 10 }}>
          <View style={styles.deliveredPendingBanner}>
            <Clock size={13} color="#0D9488" />
            <Text style={styles.deliveredPendingBannerText}>
              {language === "ar"
                ? "تم تسليم الشحنة - بانتظار تأكيد الاستلام من الطرف الآخر ⏳"
                : "Colis livré - En attente de confirmation de réception ⏳"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: primaryColor, flex: 1 }]}
              onPress={() => {
                if (onContact) {
                  onContact(displayName, displayAvatar);
                } else {
                  router.push({
                    pathname: "/(app)/chat/[id]" as any,
                    params: { id: `chat_${item.id}` },
                  });
                }
              }}
              activeOpacity={0.85}
            >
              <MessageSquare size={13} color="#FFFFFF" />
              <Text style={styles.secondaryActionBtnText}>
                {language === "ar" ? "مراسلة 💬" : "Contacter 💬"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionBtn,
                {
                  backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                  borderColor: primaryColor + "40",
                  borderWidth: 1,
                  paddingHorizontal: 12,
                },
              ]}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryActionBtnText, { color: primaryColor }]}>
                {language === "ar" ? "التفاصيل ➔" : "Détails ➔"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : item.status === "completed" ? (
        <View style={styles.completedBanner}>
          <CheckCircle2 size={14} color="#059669" />
          <Text style={styles.completedBannerText}>
            {language === "ar"
              ? "تم إكمال الطلب وتحرير الأرباح بنجاح 🎉"
              : "Livraison terminée ! Paiement libéré 💰"}
          </Text>
        </View>
      ) : item.status === "disputed" ? (
        <View style={styles.disputedBanner}>
          <Text style={styles.disputedBannerText}>
            {language === "ar"
              ? "نزاع مفتوح - قيد المراجعة من الإدارة ⚠️"
              : "Litige ouvert - Examen en cours ⚠️"}
          </Text>
        </View>
      ) : item.status === "pending" && onRevoke ? (
        <View style={{ marginTop: 10, width: "100%", flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity
            style={styles.revokeBtn}
            onPress={() => onRevoke(item.id)}
            activeOpacity={0.85}
          >
            <X size={12} color="#DC2626" />
            <Text style={styles.revokeBtnText}>
              {language === "ar" ? "سحب العرض" : "Retirer la proposition"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── UPDATE PRICE MODAL ── */}
      <Modal
        visible={updateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, darkMode && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
                {language === "ar" ? "تعديل عرض السعر ✏️" : "Modifier votre offre ✏️"}
              </Text>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <X size={20} color={darkMode ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, darkMode && styles.textDark]}>
              {language === "ar"
                ? `طالما أن المسافر لم يوافق بعد، يمكنك تعديل المبلغ المقترح لكل كغ (الحالي: ${currentPrice} $/kg):`
                : `Tant que le voyageur n'a pas encore répondu, vous pouvez ajuster votre tarif par kg (actuel : ${currentPrice} $/kg) :`}
            </Text>

            <View style={[styles.modalInputRow, darkMode && styles.modalInputRowDark]}>
              <TextInput
                style={[styles.modalInput, darkMode && styles.textDark]}
                placeholder={language === "ar" ? "السعر لكل كغ..." : "ex: 30"}
                placeholderTextColor={darkMode ? "#64748B" : "#94A3B8"}
                keyboardType="decimal-pad"
                value={updatedPriceInput}
                onChangeText={setUpdatedPriceInput}
                autoFocus
              />
              <Text style={[styles.modalCurrency, { color: primaryColor }]}>
                $/kg
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, darkMode && styles.modalCancelBtnDark]}
                onPress={() => setUpdateModalVisible(false)}
                disabled={updatingPrice}
              >
                <Text style={styles.modalCancelText}>
                  {language === "ar" ? "إلغاء" : "Annuler"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: primaryColor }]}
                onPress={handleUpdatePrice}
                disabled={updatingPrice}
              >
                {updatingPrice ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.btnContent}>
                    <Send size={14} color="#FFFFFF" />
                    <Text style={styles.modalSubmitText}>
                      {language === "ar" ? "تأكيد التعديل" : "Mettre à jour"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: "#111827",
    borderColor: "#1F2937",
  },
  textDark: {
    color: "#F8FAFC",
  },

  // ── TOP ROW ──
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  travelerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  travelerInfoCol: {
    flex: 1,
  },
  travelerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
    alignSelf: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── ROUTE & DATES CORRIDOR ──
  flightRouteDatesCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  flightRouteDatesCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  flightLocCol: {
    flex: 1,
  },
  flightCityName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },
  flightDateUnderRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap",
  },
  flightDateUnderRowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    flexWrap: "nowrap",
  },
  flightDateUnderText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    flexShrink: 1,
  },
  flightTrackCenter: {
    width: 40,
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
  flightTimeUnderRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  flightTimeUnderRowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  flightTimeUnderText: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "500",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  textRight: {
    textAlign: "right",
  },

  // ── SPECS & PRICING GRID ──
  specsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  specsGridDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  specBox: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },
  specValRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  specBoldVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  specValMuted: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  textMutedDark: {
    color: "#94A3B8",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  priceHighlight: {
    fontSize: 13,
    fontWeight: "800",
  },
  pencilCircleBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // ── FOOTER ROW ──
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerRowDark: {
    borderTopColor: "#1F2937",
  },
  escrowIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  escrowHeldText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
  },
  escrowReleasedText: {
    fontSize: 11,
    color: "#0284C7",
    fontWeight: "600",
  },
  escrowNoneText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
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
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  modalInputRowDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  modalInput: {
    flex: 1,
    height: 48,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalCurrency: {
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  modalCancelBtnDark: {
    backgroundColor: "#334155",
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  modalSubmitBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  escrowBannerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 6,
  },
  escrowBannerText: {
    fontSize: 11.5,
    color: "#15803D",
    fontWeight: "600",
    flex: 1,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deliveredPendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  deliveredPendingBannerText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "700",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  completedBannerText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
  },
  disputedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  disputedBannerText: {
    fontSize: 12,
    color: "#E11D48",
    fontWeight: "700",
  },
  revokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  revokeBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#DC2626",
  },
});
