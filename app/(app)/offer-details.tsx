import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  Plane,
  Package,
  Lock,
  Trash2,
} from "lucide-react-native";
import EditOfferModal from "@/components/offers/EditOfferModal";
import DemandActionCard from "@/components/offers/DemandActionCard";
import TunisiaDeliveryDetailsCard from "@/components/TunisiaDeliveryDetailsCard";
import { REAL_MOCK_OFFERS, OfferItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import { offerApi, bookingApi, priceProposalApi } from "@/lib/api";

type DemandFilter = "all" | "pending" | "accepted" | "rejected";

const formatLocationOneLine = (raw?: string) => {
  if (!raw) return "";
  const str = raw.trim();
  if (str.includes("-")) {
    const parts = str.split("-").map((p) => p.trim());
    if (parts.length >= 2) {
      const countryPart = parts[0];
      const cityPart = parts[1];
      const flagMatch = str.match(/[\uD83C][\uDDE6-\uDDFF]{2}/);
      const flag = flagMatch ? ` ${flagMatch[0]}` : "";
      const cleanCity = cityPart.replace(/[\uD83C][\uDDE6-\uDDFF]{2}/, "").trim();
      const cleanCountry = countryPart.replace(/[\uD83C][\uDDE6-\uDDFF]{2}/, "").trim();
      if (!cleanCity || cleanCity.toLowerCase() === cleanCountry.toLowerCase()) {
        return `${cleanCountry}${flag}`;
      }
      return `${cleanCity}, ${cleanCountry}${flag}`;
    }
  }
  return str;
};

export default function OfferDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode, user } = useAppStore();
  const params = useLocalSearchParams<{ offerId?: string; from?: string }>();
  const offerIdParam = params.offerId;
  const fromParam = params.from;
  const primaryColor = colors.primary || "#2563EB";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fromParam === "notifications") {
      router.replace("/(app)/(tabs)/notifications");
    } else if (fromParam === "requests") {
      router.replace("/(app)/(tabs)/requests");
    } else if (fromParam === "home") {
      router.replace("/(app)/(tabs)/home");
    } else {
      router.replace("/(app)/(tabs)/offers");
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [fromParam]);

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 20) + 4;

  const matchedMock = REAL_MOCK_OFFERS.find((o) => o.id === offerIdParam);
  const [offer, setOffer] = useState<OfferItem | null>(matchedMock || null);
  const [loading, setLoading] = useState<boolean>(!matchedMock);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [proposalsCount, setProposalsCount] = useState<number>(0);

  const [activeFilter, setActiveFilter] = useState<DemandFilter>("all");
  const [editingModalVisible, setEditingModalVisible] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const loadOfferData = useCallback(async (silent = false) => {
    if (!offerIdParam) return;
    const mock = REAL_MOCK_OFFERS.find((o) => o.id === offerIdParam);
    if (mock) {
      setOffer(mock);
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    setErrorMsg(null);
    try {
      const [offerResult, bookingsResult, proposalsResult] = await Promise.allSettled([
        offerApi.getOfferById(offerIdParam),
        bookingApi.getOfferBookings(offerIdParam),
        priceProposalApi.getProposals({ offerId: offerIdParam }),
      ]);

      if (
        proposalsResult.status === "fulfilled" &&
        proposalsResult.value.data?.success &&
        Array.isArray(proposalsResult.value.data.data)
      ) {
        setProposalsCount(proposalsResult.value.data.data.length);
      }

      if (offerResult.status === "fulfilled" && offerResult.value.data?.success && offerResult.value.data.data) {
        const o = offerResult.value.data.data;
        const rawDepDate = o.departureDate ? new Date(o.departureDate) : new Date();
        const formattedDepDate = isNaN(rawDepDate.getTime())
          ? String(o.departureDate || "")
          : rawDepDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

        const rawDestDate = o.destinationDate ? new Date(o.destinationDate) : rawDepDate;
        const formattedDestDate = isNaN(rawDestDate.getTime())
          ? String(o.destinationDate || formattedDepDate)
          : rawDestDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

        const totalKgNum = Number(o.totalKg) || 0;
        const remainingKgNum = Number(o.remainingKg ?? o.totalKg) || 0;

        let receivedDemands: any[] = [];
        const bookedClientIds = new Set<string>();

        if (
          bookingsResult.status === "fulfilled" &&
          bookingsResult.value.data?.success &&
          Array.isArray(bookingsResult.value.data.data)
        ) {
          receivedDemands = bookingsResult.value.data.data.map((b: any) => {
            if (b.senderId) bookedClientIds.add(b.senderId);
            return {
              id: b.id,
              senderName: b.sender?.name || "Sender",
              senderAvatar: b.sender?.avatar || MOCK_DEFAULT_AVATAR,
              senderRating: b.sender?.rating || 4.9,
              weightKg: b.weightKg,
              weight: `${b.weightKg} kg`,
              reward: `${b.totalPrice} $`,
              status: b.status.toLowerCase(),
              paymentStatus: b.paymentStatus,
              date: new Date(b.createdAt).toLocaleDateString(),
              deliveryMethod: b.deliveryMethod || null,
              deliveryContactName: b.deliveryContactName || null,
              deliveryContactPhone: b.deliveryContactPhone || null,
              deliveryFee: b.deliveryFee !== undefined && b.deliveryFee !== null ? b.deliveryFee : null,
              deliveryPaymentMethod: b.deliveryPaymentMethod || null,
              deliveryAddress: b.deliveryAddress || null,
              deliveryStatus: b.deliveryStatus || null,
              senderAction: b.senderAction || null,
              travelerAction: b.travelerAction || null,
              isPriceProposal: false,
            };
          });
        }

        // Also merge price negotiation proposals as demands — ONE card per client thread!
        if (
          proposalsResult.status === "fulfilled" &&
          proposalsResult.value.data?.success &&
          Array.isArray(proposalsResult.value.data.data)
        ) {
          // Group proposals by the counterpart client user ID
          const proposalsByCounterpart = new Map<string, any[]>();
          proposalsResult.value.data.data.forEach((p: any) => {
            const clientUserId = p.senderId === user?.id ? p.receiverId : p.senderId;
            if (!clientUserId) return;
            // If there is already a confirmed booking for this client, skip proposals to avoid duplicates
            if (bookedClientIds.has(clientUserId)) return;

            if (!proposalsByCounterpart.has(clientUserId)) {
              proposalsByCounterpart.set(clientUserId, []);
            }
            proposalsByCounterpart.get(clientUserId)!.push(p);
          });

          const proposalDemands: any[] = [];
          proposalsByCounterpart.forEach((props, clientUserId) => {
            // Sort by createdAt descending (newest first)
            props.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // Active pending proposal takes precedence, else the most recent proposal
            const activeProp = props.find((p: any) => p.status === "PENDING") || props[0];

            // The client is always the other party (NEVER the traveler themselves!)
            const clientUser = activeProp.senderId === user?.id ? activeProp.receiver : activeProp.sender;
            const isCounterOffer = activeProp.senderId === user?.id;

            proposalDemands.push({
              id: activeProp.id,
              senderName: clientUser?.name || "Expéditeur",
              senderAvatar: clientUser?.avatar || MOCK_DEFAULT_AVATAR,
              senderRating: clientUser?.averageRating || 5.0,
              weightKg: activeProp.weightKg || 1,
              weight: `${activeProp.weightKg || 1} kg`,
              reward: `${Number(((activeProp.weightKg || 1) * activeProp.proposedPrice).toFixed(1))} $`,
              proposedPrice: `${activeProp.proposedPrice} $/kg`,
              status: activeProp.status.toLowerCase(),
              isPriceProposal: true,
              isCounterOffer,
              counterpartId: clientUserId,
              date: new Date(activeProp.createdAt).toLocaleDateString(),
            });
          });

          receivedDemands = [...receivedDemands, ...proposalDemands];
        }

        setOffer({
          id: o.id,
          from: o.from,
          to: o.to,
          flightDate: formattedDepDate,
          departureDate: formattedDepDate,
          departureTime: o.departureTime || "14:30",
          destinationDate: formattedDestDate,
          destinationTime: o.destinationTime || "18:45",
          totalKg: totalKgNum,
          remainingKg: remainingKgNum,
          capacity: `${remainingKgNum.toFixed(1)} kg available`,
          pricePerKg: `${o.pricePerKg} $/kg`,
          status: o.status === "ACTIVE" ? "Active" : o.status === "FULL" ? "Fully Booked" : o.status,
          deliveryMethod: o.deliveryMethod || null,
          deliveryContactName: o.deliveryContactName || null,
          deliveryContactPhone: o.deliveryContactPhone || null,
          deliveryFee: o.deliveryFee !== undefined && o.deliveryFee !== null ? o.deliveryFee : null,
          deliveryPaymentMethod: o.deliveryPaymentMethod || null,
          deliveryAddress: o.deliveryAddress || null,
          deliveryStatus: o.deliveryStatus || null,
          demands: receivedDemands,
        });
      } else {
        setErrorMsg("Offer not found");
      }
    } catch (err) {
      console.error("Error loading offer details:", err);
      setErrorMsg("Failed to load offer details");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [offerIdParam]);

  useEffect(() => {
    loadOfferData();
  }, [loadOfferData]);

  const totalKg = Number(offer?.totalKg) || 0;

  const bookedFromDemands = (offer?.demands || [])
    .filter((d) => ["accepted", "in_transit", "delivered", "completed"].includes(d.status))
    .reduce((sum, d) => sum + (Number(d.weightKg) || 0), 0);

  const remainingKg =
    typeof offer?.remainingKg === "number" && !isNaN(offer.remainingKg)
      ? offer.remainingKg
      : Math.max(0, totalKg - bookedFromDemands);

  const bookedKg = Math.max(0, totalKg - remainingKg);
  const bookedPercent = totalKg > 0 ? Math.min(100, (bookedKg / totalKg) * 100) : 0;
  const isFullyBooked = remainingKg <= 0 || (totalKg > 0 && bookedKg >= totalKg);
  const hasAccepted = bookedKg > 0;

  const handleDeleteOffer = () => {
    if (!offer) return;

    if (hasAccepted) {
      Alert.alert(
        language === "ar" ? "تعذر حذف العرض" : "Impossible de supprimer l'annonce",
        language === "ar"
          ? "لا يمكنك حذف هذا العرض لأن هناك حجوزات مؤكدة بالفعل. يرجى إتمامها أو إلغائها أولاً."
          : "Vous ne pouvez pas supprimer cette annonce car des réservations ont déjà été confirmées."
      );
      return;
    }

    Alert.alert(
      language === "ar" ? "حذف عرض الرحلة" : "Supprimer l'annonce de vol",
      language === "ar"
        ? "هل أنت متأكد من رغبتك في حذف هذا العرض نهائياً؟ سيتم إلغاء أي طلبات معلقة بدون رسوم."
        : "Êtes-vous sûr de vouloir supprimer cette annonce ? Les éventuelles demandes en attente seront annulées sans frais.",
      [
        { text: language === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "حذف" : "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              if (!offer.id.startsWith("off_mock")) {
                await offerApi.deleteOffer(offer.id);
              }
              Alert.alert(
                language === "ar" ? "تم الحذف" : "Annonce supprimée",
                language === "ar" ? "تم حذف عرض الرحلة بنجاح." : "Votre annonce de vol a été supprimée avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(app)/(tabs)/offers"),
                  },
                ]
              );
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Échec de la suppression de l'annonce";
              Alert.alert(language === "ar" ? "خطأ" : "Erreur", msg);
            }
          },
        },
      ]
    );
  };

  const filteredDemands = (offer?.demands || []).filter((demand) => {
    if (activeFilter === "pending") return demand.status === "pending";
    if (activeFilter === "accepted") return demand.status === "accepted";
    if (activeFilter === "rejected") return demand.status === "rejected";
    return true;
  });

  const handleAcceptDemand = (demandId: string, senderName: string) => {
    const targetDemand = offer?.demands?.find((d) => d.id === demandId);
    if (!targetDemand || !offer) return;

    const targetWeight = targetDemand.weightKg || 1;
    if (targetWeight > remainingKg) {
      Alert.alert(t("capacityLimitTitle", language), t("capacityLimitMessage", language));
      return;
    }

    const isSecured =
      targetDemand.paymentStatus?.toUpperCase() === "HELD" ||
      targetDemand.paymentStatus?.toUpperCase() === "AUTHORIZED";

    if (!isSecured) {
      Alert.alert(
        language === "ar" ? "الدفع غير مؤمن بعد" : language === "fr" ? "Paiement en attente ⚠️" : "Escrow Payment Pending",
        language === "ar"
          ? "لم يقم المرسل بإتمام تفويض الدفع عبر PayPal بعد. لا يمكنك قبول الطلب حتى تصبح العملية مؤمنة."
          : language === "fr"
          ? "L'expéditeur n'a pas encore finalisé le paiement PayPal en séquestre. Vous ne pourrez accepter la demande qu'une fois les fonds sécurisés."
          : "The sender has not pre-authorized payment yet. You can only accept once payment is secured."
      );
      return;
    }

    const confirmMsg = t("acceptDemandConfirmMessage", language, {
      name: senderName,
      weight: targetWeight,
    });

    Alert.alert(t("acceptDemandConfirmTitle", language), confirmMsg, [
      { text: t("cancel", language), style: "cancel" },
      {
        text: t("acceptDemandConfirmTitle", language),
        style: "default",
        onPress: async () => {
          try {
            const res = await bookingApi.acceptBooking(demandId);
            if (res.data?.success) {
              const newAcceptedSum = acceptedSumKg + targetWeight;
              const newRemaining = Math.max(0, offer.totalKg - newAcceptedSum);

              setOffer((prev: any) => ({
                ...prev,
                status: newRemaining === 0 ? "Fully Booked" : "Active",
                capacity: `${newRemaining.toFixed(1)} kg available`,
                demands: prev.demands.map((d: any) =>
                  d.id === demandId
                    ? { ...d, status: "accepted" as const, paymentStatus: "HELD" }
                    : d
                ),
              }));
              Alert.alert(
                t("demandAcceptedSuccessTitle", language) || "Booking Accepted",
                t("demandAcceptedSuccessMessage", language) || "You have accepted the baggage booking request."
              );
            } else {
              Alert.alert("Error", res.data?.message || "Failed to accept booking");
            }
          } catch (err: any) {
            const errMsg = err?.response?.data?.message || err?.message || "Failed to accept booking";
            Alert.alert("Error", errMsg);
          }
        },
      },
    ]);
  };

  const handleRejectDemand = (demandId: string, senderName: string) => {
    Alert.alert(
      t("rejectDemandConfirmTitle", language),
      t("rejectDemandConfirmMessage", language),
      [
        { text: t("cancel", language), style: "cancel" },
        {
          text: t("rejectDemandConfirmTitle", language),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await bookingApi.rejectBooking(demandId);
              if (res.data?.success) {
                setOffer((prev: any) => ({
                  ...prev,
                  demands: prev.demands.map((d: any) =>
                    d.id === demandId ? { ...d, status: "rejected" as const } : d
                  ),
                }));
              } else {
                Alert.alert("Error", res.data?.message || "Failed to reject booking");
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.message || err?.message || "Failed to decline booking";
              Alert.alert("Error", errMsg);
            }
          },
        },
      ]
    );
  };

  const handleCancelAcceptance = (demandId: string, senderName: string) => {
    Alert.alert(
      t("revokeConfirmTitle", language),
      t("revokeConfirmMessage", language),
      [
        { text: t("cancel", language), style: "cancel" },
        {
          text: t("revokeAcceptance", language),
          style: "destructive",
          onPress: () => {
            setOffer((prev) => {
              const updatedDemands = prev.demands.map((d) =>
                d.id === demandId ? { ...d, status: "pending" as const } : d
              );
              const newAcceptedSum = updatedDemands
                .filter((d) => d.status === "accepted")
                .reduce((sum, d) => sum + (d.weightKg || 0), 0);

              const newRemaining = Math.max(0, prev.totalKg - newAcceptedSum);

              return {
                ...prev,
                status: newRemaining === 0 ? "Fully Booked" : "Active",
                capacity: `${newRemaining.toFixed(1)} kg available`,
                demands: updatedDemands,
              };
            });
          },
        },
      ]
    );
  };

  const handleMarkInTransit = (demandId: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد صعود الرحلة" : "Confirm Flight Boarding",
      language === "ar"
        ? "هل بدأت رحلتك؟ سيتم تحديث حالة الشحنة إلى (في الطريق ✈️) وإشعار المرسل."
        : "Has your flight started? The package will be marked as in-transit and sender will be notified.",
      [
        { text: t("cancel", language) || "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد ✈️" : "Confirm ✈️",
          style: "default",
          onPress: async () => {
            try {
              const res = await bookingApi.markInTransit(demandId);
              if (res.data?.success) {
                setOffer((prev: any) => ({
                  ...prev,
                  demands: prev.demands.map((d: any) =>
                    d.id === demandId ? { ...d, status: "in_transit" } : d
                  ),
                }));
                Alert.alert("Success", "Booking marked as in-transit.");
              } else {
                Alert.alert("Error", res.data?.message || "Failed to update");
              }
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to update");
            }
          },
        },
      ]
    );
  };

  const handleMarkDelivered = (demandId: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد تسليم الشحنة" : "Confirm Package Delivery",
      language === "ar"
        ? "هل قمت بتسليم الشحنة بنجاح؟ سيُطلب من المرسل تأكيد الاستلام لتحرير مستحقاتك من الضمان."
        : "Have you delivered the package? The sender will be asked to confirm and release your escrow payout.",
      [
        { text: t("cancel", language) || "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "تم التسليم 📦" : "Delivered 📦",
          style: "default",
          onPress: async () => {
            try {
              const res = await bookingApi.markDelivered(demandId);
              if (res.data?.success) {
                setOffer((prev: any) => ({
                  ...prev,
                  demands: prev.demands.map((d: any) =>
                    d.id === demandId ? { ...d, status: "delivered" } : d
                  ),
                }));
                Alert.alert("Success", "Package marked as delivered.");
              } else {
                Alert.alert("Error", res.data?.message || "Failed to update");
              }
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to update");
            }
          },
        },
      ]
    );
  };

  const handleSaveEditOffer = async (payload: {
    totalKg: number;
    pricePerKg: string;
    currency: string;
    flightDate: string;
  }) => {
    const cleanPrice = parseFloat(payload.pricePerKg.replace(/[^0-9.]/g, "")) || 35;
    setEditSaving(true);

    try {
      if (!offer.id.startsWith("off_mock")) {
        await offerApi.updateOffer(offer.id, {
          totalKg: payload.totalKg,
          pricePerKg: cleanPrice,
          currency: payload.currency,
          departureDate: payload.flightDate,
        });
      }

      setOffer((prev) => ({
        ...prev,
        totalKg: payload.totalKg,
        pricePerKg: payload.pricePerKg,
        flightDate: payload.flightDate,
        capacity: `${Math.max(0, payload.totalKg - acceptedSumKg).toFixed(1)} kg available`,
      }));

      setEditingModalVisible(false);
      Alert.alert(t("offerUpdatedTitle", language), t("offerUpdatedMessage", language));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update offer";
      Alert.alert(t("cannotEditOfferTitle", language), msg);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── TOP APP BAR ── */}
      <View style={[styles.appBar, darkMode && styles.appBarDark, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, darkMode && styles.backBtnDark]}
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={18} color={darkMode ? "#FFFFFF" : "#0F172A"} />
        </TouchableOpacity>

        <View style={styles.appBarTitleCol}>
          <Text style={[styles.appBarTitle, darkMode && styles.textDark]}>
            {t("offerDetailsHeader", language)}
          </Text>
          {offer ? (
            <Text style={styles.appBarSubtitle} numberOfLines={1}>
              {offer.from.split("-")[0].trim()} ➔ {offer.to.split("-")[0].trim()}
            </Text>
          ) : null}
        </View>

        {offer ? (
          <View style={styles.headerActionsRow}>
            <TouchableOpacity
              style={[styles.editIconBtn, darkMode && styles.editIconBtnDark, hasAccepted && styles.disabledBtn]}
              onPress={() => {
                if (hasAccepted) {
                  Alert.alert(t("cannotEditOfferTitle", language), t("cannotEditOfferMessage", language));
                  return;
                }
                setEditingModalVisible(true);
              }}
            >
              {hasAccepted ? <Lock size={15} color="#94A3B8" /> : <Edit2 size={15} color={primaryColor} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteIconBtn, darkMode && styles.deleteIconBtnDark]}
              onPress={handleDeleteOffer}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={15} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* ── LOADER STATE ── */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loaderText, darkMode && styles.textDark]}>
            {language === "ar"
              ? "جاري تحميل تفاصيل العرض..."
              : language === "fr"
              ? "Chargement des détails de l'offre..."
              : "Loading flight offer details..."}
          </Text>
        </View>
      ) : !offer ? (
        <View style={styles.loaderContainer}>
          <Package size={44} color="#94A3B8" />
          <Text style={[styles.loaderText, darkMode && styles.textDark]}>
            {errorMsg || (language === "ar" ? "لم يتم العثور على العرض" : "Offer not found")}
          </Text>
          <TouchableOpacity
            style={[styles.goBackBtn, { backgroundColor: primaryColor }]}
            onPress={handleBack}
          >
            <Text style={styles.goBackBtnText}>
              {language === "ar" ? "الرجوع" : language === "fr" ? "Retour" : "Go Back"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── SCROLLABLE BODY ── */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Flight Overview Card */}
          <View style={[styles.overviewCard, darkMode && styles.overviewCardDark]}>
            <View style={styles.cardTopRow}>
              <Text style={[styles.priceText, { color: primaryColor }]}>{offer.pricePerKg}</Text>
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
            </View>

            {/* Route Track Corridor: Departure with date and time underneath, Destination with date and time underneath */}
            <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
              <View style={styles.routeLocCol}>
                <Text
                  style={[styles.routeCityPrimary, darkMode && styles.textDark]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatLocationOneLine(offer.from)}
                </Text>
                <View style={styles.routeScheduleBlock}>
                  <View style={styles.inlineDateRowLeft}>
                    <Calendar size={11} color={primaryColor} />
                    <Text style={[styles.inlineDateText, darkMode && styles.textDark]} numberOfLines={1}>
                      {offer.departureDate || offer.flightDate}
                    </Text>
                  </View>
                  <View style={[styles.timeBadgePill, darkMode && styles.timeBadgePillDark]}>
                    <Clock size={10} color="#64748B" />
                    <Text style={[styles.timeBadgeText, darkMode && styles.textDark]}>
                      {offer.departureTime || "14:30"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.routeFlightTrack}>
                <View style={styles.routeTrackLine} />
                <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
                  <Plane size={11} color="#FFFFFF" />
                </View>
              </View>

              <View style={[styles.routeLocCol, styles.alignRight]}>
                <Text
                  style={[styles.routeCityPrimary, styles.textRight, darkMode && styles.textDark]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatLocationOneLine(offer.to)}
                </Text>
                <View style={[styles.routeScheduleBlock, styles.alignRight]}>
                  <View style={styles.inlineDateRowRight}>
                    <Calendar size={11} color={primaryColor} />
                    <Text style={[styles.inlineDateText, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
                      {offer.destinationDate || offer.departureDate || offer.flightDate}
                    </Text>
                  </View>
                  <View style={[styles.timeBadgePill, styles.timeBadgePillRight, darkMode && styles.timeBadgePillDark]}>
                    <Clock size={10} color="#64748B" />
                    <Text style={[styles.timeBadgeText, darkMode && styles.textDark]}>
                      {offer.destinationTime || "18:45"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Capacity Progress Bar */}
            <View style={[styles.capacityProgressBox, darkMode && styles.capacityProgressBoxDark]}>
              <View style={styles.progressTextRow}>
                <View>
                  <Text style={[styles.progressLabelText, darkMode && styles.textDark]}>
                    {t("remainingCapacity", language)}
                  </Text>
                  <Text style={[styles.progressRemainingText, isFullyBooked && styles.fullBookedRedText]}>
                    {remainingKg.toFixed(1)} kg {language === "ar" ? "متاح" : language === "fr" ? "disponible" : "available"}
                  </Text>
                </View>

                <View style={styles.alignRight}>
                  <Text style={styles.progressBookedSubText}>
                    {language === "ar" ? "المحجوز" : language === "fr" ? "Réservé" : "Booked"}
                  </Text>
                  <Text style={[styles.progressBookedText, darkMode && styles.textDark]}>
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
          </View>

          {/* Tunisia Domestic Delivery Full Details Card */}
          {offer.deliveryMethod ? (
            <TunisiaDeliveryDetailsCard
              deliveryMethod={offer.deliveryMethod}
              contactName={offer.deliveryContactName}
              contactPhone={offer.deliveryContactPhone}
              deliveryFee={offer.deliveryFee}
              paymentMethod={offer.deliveryPaymentMethod}
              deliveryAddress={offer.deliveryAddress}
              deliveryStatus={offer.deliveryStatus}
              bookingStatus={offer.status}
              isTraveler={true}
              hidePricing={true}
            />
          ) : null}

          {/* Demands Section Header */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Package size={16} color={primaryColor} />
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                {t("receivedDemandsSummary", language)}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: primaryColor + "18" }]}>
                <Text style={[styles.countBadgeText, { color: primaryColor }]}>
                  {(offer.demands || []).filter((d) => !d.isPriceProposal && d.status !== "cancelled" && d.status !== "rejected").length}
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterTabsContainer}>
            {(["all", "pending", "accepted", "rejected"] as DemandFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterTabPill,
                  darkMode && styles.filterTabPillDark,
                  activeFilter === f && [styles.filterTabPillActive, { backgroundColor: primaryColor }],
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === f && styles.filterTabTextActive,
                  ]}
                >
                  {f === "all"
                    ? t("tabAllShort", language)
                    : f === "pending"
                    ? t("tabPendingShort", language)
                    : f === "accepted"
                    ? t("tabAcceptedShort", language)
                    : t("tabRejectedShort", language)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Demands List (Bookings & In-App Price Proposals) */}
          {filteredDemands.length > 0 ? (
            filteredDemands.map((d) => (
              <DemandActionCard
                key={d.id}
                demand={d}
                remainingKg={remainingKg}
                onPress={(id) =>
                  router.push({
                    pathname: "/(app)/booking-details" as any,
                    params: { id, type: d.isPriceProposal ? "proposal" : "booking" },
                  })
                }
                onAccept={handleAcceptDemand}
                onReject={handleRejectDemand}
                onRevoke={handleCancelAcceptance}
                onMarkInTransit={handleMarkInTransit}
                onMarkDelivered={handleMarkDelivered}
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Package size={36} color="#94A3B8" />
              <Text style={[styles.emptyText, darkMode && styles.textDark]}>
                {t("noDemandsInCategory", language)}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── EDIT OFFER MODAL ── */}
      <EditOfferModal
        visible={editingModalVisible}
        offer={offer}
        onClose={() => setEditingModalVisible(false)}
        onSave={handleSaveEditOffer}
        loading={editSaving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  safeAreaDark: { backgroundColor: "#0B1120" },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  appBarDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnDark: { backgroundColor: "#1E293B" },
  appBarTitleCol: { flex: 1 },
  appBarTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  appBarSubtitle: { fontSize: 11, color: "#64748B", fontWeight: "500", marginTop: 1 },
  textDark: { color: "#FFFFFF" },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  editIconBtnDark: { backgroundColor: "#1E293B", borderColor: "#3B82F6" },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteIconBtnDark: { backgroundColor: "#450A0A", borderColor: "#7F1D1D" },
  disabledBtn: { opacity: 0.5 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewCardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceText: { fontSize: 18, fontWeight: "900" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeActive: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
  statusBadgeAccepted: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  statusBadgeFull: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 11, fontWeight: "800" },
  statusTextActive: { color: "#059669" },
  statusTextAccepted: { color: "#2563EB" },
  statusTextFull: { color: "#DC2626" },
  routeTimelineBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  routeTimelineBoxDark: { backgroundColor: "#0B1120" },
  routeLocCol: { flex: 1, minWidth: 0 },
  alignRight: { alignItems: "flex-end" },
  routeCityPrimary: { fontSize: 12.5, fontWeight: "800", color: "#0F172A" },
  routeCountrySecondary: { fontSize: 10.5, color: "#64748B", fontWeight: "500", marginTop: 1 },
  textRight: { textAlign: "right" },
  routeScheduleBlock: {
    marginTop: 6,
    gap: 3,
  },
  inlineDateRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inlineDateRowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  inlineDateText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "700",
  },
  timeBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  timeBadgePillRight: {
    alignSelf: "flex-end",
  },
  timeBadgePillDark: {
    backgroundColor: "#1E293B",
  },
  timeBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },
  routeFlightTrack: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginHorizontal: 6,
  },
  routeTrackLine: { position: "absolute", height: 1.5, left: 0, right: 0, backgroundColor: "#CBD5E1" },
  planeIconBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", zIndex: 2 },
  capacityProgressBox: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 0,
  },
  capacityProgressBoxDark: { backgroundColor: "#0B1120" },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  progressLabelText: { fontSize: 11, color: "#64748B", fontWeight: "600", marginBottom: 2 },
  progressRemainingText: { fontSize: 15, fontWeight: "900", color: "#059669" },
  progressBookedSubText: { fontSize: 11, color: "#64748B", fontWeight: "600", marginBottom: 2, textAlign: "right" },
  progressBookedText: { fontSize: 13, fontWeight: "800", color: "#0F172A", textAlign: "right" },
  fullBookedRedText: { color: "#DC2626" },
  progressBarTrack: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 11.5, color: "#64748B", fontWeight: "500" },
  sectionHeaderRow: { marginBottom: 10, marginTop: 4 },
  sectionTitleGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  countBadge: { paddingHorizontal: 7, paddingVertical: 1.5, borderRadius: 8 },
  countBadgeText: { fontSize: 10.5, fontWeight: "800" },
  filterTabsContainer: { flexDirection: "row", gap: 6, marginBottom: 14 },
  filterTabPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  filterTabPillDark: { backgroundColor: "#1E293B" },
  filterTabPillActive: {},
  filterTabText: { fontSize: 11.5, fontWeight: "600", color: "#64748B" },
  filterTabTextActive: { color: "#FFFFFF", fontWeight: "800" },
  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 12,
  },
  loaderText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },
  goBackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  goBackBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
