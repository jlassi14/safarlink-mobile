import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Animated,
  Easing,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { offerApi, bookingApi, demandApi, proposalApi } from "@/lib/api";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();
import {
  MapPin,
  Clock,
  Star,
  Search,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Plane,
  Package,
  Calendar,
  ChevronDown,
  ArrowLeftRight,
  CheckCircle2,
  Send,
  X,
  Compass,
  Sparkles,
  MessageSquare,
  Settings,
} from "lucide-react-native";
import BottomSheetModal from "@/components/BottomSheetModal";
import DatePickerInput from "@/components/DatePickerInput";
import TimePickerInput from "@/components/TimePickerInput";
import LocationPickerModal from "@/components/LocationPickerModal";
import DemandCard from "@/components/DemandCard";
import AdsCarousel from "@/components/AdsCarousel";
import CompactAdCard from "@/components/CompactAdCard";
import BottomMiniAdsSection from "@/components/BottomMiniAdsSection";
import TunisiaDeliverySection from "@/components/create/TunisiaDeliverySection";
import {
  REAL_MOCK_OFFERS,
  MOCK_BASE_OFFERS,
  MOCK_BASE_DEMANDS,
  MOCK_MY_REQUESTS,
  MOCK_DEFAULT_AVATAR,
  POPULAR_LOCATIONS,
  LocationOption,
  HomeOfferItem,
  HomeDemandItem,
} from "@/lib/constants";
import { colors } from "@/lib/theme";
import { TunisiaDeliveryMethod, TunisiaPaymentMethod } from "@/lib/api";

const isTunisiaLocation = (loc?: string | null): boolean => {
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

type PostTypeTab = "offer" | "demand";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user, darkMode } = useAppStore();

  const primaryColor = colors.primary || "#2563EB";

  // ── FILTER STATES ──
  const [postType, setPostType] = useState<PostTypeTab>("offer");
  const [selectedDepart, setSelectedDepart] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackWidth, setTrackWidth] = useState(0);

  // ── DYNAMIC SMOOTH ANIMATIONS ──
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glideAnim = useRef(new Animated.Value(0)).current;
  const planeFacing = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle breathing pulse for the smart filter badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Smooth bidirectional flight: Left to Right -> Turn 180° -> Right to Left -> Turn 180°
    Animated.loop(
      Animated.sequence([
        // 1. Fly smoothly from Left (0) to Right (1)
        Animated.timing(glideAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        // 2. Pause at destination and turn around smoothly
        Animated.delay(100),
        Animated.timing(planeFacing, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(100),

        // 3. Fly smoothly from Right (1) to Left (0)
        Animated.timing(glideAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        // 4. Pause at origin and turn around smoothly
        Animated.delay(100),
        Animated.timing(planeFacing, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(100),
      ])
    ).start();

    // Clignote (blinking beacon) animation for origin & destination route dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Modals for Selection
  const [locationPickerType, setLocationPickerType] = useState<"depart" | "destination" | null>(null);

  // Booking Modal State (Offers)
  const [selectedOfferForBooking, setSelectedOfferForBooking] = useState<any | null>(null);
  const [bookingWeight, setBookingWeight] = useState("2.5");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedOfferIds, setBookedOfferIds] = useState<string[]>([]);
  const [bookingDeliveryMethod, setBookingDeliveryMethod] = useState<TunisiaDeliveryMethod | null>(null);
  const [bookingContactName, setBookingContactName] = useState("");
  const [bookingContactPhone, setBookingContactPhone] = useState("");
  const [bookingDeliveryFee, setBookingDeliveryFee] = useState("");
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<TunisiaPaymentMethod>("CASH");
  const [bookingDeliveryAddress, setBookingDeliveryAddress] = useState("");
  const [bookingDeliveryErrors, setBookingDeliveryErrors] = useState<Record<string, string | undefined>>({});

  // Proposal Modal State (Demands & Flight Schedule)
  const [selectedDemandForProposal, setSelectedDemandForProposal] = useState<HomeDemandItem | null>(null);
  const [proposalNotes, setProposalNotes] = useState("");
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposedDemandIds, setProposedDemandIds] = useState<string[]>([]);
  const [proposalDepDate, setProposalDepDate] = useState<Date | null>(new Date());
  const [proposalDepTime, setProposalDepTime] = useState("14:30");
  const [proposalArrDate, setProposalArrDate] = useState<Date | null>(new Date());
  const [proposalArrTime, setProposalArrTime] = useState("18:45");

  // ALL 4 filter criteria must be chosen to fetch and display posts
  const isFilterComplete = Boolean(
    selectedDepart.trim() &&
    selectedDestination.trim() &&
    dateFrom &&
    dateTo
  );

  const activeFiltersCount =
    (selectedDepart ? 1 : 0) +
    (selectedDestination ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleSwapRoute = () => {
    const temp = selectedDepart;
    setSelectedDepart(selectedDestination);
    setSelectedDestination(temp);
  };

  const handleResetFilters = () => {
    setSelectedDepart("");
    setSelectedDestination("");
    setDateFrom(null);
    setDateTo(null);
    setSearchQuery("");
  };

  // ── LIVE OFFERS & DEMANDS STATE & FETCHING ──
  const [liveOffers, setLiveOffers] = useState<HomeOfferItem[]>([]);
  const [liveDemands, setLiveDemands] = useState<HomeDemandItem[]>([]);

  const fetchLiveData = useCallback(async () => {
    try {
      const [offersRes, demandsRes] = await Promise.allSettled([
        offerApi.getOffers({
          from: selectedDepart || undefined,
          to: selectedDestination || undefined,
        }),
        demandApi.getDemands({
          from: selectedDepart || undefined,
          to: selectedDestination || undefined,
        }),
      ]);

      if (offersRes.status === "fulfilled" && offersRes.value.data?.success && Array.isArray(offersRes.value.data?.data?.offers)) {
        const mapped: HomeOfferItem[] = offersRes.value.data.data.offers.map((o: any) => ({
          id: o.id,
          userId: o.userId,
          user: o.user?.name || "Traveler",
          from: o.from,
          to: o.to,
          departureDate: o.departureDate,
          departureTime: o.departureTime,
          destinationDate: o.destinationDate,
          destinationTime: o.destinationTime,
          weight: `${Number(o.remainingKg ?? o.totalKg).toFixed(1)} kg available`,
          reward: `${o.currency || "QAR"} ${o.pricePerKg} / kg`,
          date: o.departureDate,
          rating: o.user?.rating || 5.0,
          avatar: o.user?.avatar || MOCK_DEFAULT_AVATAR,
        }));
        setLiveOffers(mapped);
      }

      if (demandsRes.status === "fulfilled" && demandsRes.value.data?.success && Array.isArray(demandsRes.value.data?.data?.demands)) {
        const mappedD: HomeDemandItem[] = demandsRes.value.data.data.demands.map((d: any) => ({
          id: d.id,
          senderName: d.user?.name || "Sender",
          senderAvatar: d.user?.avatar || MOCK_DEFAULT_AVATAR,
          from: d.from,
          to: d.to,
          date: d.targetDate ? new Date(d.targetDate).toLocaleDateString() : "Flexible",
          weight: `${d.weightKg} kg`,
          weightKg: d.weightKg,
          reward: `${d.currency || "QAR"} ${d.reward}`,
          rating: d.user?.rating || 5.0,
          status: d.status || "pending",
        }));
        setLiveDemands(mappedD);
      }
    } catch (e) {
      console.error("Error loading home live data:", e);
    }
  }, [selectedDepart, selectedDestination]);

  useFocusEffect(
    useCallback(() => {
      fetchLiveData();
    }, [fetchLiveData])
  );

  // Base list of offers
  const allOffersList: HomeOfferItem[] = useMemo(() => {
    return liveOffers;
  }, [liveOffers]);

  // Base list of demands
  const allDemandsList: HomeDemandItem[] = useMemo(() => {
    return liveDemands;
  }, [liveDemands]);

  // Clean Number Input Helper
  const cleanNumberInput = (txt: string) => {
    const filtered = txt.replace(/[^0-9.]/g, "");
    const parts = filtered.split(".");
    return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : filtered;
  };

  const getOfferPriceDetails = (offer: any) => {
    if (!offer) return { currency: "QR", rate: 35 };
    const str = offer.reward || offer.pricePerKg || "QR 35";
    const currencyMatch = str.match(/^([A-Za-z€$]+)/);
    const currency = currencyMatch ? currencyMatch[1] : "QR";
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    const rate = numMatch ? parseFloat(numMatch[1]) : 35;
    return { currency, rate };
  };

  const getAvailableCapacityKg = (offer: any) => {
    if (!offer) return 5.0;
    const str = offer.weight || offer.capacity || "5.0";
    const numMatch = str.match(/(\d+(?:\.\d+)?)/);
    return numMatch ? parseFloat(numMatch[1]) : 5.0;
  };

  // Helper for multi-lingual robust location matching (Arabic, French, English)
  const matchLocation = (query: string, itemLoc: string): boolean => {
    if (!query.trim()) return true;
    if (!itemLoc) return false;
    const q = query.toLowerCase().trim();
    const target = itemLoc.toLowerCase().trim();

    if (target.includes(q) || q.includes(target)) return true;

    const locObj = POPULAR_LOCATIONS.find((loc: LocationOption) => {
      return (
        loc.formatted.toLowerCase().includes(q) ||
        q.includes(loc.formatted.toLowerCase()) ||
        loc.formattedAr.includes(query) ||
        query.includes(loc.formattedAr) ||
        loc.country.toLowerCase().includes(q) ||
        loc.countryAr.includes(query) ||
        loc.city.toLowerCase().includes(q) ||
        loc.cityAr.includes(query)
      );
    });

    if (locObj) {
      const aliases = [
        locObj.country.toLowerCase(),
        locObj.countryAr,
        locObj.city.toLowerCase(),
        locObj.cityAr,
        locObj.formatted.toLowerCase(),
        locObj.formattedAr,
      ];
      return aliases.some((alias) => target.includes(alias) || itemLoc.includes(alias));
    }
    return false;
  };

  // ── FILTERED OFFERS (Real Live Backend Offers) ──
  const filteredOffers = useMemo(() => {
    let list = allOffersList;
    if (selectedDepart.trim()) {
      list = list.filter((o) => matchLocation(selectedDepart, o.from));
    }
    if (selectedDestination.trim()) {
      list = list.filter((o) => matchLocation(selectedDestination, o.to));
    }
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.from.toLowerCase().includes(sq) ||
          o.to.toLowerCase().includes(sq) ||
          o.user.toLowerCase().includes(sq)
      );
    }
    return list;
  }, [selectedDepart, selectedDestination, searchQuery, allOffersList]);

  // ── FILTERED DEMANDS (Real Live Backend Demands) ──
  const filteredDemands = useMemo(() => {
    let list = allDemandsList;
    if (selectedDepart.trim()) {
      list = list.filter((d) => matchLocation(selectedDepart, d.from));
    }
    if (selectedDestination.trim()) {
      list = list.filter((d) => matchLocation(selectedDestination, d.to));
    }
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.from.toLowerCase().includes(sq) ||
          d.to.toLowerCase().includes(sq) ||
          d.senderName.toLowerCase().includes(sq)
      );
    }
    return list;
  }, [selectedDepart, selectedDestination, searchQuery, allDemandsList]);

  const isOfferTab = postType === "offer";
  const displayedCount = isOfferTab ? filteredOffers.length : filteredDemands.length;

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── TOP APP HEADER ── */}
      <View style={[styles.topHeader, darkMode && styles.topHeaderDark]}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandTitle}>
            Safar<Text style={{ color: primaryColor }}>Link</Text>
          </Text>
          <Text style={[styles.brandSubtitle, darkMode && styles.textMutedDark]}>
            {user ? `${user.name}` : t("searchPromptSubtitle", language)}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.headerIconBtn, darkMode && styles.headerIconBtnDark]}
            onPress={() => router.push("/(app)/chat")}
            activeOpacity={0.8}
          >
            <MessageSquare size={18} color={primaryColor} />
            <View style={styles.headerChatBadgeDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconBtn, darkMode && styles.headerIconBtnDark]}
            onPress={() => router.push("/(app)/settings")}
            activeOpacity={0.8}
          >
            <Settings size={18} color={primaryColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerAvatarBtn, darkMode && styles.headerAvatarBtnDark]}
            onPress={() => router.push("/(app)/(tabs)/profile")}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
            ) : (
              <UserIcon size={18} color={primaryColor} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── ADS CAROUSEL ── */}
        <View style={styles.carouselSection}>
          <AdsCarousel />
        </View>

        {/* ── FILTER & SEARCH CARD (2-TAB: OFFERS vs DEMANDS) ── */}
        <View style={[styles.filterCard, darkMode && styles.filterCardDark]}>
          {/* Card Header & Dynamic Explanatory Banner */}
          <View style={styles.filterHeaderBox}>
            <View style={styles.filterHeaderTopRow}>
              <Animated.View
                style={[
                  styles.filterSmartBadge,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Sparkles size={11} color="#2563EB" />
                <Text style={styles.filterSmartBadgeText}>
                  {t("filterBadgeActive", language)}
                </Text>
              </Animated.View>

              {/* Step completion pill */}
              <View style={[styles.filterStepPill, darkMode && styles.filterStepPillDark]}>
                <Text style={[styles.filterStepPillText, darkMode && styles.textMutedDark]}>
                  {activeFiltersCount}/4 {language === "ar" ? "مكتمل" : "Ready"}
                </Text>
              </View>
            </View>

            <Text style={[styles.filterMainTitle, darkMode && styles.textWhite]}>
              {t("homeFilterHeaderTitle", language)}
            </Text>
            <Text style={[styles.filterMainSubtitle, darkMode && styles.textMutedDark]}>
              {t("homeFilterHeaderSubtitle", language)}
            </Text>

            {/* Dynamic Animated Flight Corridor Track */}
            <View
              style={styles.flightTrackContainer}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0 && Math.abs(w - trackWidth) > 1) {
                  setTrackWidth(w);
                }
              }}
            >
              <View style={styles.trackDotStart} />
              <View style={[styles.flightTrackLine, darkMode && styles.flightTrackLineDark]} />
              <View style={styles.trackDotEnd} />

              <Animated.View
                style={[
                  styles.flightTrackPlaneWrapper,
                  darkMode && styles.flightTrackPlaneWrapperDark,
                  {
                    transform: [
                      {
                        translateX: glideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, Math.max(0, (trackWidth || 300) - 24)],
                        }),
                      },
                      {
                        rotate: planeFacing.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["45deg", "225deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Plane size={12.5} color={primaryColor} />
              </Animated.View>
            </View>
          </View>

          {/* Segmented Switcher (Offers vs Demands ONLY) */}
          <View style={[styles.tabSegment, darkMode && styles.tabSegmentDark]}>
            <TouchableOpacity
              style={[styles.tabSegmentBtn, isOfferTab && styles.tabSegmentBtnActive]}
              onPress={() => setPostType("offer")}
              activeOpacity={0.8}
            >
              <Plane size={15} color={isOfferTab ? primaryColor : "#9CA3AF"} />
              <Text
                style={[
                  styles.tabSegmentText,
                  isOfferTab ? { color: primaryColor, fontWeight: "800" } : darkMode ? styles.textMutedDark : styles.textMuted,
                ]}
              >
                {t("tabOffers", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabSegmentBtn, !isOfferTab && styles.tabSegmentBtnActive]}
              onPress={() => setPostType("demand")}
              activeOpacity={0.8}
            >
              <Package size={15} color={!isOfferTab ? primaryColor : "#9CA3AF"} />
              <Text
                style={[
                  styles.tabSegmentText,
                  !isOfferTab ? { color: primaryColor, fontWeight: "800" } : darkMode ? styles.textMutedDark : styles.textMuted,
                ]}
              >
                {t("tabDemands", language)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Connected Route Selector Box */}
          <View style={styles.routeContainer}>
            {/* Origin Route Item */}
            <View
              style={[
                styles.routeCard,
                darkMode && styles.routeCardDark,
                !!selectedDepart && styles.routeCardActive,
              ]}
            >
              <TouchableOpacity
                style={styles.routeCardMainBtn}
                onPress={() => setLocationPickerType("depart")}
                activeOpacity={0.75}
              >
                <Animated.View
                  style={[
                    styles.routeDotOrigin,
                    {
                      opacity: blinkAnim,
                      transform: [
                        {
                          scale: blinkAnim.interpolate({
                            inputRange: [0.35, 1],
                            outputRange: [0.85, 1.3],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.routeRowText}>
                  <Text style={styles.routeLabel}>{t("filterDeparture", language)}</Text>
                  <Text
                    style={[
                      styles.routeValue,
                      darkMode && styles.textWhite,
                      !selectedDepart && styles.routePlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedDepart || t("allDepartures", language)}
                  </Text>
                </View>
              </TouchableOpacity>

              {selectedDepart ? (
                <TouchableOpacity
                  onPress={() => setSelectedDepart("")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.clearIconBtn}
                >
                  <X size={14} color="#9CA3AF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setLocationPickerType("depart")}
                  style={styles.clearIconBtn}
                >
                  <ChevronDown size={14} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Centered Swap Button */}
            <View style={styles.swapBtnWrapper}>
              <TouchableOpacity
                style={[styles.swapBtn, darkMode && styles.swapBtnDark]}
                onPress={handleSwapRoute}
                activeOpacity={0.75}
              >
                <ArrowLeftRight size={13} color={primaryColor} />
              </TouchableOpacity>
            </View>

            {/* Destination Route Item */}
            <View
              style={[
                styles.routeCard,
                darkMode && styles.routeCardDark,
                !!selectedDestination && styles.routeCardActive,
              ]}
            >
              <TouchableOpacity
                style={styles.routeCardMainBtn}
                onPress={() => setLocationPickerType("destination")}
                activeOpacity={0.75}
              >
                <Animated.View
                  style={[
                    styles.routeDotDestination,
                    {
                      opacity: blinkAnim,
                      transform: [
                        {
                          scale: blinkAnim.interpolate({
                            inputRange: [0.35, 1],
                            outputRange: [0.85, 1.3],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.routeRowText}>
                  <Text style={styles.routeLabel}>{t("filterDestination", language)}</Text>
                  <Text
                    style={[
                      styles.routeValue,
                      darkMode && styles.textWhite,
                      !selectedDestination && styles.routePlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedDestination || t("allDestinations", language)}
                  </Text>
                </View>
              </TouchableOpacity>

              {selectedDestination ? (
                <TouchableOpacity
                  onPress={() => setSelectedDestination("")}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.clearIconBtn}
                >
                  <X size={14} color="#9CA3AF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setLocationPickerType("destination")}
                  style={styles.clearIconBtn}
                >
                  <ChevronDown size={14} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Date Range Row */}
          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <DatePickerInput
                label={t("dateFrom", language)}
                placeholder="01/02/2026"
                value={dateFrom}
                language={language}
                mode="future"
                minDate={new Date()}
                onChange={(d) => {
                  setDateFrom(d);
                  if (dateTo && d && dateTo < d) {
                    setDateTo(d);
                  }
                }}
              />
            </View>

            <View style={styles.dateCol}>
              <DatePickerInput
                label={t("dateTo", language)}
                placeholder="15/02/2026"
                value={dateTo}
                language={language}
                mode="future"
                minDate={dateFrom || new Date()}
                disabled={!dateFrom}
                onChange={(d) => setDateTo(d)}
              />
            </View>
          </View>

          {/* Active Filters Reset Bar */}
          {activeFiltersCount > 0 && (
            <View style={styles.filterMetaRow}>
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={handleResetFilters}
                activeOpacity={0.75}
              >
                <RotateCcw size={12} color="#EF4444" />
                <Text style={styles.clearAllBtnText}>{t("clearAllFilters", language)}</Text>
              </TouchableOpacity>

              <View style={styles.resultsBadge}>
                <Text style={styles.resultsBadgeText}>
                  {isOfferTab
                    ? t("matchingOffersFound", language).replace("{count}", String(displayedCount))
                    : t("matchingDemandsFound", language).replace("{count}", String(displayedCount))}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── FEED CONTENT ── */}
        {!isFilterComplete ? (
          // ── STATE 1: ALL 4 FILTERS NOT SELECTED YET -> INFORM USER ──
          <View style={[styles.promptCard, darkMode && styles.promptCardDark]}>
            <View style={styles.promptIconCircle}>
              <Compass size={32} color={primaryColor} />
            </View>
            <Text style={[styles.promptTitle, darkMode && styles.textWhite]}>
              {t("searchPromptTitle", language)}
            </Text>
            <Text style={[styles.promptSubtitle, darkMode && styles.textMutedDark]}>
              {t("homeSearchPrompt", language)}
            </Text>
          </View>
        ) : displayedCount === 0 ? (
          // ── STATE 2: FILTER ACTIVE BUT ZERO MATCHES ──
          <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
            <View style={styles.emptyIconCircle}>
              <Search size={26} color="#9CA3AF" />
            </View>
            <Text style={[styles.emptyTitle, darkMode && styles.textWhite]}>
              {t("noMatchingPosts", language)}
            </Text>
            <Text style={[styles.emptySubtitle, darkMode && styles.textMutedDark]}>
              {t("tryAdjustingFilters", language)}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={handleResetFilters}
              activeOpacity={0.8}
            >
              <RotateCcw size={13} color="#FFFFFF" />
              <Text style={styles.emptyActionBtnText}>{t("clearAllFilters", language)}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── STATE 3: FILTER ACTIVE WITH MATCHES (WITH AD CARD AFTER 5 ITEMS) ──
          <>
            <View style={styles.feedHeaderRow}>
              <Text style={[styles.feedSectionTitle, darkMode && styles.textWhite]}>
                {isOfferTab ? t("allOffers", language) : t("tabDemands", language)}
              </Text>
              <Text style={[styles.feedCountLabel, darkMode && styles.textMutedDark]}>
                ({displayedCount})
              </Text>
            </View>

            {isOfferTab ? (
              // ── ORIGINAL OFFER CARDS WITH DEPARTURE & ARRIVAL DATES ──
              filteredOffers.map((item, index) => (
                <React.Fragment key={`off_${item.id}`}>
                  <View style={[styles.card, darkMode && styles.cardDark]}>
                    {/* User Profile Header */}
                    <View style={styles.cardUserRow}>
                      <Image source={{ uri: item.avatar || MOCK_DEFAULT_AVATAR }} style={styles.cardAvatar} />
                      <View style={styles.cardUserInfo}>
                        <View style={styles.cardUserNameRow}>
                          <Text style={[styles.cardUserName, darkMode && styles.textWhite]} numberOfLines={1}>
                            {item.user}
                          </Text>
                          <View style={styles.verifiedBadge}>
                            <ShieldCheck size={12} color="#10B981" />
                          </View>
                        </View>
                        <View style={styles.ratingRow}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                        </View>
                      </View>

                      {/* Price Badge */}
                      <View style={[styles.priceBadge, darkMode && styles.priceBadgeDark]}>
                        <Text style={styles.priceBadgeText}>{item.reward}</Text>
                      </View>
                    </View>

                    {/* Route Box with Departure Date and Arrival Date */}
                    <View style={[styles.cardRouteBox, darkMode && styles.cardRouteBoxDark]}>
                      {/* Departure Column */}
                      <View style={styles.cardRouteItem}>
                        <Text style={[styles.cardRouteCity, darkMode && styles.textWhite]} numberOfLines={1}>
                          {item.from}
                        </Text>
                        <View style={styles.cardDateRow}>
                          <Calendar size={10} color="#6B7280" />
                          <Text style={styles.cardDateText} numberOfLines={1}>
                            {item.departureDate || item.date}
                          </Text>
                        </View>
                        <View style={styles.cardTimeRow}>
                          <Clock size={10} color="#9CA3AF" />
                          <Text style={styles.cardTimeText}>{item.departureTime || "14:30"}</Text>
                        </View>
                      </View>

                      {/* Animated Mid Flight Line */}
                      <View style={styles.cardPlaneMid}>
                        <View style={styles.dashedLine} />
                        <View style={styles.planeCircle}>
                          <Plane size={13} color={primaryColor} />
                        </View>
                        <View style={styles.dashedLine} />
                      </View>

                      {/* Arrival / Destination Column */}
                      <View style={[styles.cardRouteItem, { alignItems: "flex-end" }]}>
                        <Text style={[styles.cardRouteCity, darkMode && styles.textWhite]} numberOfLines={1}>
                          {item.to}
                        </Text>
                        <View style={styles.cardDateRow}>
                          <Calendar size={10} color="#6B7280" />
                          <Text style={styles.cardDateText} numberOfLines={1}>
                            {item.destinationDate || item.departureDate || item.date}
                          </Text>
                        </View>
                        <View style={styles.cardTimeRow}>
                          <Clock size={10} color="#9CA3AF" />
                          <Text style={styles.cardTimeText}>{item.destinationTime || "18:45"}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Card Footer Info */}
                    <View style={styles.cardFooter}>
                      <View style={styles.cardFooterLeft}>
                        <View style={styles.capacityPill}>
                          <Package size={12} color="#2563EB" />
                          <Text style={styles.capacityPillText}>{item.weight}</Text>
                        </View>
                      </View>

                      {/* Book Action Button (Disabled if already booked or user's own offer) */}
                      {bookedOfferIds.includes(item.id) ? (
                        <View
                          style={[
                            styles.bookBtn,
                            styles.bookBtnDisabled,
                            darkMode && styles.bookBtnDisabledDark,
                          ]}
                        >
                          <CheckCircle2 size={13} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                          <Text
                            style={[
                              styles.bookBtnText,
                              { color: darkMode ? "#9CA3AF" : "#6B7280" },
                            ]}
                          >
                            {language === "ar"
                              ? "تم الحجز"
                              : language === "fr"
                                ? "Réservé"
                                : "Booked"}
                          </Text>
                        </View>
                      ) : item.userId && user?.id && item.userId === user.id ? (
                        <View
                          style={[
                            styles.bookBtn,
                            styles.bookBtnDisabled,
                            darkMode && styles.bookBtnDisabledDark,
                          ]}
                        >
                          <UserIcon size={13} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                          <Text
                            style={[
                              styles.bookBtnText,
                              { color: darkMode ? "#9CA3AF" : "#6B7280" },
                            ]}
                          >
                            {language === "ar"
                              ? "عرضك"
                              : language === "fr"
                                ? "Votre offre"
                                : "Your Offer"}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.bookBtn}
                          onPress={() => {
                            setSelectedOfferForBooking(item);
                            setBookingWeight("2.5");
                            setBookingDeliveryMethod(null);
                            setBookingContactName("");
                            setBookingContactPhone("");
                            setBookingDeliveryFee("");
                            setBookingPaymentMethod("CASH");
                            setBookingDeliveryAddress("");
                            setBookingDeliveryErrors({});
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.bookBtnText}>{t("bookOfferAction", language)}</Text>
                          <ArrowRight size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Sponsored Ad Card after every 5 items */}
                  {(index + 1) % 5 === 0 && (
                    <View style={{ marginHorizontal: 16 }}>
                      <CompactAdCard />
                    </View>
                  )}
                </React.Fragment>
              ))
            ) : (
              // ── DEMAND CARDS (MATCHING REQUESTS TAB DESIGN) ──
              filteredDemands.map((item, index) => {
                const isAlreadyProposed = proposedDemandIds.includes(item.id);
                return (
                  <React.Fragment key={`dem_${item.id}`}>
                    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
                      <DemandCard
                        demand={{
                          ...item,
                          proposedPrice: item.reward,
                        }}
                        showDeliverAction={true}
                        isProposed={isAlreadyProposed}
                        onPress={() => {
                          if (!isAlreadyProposed) {
                            setSelectedDemandForProposal(item);
                          }
                        }}
                      />
                    </View>

                    {/* Sponsored Ad Card after every 5 items */}
                    {(index + 1) % 5 === 0 && (
                      <View style={{ marginHorizontal: 16 }}>
                        <CompactAdCard />
                      </View>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </>
        )}

        {/* ── BOTTOM MINI ADS ── */}
        <BottomMiniAdsSection />
      </ScrollView>

      {/* ── LOCATION PICKER MODAL ── */}
      <LocationPickerModal
        visible={locationPickerType !== null}
        mode={locationPickerType === "depart" ? "from" : "to"}
        selectedLocation={locationPickerType === "depart" ? selectedDepart : selectedDestination}
        excludedLocation={locationPickerType === "depart" ? selectedDestination : selectedDepart}
        onSelect={(loc) => {
          if (locationPickerType === "depart") {
            setSelectedDepart(loc);
          } else {
            setSelectedDestination(loc);
          }
        }}
        onClose={() => setLocationPickerType(null)}
      />

      {/* ── OFFER BOOKING MODAL ── */}
      {selectedOfferForBooking && (
        <BottomSheetModal
          visible={!!selectedOfferForBooking}
          onClose={() => setSelectedOfferForBooking(null)}
          fullHeight={true}
          contentStyle={{ paddingHorizontal: 0, paddingBottom: 0, flex: 1 }}
        >
          {/* Fixed Header */}
          <View style={[styles.modalHeader, { paddingHorizontal: 20, marginBottom: 8 }]}>
            <Text style={[styles.modalTitle, darkMode && styles.textWhite]}>
              {t("bookOfferAction", language)}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedOfferForBooking(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={darkMode ? "#FFFFFF" : "#1F2937"} />
            </TouchableOpacity>
          </View>

          {/* Full-Height Scrollable Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={[styles.modalOfferCard, darkMode && styles.modalOfferCardDark]}>
              <Text style={[styles.modalOfferRoute, darkMode && styles.textWhite]}>
                {selectedOfferForBooking.from} ➔ {selectedOfferForBooking.to}
              </Text>
              <View style={styles.modalOfferMeta}>
                <Text style={styles.modalOfferMetaText}>
                  📅 {selectedOfferForBooking.departureDate || selectedOfferForBooking.date}
                </Text>
                <Text style={styles.modalOfferMetaText}>
                  ⚖️ {selectedOfferForBooking.weight}
                </Text>
                <Text style={styles.modalOfferMetaText}>
                  💰 {selectedOfferForBooking.reward}
                </Text>
              </View>
            </View>

            <Text style={[styles.modalInputLabel, darkMode && styles.textWhite]}>
              {t("desiredWeightLabel", language) || "Desired Weight to Book (kg)"}
            </Text>
            <TextInput
              style={[styles.modalInput, darkMode && styles.modalInputDark]}
              value={bookingWeight}
              onChangeText={(v) => setBookingWeight(cleanNumberInput(v))}
              placeholder="e.g. 2.5"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />

            {(() => {
              const { currency, rate } = getOfferPriceDetails(selectedOfferForBooking);
              const w = parseFloat(bookingWeight) || 0;
              const total = (w * rate).toFixed(2);

              return (
                <View style={[styles.priceSummaryBox, darkMode && styles.priceSummaryBoxDark]}>
                  <Text style={[styles.priceSummaryLabel, darkMode && styles.textMutedDark]}>
                    {t("estimatedTotal", language) || "Estimated Total Cost:"}
                  </Text>
                  <Text style={styles.priceSummaryValue}>
                    {currency} {total}
                  </Text>
                </View>
              );
            })()}

            {/* Tunisia Domestic Delivery Section: The sender booking the luggage space chooses delivery for Tunisia */}
            {selectedOfferForBooking &&
              (isTunisiaLocation(selectedOfferForBooking.from) ||
                isTunisiaLocation(selectedOfferForBooking.to)) && (
                <TunisiaDeliverySection
                  deliveryMethod={bookingDeliveryMethod}
                  setDeliveryMethod={(m) => {
                    setBookingDeliveryMethod(m);
                    setBookingDeliveryErrors((prev) => ({ ...prev, deliveryMethod: undefined }));
                  }}
                  contactName={bookingContactName}
                  setContactName={(v) => {
                    setBookingContactName(v);
                    setBookingDeliveryErrors((prev) => ({ ...prev, deliveryContactName: undefined }));
                  }}
                  contactPhone={bookingContactPhone}
                  setContactPhone={(v) => {
                    setBookingContactPhone(v);
                    setBookingDeliveryErrors((prev) => ({ ...prev, deliveryContactPhone: undefined }));
                  }}
                  deliveryFee={bookingDeliveryFee}
                  setDeliveryFee={(v) => {
                    setBookingDeliveryFee(v);
                    setBookingDeliveryErrors((prev) => ({ ...prev, deliveryFee: undefined }));
                  }}
                  paymentMethod={bookingPaymentMethod}
                  setPaymentMethod={setBookingPaymentMethod}
                  deliveryAddress={bookingDeliveryAddress}
                  setDeliveryAddress={(v) => {
                    setBookingDeliveryAddress(v);
                    setBookingDeliveryErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
                  }}
                  errors={bookingDeliveryErrors}
                  clearError={(field) =>
                    setBookingDeliveryErrors((prev) => ({ ...prev, [field]: undefined }))
                  }
                />
              )}
          </ScrollView>

          {/* Sticky Bottom Footer - Guaranteed Always Visible & Responsive */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopWidth: 1,
              borderTopColor: darkMode ? "#334155" : "#F1F5F9",
              backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
            }}
          >
            <TouchableOpacity
              style={[styles.modalSubmitBtn, bookingLoading && { opacity: 0.6 }]}
              onPress={async () => {
                if (
                  selectedOfferForBooking.userId &&
                  user?.id &&
                  selectedOfferForBooking.userId === user.id
                ) {
                  Alert.alert(
                    language === "ar" ? "تنبيه" : language === "fr" ? "Attention" : "Notice",
                    language === "ar"
                      ? "لا يمكنك حجز عرض قمت بإنشائه بنفسك."
                      : language === "fr"
                        ? "Vous ne pouvez pas réserver votre propre offre."
                        : "You cannot book an offer that you created yourself."
                  );
                  return;
                }

                const maxCap = getAvailableCapacityKg(selectedOfferForBooking);
                const w = parseFloat(bookingWeight) || 0;
                if (w <= 0) {
                  Alert.alert(
                    language === "ar" ? "خطأ" : language === "fr" ? "Erreur" : "Error",
                    "Please enter a valid booking weight."
                  );
                  return;
                }
                if (w > maxCap) {
                  Alert.alert(
                    t("capacityExceededTitle", language) || "Capacity Exceeded",
                    `Only ${maxCap.toFixed(1)} kg available on this flight.`
                  );
                  return;
                }

                const isTunisiaFlight =
                  selectedOfferForBooking &&
                  (isTunisiaLocation(selectedOfferForBooking.from) ||
                    isTunisiaLocation(selectedOfferForBooking.to));

                if (isTunisiaFlight) {
                  const bErr: Record<string, string | undefined> = {};
                  if (!bookingDeliveryMethod) {
                    bErr.deliveryMethod = t("deliveryMethodRequired", language);
                  } else if (bookingDeliveryMethod === "FAMILY") {
                    if (!bookingContactName.trim()) {
                      bErr.deliveryContactName = t("deliveryContactNameRequired", language);
                    }
                    if (!bookingContactPhone.trim()) {
                      bErr.deliveryContactPhone = t("deliveryContactPhoneRequired", language);
                    }
                  } else if (bookingDeliveryMethod === "COURIER") {
                    if (!bookingDeliveryFee.trim() || parseFloat(bookingDeliveryFee) <= 0) {
                      bErr.deliveryFee = t("deliveryFeeRequired", language);
                    }
                  } else if (bookingDeliveryMethod === "I_FAST_PRO") {
                    if (!bookingDeliveryAddress.trim()) {
                      bErr.deliveryAddress = t("deliveryAddressRequired", language);
                    }
                  }

                  if (Object.keys(bErr).length > 0) {
                    setBookingDeliveryErrors(bErr);
                    Alert.alert(
                      language === "ar" ? "تنبيه" : language === "fr" ? "Attention" : "Notice",
                      bErr.deliveryMethod ||
                        bErr.deliveryContactName ||
                        bErr.deliveryContactPhone ||
                        bErr.deliveryFee ||
                        bErr.deliveryAddress ||
                        "Please complete delivery details for Tunisia."
                    );
                    return;
                  }
                }

                setBookingLoading(true);
                const offerId = selectedOfferForBooking.id;

                try {
                  const res = await bookingApi.createBooking({
                    offerId,
                    weightKg: w,
                    deliveryMethod: isTunisiaFlight ? bookingDeliveryMethod : null,
                    deliveryContactName:
                      isTunisiaFlight && bookingDeliveryMethod === "FAMILY"
                        ? bookingContactName.trim()
                        : null,
                    deliveryContactPhone:
                      isTunisiaFlight && bookingDeliveryMethod === "FAMILY"
                        ? bookingContactPhone.trim()
                        : null,
                    deliveryFee:
                      isTunisiaFlight && bookingDeliveryMethod === "COURIER" && bookingDeliveryFee
                        ? parseFloat(bookingDeliveryFee)
                        : null,
                    deliveryPaymentMethod:
                      isTunisiaFlight &&
                      (bookingDeliveryMethod === "COURIER" || bookingDeliveryMethod === "I_FAST_PRO")
                        ? bookingPaymentMethod
                        : null,
                    deliveryAddress:
                      isTunisiaFlight &&
                      (bookingDeliveryMethod === "I_FAST_PRO" || bookingDeliveryMethod === "COURIER")
                        ? bookingDeliveryAddress.trim() || null
                        : null,
                  });

                  if (res.data?.success && res.data.data) {
                    const bookingData = res.data.data.booking;
                    const approvalUrl = res.data.data.approvalUrl;
                    const bookingId = bookingData?.id;

                    setSelectedOfferForBooking(null);

                    if (approvalUrl) {
                      // Open PayPal in secure in-app browser
                      const result = await WebBrowser.openAuthSessionAsync(
                        approvalUrl,
                        "safarlink://paypal-return"
                      );

                      if (result.type === "success") {
                        try {
                          const confirmRes = await bookingApi.confirmPayment(bookingId);
                          if (confirmRes.data?.success) {
                            setBookedOfferIds((prev) => [...prev, offerId]);
                            fetchLiveData();
                            Alert.alert(
                              language === "ar"
                                ? "تم تأمين الدفع! 🔒"
                                : language === "fr"
                                ? "Paiement sécurisé en Escrow ! 🔒"
                                : "Escrow Payment Secured! 🔒",
                              language === "ar"
                                ? "تم خصم المبلغ وتأمينه في حساب الضمان حتى استلام شحنتك بنجاح."
                                : language === "fr"
                                ? "Votre paiement est bloqué en toute sécurité. Les fonds seront libérés dès confirmation de la livraison."
                                : "Your payment is securely held in escrow. Funds will only be released once you confirm delivery."
                            );
                          } else {
                            fetchLiveData();
                            Alert.alert(
                              "Payment Pending",
                              "Your booking was submitted. Please check your payment status in My Bookings."
                            );
                          }
                        } catch (cErr: any) {
                          fetchLiveData();
                          Alert.alert(
                            "Booking Created",
                            "Your booking request was recorded. You can complete or check payment under My Bookings."
                          );
                        }
                      } else {
                        // On Android, if payment completed, the custom tab might dismiss as the deep link opens.
                        // Check booking status first before blindly cancelling!
                        try {
                          const checkRes = await bookingApi.getBooking(bookingId);
                          const bk = checkRes.data?.data;
                          if (bk && (bk.paymentStatus === "AUTHORIZED" || bk.paymentStatus === "HELD")) {
                            setBookedOfferIds((prev) => [...prev, offerId]);
                            fetchLiveData();
                            return;
                          }
                          // User cancelled without completing payment
                          await bookingApi.cancelBooking(bookingId);
                        } catch (cancelErr) {
                          console.log("Notice: auto-cancelled unpaid booking on PayPal abort:", cancelErr);
                        }
                        fetchLiveData();

                        Alert.alert(
                          language === "ar" ? "تم إلغاء الدفع" : language === "fr" ? "Paiement annulé" : "Payment Cancelled",
                          language === "ar"
                            ? "تم إلغاء عملية الدفع عبر PayPal ولم يتم تأكيد الحجز."
                            : language === "fr"
                            ? "Vous avez annulé le paiement PayPal. La réservation n'a pas été effectuée."
                            : "PayPal checkout was cancelled. The booking was not completed."
                        );
                      }
                    } else {
                      setBookedOfferIds((prev) => [...prev, offerId]);
                      fetchLiveData();
                      Alert.alert(
                        t("bookingSuccessTitle", language) || "Booking Request Sent!",
                        t("bookingSuccessMessage", language) || "The traveler has received your request and will confirm shortly."
                      );
                    }
                  } else {
                    const failMsg = res.data?.error || res.data?.message || "Failed to submit booking";
                    Alert.alert(
                      language === "ar" ? "خطأ في الحجز" : language === "fr" ? "Erreur de réservation" : "Booking Error",
                      failMsg
                    );
                  }
                } catch (err: any) {
                  const rawErr =
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to submit booking request";

                  let friendlyMsg = rawErr;
                  if (typeof rawErr === "string" && rawErr.includes("cannot book your own offer")) {
                    friendlyMsg =
                      language === "ar"
                        ? "لا يمكنك حجز عرض قمت بنشره بنفسك ⚠️\nلحجز مساحة لأمتعتك، يرجى اختيار رحلة مسافر آخر."
                        : language === "fr"
                          ? "Vous ne pouvez pas réserver votre propre offre ⚠️\nVeuillez choisir le vol d'un autre voyageur."
                          : "You cannot book your own offer ⚠️\nPlease choose another traveler's flight.";
                  } else if (typeof rawErr === "string" && rawErr.includes("Insufficient baggage space")) {
                    friendlyMsg =
                      language === "ar"
                        ? "الوزن المطلوب يتجاوز الوزن المتاح في هذه الرحلة ⚠️"
                        : language === "fr"
                          ? "Le poids demandé dépasse la capacité disponible sur ce vol ⚠️"
                          : "Insufficient baggage space available on this flight ⚠️";
                  } else if (typeof rawErr === "string" && rawErr.includes("no longer active")) {
                    friendlyMsg =
                      language === "ar"
                        ? "هذا العرض لم يعد متاحاً ⚠️"
                        : language === "fr"
                          ? "Cette offre n'est plus active ⚠️"
                          : "This offer is no longer active ⚠️";
                  }

                  Alert.alert(
                    language === "ar" ? "تنبيه" : language === "fr" ? "Attention" : "Notice",
                    friendlyMsg
                  );
                } finally {
                  setBookingLoading(false);
                }
              }}
              disabled={bookingLoading}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.modalSubmitBtnText}>
                {t("confirmBookingButton", language) || "Confirm & Send Booking Request"}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      )}

      {/* ── DEMAND PROPOSAL MODAL ── */}
      {selectedDemandForProposal && (
        <BottomSheetModal
          visible={!!selectedDemandForProposal}
          onClose={() => setSelectedDemandForProposal(null)}
          fullHeight={true}
          contentStyle={{ paddingHorizontal: 0, paddingBottom: 0, flex: 1 }}
        >
          {/* Fixed Header */}
          <View style={[styles.modalHeader, { paddingHorizontal: 20, marginBottom: 8 }]}>
            <Text style={[styles.modalTitle, darkMode && styles.textWhite]}>
              {t("applyAsTraveler", language)}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedDemandForProposal(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={darkMode ? "#FFFFFF" : "#1F2937"} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={[styles.modalOfferCard, darkMode && styles.modalOfferCardDark]}>
              {/* Route Row: Depart (Left), Arrow (Center), Destination (Right) */}
              <View style={styles.modalRouteRow}>
                <Text style={[styles.modalRouteCity, darkMode && styles.textWhite]} numberOfLines={1}>
                  {selectedDemandForProposal.from}
                </Text>
                <Text style={styles.modalRouteArrow}>➔</Text>
                <Text style={[styles.modalRouteCity, styles.textRight, darkMode && styles.textWhite]} numberOfLines={1}>
                  {selectedDemandForProposal.to}
                </Text>
              </View>

              <View style={styles.modalOfferMeta}>
                <Text style={styles.modalOfferMetaText}>
                  {language === "ar"
                    ? "تاريخ الاستلام: "
                    : language === "fr"
                    ? "Réception: "
                    : "Receive by: "}
                  {selectedDemandForProposal.createdAt || selectedDemandForProposal.date || "Today"}
                </Text>
                <Text style={styles.modalOfferMetaText}>
                  {(() => {
                    const raw = selectedDemandForProposal.weight || "";
                    const match = raw.match(/(\d+(?:\.\d+)?\s*kg)/i);
                    if (match) return match[1].toLowerCase();
                    const numMatch = raw.match(/\d+(?:\.\d+)?/);
                    if (numMatch) return `${numMatch[0]} kg`;
                    return raw || "1.0 kg";
                  })()}
                </Text>
              </View>
            </View>

            {/* Flight Departure & Arrival Schedule Form */}
            <Text style={[styles.proposalFormHeaderTitle, darkMode && styles.textWhite]}>
              ✈️ {language === "ar" ? "حدد مواعيد طيرانك (المغادرة والوصول) *" : language === "fr" ? "Indiquez les horaires de votre vol *" : "Specify Your Flight Schedule *"}
            </Text>

            {/* Departure Date & Time Row */}
            <View style={styles.proposalScheduleRow}>
              <View style={{ flex: 1.3 }}>
                <DatePickerInput
                  label={language === "ar" ? "تاريخ المغادرة" : language === "fr" ? "Date de départ" : "Departure Date"}
                  value={proposalDepDate}
                  language={language}
                  mode="future"
                  minDate={new Date()}
                  onChange={(d) => setProposalDepDate(d)}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <View style={{ flex: 0.9 }}>
                <TimePickerInput
                  label={language === "ar" ? "ساعة المغادرة" : language === "fr" ? "Heure départ" : "Departure Hour"}
                  value={proposalDepTime}
                  language={language}
                  onChange={(t) => setProposalDepTime(t)}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            </View>

            {/* Arrival Date & Time Row */}
            <View style={styles.proposalScheduleRow}>
              <View style={{ flex: 1.3 }}>
                <DatePickerInput
                  label={language === "ar" ? "تاريخ الوصول" : language === "fr" ? "Date d'arrivée" : "Arrival Date"}
                  value={proposalArrDate}
                  language={language}
                  mode="future"
                  minDate={proposalDepDate || new Date()}
                  onChange={(d) => setProposalArrDate(d)}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <View style={{ flex: 0.9 }}>
                <TimePickerInput
                  label={language === "ar" ? "ساعة الوصول" : language === "fr" ? "Heure d'arrivée" : "Arrival Hour"}
                  value={proposalArrTime}
                  language={language}
                  onChange={(t) => setProposalArrTime(t)}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Footer */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopWidth: 1,
              borderTopColor: darkMode ? "#334155" : "#F1F5F9",
              backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
            }}
          >
            <TouchableOpacity
              style={[
                styles.modalSubmitBtn,
                { backgroundColor: primaryColor },
                proposalLoading && { opacity: 0.6 },
              ]}
              onPress={async () => {
                setProposalLoading(true);
                const demId = selectedDemandForProposal.id;

                try {
                  const res = await proposalApi.createProposal({
                    demandId: demId,
                    flightDate: proposalDepDate ? proposalDepDate.toISOString() : new Date().toISOString(),
                    flightTime: proposalDepTime,
                    arrivalDate: proposalArrDate ? proposalArrDate.toISOString() : undefined,
                    arrivalTime: proposalArrTime,
                    notes: proposalNotes?.trim() || undefined,
                  });

                  if (res.data?.success) {
                    setProposedDemandIds((prev) => [...prev, demId]);
                    setSelectedDemandForProposal(null);
                    Alert.alert(
                      t("proposalSentTitle", language) || "Delivery Proposal Sent!",
                      language === "ar"
                        ? "تم إرسال عرض التوصيل وتواريخ طيرانك بنجاح! يمكن لصاحب الطرد رؤية موعد رحلتك في صفحته."
                        : "Votre offre de livraison avec vos dates et heures de départ/arrivée a été transmise !"
                    );
                  } else {
                    const failMsg = res.data?.error || res.data?.message || "Failed to submit proposal";
                    Alert.alert("Error", failMsg);
                  }
                } catch (err: any) {
                  const errMsg =
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to submit proposal";
                  Alert.alert("Error", errMsg);
                } finally {
                  setProposalLoading(false);
                }
              }}
              disabled={proposalLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSubmitBtnText}>
                {t("sendProposalButton", language) || "Send Delivery Proposal"}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: "#0F172A",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  topHeaderDark: {
    backgroundColor: "#1E293B",
    borderBottomColor: "#334155",
  },
  headerLeft: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  headerIconBtnDark: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  headerChatBadgeDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
  },
  headerAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    overflow: "hidden",
  },
  headerAvatarBtnDark: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carouselSection: {
    marginTop: 8,
    marginBottom: 6,
  },

  // ── FILTER CARD ──
  filterCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  filterHeaderBox: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  filterSmartBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  filterSmartBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#2563EB",
  },
  filterStepPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  filterStepPillDark: {
    backgroundColor: "#0F172A",
  },
  filterStepPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  filterMainTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
    marginTop: 2,
  },
  filterMainSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15,
  },
  flightTrackContainer: {
    height: 24,
    justifyContent: "center",
    marginTop: 8,
    position: "relative",
    width: "100%",
  },
  trackDotStart: {
    position: "absolute",
    left: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  trackDotEnd: {
    position: "absolute",
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  flightTrackLine: {
    position: "absolute",
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
  },
  flightTrackLineDark: {
    backgroundColor: "#334155",
  },
  flightTrackPlaneWrapper: {
    position: "absolute",
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
    transform: [{ rotate: "45deg" }],
  },
  flightTrackPlaneWrapperDark: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  tabSegment: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tabSegmentDark: {
    backgroundColor: "#0F172A",
  },
  tabSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabSegmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabSegmentText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
  },

  // Route Container & Cards
  routeContainer: {
    marginBottom: 10,
  },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  routeCardMainBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  routeCardDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  routeCardActive: {
    borderColor: "#BFDBFE",
    backgroundColor: "#F0F7FF",
  },
  routeDotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 10,
  },
  routeDotDestination: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 10,
  },
  routeRowText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  routeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  routePlaceholder: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  clearIconBtn: {
    padding: 4,
  },
  swapBtnWrapper: {
    alignItems: "center",
    marginVertical: -8,
    zIndex: 5,
  },
  swapBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  swapBtnDark: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },

  // Date Row
  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  dateCol: {
    flex: 1,
  },

  // Filter Meta
  filterMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearAllBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#EF4444",
  },
  resultsBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultsBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  // State 1: Prompt Card
  promptCard: {
    marginHorizontal: 16,
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  promptCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  promptIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  promptSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },

  // State 2: Empty Card
  emptyCard: {
    marginHorizontal: 16,
    padding: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCardDark: {
    backgroundColor: "#1E293B",
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 14,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Feed Header
  feedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  feedSectionTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  feedCountLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  // ── ORIGINAL OFFER CARD STYLES ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  cardUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  cardUserInfo: {
    flex: 1,
  },
  cardUserNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardUserName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  verifiedBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  priceBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceBadgeDark: {
    backgroundColor: "#0F172A",
    borderColor: "#3B82F6",
  },
  priceBadgeText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#2563EB",
  },
  cardRouteBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardRouteBoxDark: {
    backgroundColor: "#0F172A",
  },
  cardRouteItem: {
    flex: 1,
  },
  cardRouteCity: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 1,
  },
  cardDateText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  cardTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardTimeText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  cardPlaneMid: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  dashedLine: {
    width: 10,
    height: 1,
    backgroundColor: "#CBD5E1",
  },
  planeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  cardFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  capacityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  capacityPillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#2563EB",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 9,
    gap: 4,
  },
  bookBtnDisabled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bookBtnDisabledDark: {
    backgroundColor: "#334155",
    borderColor: "#475569",
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },

  // Modal Inside Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalOfferCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalOfferCardDark: {
    backgroundColor: "#0F172A",
  },
  modalRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalRouteCity: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalRouteArrow: {
    fontSize: 14,
    color: "#94A3B8",
    marginHorizontal: 8,
  },
  textRight: {
    textAlign: "right",
  },
  modalOfferMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  modalOfferMetaText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
  },
  modalInputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: "#0F172A",
    marginBottom: 12,
  },
  modalInputDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    color: "#FFFFFF",
  },
  modalTextarea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  priceSummaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  priceSummaryBoxDark: {
    backgroundColor: "#1E293B",
  },
  priceSummaryLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#1E40AF",
  },
  priceSummaryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2563EB",
  },
  modalSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },

  // Proposal Schedule Styles
  proposalFormHeaderTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    marginTop: 2,
  },
  proposalScheduleRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  timeInputWrapper: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 4 : 2,
    height: 50,
    justifyContent: "center",
  },
  timeInputWrapperDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  timeInputInnerLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 1,
  },
  proposalTimeInput: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    padding: 0,
    margin: 0,
  },
  proposalTimeInputDark: {
    color: "#FFFFFF",
  },

  // Color Utility
  textWhite: { color: "#FFFFFF" },
  textMuted: { color: "#64748B" },
  textMutedDark: { color: "#94A3B8" },
});
