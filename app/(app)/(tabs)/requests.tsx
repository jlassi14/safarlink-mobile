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
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import {
  MOCK_MY_REQUESTS,
  MOCK_MY_APPLICATIONS,
  MOCK_DEFAULT_AVATAR,
  MyPackageRequest,
  MyApplicationItem,
} from "@/lib/mockData";
import { DatePickerInput } from "@/components/DatePickerInput";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import {
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Plane,
  Star,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  X,
  Check,
  Send,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";

type FilterTab = "all" | "proposals" | "pending" | "accepted" | "completed";
type ModeTab = "my_demands" | "my_applications";
type AppFilterTab = "all" | "pending" | "accepted" | "rejected";

export default function RequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;
  const primaryColor = colors.primary || "#2563EB";

  // Mode: 1. Mes Demandes (Default) vs 2. Mes Candidatures
  const [currentMode, setCurrentMode] = useState<ModeTab>("my_demands");

  // Demands list (sorted newest first)
  const [requestsList, setRequestsList] = useState<MyPackageRequest[]>(() =>
    [...MOCK_MY_REQUESTS].sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0))
  );
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedDemandIds, setExpandedDemandIds] = useState<string[]>(["req_101"]);

  // Applications list for Demands (Proposals I submitted on package requests)
  const [applicationsList, setApplicationsList] = useState<MyApplicationItem[]>(() =>
    MOCK_MY_APPLICATIONS.filter((a) => a.type === "delivery_proposal")
  );
  const [appFilterTab, setAppFilterTab] = useState<AppFilterTab>("all");

  // Edit Modal State
  const [editingDemand, setEditingDemand] = useState<MyPackageRequest | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(new Date());
  const [editNotes, setEditNotes] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedDemandIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getCleanWeight = (rawWeight: string) => {
    if (!rawWeight) return "1.0 kg";
    const match = rawWeight.match(/(\d+(?:\.\d+)?\s*kg)/i);
    if (match) return match[1].toLowerCase();
    const numMatch = rawWeight.match(/\d+(?:\.\d+)?/);
    if (numMatch) return `${numMatch[0]} kg`;
    return rawWeight;
  };

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

  const getStatusColor = (st: string) => {
    switch (st) {
      case "accepted":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          dot: "#10B981",
          label: language === "ar" ? "مقبول" : language === "fr" ? "Accepté" : "Accepted",
        };
      case "completed":
        return {
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
          dot: "#3B82F6",
          label: language === "ar" ? "مكتمل" : language === "fr" ? "Terminé" : "Completed",
        };
      case "rejected":
        return {
          bg: "#FEF2F2",
          text: "#DC2626",
          border: "#FECACA",
          dot: "#EF4444",
          label: language === "ar" ? "مرفوض" : language === "fr" ? "Refusé" : "Rejected",
        };
      default:
        return {
          bg: "#EFF6FF",
          text: "#2563EB",
          border: "#BFDBFE",
          dot: "#3B82F6",
          label: language === "ar" ? "قيد النشر" : language === "fr" ? "En cours" : "In Progress",
        };
    }
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

  const handleAcceptProposal = (demandId: string | number, proposalId: string, travelerName: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد قبول العرض" : language === "fr" ? "Confirmer l'acceptation" : "Confirm Acceptance",
      language === "ar"
        ? `هل أنت متأكد من قبول عرض المسافر ${travelerName}؟ سيتم تأكيد هذا العرض ورفض باقي العروض تلقائياً.`
        : `Êtes-vous sûr de vouloir accepter l'offre de livraison de ${travelerName} ? Seule cette offre sera retenue pour ce colis.`,
      [
        { text: language === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "نعم، قبول العرض" : "Oui, accepter",
          onPress: () => {
            setRequestsList((prevList) =>
              prevList.map((req) => {
                if (String(req.id) === String(demandId)) {
                  const updatedProposals = (req.proposals || []).map((p) =>
                    p.id === proposalId
                      ? { ...p, status: "accepted" as const }
                      : { ...p, status: "rejected" as const }
                  );
                  return {
                    ...req,
                    status: "accepted" as const,
                    proposals: updatedProposals,
                  };
                }
                return req;
              })
            );
          },
        },
      ]
    );
  };

  const handleRejectProposal = (demandId: string | number, proposalId: string, travelerName: string) => {
    Alert.alert(
      language === "ar" ? "رفض العرض" : language === "fr" ? "Refuser la proposition" : "Decline Offer",
      language === "ar"
        ? `هل أنت متأكد من رغبتك في رفض عرض المسافر ${travelerName}؟`
        : `Êtes-vous sûr de vouloir refuser l'offre de livraison de ${travelerName} ?`,
      [
        { text: language === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "نعم، رفض" : "Oui, refuser",
          style: "destructive",
          onPress: () => {
            setRequestsList((prevList) =>
              prevList.map((req) => {
                if (String(req.id) === String(demandId)) {
                  const updatedProposals = (req.proposals || []).map((p) =>
                    p.id === proposalId ? { ...p, status: "rejected" as const } : p
                  );
                  return {
                    ...req,
                    proposals: updatedProposals,
                  };
                }
                return req;
              })
            );
          },
        },
      ]
    );
  };

  const handleDeleteDemand = (demandId: string | number) => {
    Alert.alert(
      language === "ar" ? "حذف الطلب" : language === "fr" ? "Supprimer la demande" : "Delete Request",
      language === "ar"
        ? "هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟"
        : "Êtes-vous sûr de vouloir supprimer définitivement cette demande de colis ?",
      [
        { text: language === "ar" ? "إلغاء" : "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "حذف نهائي" : "Supprimer",
          style: "destructive",
          onPress: () => {
            setRequestsList((prev) => prev.filter((r) => String(r.id) !== String(demandId)));
          },
        },
      ]
    );
  };

  const handleRevokeApplication = (appId: string) => {
    Alert.alert(
      language === "ar" ? "سحب وإلغاء الترشح" : language === "fr" ? "Retirer ma candidature" : "Withdraw Application",
      language === "ar"
        ? "هل أنت متأكد من رغبتك في سحب عرضك وإلغاء التقدم لهذه الشحنة؟"
        : "Êtes-vous sûr de vouloir retirer votre proposition pour cette demande de colis ?",
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

  const handleOpenEdit = (demand: MyPackageRequest) => {
    setEditingDemand(demand);
    setEditWeight(demand.weightKg ? String(demand.weightKg) : (demand.weight ? demand.weight.replace(/[^0-9.]/g, "") : "1.0"));

  };

  const handleSaveEdit = () => {
    if (!editingDemand) return;
    const finalWeightNum = parseFloat(editWeight) || 1;
    const dateFormatted = editDate
      ? editDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
      : editingDemand.date;

    setRequestsList((prevList) =>
      prevList.map((req) => {
        if (String(req.id) === String(editingDemand.id)) {
          return {
            ...req,
            weight: `${finalWeightNum} kg`,
            weightKg: finalWeightNum,
            date: dateFormatted,
            notes: editNotes,
          };
        }
        return req;
      })
    );

    setEditingDemand(null);
    Alert.alert(
      language === "ar" ? "تم التحديث" : language === "fr" ? "Demande mise à jour" : "Request Updated",
      language === "ar" ? "تم تعديل بيانات الطلب بنجاح." : "Les détails de votre demande ont été modifiés."
    );
  };

  const filteredRequests = requestsList.filter((req) => {
    if (activeTab === "all") return true;
    if (activeTab === "proposals") return req.proposals && req.proposals.length > 0;
    return req.status === activeTab;
  });

  const filteredApplications = applicationsList.filter((app) => {
    if (appFilterTab === "all") return true;
    return app.status === appFilterTab;
  });

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── HEADER ── */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
          {language === "ar" ? "الطلبات" : language === "fr" ? "Demandes" : "Requests"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {currentMode === "my_demands"
            ? language === "ar"
              ? "إدارة طلبات شحن الطرود ومتابعة عروض المسافرين"
              : "Gérez vos demandes de colis et propositions reçues"
            : language === "ar"
              ? "متابعة العروض التي قدمتها على طلبات شحن الآخرين"
              : "Suivez vos propositions de livraison envoyées"}
        </Text>

        {/* ── 2 TABS SEGMENT SWITCHER ── */}
        <View style={[styles.modeSegmentContainer, darkMode && styles.modeSegmentContainerDark]}>
          <TouchableOpacity
            style={[styles.modeSegmentBtn, currentMode === "my_demands" && [styles.modeSegmentBtnActive, darkMode && styles.modeSegmentBtnActiveDark]]}
            onPress={() => setCurrentMode("my_demands")}
            activeOpacity={0.8}
          >
            <Package size={14} color={currentMode === "my_demands" ? primaryColor : "#64748B"} />
            <Text style={[styles.modeSegmentText, currentMode === "my_demands" ? { color: primaryColor, fontWeight: "800" } : darkMode ? styles.textDark : { color: "#64748B" }]}>
              {language === "ar" ? "طلباتي المنشورة" : "Mes Demandes"}
            </Text>
            <View style={[styles.countBadge, currentMode === "my_demands" ? { backgroundColor: primaryColor + "18" } : styles.countBadgeInactive]}>
              <Text style={[styles.countBadgeText, currentMode === "my_demands" ? { color: primaryColor } : { color: "#64748B" }]}>
                {requestsList.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeSegmentBtn, currentMode === "my_applications" && [styles.modeSegmentBtnActive, darkMode && styles.modeSegmentBtnActiveDark]]}
            onPress={() => setCurrentMode("my_applications")}
            activeOpacity={0.8}
          >
            <Send size={13} color={currentMode === "my_applications" ? primaryColor : "#64748B"} />
            <Text style={[styles.modeSegmentText, currentMode === "my_applications" ? { color: primaryColor, fontWeight: "800" } : darkMode ? styles.textDark : { color: "#64748B" }]}>
              {language === "ar" ? "ترشحاتي" : "Mes Candidatures"}
            </Text>
            <View style={[styles.countBadge, currentMode === "my_applications" ? { backgroundColor: primaryColor + "18" } : styles.countBadgeInactive]}>
              <Text style={[styles.countBadgeText, currentMode === "my_applications" ? { color: primaryColor } : { color: "#64748B" }]}>
                {applicationsList.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── FILTER CHIPS CAROUSEL ── */}
        {currentMode === "my_demands" ? (
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
                {language === "ar" ? "الكل" : "Toutes"} ({requestsList.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeTab === "proposals" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setActiveTab("proposals")}
            >
              <Text style={[styles.filterTabText, activeTab === "proposals" && styles.filterTabTextActive, darkMode && activeTab !== "proposals" && styles.textDark]}>
                {language === "ar" ? "عروض مستلمة" : "Propositions"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeTab === "pending" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setActiveTab("pending")}
            >
              <Text style={[styles.filterTabText, activeTab === "pending" && styles.filterTabTextActive, darkMode && activeTab !== "pending" && styles.textDark]}>
                {language === "ar" ? "قيد النشر" : "En cours"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeTab === "accepted" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setActiveTab("accepted")}
            >
              <Text style={[styles.filterTabText, activeTab === "accepted" && styles.filterTabTextActive, darkMode && activeTab !== "accepted" && styles.textDark]}>
                {language === "ar" ? "مقبولة" : "Acceptées"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeTab === "completed" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setActiveTab("completed")}
            >
              <Text style={[styles.filterTabText, activeTab === "completed" && styles.filterTabTextActive, darkMode && activeTab !== "completed" && styles.textDark]}>
                {language === "ar" ? "مكتملة" : "Terminées"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsContainer}
          >
            <TouchableOpacity
              style={[styles.filterTab, appFilterTab === "all" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("all")}
            >
              <Text style={[styles.filterTabText, appFilterTab === "all" && styles.filterTabTextActive, darkMode && appFilterTab !== "all" && styles.textDark]}>
                {language === "ar" ? "الكل" : "Toutes"} ({applicationsList.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, appFilterTab === "pending" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("pending")}
            >
              <Text style={[styles.filterTabText, appFilterTab === "pending" && styles.filterTabTextActive, darkMode && appFilterTab !== "pending" && styles.textDark]}>
                {language === "ar" ? "قيد المراجعة" : "En attente"} ({applicationsList.filter((a) => a.status === "pending").length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, appFilterTab === "accepted" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("accepted")}
            >
              <Text style={[styles.filterTabText, appFilterTab === "accepted" && styles.filterTabTextActive, darkMode && appFilterTab !== "accepted" && styles.textDark]}>
                {language === "ar" ? "مقبولة" : "Acceptées"} ({applicationsList.filter((a) => a.status === "accepted").length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, appFilterTab === "rejected" && [styles.filterTabActive, { backgroundColor: primaryColor }]]}
              onPress={() => setAppFilterTab("rejected")}
            >
              <Text style={[styles.filterTabText, appFilterTab === "rejected" && styles.filterTabTextActive, darkMode && appFilterTab !== "rejected" && styles.textDark]}>
                {language === "ar" ? "مرفوضة" : "Refusées"} ({applicationsList.filter((a) => a.status === "rejected").length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* ── MAIN SCROLLABLE CONTENT ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentMode === "my_demands" ? (
          filteredRequests.length > 0 ? (
            <View style={styles.listContainer}>
              {filteredRequests.map((req) => {
                const reqIdStr = String(req.id);
                const isExpanded = expandedDemandIds.includes(reqIdStr);
                const proposals = req.proposals || [];
                const proposalsCount = proposals.length;
                const statusInfo = getStatusColor(req.status || "pending");
                const weightStr = getCleanWeight(req.weight || "1.0 kg");
                const dateDisplay = req.date || "Flexible";
                const isDemandAccepted = req.status === "accepted";
                const canDelete = !isDemandAccepted && req.status !== "completed";

                return (
                  <View key={reqIdStr} style={[styles.card, darkMode && styles.cardDark]}>
                    {/* Absolute Naked Trash Icon */}
                    {canDelete && (
                      <TouchableOpacity
                        style={styles.nakedCornerTrashBtn}
                        onPress={() => handleDeleteDemand(req.id)}
                        activeOpacity={0.6}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}

                    {/* 1. Header Row: Sender Profile (Avatar + Name + Status Badge) */}
                    <View style={[styles.headerRow, canDelete && { paddingRight: 24 }]}>
                      <View style={styles.senderProfile}>
                        <Image source={{ uri: req.senderAvatar || MOCK_DEFAULT_AVATAR }} style={styles.avatar} />
                        <View style={styles.senderInfo}>
                          <View style={styles.senderNameAndStatusRow}>
                            <Text style={[styles.senderName, darkMode && styles.textDark]} numberOfLines={1}>
                              {req.senderName || "Ahmed (Me)"}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
                              <View style={[styles.statusDot, { backgroundColor: statusInfo.dot }]} />
                              <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
                            </View>
                          </View>

                          {/* Dates Metadata: Creation Date & Reception Date */}
                          <View style={styles.datesMetaRow}>
                            <View style={styles.dateMetaItem}>
                              <Clock size={10.5} color="#64748B" />
                              <Text style={[styles.dateMetaText, darkMode && styles.dateMetaTextDark]} numberOfLines={1}>
                                {language === "ar" ? "نُشر في: " : "Publié le : "} {req.createdAt || "16 Aug 2026"}
                              </Text>
                            </View>
                            <View style={styles.dateMetaItem}>
                              <Calendar size={10.5} color="#64748B" />
                              <Text style={[styles.dateMetaText, darkMode && styles.dateMetaTextDark]} numberOfLines={1}>
                                {language === "ar" ? "الاستلام: " : "Réception : "} {dateDisplay}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* 2. Symmetrical Aviation Flight Corridor */}
                    <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
                      {renderLocation(req.from, false)}
                      <View style={styles.routeFlightTrack}>
                        <View style={styles.routeTrackLine} />
                        <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
                          <Plane size={11} color="#FFFFFF" />
                        </View>
                      </View>
                      {renderLocation(req.to, true)}
                    </View>

                    {/* 3. Specs Row */}
                    <View style={styles.specsRow}>
                      <View style={[styles.weightBadge, { backgroundColor: primaryColor + "12" }]}>
                        <Package size={12} color={primaryColor} />
                        <Text style={[styles.weightText, { color: primaryColor }]}>{weightStr}</Text>
                      </View>

                      {/* Edit button if 0 proposals received */}
                      {!isDemandAccepted && req.status !== "completed" && proposalsCount === 0 && (
                        <TouchableOpacity style={[styles.editDemandBtn, darkMode && styles.editDemandBtnDark]} onPress={() => handleOpenEdit(req)} activeOpacity={0.8}>
                          <Edit3 size={12} color={primaryColor} />
                          <Text style={[styles.editDemandBtnText, { color: primaryColor }]}>{language === "ar" ? "تعديل الطلب" : "Modifier"}</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* 4. Proposals Accordion Container */}
                    {proposalsCount > 0 ? (
                      <View style={[styles.proposalsContainer, darkMode && styles.proposalsContainerDark]}>
                        <TouchableOpacity style={[styles.proposalsClickableHeader, darkMode && styles.proposalsClickableHeaderDark]} onPress={() => toggleExpand(reqIdStr)} activeOpacity={0.75}>
                          <View style={styles.proposalsHeaderLeft}>
                            <View style={[styles.proposalsIconBadge, { backgroundColor: primaryColor + "15" }]}>
                              <Plane size={13} color={primaryColor} />
                            </View>
                            <Text style={[styles.proposalsHeaderTitle, darkMode && styles.textDark]}>
                              {language === "ar" ? `عروض التوصيل المستلمة (${proposalsCount})` : `Propositions de livraison (${proposalsCount})`}
                            </Text>
                          </View>
                          <View style={[styles.chevronPill, isExpanded && styles.chevronPillActive]}>
                            {isExpanded ? <ChevronUp size={14} color={primaryColor} /> : <ChevronDown size={14} color="#64748B" />}
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.proposalsItemsList}>
                            {proposals.map((prop) => (
                              <View key={prop.id} style={[styles.proposalCard, darkMode && styles.proposalCardDark, prop.status === "accepted" && styles.proposalCardAccepted]}>
                                <View style={styles.travelerRow}>
                                  <Image source={{ uri: prop.travelerAvatar }} style={styles.travelerAvatar} />
                                  <View style={styles.travelerInfo}>
                                    <View style={styles.travelerNameRow}>
                                      <Text style={[styles.travelerName, darkMode && styles.textDark]}>{prop.travelerName}</Text>
                                      {prop.rating && (
                                        <View style={styles.ratingBadge}>
                                          <Star size={10} color="#D97706" fill="#F59E0B" />
                                          <Text style={styles.ratingText}>{prop.rating.toFixed(1)}</Text>
                                        </View>
                                      )}
                                    </View>
                                    <Text style={styles.proposalCreatedAtText}>{prop.createdAt || "Just now"}</Text>
                                  </View>
                                  {prop.status === "accepted" && (
                                    <View style={styles.acceptedPill}>
                                      <CheckCircle2 size={11} color="#059669" />
                                      <Text style={styles.acceptedPillText}>{language === "ar" ? "مقبول" : "Accepté"}</Text>
                                    </View>
                                  )}
                                </View>

                                {/* Boarding Pass Timing Box */}
                                <View style={[styles.flightBox, darkMode && styles.flightBoxDark]}>
                                  <View style={styles.flightBoxItem}>
                                    <View style={styles.flightIconPill}>
                                      <Text style={styles.flightIconEmoji}>🛫</Text>
                                      <Text style={styles.flightBoxLabel}>{language === "ar" ? "المغادرة:" : "Départ :"}</Text>
                                    </View>
                                    <View style={styles.dateTimeBadgeRow}>
                                      <Text style={[styles.flightBoxValue, darkMode && styles.textDark]}>{prop.flightDate}</Text>
                                      <View style={[styles.timeBadgePill, darkMode && styles.timeBadgePillDark]}>
                                        <Clock size={10} color="#64748B" />
                                        <Text style={styles.timeBadgeText}>{prop.flightTime || "14:30"}</Text>
                                      </View>
                                    </View>
                                  </View>

                                  <View style={styles.flightBoxItem}>
                                    <View style={styles.flightIconPill}>
                                      <Text style={styles.flightIconEmoji}>🛬</Text>
                                      <Text style={styles.flightBoxLabel}>{language === "ar" ? "الوصول:" : "Arrivée :"}</Text>
                                    </View>
                                    <View style={styles.dateTimeBadgeRow}>
                                      <Text style={[styles.flightBoxValue, { color: primaryColor, fontWeight: "800" }]}>{prop.arrivalDate}</Text>
                                      <View style={[styles.timeBadgePill, { backgroundColor: primaryColor + "15", borderColor: primaryColor + "30" }]}>
                                        <Clock size={10} color={primaryColor} />
                                        <Text style={[styles.timeBadgeText, { color: primaryColor, fontWeight: "700" }]}>{prop.arrivalTime || "18:45"}</Text>
                                      </View>
                                    </View>
                                  </View>
                                </View>

                                <View style={styles.actionsRow}>
                                  {prop.status === "pending" && !isDemandAccepted ? (
                                    <>
                                      <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: primaryColor }]} onPress={() => handleAcceptProposal(req.id, prop.id, prop.travelerName)} activeOpacity={0.85}>
                                        <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={2.5} />
                                        <Text style={styles.acceptBtnText}>{language === "ar" ? "قبول العرض" : "Accepter"}</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectProposal(req.id, prop.id, prop.travelerName)} activeOpacity={0.85}>
                                        <XCircle size={13} color="#DC2626" />
                                        <Text style={styles.rejectBtnText}>{language === "ar" ? "رفض" : "Refuser"}</Text>
                                      </TouchableOpacity>
                                    </>
                                  ) : prop.status === "accepted" ? (
                                    <TouchableOpacity
                                      style={[styles.chatBtn, { backgroundColor: primaryColor }]}
                                      onPress={() =>
                                        router.push({
                                          pathname: "/(app)/chat/[id]",
                                          params: { id: "chat_mehdi" },
                                        })
                                      }
                                      activeOpacity={0.85}
                                    >
                                      <MessageSquare size={13} color="#FFFFFF" />
                                      <Text style={styles.chatBtnText}>
                                        {language === "ar" ? "مراسلة المسافر للتنسيق" : "Discuter avec le voyageur"}
                                      </Text>
                                    </TouchableOpacity>
                                  ) : (
                                    <View style={styles.rejectedPill}><Text style={styles.rejectedPillText}>{language === "ar" ? "عرض مرفوض" : "Offre refusée"}</Text></View>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.noOffersContainer, darkMode && styles.noOffersContainerDark]}>
                        <Clock size={11} color="#94A3B8" />
                        <Text style={styles.noOffersText}>{language === "ar" ? "في انتظار عروض المسافرين..." : "En attente de propositions de livraison..."}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: primaryColor + "15" }]}>
                <Package size={30} color={primaryColor} />
              </View>
              <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
                {language === "ar" ? "لا توجد طلبات حالياً" : "Aucune demande trouvée"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === "ar" ? "قم بنشر طلب شحن طردك لتلقي عروض من المسافرين" : "Créez une demande pour expédier un colis avec un voyageur."}
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: primaryColor }]}
                onPress={() => router.push("/(app)/(tabs)/create")}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>{language === "ar" ? "إنشاء طلب جديد" : "Créer une demande"}</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )
        ) : (
          /* ── MY APPLICATIONS (CANDIDATURES PROPOSÉES SUR DEMANDES) ── */
          filteredApplications.length > 0 ? (
            <View style={styles.listContainer}>
              {filteredApplications.map((app) => {
                const appStatus = getApplicationStatusColor(app.status);

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
                            <View style={[styles.roleBadgePill, { backgroundColor: "#EFF6FF" }]}>
                              <Text style={[styles.roleBadgeText, { color: "#2563EB" }]}>
                                {language === "ar" ? "صاحب الشحنة" : "Expéditeur"}
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
                            ? "تفاصيل عرضك المقدم لنقل هذه الشحنة:"
                            : "Détails de votre proposition de transport :"}
                        </Text>
                      </View>

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
                {language === "ar" ? "تصفح الشحنات المتاحة وقدم عروضك لنقل الطرود" : "Explorez les demandes de colis disponibles et proposez vos services."}
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionBtn, { backgroundColor: primaryColor }]}
                onPress={() => router.push("/(app)/(tabs)/home")}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>{language === "ar" ? "تصفح الشحنات" : "Explorer les colis"}</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── EDIT DEMAND MODAL ── */}
      {editingDemand && (
        <Modal visible={!!editingDemand} transparent={true} animationType="slide" onRequestClose={() => setEditingDemand(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.editModalContainer, darkMode && styles.editModalContainerDark]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalHeaderTitle, darkMode && styles.textDark]}>{language === "ar" ? "تعديل الطلب" : "Modifier la demande"}</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditingDemand(null)}><X size={18} color="#64748B" /></TouchableOpacity>
              </View>
              <View style={styles.modalRouteSummary}><Text style={styles.modalRouteText}>{editingDemand.from} ➔ {editingDemand.to}</Text></View>
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalFormLabel, darkMode && styles.textDark]}>{language === "ar" ? "الوزن التقريبي (كغ)" : "Poids du colis (kg)"}</Text>
                <TextInput style={[styles.modalInput, darkMode && styles.modalInputDark]} value={editWeight} onChangeText={setEditWeight} keyboardType="numeric" placeholder="e.g. 2.5" placeholderTextColor="#94A3B8" />
              </View>
              <View style={styles.modalFormGroup}>
                <DatePickerInput label={language === "ar" ? "تاريخ الاستلام" : "Date de réception"} value={editDate} onChange={(d) => setEditDate(d)} mode="future" />
              </View>
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalFormLabel, darkMode && styles.textDark]}>{language === "ar" ? "ملاحظات إضافية" : "Notes"}</Text>
                <TextInput style={[styles.modalInput, styles.modalTextArea, darkMode && styles.modalInputDark]} value={editNotes} onChangeText={setEditNotes} placeholder="..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />
              </View>
              <View style={styles.modalActionsRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditingDemand(null)}><Text style={styles.modalCancelBtnText}>{language === "ar" ? "إلغاء" : "Annuler"}</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: primaryColor }]} onPress={handleSaveEdit} activeOpacity={0.85}>
                  <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.modalSaveBtnText}>{language === "ar" ? "حفظ" : "Enregistrer"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  safeAreaDark: { backgroundColor: "#0B1120" },
  header: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A", letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: "500" },

  // Mode Segment Switcher
  modeSegmentContainer: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 3, marginTop: 10, marginBottom: 4 },
  modeSegmentContainerDark: { backgroundColor: "#0B1120" },
  modeSegmentBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 7.5, borderRadius: 10 },
  modeSegmentBtnActive: { backgroundColor: "#FFFFFF", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 1.5 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  modeSegmentBtnActiveDark: { backgroundColor: "#1E293B" },
  modeSegmentText: { fontSize: 12.5, fontWeight: "600" },
  countBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 9 },
  countBadgeInactive: { backgroundColor: "#E2E8F0" },
  countBadgeText: { fontSize: 10.5, fontWeight: "800" },

  // Filter Chips
  filterTabsContainer: { gap: 6, paddingHorizontal: 2, paddingTop: 6 },
  filterTab: { paddingHorizontal: 13, paddingVertical: 5.5, borderRadius: 9, backgroundColor: "#F1F5F9" },
  filterTabActive: { backgroundColor: "#2563EB", shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  filterTabText: { fontSize: 11.5, fontWeight: "600", color: "#64748B" },
  filterTabTextActive: { color: "#FFFFFF", fontWeight: "800" },

  // Scroll Content
  scrollContent: { padding: 14 },
  listContainer: { gap: 14 },

  // Card
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", position: "relative", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  cardAccepted: { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  senderProfile: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E2E8F0", borderWidth: 1.5, borderColor: "#FFFFFF" },
  senderInfo: { flex: 1 },
  senderName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  senderNameAndStatusRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  datesMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 3, flexWrap: "wrap" },
  dateMetaItem: { flexDirection: "row", alignItems: "center", gap: 3.5 },
  dateMetaText: { fontSize: 10.5, color: "#64748B", fontWeight: "600" },
  dateMetaTextDark: { color: "#94A3B8" },

  // Status Capsule Badge
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7.5, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10.5, fontWeight: "800" },

  // Absolute Naked Trash
  nakedCornerTrashBtn: { position: "absolute", top: 6, right: 6, zIndex: 20, padding: 4, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },

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
  editDemandBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#BFDBFE" },
  editDemandBtnDark: { backgroundColor: "#1E293B", borderColor: "#3B82F6" },
  editDemandBtnText: { fontSize: 11, fontWeight: "700" },
  roleBadgePill: { paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 5 },
  roleBadgeText: { fontSize: 10, fontWeight: "800" },
  receptionRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  receptionDateSubtext: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  receptionDateSubtextDark: { color: "#94A3B8" },

  // Proposals Accordion
  proposalsContainer: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  proposalsContainerDark: { borderTopColor: "#1E293B" },
  proposalsClickableHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8 },
  proposalsClickableHeaderDark: { backgroundColor: "transparent" },
  proposalsHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  proposalsIconBadge: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  proposalsHeaderTitle: { fontSize: 12.5, fontWeight: "800", color: "#334155" },
  chevronPill: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  chevronPillActive: { backgroundColor: "#EFF6FF" },
  proposalsItemsList: { marginTop: 10, gap: 10 },
  noOffersContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  noOffersContainerDark: { borderTopColor: "#1E293B" },
  noOffersText: { fontSize: 11, color: "#94A3B8", fontStyle: "italic" },

  // Proposal Card
  proposalCard: { backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  proposalCardDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  proposalCardAccepted: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  travelerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  travelerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  travelerInfo: { flex: 1 },
  travelerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  travelerName: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  proposalCreatedAtText: { fontSize: 10.5, color: "#94A3B8", marginTop: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#FEF3C7", paddingHorizontal: 4.5, paddingVertical: 1, borderRadius: 5 },
  ratingText: { fontSize: 10, fontWeight: "800", color: "#D97706" },
  acceptedPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: 6 },
  acceptedPillText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  // Boarding Flight Box
  flightBox: { backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10, gap: 4, borderWidth: 1, borderColor: "#F1F5F9" },
  flightBoxDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
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
  acceptBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 13, paddingVertical: 7.5, borderRadius: 8 },
  acceptBtnText: { color: "#FFFFFF", fontSize: 11.5, fontWeight: "800" },
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

  // Edit Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" },
  editModalContainer: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 24, maxHeight: "90%" },
  editModalContainerDark: { backgroundColor: "#151E2E" },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalHeaderTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  modalCloseBtn: { padding: 6, borderRadius: 20, backgroundColor: "#F1F5F9" },
  modalRouteSummary: { backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 16 },
  modalRouteText: { fontSize: 13, fontWeight: "700", color: "#2563EB", textAlign: "center" },
  modalFormGroup: { marginBottom: 14 },
  modalFormLabel: { fontSize: 12.5, fontWeight: "700", color: "#334155", marginBottom: 6 },
  modalInput: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: "#0F172A" },
  modalInputDark: { backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF" },
  modalTextArea: { height: 70, textAlignVertical: "top" },
  modalActionsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9" },
  modalCancelBtnText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  modalSaveBtn: { flex: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 10 },
  modalSaveBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
