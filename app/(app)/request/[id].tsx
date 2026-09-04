import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react-native";
import { MOCK_MY_REQUESTS, MOCK_DEFAULT_AVATAR } from "@/lib/constants";

export default function RequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { language, darkMode } = useAppStore();

  const textColor = darkMode ? colors.text.dark : colors.text.light;
  const bgColor = darkMode ? colors.background.dark : colors.background.light;
  const cardBgColor = darkMode ? "#1F2937" : "#FFFFFF";

  const request =
    MOCK_MY_REQUESTS.find((r) => String(r.id) === String(id)) || MOCK_MY_REQUESTS[0];

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>
          {t("requestDetailsTitle", language)}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* User Card */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.userHeader}>
            <Image
              source={{ uri: request.senderAvatar || MOCK_DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]}>
                {request.senderName || "Ahmed"}
              </Text>
              <Text style={{ color: colors.muted.light }}>
                {t("userRequestsCount", language, { count: 50 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Route */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t("route", language)}
          </Text>

          <View style={styles.routeItem}>
            <MapPin size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.location, { color: colors.muted.light }]}>
                {t("from", language)}
              </Text>
              <Text style={[styles.locationName, { color: textColor }]}>
                {request.from}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <MapPin size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.location, { color: colors.muted.light }]}>
                {t("to", language)}
              </Text>
              <Text style={[styles.locationName, { color: textColor }]}>
                {request.to}
              </Text>
            </View>
          </View>
        </View>

        {/* Package Info */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t("packageInfo", language)}
          </Text>

          <View style={styles.infoRow}>
            <Package size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.muted.light }]}>
                {t("description", language)}
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {request.description || request.title}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.muted.light }]}>
                {t("date", language)}
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {request.date}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted.light }]}>
              {t("weight", language)}
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {request.weight || "0.5 kg"}
            </Text>
          </View>
        </View>

        {/* Reward */}
        <View style={[styles.rewardCard, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.rewardLabel, { color: colors.muted.light }]}>
            {t("reward", language)}
          </Text>
          <Text style={[styles.rewardValue, { color: colors.primary }]}>{request.reward}</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/(app)/chat/1`)}
        >
          <Text style={styles.buttonText}>{t("message", language)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => Alert.alert(t("offerSentAlert", language))}
        >
          <Text style={styles.buttonText}>{t("sendOffer", language)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeLine: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
  },
  location: {
    fontSize: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  rewardCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  rewardLabel: {
    fontSize: 12,
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  button: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
