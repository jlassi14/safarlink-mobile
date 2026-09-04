import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { Globe, ChevronDown, Check } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t, Language } from "@/lib/i18n";
import BottomSheetModal from "./BottomSheetModal";

export interface ScreenContainerProps {
  children: React.ReactNode;
  showLanguageSwitcher?: boolean;
  scrollable?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  showLanguageSwitcher = true,
  scrollable = false,
}) => {
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useAppStore();
  const isArabic = language === "ar";
  I18nManager.forceRTL(isArabic);

  const [showLangModal, setShowLangModal] = useState(false);

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 8;
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "ios" ? 34 : 16) + 16;

  const renderLanguageSwitcher = () => (
    showLanguageSwitcher ? (
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.langPill}
          onPress={() => setShowLangModal(true)}
          activeOpacity={0.7}
        >
          <Globe size={16} color="#FFFFFF" />
          <Text style={styles.langPillText}>
            {language === "en" ? "EN" : language === "fr" ? "FR" : "AR"}
          </Text>
          <ChevronDown size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    ) : null
  );

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#F78022" stopOpacity="1" />
            <Stop offset="55%" stopColor="#2E86DE" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00A3E0" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" />
      </Svg>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.mainWrapper, { paddingTop: topPadding }]}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottomPadding },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderLanguageSwitcher()}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.nonScrollContent, { paddingBottom: bottomPadding }]}>
            {renderLanguageSwitcher()}
            <View style={styles.centerBox}>
              {children}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Language Selection Modal */}
      <BottomSheetModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
        animationType="fade"
      >
        <Text style={styles.modalTitle}>
          {t("selectLanguage", language)}
        </Text>

        <TouchableOpacity
          style={styles.langOptionRow}
          onPress={() => {
            setLanguage("en");
            setShowLangModal(false);
          }}
        >
          <Text style={styles.langFlagText}>🇺🇸 / 🇬🇧</Text>
          <Text style={styles.langOptionText}>{t("english", language)}</Text>
          {language === "en" && (
            <Check size={18} color="#2563EB" style={{ marginLeft: "auto" }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.langOptionRow}
          onPress={() => {
            setLanguage("fr");
            setShowLangModal(false);
          }}
        >
          <Text style={styles.langFlagText}>🇫🇷</Text>
          <Text style={styles.langOptionText}>{t("french", language)}</Text>
          {language === "fr" && (
            <Check size={18} color="#2563EB" style={{ marginLeft: "auto" }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.langOptionRow}
          onPress={() => {
            setLanguage("ar");
            setShowLangModal(false);
          }}
        >
          <Text style={styles.langFlagText}>🇸🇦 / 🇹🇳</Text>
          <Text style={styles.langOptionText}>{t("arabic", language)}</Text>
          {language === "ar" && (
            <Check size={18} color="#2563EB" style={{ marginLeft: "auto" }} />
          )}
        </TouchableOpacity>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  langPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  langFlagText: {
    fontSize: 18,
    marginRight: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  langOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  langOptionText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
});

export default ScreenContainer;
