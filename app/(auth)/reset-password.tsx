import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import OTPInput from "@/components/OTPInput";
import ScreenContainer from "@/components/ScreenContainer";
import AuthLogoHeader from "@/components/AuthLogoHeader";
import AlertBanner from "@/components/AlertBanner";
import { authApi } from "@/lib/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { language } = useAppStore();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearFieldError = (fieldKey: string) => {
    if (generalError) setGeneralError(null);
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!otp || otp.length < 6) {
      newErrors.otp = t("otpRequired", language);
    }

    if (!newPassword) {
      newErrors.newPassword = t("passwordRequired", language);
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t("passwordTooShort", language);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("confirmPasswordRequired", language);
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatch", language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    setGeneralError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: (email || "").trim(),
        otp: otp.trim(),
        newPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        try {
          router.replace("/login");
        } catch (e) {
          router.replace("/(auth)/login");
        }
      }, 2000);
    } catch (err: any) {
      console.error("Reset password failed:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please verify the code and try again.";
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
        <View style={[styles.iconCircle, isSuccess && styles.iconCircleSuccess]}>
          {isSuccess ? (
            <CheckCircle2 size={36} color="#16A34A" />
          ) : (
            <ShieldCheck size={32} color="#2563EB" />
          )}
        </View>

        <Text style={styles.cardTitle}>
          {t("resetPasswordTitle", language)}
        </Text>
        <Text style={styles.cardSubtitle}>
          {isSuccess
            ? t("passwordResetSuccess", language)
            : t("resetPasswordSubtitle", language)}
        </Text>

        {/* General Error Banner */}
        <AlertBanner
          message={generalError}
          type="error"
          onClose={() => setGeneralError(null)}
        />

        {isSuccess ? (
          <View style={{ width: "100%", marginTop: 8 }}>
            <AlertBanner
              message={t("passwordResetSuccess", language)}
              type="success"
            />
            <Button
              title={t("logIn", language)}
              onPress={() => {
                try {
                  router.replace("/login");
                } catch (e) {
                  router.replace("/(auth)/login");
                }
              }}
              variant="primary"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <>
            {/* 6-Box OTP Input Component */}
        <OTPInput
          value={otp}
          error={errors.otp}
          onChangeText={(val) => {
            setOtp(val);
            clearFieldError("otp");
          }}
        />

        {/* New Password Input */}
        <Input
          icon={Lock}
          placeholder={`${t("newPassword", language)} *`}
          secureTextEntry={!showNewPassword}
          value={newPassword}
          error={errors.newPassword}
          onChangeText={(val) => {
            setNewPassword(val);
            clearFieldError("newPassword");
          }}
          rightElement={
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          }
        />

        {/* Confirm New Password Input */}
        <Input
          icon={Lock}
          placeholder={`${t("confirmNewPassword", language)} *`}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          error={errors.confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            clearFieldError("confirmPassword");
          }}
          rightElement={
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          }
        />

        {/* Submit Button */}
        <Button
          title={t("resetPasswordButton", language)}
          onPress={handleResetPassword}
          loading={loading}
          variant="primary"
          style={{ marginTop: 8 }}
        />
          </>
        )}
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
    paddingVertical: 24,
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
  iconCircleSuccess: {
    backgroundColor: "#DCFCE7",
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
