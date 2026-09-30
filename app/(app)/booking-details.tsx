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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useAppStore } from "@/lib/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  RefreshCw,
  Send,
  X,
  Coins,
  ChevronRight,
} from "lucide-react-native";
import { bookingApi, priceProposalApi, proposalApi, TunisiaDeliveryMethod, TunisiaPaymentMethod } from "@/lib/api";
import { MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import TunisiaDeliveryDetailsCard from "@/components/TunisiaDeliveryDetailsCard";
import MutualResolutionSection from "@/components/offers/MutualResolutionSection";
import * as WebBrowser from "expo-web-browser";
import BottomSheetModal from "@/components/BottomSheetModal";
import TunisiaDeliverySection from "@/components/create/TunisiaDeliverySection";
import { extractLocationInfo } from "@/components/requests/RouteCorridor";
import { t } from "@/lib/i18n";

WebBrowser.maybeCompleteAuthSession();

const isTunisiaLocation = (loc?: string | null): boolean => {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes("tunis") || l.includes("تونس") || l.includes("🇹🇳");
};

const formatLocationDisplay = (raw?: string) => {
  if (!raw) return "";
  const info = extractLocationInfo(raw);
  if (info.city && info.country && info.city.toLowerCase() !== info.country.toLowerCase()) {
    return `${info.city}, ${info.country} ${info.flag}`.trim();
  }
  if (info.city) {
    return `${info.city} ${info.flag}`.trim();
  }
  return raw;
};

export default function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode, user } = useAppStore();
  const params = useLocalSearchParams<{ id?: string; type?: string; from?: string }>();
  const bookingId = params.id;
  const fromParam = params.from;
  const primaryColor = colors.primary || "#00A3E0";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fromParam === "notifications") {
      router.replace("/(app)/(tabs)/notifications" as any);
    } else if (fromParam === "requests") {
      router.replace("/(app)/(tabs)/requests" as any);
    } else if (fromParam === "offers") {
      router.replace("/(app)/(tabs)/offers" as any);
    } else {
      router.replace("/(app)/(tabs)/offers" as any);
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

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [counterPriceInput, setCounterPriceInput] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [negotiationHistory, setNegotiationHistory] = useState<any[]>([]);

  // Checkout & Escrow Payment for Accepted Proposals
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [bookingDeliveryMethod, setBookingDeliveryMethod] = useState<TunisiaDeliveryMethod | null>(null);
  const [bookingContactName, setBookingContactName] = useState("");
  const [bookingContactPhone, setBookingContactPhone] = useState("");
  const [bookingDeliveryFee, setBookingDeliveryFee] = useState("");
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<TunisiaPaymentMethod>("CASH");
  const [bookingDeliveryAddress, setBookingDeliveryAddress] = useState("");
  const [bookingDeliveryErrors, setBookingDeliveryErrors] = useState<Record<string, string | undefined>>({});

  const handleFinalizeAndPay = async (overrideMethod?: TunisiaDeliveryMethod) => {
    const offerObj = booking?.offer || booking?.rawProposal?.offer;
    const demandObj = booking?.demand || booking?.rawProposal?.demand;
    const fromLoc = offerObj?.from || booking?.from || demandObj?.from || "";
    const toLoc = offerObj?.to || booking?.to || demandObj?.to || "";
    const isTunisiaFlight =
      isTunisiaLocation(fromLoc) ||
      isTunisiaLocation(toLoc) ||
      Boolean(booking?.deliveryMethod || bookingDeliveryMethod || offerObj?.deliveryMethod || demandObj?.deliveryMethod);
    const effectiveDeliveryMethod =
      overrideMethod ||
      bookingDeliveryMethod ||
      booking?.deliveryMethod ||
      booking?.rawProposal?.deliveryMethod ||
      booking?.acceptedProposal?.deliveryMethod ||
      offerObj?.deliveryMethod ||
      demandObj?.deliveryMethod ||
      null;

    const contactNameToUse =
      bookingContactName.trim() ||
      booking?.deliveryContactName ||
      booking?.rawProposal?.deliveryContactName ||
      booking?.acceptedProposal?.deliveryContactName ||
      offerObj?.deliveryContactName ||
      demandObj?.deliveryContactName ||
      "";
    const contactPhoneToUse =
      bookingContactPhone.trim() ||
      booking?.deliveryContactPhone ||
      booking?.rawProposal?.deliveryContactPhone ||
      booking?.acceptedProposal?.deliveryContactPhone ||
      offerObj?.deliveryContactPhone ||
      demandObj?.deliveryContactPhone ||
      "";
    const deliveryAddressToUse =
      bookingDeliveryAddress.trim() ||
      booking?.deliveryAddress ||
      booking?.rawProposal?.deliveryAddress ||
      booking?.acceptedProposal?.deliveryAddress ||
      offerObj?.deliveryAddress ||
      demandObj?.deliveryAddress ||
      "";
    const deliveryFeeToUse =
      bookingDeliveryFee.trim()
        ? parseFloat(bookingDeliveryFee)
        : (booking?.deliveryFee ??
          booking?.rawProposal?.deliveryFee ??
          booking?.acceptedProposal?.deliveryFee ??
          null);

    if (isTunisiaFlight) {
      const bErr: Record<string, string | undefined> = {};
      if (!effectiveDeliveryMethod) {
        bErr.deliveryMethod = t("deliveryMethodRequired", language);
      } else if (effectiveDeliveryMethod === "FAMILY") {
        if (!contactNameToUse) {
          bErr.deliveryContactName = t("deliveryContactNameRequired", language);
        }
        if (!contactPhoneToUse) {
          bErr.deliveryContactPhone = t("deliveryContactPhoneRequired", language);
        }
      } else if (effectiveDeliveryMethod === "COURIER") {
        if (deliveryFeeToUse == null || isNaN(deliveryFeeToUse) || deliveryFeeToUse <= 0) {
          bErr.deliveryFee = t("deliveryFeeRequired", language);
        }
      } else if (effectiveDeliveryMethod === "I_FAST_PRO") {
        if (!deliveryAddressToUse) {
          bErr.deliveryAddress = t("deliveryAddressRequired", language);
        }
      }

      if (Object.keys(bErr).length > 0) {
        setBookingDeliveryErrors(bErr);
        setCheckoutModalVisible(true);
        Alert.alert(
          language === "ar" ? "تنبيه" : language === "fr" ? "Attention" : "Notice",
          bErr.deliveryMethod ||
            bErr.deliveryContactName ||
            bErr.deliveryContactPhone ||
            bErr.deliveryFee ||
            bErr.deliveryAddress ||
            "Veuillez compléter les détails de livraison."
        );
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const offerId =
        offerObj?.id ||
        booking?.offer?.id ||
        booking?.rawProposal?.offerId ||
        booking?.rawProposal?.offer?.id ||
        booking?.offerId;

      const demandId =
        demandObj?.id ||
        booking?.demand?.id ||
        booking?.rawProposal?.demandId ||
        booking?.rawProposal?.demand?.id ||
        booking?.demandId;

      if (!offerId && !demandId) {
        Alert.alert("Erreur", "Identifiant de l'offre ou de la demande introuvable");
        setCheckoutLoading(false);
        return;
      }

      if (!offerId && demandId) {
        // Escrow hold for Demand
        const mockCaptureId = `cap_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const targetProposalId = booking?.id || booking?.rawProposal?.id;
        const res = await proposalApi.acceptProposal(targetProposalId, {
          paypalCaptureId: mockCaptureId,
          paymentMethod: "paypal",
        });

        setCheckoutModalVisible(false);
        if (res.data?.success) {
          Alert.alert(
            language === "ar" ? "تم تأمين الدفع! 🔒" : "Paiement sécurisé en Escrow ! 🔒",
            language === "ar"
              ? "تم حجز المبلغ وتأمينه في حساب الضمان حتى استلام شحنتك بنجاح."
              : "Votre paiement est bloqué en toute sécurité dans l'Escrow (In Hold)."
          );
          fetchBooking();
        } else {
          Alert.alert(language === "ar" ? "خطأ" : "Erreur", res.data?.message || "Erreur lors de la sécurisation");
        }
        setCheckoutLoading(false);
        return;
      }

      console.log("[booking-details] Creating booking with offerId:", offerId, "proposalId:", booking.id);

      const res = await bookingApi.createBooking({
        offerId,
        weightKg: Number(booking.weightKg) || 1,
        acceptedProposalId: booking.id,
        deliveryMethod: isTunisiaFlight ? effectiveDeliveryMethod : null,
        deliveryContactName:
          isTunisiaFlight ? (contactNameToUse || null) : null,
        deliveryContactPhone:
          isTunisiaFlight ? (contactPhoneToUse || null) : null,
        deliveryFee:
          isTunisiaFlight && effectiveDeliveryMethod === "COURIER" && deliveryFeeToUse != null
            ? deliveryFeeToUse
            : null,
        deliveryPaymentMethod:
          isTunisiaFlight &&
            (effectiveDeliveryMethod === "COURIER" || effectiveDeliveryMethod === "I_FAST_PRO")
            ? bookingPaymentMethod || booking?.deliveryPaymentMethod || null
            : null,
        deliveryAddress:
          isTunisiaFlight &&
            (effectiveDeliveryMethod === "I_FAST_PRO" || effectiveDeliveryMethod === "COURIER")
            ? deliveryAddressToUse || null
            : null,
      });

      if (res.data?.success && res.data.data) {
        const createdBooking = res.data.data.booking;
        const approvalUrl = res.data.data.approvalUrl;
        const newBookingId = createdBooking?.id;

        setCheckoutModalVisible(false);

        if (approvalUrl) {
          const result = await WebBrowser.openAuthSessionAsync(
            approvalUrl,
            "safarlink://paypal-return"
          );

          if (result.type === "success") {
            try {
              const confirmRes = await bookingApi.confirmPayment(newBookingId);
              if (confirmRes.data?.success) {
                Alert.alert(
                  language === "ar" ? "تم تأمين الدفع! 🔒" : "Paiement sécurisé en Escrow ! 🔒",
                  language === "ar"
                    ? "تم حجز المبلغ وتأمينه في حساب الضمان حتى استلام شحنتك بنجاح."
                    : "Votre paiement est bloqué en toute sécurité dans l'Escrow."
                );
              }
            } catch (cErr: any) {
              console.warn("Error confirming payment:", cErr);
            }

            router.replace({
              pathname: "/(app)/booking-details",
              params: { id: newBookingId, type: "booking" },
            });
          } else {
            // User closed/cancelled the PayPal browser session
            Alert.alert(
              language === "ar" ? "تم إيقاف عملية الدفع" : "Paiement non finalisé",
              language === "ar"
                ? "لقد قمت بإلغاء صفحة الدفع. يمكنك إعادة المحاولة متى شئت."
                : "Vous avez fermé ou annulé la page PayPal. Vous pouvez réessayer quand vous le souhaitez."
            );
          }
        }
      }
    } catch (err: any) {
      console.error("Error creating booking from proposal:", err);
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de la réservation";
      Alert.alert(language === "ar" ? "خطأ" : "Erreur", msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const fetchNegotiationHistory = async (targetOfferId?: string, counterpartId?: string, targetDemandId?: string) => {
    if (!targetOfferId && !targetDemandId) return;
    try {
      const histRes = await priceProposalApi.getProposals({ 
        offerId: targetOfferId,
        demandId: targetDemandId,
      });
      if (histRes.data?.success && Array.isArray(histRes.data.data)) {
        const relevant = histRes.data.data
          .filter((p: any) =>
            !counterpartId
              ? (p.senderId === user?.id || p.receiverId === user?.id)
              : (p.senderId === counterpartId || p.receiverId === counterpartId)
          )
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setNegotiationHistory(relevant);
      }
    } catch (e) {
      console.warn("Could not fetch negotiation history:", e);
    }
  };

  const mergeWithCachedDelivery = async (bId: string, current: any, offerId?: string) => {
    try {
      let cached = await AsyncStorage.getItem(`pending_delivery_${bId}`);
      if (!cached && offerId) {
        cached = await AsyncStorage.getItem(`pending_delivery_${offerId}`);
      }
      if (!cached && offerId) {
        cached = await AsyncStorage.getItem(`pending_delivery_offer_${offerId}`);
      }
      if (!cached) {
        // Fallback: search all pending_delivery_ keys on this device to recover the chosen delivery details
        const allKeys = await AsyncStorage.getAllKeys();
        const delKeys = allKeys.filter((k) => k.startsWith("pending_delivery_"));
        for (const k of delKeys) {
          const raw = await AsyncStorage.getItem(k);
          if (raw) {
            try {
              const p = JSON.parse(raw);
              if (p && (p.deliveryMethod || p.deliveryContactName || p.deliveryAddress)) {
                cached = raw;
                break;
              }
            } catch {}
          }
        }
      }
      if (cached) {
        const parsed = JSON.parse(cached);
        const res = {
          deliveryMethod: current.deliveryMethod || parsed.deliveryMethod || null,
          deliveryContactName: current.deliveryContactName || parsed.deliveryContactName || null,
          deliveryContactPhone: current.deliveryContactPhone || parsed.deliveryContactPhone || null,
          deliveryFee: current.deliveryFee ?? parsed.deliveryFee ?? null,
          deliveryPaymentMethod: current.deliveryPaymentMethod || parsed.deliveryPaymentMethod || null,
          deliveryAddress: current.deliveryAddress || parsed.deliveryAddress || null,
        };
        // Persist under current bId so it stays linked
        AsyncStorage.setItem(`pending_delivery_${bId}`, JSON.stringify(res)).catch(() => {});
        // Also auto-sync to backend proposal if DB had null
        if (!current.deliveryMethod && res.deliveryMethod && bookingId) {
          priceProposalApi.updateDelivery(bookingId, res).catch(() => {});
        }
        return res;
      }
    } catch (e) {}
    return current;
  };

  const updateCachedDeliveryField = (field: string, value: any) => {
    if (!bookingId) return;
    AsyncStorage.getItem(`pending_delivery_${bookingId}`)
      .then((c) => {
        const cur = c ? JSON.parse(c) : {};
        cur[field] = value;
        return AsyncStorage.setItem(`pending_delivery_${bookingId}`, JSON.stringify(cur));
      })
      .catch(() => {});
  };

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setErrorMsg(language === "ar" ? "معرف الحجز مفقود" : "ID de réservation manquant");
      setLoading(false);
      return;
    }
    setErrorMsg(null);
    try {
      if (params.type === "delivery_proposal") {
        try {
          const delivPropRes = await proposalApi.getProposalById(bookingId);
          if (delivPropRes.data?.success && delivPropRes.data.data) {
            const prop = delivPropRes.data.data;
            const effWeight = prop.weightKg || prop.demand?.weightKg || 1;
            const parsedPrice = parseFloat(String(prop.proposedPrice || "").replace(/[^0-9.]/g, "")) || Number(prop.demand?.reward) || 0;

            const initialDelivery = {
              deliveryMethod: prop.demand?.deliveryMethod || null,
              deliveryContactName: prop.demand?.deliveryContactName || null,
              deliveryContactPhone: prop.demand?.deliveryContactPhone || null,
              deliveryFee: prop.demand?.deliveryFee ?? null,
              deliveryPaymentMethod: prop.demand?.deliveryPaymentMethod || null,
              deliveryAddress: prop.demand?.deliveryAddress || null,
            };
            const merged = await mergeWithCachedDelivery(bookingId, initialDelivery, prop.demandId);

            setBooking({
              id: prop.id,
              status: prop.status.toLowerCase(),
              paymentStatus: prop.paymentStatus || "PENDING",
              weightKg: effWeight,
              pricePerKg: parsedPrice,
              totalPrice: Number((effWeight * parsedPrice).toFixed(1)),
              currency: prop.demand?.currency || "$",
              demand: prop.demand,
              demandId: prop.demandId,
              flightDate: prop.flightDate,
              flightTime: prop.flightTime,
              arrivalDate: prop.arrivalDate,
              arrivalTime: prop.arrivalTime,
              from: prop.demand?.from,
              to: prop.demand?.to,
              sender: prop.demand?.user,
              senderId: prop.demand?.userId,
              traveler: prop.traveler,
              travelerId: prop.travelerId,
              receiver: prop.demand?.user,
              receiverId: prop.demand?.userId,
              createdAt: prop.createdAt,
              isPriceProposal: false,
              isDeliveryProposal: true,
              rawProposal: prop,
              deliveryMethod: merged.deliveryMethod,
              deliveryContactName: merged.deliveryContactName,
              deliveryContactPhone: merged.deliveryContactPhone,
              deliveryFee: merged.deliveryFee,
              deliveryPaymentMethod: merged.deliveryPaymentMethod,
              deliveryAddress: merged.deliveryAddress,
              senderAction: prop.senderAction,
              travelerAction: prop.travelerAction,
            });

            if (merged.deliveryMethod) setBookingDeliveryMethod(merged.deliveryMethod);
            if (merged.deliveryContactName) setBookingContactName(merged.deliveryContactName);
            if (merged.deliveryContactPhone) setBookingContactPhone(merged.deliveryContactPhone);
            if (merged.deliveryFee) setBookingDeliveryFee(String(merged.deliveryFee));
            if (merged.deliveryAddress) setBookingDeliveryAddress(merged.deliveryAddress);
            if (merged.deliveryPaymentMethod) setBookingPaymentMethod(merged.deliveryPaymentMethod);

            const cId = prop.travelerId === user?.id ? prop.demand?.userId : prop.travelerId;
            fetchNegotiationHistory(undefined, cId, prop.demandId);
            return;
          }
        } catch (delivErr) {
          console.warn("[booking-details] Error fetching as delivery_proposal:", delivErr);
        }
      }

      if (params.type === "proposal") {
        try {
          const propRes = await priceProposalApi.getProposalById(bookingId);
          if (propRes.data?.success && propRes.data.data) {
            const prop = propRes.data.data;
            const initialDelivery = {
              deliveryMethod:
                prop.deliveryMethod ||
                prop.booking?.deliveryMethod ||
                prop.offer?.deliveryMethod ||
                prop.demand?.deliveryMethod ||
                null,
              deliveryContactName:
                prop.deliveryContactName ||
                prop.booking?.deliveryContactName ||
                prop.offer?.deliveryContactName ||
                prop.demand?.deliveryContactName ||
                null,
              deliveryContactPhone:
                prop.deliveryContactPhone ||
                prop.booking?.deliveryContactPhone ||
                prop.offer?.deliveryContactPhone ||
                prop.demand?.deliveryContactPhone ||
                null,
              deliveryFee:
                prop.deliveryFee ??
                prop.booking?.deliveryFee ??
                prop.offer?.deliveryFee ??
                prop.demand?.deliveryFee ??
                null,
              deliveryPaymentMethod:
                prop.deliveryPaymentMethod ||
                prop.booking?.deliveryPaymentMethod ||
                prop.offer?.deliveryPaymentMethod ||
                prop.demand?.deliveryPaymentMethod ||
                null,
              deliveryAddress:
                prop.deliveryAddress ||
                prop.booking?.deliveryAddress ||
                prop.offer?.deliveryAddress ||
                prop.demand?.deliveryAddress ||
                null,
            };
            const merged = await mergeWithCachedDelivery(bookingId, initialDelivery, prop.offer?.id || prop.offerId);
            const deliveryStatus = prop.booking?.deliveryStatus || null;

            const effectiveWeight = prop.weightKg || prop.demand?.weightKg || 1;
            setBooking({
              id: prop.id,
              status: prop.status.toLowerCase(),
              weightKg: effectiveWeight,
              pricePerKg: prop.proposedPrice,
              totalPrice: Number((effectiveWeight * prop.proposedPrice).toFixed(1)),
              currency: "$",
              offer: prop.offer,
              demand: prop.demand,
              sender: prop.sender,
              senderId: prop.senderId,
              receiver: prop.receiver,
              receiverId: prop.receiverId,
              createdAt: prop.createdAt,
              isPriceProposal: true,
              rawProposal: prop,
              deliveryMethod: merged.deliveryMethod,
              deliveryContactName: merged.deliveryContactName,
              deliveryContactPhone: merged.deliveryContactPhone,
              deliveryFee: merged.deliveryFee,
              deliveryPaymentMethod: merged.deliveryPaymentMethod,
              deliveryAddress: merged.deliveryAddress,
              deliveryStatus,
            });

            if (merged.deliveryMethod) setBookingDeliveryMethod(merged.deliveryMethod);
            if (merged.deliveryContactName) setBookingContactName(merged.deliveryContactName);
            if (merged.deliveryContactPhone) setBookingContactPhone(merged.deliveryContactPhone);
            if (merged.deliveryFee) setBookingDeliveryFee(String(merged.deliveryFee));
            if (merged.deliveryAddress) setBookingDeliveryAddress(merged.deliveryAddress);
            if (merged.deliveryPaymentMethod) setBookingPaymentMethod(merged.deliveryPaymentMethod);

            const cId = prop.senderId === user?.id ? prop.receiverId : prop.senderId;
            fetchNegotiationHistory(prop.offer?.id || prop.offerId, cId, prop.demand?.id || prop.demandId);
            return;
          }
        } catch (pricePropErr) {
          // If 404 from priceProposal, check if it's a delivery proposal passed as proposal!
          try {
            const delivPropRes = await proposalApi.getProposalById(bookingId);
            if (delivPropRes.data?.success && delivPropRes.data.data) {
              const prop = delivPropRes.data.data;
              const effWeight = prop.weightKg || prop.demand?.weightKg || 1;
              const parsedPrice = parseFloat(String(prop.proposedPrice || "").replace(/[^0-9.]/g, "")) || Number(prop.demand?.reward) || 0;

              const initialDelivery = {
                deliveryMethod: prop.demand?.deliveryMethod || null,
                deliveryContactName: prop.demand?.deliveryContactName || null,
                deliveryContactPhone: prop.demand?.deliveryContactPhone || null,
                deliveryFee: prop.demand?.deliveryFee ?? null,
                deliveryPaymentMethod: prop.demand?.deliveryPaymentMethod || null,
                deliveryAddress: prop.demand?.deliveryAddress || null,
              };
              const merged = await mergeWithCachedDelivery(bookingId, initialDelivery, prop.demandId);

              setBooking({
                id: prop.id,
                status: prop.status.toLowerCase(),
                paymentStatus: prop.paymentStatus || "PENDING",
                weightKg: effWeight,
                pricePerKg: parsedPrice,
                totalPrice: Number((effWeight * parsedPrice).toFixed(1)),
                currency: prop.demand?.currency || "$",
                demand: prop.demand,
                demandId: prop.demandId,
                flightDate: prop.flightDate,
                flightTime: prop.flightTime,
                arrivalDate: prop.arrivalDate,
                arrivalTime: prop.arrivalTime,
                from: prop.demand?.from,
                to: prop.demand?.to,
                sender: prop.demand?.user,
                senderId: prop.demand?.userId,
                traveler: prop.traveler,
                travelerId: prop.travelerId,
                receiver: prop.demand?.user,
                receiverId: prop.demand?.userId,
                createdAt: prop.createdAt,
                isPriceProposal: false,
                isDeliveryProposal: true,
                rawProposal: prop,
                deliveryMethod: merged.deliveryMethod,
                deliveryContactName: merged.deliveryContactName,
                deliveryContactPhone: merged.deliveryContactPhone,
                deliveryFee: merged.deliveryFee,
                deliveryPaymentMethod: merged.deliveryPaymentMethod,
                deliveryAddress: merged.deliveryAddress,
                senderAction: prop.senderAction,
                travelerAction: prop.travelerAction,
              });

              if (merged.deliveryMethod) setBookingDeliveryMethod(merged.deliveryMethod);
              if (merged.deliveryContactName) setBookingContactName(merged.deliveryContactName);
              if (merged.deliveryContactPhone) setBookingContactPhone(merged.deliveryContactPhone);
              if (merged.deliveryFee) setBookingDeliveryFee(String(merged.deliveryFee));
              if (merged.deliveryAddress) setBookingDeliveryAddress(merged.deliveryAddress);
              if (merged.deliveryPaymentMethod) setBookingPaymentMethod(merged.deliveryPaymentMethod);

              const cId = prop.travelerId === user?.id ? prop.demand?.userId : prop.travelerId;
              fetchNegotiationHistory(undefined, cId, prop.demandId);
              return;
            }
          } catch (delivErr) {}
        }
      }

      // Try fetching as standard booking
      try {
        const res = await bookingApi.getBooking(bookingId);
        if (res.data?.success && res.data.data) {
          const bData = res.data.data;
          const calculatedPricePerKg =
            bData.acceptedProposal?.proposedPrice ??
            (bData.totalPrice && bData.weightKg
              ? Number((bData.totalPrice / bData.weightKg).toFixed(1))
              : bData.offer?.pricePerKg ?? 9);

          const initialDelivery = {
            deliveryMethod:
              bData.deliveryMethod ||
              bData.acceptedProposal?.deliveryMethod ||
              bData.offer?.deliveryMethod ||
              bData.acceptedProposal?.booking?.deliveryMethod ||
              null,
            deliveryContactName:
              bData.deliveryContactName ||
              bData.acceptedProposal?.deliveryContactName ||
              bData.offer?.deliveryContactName ||
              bData.acceptedProposal?.booking?.deliveryContactName ||
              null,
            deliveryContactPhone:
              bData.deliveryContactPhone ||
              bData.acceptedProposal?.deliveryContactPhone ||
              bData.offer?.deliveryContactPhone ||
              bData.acceptedProposal?.booking?.deliveryContactPhone ||
              null,
            deliveryFee:
              bData.deliveryFee ??
              bData.acceptedProposal?.deliveryFee ??
              bData.offer?.deliveryFee ??
              bData.acceptedProposal?.booking?.deliveryFee ??
              null,
            deliveryPaymentMethod:
              bData.deliveryPaymentMethod ||
              bData.acceptedProposal?.deliveryPaymentMethod ||
              bData.offer?.deliveryPaymentMethod ||
              bData.acceptedProposal?.booking?.deliveryPaymentMethod ||
              null,
            deliveryAddress:
              bData.deliveryAddress ||
              bData.acceptedProposal?.deliveryAddress ||
              bData.offer?.deliveryAddress ||
              bData.acceptedProposal?.booking?.deliveryAddress ||
              null,
          };
          const merged = await mergeWithCachedDelivery(bookingId, initialDelivery, bData.offer?.id || bData.offerId);
          const deliveryStatus = bData.deliveryStatus || null;

          setBooking({
            ...bData,
            deliveryMethod: merged.deliveryMethod,
            deliveryContactName: merged.deliveryContactName,
            deliveryContactPhone: merged.deliveryContactPhone,
            deliveryFee: merged.deliveryFee,
            deliveryPaymentMethod: merged.deliveryPaymentMethod,
            deliveryAddress: merged.deliveryAddress,
            deliveryStatus,
            pricePerKg: bData.pricePerKg ?? calculatedPricePerKg,
            isPriceProposal: false,
            hasNegotiatedPrice: Boolean(bData.acceptedProposalId || bData.acceptedProposal),
          });

          if (merged.deliveryMethod) setBookingDeliveryMethod(merged.deliveryMethod);
          if (merged.deliveryContactName) setBookingContactName(merged.deliveryContactName);
          if (merged.deliveryContactPhone) setBookingContactPhone(merged.deliveryContactPhone);
          if (merged.deliveryFee) setBookingDeliveryFee(String(merged.deliveryFee));
          if (merged.deliveryAddress) setBookingDeliveryAddress(merged.deliveryAddress);
          if (merged.deliveryPaymentMethod) setBookingPaymentMethod(merged.deliveryPaymentMethod);

          const cId = bData.senderId === user?.id ? bData.offer?.userId : bData.senderId;
          fetchNegotiationHistory(bData.offerId || bData.offer?.id, cId);
          return;
        }
      } catch (err: any) {
        // Fallback: Check if it's a price proposal
        try {
          const propRes = await priceProposalApi.getProposalById(bookingId);
          if (propRes.data?.success && propRes.data.data) {
            const prop = propRes.data.data;
            const initialDelivery = {
              deliveryMethod:
                prop.deliveryMethod ||
                prop.booking?.deliveryMethod ||
                prop.offer?.deliveryMethod ||
                prop.demand?.deliveryMethod ||
                null,
              deliveryContactName:
                prop.deliveryContactName ||
                prop.booking?.deliveryContactName ||
                prop.offer?.deliveryContactName ||
                prop.demand?.deliveryContactName ||
                null,
              deliveryContactPhone:
                prop.deliveryContactPhone ||
                prop.booking?.deliveryContactPhone ||
                prop.offer?.deliveryContactPhone ||
                prop.demand?.deliveryContactPhone ||
                null,
              deliveryFee:
                prop.deliveryFee ??
                prop.booking?.deliveryFee ??
                prop.offer?.deliveryFee ??
                prop.demand?.deliveryFee ??
                null,
              deliveryPaymentMethod:
                prop.deliveryPaymentMethod ||
                prop.booking?.deliveryPaymentMethod ||
                prop.offer?.deliveryPaymentMethod ||
                prop.demand?.deliveryPaymentMethod ||
                null,
              deliveryAddress:
                prop.deliveryAddress ||
                prop.booking?.deliveryAddress ||
                prop.offer?.deliveryAddress ||
                prop.demand?.deliveryAddress ||
                null,
            };
            const merged = await mergeWithCachedDelivery(bookingId, initialDelivery, prop.offer?.id || prop.offerId);
            const deliveryStatus = prop.booking?.deliveryStatus || null;

            setBooking({
              id: prop.id,
              status: prop.status.toLowerCase(),
              weightKg: prop.weightKg || 1,
              pricePerKg: prop.proposedPrice,
              totalPrice: Number(((prop.weightKg || 1) * prop.proposedPrice).toFixed(1)),
              currency: "$",
              offer: prop.offer,
              demand: prop.demand,
              sender: prop.sender,
              senderId: prop.senderId,
              receiver: prop.receiver,
              receiverId: prop.receiverId,
              createdAt: prop.createdAt,
              isPriceProposal: true,
              rawProposal: prop,
              deliveryMethod: merged.deliveryMethod,
              deliveryContactName: merged.deliveryContactName,
              deliveryContactPhone: merged.deliveryContactPhone,
              deliveryFee: merged.deliveryFee,
              deliveryPaymentMethod: merged.deliveryPaymentMethod,
              deliveryAddress: merged.deliveryAddress,
              deliveryStatus,
            });

            if (merged.deliveryMethod) setBookingDeliveryMethod(merged.deliveryMethod);
            if (merged.deliveryContactName) setBookingContactName(merged.deliveryContactName);
            if (merged.deliveryContactPhone) setBookingContactPhone(merged.deliveryContactPhone);
            if (merged.deliveryFee) setBookingDeliveryFee(String(merged.deliveryFee));
            if (merged.deliveryAddress) setBookingDeliveryAddress(merged.deliveryAddress);
            if (merged.deliveryPaymentMethod) setBookingPaymentMethod(merged.deliveryPaymentMethod);

            const cId = prop.senderId === user?.id ? prop.receiverId : prop.senderId;
            fetchNegotiationHistory(prop.offer?.id || prop.offerId, cId);
            return;
          }
        } catch (propErr) {
          // Keep booking error
        }

        // Fallback 2: Check if it's a delivery proposal (model Proposal)
        try {
          const delivPropRes = await proposalApi.getProposalById(bookingId);
          if (delivPropRes.data?.success && delivPropRes.data.data) {
            const prop = delivPropRes.data.data;
            const effWeight = prop.weightKg || prop.demand?.weightKg || 1;
            const parsedPrice = parseFloat(String(prop.proposedPrice || "").replace(/[^0-9.]/g, "")) || Number(prop.demand?.reward) || 0;
            
            const initialDelivery = {
              deliveryMethod: prop.demand?.deliveryMethod || null,
              deliveryContactName: prop.demand?.deliveryContactName || null,
              deliveryContactPhone: prop.demand?.deliveryContactPhone || null,
              deliveryFee: prop.demand?.deliveryFee ?? null,
              deliveryPaymentMethod: prop.demand?.deliveryPaymentMethod || null,
              deliveryAddress: prop.demand?.deliveryAddress || null,
            };
            const merged = await mergeWithCachedDelivery(bookingId, initialDelivery, prop.demandId);

            setBooking({
              id: prop.id,
              status: prop.status.toLowerCase(),
              paymentStatus: prop.paymentStatus || "PENDING",
              weightKg: effWeight,
              pricePerKg: parsedPrice,
              totalPrice: Number((effWeight * parsedPrice).toFixed(1)),
              currency: prop.demand?.currency || "$",
              demand: prop.demand,
              demandId: prop.demandId,
              flightDate: prop.flightDate,
              flightTime: prop.flightTime,
              arrivalDate: prop.arrivalDate,
              arrivalTime: prop.arrivalTime,
              from: prop.demand?.from,
              to: prop.demand?.to,
              sender: prop.demand?.user,
              senderId: prop.demand?.userId,
              traveler: prop.traveler,
              travelerId: prop.travelerId,
              receiver: prop.demand?.user,
              receiverId: prop.demand?.userId,
              createdAt: prop.createdAt,
              isPriceProposal: false,
              isDeliveryProposal: true,
              rawProposal: prop,
              deliveryMethod: merged.deliveryMethod,
              deliveryContactName: merged.deliveryContactName,
              deliveryContactPhone: merged.deliveryContactPhone,
              deliveryFee: merged.deliveryFee,
              deliveryPaymentMethod: merged.deliveryPaymentMethod,
              deliveryAddress: merged.deliveryAddress,
              senderAction: prop.senderAction,
              travelerAction: prop.travelerAction,
            });

            if (merged.deliveryMethod) setBookingDeliveryMethod(merged.deliveryMethod);
            if (merged.deliveryContactName) setBookingContactName(merged.deliveryContactName);
            if (merged.deliveryContactPhone) setBookingContactPhone(merged.deliveryContactPhone);
            if (merged.deliveryFee) setBookingDeliveryFee(String(merged.deliveryFee));
            if (merged.deliveryAddress) setBookingDeliveryAddress(merged.deliveryAddress);
            if (merged.deliveryPaymentMethod) setBookingPaymentMethod(merged.deliveryPaymentMethod);

            const cId = prop.travelerId === user?.id ? prop.demand?.userId : prop.travelerId;
            fetchNegotiationHistory(undefined, cId, prop.demandId);
            return;
          }
        } catch (delivErr) {}

        throw err;
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
  }, [bookingId, language, params.type]);

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
          } ➔ ${booking.offer?.to || "Destination"} (${booking.weightKg} kg - ${booking.totalPrice} $)`,
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
              if (booking.isDeliveryProposal) {
                await proposalApi.cancelProposal(booking.id);
              } else {
                await bookingApi.cancelBooking(booking.id);
              }
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
              if (booking.isDeliveryProposal) {
                await proposalApi.disputeProposal(booking.id);
              } else {
                await bookingApi.disputeBooking(booking.id);
              }
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

    const isPaymentSecured =
      booking.paymentStatus === "HELD" ||
      booking.paymentStatus === "AUTHORIZED";

    if (!isPaymentSecured) {
      Alert.alert(
        language === "ar" ? "الدفع غير مكتمل ⚠️" : "Paiement en attente ⚠️",
        language === "ar"
          ? "لا يمكنك قبول الحجز حتى يقوم المرسل بتأكيد الدفع وحجز المبلغ في الضمان (SafarLink Escrow)."
          : "Le paiement de l'expéditeur est toujours en attente. Vous ne pourrez accepter la réservation qu'une fois les fonds sécurisés sous séquestre PayPal."
      );
      return;
    }

    Alert.alert(
      language === "ar" ? "قبول طلب الحجز" : language === "fr" ? "Accepter la réservation" : "Accept Booking",
      language === "ar"
        ? `هل تريد قبول نقل ${booking.weightKg} كغ بمقابل ${booking.totalPrice} $؟ ستُحجز أموال الضمان فوراً.`
        : `Voulez-vous accepter de transporter ${booking.weightKg} kg pour ${booking.totalPrice} $ ? Les fonds seront sécurisés sous séquestre.`,
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

  const handleAcceptProposal = () => {
    if (!booking) return;
    if (!booking.isPriceProposal) {
      handleAcceptBooking();
      return;
    }
    Alert.alert(
      language === "ar" ? "قبول عرض السعر" : "Accepter l'offre",
      language === "ar"
        ? `هل تقبل عرض السعر (${booking.pricePerKg} $/kg بمجموع ${booking.totalPrice} $)؟`
        : `Acceptez-vous cette proposition de ${booking.pricePerKg} $/kg (Total : ${booking.totalPrice} $) ?`,
      [
        { text: language === "ar" ? "تراجع" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "قبول" : "Accepter",
          onPress: async () => {
            try {
              setSubmittingAction(true);
              const res = await priceProposalApi.acceptProposal(booking.id);
              if (res.data?.success) {
                Alert.alert(
                  language === "ar" ? "تم القبول ✅" : "Offre acceptée ✅",
                  language === "ar"
                    ? "تم قبول العرض بنجاح. يمكن للمرسل الآن إتمام الحجز والدفع."
                    : "L'offre a été acceptée avec succès. L'expéditeur peut finaliser sa réservation."
                );
                fetchBooking();
              }
            } catch (err: any) {
              Alert.alert("Erreur", err?.response?.data?.message || err?.message || "Erreur");
            } finally {
              setSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectProposal = () => {
    if (!booking) return;
    if (!booking.isPriceProposal) {
      handleRejectBooking();
      return;
    }
    Alert.alert(
      language === "ar" ? "رفض عرض السعر" : "Refuser l'offre",
      language === "ar"
        ? "هل أنت متأكد من رفض هذا العرض؟"
        : "Êtes-vous sûr de vouloir refuser cette proposition ?",
      [
        { text: language === "ar" ? "تراجع" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "رفض" : "Refuser",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmittingAction(true);
              const res = await priceProposalApi.rejectProposal(booking.id);
              if (res.data?.success) {
                Alert.alert(
                  language === "ar" ? "تم الرفض ❌" : "Offre refusée ❌",
                  language === "ar" ? "تم رفض عرض السعر." : "Vous avez refusé cette offre."
                );
                fetchBooking();
              }
            } catch (err: any) {
              Alert.alert("Erreur", err?.response?.data?.message || err?.message || "Erreur");
            } finally {
              setSubmittingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleSendCounterOffer = async () => {
    if (!booking) return;
    const pNum = parseFloat(counterPriceInput);
    if (!pNum || isNaN(pNum) || pNum <= 0) {
      Alert.alert(
        language === "ar" ? "تنبيه" : "Attention",
        language === "ar" ? "يرجى إدخال مبلغ صحيح." : "Veuillez entrer un montant valide."
      );
      return;
    }
    setSubmittingAction(true);
    try {
      const counterpartId =
        booking?.isDeliveryProposal
          ? (user?.id === booking.travelerId ? (booking.demand?.userId || booking.senderId) : (booking.travelerId || booking.traveler?.id))
          : (user?.id === booking.senderId
            ? (booking.receiverId || booking.offer?.userId)
            : booking.senderId);

      if (!counterpartId) {
        Alert.alert("Erreur", "Destinataire introuvable");
        return;
      }

      await priceProposalApi.createProposal({
        receiverId: counterpartId,
        proposedPrice: pNum,
        weightKg: booking.weightKg,
        currency: booking.currency || "$",
        offerId: booking.offer?.id,
        demandId: booking.demand?.id || booking.demandId,
        deliveryMethod: booking.deliveryMethod,
        deliveryContactName: booking.deliveryContactName,
        deliveryContactPhone: booking.deliveryContactPhone,
        deliveryFee: booking.deliveryFee,
        deliveryPaymentMethod: booking.deliveryPaymentMethod,
        deliveryAddress: booking.deliveryAddress,
      });

      if (booking.isPriceProposal) {
        await priceProposalApi.rejectProposal(booking.id).catch(() => { });
      }

      setCounterModalVisible(false);
      setCounterPriceInput("");
      Alert.alert(
        language === "ar" ? "تم إرسال الاقتراح المضاد 🚀" : "Contre-offre envoyée 🚀",
        language === "ar"
          ? `تم إرسال اقتراحك الجديد (${pNum} $/kg) بنجاح.`
          : `Votre contre-proposition de ${pNum} $/kg a été envoyée avec succès.`
      );
      fetchBooking();
    } catch (err: any) {
      Alert.alert("Erreur", err?.response?.data?.message || err?.message || "Erreur");
    } finally {
      setSubmittingAction(false);
    }
  };

  const isFlightOwner = booking?.offer?.userId
    ? booking.offer.userId === user?.id
    : (booking?.isPriceProposal
      ? (booking.rawProposal?.offer?.userId ? booking.rawProposal.offer.userId === user?.id : booking.senderId !== user?.id)
      : (booking?.isDeliveryProposal
        ? booking.travelerId === user?.id
        : booking?.senderId !== user?.id));
  const isSender = !isFlightOwner; // Package sender / client
  const isProposalAuthor = Boolean(
    (booking?.isPriceProposal && booking?.senderId === user?.id) ||
    (booking?.isDeliveryProposal && booking?.travelerId === user?.id)
  );
  const isPaymentSecured =
    booking?.paymentStatus === "HELD" ||
    booking?.paymentStatus === "AUTHORIZED";

  const counterpart = booking?.isDeliveryProposal
    ? (user?.id === booking.travelerId ? (booking.demand?.user || booking.sender) : (booking.traveler || booking.rawProposal?.traveler))
    : (isFlightOwner
      ? (booking?.senderId === user?.id ? booking?.receiver : booking?.sender)
      : (booking?.offer?.user || (booking?.senderId === user?.id ? booking?.receiver : booking?.sender)));

  const counterpartRole = booking?.isDeliveryProposal
    ? (user?.id === booking.travelerId
      ? (language === "ar" ? "المرسل" : language === "fr" ? "Expéditeur" : "Sender")
      : (language === "ar" ? "المسافر" : language === "fr" ? "Voyageur" : "Traveler"))
    : (isFlightOwner
      ? (language === "ar" ? "المرسل" : language === "fr" ? "Expéditeur" : "Sender")
      : (language === "ar" ? "المسافر" : language === "fr" ? "Voyageur" : "Traveler"));

  const counterpartName = counterpart?.name || "Membre SafarLink";
  const counterpartAvatar = counterpart?.avatar || MOCK_DEFAULT_AVATAR;
  const counterpartRating = counterpart?.rating || counterpart?.averageRating ? Number(counterpart.rating || counterpart.averageRating).toFixed(1) : "5.0";

  // Real DB dates & times
  const rawFlightDate =
    booking?.offer?.departureDate ||
    booking?.offer?.flightDate ||
    booking?.flightDate ||
    booking?.rawProposal?.flightDate ||
    booking?.demand?.targetDate;
  const rawDestDate =
    booking?.offer?.destinationDate ||
    booking?.offer?.arrivalDate ||
    booking?.arrivalDate ||
    booking?.rawProposal?.arrivalDate ||
    rawFlightDate;

  const formatDateLabel = (d: any) => {
    if (!d) return language === "ar" ? "غير محدد" : "Flexible";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString(language === "ar" ? "ar-TN" : language === "en" ? "en-US" : "fr-FR", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const displayFlightDate = formatDateLabel(rawFlightDate);
  const displayDestDate = formatDateLabel(rawDestDate);

  const departureTime = booking?.offer?.departureTime || booking?.departureTime || "14:30";
  const destinationTime = booking?.offer?.destinationTime || booking?.offer?.arrivalTime || booking?.destinationTime || "18:45";

  // Initial offer price from the flight announcement (when offer was first created)
  const initialOfferPrice =
    booking?.offer?.pricePerKg != null
      ? Number(booking.offer.pricePerKg)
      : booking?.rawProposal?.offer?.pricePerKg != null
      ? Number(booking.rawProposal.offer.pricePerKg)
      : null;

  // Accepted proposal in negotiation history if any
  const acceptedProposalItem = negotiationHistory.find((p: any) => p.status === "ACCEPTED");

  // The actual agreed transaction price (Prix final convenu / négocié):
  const agreedPricePerKg =
    acceptedProposalItem?.proposedPrice != null
      ? Number(acceptedProposalItem.proposedPrice)
      : booking?.acceptedProposal?.proposedPrice != null
      ? Number(booking.acceptedProposal.proposedPrice)
      : booking?.pricePerKg != null
      ? Number(booking.pricePerKg)
      : booking?.totalPrice != null && booking?.weightKg
      ? Number((booking.totalPrice / booking.weightKg).toFixed(1))
      : initialOfferPrice || 9;

  // Total price calculated on agreed price
  const displayTotalPrice = Number(((booking?.weightKg || 1) * agreedPricePerKg).toFixed(1));

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

  // Delivery details resolution
  const offerObj = booking?.offer || booking?.rawProposal?.offer;
  const demandObj = booking?.demand || booking?.rawProposal?.demand;
  const fromCity = offerObj?.from || booking?.from || demandObj?.from || "";
  const toCity = offerObj?.to || booking?.to || demandObj?.to || "";

  const isTunisiaFlight =
    isTunisiaLocation(fromCity) ||
    isTunisiaLocation(toCity) ||
    Boolean(
      booking?.deliveryMethod ||
      bookingDeliveryMethod ||
      offerObj?.deliveryMethod ||
      demandObj?.deliveryMethod
    );

  const resolvedDeliveryMethod =
    booking?.deliveryMethod ||
    bookingDeliveryMethod ||
    booking?.rawProposal?.deliveryMethod ||
    booking?.acceptedProposal?.deliveryMethod ||
    offerObj?.deliveryMethod ||
    demandObj?.deliveryMethod ||
    booking?.acceptedProposal?.booking?.deliveryMethod ||
    (isTunisiaFlight ? "FAMILY" : null);

  const resolvedContactName =
    booking?.deliveryContactName ||
    bookingContactName ||
    booking?.rawProposal?.deliveryContactName ||
    booking?.acceptedProposal?.deliveryContactName ||
    offerObj?.deliveryContactName ||
    demandObj?.deliveryContactName ||
    booking?.acceptedProposal?.booking?.deliveryContactName ||
    null;

  const resolvedContactPhone =
    booking?.deliveryContactPhone ||
    bookingContactPhone ||
    booking?.rawProposal?.deliveryContactPhone ||
    booking?.acceptedProposal?.deliveryContactPhone ||
    offerObj?.deliveryContactPhone ||
    demandObj?.deliveryContactPhone ||
    booking?.acceptedProposal?.booking?.deliveryContactPhone ||
    null;

  const resolvedDeliveryFee =
    booking?.deliveryFee ??
    (bookingDeliveryFee ? parseFloat(bookingDeliveryFee) : null) ??
    booking?.rawProposal?.deliveryFee ??
    booking?.acceptedProposal?.deliveryFee ??
    offerObj?.deliveryFee ??
    demandObj?.deliveryFee ??
    booking?.acceptedProposal?.booking?.deliveryFee ??
    null;

  const resolvedPaymentMethod =
    booking?.deliveryPaymentMethod ||
    bookingPaymentMethod ||
    booking?.rawProposal?.deliveryPaymentMethod ||
    booking?.acceptedProposal?.deliveryPaymentMethod ||
    offerObj?.deliveryPaymentMethod ||
    demandObj?.deliveryPaymentMethod ||
    booking?.acceptedProposal?.booking?.deliveryPaymentMethod ||
    null;

  const resolvedDeliveryAddress =
    booking?.deliveryAddress ||
    bookingDeliveryAddress ||
    booking?.rawProposal?.deliveryAddress ||
    booking?.acceptedProposal?.deliveryAddress ||
    offerObj?.deliveryAddress ||
    demandObj?.deliveryAddress ||
    booking?.acceptedProposal?.booking?.deliveryAddress ||
    null;

  const resolvedDeliveryStatus =
    booking?.deliveryStatus ||
    booking?.acceptedProposal?.booking?.deliveryStatus ||
    null;

  // Dynamic status details directly from DB
  const getStatusBadge = () => {
    if (booking?.isPriceProposal) {
      if (normStatus === "accepted") {
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          label: language === "ar" ? "تم قبول العرض ✅" : "Proposition acceptée ✅",
          desc: isSender
            ? (language === "ar"
              ? "تم الاتفاق على السعر بنجاح! يمكنك الآن إتمام الحجز والدفع بالضمان."
              : "Tarif convenu avec succès ! Vous pouvez maintenant finaliser votre réservation et payer en Escrow.")
            : (language === "ar"
              ? "تم تأكيد الاتفاق على السعر. في انتظار إتمام الحجز والدفع من قبل المرسل."
              : "Tarif convenu avec succès. En attente du paiement par l'expéditeur."),
        };
      }
      if (normStatus === "rejected") {
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          label: language === "ar" ? "تم رفض العرض ❌" : "Proposition refusée ❌",
          desc:
            language === "ar"
              ? "تم رفض هذا الاقتراح أو إلغاؤه."
              : "Cette proposition de prix a été refusée ou annulée.",
        };
      }
      return {
        bg: "#FFFBEB",
        text: "#D97706",
        border: "#FDE68A",
        label: !isProposalAuthor
          ? (language === "ar" ? "عرض سعر بانتظار قرارك ⏳" : "Proposition de prix reçue ⏳")
          : (language === "ar"
            ? `في انتظار رد ${isFlightOwner ? "المرسل" : "المسافر"} ⏳`
            : `En attente du ${isFlightOwner ? "client" : "voyageur"} ⏳`),
        desc: !isProposalAuthor
          ? (language === "ar"
            ? `يقترح ${isFlightOwner ? "المرسل" : "المسافر"} ${counterpartName} سعر ${booking.pricePerKg} $/kg لنقل ${booking.weightKg} كغ (المجموع: ${booking.totalPrice} $). يمكنك القبول أو تقديم عرض مضاد أو الرفض.`
            : `${isFlightOwner ? "L'expéditeur" : "Le voyageur"} ${counterpartName} vous propose un tarif de ${booking.pricePerKg} $/kg pour ${booking.weightKg} kg (Total : ${booking.totalPrice} $). Vous pouvez accepter, négocier ou refuser ci-dessous.`)
          : (language === "ar"
            ? `تم إرسال اقتراحك (${booking.pricePerKg} $/kg • ${booking.totalPrice} $) إلى ${counterpartName}. ستتلقى إشعاراً فور الرد.`
            : `Votre proposition de ${booking.pricePerKg} $/kg (${booking.totalPrice} $) a été transmise à ${counterpartName}. Vous recevrez une notification dès sa décision.`),
      };
    }

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
        <TouchableOpacity style={styles.backBtnTextOnly} onPress={handleBack}>
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
          onPress={handleBack}
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

        {/* ── PROFILE CARD (Counterpart: Traveler or Sender) ── */}
        <TouchableOpacity
          style={[styles.card, darkMode && styles.cardDark, { paddingVertical: 14, paddingHorizontal: 14 }]}
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Left: Avatar with Status Dot */}
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: counterpartAvatar }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 1.5,
                  borderColor: darkMode ? "#334155" : "#E2E8F0",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#10B981",
                  width: 13,
                  height: 13,
                  borderRadius: 6.5,
                  borderWidth: 2,
                  borderColor: darkMode ? "#1E293B" : "#FFFFFF",
                }}
              />
            </View>

            {/* Middle: Details (Name, Role Badge, Star Rating Number) */}
            <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
              {/* Row 1: Name and Role Badge */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                <Text
                  style={[
                    styles.profileName,
                    darkMode && styles.textDark,
                    { fontSize: 16, fontWeight: "700", marginBottom: 0, flexShrink: 1 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {counterpartName}
                </Text>


              </View>

              {/* Row 2: Star Rating, Rating Number & Review Count */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontSize: 12.5, fontWeight: "800", color: darkMode ? "#FBBF24" : "#D97706" }}>
                    {counterpartRating}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: darkMode ? "#94A3B8" : "#64748B" }}>
                  ({counterpart?.reviewCount ?? 5} {language === "ar" ? "تقييم" : "avis"})
                </Text>
                <Text style={{ fontSize: 10, color: darkMode ? "#475569" : "#CBD5E1" }}>•</Text>
                <Text style={{ fontSize: 10.5, color: "#10B981", fontWeight: "600" }}>
                  {language === "ar" ? "موثق ✓" : "Vérifié ✓"}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: isFlightOwner ? "#F0FDF4" : "#EFF6FF",
                  borderWidth: 1,
                  borderColor: isFlightOwner ? "#BBF7D0" : "#BFDBFE",
                  paddingHorizontal: 8,
                  paddingVertical: 2.5,
                  borderRadius: 6,
                  marginTop: 3,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: "700",
                    color: isFlightOwner ? "#15803D" : "#1D4ED8",
                  }}
                  numberOfLines={1}
                >
                  {isFlightOwner ? "📦 " : "✈️ "}
                  {counterpartRole}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Right: "Voir le profil ›" / "الملف الشخصي ›" */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 10,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: darkMode ? "#1E293B" : "#F1F5F9",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 11.5, fontWeight: "700", color: primaryColor }}>
                {language === "ar" ? "عرض الملف الشخصي" : "Voir le profil"}
              </Text>
              <ChevronRight size={14} color={primaryColor} />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── FLIGHT & CORRIDOR ROUTE CARD ── */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={[styles.cardSectionTitle, darkMode && styles.textDark]}>
            {language === "ar" ? "مسار الرحلة والشحنة" : "Itinéraire & Détails du vol"}
          </Text>

          {/* Flight Corridor: Departure with date & time underneath, Destination with date & time underneath */}
          <View style={[styles.flightRouteDatesCard, darkMode && styles.flightRouteDatesCardDark]}>
            {/* Departure City + Date & Time underneath */}
            <View style={styles.flightLocCol}>
              <Text style={[styles.flightCityName, darkMode && styles.textDark]} numberOfLines={1}>
                {formatLocationDisplay(booking.offer?.from || booking?.from || "Départ")}
              </Text>
              <View style={styles.flightDateUnderRowLeft}>
                <Calendar size={11} color="#64748B" />
                <Text style={[styles.flightDateUnderText, darkMode && styles.textDark]} numberOfLines={1}>
                  {displayFlightDate}
                </Text>
              </View>
              {departureTime ? (
                <View style={styles.flightTimeUnderRowLeft}>
                  <Clock size={10} color="#94A3B8" />
                  <Text style={[styles.flightTimeUnderText, darkMode && styles.textMutedDark]} numberOfLines={1}>
                    {departureTime}
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

            {/* Destination City + Date & Time underneath */}
            <View style={[styles.flightLocCol, styles.alignRight]}>
              <Text style={[styles.flightCityName, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
                {formatLocationDisplay(booking.offer?.to || booking?.to || "Destination")}
              </Text>
              <View style={styles.flightDateUnderRowRight}>
                <Calendar size={11} color="#64748B" />
                <Text style={[styles.flightDateUnderText, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
                  {displayDestDate}
                </Text>
              </View>
              {destinationTime ? (
                <View style={styles.flightTimeUnderRowRight}>
                  <Clock size={10} color="#94A3B8" />
                  <Text style={[styles.flightTimeUnderText, styles.textRight, darkMode && styles.textMutedDark]} numberOfLines={1}>
                    {destinationTime}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Package Specs Grid */}
          <View style={styles.metaGrid}>
            <View style={[styles.metaGridItem, darkMode && styles.metaGridItemDark]}>
              <Package size={15} color={primaryColor} />
              <View style={styles.metaItemTextCol}>
                <Text style={styles.metaItemLabel}>
                  {language === "ar" ? "الوزن المحجوز" : "Poids réservé"}
                </Text>
                <Text style={[styles.metaItemValue, darkMode && styles.textDark]}>
                  {booking.weightKg} kg
                </Text>
              </View>
            </View>

            <View style={[styles.metaGridItem, darkMode && styles.metaGridItemDark]}>
              <Coins size={15} color={primaryColor} />
              <View style={styles.metaItemTextCol}>
                <Text style={styles.metaItemLabel}>
                  {initialOfferPrice != null && agreedPricePerKg !== initialOfferPrice
                    ? (language === "ar" ? "السعر المتفق عليه" : "Tarif convenu")
                    : (language === "ar" ? "السعر للكيلوغرام" : "Prix par kg")}
                </Text>
                <Text style={[styles.metaItemValue, darkMode && styles.textDark]}>
                  {agreedPricePerKg} $/kg
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── FINANCIAL & PAYMENT SUMMARY (Direct DB Values) ── */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <View style={styles.cardHeaderWithIcon}>
            <Coins size={16} color={primaryColor} />
            <Text style={[styles.cardSectionTitle, darkMode && styles.textDark, { marginBottom: 0 }]}>
              {language === "ar" ? "تفاصيل السعر والدفع" : "Tarification & Paiement"}
            </Text>
          </View>

          {/* Reference indicator of starting offer price before negotiation */}
          {initialOfferPrice != null && agreedPricePerKg !== initialOfferPrice && (
            <View style={[styles.negotiationOriginBanner, darkMode && styles.negotiationOriginBannerDark]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <Text style={[styles.negotiationOriginText, darkMode && styles.textMutedDark]}>
                  {language === "ar" ? "سعر البداية في الإعلان:" : "Prix initial de l'annonce :"}
                </Text>
                <Text style={[styles.negotiationOriginStrike, darkMode && styles.textMutedDark]}>
                  {initialOfferPrice} $/kg
                </Text>
                <Text style={{ fontSize: 11.5, color: primaryColor, fontWeight: "700" }}>
                  → {language === "ar" ? "تم الاتفاق على" : "Convenu à"} {agreedPricePerKg} $/kg
                </Text>
              </View>
            </View>
          )}

          <View style={styles.priceBreakdownBox}>
            {/* 1. Tarif convenu / au kg (The actual agreed rate!) */}
            <View style={styles.priceRowItem}>
              <View style={styles.priceLabelCol}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.priceRowTitle, darkMode && styles.textDark]}>
                    {initialOfferPrice != null && agreedPricePerKg !== initialOfferPrice
                      ? (language === "ar" ? "السعر المتفق عليه" : "Tarif convenu au kg")
                      : (language === "ar" ? "السعر للكيلوغرام" : "Tarif au kg")}
                  </Text>
                  {initialOfferPrice != null && agreedPricePerKg !== initialOfferPrice && (
                    <View style={styles.negotiatedTag}>
                      <Text style={styles.negotiatedTagText}>
                        {language === "ar" ? "متفق عليه" : "Convenu"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.priceRowSubtitle}>
                  {language === "ar" ? "السعر النهائي المحتسب بعد المفاوضة" : "Tarif final retenu pour la transaction"}
                </Text>
              </View>
              <Text style={[styles.priceValHighlight, { color: primaryColor }]}>
                {agreedPricePerKg} $/kg
              </Text>
            </View>

            {/* 2. Poids demandé / réservé */}
            <View style={[styles.priceRowItem, { marginTop: 6 }]}>
              <View style={styles.priceLabelCol}>
                <Text style={[styles.priceRowTitle, darkMode && styles.textDark]}>
                  {language === "ar" ? "الوزن المطلوب" : "Poids réservé"}
                </Text>
              </View>
              <Text style={[styles.priceValSecondary, darkMode && styles.textDark]}>
                {booking.weightKg} kg
              </Text>
            </View>

            {/* 3. Total complet à payer (The complete display calculated on agreed price!) */}
            <View style={[styles.totalHighlightCard, darkMode && styles.totalHighlightCardDark]}>
              <View style={styles.priceLabelCol}>
                <Text style={[styles.totalCardLabel, darkMode && styles.textDark]}>
                  {language === "ar"
                    ? (isPaymentSecured ? "المبلغ الإجمالي المدفوع" : "المجموع المطلوب للدفع")
                    : (isPaymentSecured ? "Montant total payé" : "Total à payer")}
                </Text>
                <Text style={styles.totalFormulaText}>
                  {booking.weightKg} kg × {agreedPricePerKg} $/kg
                </Text>
              </View>
              <Text style={[styles.totalCardAmount, { color: isPaymentSecured ? "#059669" : primaryColor }]}>
                {displayTotalPrice} $
              </Text>
            </View>
          </View>

          {isSender && booking.deliveryFee && booking.deliveryFee > 0 && (
            <View style={styles.deliveryFeeNotice}>
              <Text style={[styles.deliveryFeeNoticeText, darkMode && styles.textMutedDark]}>
                ℹ️ {language === "ar" ? "رسوم التوصيل المحلي بتونس:" : "Livraison locale Tunisie :"} {booking.deliveryFee} TND ({booking.deliveryPaymentMethod || "Paiement à la livraison"})
              </Text>
            </View>
          )}
        </View>

        {/* ── HISTORIQUE DE NÉGOCIATION DE PRIX (Placed directly under Price Card!) ── */}
        {(booking.isPriceProposal || booking.isDeliveryProposal || negotiationHistory.length > 0) && (
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <View style={styles.cardHeaderWithIcon}>
              <Coins size={16} color={primaryColor} />
              <Text style={[styles.cardSectionTitle, darkMode && styles.textDark, { marginBottom: 0 }]}>
                {language === "ar" ? "سجل التفاوض على السعر" : "Historique de négociation"}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: primaryColor + "15" }]}>
                <Text style={[styles.countBadgeText, { color: primaryColor }]}>
                  {negotiationHistory.length > 0 ? negotiationHistory.length : 1}
                </Text>
              </View>
            </View>

            {/* Negotiation steps / timeline */}
            <View style={styles.negotiationTimeline}>
              {negotiationHistory.length > 0 ? (
                negotiationHistory.map((item, index) => {
                  const isMe = item.senderId === user?.id;
                  const isLast = index === negotiationHistory.length - 1;
                  const totalEst = Number(((item.weightKg || booking.weightKg || 1) * item.proposedPrice).toFixed(1));
                  const dObj = item.createdAt ? new Date(item.createdAt) : null;
                  const timeStr = dObj ? dObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                  const dayStr = dObj ? dObj.toLocaleDateString([], { day: "numeric", month: "short" }) : "";
                  const dateStr = dObj ? `${timeStr} • ${dayStr}` : "";

                  return (
                    <View key={item.id} style={styles.timelineItem}>
                      {/* Vertical connector line */}
                      {!isLast && <View style={[styles.timelineLine, darkMode && styles.timelineLineDark]} />}

                      {/* Status dot / badge */}
                      <View
                        style={[
                          styles.timelineDot,
                          item.status === "ACCEPTED"
                            ? styles.timelineDotAccepted
                            : item.status === "REJECTED"
                              ? styles.timelineDotRejected
                              : styles.timelineDotPending,
                        ]}
                      >
                        {item.status === "ACCEPTED" ? (
                          <CheckCircle2 size={12} color="#FFFFFF" />
                        ) : item.status === "REJECTED" ? (
                          <XCircle size={12} color="#FFFFFF" />
                        ) : (
                          <Clock size={12} color="#FFFFFF" />
                        )}
                      </View>

                      {/* Step Content */}
                      <View style={[styles.timelineBubble, darkMode && styles.timelineBubbleDark, isLast && styles.timelineBubbleActive]}>
                        <View style={styles.timelineBubbleHeader}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1, minWidth: 0, marginRight: 8 }}>
                            <Image source={{ uri: item.sender?.avatar || MOCK_DEFAULT_AVATAR }} style={styles.timelineAvatar} />
                            <Text
                              style={[styles.timelineSenderName, darkMode && styles.textDark]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {isMe ? (language === "ar" ? "أنت" : "Vous") : item.sender?.name || (language === "ar" ? "الطرف الآخر" : "Partenaire")}
                            </Text>
                          </View>
                          <Text style={styles.timelineTimeText} numberOfLines={1}>
                            {dateStr}
                          </Text>
                        </View>

                        <View style={styles.timelinePriceRow}>
                          <View>
                            <Text style={styles.timelinePriceLabel}>
                              {index === 0
                                ? (language === "ar" ? "العرض الأول:" : "Offre initiale :")
                                : (language === "ar" ? "اقتراح مضاد:" : "Contre-offre :")}
                            </Text>
                            <Text style={[styles.timelinePriceVal, { color: primaryColor }]}>
                              {item.proposedPrice} $/kg
                              {" "}
                              <Text style={styles.timelineTotalText}>
                                ({totalEst} $ / {item.weightKg || booking.weightKg || 1} kg)
                              </Text>
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.timelineStatusChip,
                              item.status === "ACCEPTED" && styles.chipAccepted,
                              item.status === "REJECTED" && styles.chipRejected,
                              item.status === "PENDING" && styles.chipPending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timelineStatusText,
                                item.status === "ACCEPTED" && styles.textAccepted,
                                item.status === "REJECTED" && styles.textRejected,
                                item.status === "PENDING" && styles.textPending,
                              ]}
                            >
                              {item.status === "ACCEPTED"
                                ? (language === "ar" ? "مقبول ✅" : "Accepté ✅")
                                : item.status === "REJECTED"
                                  ? (language === "ar" ? "مرفوض ❌" : "Refusé ❌")
                                  : (language === "ar" ? "قيد الانتظار ⏳" : "En attente ⏳")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                /* Fallback single proposal step */
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.timelineDotPending]}>
                    <Clock size={12} color="#FFFFFF" />
                  </View>
                  <View style={[styles.timelineBubble, darkMode && styles.timelineBubbleDark, styles.timelineBubbleActive]}>
                    <View style={styles.timelineBubbleHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1, minWidth: 0, marginRight: 8 }}>
                        <Text style={[styles.timelineSenderName, darkMode && styles.textDark]} numberOfLines={1} ellipsizeMode="tail">
                          {counterpartName}
                        </Text>
                      </View>
                      <Text style={styles.timelineTimeText} numberOfLines={1}>{displayCreatedAt}</Text>
                    </View>
                    <View style={styles.timelinePriceRow}>
                      <Text style={[styles.timelinePriceVal, { color: primaryColor }]}>
                        {booking.pricePerKg} $/kg ({booking.totalPrice} $)
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── TUNISIA DOMESTIC DELIVERY DETAILS (If Selected or Tunisia Flight) ── */}
        {(Boolean(resolvedDeliveryMethod) || isTunisiaFlight) && (
          <TunisiaDeliveryDetailsCard
            deliveryMethod={resolvedDeliveryMethod || (isTunisiaFlight ? "FAMILY" : null)}
            contactName={resolvedContactName}
            contactPhone={resolvedContactPhone}
            deliveryFee={resolvedDeliveryFee}
            paymentMethod={resolvedPaymentMethod}
            deliveryAddress={resolvedDeliveryAddress}
            deliveryStatus={resolvedDeliveryStatus}
            bookingStatus={booking.status}
            isTraveler={!isSender}
            hidePricing={!isSender}
            onEdit={
              isSender && normStatus !== "completed" && normStatus !== "delivered" && normStatus !== "cancelled"
                ? () => setCheckoutModalVisible(true)
                : undefined
            }
            containerStyle={{ marginBottom: 16 }}
          />
        )}

        {/* ── SECURITY GUARANTEE BOX ── */}
        <View style={[styles.guaranteeBox, { marginBottom: 16 }]}>
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

        {/* ── MUTUAL RESOLUTION SECTION (Only during active delivery confirmation / dispute, NEVER before or after) ── */}
        {!booking.isPriceProposal && (normStatus === "delivered" || normStatus === "disputed") ? (
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
                {language === "ar" ? "تم إلغاء هذه العملية" : "Demande annulée / refusée"}
              </Text>
              <Text style={styles.finalStatusDesc}>
                {booking.isPriceProposal
                  ? (language === "ar" ? "تم رفض أو سحب هذا العرض." : "Cette proposition a été refusée ou annulée.")
                  : (language === "ar" ? "تم إلغاء الحجز وإعادة المبلغ إلى وسيلة الدفع الخاصة بك." : "Cette réservation est annulée et le remboursement a été effectué.")}
              </Text>
            </View>
          </View>
        ) : booking.isPriceProposal && normStatus === "accepted" ? (
          <View>
            <View style={[styles.finalStatusCard, styles.finalSuccessCard]}>
              <CheckCircle2 size={24} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.finalStatusTitle}>
                  {language === "ar" ? "تم قبول العرض بنجاح ✅" : "Proposition acceptée ✅"}
                </Text>
                <Text style={styles.finalStatusDesc}>
                  {isSender
                    ? (language === "ar" ? "تم الاتفاق على السعر بنجاح! يمكنك الآن إتمام الحجز والدفع بالضمان مباشرة من هنا." : "Tarif convenu avec succès ! Vous pouvez maintenant finaliser votre réservation et payer en Escrow ici.")
                    : (language === "ar" ? "تم تأكيد الاتفاق على السعر بنجاح. بانتظار إتمام الحجز والدفع من قبل المرسل." : "Tarif convenu avec succès. En attente de la finalisation et du paiement par l'expéditeur.")}
                </Text>
              </View>
            </View>

            {isSender && (
              <View style={{ marginTop: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.acceptDemandBtn,
                    { backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 14 },
                    checkoutLoading && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    handleFinalizeAndPay();
                  }}
                  disabled={checkoutLoading}
                  activeOpacity={0.85}
                >
                  {checkoutLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <Lock size={18} color="#FFFFFF" />
                      <Text style={[styles.acceptDemandBtnText, { fontSize: 14, fontWeight: "800" }]}>
                        {language === "ar"
                          ? `إتمام الحجز والدفع الآمن (${booking.totalPrice} $)`
                          : `Finaliser & Payer en Escrow (${booking.totalPrice} $)`}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* PENDING status notice */
          <View style={[styles.finalStatusCard, styles.pendingNoticeCard]}>
            <Clock size={22} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.finalStatusTitle, { color: "#D97706" }]}>
                {booking.isDeliveryProposal
                  ? isProposalAuthor
                    ? (language === "ar" ? `في انتظار رد ${counterpartName}` : `En attente de réponse de ${counterpartName}`)
                    : (language === "ar" ? "عرض توصيل جديد بانتظار قرارك" : "Proposition de livraison reçue")
                  : booking.isPriceProposal
                  ? !isProposalAuthor
                    ? (language === "ar" ? "عرض سعر بانتظار قرارك" : "Proposition de tarif reçue")
                    : (language === "ar" ? `في انتظار رد ${counterpartName}` : `En attente de réponse de ${counterpartName}`)
                  : isFlightOwner
                    ? (language === "ar" ? "طلب حجز جديد بانتظار قرارك" : "Nouvelle demande de réservation")
                    : (language === "ar" ? "في انتظار رد المسافر" : "En attente de réponse du voyageur")}
              </Text>
              <Text style={styles.finalStatusDesc}>
                {booking.isDeliveryProposal
                  ? isProposalAuthor
                    ? (language === "ar"
                      ? `تم إرسال اقتراحك لرحلة ${booking.flightDate || "المحددة"} إلى ${counterpartName}. يمكنك سحبه في أي وقت.`
                      : `Votre proposition de vol (${booking.flightDate || "Flexible"}) a été envoyée à ${counterpartName}. En attente de sa décision.`)
                    : (language === "ar"
                      ? `يقترح ${counterpartName} توصيل طردك في رحلة ${booking.flightDate || "المحددة"}.`
                      : `${counterpartName} vous propose d'acheminer votre colis pour le vol du ${booking.flightDate || "Flexible"}.`)
                  : booking.isPriceProposal
                  ? !isProposalAuthor
                    ? (language === "ar"
                      ? `يقترح ${counterpartName} سعر ${booking.pricePerKg} $/kg لنقل ${booking.weightKg} كغ (المجموع: ${booking.totalPrice} $). يمكنك القبول أو تقديم اقتراح مضاد أو الرفض.`
                      : `${counterpartName} vous propose ${booking.pricePerKg} $/kg pour ${booking.weightKg} kg (Total : ${booking.totalPrice} $). Vous pouvez accepter, faire une contre-offre ou refuser ci-dessous.`)
                    : (language === "ar"
                      ? `تم إرسال اقتراحك (${booking.pricePerKg} $/kg • ${booking.totalPrice} $) إلى ${counterpartName}. يمكنك تعديله أو سحبه في أي وقت.`
                      : `Votre proposition (${booking.pricePerKg} $/kg • ${booking.totalPrice} $) a été envoyée à ${counterpartName}. En attente de sa décision.`)
                  : isFlightOwner
                    ? (language === "ar" ? `طلب حجز جديد من ${counterpartName}. يمكنك القبول أو الرفض.` : `Nouvelle demande de réservation de ${counterpartName}.`)
                    : (language === "ar" ? "تم إرسال طلبك إلى المسافر. بعد القبول ستتمكن من المتابعة." : "Votre demande est en cours d'examen par le voyageur. Dès acceptation, vous pourrez finaliser.")}
              </Text>
            </View>
          </View>
        )}

        {/* ── ACTIONS TO DECIDE (ACCEPT / REJECT / COUNTER) WHEN PENDING ── */}
        {normStatus === "pending" && (
          booking.isDeliveryProposal ? (
            isProposalAuthor ? (
              <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
                <TouchableOpacity
                  style={[styles.cancelPendingBtn, { flex: 1, marginTop: 0 }]}
                  onPress={handleCancelPending}
                  disabled={submittingAction}
                  activeOpacity={0.8}
                >
                  <XCircle size={16} color="#DC2626" />
                  <Text style={styles.cancelPendingBtnText}>
                    {language === "ar" ? "سحب العرض" : "Retirer"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelPendingBtn,
                    { flex: 1, marginTop: 0, backgroundColor: primaryColor + "15", borderColor: primaryColor + "40" },
                  ]}
                  onPress={() => {
                    setCounterPriceInput(String(booking.pricePerKg || ""));
                    setCounterModalVisible(true);
                  }}
                  disabled={submittingAction}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={15} color={primaryColor} />
                  <Text style={[styles.cancelPendingBtnText, { color: primaryColor }]}>
                    {language === "ar" ? "تعديل السعر ✏️" : "Modifier le prix ✏️"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.travelerDecisionGroup}>
                <TouchableOpacity
                  style={[styles.acceptDemandBtn, { backgroundColor: "#059669" }]}
                  onPress={() => handleFinalizeAndPay()}
                  disabled={submittingAction}
                  activeOpacity={0.8}
                >
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.acceptDemandBtnText}>
                    {language === "ar"
                      ? `قبول العرض (${booking.pricePerKg} $/kg • ${booking.totalPrice} $)`
                      : `Accepter (${booking.pricePerKg} $/kg • ${booking.totalPrice} $)`}
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.rejectDemandBtn, { flex: 1, marginTop: 0 }]}
                    onPress={handleCancelPending}
                    disabled={submittingAction}
                    activeOpacity={0.8}
                  >
                    <XCircle size={16} color="#DC2626" />
                    <Text style={styles.rejectDemandBtnText}>
                      {language === "ar" ? "رفض" : "Refuser"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rejectDemandBtn,
                      { flex: 1, marginTop: 0, backgroundColor: primaryColor + "15", borderColor: primaryColor + "40" },
                    ]}
                    onPress={() => {
                      setCounterPriceInput("");
                      setCounterModalVisible(true);
                    }}
                    disabled={submittingAction}
                    activeOpacity={0.8}
                  >
                    <RefreshCw size={15} color={primaryColor} />
                    <Text style={[styles.rejectDemandBtnText, { color: primaryColor }]}>
                      {language === "ar" ? "اقتراح مضاد" : "Contre-offre"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : booking.isPriceProposal ? (
            !isProposalAuthor ? (
              <View style={styles.travelerDecisionGroup}>
                <TouchableOpacity
                  style={[styles.acceptDemandBtn, { backgroundColor: "#059669" }]}
                  onPress={handleAcceptProposal}
                  disabled={submittingAction}
                  activeOpacity={0.8}
                >
                  {submittingAction ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={18} color="#FFFFFF" />
                      <Text style={styles.acceptDemandBtnText}>
                        {language === "ar"
                          ? `قبول العرض (${booking.pricePerKg} $/kg • ${booking.totalPrice} $)`
                          : `Accepter l'offre (${booking.pricePerKg} $/kg • ${booking.totalPrice} $)`}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.rejectDemandBtn, { flex: 1, marginTop: 0 }]}
                    onPress={handleRejectProposal}
                    disabled={submittingAction}
                    activeOpacity={0.8}
                  >
                    <XCircle size={16} color="#DC2626" />
                    <Text style={styles.rejectDemandBtnText}>
                      {language === "ar" ? "رفض" : "Refuser"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rejectDemandBtn,
                      { flex: 1, marginTop: 0, backgroundColor: primaryColor + "15", borderColor: primaryColor + "40" },
                    ]}
                    onPress={() => {
                      setCounterPriceInput("");
                      setCounterModalVisible(true);
                    }}
                    disabled={submittingAction}
                    activeOpacity={0.8}
                  >
                    <RefreshCw size={15} color={primaryColor} />
                    <Text style={[styles.rejectDemandBtnText, { color: primaryColor }]}>
                      {language === "ar" ? "اقتراح مضاد" : "Contre-offre"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cancelPendingBtn}
                onPress={handleRejectProposal}
                disabled={submittingAction}
                activeOpacity={0.8}
              >
                <XCircle size={16} color="#DC2626" />
                <Text style={styles.cancelPendingBtnText}>
                  {language === "ar" ? "سحب عرض السعر" : "Annuler ma proposition"}
                </Text>
              </TouchableOpacity>
            )
          ) : (
            isFlightOwner ? (
              <View style={styles.travelerDecisionGroup}>
                {booking.paymentStatus !== "HELD" && booking.paymentStatus !== "AUTHORIZED" && (
                  <View style={{ marginBottom: 10, padding: 10, borderRadius: 8, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A", flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Clock size={16} color="#D97706" />
                    <Text style={{ fontSize: 12, color: "#B45309", flex: 1, fontWeight: "500" }}>
                      {language === "ar"
                        ? "في انتظار تأكيد الدفع من المرسل عبر PayPal Escrow قبل القبول."
                        : "En attente de la validation du paiement par l'expéditeur via PayPal Escrow avant de pouvoir accepter."}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.acceptDemandBtn,
                    booking.paymentStatus !== "HELD" &&
                    booking.paymentStatus !== "AUTHORIZED" && {
                      opacity: 0.75,
                      backgroundColor: "#64748B",
                    },
                  ]}
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
            ) : (
              <TouchableOpacity
                style={styles.cancelPendingBtn}
                onPress={handleCancelPending}
                disabled={submittingAction}
                activeOpacity={0.8}
              >
                <XCircle size={16} color="#DC2626" />
                <Text style={styles.cancelPendingBtnText}>
                  {language === "ar" ? "إلغاء طلب الحجز واسترداد التفويض" : "Annuler ma demande de réservation"}
                </Text>
              </TouchableOpacity>
            )
          )
        )}

        {/* ── DISPUTE BUTTON (Only during active delivery) ── */}
        {!booking.isPriceProposal && (normStatus === "in_transit" || normStatus === "delivered") && (
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

      {/* ── COUNTER OFFER MODAL ── */}
      <Modal
        visible={counterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCounterModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, darkMode && styles.modalCardDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
                {language === "ar" ? "تقديم اقتراح مضاد 💬" : "Faire une contre-offre 💬"}
              </Text>
              <TouchableOpacity
                onPress={() => setCounterModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, darkMode && styles.textMutedDark]}>
              {language === "ar"
                ? `اقترح سعراً جديداً للكيلوغرام (السعر الحالي: ${booking?.pricePerKg} $/kg).`
                : `Proposez un nouveau tarif par kilogramme (Offre actuelle : ${booking?.pricePerKg} $/kg).`}
            </Text>

            <View style={[styles.modalInputRow, darkMode && styles.modalInputRowDark]}>
              <TextInput
                style={[styles.modalInput, darkMode && styles.modalInputDark]}
                keyboardType="numeric"
                placeholder={booking?.pricePerKg ? String(booking.pricePerKg) : "25"}
                placeholderTextColor="#94A3B8"
                value={counterPriceInput}
                onChangeText={setCounterPriceInput}
                autoFocus={true}
              />
              <Text style={styles.modalInputSuffix}>$/kg</Text>
            </View>

            {counterPriceInput && !isNaN(parseFloat(counterPriceInput)) && (
              <View style={styles.modalCalcBox}>
                <Text style={styles.modalCalcText}>
                  {language === "ar" ? "المجموع الجديد المقدر:" : "Nouveau total estimé :"}
                  {" "}
                  <Text style={{ fontWeight: "800", color: "#059669" }}>
                    {(parseFloat(counterPriceInput) * (booking?.weightKg || 1)).toFixed(1)} $
                  </Text>
                  {" "}
                  ({booking?.weightKg || 1} kg)
                </Text>
              </View>
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCounterModalVisible(false)}
                disabled={submittingAction}
              >
                <Text style={styles.modalCancelBtnText}>
                  {language === "ar" ? "إلغاء" : "Annuler"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: primaryColor }]}
                onPress={handleSendCounterOffer}
                disabled={submittingAction}
              >
                {submittingAction ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Send size={15} color="#FFFFFF" />
                    <Text style={styles.modalSubmitBtnText}>
                      {language === "ar" ? "إرسال الاقتراح" : "Envoyer"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── TUNISIA DELIVERY CHECKOUT MODAL ── */}
      {checkoutModalVisible && (
        <BottomSheetModal
          visible={checkoutModalVisible}
          onClose={() => setCheckoutModalVisible(false)}
          fullHeight={true}
          contentStyle={{ paddingHorizontal: 0, paddingBottom: 0, flex: 1 }}
        >
          {/* Fixed Header */}
          <View style={[styles.modalHeader, { paddingHorizontal: 20, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
            <Text style={[styles.modalTitle, { fontSize: 16, fontWeight: "800", color: darkMode ? "#FFFFFF" : "#0F172A" }]}>
              {language === "ar" ? "تفاصيل التوصيل في تونس والضمان" : "Livraison Tunisie & Escrow"}
            </Text>
            <TouchableOpacity
              onPress={() => setCheckoutModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={darkMode ? "#FFFFFF" : "#1F2937"} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Price recap pill */}
            <View style={{ backgroundColor: "#EFF6FF", padding: 12, borderRadius: 12, marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 12, color: "#1E40AF", fontWeight: "600" }}>
                  {language === "ar" ? "السعر المتفق عليه (المفاوضة):" : "Tarif convenu :"}
                </Text>
                <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {booking.weightKg} kg × {booking.pricePerKg} $/kg
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563EB" }}>
                {booking.totalPrice} $
              </Text>
            </View>

            <TunisiaDeliverySection
              deliveryMethod={bookingDeliveryMethod}
              setDeliveryMethod={(m) => {
                setBookingDeliveryMethod(m);
                updateCachedDeliveryField("deliveryMethod", m);
                setBookingDeliveryErrors((prev) => ({ ...prev, deliveryMethod: undefined }));
              }}
              contactName={bookingContactName}
              setContactName={(v) => {
                setBookingContactName(v);
                updateCachedDeliveryField("deliveryContactName", v);
                setBookingDeliveryErrors((prev) => ({ ...prev, deliveryContactName: undefined }));
              }}
              contactPhone={bookingContactPhone}
              setContactPhone={(v) => {
                setBookingContactPhone(v);
                updateCachedDeliveryField("deliveryContactPhone", v);
                setBookingDeliveryErrors((prev) => ({ ...prev, deliveryContactPhone: undefined }));
              }}
              deliveryFee={bookingDeliveryFee}
              setDeliveryFee={(v) => {
                setBookingDeliveryFee(v);
                updateCachedDeliveryField("deliveryFee", v ? parseFloat(v) : null);
                setBookingDeliveryErrors((prev) => ({ ...prev, deliveryFee: undefined }));
              }}
              paymentMethod={bookingPaymentMethod}
              setPaymentMethod={(m) => {
                setBookingPaymentMethod(m);
                updateCachedDeliveryField("deliveryPaymentMethod", m);
              }}
              deliveryAddress={bookingDeliveryAddress}
              setDeliveryAddress={(v) => {
                setBookingDeliveryAddress(v);
                updateCachedDeliveryField("deliveryAddress", v);
                setBookingDeliveryErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
              }}
              errors={bookingDeliveryErrors}
              clearError={(field) =>
                setBookingDeliveryErrors((prev) => ({ ...prev, [field]: undefined }))
              }
            />

            <TouchableOpacity
              style={[
                styles.acceptDemandBtn,
                { backgroundColor: "#2563EB", marginTop: 16, paddingVertical: 14, borderRadius: 14 },
                checkoutLoading && { opacity: 0.6 },
              ]}
              onPress={() => handleFinalizeAndPay()}
              disabled={checkoutLoading}
              activeOpacity={0.85}
            >
              {checkoutLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Lock size={18} color="#FFFFFF" />
                  <Text style={[styles.acceptDemandBtnText, { fontSize: 14, fontWeight: "800" }]}>
                    {language === "ar"
                      ? `الدفع الآمن عبر PayPal Escrow (${booking.totalPrice} $)`
                      : `Payer avec PayPal Escrow (${booking.totalPrice} $)`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </BottomSheetModal>
      )}
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

  // ── ROUTE CORRIDOR & TIMELINE (Exact match to My Bookings / BookingItemCard) ──
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
  metaGridItemDark: {
    backgroundColor: "#0B1120",
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
  negotiationOriginBanner: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  negotiationOriginBannerDark: {
    backgroundColor: "#0B1120",
    borderColor: "#1E293B",
  },
  negotiationOriginText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },
  negotiationOriginStrike: {
    fontSize: 11.5,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  priceBreakdownBox: {
    marginTop: 6,
    gap: 8,
  },
  priceRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  priceLabelCol: {
    flex: 1,
    marginRight: 10,
  },
  priceRowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  priceRowSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  priceBadgeNeutral: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  priceBadgeNeutralDark: {
    backgroundColor: "#1E293B",
  },
  priceBadgeNeutralText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#475569",
  },
  negotiatedTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  negotiatedTagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#B45309",
    textTransform: "uppercase",
  },
  priceValHighlight: {
    fontSize: 14.5,
    fontWeight: "800",
    flexShrink: 0,
  },
  priceValSecondary: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    flexShrink: 0,
  },
  totalHighlightCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  totalHighlightCardDark: {
    backgroundColor: "#0B1120",
    borderColor: "#1E293B",
  },
  totalCardLabel: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalFormulaText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  totalCardAmount: {
    fontSize: 18,
    fontWeight: "900",
    flexShrink: 0,
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
    height: 52,
    marginBottom: 12,
  },
  modalInputRowDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  modalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalInputDark: {
    color: "#FFFFFF",
  },
  modalInputSuffix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  modalCalcBox: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalCalcText: {
    fontSize: 12,
    color: "#065F46",
    textAlign: "center",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  modalSubmitBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── NEGOTIATION TIMELINE STYLES ──
  cardHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  negotiationTimeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  timelineLine: {
    position: "absolute",
    left: 11,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: "#E2E8F0",
    zIndex: 1,
  },
  timelineLineDark: {
    backgroundColor: "#334155",
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    zIndex: 2,
  },
  timelineDotAccepted: {
    backgroundColor: "#059669",
  },
  timelineDotRejected: {
    backgroundColor: "#DC2626",
  },
  timelineDotPending: {
    backgroundColor: "#D97706",
  },
  timelineBubble: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timelineBubbleDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  timelineBubbleActive: {
    borderColor: "#93C5FD",
    backgroundColor: "#F0F9FF",
  },
  timelineBubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  timelineAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  timelineSenderName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    flexShrink: 1,
  },
  timelineTimeText: {
    fontSize: 10.5,
    color: "#94A3B8",
    flexShrink: 0,
    textAlign: "right",
  },
  timelinePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelinePriceLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  timelinePriceVal: {
    fontSize: 15,
    fontWeight: "800",
  },
  timelineTotalText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  timelineStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipAccepted: {
    backgroundColor: "#ECFDF5",
  },
  chipRejected: {
    backgroundColor: "#FEF2F2",
  },
  chipPending: {
    backgroundColor: "#FFFBEB",
  },
  timelineStatusText: {
    fontSize: 11,
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
});
