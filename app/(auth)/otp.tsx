import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ShieldCheck, Mail, Phone } from "lucide-react-native";
import Button from "@/components/Button";
import OTPInput from "@/components/OTPInput";
import ScreenContainer from "@/components/ScreenContainer";
import AlertBanner from "@/components/AlertBanner";
import { authApi, setAuthTokens } from "@/lib/api";

export default function OTPScreen() {
  const router = useRouter();
  const { language, user, updateUser } = useAppStore();

  const isEmailPending = user?.isEmailVerified === false;
  const isPhonePending = user?.isPhoneVerified === false;

  const [verifyType, setVerifyType] = useState<"email" | "phone">(
    isEmailPending ? "email" : "phone"
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOTP = async () => {
    setGeneralError(null);
    setFeedbackSuccess(null);

    if (!otp || otp.length < 6) {
      setError(t("otpRequired", language));
      return;
    }

    setError("");
    setLoading(true);
    try {
      const apiVerifyType = verifyType === "email" ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";
      const response = await authApi.verifyOtp({
        email: user?.email,
        phone: user?.phone,
        code: otp.trim(),
        type: apiVerifyType,
      });

      if (response.data?.success && response.data.data) {
        const { user: updatedUser, tokens, requiresOtp } = response.data.data;
        if (tokens) {
          await setAuthTokens(tokens.accessToken, tokens.refreshToken);
        }
        updateUser(updatedUser);

        if (verifyType === "email" && !updatedUser.isPhoneVerified) {
          setVerifyType("phone");
          setOtp("");
          setTimer(60);
          setCanResend(false);
          setFeedbackSuccess(
            language === "ar"
              ? "تم التحقق من البريد بنجاح! يرجى تأكيد رقم الهاتف."
              : language === "fr"
              ? "E-mail vérifié avec succès ! Veuillez vérifier votre numéro."
              : "Email verified successfully! Please verify your phone number."
          );
          return;
        }

        if (updatedUser.isVerified || (!requiresOtp && updatedUser.isEmailVerified && updatedUser.isPhoneVerified)) {
          router.replace("/(app)/(tabs)/home");
        } else if (!updatedUser.isPhoneVerified) {
          setVerifyType("phone");
          setOtp("");
          setTimer(60);
          setCanResend(false);
        } else {
          router.replace("/(app)/(tabs)/home");
        }
      } else {
        const err = response.data?.error || t("otpRequired", language);
        setError(err);
        setGeneralError(err);
      }
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Verification failed. Please check the code.";
      setError(errorMsg);
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setCanResend(false);
    setError("");
    setGeneralError(null);
    setFeedbackSuccess(null);
    try {
      const apiVerifyType = verifyType === "email" ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";
      const response = await authApi.resendOtp({
        email: user?.email,
        phone: user?.phone,
        type: apiVerifyType,
      });
      if (response.data?.success) {
        setFeedbackSuccess(t("codeResentSuccess", language));
      }
    } catch (err: any) {
      console.error("Resend OTP failed:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to resend verification code.";
      setGeneralError(errorMsg);
    }
  };

  return (
    <ScreenContainer showLanguageSwitcher={false}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          {verifyType === "email" ? (
            <Mail size={32} color="#2563EB" />
          ) : (
            <Phone size={32} color="#2563EB" />
          )}
        </View>

        <Text style={styles.title}>
          {verifyType === "email"
            ? `${t("verifyOtpTitle", language)} (Email)`
            : `${t("verifyOtpTitle", language)} (Phone)`}
        </Text>
        <Text style={styles.subtitle}>
          {verifyType === "email"
            ? t("emailOtpNotice", language)
            : t("phoneOtpNotice", language)}
        </Text>

        {/* Target address badge */}
        <View style={styles.targetBadge}>
          <Text style={styles.targetText}>
            {verifyType === "email"
              ? user?.email || "user@safarlink.com"
              : user?.phone || "+974 5512 3456"}
          </Text>
        </View>

        {/* Feedback / Error Banners */}
        <AlertBanner
          message={generalError}
          type="error"
          onClose={() => setGeneralError(null)}
        />
        <AlertBanner
          message={feedbackSuccess}
          type="success"
          onClose={() => setFeedbackSuccess(null)}
        />

        {/* 6-Box OTP Input Component */}
        <OTPInput
          value={otp}
          error={error}
          onChangeText={(val) => {
            setOtp(val);
            if (error) setError("");
            if (generalError) setGeneralError(null);
          }}
        />

        {/* Submit Action Button */}
        <Button
          title={t("verifyProceed", language)}
          onPress={handleVerifyOTP}
          loading={loading}
          variant="primary"
          style={styles.verifyBtn}
        />

        {/* Resend Code Section with 60s Timer */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{t("didntReceiveCode", language)}</Text>
          <TouchableOpacity disabled={!canResend} onPress={handleResend}>
            <Text style={[styles.resendLink, !canResend && styles.resendDisabled]}>
              {t("resendCode", language)} {!canResend ? `(${timer}s)` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  targetBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 18,
  },
  targetText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  verifyBtn: {
    width: "100%",
    marginTop: 18,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 4,
  },
  resendText: {
    color: "#6B7280",
    fontSize: 14,
  },
  resendLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  resendDisabled: {
    color: "#9CA3AF",
  },
});
