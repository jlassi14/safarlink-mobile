import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { demandApi } from "@/lib/api";
import {
  MOCK_MY_APPLICATIONS,
  MyPackageRequest,
  MyApplicationItem,
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

export default function RequestsScreen() {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  // Mode: 1. Mes Demandes (Default) vs 2. Mes Candidatures
  const [currentMode, setCurrentMode] = useState<ModeTab>("my_demands");

  // Demands list (from DB)
  const [requestsList, setRequestsList] = useState<MyPackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyDemands = useCallback(async () => {
    try {
      const res = await demandApi.getMyDemands();
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(mapBackendDemand);
        setRequestsList(mapped);
      }
    } catch (e) {
      console.error("Error fetching my demands:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyDemands();
    }, [fetchMyDemands])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyDemands();
  };

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedDemandIds, setExpandedDemandIds] = useState<string[]>([]);

  // Applications list for Demands (Proposals user submitted on package requests)
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

  const handleAcceptProposal = (
    demandId: string | number,
    proposalId: string,
    travelerName: string
  ) => {
    Alert.alert(
      t("acceptProposalTitle", language),
      t("acceptProposalMessage", language, { name: travelerName }),
      [
        { text: t("cancelBtn", language), style: "cancel" },
        {
          text: t("acceptBtn", language),
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
          onPress: () => {
            setApplicationsList((prev) => prev.filter((a) => a.id !== appId));
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
                  onDelete={handleDeleteDemand}
                  onEdit={handleOpenEdit}
                  onAcceptProposal={handleAcceptProposal}
                  onRejectProposal={handleRejectProposal}
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
    </SafeAreaView>
  );
}
