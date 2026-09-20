import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  Share,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plane,
  Package,
  Lock,
  ShieldCheck,
  Star,
  MessageSquare,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Share2,
  Copy,
  Check,
} from "lucide-react-native";
import { bookingApi } from "@/lib/api";
import { MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import TunisiaDeliveryDetailsCard from "@/components/TunisiaDeliveryDetailsCard";
import MutualResolutionSection from "@/components/offers/MutualResolutionSection";

export default function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode, user } = useAppStore();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = params.id;
  const primaryColor = colors.primary || "#00A3E0";

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setErrorMsg(language === "ar" ? "معرف الحجز مفقود" : "ID de réservation manquant");
      setLoading(false);
      return;
    }
    try {
      setErrorMsg(null);
      const res = await bookingApi.getBooking(bookingId);
      if (res.data?.success && res.data.data) {
        setBooking(res.data.data);
      } else {
        setErrorMsg(language === "ar" ? "تعذر تحميل بيانات الحجز" : "Impossible de charger la réservation");
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la récupération des détails";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId, language]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  const handleCopyId = async () => {
    if (!booking?.id) return;
    try {
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(booking.id);
      }
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!booking) return;
    try {
      await Share.share({
        message: `SafarLink Réservation #${booking.id} - ${booking.offer?.from || "Origine"
          } ➔ ${booking.offer?.to || "Destination"} (${booking.weightKg} kg - ${booking.totalPrice} ${booking.currency})`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleCancelPending = () => {
    if (!booking) return;
    Alert.alert(
      language === "ar" ? "إلغاء الطلب" : language === "fr" ? "Annuler la demande" : "Cancel Request",
      language === "ar"
        ? "هل أنت متأكد من إلغاء هذا الحجز؟"
        : language === "fr"
          ? "Êtes-vous sûr de vouloir annuler cette réservation ?"
          : "Are you sure you want to cancel this booking?",
      [
        { text: language === "ar" ? "تراجع" : "Retour", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد الإلغاء" : "Confirmer l'annulation",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await bookingApi.cancelBooking(booking.id);
              Alert.alert(
                "Succès",
                language === "ar" ? "تم إلغاء الطلب بنجاح" : "Demande annulée avec succès"
              );
              fetchBooking();
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Erreur d'annulation";
              Alert.alert("Erreur", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDispute = () => {
    if (!booking) return;
    Alert.alert(
      language === "ar" ? "فتح نزاع رسمي" : language === "fr" ? "Ouvrir un litige" : "Open Dispute",
      language === "ar"
        ? "سيتم تجميد أموال الضمان فوراً وتحويل الملف إلى إدارة المنصة للتحقيق."
        : language === "fr"
          ? "Les fonds en séquestre seront gelés immédiatement et notre équipe examinera le dossier."
          : "Escrow funds will be frozen immediately and investigated by support.",
      [
        { text: language === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد النزاع" : "Confirmer le litige",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await bookingApi.disputeBooking(booking.id);
              Alert.alert("Litige ouvert", "Notre équipe de support prendra contact avec vous.");
              fetchBooking();
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Erreur";
              Alert.alert("Erreur", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAcceptBooking = () => {
    if (!booking) return;
    Alert.alert(
      language === "ar" ? "قبول طلب الحجز" : language === "fr" ? "Accepter la réservation" : "Accept Booking",
      language === "ar"
        ? `هل تريد قبول نقل ${booking.weightKg} كغ بمقابل ${booking.totalPrice} ${booking.currency}؟ ستُحجز أموال الضمان فوراً.`
        : `Voulez-vous accepter de transporter ${booking.weightKg} kg pour ${booking.totalPrice} ${booking.currency} ? Les fonds seront sécurisés sous séquestre.`,
      [
        { text: language === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد القبول" : "Confirmer l'acceptation",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await bookingApi.acceptBooking(booking.id);
              if (res.data?.success) {
                Alert.alert(
                  "Succès",
                  language === "ar" ? "تم قبول الطلب بنجاح" : "Réservation acceptée avec succès !"
                );
                fetchBooking();
              }
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Erreur";
              Alert.alert("Erreur", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectBooking = () => {
    if (!booking) return;
    Alert.alert(
      language === "ar" ? "رفض الطلب" : language === "fr" ? "Refuser la demande" : "Decline Booking",
      language === "ar"
        ? "هل أنت متأكد من رفض هذا الطلب؟ سيتم استرجاع التفويض للمرسل فوراً."
        : "Êtes-vous sûr de vouloir refuser cette demande ? Le montant sera remboursé à l'expéditeur.",
      [
        { text: language === "ar" ? "تراجع" : "Retour", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد الرفض" : "Confirmer le refus",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await bookingApi.rejectBooking(booking.id);
              Alert.alert(
                "Succès",
                language === "ar" ? "تم رفض الطلب" : "Demande refusée."
              );
              fetchBooking();
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Erreur";
              Alert.alert("Erreur", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const isSender = !booking || booking.senderId === user?.id;
  const counterpart = isSender ? booking?.offer?.user : booking?.sender;
  const counterpartRole = isSender
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

  const counterpartName = counterpart?.name || "Membre SafarLink";
  const counterpartAvatar = counterpart?.avatar || MOCK_DEFAULT_AVATAR;
  const counterpartRating = counterpart?.rating ? counterpart.rating.toFixed(1) : "5.0";

  // Real DB dates
  const rawFlightDate = booking?.offer?.departureDate;
  const displayFlightDate = rawFlightDate
    ? new Date(rawFlightDate).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Non spécifiée";

  const rawCreatedAt = booking?.createdAt;
  const displayCreatedAt = rawCreatedAt
    ? new Date(rawCreatedAt).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Récemment";

  const normStatus = (booking?.status || "").toLowerCase();
  const paymentStatus = (booking?.paymentStatus || "").toUpperCase();

  // Dynamic status details directly from DB
  const getStatusBadge = () => {
    switch (normStatus) {
      case "accepted":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          label: language === "ar" ? "مقبول ومحمي 🔒" : language === "fr" ? "Accepté & Fonds Sécurisés 🔒" : "Accepted & Secured 🔒",
          desc:
            language === "ar"
              ? "قبل المسافر طلبك. الأموال محجوزة في الضمان ولن تدفع إلا بعد التأكيد."
              : "Le voyageur a accepté votre demande. Le montant est sous séquestre SafarLink Escrow.",
        };
      case "in_transit":
        return {
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
          label: language === "ar" ? "في الطريق ✈️" : language === "fr" ? "En cours d'acheminement ✈️" : "In Transit ✈️",
          desc:
            language === "ar"
              ? "الرحلة جارية حالياً والشحنة في طريقها."
              : "Le voyageur est en transit avec votre colis.",
        };
      case "delivered":
        return {
          bg: "#FAF5FF",
          text: "#7C3AED",
          border: "#DDD6FE",
          label: language === "ar" ? "تم التوصيل 📦" : language === "fr" ? "Colis Arrivé 📦" : "Delivered 📦",
          desc:
            language === "ar"
              ? "وصل الطرد إلى وجهته. يرجى تأكيد الاستلام."
              : "Le colis est arrivé à destination. Veuillez confirmer la réception.",
        };
      case "completed":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          label: language === "ar" ? "مكتمل بنجاح ✅" : language === "fr" ? "Terminé avec succès ✅" : "Completed ✅",
          desc:
            language === "ar"
              ? "أكد الطرفان اكتمال العملية وتم تحويل الأرباح للمسافر عبر PayPal."
              : "Les deux parties ont confirmé la livraison. Les fonds ont été transférés au voyageur via PayPal.",
        };
      case "disputed":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          label: language === "ar" ? "نزاع مفتوح ⚠️" : language === "fr" ? "Litige en cours ⚠️" : "Disputed ⚠️",
          desc:
            language === "ar"
              ? "تم فتح نزاع. أموال الضمان مجمدة حتى قرار الإدارة."
              : "Un litige est ouvert. Les fonds sont gelés jusqu'à résolution.",
        };
      case "cancelled":
      case "rejected":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          label: language === "ar" ? "ملغى ✗" : language === "fr" ? "Annulé ✗" : "Cancelled ✗",
          desc:
            language === "ar"
              ? "تم إلغاء الحجز وإعادة المبالغ المستحقة بالكامل."
              : "Cette réservation a été annulée et le montant a été remboursé.",
        };
      default:
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          label: language === "ar" ? "قيد انتظار موافقة المسافر ⏳" : language === "fr" ? "En attente du voyageur ⏳" : "Pending ⏳",
          desc:
            language === "ar"
              ? "تم إنشاء الحجز وتفويض الدفع. في انتظار قبول المسافر."
              : "Demande envoyée. Le voyageur doit valider votre réservation avant de pouvoir confirmer.",
        };
    }
  };

  const statusInfo = getStatusBadge();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.centerContainer, darkMode && styles.containerDark]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, darkMode && styles.textDark]}>
          {language === "ar" ? "جارٍ تحميل تفاصيل الحجز..." : "Chargement des détails..."}
        </Text>
      </SafeAreaView>
    );
  }

  if (errorMsg || !booking) {
    return (
      <SafeAreaView style={[styles.centerContainer, darkMode && styles.containerDark]}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        <AlertTriangle size={48} color="#DC2626" />
        <Text style={[styles.errorTitle, darkMode && styles.textDark]}>
          {language === "ar" ? "تعذر العثور على الحجز" : "Réservation introuvable"}
        </Text>
        <Text style={styles.errorSub}>{errorMsg || "Détails non disponibles."}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: primaryColor }]}
          onPress={fetchBooking}
        >
          <Text style={styles.retryBtnText}>
            {language === "ar" ? "إعادة المحاولة" : "Réessayer"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtnTextOnly} onPress={() => router.back()}>
          <Text style={{ color: "#64748B", fontWeight: "600", marginTop: 12 }}>
            {language === "ar" ? "الرجوع" : "Retour"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── TOP APP BAR ── */}
      <View style={[styles.appBar, darkMode && styles.appBarDark]}>
        <TouchableOpacity
          style={[styles.circleIconButton, darkMode && styles.circleIconButtonDark]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={darkMode ? "#F8FAFC" : "#0F172A"} />
        </TouchableOpacity>

        <View style={styles.appBarCenter}>
          <Text style={[styles.appBarTitle, darkMode && styles.textDark]} numberOfLines={1}>
            {language === "ar"
              ? "تفاصيل الحجز"
              : language === "fr"
                ? "Détails de la réservation"
                : "Booking Details"}
          </Text>
          <Text style={styles.appBarSub}>
            #{booking.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.circleIconButton, darkMode && styles.circleIconButtonDark]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Share2 size={18} color={darkMode ? "#F8FAFC" : "#0F172A"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[primaryColor]}
            tintColor={primaryColor}
          />
        }
      >
        {/* ── REAL DYNAMIC STATUS CARD (Direct DB Status) ── */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
          <View style={styles.statusBadgeRow}>
            <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
            {paymentStatus === "HELD" && (
              <View style={styles.escrowChip}>
                <Lock size={12} color="#16A34A" />
                <Text style={styles.escrowChipText}>
                  {language === "ar" ? "الضمان مفعل" : "Escrow Actif"}
                </Text>
              </View>
            )}
            {paymentStatus === "RELEASED" && (
              <View style={[styles.escrowChip, { backgroundColor: "#E0F2FE", borderColor: "#BAE6FD" }]}>
                <ShieldCheck size={12} color="#0284C7" />
                <Text style={[styles.escrowChipText, { color: "#0284C7" }]}>
                  {language === "ar" ? "تم التحرير" : "Fonds Libérés"}
                </Text>
              </View>
            )}
            {paymentStatus === "REFUNDED" && (
              <View style={[styles.escrowChip, { backgroundColor: "#F3E8FF", borderColor: "#DDD6FE" }]}>
                <ShieldCheck size={12} color="#7C3AED" />
                <Text style={[styles.escrowChipText, { color: "#7C3AED" }]}>
                  {language === "ar" ? "تم الاسترجاع" : "Remboursé"}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.statusDescText, { color: statusInfo.text }]}>
            {statusInfo.desc}
          </Text>

          {/* Creation date from DB */}
          <View style={styles.creationDateRow}>
            <Clock size={13} color={darkMode ? "#94A3B8" : "#64748B"} />
            <Text style={[styles.creationDateText, darkMode && styles.textMutedDark]}>
              {language === "ar" ? "تاريخ إنشاء الحجز:" : "Créé le :"} {displayCreatedAt}
            </Text>
          </View>
        </View>

        {/* ── PROFILE CARD ── */}
        <TouchableOpacity
          style={[styles.card, darkMode && styles.cardDark]}
          onPress={() => {
            if (counterpart?.id) {
              router.push({
                pathname: "/(app)/user/[id]",
                params: {
                  id: counterpart.id,
                  name: counterpartName,
                  avatar: counterpartAvatar,
                  phone: counterpart?.phone,
                },
              });
            }
          }}
          activeOpacity={0.85}
        >
          <View style={[styles.profileRow, { marginBottom: 0, justifyContent: "space-between" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
              <Image source={{ uri: counterpartAvatar }} style={styles.profileAvatar} />
              <View style={styles.profileDetailsCol}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.profileName, darkMode && styles.textDark, { marginBottom: 0, fontSize: 16 }]} numberOfLines={1}>
                    {counterpartName}
                  </Text>
                  <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#2563EB" }}>{counterpartRole}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11.5, color: "#0284C7", fontWeight: "600", marginTop: 2 }}>
                  {language === "ar" ? "عرض الملف الشخصي ➔" : "Voir le profil ➔"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── FLIGHT & CORRIDOR ROUTE CARD ── */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={[styles.cardSectionTitle, darkMode && styles.textDark]}>
            {language === "ar" ? "مسار الرحلة والشحنة" : "Itinéraire & Détails du vol"}
          </Text>

          {/* Route Corridor */}
          <View style={[styles.routeBox, darkMode && styles.routeBoxDark]}>
            <View style={styles.routeCol}>
              <Text style={styles.routeCityLabel}>{language === "ar" ? "من" : "Départ"}</Text>
              <Text style={[styles.routeCityName, darkMode && styles.textDark]} numberOfLines={1}>
                {booking.offer?.from || "Origine"}
              </Text>
            </View>

            <View style={styles.routeFlightIconBox}>
              <View style={styles.routeDashedLine} />
              <Plane size={18} color={primaryColor} style={{ transform: [{ rotate: "90deg" }] }} />
            </View>

            <View style={[styles.routeCol, styles.alignRight]}>
              <Text style={styles.routeCityLabel}>{language === "ar" ? "إلى" : "Arrivée"}</Text>
              <Text style={[styles.routeCityName, darkMode && styles.textDark]} numberOfLines={1}>
                {booking.offer?.to || "Destination"}
              </Text>
            </View>
          </View>

          {/* Flight Details Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaGridItem}>
              <Calendar size={15} color="#64748B" />
              <View style={styles.metaItemTextCol}>
                <Text style={styles.metaItemLabel}>
                  {language === "ar" ? "تاريخ الرحلة" : "Date du vol"}
                </Text>
                <Text style={[styles.metaItemValue, darkMode && styles.textDark]}>
                  {displayFlightDate}
                </Text>
              </View>
            </View>

            <View style={styles.metaGridItem}>
              <Package size={15} color="#64748B" />
              <View style={styles.metaItemTextCol}>
                <Text style={styles.metaItemLabel}>
                  {language === "ar" ? "الوزن المحجوز" : "Poids réservé"}
                </Text>
                <Text style={[styles.metaItemValue, darkMode && styles.textDark]}>
                  {booking.weightKg} kg
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── FINANCIAL & PAYMENT SUMMARY (Direct DB Values) ── */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={[styles.cardSectionTitle, darkMode && styles.textDark]}>
            {language === "ar" ? "المبلغ والضمان" : "Montant & Paiement Sécurisé"}
          </Text>

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, darkMode && styles.textMutedDark]}>
                {language === "ar" ? "المبلغ الإجمالي المدفوع" : "Montant payé (PayPal)"}
              </Text>
              <Text style={[styles.priceValMain, { color: primaryColor }]}>
                {booking.totalPrice} {booking.currency || "USD"}
              </Text>
            </View>

            {isSender && booking.deliveryFee && booking.deliveryFee > 0 && (
              <View style={styles.deliveryFeeNotice}>
                <Text style={[styles.deliveryFeeNoticeText, darkMode && styles.textMutedDark]}>
                  ℹ️ {language === "ar" ? "رسوم التوصيل المحلي بتونس:" : "Livraison locale Tunisie :"} {booking.deliveryFee} TND ({booking.deliveryPaymentMethod || "Paiement à la livraison"})
                </Text>
              </View>
            )}
          </View>

          {/* Security Guarantee Box */}
          <View style={styles.guaranteeBox}>
            <ShieldCheck size={20} color="#16A34A" />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>
                {language === "ar" ? "حماية SafarLink Escrow 100%" : "Garantie SafarLink Escrow"}
              </Text>
              <Text style={styles.guaranteeDesc}>
                {paymentStatus === "RELEASED"
                  ? language === "ar"
                    ? "تم تحرير كامل المبلغ للمسافر تلقائياً عبر PayPal بعد اكتمال التأكيد."
                    : "Le montant a été versé au voyageur via PayPal suite à la validation mutuelle."
                  : paymentStatus === "REFUNDED"
                    ? language === "ar"
                      ? "تمت إعادة المبلغ لحسابك بعد إلغاء الحجز."
                      : "Les fonds ont été remboursés sur votre moyen de paiement d'origine."
                    : language === "ar"
                      ? "المبلغ محفوظ في حساب الضمان، ولن يُحوَّل للمسافر إلا بعد تأكيد استلام الشحنة من الطرفين."
                      : "Les fonds sont conservés sous séquestre jusqu'à la confirmation de réception par les 2 parties."}
              </Text>
            </View>
          </View>
        </View>

        {/* ── TUNISIA DOMESTIC DELIVERY DETAILS (If Selected) ── */}
        {booking.deliveryMethod && (
          <TunisiaDeliveryDetailsCard
            deliveryMethod={booking.deliveryMethod}
            contactName={booking.deliveryContactName}
            contactPhone={booking.deliveryContactPhone}
            deliveryFee={booking.deliveryFee}
            paymentMethod={booking.deliveryPaymentMethod}
            deliveryAddress={booking.deliveryAddress}
            deliveryStatus={booking.deliveryStatus}
            bookingStatus={booking.status}
            isTraveler={!isSender}
            hidePricing={!isSender}
            containerStyle={{ marginBottom: 16 }}
          />
        )}

        {/* ── MUTUAL RESOLUTION SECTION / ACTION BUTTONS ── */}
        {normStatus === "accepted" || normStatus === "in_transit" || normStatus === "delivered" ? (
          <View style={styles.mutualSectionWrapper}>
            <MutualResolutionSection
              bookingId={booking.id}
              role={isSender ? "SENDER" : "TRAVELER"}
              senderAction={booking.senderAction}
              travelerAction={booking.travelerAction}
              bookingStatus={booking.status}
              paymentStatus={booking.paymentStatus}
              totalPrice={booking.totalPrice}
              currency={booking.currency}
              onActionSubmitted={() => {
                fetchBooking();
              }}
            />
          </View>
        ) : normStatus === "completed" ? (
          <View style={[styles.finalStatusCard, styles.finalSuccessCard]}>
            <CheckCircle2 size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.finalStatusTitle}>
                {language === "ar" ? "العملية مكتملة ومغلقة (2/2)" : "Réservation terminée (2/2)"}
              </Text>
              <Text style={styles.finalStatusDesc}>
                {language === "ar"
                  ? "أكد الطرفان اكتمال التوصيل. تم إغلاق الطلب وتحرير الأرباح للمسافر."
                  : "Vous et le voyageur avez confirmé la livraison. La commande est clôturée et les gains ont été transférés."}
              </Text>
            </View>
          </View>
        ) : normStatus === "cancelled" || normStatus === "rejected" ? (
          <View style={[styles.finalStatusCard, styles.finalCancelledCard]}>
            <XCircle size={24} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.finalStatusTitle, { color: "#DC2626" }]}>
                {language === "ar" ? "تم إلغاء هذه العملية" : "Réservation annulée"}
              </Text>
              <Text style={styles.finalStatusDesc}>
                {language === "ar"
                  ? "تم إلغاء الحجز وإعادة المبلغ إلى وسيلة الدفع الخاصة بك."
                  : "Cette réservation est annulée et le remboursement a été effectué."}
              </Text>
            </View>
          </View>
        ) : (
          /* PENDING status notice */
          <View style={[styles.finalStatusCard, styles.pendingNoticeCard]}>
            <Clock size={22} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.finalStatusTitle, { color: "#D97706" }]}>
                {!isSender
                  ? language === "ar"
                    ? "طلب حجز جديد بانتظار قرارك"
                    : "Nouvelle demande de réservation"
                  : language === "ar"
                    ? "في انتظار رد المسافر"
                    : "En attente de réponse du voyageur"}
              </Text>
              <Text style={styles.finalStatusDesc}>
                {!isSender
                  ? language === "ar"
                    ? `طلب المرسل حجز ${booking.weightKg} كغ مقابل ${booking.totalPrice} ${booking.currency}. يمكنك القبول أو الرفض أدناه.`
                    : `L'expéditeur souhaite réserver ${booking.weightKg} kg pour ${booking.totalPrice} ${booking.currency}. Vous pouvez accepter ou refuser ci-dessous.`
                  : language === "ar"
                    ? "يجب على المسافر قبول طلبك أولاً. بعد القبول، ستظهر أزرار تأكيد الاستلام أو الإلغاء هنا."
                    : "Le voyageur doit d'abord accepter votre demande. Une fois acceptée, vous aurez accès aux boutons de confirmation et d'annulation."}
              </Text>
            </View>
          </View>
        )}

        {/* ── TRAVELER ACTIONS (ACCEPT / REJECT) WHEN PENDING ── */}
        {!isSender && normStatus === "pending" && (
          <View style={styles.travelerDecisionGroup}>
            <TouchableOpacity
              style={styles.acceptDemandBtn}
              onPress={handleAcceptBooking}
              activeOpacity={0.8}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.acceptDemandBtnText}>
                {language === "ar" ? "قبول طلب الحجز والضمان" : "Accepter la réservation"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectDemandBtn}
              onPress={handleRejectBooking}
              activeOpacity={0.8}
            >
              <XCircle size={16} color="#DC2626" />
              <Text style={styles.rejectDemandBtnText}>
                {language === "ar" ? "رفض الطلب" : "Refuser la demande"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SENDER ACTION (CANCEL) WHEN PENDING ── */}
        {isSender && normStatus === "pending" && (
          <TouchableOpacity
            style={styles.cancelPendingBtn}
            onPress={handleCancelPending}
            activeOpacity={0.8}
          >
            <XCircle size={16} color="#DC2626" />
            <Text style={styles.cancelPendingBtnText}>
              {language === "ar" ? "إلغاء طلب الحجز واسترداد التفويض" : "Annuler ma demande de réservation"}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── DISPUTE BUTTON (Only during active delivery) ── */}
        {(normStatus === "in_transit" || normStatus === "delivered") && (
          <TouchableOpacity
            style={styles.disputeBtn}
            onPress={handleDispute}
            activeOpacity={0.8}
          >
            <AlertTriangle size={15} color="#DC2626" />
            <Text style={styles.disputeBtnText}>
              {language === "ar" ? "إبلاغ عن مشكلة / فتح نزاع رسمي" : "Signaler un problème ou ouvrir un litige"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  containerDark: {
    backgroundColor: "#0B1120",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  errorSub: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  backBtnTextOnly: {
    padding: 8,
  },
  textDark: {
    color: "#F8FAFC",
  },
  textMutedDark: {
    color: "#94A3B8",
  },

  // ── APP BAR ──
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  appBarDark: {
    backgroundColor: "#111827",
    borderBottomColor: "#1F2937",
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  circleIconButtonDark: {
    backgroundColor: "#1F2937",
  },
  appBarCenter: {
    alignItems: "center",
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  appBarSub: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 1,
    letterSpacing: 0.5,
  },

  scrollContent: {
    padding: 16,
  },

  // ── STATUS CARD ──
  statusCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: "800",
  },
  statusDescText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    marginBottom: 12,
  },
  creationDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  creationDateText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  escrowChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  escrowChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },

  // ── GENERAL CARDS ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },

  // ── DB ID ROW ──
  dbIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  uuidText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#0F172A",
    marginTop: 2,
    fontWeight: "600",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00A3E0",
  },

  // ── PROFILE ──
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 12,
  },
  profileDetailsCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  profileRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  profileRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
  },
  profileRatingCount: {
    fontSize: 11,
    color: "#94A3B8",
  },
  profileEmail: {
    fontSize: 11,
    color: "#64748B",
  },

  // ── ROUTE ──
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  routeBoxDark: {
    backgroundColor: "#1E293B",
  },
  routeCol: {
    flex: 1,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  routeCityLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  routeCityName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  routeFlightIconBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    position: "relative",
  },
  routeDashedLine: {
    position: "absolute",
    width: 60,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    borderStyle: "dashed",
  },

  // ── METADATA GRID ──
  metaGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metaGridItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  metaItemTextCol: {
    flex: 1,
  },
  metaItemLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  metaItemValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },

  // ── PRICE BREAKDOWN ──
  priceBreakdown: {
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  priceValMain: {
    fontSize: 18,
    fontWeight: "900",
  },
  deliveryFeeNotice: {
    marginTop: 6,
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  deliveryFeeNoticeText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "500",
  },

  // ── GUARANTEE BOX ──
  guaranteeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    borderRadius: 10,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 11,
    color: "#15803D",
    lineHeight: 16,
  },

  mutualSectionWrapper: {
    marginBottom: 16,
  },

  // ── FINAL STATUS CARDS ──
  finalStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  finalSuccessCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  finalCancelledCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  pendingNoticeCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  finalStatusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#059669",
    marginBottom: 3,
  },
  finalStatusDesc: {
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 16,
  },

  travelerDecisionGroup: {
    gap: 10,
    marginBottom: 14,
  },
  acceptDemandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptDemandBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  rejectDemandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 12,
  },
  rejectDemandBtnText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── CANCEL / DISPUTE BUTTONS ──
  cancelPendingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  cancelPendingBtnText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },
  disputeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  disputeBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
});
