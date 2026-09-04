import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Plane,
  Package,
  CheckCircle2,
  Calendar,
  Clock,
  Lock,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { MOCK_ACCEPTED_CHATS, ChatConversationItem, ChatMessage } from "@/lib/mockData";

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const primaryColor = colors.primary || "#2563EB";
  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 20) + 4;
  const scrollViewRef = useRef<ScrollView>(null);

  // Find target conversation or fallback to first accepted conversation
  const currentChat: ChatConversationItem =
    MOCK_ACCEPTED_CHATS.find((c) => c.id === id || String(c.id).includes(String(id))) ||
    MOCK_ACCEPTED_CHATS[0];

  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    currentChat.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      text:
        language === "ar"
          ? m.textAr || m.textEn || ""
          : language === "fr"
          ? m.textFr || m.textEn || ""
          : m.textEn || "",
      time: m.time,
    }))
  );

  const isTraveler = currentChat.role === "traveler";

  const getRoleLabel = () => {
    if (language === "ar") return currentChat.roleLabelAr;
    if (language === "fr") return currentChat.roleLabelFr;
    return currentChat.roleLabelEn;
  };

  const handleSend = () => {
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: "m_" + Date.now(),
      sender: "me",
      textEn: inputMsg.trim(),
      textFr: inputMsg.trim(),
      textAr: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg("");

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderLocationCol = (
    loc: string,
    date: string,
    time: string | undefined,
    isDestination: boolean = false
  ) => {
    if (!loc) return null;
    const parts = loc.split(" - ");
    const country = parts.length >= 2 ? parts[0].trim() : "";
    const city = parts.length >= 2 ? parts.slice(1).join(" - ").trim() : loc;

    return (
      <View style={[styles.routeLocCol, isDestination && styles.alignRight]}>
        <Text
          style={[styles.routeCityText, isDestination && styles.textRight, darkMode && styles.textDark]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {city}
        </Text>
        {country ? (
          <Text
            style={[styles.routeCountryText, isDestination && styles.textRight]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {country}
          </Text>
        ) : null}

        {/* Departure / Arrival Date & Time Under City */}
        <View style={[styles.routeDateBox, isDestination && styles.alignRight]}>
          <Text style={styles.routeDateEmojiText}>
            {isDestination ? "🛬 " : "🛫 "}
            <Text style={[styles.routeDateText, darkMode && styles.routeDateTextDark]}>{date}</Text>
          </Text>
          {time ? (
            <Text style={[styles.routeTimeText, isDestination && styles.textRight]}>
              {time}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* ── APPBAR (HEADER) ── */}
      <View style={[styles.header, darkMode && styles.headerDark, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, darkMode && styles.backBtnDark]}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={19} color={darkMode ? "#FFFFFF" : "#0F172A"} />
        </TouchableOpacity>

        {/* Contact Info Header */}
        <View style={styles.headerProfile}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: currentChat.avatar }} style={styles.avatar} />
            {currentChat.isOnline && <View style={styles.onlineBadgeDot} />}
          </View>

          <View style={styles.profileTextCol}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, darkMode && styles.textDark]} numberOfLines={1}>
                {currentChat.name}
              </Text>
              <ShieldCheck size={13} color="#2563EB" />
            </View>

            <View style={styles.roleSubRow}>
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
                  {getRoleLabel()}
                </Text>
              </View>
              <Text style={styles.onlineText}>
                {currentChat.isOnline
                  ? language === "ar"
                    ? "متصل الآن"
                    : "En ligne"
                  : language === "ar"
                  ? "غير متصل"
                  : "Hors ligne"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* ── TRANSACTION CONTEXT BANNER: SYMMETRICAL ROUTE & DATES UNDERNEATH ── */}
      <View style={[styles.contextBanner, darkMode && styles.contextBannerDark]}>
        {/* Top Mini Row: Weight + Price + Validated Status Badge */}
        <View style={styles.contextTopRow}>
          <View style={styles.specBadgesRow}>
            <View style={[styles.weightBadge, { backgroundColor: primaryColor + "15" }]}>
              <Package size={12} color={primaryColor} />
              <Text style={[styles.weightBadgeText, { color: primaryColor }]}>
                {currentChat.weight}
              </Text>
            </View>

            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                {currentChat.price}
              </Text>
            </View>
          </View>

          <View style={styles.contextAcceptedBadge}>
            <CheckCircle2 size={11} color="#059669" />
            <Text style={styles.contextAcceptedText}>
              {language === "ar" ? "معاملة مقبولة" : "Validé & Confirmé"}
            </Text>
          </View>
        </View>

        {/* Symmetrical Flight Corridor with Dates Under Depart & Arrive */}
        <View style={[styles.routeTimelineCard, darkMode && styles.routeTimelineCardDark]}>
          {renderLocationCol(
            currentChat.from,
            currentChat.departureDate,
            currentChat.departureTime,
            false
          )}

          <View style={styles.routeTrackCenter}>
            <View style={styles.routeTrackLine} />
            <View style={[styles.planeIconCircle, { backgroundColor: primaryColor }]}>
              <Plane size={11} color="#FFFFFF" />
            </View>
          </View>

          {renderLocationCol(
            currentChat.to,
            currentChat.arrivalDate,
            currentChat.arrivalTime,
            true
          )}
        </View>
      </View>

      {/* ── MESSAGES CHAT AREA ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Security Notice */}
          <View style={[styles.securityNoticeBox, darkMode && styles.securityNoticeBoxDark]}>
            <ShieldCheck size={13} color="#2563EB" />
            <Text style={[styles.securityNoticeText, darkMode && styles.securityNoticeTextDark]}>
              {language === "ar"
                ? "محادثة مشفرة ومخصصة لتنسيق تسليم الشحنة بأمان."
                : "Discussion sécurisée pour convenir du lieu et de l'heure de remise."}
            </Text>
          </View>

          {messages.map((msg, index) => {
            const isMe = msg.sender === "me";
            const textContent =
              language === "ar"
                ? msg.textAr || msg.textEn || msg.text || ""
                : language === "fr"
                ? msg.textFr || msg.textEn || msg.text || ""
                : msg.textEn || msg.text || "";

            return (
              <View
                key={msg.id || index}
                style={[
                  styles.messageWrapper,
                  isMe ? styles.myMsgWrapper : styles.theirMsgWrapper,
                ]}
              >
                {!isMe && (
                  <Image source={{ uri: currentChat.avatar }} style={styles.msgAvatar} />
                )}
                <View
                  style={[
                    styles.msgBubble,
                    isMe
                      ? [styles.myBubble, { backgroundColor: primaryColor }]
                      : [styles.theirBubble, darkMode && styles.theirBubbleDark],
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isMe ? styles.myMsgText : darkMode ? styles.textDark : styles.theirMsgText,
                    ]}
                  >
                    {textContent}
                  </Text>
                  <Text
                    style={[
                      styles.msgTime,
                      isMe ? styles.myMsgTime : styles.theirMsgTime,
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View
          style={[
            styles.inputBar,
            darkMode && styles.inputBarDark,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              darkMode && styles.textInputDark,
              { textAlign: language === "ar" ? "right" : "left" },
            ]}
            value={inputMsg}
            onChangeText={setInputMsg}
            placeholder={
              language === "ar"
                ? "اكتب رسالتك هنا للتنسيق..."
                : language === "fr"
                ? "Écrivez votre message de coordination..."
                : "Type your coordination message..."
            }
            placeholderTextColor="#94A3B8"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: primaryColor },
              !inputMsg.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputMsg.trim()}
            activeOpacity={0.85}
          >
            <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  safeAreaDark: { backgroundColor: "#0B1120" },

  // AppBar
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
  },
  headerDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnDark: { backgroundColor: "#1E293B" },
  headerProfile: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  profileTextCol: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  userName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  roleSubRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1.5 },
  roleBadgePill: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, borderWidth: 1 },
  roleBadgeText: { fontSize: 9.5, fontWeight: "800" },
  onlineText: { fontSize: 10, color: "#64748B", fontWeight: "500" },
  textDark: { color: "#FFFFFF" },

  // Context Banner
  contextBanner: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  contextBannerDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  contextTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  specBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  weightBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#059669",
  },
  contextAcceptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  contextAcceptedText: { fontSize: 10, fontWeight: "800", color: "#059669" },

  // Symmetrical Corridor inside Context Banner
  routeTimelineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  routeTimelineCardDark: {
    backgroundColor: "#0B1120",
    borderColor: "#1E293B",
  },
  routeLocCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  routeCityText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  routeCountryText: {
    fontSize: 10.5,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 0.5,
  },
  textRight: {
    textAlign: "right",
  },
  routeDateBox: {
    marginTop: 3,
  },
  routeDateEmojiText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
  },
  routeDateText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },
  routeDateTextDark: {
    color: "#E2E8F0",
  },
  routeTimeText: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 0.5,
  },
  routeTrackCenter: {
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginHorizontal: 6,
  },
  routeTrackLine: {
    position: "absolute",
    height: 1.5,
    left: 0,
    right: 0,
    backgroundColor: "#CBD5E1",
  },
  planeIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  // Messages Area
  messagesContainer: { padding: 14, gap: 12 },
  securityNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 4,
  },
  securityNoticeBoxDark: { backgroundColor: "#0B1120" },
  securityNoticeText: { fontSize: 10.5, color: "#2563EB", fontWeight: "600" },
  securityNoticeTextDark: { color: "#93C5FD" },

  messageWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 2 },
  myMsgWrapper: { justifyContent: "flex-end" },
  theirMsgWrapper: { justifyContent: "flex-start" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },
  msgBubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  myBubble: {
    borderBottomRightRadius: 3,
  },
  theirBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  theirBubbleDark: {
    backgroundColor: "#151E2E",
    borderColor: "#1E293B",
  },
  msgText: { fontSize: 13, lineHeight: 18 },
  myMsgText: { color: "#FFFFFF", fontWeight: "500" },
  theirMsgText: { color: "#0F172A", fontWeight: "500" },
  msgTime: { fontSize: 9.5, alignSelf: "flex-end", marginTop: 3 },
  myMsgTime: { color: "rgba(255, 255, 255, 0.75)" },
  theirMsgTime: { color: "#94A3B8" },

  // Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  inputBarDark: { backgroundColor: "#151E2E", borderTopColor: "#1E293B" },
  textInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: "#0F172A",
    maxHeight: 90,
  },
  textInputDark: { backgroundColor: "#0B1120", color: "#FFFFFF" },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
