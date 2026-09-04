import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import {
  MOCK_MY_APPLICATIONS,
  MOCK_DEFAULT_AVATAR,
  MyApplicationItem,
} from "@/lib/mockData";
import { colors } from "@/lib/theme";
import {
  ArrowLeft,
  Send,
  Plane,
  Package,
  Star,
  Clock,
  MessageSquare,
  XCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";

type AppFilterTab = "all" | "pending" | "accepted" | "rejected";

export default function MyApplicationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;
  const primaryColor = colors.primary || "#2563EB";

  const [applicationsList, setApplicationsList] = useState<MyApplicationItem[]>(MOCK_MY_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<AppFilterTab>("all");

  const renderLocation = (loc: string, isRight: boolean = false) => {
    if (!loc) return null;
    const parts = loc.split(" - ");
    if (parts.length >= 2) {
      const country = parts[0].trim();
      const city = parts.slice(1).join(" - ").trim();
      return (
        <View style={[styles.routeLocCol, isRight && styles.alignRight]}>
          <Text
            style={[styles.routeCityPrimary, isRight && styles.textRight, darkMode && styles.textDark]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {city}
          </Text>
          <Text
            style={[styles.routeCountrySecondary, isRight && styles.textRight]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {country}
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.routeLocCol, isRight && styles.alignRight]}>
        <Text
          style={[styles.routeCityPrimary, isRight && styles.textRight, darkMode && styles.textDark]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {loc}
        </Text>
      </View>
    );
  };

  const getApplicationStatusColor = (st: string) => {
    switch (st) {
      case "accepted":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: language === "ar" ? "تم قبول طلبك 🎉" : language === "fr" ? "Acceptée 🎉" : "Accepted 🎉",
        };
      case "rejected":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "عرض مرفوض" : language === "fr" ? "Refusée" : "Declined",
        };
      default:
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          dot: "#F59E0B",
          label: language === "ar" ? "قيد المراجعة" : language === "fr" ? "En attente" : "Pending",
        };
    }
  };

  const handleRevokeApplication = (appId: string) => {
    Alert.alert(
      language === "ar" ? "سحب وإلغاء الترشح" : language === "fr" ? "Retirer ma candidature" : "Withdraw Application",
      language === "ar"
        ? "هل أنت متأكد من رغبتك في سحب عرضك وإلغاء التقدم لهذه الشحنة/الرحلة؟"
        : "Êtes-vous sûr de vouloir retirer votre proposition pour cette annonce ?",
      [
        { text: language === "ar" ? "تراجع" : "Non, garder", style: "cancel" },
        {
          text: language === "ar" ? "نعم، سحب العرض" : "Oui, retirer",
          style: "destructive",
          onPress: () => {
            setApplicationsList((prev) => prev.filter((a) => a.id !== appId));
          },
        },
      ]
    );
  };

  const filteredApplications = applicationsList.filter((app) => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── TOP HEADER WITH BACK BUTTON ── */}
      <View style={[styles.header, darkMode && styles.headerDark, { paddingTop: topPadding }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={[styles.backBtn, darkMode && styles.backBtnDark]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={darkMode ? "#FFFFFF" : "#0F172A"} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
              {language === "ar" ? "ترشحاتي وعروضي" : language === "fr" ? "Mes Candidatures" : "My Applications"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {language === "ar"
                ? "متابعة العروض التي قدمتها على طلبات ورحلات الآخرين"
                : "Suivez vos propositions envoyées sur d'autres annonces"}
            </Text>
          </View>

          <View style={[styles.headerIconCircle, { backgroundColor: primaryColor + "15" }]}>
            <Send size={18} color={primaryColor} />
          </View>
        </View>

        {/* ── FILTER CHIPS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContainer}
        >
          <TouchableOpacity
            style={[styles.filterTab, activeTab === "all" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.filterTabText, activeTab === "all" && styles.filterTabTextActive, darkMode && activeTab !== "all" && styles.textDark]}>
              {language === "ar" ? "الكل" : "Toutes"} ({applicationsList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === "pending" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
            onPress={() => setActiveTab("pending")}
          >
            <Text style={[styles.filterTabText, activeTab === "pending" && styles.filterTabTextActive, darkMode && activeTab !== "pending" && styles.textDark]}>
              {language === "ar" ? "قيد المراجعة" : "En attente"} ({applicationsList.filter((a) => a.status === "pending").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === "accepted" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
            onPress={() => setActiveTab("accepted")}
          >
            <Text style={[styles.filterTabText, activeTab === "accepted" && styles.filterTabTextActive, darkMode && activeTab !== "accepted" && styles.textDark]}>
              {language === "ar" ? "مقبولة" : "Acceptées"} ({applicationsList.filter((a) => a.status === "accepted").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === "rejected" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
            onPress={() => setActiveTab("rejected")}
          >
            <Text style={[styles.filterTabText, activeTab === "rejected" && styles.filterTabTextActive, darkMode && activeTab !== "rejected" && styles.textDark]}>
              {language === "ar" ? "مرفوضة" : "Refusées"} ({applicationsList.filter((a) => a.status === "rejected").length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── APPLICATIONS LIST ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredApplications.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredApplications.map((app) => {
              const appStatus = getApplicationStatusColor(app.status);
              const isDelivery = app.type === "delivery_proposal";

              return (
                <View key={app.id} style={[styles.card, darkMode && styles.cardDark, app.status === "accepted" && styles.cardAccepted]}>
                  {/* Creator Profile & Status */}
                  <View style={styles.headerRow}>
                    <View style={styles.senderProfile}>
                      <Image source={{ uri: app.creatorAvatar || MOCK_DEFAULT_AVATAR }} style={styles.avatar} />
                      <View style={styles.senderInfo}>
                        <View style={styles.senderNameAndStatusRow}>
                          <Text style={[styles.senderName, darkMode && styles.textDark]} numberOfLines={1}>
                            {app.creatorName}
                          </Text>
                          {app.creatorRating && (
                            <View style={styles.ratingBadge}>
                              <Star size={10} color="#D97706" fill="#F59E0B" />
                              <Text style={styles.ratingText}>{app.creatorRating.toFixed(1)}</Text>
                            </View>
                          )}
                          <View style={[styles.roleBadgePill, { backgroundColor: isDelivery ? "#EFF6FF" : "#F5F3FF" }]}>
                            <Text style={[styles.roleBadgeText, { color: isDelivery ? "#2563EB" : "#7C3AED" }]}>
                              {isDelivery
                                ? language === "ar" ? "صاحب الشحنة" : "Expéditeur"
                                : language === "ar" ? "المسافر" : "Voyageur"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.receptionRow}>
                          <Clock size={11} color="#64748B" />
                          <Text style={[styles.receptionDateSubtext, darkMode && styles.receptionDateSubtextDark]} numberOfLines={1}>
                            {language === "ar" ? "تاريخ التقديم: " : "Postulé il y a: "} {app.appliedAt}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: appStatus.bg, borderColor: appStatus.border }]}>
                      <View style={[styles.statusDot, { backgroundColor: appStatus.dot }]} />
                      <Text style={[styles.statusText, { color: appStatus.text }]}>{appStatus.label}</Text>
                    </View>
                  </View>

                  {/* Symmetrical Aviation Route Corridor */}
                  <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
                    {renderLocation(app.from, false)}
                    <View style={styles.routeFlightTrack}>
                      <View style={styles.routeTrackLine} />
                      <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
                        <Plane size={11} color="#FFFFFF" />
                      </View>
                    </View>
                    {renderLocation(app.to, true)}
                  </View>

                  {/* Target Post Specs */}
                  <View style={styles.specsRow}>
                    <View style={[styles.weightBadge, { backgroundColor: primaryColor + "12" }]}>
                      <Package size={12} color={primaryColor} />
                      <Text style={[styles.weightText, { color: primaryColor }]}>{app.weight}</Text>
                    </View>
                    <View style={styles.rewardPill}>
                      <Text style={styles.rewardPillText}>{app.reward}</Text>
                    </View>
                  </View>

                  {/* My Submitted Proposal Box */}
                  <View style={[styles.myAppSubmissionBox, darkMode && styles.myAppSubmissionBoxDark]}>
                    <View style={styles.myAppSubmissionHeader}>
                      <Sparkles size={12} color={primaryColor} />
                      <Text style={[styles.myAppSubmissionTitle, { color: primaryColor }]}>
                        {language === "ar"
                          ? "تفاصيل عرضك المقدم:"
                          : "Détails de votre proposition :"}
                      </Text>
                    </View>

                    {isDelivery ? (
                      <View style={styles.flightBoxItem}>
                        <View style={styles.flightIconPill}>
                          <Text style={styles.flightIconEmoji}>🛫</Text>
                          <Text style={styles.flightBoxLabel}>{language === "ar" ? "رحلتك:" : "Vol prévu :"}</Text>
                        </View>
                        <View style={styles.dateTimeBadgeRow}>
                          <Text style={[styles.flightBoxValue, darkMode && styles.textDark]}>{app.myFlightDate}</Text>
                          <View style={[styles.timeBadgePill, darkMode && styles.timeBadgePillDark]}>
                            <Clock size={10} color="#64748B" />
                            <Text style={styles.timeBadgeText}>{app.myFlightTime}</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.flightBoxItem}>
                        <View style={styles.flightIconPill}>
                          <Text style={styles.flightIconEmoji}>🧳</Text>
                          <Text style={styles.flightBoxLabel}>{language === "ar" ? "الوزن المطلوب:" : "Poids demandé :"}</Text>
                        </View>
                        <Text style={[styles.flightBoxValue, { color: primaryColor, fontWeight: "800" }]}>
                          {app.myRequestedWeight}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions Row */}
                  <View style={styles.actionsRow}>
                    {app.status === "accepted" ? (
                      <TouchableOpacity
                        style={[styles.chatBtn, { backgroundColor: primaryColor }]}
                        onPress={() =>
                          router.push({
                            pathname: "/(app)/chat/[id]",
                            params: { id: "chat_leila" },
                          })
                        }
                        activeOpacity={0.85}
                      >
                        <MessageSquare size={13} color="#FFFFFF" />
                        <Text style={styles.chatBtnText}>
                          {language === "ar"
                            ? "مراسلة وتنسيق التسليم"
                            : "Discuter avec l'expéditeur"}
                        </Text>
                      </TouchableOpacity>
                    ) : app.status === "pending" ? (
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleRevokeApplication(app.id)}
                        activeOpacity={0.85}
                      >
                        <XCircle size={13} color="#DC2626" />
                        <Text style={styles.rejectBtnText}>
                          {language === "ar" ? "سحب وإلغاء العرض" : "Retirer ma candidature"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.rejectedPill}>
                        <Text style={styles.rejectedPillText}>
                          {language === "ar" ? "تم رفض هذا العرض من قِبل الناشر" : "Offre non retenue par le créateur"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: primaryColor + "15" }]}>
              <Send size={30} color={primaryColor} />
            </View>
            <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
              {language === "ar" ? "لا توجد عروض مقدمة حالياً" : "Aucune candidature trouvée"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {language === "ar" ? "تصفح الشحنات والرحلات المتاحة وقدم عروضك لنقل الطرود" : "Explorez les annonces disponibles et proposez vos services de livraison."}
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: primaryColor }]}
              onPress={() => router.push("/(app)/(tabs)/home")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyActionBtnText}>{language === "ar" ? "تصفح الإعلانات" : "Explorer les annonces"}</Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  safeAreaDark: { backgroundColor: "#0B1120" },
  header: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  backBtnDark: { backgroundColor: "#1E293B" },
  headerTitleWrap: { flex: 1, marginHorizontal: 12 },
  headerIconCircle: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#0F172A", letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 11, color: "#64748B", marginTop: 1, fontWeight: "500" },

  // Filter Chips
  filterTabsContainer: { gap: 6, paddingRight: 10, paddingTop: 4 },
  filterTab: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 10, backgroundColor: "#F1F5F9" },
  filterTabActive: { backgroundColor: "#2563EB", shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  filterTabText: { fontSize: 11.5, fontWeight: "600", color: "#64748B" },
  filterTabTextActive: { color: "#FFFFFF", fontWeight: "800" },

  // Scroll Content
  scrollContent: { padding: 14 },
  listContainer: { gap: 14 },

  // Card
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  cardAccepted: { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  senderProfile: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E2E8F0", borderWidth: 1.5, borderColor: "#FFFFFF" },
  senderInfo: { flex: 1 },
  senderName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  senderNameAndStatusRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  receptionRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  receptionDateSubtext: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  receptionDateSubtextDark: { color: "#94A3B8" },

  // Status Capsule Badge
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7.5, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10.5, fontWeight: "800" },

  // Aviation Route Corridor
  routeTimelineBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
  routeTimelineBoxDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  routeLocCol: { flex: 1, minWidth: 0, justifyContent: "center" },
  alignRight: { alignItems: "flex-end" },
  routeCityPrimary: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  routeCountrySecondary: { fontSize: 11, fontWeight: "500", color: "#64748B", marginTop: 1 },
  textRight: { textAlign: "right" },
  routeFlightTrack: { width: 44, alignItems: "center", justifyContent: "center", position: "relative", marginHorizontal: 8 },
  routeTrackLine: { position: "absolute", height: 1.5, left: 0, right: 0, backgroundColor: "#CBD5E1" },
  planeIconBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", zIndex: 2, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 },

  // Specs Row
  specsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  weightBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  weightText: { fontSize: 12, fontWeight: "800" },
  rewardPill: { backgroundColor: "#FEF3C7", paddingHorizontal: 9, paddingVertical: 4.5, borderRadius: 7 },
  rewardPillText: { fontSize: 12, fontWeight: "800", color: "#D97706" },
  roleBadgePill: { paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 5 },
  roleBadgeText: { fontSize: 10, fontWeight: "800" },

  // Boarding Flight Box
  flightBoxItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flightIconPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  flightIconEmoji: { fontSize: 12 },
  flightBoxLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  flightBoxValue: { fontSize: 11.5, fontWeight: "800", color: "#0F172A" },
  dateTimeBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeBadgePill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#F1F5F9", paddingHorizontal: 5.5, paddingVertical: 1.5, borderRadius: 5, borderWidth: 1, borderColor: "#E2E8F0" },
  timeBadgePillDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  timeBadgeText: { fontSize: 10.5, fontWeight: "800", color: "#475569" },

  // Actions
  actionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  rejectBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF2F2", paddingHorizontal: 12, paddingVertical: 7.5, borderRadius: 8, borderWidth: 1, borderColor: "#FECACA" },
  rejectBtnText: { color: "#DC2626", fontSize: 11.5, fontWeight: "700" },
  rejectedPill: { backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rejectedPillText: { fontSize: 11, color: "#DC2626", fontWeight: "700" },
  chatBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8.5, borderRadius: 9, width: "100%" },
  chatBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  // My Application Submitted Card Box
  myAppSubmissionBox: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  myAppSubmissionBoxDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  myAppSubmissionHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  myAppSubmissionTitle: { fontSize: 11.5, fontWeight: "800" },

  // Empty State
  emptyCard: { marginHorizontal: 4, marginTop: 20, padding: 30, backgroundColor: "#FFFFFF", borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  emptyCardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  emptyIconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16.5, fontWeight: "900", color: "#0F172A", textAlign: "center", marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 16, lineHeight: 17, paddingHorizontal: 10 },
  emptyActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  emptyActionBtnText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "800" },
  textDark: { color: "#FFFFFF" },
  textMutedDark: { color: "#94A3B8" },
});
