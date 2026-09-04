import React, { useState, useEffect } from "react";
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
} from "lucide-react-native";
import EditOfferModal from "@/components/offers/EditOfferModal";
import DemandActionCard from "@/components/offers/DemandActionCard";
import { REAL_MOCK_OFFERS, OfferItem } from "@/lib/mockData";
import { offerApi } from "@/lib/api";

type DemandFilter = "all" | "pending" | "accepted" | "rejected";

export default function OfferDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();
  const params = useLocalSearchParams<{ offerId?: string }>();
  const offerIdParam = params.offerId;
  const primaryColor = colors.primary || "#2563EB";

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 20) + 4;

  const matchedMock = REAL_MOCK_OFFERS.find((o) => o.id === offerIdParam);
  const [offer, setOffer] = useState<OfferItem | null>(matchedMock || null);
  const [loading, setLoading] = useState<boolean>(!matchedMock);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<DemandFilter>("all");
  const [editingModalVisible, setEditingModalVisible] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (offerIdParam) {
      const mock = REAL_MOCK_OFFERS.find((o) => o.id === offerIdParam);
      if (mock) {
        setOffer(mock);
        setLoading(false);
      } else {
        setLoading(true);
        setErrorMsg(null);
        offerApi
          .getOfferById(offerIdParam)
          .then((res) => {
            if (res.data?.success && res.data.data) {
              const o = res.data.data;
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
                capacity: `${remainingKgNum.toFixed(1)} kg available`,
                pricePerKg: `${o.currency || "QAR"} ${o.pricePerKg} / kg`,
                status: o.status === "ACTIVE" ? "Active" : o.status === "FULL" ? "Fully Booked" : o.status,
                demands: [],
              });
            } else {
              setErrorMsg(res.data?.error || "Offer not found");
            }
          })
          .catch((err) => {
            console.error("Error loading offer details:", err);
            setErrorMsg("Failed to load offer details");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [offerIdParam]);

  const acceptedSumKg = offer?.demands
    ? offer.demands
        .filter((d) => d.status === "accepted")
        .reduce((sum, d) => sum + (d.weightKg || 0), 0)
    : 0;

  const remainingKg = offer ? Math.max(0, offer.totalKg - acceptedSumKg) : 0;
  const isFullyBooked = remainingKg === 0;
  const hasAccepted = acceptedSumKg > 0;

  const filteredDemands = (offer?.demands || []).filter((demand) => {
    if (activeFilter === "pending") return demand.status === "pending";
    if (activeFilter === "accepted") return demand.status === "accepted";
    if (activeFilter === "rejected") return demand.status === "rejected";
    return true;
  });

  const handleAcceptDemand = (demandId: string, senderName: string) => {
    const targetDemand = offer.demands.find((d) => d.id === demandId);
    if (!targetDemand) return;

    const targetWeight = targetDemand.weightKg || 1;
    if (targetWeight > remainingKg) {
      Alert.alert(t("capacityLimitTitle", language), t("capacityLimitMessage", language));
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
        onPress: () => {
          const newAcceptedSum = acceptedSumKg + targetWeight;
          const newRemaining = Math.max(0, offer.totalKg - newAcceptedSum);

          setOffer((prev) => ({
            ...prev,
            status: newRemaining === 0 ? "Fully Booked" : "Active",
            capacity: `${newRemaining.toFixed(1)} kg available`,
            demands: prev.demands.map((d) =>
              d.id === demandId ? { ...d, status: "accepted" as const } : d
            ),
          }));
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
          onPress: () => {
            setOffer((prev) => ({
              ...prev,
              demands: prev.demands.map((d) =>
                d.id === demandId ? { ...d, status: "rejected" as const } : d
              ),
            }));
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
          onPress={() => router.back()}
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
            onPress={() => router.back()}
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

            {/* Route Track Corridor */}
            <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
              <View style={styles.routeLocCol}>
                <Text style={[styles.routeCityPrimary, darkMode && styles.textDark]} numberOfLines={1}>
                  {offer.from.split("-")[1]?.trim() || offer.from}
                </Text>
                <Text style={styles.routeCountrySecondary} numberOfLines={1}>
                  {offer.from.split("-")[0]?.trim() || ""}
                </Text>
              </View>
              <View style={styles.routeFlightTrack}>
                <View style={styles.routeTrackLine} />
                <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
                  <Plane size={11} color="#FFFFFF" />
                </View>
              </View>
              <View style={[styles.routeLocCol, styles.alignRight]}>
                <Text style={[styles.routeCityPrimary, styles.textRight, darkMode && styles.textDark]} numberOfLines={1}>
                  {offer.to.split("-")[1]?.trim() || offer.to}
                </Text>
                <Text style={[styles.routeCountrySecondary, styles.textRight]} numberOfLines={1}>
                  {offer.to.split("-")[0]?.trim() || ""}
                </Text>
              </View>
            </View>

            {/* Capacity Progress Bar */}
            <View style={[styles.capacityProgressBox, darkMode && styles.capacityProgressBoxDark]}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabelText}>
                  {t("luggageCapacity", language)}
                </Text>
                <Text style={[styles.progressRemainingText, isFullyBooked && styles.fullBookedRedText]}>
                  {remainingKg.toFixed(1)} / {offer.totalKg} kg
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, (acceptedSumKg / offer.totalKg) * 100)}%`,
                      backgroundColor: isFullyBooked ? "#DC2626" : primaryColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Schedule: Departure & Arrival */}
            <View style={[styles.scheduleRow, darkMode && styles.scheduleRowDark]}>
              <View style={styles.scheduleCol}>
                <Text style={styles.scheduleLabel}>
                  {t("flightDeparture", language)}
                </Text>
                <Text style={[styles.scheduleDateText, darkMode && styles.textDark]}>
                  {offer.departureDate || offer.flightDate}
                </Text>
                <View style={styles.timeTag}>
                  <Clock size={11} color="#64748B" />
                  <Text style={styles.scheduleTimeText}>{offer.departureTime || "14:30"}</Text>
                </View>
              </View>

              <View style={styles.scheduleDivider} />

              <View style={[styles.scheduleCol, styles.alignRight]}>
                <Text style={styles.scheduleLabel}>
                  {t("flightArrival", language)}
                </Text>
                <Text style={[styles.scheduleDateText, styles.textRight, darkMode && styles.textDark]}>
                  {offer.destinationDate || offer.departureDate || offer.flightDate}
                </Text>
                <View style={[styles.timeTag, styles.alignRight]}>
                  <Clock size={11} color="#64748B" />
                  <Text style={styles.scheduleTimeText}>{offer.destinationTime || "18:45"}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Demands Section Header */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Package size={16} color={primaryColor} />
              <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
                {t("receivedDemandsSummary", language)}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: primaryColor + "18" }]}>
                <Text style={[styles.countBadgeText, { color: primaryColor }]}>
                  {(offer.demands || []).length}
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

          {/* Demands List */}
          {filteredDemands.length > 0 ? (
            filteredDemands.map((d) => (
              <DemandActionCard
                key={d.id}
                demand={d}
                remainingKg={remainingKg}
                onAccept={handleAcceptDemand}
                onReject={handleRejectDemand}
                onRevoke={handleCancelAcceptance}
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
  routeLocCol: { flex: 1 },
  alignRight: { alignItems: "flex-end" },
  routeCityPrimary: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  routeCountrySecondary: { fontSize: 10.5, color: "#64748B", fontWeight: "500", marginTop: 1 },
  textRight: { textAlign: "right" },
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
    marginBottom: 12,
  },
  capacityProgressBoxDark: { backgroundColor: "#0B1120" },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabelText: { fontSize: 11.5, color: "#64748B", fontWeight: "600" },
  progressRemainingText: { fontSize: 11.5, fontWeight: "700", color: "#059669" },
  fullBookedRedText: { color: "#DC2626" },
  progressBarTrack: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  scheduleRowDark: { backgroundColor: "#0B1120" },
  scheduleCol: { flex: 1 },
  scheduleLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  scheduleDateText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
  },
  scheduleTimeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  scheduleDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
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
