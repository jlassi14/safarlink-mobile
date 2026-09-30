import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { Send, Plane, Package } from "lucide-react-native";
import LocationPickerModal from "@/components/LocationPickerModal";
import CurrencyPickerModal from "@/components/CurrencyPickerModal";
import CreatePostConfirmModal from "@/components/CreatePostConfirmModal";
import CreateModeBanner from "@/components/create/CreateModeBanner";
import CreateRouteCard from "@/components/create/CreateRouteCard";
import CreateOfferForm from "@/components/create/CreateOfferForm";
import CreateRequestForm from "@/components/create/CreateRequestForm";
import TunisiaDeliverySection from "@/components/create/TunisiaDeliverySection";
import AlertBanner from "@/components/AlertBanner";
import { createStyles as s } from "@/components/create/createStyles";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { CURRENCIES_LIST, CurrencyOption } from "@/lib/constants";
import {
  offerApi,
  demandApi,
  TunisiaDeliveryMethod,
  TunisiaPaymentMethod,
  CreateOfferPayload,
  CreateDemandPayload,
} from "@/lib/api";

type PostType = "offer" | "request";

const isTunisiaLocation = (loc: string): boolean => {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return (
    l.includes("tunisia") ||
    l.includes("tunisie") ||
    l.includes("tunis") ||
    l.includes("monastir") ||
    l.includes("sfax") ||
    l.includes("djerba") ||
    l.includes("تونس") ||
    l.includes("المنستير") ||
    l.includes("صفاقس") ||
    l.includes("جربة") ||
    l.includes("🇹🇳")
  );
};

export default function CreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { language, darkMode, user } = useAppStore();

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;
  const primaryColor = colors.primary || "#2563EB";

  const scrollRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [postType, setPostType] = useState<PostType>("offer");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depDate, setDepDate] = useState<Date | null>(null);
  const [depTime, setDepTime] = useState("14:30");
  const [arrDate, setArrDate] = useState<Date | null>(null);
  const [arrTime, setArrTime] = useState("18:45");
  const [offerKg, setOfferKg] = useState("");
  const [priceKg, setPriceKg] = useState("");
  const offerCurrency = "USD";

  const [reqDate, setReqDate] = useState<Date | null>(null);
  const [pkgKg, setPkgKg] = useState("");
  const [reward, setReward] = useState("");
  const [requestCurrency, setRequestCurrency] = useState<string>("USD");
  const [desc, setDesc] = useState("");

  // Tunisia Domestic Delivery State
  const [deliveryMethod, setDeliveryMethod] = useState<TunisiaDeliveryMethod | null>(null);
  const [deliveryContactName, setDeliveryContactName] = useState("");
  const [deliveryContactPhone, setDeliveryContactPhone] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState<TunisiaPaymentMethod>("CASH");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"from" | "to" | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [err, setErr] = useState<Record<string, string | undefined>>({});

  const isTunisia = isTunisiaLocation(from) || isTunisiaLocation(to);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (params.type === "request" || params.mode === "request") {
      setPostType("request");
    } else if (params.type === "offer" || params.mode === "offer") {
      setPostType("offer");
    }
  }, [params.type, params.mode, params.t]);

  const resetForm = useCallback(() => {
    setFrom("");
    setTo("");
    setDepDate(null);
    setDepTime("14:30");
    setArrDate(null);
    setArrTime("18:45");
    setOfferKg("");
    setPriceKg("");
    setReqDate(null);
    setPkgKg("");
    setReward("");
    setRequestCurrency("USD");
    setDesc("");
    setDeliveryMethod(null);
    setDeliveryContactName("");
    setDeliveryContactPhone("");
    setDeliveryFee("");
    setDeliveryPaymentMethod("CASH");
    setDeliveryAddress("");
    setErr({});
    setPickerMode(null);
    setCurrencyModalVisible(false);
    setConfirmVisible(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      if (params.type === "request" || params.mode === "request") {
        setPostType("request");
      } else if (params.type === "offer" || params.mode === "offer") {
        setPostType("offer");
      }
    }, [resetForm, params.type, params.mode, params.t])
  );

  const swapRoute = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
    setErr((prev) => ({ ...prev, from: undefined, to: undefined }));
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 320);
  };

  const clearError = (field: string) => {
    setErr((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: Record<string, string | undefined> = {};
    if (!from.trim()) e.from = t("departureRequiredError", language);
    if (!to.trim()) e.to = t("arrivalRequiredError", language);
    else if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      e.to = t("originDestSameError", language);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (postType === "offer") {
      if (!depDate) e.date = t("selectFlightDateError", language);
      else if (depDate < today) e.date = t("futureFlightDateError", language);
      if (!arrDate) e.arrDate = t("selectFlightDateError", language);
      else if (depDate && arrDate < depDate) e.arrDate = t("futureFlightDateError", language);
      if (!offerKg.trim() || parseFloat(offerKg) <= 0) e.weight = t("validWeightError", language);
      if (!priceKg.trim() || parseFloat(priceKg) <= 0) e.price = t("validPriceError", language);
    } else {
      if (!reqDate) e.date = t("selectFlightDateError", language);
      else if (reqDate < today) e.date = t("futureFlightDateError", language);
      if (!pkgKg.trim() || parseFloat(pkgKg) <= 0) e.weight = t("validWeightError", language);
      if (!reward.trim() || parseFloat(reward) <= 0) e.price = t("validPriceError", language);
    }

    // Tunisia Local Delivery validation (ONLY for parcel senders/requests, NOT for traveler offers)
    if (!isOffer && isTunisia) {
      if (!deliveryMethod) {
        e.deliveryMethod = t("deliveryMethodRequired", language);
      } else if (deliveryMethod === "FAMILY") {
        if (!deliveryContactName.trim()) {
          e.deliveryContactName = t("deliveryContactNameRequired", language);
        }
        if (!deliveryContactPhone.trim()) {
          e.deliveryContactPhone = t("deliveryContactPhoneRequired", language);
        }
      } else if (deliveryMethod === "COURIER") {
        if (!deliveryFee.trim() || parseFloat(deliveryFee) <= 0) {
          e.deliveryFee = t("deliveryFeeRequired", language);
        }
      } else if (deliveryMethod === "I_FAST_PRO") {
        if (!deliveryAddress.trim()) {
          e.deliveryAddress = t("deliveryAddressRequired", language);
        }
      }
    }

    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handlePublishPress = () => {
    Keyboard.dismiss();
    if (validate()) {
      setConfirmVisible(true);
    } else {
      Alert.alert(
        language === "ar" ? "تنبيه" : language === "fr" ? "Champs obligatoires" : "Required fields",
        language === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة بشكل صحيح (المسار، التاريخ، الوزن، والمكافأة)."
          : language === "fr"
          ? "Veuillez remplir correctement tous les champs obligatoires (trajet, date, poids et récompense)."
          : "Please fill in all required fields correctly (route, date, weight, and reward)."
      );
    }
  };

  const submit = async () => {
    setBusy(true);
    setServerError(null);

    try {
      if (postType === "offer") {
        const payload: CreateOfferPayload = {
          from: from.trim(),
          to: to.trim(),
          departureDate: depDate ? depDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          departureTime: depTime,
          destinationDate: (arrDate || depDate) ? (arrDate || depDate)!.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          destinationTime: arrTime,
          totalKg: parseFloat(offerKg),
          pricePerKg: parseFloat(priceKg),
          currency: offerCurrency,
          description: desc || undefined,
        };

        const res = await offerApi.createOffer(payload);

        if (res.data?.success) {
          setConfirmVisible(false);
          resetForm();
          router.push("/(app)/(tabs)/offers");
        } else {
          setServerError(res.data?.error || "Failed to publish offer");
          setConfirmVisible(false);
        }
      } else {
        const payload: CreateDemandPayload = {
          from: from.trim(),
          to: to.trim(),
          targetDate: reqDate ? reqDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          weightKg: parseFloat(pkgKg),
          reward: parseFloat(reward),
          currency: requestCurrency,
          description: desc ? desc.trim() : undefined,
          deliveryMethod: isTunisia ? deliveryMethod : null,
          deliveryContactName: isTunisia && deliveryMethod === "FAMILY" ? deliveryContactName.trim() : null,
          deliveryContactPhone: isTunisia && deliveryMethod === "FAMILY" ? deliveryContactPhone.trim() : null,
          deliveryFee: isTunisia && deliveryMethod === "COURIER" && deliveryFee ? parseFloat(deliveryFee) : null,
          deliveryPaymentMethod: isTunisia && (deliveryMethod === "COURIER" || deliveryMethod === "I_FAST_PRO") ? deliveryPaymentMethod : null,
          deliveryAddress:
            isTunisia && (deliveryMethod === "I_FAST_PRO" || deliveryMethod === "COURIER")
              ? deliveryAddress.trim() || null
              : null,
        };

        const res = await demandApi.createDemand(payload);

        if (res.data?.success) {
          setConfirmVisible(false);
          resetForm();
          router.push("/(app)/(tabs)/requests");
        } else {
          setServerError(res.data?.error || "Failed to publish request");
          setConfirmVisible(false);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error while publishing";
      setServerError(msg);
      setConfirmVisible(false);
    } finally {
      setBusy(false);
    }
  };

  const getDeliveryMethodSummary = () => {
    if (isOffer || !isTunisia || !deliveryMethod) return undefined;
    if (deliveryMethod === "FAMILY") {
      const contactInfo = [deliveryContactName, deliveryContactPhone].filter(Boolean).join(" • 📞 ");
      return `${t("deliveryMethodFamily", language)}${contactInfo ? ` (${contactInfo})` : ""}`;
    }
    if (deliveryMethod === "COURIER") {
      const payLabel = deliveryPaymentMethod === "CASH" ? t("payCash", language) : t("payClicToPay", language);
      return `${t("deliveryMethodCourier", language)} - ${deliveryFee || "0"} TND (${payLabel})`;
    }
    if (deliveryMethod === "I_FAST_PRO") {
      const payLabel = deliveryPaymentMethod === "CASH" ? t("payCash", language) : t("payClicToPay", language);
      return `i Fast Pro (${payLabel})`;
    }
    return undefined;
  };

  const isOffer = postType === "offer";
  const activeCurrency = requestCurrency;

  return (
    <SafeAreaView style={[s.safe, darkMode && s.safeDk]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── HEADER & SEGMENTED SWITCHER ── */}
      <View style={[s.head, darkMode && s.headDk, { paddingTop: topPadding }]}>
        <View style={s.headTopRow}>
          <Text style={[s.headTitle, darkMode && s.tW]}>
            {isOffer ? t("createOfferTitle", language) : t("createRequestTitle", language)}
          </Text>
          <Text style={s.headSub}>
            {isOffer ? t("createOfferSubtitle", language) : t("createRequestSubtitle", language)}
          </Text>
        </View>

        <View style={[s.seg, darkMode && s.segDk]}>
          <TouchableOpacity
            style={[s.segTab, isOffer && s.segTabActive, isOffer && darkMode && s.segTabActiveDk]}
            onPress={() => { setPostType("offer"); setErr({}); Keyboard.dismiss(); }}
            activeOpacity={0.85}
          >
            <View style={[s.segIcon, isOffer ? s.segIconActive : s.segIconInactive]}>
              <Plane size={15} color={isOffer ? primaryColor : "#9CA3AF"} />
            </View>
            <Text style={[s.segLabel, isOffer ? { color: primaryColor, fontWeight: "800" } : darkMode ? s.tMutedDk : s.tMuted]} numberOfLines={1}>
              {t("postTypeOffer", language).split("(")[0].trim()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.segTab, !isOffer && s.segTabActive, !isOffer && darkMode && s.segTabActiveDk]}
            onPress={() => { setPostType("request"); setErr({}); Keyboard.dismiss(); }}
            activeOpacity={0.85}
          >
            <View style={[s.segIcon, !isOffer ? s.segIconActive : s.segIconInactive]}>
              <Package size={15} color={!isOffer ? primaryColor : "#9CA3AF"} />
            </View>
            <Text style={[s.segLabel, !isOffer ? { color: primaryColor, fontWeight: "800" } : darkMode ? s.tMutedDk : s.tMuted]} numberOfLines={1}>
              {t("postTypeRequest", language).split("(")[0].trim()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SCROLLABLE FORM BODY ── */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.flex1} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: isKeyboardVisible ? keyboardHeight + 40 : Math.max(insets.bottom, 16) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {serverError && (
            <AlertBanner
              message={serverError}
              type="error"
              onDismiss={() => setServerError(null)}
              autoDismiss={false}
            />
          )}

          {/* Mode Clarity Banner */}
          <CreateModeBanner isOffer={isOffer} />

          {/* Route Card */}
          <CreateRouteCard
            from={from}
            to={to}
            onOpenFrom={() => setPickerMode("from")}
            onOpenTo={() => setPickerMode("to")}
            onSwap={swapRoute}
            errorFrom={err.from}
            errorTo={err.to}
          />

          {/* Dynamic Offer / Request Form */}
          {isOffer ? (
            <CreateOfferForm
              depDate={depDate} setDepDate={setDepDate}
              depTime={depTime} setDepTime={setDepTime}
              arrDate={arrDate} setArrDate={setArrDate}
              arrTime={arrTime} setArrTime={setArrTime}
              offerKg={offerKg} setOfferKg={setOfferKg}
              priceKg={priceKg} setPriceKg={setPriceKg}
              currency="USD"
              onFocusInput={scrollToBottom}
              errors={err} clearError={clearError}
            />
          ) : (
            <CreateRequestForm
              reqDate={reqDate} setReqDate={setReqDate}
              pkgKg={pkgKg} setPkgKg={setPkgKg}
              reward={reward} setReward={setReward}
              currency={requestCurrency}
              desc={desc} setDesc={setDesc}
              onOpenCurrencyModal={() => setCurrencyModalVisible(true)}
              onFocusInput={scrollToBottom}
              errors={err} clearError={clearError}
            />
          )}

          {/* Tunisia Domestic Delivery Section - Renders ONLY for parcel senders when from/to is in Tunisia */}
          {!isOffer && isTunisia && (
            <TunisiaDeliverySection
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              contactName={deliveryContactName}
              setContactName={setDeliveryContactName}
              contactPhone={deliveryContactPhone}
              setContactPhone={setDeliveryContactPhone}
              deliveryFee={deliveryFee}
              setDeliveryFee={setDeliveryFee}
              paymentMethod={deliveryPaymentMethod}
              setPaymentMethod={setDeliveryPaymentMethod}
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              errors={err}
              clearError={clearError}
              onFocusInput={scrollToBottom}
            />
          )}

          {/* Publish Action Button */}
          <TouchableOpacity
            style={[s.publishBtn, busy && { opacity: 0.6 }]}
            onPress={handlePublishPress}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Send size={17} color="#FFFFFF" />
                <Text style={s.publishText}>
                  {isOffer ? t("publishOfferButton", language) : t("publishRequestButton", language)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={pickerMode !== null}
        mode={pickerMode}
        selectedLocation={pickerMode === "from" ? from : to}
        excludedLocation={pickerMode === "from" ? to : from}
        onSelect={(loc) => {
          if (pickerMode === "from") { setFrom(loc); clearError("from"); }
          else { setTo(loc); clearError("to"); }
        }}
        onClose={() => setPickerMode(null)}
      />

      {/* Dynamic Currency Picker Modal (For parcel requests only) */}
      <CurrencyPickerModal
        visible={currencyModalVisible}
        selectedCurrency={requestCurrency}
        onSelectCurrency={(cur) => {
          setRequestCurrency(cur.code);
        }}
        onClose={() => setCurrencyModalVisible(false)}
      />

      {/* Confirmation Modal */}
      <CreatePostConfirmModal
        visible={confirmVisible}
        postType={postType}
        fromLocation={from}
        toLocation={to}
        dateText={
          isOffer
            ? `${depDate?.toLocaleDateString("en-US", { day: "numeric", month: "short" })} (${depTime})`
            : (reqDate?.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) || "Flexible")
        }
        weightText={isOffer ? `${offerKg} kg` : `${pkgKg} kg`}
        priceOrRewardText={isOffer ? `$ ${priceKg} / kg` : `${requestCurrency} ${reward}`}
        descriptionText={!isOffer ? desc : undefined}
        deliveryMethodText={getDeliveryMethodSummary()}
        loading={busy}
        onConfirm={submit}
        onClose={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
