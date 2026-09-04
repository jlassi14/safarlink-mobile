import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Plane, Package } from "lucide-react-native";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export type PostType = "offer" | "request";

interface PostTypeSwitcherProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

export const PostTypeSwitcher: React.FC<PostTypeSwitcherProps> = ({ value, onChange }) => {
  const { language, darkMode } = useAppStore();

  const isOffer = value === "offer";
  const isRequest = value === "request";
  const primaryColor = colors.primary || "#2563EB";

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Traveler Offer Tab */}
      <TouchableOpacity
        style={[
          styles.tabButton,
          isOffer && styles.tabButtonActive,
          isOffer && darkMode && styles.tabButtonActiveDark,
        ]}
        onPress={() => onChange("offer")}
        activeOpacity={0.85}
      >
        <Plane size={16} color={isOffer ? primaryColor : darkMode ? "#9CA3AF" : "#6B7280"} />
        <Text
          style={[
            styles.tabLabel,
            isOffer ? { color: primaryColor, fontWeight: "800" } : darkMode ? styles.textDark : null,
          ]}
        >
          {t("postTypeOffer", language).split("(")[0].trim()}
        </Text>
      </TouchableOpacity>

      {/* Package Request Tab */}
      <TouchableOpacity
        style={[
          styles.tabButton,
          isRequest && styles.tabButtonActive,
          isRequest && darkMode && styles.tabButtonActiveDark,
        ]}
        onPress={() => onChange("request")}
        activeOpacity={0.85}
      >
        <Package size={16} color={isRequest ? primaryColor : darkMode ? "#9CA3AF" : "#6B7280"} />
        <Text
          style={[
            styles.tabLabel,
            isRequest ? { color: primaryColor, fontWeight: "800" } : darkMode ? styles.textDark : null,
          ]}
        >
          {t("postTypeRequest", language).split("(")[0].trim()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 3,
    gap: 4,
    marginTop: 8,
  },
  containerDark: {
    backgroundColor: "#27303F",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonActiveDark: {
    backgroundColor: "#1F2937",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  textDark: {
    color: "#9CA3AF",
  },
});

export default PostTypeSwitcher;
