import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ShieldCheck, XCircle, ArrowRight, Home } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { bookingApi } from "@/lib/api";
import { colors } from "@/lib/theme";

// Intercept browser auth session if active
WebBrowser.maybeCompleteAuthSession();

export default function PayPalReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status?: string;
    bookingId?: string;
    token?: string;
    PayerID?: string;
  }>();

  const darkMode = useAppStore((state) => state.darkMode);
  const language = useAppStore((state) => state.language);
  const primaryColor = useAppStore((state) => state.primaryColor) || colors.primary;

  const isSuccess = params.status === "success";
  const bookingId = params.bookingId;

  const [confirming, setConfirming] = useState(isSuccess && !!bookingId);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Intercept in-app auth browser
    WebBrowser.maybeCompleteAuthSession();

    // Prevent default back hardware button from getting stuck
    const onBackPress = () => {
      handleGoHome();
      return true;
    };
    const backSub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => backSub.remove();
  }, []);

  useEffect(() => {
    let timer: any;

    const finalize = async () => {
      if (isSuccess && bookingId) {
        try {
          await bookingApi.confirmPayment(bookingId);
        } catch (err) {
          console.log("[PayPalReturn] Optional confirm error (might be already confirmed):", err);
        } finally {
          setConfirming(false);
        }
      } else {
        setConfirming(false);
      }
    };

    finalize();

    // Auto-redirect timer for seamless UX
    if (isSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoNavigate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSuccess, bookingId]);

  const handleAutoNavigate = () => {
    if (bookingId) {
      router.replace({
        pathname: "/(app)/booking-details" as any,
        params: { id: bookingId },
      });
    } else {
      router.replace("/(app)/(tabs)/home" as any);
    }
  };

  const handleGoToBooking = () => {
    if (bookingId) {
      router.replace({
        pathname: "/(app)/booking-details" as any,
        params: { id: bookingId },
      });
    } else {
      handleGoHome();
    }
  };

  const handleGoHome = () => {
    router.replace("/(app)/(tabs)/home" as any);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: darkMode ? "#0B1120" : "#F8FAFC" },
      ]}
    >
      <View style={styles.container}>
        {isSuccess ? (
          /* SUCCESS STATE */
          <View
            style={[
              styles.card,
              {
                backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
                borderColor: darkMode ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            {/* Animated / Pill Icon */}
            <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
              <ShieldCheck size={44} color="#059669" />
            </View>

            {/* Escrow Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {language === "ar"
                  ? "🛡️ ضمان الحساب الوسيط (Escrow)"
                  : language === "fr"
                  ? "🛡️ Protection Escrow Garantie"
                  : "🛡️ 100% Escrow Protected"}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={[
                styles.title,
                { color: darkMode ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              {language === "ar"
                ? "تم تأكيد الدفع بنجاح! 🎉"
                : language === "fr"
                ? "Paiement Sécurisé ! 🎉"
                : "Payment Secured! 🎉"}
            </Text>

            {/* Subtitle */}
            <Text
              style={[
                styles.subtitle,
                { color: darkMode ? "#94A3B8" : "#64748B" },
              ]}
            >
              {language === "ar"
                ? "تم حجز المبلغ وتأمينه في حساب الضمان بأمان. تم إشعار المسافر بطلبك وستتم معالجته فوراً."
                : language === "fr"
                ? "Votre paiement est bloqué en toute sécurité dans le compte séquestre SafarLink. Le voyageur a été notifié de votre demande."
                : "Your funds are safely held in SafarLink escrow. The traveler has been notified of your booking request."}
            </Text>

            {confirming && (
              <View style={styles.syncRow}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={styles.syncText}>
                  {language === "ar"
                    ? "جارٍ مزامنة بيانات الحجز..."
                    : language === "fr"
                    ? "Synchronisation de la réservation..."
                    : "Synchronizing booking details..."}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              {bookingId ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                  onPress={handleGoToBooking}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>
                    {language === "ar"
                      ? "عرض تفاصيل الحجز"
                      : language === "fr"
                      ? "Voir ma réservation"
                      : "View Booking Details"}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {
                    borderColor: darkMode ? "#334155" : "#E2E8F0",
                    backgroundColor: darkMode ? "#0F172A" : "#F1F5F9",
                  },
                ]}
                onPress={handleGoHome}
                activeOpacity={0.85}
              >
                <Home size={18} color={darkMode ? "#94A3B8" : "#475569"} />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: darkMode ? "#FFFFFF" : "#334155" },
                  ]}
                >
                  {language === "ar"
                    ? "العودة إلى الرئيسية"
                    : language === "fr"
                    ? "Retour à l'accueil"
                    : "Back to Home"}
                </Text>
              </TouchableOpacity>
            </View>

            {countdown > 0 && (
              <Text style={styles.countdownText}>
                {language === "ar"
                  ? `إعادة التوجيه التلقائي خلال ${countdown} ثوانٍ...`
                  : language === "fr"
                  ? `Redirection automatique dans ${countdown}s...`
                  : `Redirecting automatically in ${countdown}s...`}
              </Text>
            )}
          </View>
        ) : (
          /* CANCELLED STATE */
          <View
            style={[
              styles.card,
              {
                backgroundColor: darkMode ? "#1E293B" : "#FFFFFF",
                borderColor: darkMode ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#FEF2F2" }]}>
              <XCircle size={44} color="#EF4444" />
            </View>

            <Text
              style={[
                styles.title,
                { color: darkMode ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              {language === "ar"
                ? "تم إلغاء عملية الدفع"
                : language === "fr"
                ? "Paiement Annulé"
                : "Payment Cancelled"}
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: darkMode ? "#94A3B8" : "#64748B" },
              ]}
            >
              {language === "ar"
                ? "لقد قمت بإلغاء عملية الدفع عبر PayPal. لم يتم خصم أي مبالغ من حسابك."
                : language === "fr"
                ? "Vous avez annulé la transaction PayPal. Aucun montant n'a été débité de votre compte."
                : "PayPal transaction was cancelled. No funds were debited from your account."}
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryColor }]}
                onPress={handleGoHome}
                activeOpacity={0.85}
              >
                <Home size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  {language === "ar"
                    ? "العودة لتصفح الرحلات"
                    : language === "fr"
                    ? "Retourner aux offres"
                    : "Browse Flights"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeContainer: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  syncText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "800",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  countdownText: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 18,
    textAlign: "center",
  },
});
