import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Star, X, CheckCircle2 } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { reviewApi } from "@/lib/api";
import { colors } from "@/lib/theme";

export interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId?: string;
  proposalId?: string;
  revieweeId?: string;
  targetUserName?: string;
  targetUserAvatar?: string | null;
  onRatingSubmitted?: (stars: number, comment?: string) => void;
}

export default function RatingModal({
  visible,
  onClose,
  bookingId,
  proposalId,
  revieweeId,
  targetUserName = "Membre SafarLink",
  targetUserAvatar,
  onRatingSubmitted,
}: RatingModalProps) {
  const { language, darkMode } = useAppStore();
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const primaryColor = colors.primary || "#00A3E0";

  const getStarLabel = (s: number) => {
    if (language === "ar") {
      switch (s) {
        case 5: return "ممتاز جداً 🌟";
        case 4: return "جيد جداً 👍";
        case 3: return "مقبول 👌";
        case 2: return "ضعيف 👎";
        case 1: return "سيء جداً ⚠️";
        default: return "";
      }
    } else {
      switch (s) {
        case 5: return "Excellent ! 🌟";
        case 4: return "Très bien 👍";
        case 3: return "Correct 👌";
        case 2: return "Passable 👎";
        case 1: return "Médiocre ⚠️";
        default: return "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!stars || stars < 1 || stars > 5) {
      Alert.alert(
        language === "ar" ? "تنبيه" : "Attention",
        language === "ar" ? "يرجى تحديد عدد النجوم (1 إلى 5)" : "Veuillez attribuer entre 1 et 5 étoiles."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await reviewApi.submitReview({
        bookingId,
        proposalId,
        revieweeId,
        stars,
        comment: comment.trim() || undefined,
      });

      if (res.data?.success) {
        setSubmitted(true);
        onRatingSubmitted?.(stars, comment.trim() || undefined);
        setTimeout(() => {
          setSubmitted(false);
          setComment("");
          setStars(5);
          onClose();
        }, 1500);
      } else {
        Alert.alert("Erreur", res.data?.message || "Échec de l'envoi de l'évaluation");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de l'envoi de l'avis";
      Alert.alert(language === "ar" ? "خطأ" : "Erreur", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <View style={[styles.modalCard, darkMode && styles.modalCardDark]}>
              {/* Header Close */}
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, darkMode && styles.closeBtnDark]}
                disabled={submitting}
              >
                <X size={18} color={darkMode ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>

              {submitted ? (
                <View style={styles.successContainer}>
                  <CheckCircle2 size={54} color="#10B981" />
                  <Text style={[styles.successTitle, darkMode && styles.textDark]}>
                    {language === "ar" ? "شكراً لك على تقييمك!" : "Merci pour votre avis !"}
                  </Text>
                  <Text style={styles.successSubtitle}>
                    {language === "ar"
                      ? "تم تحديث سمعة المستخدم بنجاح."
                      : "La réputation du membre a été mise à jour."}
                  </Text>
                </View>
              ) : (
                <>
                  {/* User Avatar & Title */}
                  <View style={styles.userSection}>
                    {targetUserAvatar ? (
                      <Image source={{ uri: targetUserAvatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: primaryColor + "20" }]}>
                        <Text style={[styles.avatarInitial, { color: primaryColor }]}>
                          {targetUserName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.title, darkMode && styles.textDark]}>
                      {language === "ar" ? `تقييم ${targetUserName}` : `Évaluez ${targetUserName}`}
                    </Text>
                    <Text style={styles.subtitle}>
                      {language === "ar"
                        ? "كيف كانت تجربتك في هذه الصفقة؟"
                        : "Comment s'est passée votre transaction ?"}
                    </Text>
                  </View>

                  {/* Stars Rating Selector */}
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => {
                      const filled = s <= stars;
                      return (
                        <TouchableOpacity
                          key={s}
                          activeOpacity={0.7}
                          onPress={() => setStars(s)}
                          style={styles.starBtn}
                        >
                          <Star
                            size={38}
                            color={filled ? "#F59E0B" : "#CBD5E1"}
                            fill={filled ? "#F59E0B" : "transparent"}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.starLabelText}>{getStarLabel(stars)}</Text>

                  {/* Optional Comment */}
                  <View style={styles.commentBox}>
                    <Text style={[styles.commentLabel, darkMode && styles.textDark]}>
                      {language === "ar" ? "تعليقك (اختياري)" : "Votre commentaire (optionnel)"}
                    </Text>
                    <TextInput
                      style={[styles.input, darkMode && styles.inputDark]}
                      multiline
                      numberOfLines={3}
                      placeholder={
                        language === "ar"
                          ? "شارك انطباعك عن دقة المواعيد وسرعة التوصيل..."
                          : "Partagez votre expérience (ponctualité, soin du colis...)"
                      }
                      placeholderTextColor="#94A3B8"
                      value={comment}
                      onChangeText={setComment}
                      maxLength={300}
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: primaryColor }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>
                        {language === "ar" ? "تأكيد وإرسال التقييم ⭐" : "Envoyer l'évaluation ⭐"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: {
    width: "100%",
    maxWidth: 380,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalCardDark: {
    backgroundColor: "#1E293B",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnDark: {
    backgroundColor: "#334155",
  },
  userSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: "700",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  starBtn: {
    padding: 4,
  },
  starLabelText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#D97706",
    marginBottom: 16,
  },
  commentBox: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 70,
    textAlignVertical: "top",
    backgroundColor: "#F8FAFC",
  },
  inputDark: {
    borderColor: "#475569",
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 14,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  textDark: {
    color: "#F8FAFC",
  },
});
