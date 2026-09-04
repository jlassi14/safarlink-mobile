import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import {
  Search,
  ChevronRight,
  Package,
  ArrowRightLeft,
} from "lucide-react-native";
import { MOCK_MIDDLEWARE_ORDERS } from "@/lib/constants";

export default function ChatScreen() {
  const router = useRouter();
  const { language } = useAppStore();
  const [search, setSearch] = useState("");

  const middlewareOrders = MOCK_MIDDLEWARE_ORDERS;

  const filteredOrders = middlewareOrders.filter(
    (item) =>
      item.route.toLowerCase().includes(search.toLowerCase()) ||
      item.sender.name.toLowerCase().includes(search.toLowerCase()) ||
      item.receiver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>
              {t("middlewareHub", language)}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t("middlewareHubDesc", language)}
            </Text>
          </View>
        </View>

        {/* Search Filter */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchChatPlaceholder", language)}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Middleware Delivery Order Conversations */}
        <ScrollView
          style={styles.scrollList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredOrders.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.orderCard}
              activeOpacity={0.88}
              onPress={() => router.push(`/(app)/chat/${item.id}`)}
            >
              {/* Route & Middleware Status Header */}
              <View style={styles.orderCardHeader}>
                <View style={styles.routePill}>
                  <Package size={14} color="#00A3E0" />
                  <Text style={styles.routePillText}>{item.route}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {item.statusKey ? t(item.statusKey, language) : (language === "ar" ? item.statusAr : item.statusEn)}
                  </Text>
                </View>
              </View>

              {/* Middleware Dual Contact Preview (Sender & Receiver) */}
              <View style={styles.contactsRow}>
                {/* Sender Box */}
                <View style={styles.contactMiniBox}>
                  <Image source={{ uri: item.sender.avatar }} style={styles.contactAvatar} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.roleTag}>{t("senderRole", language)}</Text>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {item.sender.name.split(" ")[0]}
                    </Text>
                  </View>
                </View>

                {/* Middleware Indicator Icon */}
                <View style={styles.middlewareBridgeIcon}>
                  <ArrowRightLeft size={16} color="#F78022" />
                </View>

                {/* Receiver Box */}
                <View style={styles.contactMiniBox}>
                  <Image source={{ uri: item.receiver.avatar }} style={styles.contactAvatar} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.roleTagReceiver}>{t("receiverRole", language)}</Text>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {item.receiver.name.split(" ")[0]}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer Last Activity */}
              <View style={styles.cardFooter}>
                <Text style={styles.lastMsgText} numberOfLines={1}>
                  {item.sender.lastMsgKey ? t(item.sender.lastMsgKey, language) : (language === "ar" ? item.sender.lastMsgAr : item.sender.lastMsgEn)}
                </Text>
                <View style={styles.arrowRow}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <ChevronRight size={16} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  headerRow: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  routePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00A3E0",
  },
  statusPill: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F78022",
  },
  contactsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactMiniBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  contactInfo: {
    flex: 1,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00A3E0",
  },
  roleTagReceiver: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F78022",
  },
  contactName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  middlewareBridgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  lastMsgText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    marginRight: 8,
  },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});
