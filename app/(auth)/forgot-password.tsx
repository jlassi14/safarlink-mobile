import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Mail, KeyRound, ArrowLeft } from "lucide-react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ScreenContainer from "@/components/ScreenContainer";
import AuthLogoHeader from "@/components/AuthLogoHeader";
import AlertBanner from "@/components/AlertBanner";
import { authApi } from "@/lib/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { language } = useAppStore();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setFieldError(t("emailRequired", language));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError(t("invalidEmail", language));
      return false;
    }
    setFieldError("");
    return true;
  };

  const handleSendCode = async () => {
    setGeneralError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email: email.trim() },
      });
    } catch (err: any) {
      console.error("Send reset code error:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to send reset code. Please try again.";
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Unified Auth Logo Header */}
      <AuthLogoHeader />

      {/* Form Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <KeyRound size={32} color="#2563EB" />
        </View>

        <Text style={styles.cardTitle}>
          {t("forgotPasswordTitle", language)}
        </Text>
        <Text style={styles.cardSubtitle}>
          {t("forgotPasswordSubtitle", language)}
        </Text>

        {/* General Error Banner */}
        <AlertBanner
          message={generalError}
          type="error"
          onClose={() => setGeneralError(null)}
        />

        {/* Email Input Component */}
        <Input
          icon={Mail}
          placeholder={`${t("emailAddress", language)} *`}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          error={fieldError}
          onChangeText={(val) => {
            setEmail(val);
            if (fieldError) setFieldError("");
            if (generalError) setGeneralError(null);
          }}
        />

        {/* Submit Button Component */}
        <Button
          title={t("sendResetCode", language)}
          onPress={handleSendCode}
          loading={loading}
          variant="primary"
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Back to Login Link */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color="#FFFFFF" />
          <Text style={styles.footerLinkText}>
            {t("backToLogin", language)}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: 10,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLinkText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
