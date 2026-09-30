import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { demandApi, proposalApi, priceProposalApi, BackendProposalItem } from "@/lib/api";
import {
  MyPackageRequest,
  MyApplicationItem,
  TravelerProposal,
} from "@/lib/mockData";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { styles } from "@/styles/requestsStyles";
import {
  FilterTab,
  ModeTab,
  AppFilterTab,
  mapBackendDemand,
  RequestsHeader,
  MyDemandCard,
  MyApplicationCard,
  RequestsEmptyState,
  EditDemandModal,
} from "@/components/requests";
import AcceptProposalPaymentModal from "@/components/requests/AcceptProposalPaymentModal";

export default function RequestsScreen() {
  const router = useRouter();
  const { language, darkMode, user } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";
  const params = useLocalSearchParams<{ mode?: string; targetId?: string; expandId?: string; t?: string }>();

  // Mode: 1. Mes Demandes (Default) vs 2. Mes Candidatures
  const [currentMode, setCurrentMode] = useState<ModeTab>("my_demands");

  // Demands list (from DB)
  const [requestsList, setRequestsList] = useState<MyPackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Applications list for Demands (Proposals user submitted on package requests)
  const [applicationsList, setApplicationsList] = useState<MyApplicationItem[]>([]);
  const [appFilterTab, setAppFilterTab] = useState<AppFilterTab>("all");

  // Payment Modal State for Accepting Proposals
  const [selectedProposalForPayment, setSelectedProposalForPayment] = useState<BackendProposalItem | null>(null);
  const [selectedDemandForPayment, setSelectedDemandForPayment] = useState<any | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const fetchMyDemands = useCallback(async () => {
    try {
      const res = await demandApi.getMyDemands();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = await Promise.all(
          res.data.data.map(async (d: any) => {
            const base = mapBackendDemand(d);
            try {
              const propRes = await proposalApi.getDemandProposals(d.id);
              if (propRes.data?.success && Array.isArray(propRes.data.data)) {
                base.proposals = propRes.data.data.map((p: any) => {
                  const rawFlightDate = p.flightDate ? new Date(p.flightDate) : new Date();
                  const formattedFlight = isNaN(rawFlightDate.getTime())
                    ? String(p.flightDate)
                    : rawFlightDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                  return {
                    id: p.id,
                    travelerName: p.traveler?.name || "Traveler",
                    travelerAvatar: p.traveler?.avatar || undefined,
                    rating: p.traveler?.rating || 5.0,
                    flightDate: formattedFlight,
                    flightTime: p.flightTime || "14:30",
                    arrivalDate: p.arrivalDate ? new Date(p.arrivalDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : formattedFlight,
                    arrivalTime: p.arrivalTime || "18:45",
                    proposedPrice: p.proposedPrice || "Free",
                    status: p.status.toLowerCase() as any,
                    paymentStatus: p.paymentStatus,
                    payoutStatus: p.payoutStatus,
                    rawProposal: p,
                    createdAt: new Date(p.createdAt).toLocaleDateString(),
                  };
                });
              }
            } catch (err) {}
            const activeProps = (base.proposals || []).filter(
              (p: any) => p.status !== "cancelled" && p.status !== "rejected"
            );
            base.proposalCount = d.proposalCount !== undefined ? d.proposalCount : activeProps.length;
            return base;
          })
        );
        setRequestsList(mapped);
      }
    } catch (e) {
      console.error("Error fetching my demands:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMyProposals = useCallback(async () => {
    try {
      const [proposalsRes, pricePropsRes] = await Promise.allSettled([
        proposalApi.getMyProposals(),
        priceProposalApi.getProposals(),
      ]);

      const mapped: MyApplicationItem[] = [];

      if (
        proposalsRes.status === "fulfilled" &&
        proposalsRes.value.data?.success &&
        Array.isArray(proposalsRes.value.data.data)
      ) {
        proposalsRes.value.data.data.forEach((p: any) => {
          const rawFlightDate = p.flightDate ? new Date(p.flightDate) : new Date(p.createdAt);
          const formattedFlightDate = isNaN(rawFlightDate.getTime())
            ? String(p.flightDate || "Flexible")
            : rawFlightDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

          const rawArrivalDate = p.arrivalDate ? new Date(p.arrivalDate) : (p.demand?.targetDate ? new Date(p.demand.targetDate) : null);
          const formattedArrivalDate = rawArrivalDate && !isNaN(rawArrivalDate.getTime())
            ? rawArrivalDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : (language === "ar" ? "وصول تقديري" : "Estimée");

          const parsedProposedPrice = parseFloat(String(p.proposedPrice || "").replace(/[^0-9.]/g, "")) || 0;
          const effWeight = p.weightKg || p.demand?.weightKg || 1;

          mapped.push({
            id: p.id,
            targetPostId: p.demandId,
            type: "delivery_proposal",
            targetTitle: `${p.demand?.from || "Origin"} → ${p.demand?.to || "Destination"}`,
            creatorName: p.demand?.user?.name || "Sender",
            creatorAvatar: p.demand?.user?.avatar || undefined,
            creatorRating: p.demand?.user?.averageRating || 5.0,
            creatorId: p.demand?.userId,
            from: p.demand?.from || "Origine",
            to: p.demand?.to || "Destination",
            myFlightDate: formattedFlightDate,
            departureTime: p.flightTime || "14:30",
            destinationDate: formattedArrivalDate,
            myArrivalDate: formattedArrivalDate,
            destinationTime: p.arrivalTime || "18:45",
            targetDate: formattedFlightDate,
            weight: `${p.demand?.weightKg || 1} kg`,
            myRequestedWeight: `${effWeight} kg`,
            requestedWeightKg: effWeight,
            remainingKg: effWeight,
            totalKg: effWeight,
            originalPricePerKg: p.demand?.reward ? `${p.demand.reward} $/kg` : "—",
            myProposedPrice: parsedProposedPrice > 0 ? `${parsedProposedPrice} $/kg` : "Free",
            reward: p.demand?.reward ? `${p.demand.reward} $` : "Reward",
            totalPrice: parsedProposedPrice,
            status: p.status.toLowerCase() as any,
            bookingStatus: p.status,
            paymentStatus: p.paymentStatus || "PENDING",
            deliveryMethod: p.demand?.deliveryMethod || null,
            deliveryContactName: p.demand?.deliveryContactName || null,
            deliveryContactPhone: p.demand?.deliveryContactPhone || null,
            deliveryFee: p.demand?.deliveryFee !== undefined ? p.demand?.deliveryFee : null,
            deliveryPaymentMethod: p.demand?.deliveryPaymentMethod || null,
            deliveryAddress: p.demand?.deliveryAddress || null,
            submittedAt: new Date(p.createdAt).toLocaleDateString(),
            senderAction: p.senderAction,
            travelerAction: p.travelerAction,
            rawProposal: p,
          });
        });
      }

      // Also include price proposals sent by this user
      if (
        pricePropsRes.status === "fulfilled" &&
        pricePropsRes.value.data?.success &&
        Array.isArray(pricePropsRes.value.data.data)
      ) {
        pricePropsRes.value.data.data.forEach((p: any) => {
          if (user?.id && p.senderId !== user.id) return;

          const rawDate = p.offer?.departureDate ? new Date(p.offer.departureDate) : new Date(p.createdAt);
          const formattedDate = isNaN(rawDate.getTime())
            ? String(p.offer?.departureDate || "")
            : rawDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

          mapped.unshift({
            id: p.id,
            targetPostId: p.offerId || p.demandId,
            type: "flight_booking",
            targetTitle: `${p.offer?.from || p.demand?.from || "Origine"} → ${p.offer?.to || p.demand?.to || "Destination"}`,
            creatorName: p.receiver?.name || "Voyageur",
            creatorAvatar: p.receiver?.avatar || undefined,
            creatorRating: p.receiver?.averageRating || 5.0,
            myRequestedWeight: "Négociation",
            weight: "Négociation",
            myProposedPrice: `${p.proposedPrice} ${p.currency}`,
            reward: `${p.proposedPrice} ${p.currency}`,
            status: p.status === "PENDING" ? "pending" : p.status === "ACCEPTED" ? "accepted" : "rejected",
            bookingStatus: p.status === "PENDING" ? "PROPOSAL_PENDING" : p.status === "ACCEPTED" ? "PROPOSAL_ACCEPTED" : "PROPOSAL_REJECTED",
            paymentStatus: "PENDING",
            targetDate: formattedDate,
            from: p.offer?.from || p.demand?.from,
            to: p.offer?.to || p.demand?.to,
            submittedAt: new Date(p.createdAt).toLocaleDateString(),
            isPriceProposal: true,
            proposalData: p,
          });
        });
      }

      setApplicationsList(mapped);
    } catch (e) {
      console.error("Error fetching my proposals:", e);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([fetchMyDemands(), fetchMyProposals()]).finally(() => {
        setLoading(false);
      });
    }, [fetchMyDemands, fetchMyProposals])
  );

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchMyDemands(), fetchMyProposals()]).finally(() => {
      setRefreshing(false);
    });
  };

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedDemandIds, setExpandedDemandIds] = useState<string[]>([]);

  useEffect(() => {
    if (params.mode === "my_applications" || params.mode === "applications") {
      setCurrentMode("my_applications");
    } else if (params.mode === "my_demands" || params.mode === "demands") {
      setCurrentMode("my_demands");
    }

    if (params.targetId || params.expandId) {
      const target = params.targetId || params.expandId;
      const matchedDemand = requestsList.find(
        (r) => String(r.id) === String(target) || r.proposals?.some((p) => String(p.id) === String(target))
      );
      if (matchedDemand) {
        setExpandedDemandIds((prev) =>
          prev.includes(String(matchedDemand.id)) ? prev : [...prev, String(matchedDemand.id)]
        );
      } else if (target) {
        setExpandedDemandIds((prev) =>
          prev.includes(String(target)) ? prev : [...prev, String(target)]
        );
      }
    }
  }, [params.mode, params.targetId, params.expandId, params.t, requestsList]);

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

  const handleNavigateDetails = (demandId: string | number) => {
    router.push({
      pathname: "/(app)/request/[id]",
      params: { id: String(demandId), from: "requests" },
    });
  };

  /**
   * SENDER: Open Escrow Payment modal to Accept Traveler Proposal
   */
  const handleOpenAcceptProposal = (demand: MyPackageRequest, proposal: TravelerProposal) => {
    const rawReward = typeof demand.reward === "string"
      ? parseFloat(demand.reward.replace(/[^0-9.]/g, "")) || 50
      : (demand.reward || 50);

    const currencyMatch = typeof demand.reward === "string" ? demand.reward.match(/[A-Z]{3}/) : null;
    const detectedCurrency = currencyMatch ? currencyMatch[0] : "USD";

    setSelectedDemandForPayment({
      ...demand,
      reward: rawReward,
      currency: detectedCurrency,
      deliveryFee: demand.deliveryFee || 0,
    });

    setSelectedProposalForPayment(
      proposal.rawProposal || {
        id: proposal.id,
        demandId: String(demand.id),
        travelerId: (proposal as any).travelerId || "traveler",
        flightDate: proposal.flightDate,
        flightTime: proposal.flightTime || "14:30",
        arrivalDate: proposal.arrivalDate || proposal.flightDate,
        arrivalTime: proposal.arrivalTime || "18:45",
        proposedPrice: proposal.proposedPrice || "Free",
        status: "PENDING",
        createdAt: proposal.createdAt,
        traveler: {
          id: (proposal as any).travelerId || "traveler",
          name: proposal.travelerName,
          avatar: proposal.travelerAvatar,
          rating: proposal.rating,
        },
      }
    );

    setPaymentModalVisible(true);
  };

  /**
   * SENDER: Reject Proposal
   */
  const handleRejectProposal = (
    demandId: string | number,
    proposalId: string,
    travelerName: string
  ) => {
    Alert.alert(
      t("declineProposalTitle", language),
      t("declineProposalMessage", language, { name: travelerName }),
      [
        { text: t("cancelBtn", language), style: "cancel" },
        {
          text: t("declineBtn", language),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await proposalApi.rejectProposal(proposalId);
              if (res.data?.success) {
                fetchMyDemands();
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

  /**
   * SENDER: Confirm Delivery & Release Escrow Funds to Traveler
   */
  const handleCompleteProposal = (proposalId: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد استلام الشحنة" : "Confirmer la réception du colis",
      language === "ar"
        ? "هل قمت باستلام الشحنة بنجاح؟ سيتم تحرير المبلغ المالي للمسافر فوراً من حساب الضمان."
        : "Avez-vous bien reçu votre colis ? Les fonds retenus sous séquestre seront immédiatement libérés au voyageur.",
      [
        { text: t("cancelBtn", language) || "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "تأكيد وتحرير المبلغ 💰" : "Confirmer & Libérer 💰",
          onPress: async () => {
            try {
              const res = await proposalApi.completeProposal(proposalId);
              if (res.data?.success) {
                fetchMyDemands();
                Alert.alert(
                  "Succès 🎉",
                  language === "ar"
                    ? "تم تأكيد الاستلام وتحرير المبلغ للمسافر. شكراً لثقتكم بـ SafarLink!"
                    : "Livraison confirmée et paiement libéré au voyageur. Merci d'avoir utilisé SafarLink !"
                );
              } else {
                Alert.alert("Erreur", res.data?.message || "Échec de la confirmation");
              }
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Échec de la confirmation";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ]
    );
  };

  /**
   * SENDER: Open Dispute (Freeze funds)
   */
  const handleDisputeProposal = (proposalId: string) => {
    Alert.alert(
      language === "ar" ? "فتح نزاع / مشكلة" : "Signaler un litige",
      language === "ar"
        ? "هل تواجه مشكلة في هذه الشحنة؟ سيتم تجميد الأموال في حساب الضمان ومراجعة الطلب من قبل فريق الدعم."
        : "Rencontrez-vous un problème avec cette livraison ? Les fonds resteront bloqués sous séquestre pour examen par l'administration.",
      [
        { text: t("cancelBtn", language) || "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "فتح نزاع ⚠️" : "Ouvrir un litige ⚠️",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await proposalApi.disputeProposal(proposalId, {
                reason: "Signaled by sender in requests screen",
              });
              if (res.data?.success) {
                fetchMyDemands();
                Alert.alert(
                  language === "ar" ? "تم تسجيل النزاع ⚠️" : "Litige ouvert ⚠️",
                  language === "ar"
                    ? "الأموال مجمدة تحت الضمان. سيقوم فريق SafarLink بالتواصل معك."
                    : "Les fonds sont gelés sous séquestre. Le support SafarLink examine la situation."
                );
              } else {
                Alert.alert("Erreur", res.data?.message || "Échec de l'ouverture du litige");
              }
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Échec de l'ouverture du litige";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ]
    );
  };

  /**
   * SENDER: Cancel Accepted Proposal & Refund
   */
  const handleCancelProposal = (proposalId: string) => {
    Alert.alert(
      language === "ar" ? "إلغاء الطلب واسترداد المبلغ" : "Annuler & Rembourser",
      language === "ar"
        ? "هل أنت متأكد من إلغاء هذا الطلب؟ إذا تم حجز أموال تحت الضمان، فسيتم إرجاعها إلى حسابك بالكامل."
        : "Êtes-vous sûr de vouloir annuler ? Si un paiement est sous séquestre, il vous sera intégralement remboursé.",
      [
        { text: t("cancelBtn", language) || "Non", style: "cancel" },
        {
          text: language === "ar" ? "نعم، إلغاء واسترداد" : "Oui, annuler & rembourser",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await proposalApi.cancelProposal(proposalId);
              if (res.data?.success) {
                fetchMyDemands();
                Alert.alert("Succès", "Proposition annulée et fonds remboursés.");
              } else {
                Alert.alert("Erreur", res.data?.message || "Échec de l'annulation");
              }
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Échec de l'annulation";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ]
    );
  };

  /**
   * TRAVELER: Mark Package as Delivered (Direct hand-off, NO in-transit!)
   */
  const handleMarkDelivered = (proposalId: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد تسليم الشحنة" : "Confirmer la livraison du colis",
      language === "ar"
        ? "هل قمت بتسليم الشحنة إلى المستلم بنجاح؟ سيتم إشعار المرسل لتأكيد الاستلام وتحرير أرباحك فوراً."
        : "Avez-vous bien remis le colis au destinataire ? L'expéditeur sera notifié pour valider la réception et libérer vos fonds sous séquestre.",
      [
        { text: t("cancelBtn", language) || "Annuler", style: "cancel" },
        {
          text: language === "ar" ? "تم التسليم 📦" : "Marquer comme livré 📦",
          onPress: async () => {
            try {
              const res = await proposalApi.markDelivered(proposalId);
              if (res.data?.success) {
                fetchMyProposals();
                Alert.alert(
                  "Super ! 📦",
                  language === "ar"
                    ? "تم تسجيل التسليم بنجاح. سيتم تحرير المبلغ فور تأكيد المستلم."
                    : "Colis marqué comme livré ! L'expéditeur a été notifié pour confirmer et libérer votre paiement."
                );
              } else {
                Alert.alert("Erreur", res.data?.message || "Échec de l'opération");
              }
            } catch (err: any) {
              const msg = err?.response?.data?.message || err?.message || "Échec de l'opération";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ]
    );
  };

  const handleDeleteDemand = (demandId: string | number) => {
    Alert.alert(
      t("deleteDemandTitle", language),
      t("deleteDemandMessage", language),
      [
        { text: t("cancelBtn", language), style: "cancel" },
        {
          text: t("deleteDemandConfirm", language),
          style: "destructive",
          onPress: async () => {
            try {
              setRequestsList((prev) => prev.filter((r) => String(r.id) !== String(demandId)));
              await demandApi.deleteDemand(String(demandId));
            } catch (err) {
              console.error("Failed to delete demand:", err);
            }
          },
        },
      ]
    );
  };

  const handleRevokeApplication = (appId: string) => {
    Alert.alert(
      t("withdrawProposalTitle", language),
      t("withdrawProposalMessage", language),
      [
        { text: t("cancelBtn", language), style: "cancel" },
        {
          text: t("withdrawProposalConfirm", language),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await proposalApi.cancelProposal(appId);
              if (res.data?.success) {
                fetchMyProposals();
              } else {
                Alert.alert("Error", res.data?.message || "Failed to withdraw proposal");
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.message || err?.message || "Failed to withdraw proposal";
              Alert.alert("Error", errMsg);
            }
          },
        },
      ]
    );
  };

  const handleOpenEdit = (demand: MyPackageRequest) => {
    setEditingDemand(demand);
    setEditWeight(
      demand.weightKg
        ? String(demand.weightKg)
        : demand.weight
        ? demand.weight.replace(/[^0-9.]/g, "")
        : "1.0"
    );
  };

  const handleSaveEdit = async () => {
    if (!editingDemand) return;
    const finalWeightNum = parseFloat(editWeight) || 1;
    const dateFormatted = editDate
      ? editDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
      : editingDemand.date || "Flexible";

    try {
      setRequestsList((prevList) =>
        prevList.map((req) => {
          if (String(req.id) === String(editingDemand.id)) {
            return {
              ...req,
              weight: `${finalWeightNum} kg`,
              weightKg: finalWeightNum,
              date: dateFormatted,
              description: editNotes || req.description,
            };
          }
          return req;
        })
      );

      await demandApi.updateDemand(String(editingDemand.id), {
        weightKg: finalWeightNum,
        targetDate: editDate ? editDate.toISOString().split("T")[0] : undefined,
        description: editNotes || undefined,
      });

      setEditingDemand(null);
      Alert.alert(t("demandUpdatedTitle", language), t("demandUpdatedMessage", language));
    } catch (err) {
      console.error("Failed to update demand:", err);
    }
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
    <SafeAreaView
      style={[styles.safeArea, darkMode && styles.safeAreaDark]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── HEADER & NAVIGATION CONTROLS ── */}
      <RequestsHeader
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appFilterTab={appFilterTab}
        setAppFilterTab={setAppFilterTab}
        demandsCount={requestsList.length}
        applicationsCount={applicationsList.length}
        pendingAppsCount={applicationsList.filter((a) => a.status === "pending").length}
        acceptedAppsCount={applicationsList.filter((a) => a.status === "accepted").length}
        rejectedAppsCount={applicationsList.filter((a) => a.status === "rejected").length}
        language={language}
        darkMode={darkMode}
        primaryColor={primaryColor}
      />

      {/* ── MAIN SCROLLABLE CONTENT ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : currentMode === "my_demands" ? (
          filteredRequests.length > 0 ? (
            <View style={styles.listContainer}>
              {filteredRequests.map((req) => (
                <MyDemandCard
                  key={String(req.id)}
                  demand={req}
                  isExpanded={expandedDemandIds.includes(String(req.id))}
                  onToggleExpand={toggleExpand}
                  onNavigateDetails={handleNavigateDetails}
                  onDelete={handleDeleteDemand}
                  onEdit={handleOpenEdit}
                  onAcceptProposal={handleOpenAcceptProposal}
                  onRejectProposal={handleRejectProposal}
                  onCompleteProposal={handleCompleteProposal}
                  onDisputeProposal={handleDisputeProposal}
                  onCancelProposal={handleCancelProposal}
                  language={language}
                  darkMode={darkMode}
                  primaryColor={primaryColor}
                />
              ))}
            </View>
          ) : (
            <RequestsEmptyState
              mode="my_demands"
              language={language}
              darkMode={darkMode}
              primaryColor={primaryColor}
            />
          )
        ) : filteredApplications.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredApplications.map((app) => (
              <MyApplicationCard
                key={app.id}
                app={app}
                onRevoke={handleRevokeApplication}
                onMarkDelivered={handleMarkDelivered}
                language={language}
                darkMode={darkMode}
                primaryColor={primaryColor}
              />
            ))}
          </View>
        ) : (
          <RequestsEmptyState
            mode="my_applications"
            language={language}
            darkMode={darkMode}
            primaryColor={primaryColor}
          />
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── EDIT DEMAND MODAL ── */}
      <EditDemandModal
        visible={!!editingDemand}
        editingDemand={editingDemand}
        editWeight={editWeight}
        setEditWeight={setEditWeight}
        editDate={editDate}
        setEditDate={setEditDate}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        onClose={() => setEditingDemand(null)}
        onSave={handleSaveEdit}
        language={language}
        darkMode={darkMode}
        primaryColor={primaryColor}
      />

      {/* ── ESCROW PAYMENT MODAL FOR ACCEPTING PROPOSALS ── */}
      <AcceptProposalPaymentModal
        visible={paymentModalVisible}
        demand={selectedDemandForPayment}
        proposal={selectedProposalForPayment}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedProposalForPayment(null);
          setSelectedDemandForPayment(null);
        }}
        onSuccess={(_updated) => {
          setPaymentModalVisible(false);
          setSelectedProposalForPayment(null);
          setSelectedDemandForPayment(null);
          fetchMyDemands();
          Alert.alert(
            "Proposition Acceptée 🔒",
            "Le paiement a été bloqué en toute sécurité sous séquestre SafarLink. Le voyageur a été notifié."
          );
        }}
      />
    </SafeAreaView>
  );
}
