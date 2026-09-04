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
import Svg, { Path } from "react-native-svg";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ScreenContainer from "@/components/ScreenContainer";
import AuthLogoHeader from "@/components/AuthLogoHeader";
import AlertBanner from "@/components/AlertBanner";
import { authApi, setAuthTokens } from "@/lib/api";

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

export default function LoginScreen() {
  const router = useRouter();
  const { language, setUser } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

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

    if (!email.trim()) {
      newErrors.email = t("emailRequired", language);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("invalidEmail", language);
    }

    if (!password) {
      newErrors.password = t("passwordRequired", language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setGeneralError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      if (response.data?.success && response.data.data) {
        const { user: backendUser, tokens, requiresOtp } = response.data.data;
        if (tokens) {
          await setAuthTokens(tokens.accessToken, tokens.refreshToken);
        }
        setUser(backendUser);

        if (requiresOtp || !backendUser.isEmailVerified || !backendUser.isPhoneVerified) {
          router.push("/(auth)/otp");
        } else {
          router.replace("/(app)/(tabs)/home");
        }
      } else {
        setGeneralError(response.data?.error || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    try {
      router.push("/forgot-password");
    } catch (e) {
      router.push("/(auth)/forgot-password");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUser({
        id: "google_123",
        name: "Google User",
        email: "user@gmail.com",
        countryCode: "+974",
      });
      router.replace("/(app)/(tabs)/home");
    } catch (error) {
      console.error("Google login failed:", error);
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
        <Text style={styles.cardTitle}>
          {t("loginTitle", language)}
        </Text>
        <Text style={styles.cardSubtitle}>
          {t("loginSubtitle", language)}
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
          error={errors.email}
          onChangeText={(val) => {
            setEmail(val);
            clearFieldError("email");
          }}
        />

        {/* Password Input Component */}
        <Input
          icon={Lock}
          placeholder={`${t("password", language)} *`}
          secureTextEntry={!showPassword}
          value={password}
          error={errors.password}
          onChangeText={(val) => {
            setPassword(val);
            clearFieldError("password");
          }}
          rightElement={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          }
        />

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotPasswordText}>
            {t("forgotPassword", language)}
          </Text>
        </TouchableOpacity>

        {/* Log In Button Component */}
        <Button
          title={t("logIn", language)}
          onPress={handleLogin}
          loading={loading}
          variant="primary"
        />

        {/* Or Divider */}
        <View style={styles.orDividerRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>{t("or", language)}</Text>
          <View style={styles.orLine} />
        </View>

        {/* Google Sign In Button Component */}
        {/* <Button
          title={t("continueWithGoogle", language)}
          onPress={handleGoogleLogin}
          variant="secondary"
          icon={<GoogleIcon />}
        /> */}
      </View>

      {/* Footer Navigation Link */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {t("dontHaveAccount", language)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            try {
              router.push("/register");
            } catch (e) {
              router.push("/(auth)/register");
            }
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.footerLinkText}>
            {t("signUp", language)}
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
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  orDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  orText: {
    marginHorizontal: 12,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  footerLinkText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
