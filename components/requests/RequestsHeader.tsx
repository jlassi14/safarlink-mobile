import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { FilterTab, ModeTab, AppFilterTab } from "./requestsUtils";
import { Package, Send } from "lucide-react-native";

interface RequestsHeaderProps {
  currentMode: ModeTab;
  setCurrentMode: (mode: ModeTab) => void;
  activeTab: FilterTab;
  setActiveTab: (tab: FilterTab) => void;
  appFilterTab: AppFilterTab;
  setAppFilterTab: (tab: AppFilterTab) => void;
  demandsCount: number;
  applicationsCount: number;
  pendingAppsCount: number;
  acceptedAppsCount: number;
  rejectedAppsCount: number;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const RequestsHeader: React.FC<RequestsHeaderProps> = ({
  currentMode,
  setCurrentMode,
  activeTab,
  setActiveTab,
  appFilterTab,
  setAppFilterTab,
  demandsCount,
  applicationsCount,
  pendingAppsCount,
  acceptedAppsCount,
  rejectedAppsCount,
  language,
  darkMode,
  primaryColor,
}) => {
  return (
    <View style={[styles.header, darkMode && styles.headerDark]}>
      <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
        {t("requestsTabTitle", language)}
      </Text>
      <Text style={styles.headerSubtitle}>
        {currentMode === "my_demands"
          ? t("myDemandsSubtitle", language)
          : t("myApplicationsSubtitle", language)}
      </Text>

      {/* ── 2 TABS SEGMENT SWITCHER ── */}
      <View style={[styles.modeSegmentContainer, darkMode && styles.modeSegmentContainerDark]}>
        <TouchableOpacity
          style={[
            styles.modeSegmentBtn,
            currentMode === "my_demands" && [
              styles.modeSegmentBtnActive,
              darkMode && styles.modeSegmentBtnActiveDark,
            ],
          ]}
          onPress={() => setCurrentMode("my_demands")}
          activeOpacity={0.8}
        >
          <Package size={14} color={currentMode === "my_demands" ? primaryColor : "#64748B"} />
          <Text
            style={[
              styles.modeSegmentText,
              currentMode === "my_demands"
                ? { color: primaryColor, fontWeight: "800" }
                : darkMode
                ? styles.textDark
                : { color: "#64748B" },
            ]}
          >
            {t("myDemandsTab", language)}
          </Text>
          <View
            style={[
              styles.countBadge,
              currentMode === "my_demands"
                ? { backgroundColor: primaryColor + "18" }
                : styles.countBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.countBadgeText,
                currentMode === "my_demands" ? { color: primaryColor } : { color: "#64748B" },
              ]}
            >
              {demandsCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeSegmentBtn,
            currentMode === "my_applications" && [
              styles.modeSegmentBtnActive,
              darkMode && styles.modeSegmentBtnActiveDark,
            ],
          ]}
          onPress={() => setCurrentMode("my_applications")}
          activeOpacity={0.8}
        >
          <Send size={13} color={currentMode === "my_applications" ? primaryColor : "#64748B"} />
          <Text
            style={[
              styles.modeSegmentText,
              currentMode === "my_applications"
                ? { color: primaryColor, fontWeight: "800" }
                : darkMode
                ? styles.textDark
                : { color: "#64748B" },
            ]}
          >
            {t("myApplicationsTab", language)}
          </Text>
          <View
            style={[
              styles.countBadge,
              currentMode === "my_applications"
                ? { backgroundColor: primaryColor + "18" }
                : styles.countBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.countBadgeText,
                currentMode === "my_applications"
                  ? { color: primaryColor }
                  : { color: "#64748B" },
              ]}
            >
              {applicationsCount}
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
            style={[
              styles.filterTab,
              activeTab === "all" && [styles.filterTabActive, { backgroundColor: primaryColor }],
            ]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === "all" && styles.filterTabTextActive,
                darkMode && activeTab !== "all" && styles.textDark,
              ]}
            >
              {t("tabAll", language)} ({demandsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "proposals" && [
                styles.filterTabActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => setActiveTab("proposals")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === "proposals" && styles.filterTabTextActive,
                darkMode && activeTab !== "proposals" && styles.textDark,
              ]}
            >
              {t("tabProposalsFilter", language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "pending" && [styles.filterTabActive, { backgroundColor: primaryColor }],
            ]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === "pending" && styles.filterTabTextActive,
                darkMode && activeTab !== "pending" && styles.textDark,
              ]}
            >
              {t("tabPendingFilter", language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "accepted" && [
                styles.filterTabActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => setActiveTab("accepted")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === "accepted" && styles.filterTabTextActive,
                darkMode && activeTab !== "accepted" && styles.textDark,
              ]}
            >
              {t("tabAcceptedFilter", language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "completed" && [
                styles.filterTabActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeTab === "completed" && styles.filterTabTextActive,
                darkMode && activeTab !== "completed" && styles.textDark,
              ]}
            >
              {t("tabCompletedFilter", language)}
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
            style={[
              styles.filterTab,
              appFilterTab === "all" && [styles.filterTabActive, { backgroundColor: primaryColor }],
            ]}
            onPress={() => setAppFilterTab("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                appFilterTab === "all" && styles.filterTabTextActive,
                darkMode && appFilterTab !== "all" && styles.textDark,
              ]}
            >
              {t("tabAll", language)} ({applicationsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              appFilterTab === "pending" && [
                styles.filterTabActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => setAppFilterTab("pending")}
          >
            <Text
              style={[
                styles.filterTabText,
                appFilterTab === "pending" && styles.filterTabTextActive,
                darkMode && appFilterTab !== "pending" && styles.textDark,
              ]}
            >
              {t("tabPendingApplications", language)} ({pendingAppsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              appFilterTab === "accepted" && [
                styles.filterTabActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => setAppFilterTab("accepted")}
          >
            <Text
              style={[
                styles.filterTabText,
                appFilterTab === "accepted" && styles.filterTabTextActive,
                darkMode && appFilterTab !== "accepted" && styles.textDark,
              ]}
            >
              {t("tabAcceptedApplications", language)} ({acceptedAppsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              appFilterTab === "rejected" && [
                styles.filterTabActive,
                { backgroundColor: primaryColor },
              ],
            ]}
            onPress={() => setAppFilterTab("rejected")}
          >
            <Text
              style={[
                styles.filterTabText,
                appFilterTab === "rejected" && styles.filterTabTextActive,
                darkMode && appFilterTab !== "rejected" && styles.textDark,
              ]}
            >
              {t("tabRejectedApplications", language)} ({rejectedAppsCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};
