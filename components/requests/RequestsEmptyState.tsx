import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { ModeTab } from "./requestsUtils";
import { Package, Send, ArrowRight } from "lucide-react-native";

interface RequestsEmptyStateProps {
  mode: ModeTab;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const RequestsEmptyState: React.FC<RequestsEmptyStateProps> = ({
  mode,
  language,
  darkMode,
  primaryColor,
}) => {
  const router = useRouter();

  if (mode === "my_demands") {
    return (
      <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: primaryColor + "15" }]}>
          <Package size={30} color={primaryColor} />
        </View>
        <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
          {t("emptyRequestsTitle", language)}
        </Text>
        <Text style={styles.emptySubtitle}>
          {t("emptyRequestsSub", language)}
        </Text>
        <TouchableOpacity
          style={[styles.emptyActionBtn, { backgroundColor: primaryColor }]}
          onPress={() => router.push("/(app)/(tabs)/create")}
          activeOpacity={0.85}
        >
          <Text style={styles.emptyActionBtnText}>
            {t("createNewDemandBtn", language)}
          </Text>
          <ArrowRight size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
      <View style={[styles.emptyIconCircle, { backgroundColor: primaryColor + "15" }]}>
        <Send size={30} color={primaryColor} />
      </View>
      <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
        {t("emptyApplicationsTitle", language)}
      </Text>
      <Text style={styles.emptySubtitle}>
        {t("emptyApplicationsSub", language)}
      </Text>
      <TouchableOpacity
        style={[styles.emptyActionBtn, { backgroundColor: primaryColor }]}
        onPress={() => router.push("/(app)/(tabs)/home")}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyActionBtnText}>
          {t("explorePackages", language)}
        </Text>
        <ArrowRight size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};
