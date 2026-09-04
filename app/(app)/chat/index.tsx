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
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  ShieldCheck,
  Star,
  Plane,
  Package,
  X,
} from "lucide-react-native";
import { MOCK_ACCEPTED_CHATS, ChatConversationItem } from "@/lib/mockData";

type RoleFilter = "all" | "traveler" | "sender" | "unread";

export default function ChatListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const primaryColor = colors.primary || "#2563EB";
  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 20) + 6;

  const [conversations, setConversations] = useState<ChatConversationItem[]>(MOCK_ACCEPTED_CHATS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<RoleFilter>("all");

  const filteredConversations = conversations.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "traveler") return chat.role === "traveler";
    if (activeFilter === "sender") return chat.role === "sender";
    if (activeFilter === "unread") return chat.unreadCount > 0;
    return true;
  });

  const getRoleLabel = (item: ChatConversationItem) => {
    if (language === "ar") return item.roleLabelAr;
    if (language === "fr") return item.roleLabelFr;
    return item.roleLabelEn;
  };

  const getCleanCity = (loc: string) => {
    if (!loc) return "";
    const parts = loc.split(" - ");
    return parts.length >= 2 ? parts[1].trim() : loc;
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── APPBAR / SCREEN HEADER ── */}
      <View style={[styles.appBar, darkMode && styles.appBarDark, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, darkMode && styles.backBtnDark]}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={19} color={darkMode ? "#FFFFFF" : "#0F172A"} />
        </TouchableOpacity>

        <View style={styles.appBarTitleCol}>
          <View style={styles.appBarTitleRow}>
            <Text style={[styles.appBarTitle, darkMode && styles.textDark]}>
              {language === "ar" ? "المحادثات المعتمدة" : language === "fr" ? "Discussions Validées" : "Accepted Chats"}
            </Text>
            <View style={[styles.activeTotalBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.activeTotalBadgeText}>{conversations.length}</Text>
            </View>
          </View>
          <Text style={styles.appBarSubtitle} numberOfLines={1}>
            {language === "ar"
              ? "مراسلة المسافرين وأصحاب الشحنات المقبولين فقط"
              : language === "fr"
              ? "Échanges avec vos expéditeurs et voyageurs confirmés"
              : "Chat with your accepted travelers and senders"}
          </Text>
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      <View style={[styles.searchBarWrapper, darkMode && styles.searchBarWrapperDark]}>
        <View style={[styles.searchInputContainer, darkMode && styles.searchInputContainerDark]}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={[
              styles.searchInput,
              darkMode && styles.textDark,
              { textAlign: language === "ar" ? "right" : "left" },
            ]}
            placeholder={
              language === "ar"
                ? "ابحث بالاسم، المدينة، أو الرسالة..."
                : language === "fr"
                ? "Rechercher par nom, ville ou message..."
                : "Search by name, city, or message..."
            }
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <X size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── ROLE & UNREAD FILTER CHIPS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsRow}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "all" && [styles.filterTabActive, { backgroundColor: primaryColor }],
              darkMode && styles.filterTabDark,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "all" && styles.filterTabTextActive,
                darkMode && activeFilter !== "all" && styles.textDark,
              ]}
            >
              {language === "ar" ? "الكل" : "Tous"} ({conversations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "traveler" && [styles.filterTabActive, { backgroundColor: primaryColor }],
              darkMode && styles.filterTabDark,
            ]}
            onPress={() => setActiveFilter("traveler")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "traveler" && styles.filterTabTextActive,
                darkMode && activeFilter !== "traveler" && styles.textDark,
              ]}
            >
              {language === "ar" ? "مسافرون ✈️" : "Voyageurs ✈️"} (
              {conversations.filter((c) => c.role === "traveler").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "sender" && [styles.filterTabActive, { backgroundColor: primaryColor }],
              darkMode && styles.filterTabDark,
            ]}
            onPress={() => setActiveFilter("sender")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "sender" && styles.filterTabTextActive,
                darkMode && activeFilter !== "sender" && styles.textDark,
              ]}
            >
              {language === "ar" ? "أصحاب شحنات 📦" : "Expéditeurs 📦"} (
              {conversations.filter((c) => c.role === "sender").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "unread" && [styles.filterTabActive, { backgroundColor: primaryColor }],
              darkMode && styles.filterTabDark,
            ]}
            onPress={() => setActiveFilter("unread")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "unread" && styles.filterTabTextActive,
                darkMode && activeFilter !== "unread" && styles.textDark,
              ]}
            >
              {language === "ar" ? "غير مقروءة 🔔" : "Non lus 🔔"} (
              {conversations.filter((c) => c.unreadCount > 0).length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── CONVERSATIONS LIST (COMPACT PROFESSIONAL MESSENGER CARDS) ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredConversations.length > 0 ? (
          <View style={styles.conversationsList}>
            {filteredConversations.map((chat) => {
              const isTraveler = chat.role === "traveler";
              const depCity = getCleanCity(chat.from);
              const arrCity = getCleanCity(chat.to);

              return (
                <TouchableOpacity
                  key={chat.id}
                  style={[
                    styles.chatCard,
                    darkMode && styles.chatCardDark,
                    chat.unreadCount > 0 && styles.chatCardUnread,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/chat/[id]",
                      params: { id: chat.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  {/* Left Avatar with Online Dot */}
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: chat.avatar }} style={styles.avatar} />
                    {chat.isOnline && <View style={styles.onlineBadgeDot} />}
                  </View>

                  {/* Main Content Column */}
                  <View style={styles.chatContentCol}>
                    {/* Row 1: Name + Role + Time */}
                    <View style={styles.chatHeaderRow}>
                      <View style={styles.nameBadgesGroup}>
                        <Text style={[styles.userName, darkMode && styles.textDark]} numberOfLines={1}>
                          {chat.name}
                        </Text>
                        <ShieldCheck size={12.5} color="#2563EB" />
                        <View
                          style={[
                            styles.roleBadgePill,
                            isTraveler
                              ? { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }
                              : { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleBadgeText,
                              { color: isTraveler ? "#16A34A" : "#2563EB" },
                            ]}
                          >
                            {isTraveler ? "✈️ " : "📦 "}
                            {getRoleLabel(chat)}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.timeText, chat.unreadCount > 0 && { color: primaryColor, fontWeight: "700" }]}>
                        {chat.lastMessageTime}
                      </Text>
                    </View>

                    {/* Row 2: Route Corridor on Left, Weight & Price on Right */}
                    <View style={styles.routeAndSpecsRow}>
                      <View style={[styles.compactRouteRow, darkMode && styles.compactRouteRowDark]}>
                        <Text style={[styles.routeLocItem, darkMode && styles.routeLocItemDark]} numberOfLines={1}>
                          🛫 {depCity} <Text style={styles.routeDateSub}>({chat.departureDate.split(" ").slice(0, 2).join(" ")})</Text>
                        </Text>
                        <Text style={styles.routeArrow}>➔</Text>
                        <Text style={[styles.routeLocItem, darkMode && styles.routeLocItemDark]} numberOfLines={1}>
                          🛬 {arrCity} <Text style={styles.routeDateSub}>({chat.arrivalDate.split(" ").slice(0, 2).join(" ")})</Text>
                        </Text>
                      </View>

                      <View style={styles.cardSpecsGroup}>
                        <View style={[styles.weightBadgePill, { backgroundColor: primaryColor + "12" }]}>
                          <Text style={[styles.weightBadgeText, { color: primaryColor }]}>
                            {chat.weight}
                          </Text>
                        </View>
                        <View style={styles.priceBadgePill}>
                          <Text style={styles.priceBadgeText}>
                            {chat.price}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Row 3: Last Message Snippet + Unread Pill */}
                    <View style={styles.messageBottomRow}>
                      <Text
                        style={[
                          styles.lastMessageText,
                          chat.unreadCount > 0 && styles.lastMessageTextUnread,
                          darkMode && styles.lastMessageTextDark,
                        ]}
                        numberOfLines={1}
                      >
                        {chat.lastMessage}
                      </Text>

                      {chat.unreadCount > 0 && (
                        <View style={[styles.unreadCountBadge, { backgroundColor: primaryColor }]}>
                          <Text style={styles.unreadCountText}>{chat.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyContainer, darkMode && styles.emptyContainerDark]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: primaryColor + "15" }]}>
              <MessageSquare size={30} color={primaryColor} />
            </View>
            <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
              {language === "ar" ? "لا توجد محادثات مطابقة" : "Aucune discussion trouvée"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {language === "ar"
                ? "تظهر هنا فقط المحادثات المفتوحة مع الأشخاص الذين تم قبول طلباتهم أو عروضهم."
                : "Seules les personnes ayant une demande ou un vol validé apparaissent dans vos discussions."}
            </Text>
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

  // AppBar
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  appBarDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnDark: { backgroundColor: "#1E293B" },
  appBarTitleCol: { flex: 1 },
  appBarTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  appBarTitle: { fontSize: 18, fontWeight: "900", color: "#0F172A", letterSpacing: -0.3 },
  activeTotalBadge: { paddingHorizontal: 6.5, paddingVertical: 1.5, borderRadius: 10 },
  activeTotalBadgeText: { color: "#FFFFFF", fontSize: 10.5, fontWeight: "800" },
  appBarSubtitle: { fontSize: 11.5, color: "#64748B", fontWeight: "500", marginTop: 1.5 },
  textDark: { color: "#FFFFFF" },

  // Search & Filter
  searchBarWrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchBarWrapperDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchInputContainerDark: { backgroundColor: "#0B1120" },
  searchInput: { flex: 1, fontSize: 13, color: "#0F172A", padding: 0 },
  filterTabsRow: { gap: 6, paddingVertical: 2 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
  },
  filterTabDark: { backgroundColor: "#0B1120" },
  filterTabActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: { fontSize: 11.5, fontWeight: "600", color: "#64748B" },
  filterTabTextActive: { color: "#FFFFFF", fontWeight: "800" },

  // Compact Professional Messenger Cards
  scrollContent: { padding: 12 },
  conversationsList: { gap: 8 },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 11,
  },
  chatCardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  chatCardUnread: { borderColor: "#BFDBFE", backgroundColor: "#F8FAFF" },

  avatarWrapper: { position: "relative" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  onlineBadgeDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  chatContentCol: { flex: 1, minWidth: 0 },

  // Row 1: Header inside card
  chatHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  nameBadgesGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    flex: 1,
    minWidth: 0,
  },
  userName: { fontSize: 13.5, fontWeight: "800", color: "#0F172A", flexShrink: 1 },
  roleBadgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4.5,
    borderWidth: 1,
    flexShrink: 0,
  },
  roleBadgeText: { fontSize: 9, fontWeight: "800" },
  timeText: { fontSize: 10.5, color: "#94A3B8", fontWeight: "500", marginLeft: 6, flexShrink: 0 },

  // Row 2: Route & Specs Group
  routeAndSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginVertical: 2,
  },
  compactRouteRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  compactRouteRowDark: {
    backgroundColor: "#0B1120",
  },
  routeLocItem: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    flexShrink: 1,
  },
  routeLocItemDark: {
    color: "#CBD5E1",
  },
  routeDateSub: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "500",
  },
  routeArrow: {
    fontSize: 9,
    color: "#94A3B8",
    marginHorizontal: 1,
  },
  cardSpecsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  weightBadgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4.5,
  },
  weightBadgeText: { fontSize: 9.5, fontWeight: "800" },
  priceBadgePill: {
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: 4.5,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  priceBadgeText: { fontSize: 9.5, fontWeight: "900", color: "#059669" },

  // Row 3: Last Message
  messageBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  lastMessageText: { fontSize: 11.5, color: "#64748B", flex: 1 },
  lastMessageTextUnread: { color: "#0F172A", fontWeight: "700" },
  lastMessageTextDark: { color: "#94A3B8" },
  unreadCountBadge: {
    paddingHorizontal: 5.5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCountText: { color: "#FFFFFF", fontSize: 9.5, fontWeight: "900" },

  // Empty State
  emptyContainer: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 20,
  },
  emptyContainerDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 15, fontWeight: "900", color: "#0F172A", marginBottom: 3 },
  emptySubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
