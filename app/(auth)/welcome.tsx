import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import Button from "@/components/Button";
import ScreenContainer from "@/components/ScreenContainer";

export default function WelcomeScreen() {
  const router = useRouter();
  const { language } = useAppStore();

  return (
    <ScreenContainer>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../public/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {t("appName", language)}
          </Text>
          <Text style={styles.subtitle}>
            {t("signUpSubtitle", language)}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={t("logIn", language)}
            onPress={() => router.push("/(auth)/login")}
            variant="primary"
          />

          <Button
            title={t("signUp", language)}
            onPress={() => router.push("/(auth)/register")}
            variant="secondary"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 14,
  },
});
