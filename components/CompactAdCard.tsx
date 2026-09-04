import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Phone, ArrowRight, ExternalLink } from "lucide-react-native";
import { MOCK_DEFAULT_COMPACT_AD, CompactAdItem } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export { type CompactAdItem };

export interface CompactAdProps {
  title?: string;
  subtitle?: string;
  phone?: string;
  image?: string;
}

export const CompactAdCard: React.FC<CompactAdProps> = ({
  title,
  subtitle,
  phone = MOCK_DEFAULT_COMPACT_AD.phone,
  image = MOCK_DEFAULT_COMPACT_AD.image,
}) => {
  const { language } = useAppStore();

  const displayTitle =
    title ||
    (MOCK_DEFAULT_COMPACT_AD.titleKey
      ? t(MOCK_DEFAULT_COMPACT_AD.titleKey, language)
      : MOCK_DEFAULT_COMPACT_AD.title);

  const displaySubtitle =
    subtitle ||
    (MOCK_DEFAULT_COMPACT_AD.subtitleKey
      ? t(MOCK_DEFAULT_COMPACT_AD.subtitleKey, language)
      : MOCK_DEFAULT_COMPACT_AD.subtitle);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} activeOpacity={0.88}>
        <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.overlay} />

        <View style={styles.contentRow}>
          <View style={styles.textColumn}>
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>{t("sponsoredAd", language)}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {displaySubtitle}
            </Text>
          </View>

          <View style={styles.actionColumn}>
            <TouchableOpacity style={styles.phoneBtn} activeOpacity={0.8}>
              <Phone size={12} color="#FFFFFF" />
              <Text style={styles.phoneBtnText}>{t("call", language)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 14,
  },
  card: {
    height: 92,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111827",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(17, 24, 39, 0.78)",
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textColumn: {
    flex: 1,
    marginRight: 12,
  },
  sponsoredBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.9)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  sponsoredText: {
    color: "#000000",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  actionColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  phoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  phoneBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default CompactAdCard;
