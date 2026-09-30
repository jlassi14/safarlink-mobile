import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Share,
  RefreshControl,
  Platform,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { t } from "@/lib/i18n";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plane,
  Package,
  Lock,
  ShieldCheck,
  Star,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Coins,
} from "lucide-react-native";
import { demandApi, proposalApi, BackendProposalItem } from "@/lib/api";
import { MOCK_DEFAULT_AVATAR } from "@/lib/constants";
import TunisiaDeliveryDetailsCard from "@/components/TunisiaDeliveryDetailsCard";
import MutualResolutionSection from "@/components/offers/MutualResolutionSection";
import AcceptProposalPaymentModal from "@/components/requests/AcceptProposalPaymentModal";
import PriceProposalModal from "@/components/offers/PriceProposalModal";
import { RouteCorridor } from "@/components/requests/RouteCorridor";

type ProposalFilter = "all" | "pending" | "accepted" | "rejected";

export default function RequestDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode, user } = useAppStore();
  const params = useLocalSearchParams<{ id?: string; from?: string }>();
  const demandId = params.id;
  const fromParam = params.from;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fromParam === "notifications") {
      router.replace("/(app)/(tabs)/notifications");
    } else if (fromParam === "offers") {
      router.replace("/(app)/(tabs)/offers");
    } else if (fromParam === "home") {
      router.replace("/(app)/(tabs)/home");
    } else {
      router.replace("/(app)/(tabs)/requests");
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

  const primaryColor = colors.primary || "#2563EB";
  const textColor = darkMode ? colors.text.dark : colors.text.light;
  const bgColor = darkMode ? colors.background.dark : colors.background.light;
  const cardBgColor = darkMode ? "#1E293B" : "#FFFFFF";
  const borderColor = darkMode ? "#334155" : "#E2E8F0";

  const [demand, setDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter tabs for proposals
  const [activeFilter, setActiveFilter] = useState<ProposalFilter>("all");

  // Payment Modal State for Accepting Proposals
  const [selectedProposalForPayment, setSelectedProposalForPayment] = useState<BackendProposalItem | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  // Negotiation Modal State for Counter-offers
  const [selectedProposalForNegotiate, setSelectedProposalForNegotiate] = useState<any | null>(null);
  const [negotiateModalVisible, setNegotiateModalVisible] = useState(false);

  const handleOpenNegotiate = (proposal: any) => {
    setSelectedProposalForNegotiate(proposal);
    setNegotiateModalVisible(true);
  };

  const fetchDemand = useCallback(async () => {
    if (!demandId) {
      setErrorMsg(language === "ar" ? "معرف الطلب مفقود" : "ID de demande manquant");
      setLoading(false);
      return;
    }
    try {
      setErrorMsg(null);
      const res = await demandApi.getDemandById(String(demandId));
      if (res.data?.success && res.data.data) {
        setDemand(res.data.data);
      } else {
        setErrorMsg(language === "ar" ? "تعذر العثور على الطلب" : "Demande introuvable");
      }
    } catch (err: any) {
      console.error("Failed to load demand details:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors du chargement des détails";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [demandId, language]);

  useEffect(() => {
    fetchDemand();
  }, [fetchDemand]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDemand();
  };

  const handleCopyId = async () => {
    if (!demand?.id) return;
    try {
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(demand.id);
      }
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!demand) return;
    try {
      await Share.share({
        message: `SafarLink Demande #${demand.id} - ${demand.from} ➔ ${demand.to} (${demand.weightKg} kg - ${demand.reward} $)`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleOpenAcceptProposal = (prop: any) => {
    setSelectedProposalForPayment(prop);
    setPaymentModalVisible(true);
  };

  const handleRejectProposal = (propId: string, travelerName: string) => {
    Alert.alert(
      language === "ar" ? "رفض عرض المسافر" : "Refuser la proposition",
      language === "ar"
        ? `هل أنت متأكد من رفض عرض ${travelerName}؟`
        : `Êtes-vous sûr de vouloir refuser la proposition de ${travelerName} ?`,
      [
        { text: language === "ar" ? "تراجع" : "Retour", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد الرفض" : "Confirmer le refus",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await proposalApi.rejectProposal(propId);
              if (res.data?.success) {
                fetchDemand();
              } else {
                Alert.alert("Error", res.data?.message || "Failed to reject proposal");
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.message || err?.message || "Failed to reject proposal";
              Alert.alert("Error", errMsg);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (errorMsg || !demand) {
    return (
      <View style={[styles.container, styles.centerBox, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorTitle, { color: textColor }]}>
          {errorMsg || (language === "ar" ? "الطلب غير موجود" : "Demande introuvable")}
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: primaryColor }]}
          onPress={handleBack}
        >
          <Text style={styles.backBtnText}>
            {language === "ar" ? "رجوع" : "Retour"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine user role and proposals
  const isSender = !user?.id || demand.userId === user?.id;
  const proposals: any[] = demand.proposals || [];

  // Find accepted proposal
  const acceptedProposal = proposals.find(
    (p: any) =>
      p.status?.toLowerCase() === "accepted" ||
      p.status?.toLowerCase() === "in_transit" ||
      p.status?.toLowerCase() === "delivered" ||
      p.status?.toLowerCase() === "completed" ||
      p.status?.toLowerCase() === "disputed"
  );

  const counterpart = isSender
    ? acceptedProposal?.traveler || proposals[0]?.traveler || null
    : demand.user;

  const counterpartName = counterpart?.name || (isSender ? "Voyageur" : "Expéditeur");
  const counterpartAvatar = counterpart?.avatar || MOCK_DEFAULT_AVATAR;
  const counterpartRating = counterpart?.rating ? Number(counterpart.rating).toFixed(1) : "5.0";
  const counterpartRole = isSender
    ? language === "ar"
      ? "المسافر"
      : language === "fr"
      ? "Voyageur"
      : "Traveler"
    : language === "ar"
    ? "صاحب الطلب (المرسل)"
    : language === "fr"
    ? "Expéditeur"
    : "Sender";

  // Filter proposals based on active filter tab
  const filteredProposals = proposals.filter((p) => {
    const st = (p.status || "pending").toLowerCase();
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return st === "pending";
    if (activeFilter === "accepted")
      return st === "accepted" || st === "in_transit" || st === "delivered" || st === "completed";
    if (activeFilter === "rejected") return st === "rejected" || st === "cancelled";
    return true;
  });

  const formattedTargetDate = demand.targetDate
    ? new Date(demand.targetDate).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : language === "ar"
    ? "تاريخ مرن"
    : "Flexible";

  const formattedCreatedAt = demand.createdAt
    ? new Date(demand.createdAt).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Récemment";

  // Financial calculation breakdown (Rate is PER KG)
  const weightVal = Number(demand.weightKg) || 1;
  const standardRatePerKg = Number(demand.reward) || 0;
  const acceptedRatePerKg = (() => {
    if (!acceptedProposal?.proposedPrice) return standardRatePerKg;
    const p = parseFloat(String(acceptedProposal.proposedPrice).replace(/[^0-9.]/g, ""));
    return !isNaN(p) && p > 0 ? p : standardRatePerKg;
  })();
  const activeRatePerKg = acceptedProposal ? acceptedRatePerKg : standardRatePerKg;
  const transportSubtotal = Number((weightVal * activeRatePerKg).toFixed(2));
  const localDeliveryFee = Number(demand.deliveryFee) || 0;
  const totalFinancialAmount = Number((transportSubtotal + localDeliveryFee).toFixed(2));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={["top"]}>
      {/* ── TOP HEADER ── */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.iconBtn, { backgroundColor: darkMode ? "#334155" : "#F1F5F9" }]}
        >
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {language === "ar"
              ? "تفاصيل طلب الشحنة"
              : language === "fr"
              ? "Détails de la demande"
              : "Request Details"}
          </Text>
          <TouchableOpacity style={styles.copyIdRow} onPress={handleCopyId} activeOpacity={0.7}>
            <Text style={[styles.bookingIdText, { color: darkMode ? "#94A3B8" : "#64748B" }]}>
              #{demand.id?.slice(0, 8)}
            </Text>
            {copiedId ? (
              <Check size={12} color="#16A34A" />
            ) : (
              <Copy size={12} color={darkMode ? "#94A3B8" : "#64748B"} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          style={[styles.iconBtn, { backgroundColor: darkMode ? "#334155" : "#F1F5F9" }]}
        >
          <Share2 size={18} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        {/* ── 1. ACTIVE AGREEMENT HIGHLIGHT IF ACCEPTED ── */}
        {acceptedProposal && (
          <View style={styles.acceptedAgreementBox}>
            <View style={[styles.statusBannerAccepted, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
              <ShieldCheck size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.acceptedBannerTitle}>
                  {language === "ar" ? "تم قبول العرض والضمان مفعل 🔒" : "Offre acceptée & Escrow Actif 🔒"}
                </Text>
                <Text style={styles.acceptedBannerDesc}>
                  {language === "ar"
                    ? "المبلغ محجوز بأمان في حساب الضمان حتى استلام الشحنة وتأكيد الطرفين."
                    : "Les fonds sont sécurisés sous séquestre jusqu'à la remise en main propre."}
                </Text>
              </View>
            </View>

            {/* Mutual Resolution Section (2/2) */}
            <View style={{ marginTop: 8 }}>
              <MutualResolutionSection
                proposalId={acceptedProposal.id}
                itemType="PROPOSAL"
                role={isSender ? "SENDER" : "TRAVELER"}
                senderAction={acceptedProposal.senderAction}
                travelerAction={acceptedProposal.travelerAction}
                bookingStatus={acceptedProposal.status}
                paymentStatus={acceptedProposal.paymentStatus || "HELD"}
                totalPrice={totalFinancialAmount}
                currency={demand.currency || "USD"}
                onActionSubmitted={() => {
                  fetchDemand();
                }}
              />
            </View>
          </View>
        )}

        {/* ── 2. ROUTE CORRIDOR CARD ── */}
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
          <Text style={[styles.cardSectionTitle, { color: textColor }]}>
            {language === "ar" ? "مسار الشحنة" : "Itinéraire & Trajet"}
          </Text>

          {/* Symmetrical Aviation Flight Track with Country Flags */}
          <RouteCorridor
            from={demand.from}
            to={demand.to}
            primaryColor={primaryColor}
            darkMode={darkMode}
            showLabels={true}
          />

          {/* Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Package size={16} color={primaryColor} />
              <View style={styles.specTextCol}>
                <Text style={styles.specLabel}>{language === "ar" ? "الوزن" : "Poids"}</Text>
                <Text style={[styles.specValue, { color: textColor }]}>
                  {demand.weightKg} kg
                </Text>
              </View>
            </View>

            <View style={styles.specItem}>
              <Calendar size={16} color={primaryColor} />
              <View style={styles.specTextCol}>
                <Text style={styles.specLabel}>
                  {language === "ar" ? "التاريخ المستهدف" : "Date souhaitée"}
                </Text>
                <Text style={[styles.specValue, { color: textColor }]}>
                  {formattedTargetDate}
                </Text>
              </View>
            </View>
          </View>

          {demand.description ? (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>
                {language === "ar" ? "وصف الطرد:" : "Description du colis :"}
              </Text>
              <Text style={[styles.descriptionText, { color: textColor }]}>
                {demand.description}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── 3. FINANCIAL SUMMARY & REWARD (DETAILED BREAKDOWN) ── */}
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Coins size={18} color={primaryColor} />
              <Text style={[styles.cardSectionTitle, { color: textColor, marginBottom: 0 }]}>
                {language === "ar" ? "تفاصيل المكافأة والحساب" : "Détails de la rémunération"}
              </Text>
            </View>
            <View style={[styles.perKgBadge, { backgroundColor: primaryColor + "15", borderColor: primaryColor + "30" }]}>
              <Text style={[styles.perKgBadgeText, { color: primaryColor }]}>
                {activeRatePerKg} $ / kg
              </Text>
            </View>
          </View>

          {/* Breakdown Rows */}
          <View style={styles.breakdownBox}>
            {/* Unit Price per kg */}
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: darkMode ? "#94A3B8" : "#64748B" }]}>
                {language === "ar" ? "السعر لكل كيلوغرام:" : "Tarif unitaire (par kg) :"}
              </Text>
              <Text style={[styles.breakdownValue, { color: textColor }]}>
                {activeRatePerKg} $ / kg
              </Text>
            </View>

            {/* Package Weight */}
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: darkMode ? "#94A3B8" : "#64748B" }]}>
                {language === "ar" ? "وزن الطرد:" : "Poids du colis :"}
              </Text>
              <Text style={[styles.breakdownValue, { color: textColor }]}>
                {weightVal} kg
              </Text>
            </View>

            {/* Transport Subtotal Calculation */}
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: darkMode ? "#94A3B8" : "#64748B" }]}>
                {language === "ar" ? "مكافأة النقل (الوزن × السعر):" : "Sous-total transport :"}
              </Text>
              <Text style={[styles.breakdownValue, { color: textColor, fontWeight: "600" }]}>
                {weightVal} kg × {activeRatePerKg} $ = {transportSubtotal} $
              </Text>
            </View>

            {/* Tunisia Domestic Delivery Fee if applicable */}
            {localDeliveryFee > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: darkMode ? "#94A3B8" : "#64748B" }]}>
                  {language === "ar" ? "رسوم التوصيل الداخلي (تونس):" : "Livraison locale (Tunisie) :"}
                </Text>
                <Text style={[styles.breakdownValue, { color: textColor }]}>
                  +{localDeliveryFee} $
                </Text>
              </View>
            )}

            <View style={[styles.breakdownDivider, { backgroundColor: borderColor }]} />

            {/* Total Guaranteed in Escrow */}
            <View style={styles.breakdownRowTotal}>
              <View>
                <Text style={[styles.totalRowLabel, { color: textColor }]}>
                  {language === "ar" ? "المجموع الكلي المضمون:" : "Total garanti :"}
                </Text>
                <Text style={[styles.totalRowSubtext, { color: darkMode ? "#94A3B8" : "#64748B" }]}>
                  {language === "ar" ? "محجوز تحت حساب الضمان (In Hold)" : "Fonds sécurisés sous séquestre"}
                </Text>
              </View>
              <Text style={[styles.totalRowValue, { color: "#10B981" }]}>
                {totalFinancialAmount} $
              </Text>
            </View>
          </View>
        </View>

        {/* ── 4. TUNISIA DOMESTIC DELIVERY (FAMILY / COURIER) ── */}
        {demand.deliveryMethod ? (
          <TunisiaDeliveryDetailsCard
            deliveryMethod={demand.deliveryMethod}
            contactName={demand.deliveryContactName}
            contactPhone={demand.deliveryContactPhone}
            deliveryFee={demand.deliveryFee}
            paymentMethod={demand.deliveryPaymentMethod}
            deliveryAddress={demand.deliveryAddress}
            deliveryStatus={demand.deliveryStatus}
            bookingStatus={demand.status}
            isTraveler={!isSender}
            hidePricing={!isSender}
            containerStyle={{ marginBottom: 4 }}
          />
        ) : null}

        {/* ── 5. PROPOSALS SECTION (OFFRES DE LIVRAISON REÇUES) ── */}
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor, marginTop: 4 }]}>
          {/* Section Header with Count */}
          <View style={styles.sectionTitleRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Plane size={18} color={primaryColor} />
              <Text style={[styles.cardSectionTitle, { color: textColor, marginBottom: 0 }]}>
                {language === "ar" ? "عروض التوصيل المستلمة" : "Offres de livraison reçues"}
              </Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: primaryColor + "15" }]}>
              <Text style={[styles.countBadgeText, { color: primaryColor }]}>
                {
                  proposals.filter((p) => {
                    const st = (p.status || "pending").toLowerCase();
                    return st !== "cancelled" && st !== "rejected";
                  }).length
                }
              </Text>
            </View>
          </View>

          {/* Filter Tabs (Tous / En attente / Acceptés / Refusés) */}
          <View style={[styles.filterTabsRow, { backgroundColor: darkMode ? "#151E2E" : "#F1F5F9" }]}>
            {(["all", "pending", "accepted", "rejected"] as ProposalFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterTab,
                  activeFilter === f && styles.filterTabActive,
                  activeFilter === f && { backgroundColor: primaryColor },
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === f ? styles.filterTabTextActive : { color: darkMode ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  {f === "all"
                    ? language === "ar" ? "الكل" : "Tous"
                    : f === "pending"
                    ? language === "ar" ? "قيد الانتظار" : "En attente"
                    : f === "accepted"
                    ? language === "ar" ? "المقبولة" : "Acceptés"
                    : language === "ar" ? "المرفوضة" : "Refusés"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Proposals List */}
          {filteredProposals.length > 0 ? (
            <View style={styles.proposalsList}>
              {filteredProposals.map((p) => {
                const propStatus = (p.status || "pending").toLowerCase();
                const isPropPending = propStatus === "pending";
                const isPropAccepted = propStatus === "accepted";
                const isPropDelivered = propStatus === "delivered";
                const isPropCompleted = propStatus === "completed";
                const isPropRejected = propStatus === "rejected" || propStatus === "cancelled";

                const travelerUser = p.traveler || {
                  id: p.travelerId,
                  name: "Voyageur",
                  avatar: MOCK_DEFAULT_AVATAR,
                  rating: 5.0,
                };

                return (
                  <View
                    key={p.id}
                    style={[
                      styles.proposalCardItem,
                      { backgroundColor: darkMode ? "#151E2E" : "#F8FAFC", borderColor },
                      (isPropAccepted || isPropDelivered) && styles.proposalCardItemAccepted,
                    ]}
                  >
                    {/* Traveler Row */}
                    <View style={styles.travelerRow}>
                      <View style={styles.travelerProfileGroup}>
                        <Image
                          source={{ uri: travelerUser.avatar || MOCK_DEFAULT_AVATAR }}
                          style={styles.travelerAvatar}
                        />
                        <View style={styles.travelerInfo}>
                          <View style={styles.travelerNameRow}>
                            <Text style={[styles.travelerName, { color: textColor }]} numberOfLines={1}>
                              {travelerUser.name}
                            </Text>
                            <View style={styles.ratingBadge}>
                              <Star size={10} color="#D97706" fill="#F59E0B" />
                              <Text style={styles.ratingText}>
                                {travelerUser.rating ? Number(travelerUser.rating).toFixed(1) : "5.0"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Status Pill */}
                      <View
                        style={[
                          styles.propStatusPill,
                          isPropAccepted
                            ? styles.pillGreen
                            : isPropDelivered
                            ? styles.pillPurple
                            : isPropCompleted
                            ? styles.pillBlue
                            : isPropRejected
                            ? styles.pillRed
                            : styles.pillAmber,
                        ]}
                      >
                        <Text
                          style={[
                            styles.propStatusPillText,
                            isPropAccepted
                              ? styles.textGreen
                              : isPropDelivered
                              ? styles.textPurple
                              : isPropCompleted
                              ? styles.textBlue
                              : isPropRejected
                              ? styles.textRed
                              : styles.textAmber,
                          ]}
                        >
                          {isPropAccepted
                            ? language === "ar" ? "مقبول 🔒" : "Accepté 🔒"
                            : isPropDelivered
                            ? language === "ar" ? "تم التوصيل 📦" : "Livré 📦"
                            : isPropCompleted
                            ? language === "ar" ? "مكتمل ✅" : "Terminé ✅"
                            : isPropRejected
                            ? language === "ar" ? "مرفوض ✗" : "Refusé ✗"
                            : language === "ar" ? "قيد الانتظار ⏳" : "En attente ⏳"}
                        </Text>
                      </View>
                    </View>

                    {/* Flight Timings */}
                    <View style={[styles.flightBox, { backgroundColor: darkMode ? "#1E293B" : "#FFFFFF" }]}>
                      <View style={styles.flightBoxItem}>
                        <View style={styles.flightIconPill}>
                          <Text style={styles.flightIconEmoji}>🛫</Text>
                          <Text style={styles.flightBoxLabel}>
                            {language === "ar" ? "تاريخ الإقلاع" : "Départ"}
                          </Text>
                        </View>
                        <Text style={[styles.flightBoxValue, { color: textColor }]}>
                          {p.flightDate ? new Date(p.flightDate).toLocaleDateString() : "Date vol"} • {p.flightTime || "14:30"}
                        </Text>
                      </View>

                      <View style={styles.flightBoxItem}>
                        <View style={styles.flightIconPill}>
                          <Text style={styles.flightIconEmoji}>🛬</Text>
                          <Text style={styles.flightBoxLabel}>
                            {language === "ar" ? "تاريخ الوصول" : "Arrivée"}
                          </Text>
                        </View>
                        <Text style={[styles.flightBoxValue, { color: primaryColor, fontWeight: "700" }]}>
                          {p.arrivalDate ? new Date(p.arrivalDate).toLocaleDateString() : (p.flightDate ? new Date(p.flightDate).toLocaleDateString() : "Date")} • {p.arrivalTime || "18:45"}
                        </Text>
                      </View>
                    </View>

                    {p.notes ? (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesText} numberOfLines={2}>
                          "{p.notes}"
                        </Text>
                      </View>
                    ) : null}

                    {/* Proposed Price Highlight */}
                    <View
                      style={[
                        styles.proposedPriceTagRow,
                        {
                          backgroundColor: darkMode ? "#1E293B" : "#F0FDF4",
                          borderColor: darkMode ? "#334155" : "#BBF7D0",
                        },
                      ]}
                    >
                      <Coins size={14} color="#10B981" />
                      <Text
                        style={[
                          styles.proposedPriceTagLabel,
                          { color: darkMode ? "#94A3B8" : "#475569" },
                        ]}
                      >
                        {language === "ar" ? "السعر المقترح للتوصيل:" : "Tarif proposé :"}
                      </Text>
                      <Text style={[styles.proposedPriceTagValue, { color: "#059669" }]}>
                        {p.proposedPrice && p.proposedPrice !== "Free"
                          ? `${p.proposedPrice} $/kg`
                          : (language === "ar" ? "مجاني" : "Gratuit")}
                      </Text>

                      {p.weightKg ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                          <Package size={12} color="#059669" />
                          <Text style={{ fontSize: 12, fontWeight: "700", color: "#059669" }}>
                            {p.weightKg} kg
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Action Buttons: Accept / Negotiate / Reject when pending */}
                    {isPropPending && isSender ? (
                      <View style={styles.propActionsRow}>
                        <TouchableOpacity
                          style={[styles.acceptBtnMain, { backgroundColor: "#10B981" }]}
                          onPress={() => handleOpenAcceptProposal(p)}
                          activeOpacity={0.85}
                        >
                          <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.acceptBtnMainText}>
                            {language === "ar" ? "قبول وتأمين الدفع 🔒" : "Accepter & Payer 🔒"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.negotiateBtnSmall}
                          onPress={() => handleOpenNegotiate(p)}
                          activeOpacity={0.85}
                        >
                          <Coins size={14} color="#0284C7" />
                          <Text style={styles.negotiateBtnSmallText}>
                            {language === "ar" ? "تفاوض" : "Négocier"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rejectBtnSmall}
                          onPress={() => handleRejectProposal(p.id, travelerUser.name)}
                          activeOpacity={0.85}
                        >
                          <XCircle size={14} color="#DC2626" />
                          <Text style={styles.rejectBtnSmallText}>
                            {language === "ar" ? "رفض" : "Refuser"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    {/* Escrow In-Hold Guarantee Badge if Accepted */}
                    {isPropAccepted && (
                      <View
                        style={[
                          styles.inHoldBadgeBox,
                          {
                            backgroundColor: darkMode ? "#064E3B30" : "#ECFDF5",
                            borderColor: darkMode ? "#065F46" : "#A7F3D0",
                          },
                        ]}
                      >
                        <ShieldCheck size={16} color="#059669" />
                        <Text style={[styles.inHoldBadgeText, { color: "#059669" }]}>
                          {language === "ar"
                            ? "🔒 الدفع محجوز في الضمان (In Hold) — في انتظار إتمام التوصيل"
                            : "🔒 Fonds bloqués sous séquestre (In Hold) — en attente de livraison"}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyProposalsBox}>
              <Clock size={32} color="#94A3B8" />
              <Text style={[styles.emptyProposalsText, { color: textColor }]}>
                {language === "ar"
                  ? "لا توجد عروض في هذا القسم حالياً."
                  : "Aucune offre dans cette catégorie pour le moment."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── ACCEPT PROPOSAL ESCROW PAYMENT MODAL ── */}
      {selectedProposalForPayment && (
        <AcceptProposalPaymentModal
          visible={paymentModalVisible}
          proposal={selectedProposalForPayment}
          demand={demand}
          onClose={() => setPaymentModalVisible(false)}
          onSuccess={() => {
            setPaymentModalVisible(false);
            fetchDemand();
          }}
        />
      )}

      {/* ── NEGOTIATE / PRICE COUNTER-OFFER MODAL ── */}
      {selectedProposalForNegotiate && (
        <PriceProposalModal
          visible={negotiateModalVisible}
          onClose={() => {
            setNegotiateModalVisible(false);
            setSelectedProposalForNegotiate(null);
          }}
          receiverId={selectedProposalForNegotiate.travelerId}
          receiverName={selectedProposalForNegotiate.traveler?.name || "le voyageur"}
          demandId={demand.id}
          currentStandardPrice={(() => {
            const parsed = parseFloat(String(selectedProposalForNegotiate.proposedPrice || "").replace(/[^0-9.]/g, ""));
            return !isNaN(parsed) && parsed > 0 ? parsed : (demand.reward || 0);
          })()}
          currency="$"
          onProposalSent={() => {
            fetchDemand();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleCol: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  copyIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  acceptedAgreementBox: {
    marginBottom: 4,
  },
  statusBannerAccepted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  acceptedBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#059669",
    marginBottom: 2,
  },
  acceptedBannerDesc: {
    fontSize: 11.5,
    color: "#047857",
    lineHeight: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  specItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  specTextCol: {
    flex: 1,
  },
  specLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  specValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  descriptionBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  descriptionLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  breakdownBox: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  breakdownDivider: {
    height: 1,
    marginVertical: 6,
  },
  breakdownRowTotal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  totalRowLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  totalRowSubtext: {
    fontSize: 11,
    marginTop: 1,
  },
  totalRowValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  perKgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  perKgBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  filterTabsRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
  },
  filterTabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  proposalsList: {
    gap: 12,
  },
  proposalCardItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  proposalCardItemAccepted: {
    borderColor: "#A7F3D0",
    borderWidth: 1.5,
  },
  travelerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  travelerProfileGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  travelerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  travelerName: {
    fontSize: 14,
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  viewProfileSmallLink: {
    fontSize: 11,
    color: "#0284C7",
    fontWeight: "600",
    marginTop: 2,
  },
  propStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  propStatusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  pillGreen: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
  textGreen: { color: "#059669" },
  pillPurple: { backgroundColor: "#FAF5FF", borderColor: "#DDD6FE" },
  textPurple: { color: "#7C3AED" },
  pillBlue: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  textBlue: { color: "#2563EB" },
  pillRed: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  textRed: { color: "#DC2626" },
  pillAmber: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
  textAmber: { color: "#D97706" },

  flightBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  flightBoxItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flightIconPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  flightIconEmoji: {
    fontSize: 13,
  },
  flightBoxLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  flightBoxValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  notesBox: {
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  notesText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#64748B",
  },
  propActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtnMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  acceptBtnMainText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  rejectBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  rejectBtnSmallText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  negotiateBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    backgroundColor: "#F0F9FF",
  },
  negotiateBtnSmallText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "700",
  },
  proposedPriceTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  proposedPriceTagLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  proposedPriceTagValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  inHoldBadgeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  inHoldBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  chatBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chatBtnSmallText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  emptyProposalsBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyProposalsText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
