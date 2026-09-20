import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t, Language } from "@/lib/i18n";
import {
  ArrowLeft,
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  FileText,
  HelpCircle,
  LogOut,
  Check,
} from "lucide-react-native";
import { authApi, getRefreshToken, clearAuthTokens } from "@/lib/api";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { unregisterPushNotificationAsync } from "@/lib/notifications";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, darkMode, setDarkMode, logout } = useAppStore();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 24 : 16);

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await unregisterPushNotificationAsync().catch(() => {});
      const refreshToken = await getRefreshToken();
      await authApi.logout(refreshToken || undefined);
    } catch (e) {
      console.error("Backend logout error:", e);
    } finally {
      await clearAuthTokens();
      logout();
      setShowLogoutModal(false);
      setLogoutLoading(false);
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, darkMode && styles.backBtnDark]}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={19} color={darkMode ? "#FFFFFF" : "#0F172A"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
          {t("settingsTitle", language)}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 + bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Language Selection Card */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Globe size={20} color="#2563EB" />
            <Text style={[styles.cardTitle, darkMode && styles.textDark]}>
              {t("language", language)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setLanguage("en")}
            activeOpacity={0.7}
          >
            <Text style={styles.flagText}>🇺🇸 / 🇬🇧</Text>
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {t("english", language)}
            </Text>
            {language === "en" && <Check size={18} color="#2563EB" style={{ marginLeft: "auto" }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setLanguage("fr")}
            activeOpacity={0.7}
          >
            <Text style={styles.flagText}>🇫🇷</Text>
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {t("french", language)}
            </Text>
            {language === "fr" && <Check size={18} color="#2563EB" style={{ marginLeft: "auto" }} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setLanguage("ar")}
            activeOpacity={0.7}
          >
            <Text style={styles.flagText}>🇸🇦 / 🇹🇳</Text>
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {t("arabic", language)}
            </Text>
            {language === "ar" && <Check size={18} color="#2563EB" style={{ marginLeft: "auto" }} />}
          </TouchableOpacity>
        </View>

        {/* Appearance / Theme Toggle Card */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            {darkMode ? <Moon size={20} color="#A855F7" /> : <Sun size={20} color="#F59E0B" />}
            <Text style={[styles.cardTitle, darkMode && styles.textDark]}>
              {t("appearance", language)}
            </Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {darkMode ? t("themeDark", language) : t("themeLight", language)}
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* App Information & Legal */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <ShieldCheck size={20} color="#059669" />
            <Text style={[styles.cardTitle, darkMode && styles.textDark]}>
              {t("appName", language)} Info
            </Text>
          </View>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              Alert.alert(t("termsOfService", language), "SafarLink Terms of Service (v1.0)")
            }
          >
            <FileText size={18} color="#6B7280" />
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {t("termsOfService", language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              Alert.alert(t("privacyPolicy", language), "SafarLink Privacy Policy & Data Protection")
            }
          >
            <ShieldCheck size={18} color="#6B7280" />
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {t("privacyPolicy", language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() =>
              Alert.alert(t("helpCenter", language), "Contact Support: support@safarlink.com")
            }
          >
            <HelpCircle size={18} color="#6B7280" />
            <Text style={[styles.optionLabel, darkMode && styles.textDark]}>
              {t("helpCenter", language)}
            </Text>
          </TouchableOpacity>

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>{t("appVersion", language)}</Text>
          </View>
        </View>

        {/* Sign Out Action Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#DC2626" />
          <Text style={styles.signOutBtnText}>{t("signOut", language)}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        visible={showLogoutModal}
        loading={logoutLoading}
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  safeAreaDark: {
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerDark: {
    backgroundColor: "#151E2E",
    borderBottomColor: "#1E293B",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnDark: {
    backgroundColor: "#1E293B",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  textDark: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "#1F2937",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  flagText: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  versionRow: {
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
  },
  versionText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
  },
  signOutBtnText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
  },
});
