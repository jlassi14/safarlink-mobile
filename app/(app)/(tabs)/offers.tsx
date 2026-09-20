import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { Plane, Package } from "lucide-react-native";
import AlertBanner from "@/components/AlertBanner";
import MyOfferItemCard from "@/components/offers/MyOfferItemCard";
import BookingItemCard from "@/components/offers/BookingItemCard";
import EditOfferModal from "@/components/offers/EditOfferModal";
import { offersStyles as s } from "@/components/offers/offersStyles";
import {
  REAL_MOCK_OFFERS,
  MOCK_MY_APPLICATIONS,
  OfferItem,
  MyApplicationItem,
  MOCK_DEFAULT_AVATAR,
} from "@/lib/mockData";
import { offerApi, bookingApi } from "@/lib/api";

type ModeTab = "my_offers" | "my_bookings";
type AppFilterTab = "all" | "pending" | "accepted" | "rejected";

export default function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  // Segment Tab (My Offers vs My Bookings)
  const [currentMode, setCurrentMode] = useState<ModeTab>("my_offers");

  // Offers Data
  const [myOffersList, setMyOffersList] = useState<OfferItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Bookings Data
  const [bookingsList, setBookingsList] = useState<MyApplicationItem[]>([]);
  const [appFilterTab, setAppFilterTab] = useState<AppFilterTab>("all");

  // Edit Modal
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchMyOffers = useCallback(async () => {
    try {
      const res = await offerApi.getMyOffers();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped: OfferItem[] = res.data.data.map((o: any) => {
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

          return {
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
            pricePerKg: `${o.currency || "QAR"} ${o.pricePerKg} / kg`,
            status: o.status === "ACTIVE" ? "Active" : o.status === "FULL" ? "Fully Booked" : o.status,
            createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : undefined,
            createdTimestamp: o.createdAt ? new Date(o.createdAt).getTime() : undefined,
            demands: [],
          };
        });
        setMyOffersList(mapped);
      }
    } catch (e) {
      console.error("Error fetching my offers:", e);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await bookingApi.getMyBookings();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped: MyApplicationItem[] = res.data.data.map((b: any) => {
          const rawDate = b.offer?.departureDate ? new Date(b.offer.departureDate) : new Date(b.createdAt);
          const formattedDate = isNaN(rawDate.getTime())
            ? String(b.offer?.departureDate || "")
            : rawDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

          return {
            id: b.id,
            targetPostId: b.offerId,
            type: "flight_booking",
            targetTitle: `${b.offer?.from || "Origin"} → ${b.offer?.to || "Destination"}`,
            creatorName: b.offer?.user?.name || "Traveler",
            creatorAvatar: b.offer?.user?.avatar || MOCK_DEFAULT_AVATAR,
            creatorRating: b.offer?.user?.rating || 4.9,
            myRequestedWeight: `${b.weightKg} kg`,
            myProposedPrice: `${b.totalPrice} ${b.currency}`,
            totalPrice: b.totalPrice,
            currency: b.currency,
            status: b.status.toLowerCase(),
            bookingStatus: b.status,
            paymentStatus: b.paymentStatus,
            myFlightDate: formattedDate,
            from: b.offer?.from,
            to: b.offer?.to,
            submittedAt: new Date(b.createdAt).toLocaleDateString(),
            deliveryMethod: b.deliveryMethod,
            deliveryContactName: b.deliveryContactName,
            deliveryContactPhone: b.deliveryContactPhone,
            deliveryFee: b.deliveryFee,
            deliveryPaymentMethod: b.deliveryPaymentMethod,
            deliveryAddress: b.deliveryAddress,
            deliveryStatus: b.deliveryStatus || null,
            senderAction: b.senderAction || null,
            travelerAction: b.travelerAction || null,
          };
        });
        setBookingsList(mapped);
      }
    } catch (e) {
      console.error("Error fetching my bookings:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([fetchMyOffers(), fetchMyBookings()]).finally(() => {
        setLoading(false);
      });
    }, [fetchMyOffers, fetchMyBookings])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      await Promise.all([fetchMyOffers(), fetchMyBookings()]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleNavigateDetails = (offerId: string) => {
    router.push({
      pathname: "/(app)/offer-details",
      params: { offerId, from: "offers" },
    });
  };

  const handleNavigateBooking = (bookingId: string) => {
    router.push({
      pathname: "/(app)/booking-details" as any,
      params: { id: bookingId },
    });
  };

  const handleDeleteOffer = (offer: OfferItem) => {
    const hasAcceptedDemands =
      (typeof offer.remainingKg === "number" && offer.remainingKg < offer.totalKg) ||
      (offer.demands &&
        offer.demands.some((d) => ["accepted", "in_transit", "delivered"].includes(d.status)));

    if (hasAcceptedDemands) {
      Alert.alert(
        t("cannotDeleteOfferTitle", language),
        t("cannotDeleteOfferMessage", language)
      );
      return;
    }

    Alert.alert(
      t("deleteOfferConfirmTitle", language),
      t("deleteOfferConfirmMessage", language),
      [
        { text: t("cancel", language), style: "cancel" },
        {
          text: t("delete", language),
          style: "destructive",
          onPress: async () => {
            try {
              if (!offer.id.startsWith("off_mock")) {
                await offerApi.deleteOffer(offer.id);
              }
              setMyOffersList((prev) => prev.filter((o) => o.id !== offer.id));
            } catch (err: unknown) {
              const msg =
                (err as any)?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to delete offer");
              setBannerError(msg);
              Alert.alert(language === "ar" ? "خطأ" : "Erreur", msg);
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
    if (!editingOffer) return;

    const cleanPrice = parseFloat(payload.pricePerKg.replace(/[^0-9.]/g, "")) || 35;
    setEditSaving(true);

    try {
      if (!editingOffer.id.startsWith("off_mock")) {
        await offerApi.updateOffer(editingOffer.id, {
          totalKg: payload.totalKg,
          pricePerKg: cleanPrice,
          currency: payload.currency,
          departureDate: payload.flightDate,
        });
      }

      setMyOffersList((prev) =>
        prev.map((o) => {
          if (o.id === editingOffer.id) {
            const acceptedSum = o.demands
              ? o.demands
                  .filter((d) => d.status === "accepted")
                  .reduce((sum, d) => sum + (d.weightKg || 0), 0)
              : 0;

            const newRemaining = Math.max(0, payload.totalKg - acceptedSum);

            return {
              ...o,
              totalKg: payload.totalKg,
              capacity: `${newRemaining.toFixed(1)} kg available`,
              pricePerKg: payload.pricePerKg,
              flightDate: payload.flightDate,
            };
          }
          return o;
        })
      );
      setEditingOffer(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update offer";
      setBannerError(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const handleRevokeBooking = (appId: string) => {
    Alert.alert(
      t("cancelBookingTitle", language),
      t("cancelBookingMessage", language),
      [
        { text: t("keepBooking", language), style: "cancel" },
        {
          text: t("yesCancel", language),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await bookingApi.cancelBooking(appId);
              if (res.data?.success) {
                fetchMyBookings();
              } else {
                Alert.alert("Error", res.data?.message || "Failed to cancel booking");
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.message || err?.message || "Failed to cancel booking";
              Alert.alert("Error", errMsg);
            }
          },
        },
      ]
    );
  };

  const handleCompleteBooking = (bookingId: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد استلام الشحنة" : language === "fr" ? "Confirmer la réception" : "Confirm Delivery",
      language === "ar"
        ? "هل تم استلام شحنتك بنجاح؟ سيتم تحرير المبلغ المؤمن للمسافر فوراً."
        : language === "fr"
        ? "Avez-vous bien reçu votre colis ? Les fonds bloqués seront immédiatement libérés au voyageur."
        : "Have you received your package in good condition? Escrow funds will be released to the traveler immediately.",
      [
        { text: t("cancel", language) || "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "نعم، حرر المبلغ 💰" : "Confirm & Release 💰",
          style: "default",
          onPress: async () => {
            try {
              const res = await bookingApi.completeBooking(bookingId);
              if (res.data?.success) {
                fetchMyBookings();
                Alert.alert(
                  "Success! 🎉",
                  "Delivery confirmed and payment released to traveler. Thank you for using SafarLink!"
                );
              } else {
                Alert.alert("Error", res.data?.message || "Failed to complete booking");
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.message || err?.message || "Failed to complete booking";
              Alert.alert("Error", errMsg);
            }
          },
        },
      ]
    );
  };

  const handleDisputeBooking = (bookingId: string) => {
    Alert.alert(
      language === "ar" ? "إبلاغ عن نزاع / مشكلة" : "Open Dispute",
      language === "ar"
        ? "هل تواجه مشكلة مع هذه الشحنة؟ سيتم تجميد الأموال ومراجعة الطلب من قبل إدارة SafarLink."
        : "Are you facing an issue with this delivery? Escrow funds will be frozen and reviewed by SafarLink administration.",
      [
        { text: t("cancel", language) || "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "فتح نزاع ⚠️" : "Open Dispute ⚠️",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await bookingApi.disputeBooking(bookingId);
              if (res.data?.success) {
                fetchMyBookings();
                Alert.alert(
                  "Dispute Raised ⚠️",
                  "Funds have been frozen in escrow. SafarLink support has been notified to investigate."
                );
              } else {
                Alert.alert("Error", res.data?.message || "Failed to dispute booking");
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.message || err?.message || "Failed to dispute booking";
              Alert.alert("Error", errMsg);
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookingsList.filter((b) => {
    if (appFilterTab === "all") return true;
    return b.status === appFilterTab;
  });

  return (
    <SafeAreaView style={[s.safeArea, darkMode && s.safeAreaDark]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── HEADER ── */}
      <View style={[s.header, darkMode && s.headerDark]}>
        <Text style={[s.headerTitle, darkMode && s.textDark]}>
          {t("offersTabTitle", language)}
        </Text>
        <Text style={s.headerSubtitle}>
          {currentMode === "my_offers"
            ? t("myOffersSubtitle", language)
            : t("myBookingsSubtitle", language)}
        </Text>

        {/* ── SEGMENT SWITCHER ── */}
        <View style={[s.modeSegmentContainer, darkMode && s.modeSegmentContainerDark]}>
          <TouchableOpacity
            style={[s.modeSegmentBtn, currentMode === "my_offers" && [s.modeSegmentBtnActive, darkMode && s.modeSegmentBtnActiveDark]]}
            onPress={() => setCurrentMode("my_offers")}
            activeOpacity={0.8}
          >
            <Plane size={15} color={currentMode === "my_offers" ? primaryColor : "#94A3B8"} />
            <Text
              style={[
                s.modeSegmentText,
                currentMode === "my_offers" ? [s.modeSegmentTextActive, { color: primaryColor }] : darkMode ? s.textDark : {},
              ]}
            >
              {t("myPublishedOffers", language)} ({myOffersList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.modeSegmentBtn, currentMode === "my_bookings" && [s.modeSegmentBtnActive, darkMode && s.modeSegmentBtnActiveDark]]}
            onPress={() => setCurrentMode("my_bookings")}
            activeOpacity={0.8}
          >
            <Package size={15} color={currentMode === "my_bookings" ? primaryColor : "#94A3B8"} />
            <Text
              style={[
                s.modeSegmentText,
                currentMode === "my_bookings" ? [s.modeSegmentTextActive, { color: primaryColor }] : darkMode ? s.textDark : {},
              ]}
            >
              {t("myBookings", language)} ({bookingsList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── FILTER CHIPS FOR BOOKINGS ── */}
        {currentMode === "my_bookings" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterTabsContainer}>
            <TouchableOpacity
              style={[s.filterTab, appFilterTab === "all" && [s.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("all")}
            >
              <Text style={[s.filterTabText, appFilterTab === "all" && s.filterTabTextActive, darkMode && appFilterTab !== "all" && s.textDark]}>
                {t("tabAllShort", language)} ({bookingsList.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.filterTab, appFilterTab === "pending" && [s.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("pending")}
            >
              <Text style={[s.filterTabText, appFilterTab === "pending" && s.filterTabTextActive, darkMode && appFilterTab !== "pending" && s.textDark]}>
                {t("tabPendingShort", language)} ({bookingsList.filter((a) => a.status === "pending").length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.filterTab, appFilterTab === "accepted" && [s.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("accepted")}
            >
              <Text style={[s.filterTabText, appFilterTab === "accepted" && s.filterTabTextActive, darkMode && appFilterTab !== "accepted" && s.textDark]}>
                {t("tabAcceptedShort", language)} ({bookingsList.filter((a) => a.status === "accepted").length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.filterTab, appFilterTab === "rejected" && [s.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("rejected")}
            >
              <Text style={[s.filterTabText, appFilterTab === "rejected" && s.filterTabTextActive, darkMode && appFilterTab !== "rejected" && s.textDark]}>
                {t("tabRejectedShort", language)} ({bookingsList.filter((a) => a.status === "rejected").length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* ── SCROLL CONTENT ── */}
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          loading && { flexGrow: 1, justifyContent: "center", alignItems: "center" },
        ]}
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
        {bannerError && (
          <AlertBanner
            message={bannerError}
            type="error"
            onClose={() => setBannerError(null)}
          />
        )}

        {loading ? (
          <View style={s.loaderContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : currentMode === "my_offers" ? (
          myOffersList.length > 0 ? (
            myOffersList.map((item) => (
              <MyOfferItemCard
                key={item.id}
                item={item}
                onNavigateDetails={handleNavigateDetails}
                onEdit={(off) => setEditingOffer(off)}
                onDelete={handleDeleteOffer}
              />
            ))
          ) : (
            <View style={s.emptyBox}>
              <Plane size={42} color="#94A3B8" />
              <Text style={[s.emptyTitle, darkMode && s.textDark]}>
                {t("noOffersYet", language)}
              </Text>
              <Text style={s.emptySubtitle}>
                {t("publishFirstFlightPrompt", language)}
              </Text>
            </View>
          )
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((b) => (
            <BookingItemCard
              key={b.id}
              item={b}
              onPress={handleNavigateBooking}
              onRevoke={handleRevokeBooking}
              onComplete={handleCompleteBooking}
              onDispute={handleDisputeBooking}
              onActionSubmitted={fetchMyBookings}
            />
          ))
        ) : (
          <View style={s.emptyBox}>
            <Package size={42} color="#94A3B8" />
            <Text style={[s.emptyTitle, darkMode && s.textDark]}>
              {t("noBookingsYet", language)}
            </Text>
            <Text style={s.emptySubtitle}>
              {t("bookSpacePrompt", language)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── EDIT OFFER MODAL ── */}
      <EditOfferModal
        visible={!!editingOffer}
        offer={editingOffer}
        onClose={() => setEditingOffer(null)}
        onSave={handleSaveEditOffer}
        loading={editSaving}
      />
    </SafeAreaView>
  );
}
