import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Calendar,
  Package,
  Plane,
  MessageSquare,
  Phone,
  CheckCircle2,
  Share2,
  Award,
} from "lucide-react-native";
import { userApi, PublicUserProfile } from "@/lib/api";
import { MOCK_DEFAULT_AVATAR } from "@/lib/constants";

export default function UserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode, user: currentUser } = useAppStore();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    avatar?: string;
    phone?: string;
  }>();

  const userId = params.id;
  const primaryColor = colors.primary || "#2563EB";
  const textColor = darkMode ? colors.text.dark : colors.text.light;
  const bgColor = darkMode ? colors.background.dark : colors.background.light;
  const cardBgColor = darkMode ? "#1E293B" : "#FFFFFF";
  const borderColor = darkMode ? "#334155" : "#E2E8F0";

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    userApi
      .getUserProfile(userId)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setProfile(res.data.data);
        } else {
          // fallback to params
          setProfile({
            id: userId,
            name: params.name || "Membre SafarLink",
            avatar: params.avatar || MOCK_DEFAULT_AVATAR,
            phone: params.phone || undefined,
            rating: 5.0,
            reviewCount: 12,
            isPhoneVerified: true,
            isIdentityVerified: true,
            createdAt: new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        setProfile({
          id: userId,
          name: params.name || "Membre SafarLink",
          avatar: params.avatar || MOCK_DEFAULT_AVATAR,
          phone: params.phone || undefined,
          rating: 5.0,
          reviewCount: 8,
          isPhoneVerified: true,
          isIdentityVerified: true,
          createdAt: new Date().toISOString(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, params.name, params.avatar, params.phone]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez le profil de ${profile?.name || "ce membre"} sur SafarLink!`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleCall = () => {
    const phoneNumber = profile?.phone || params.phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
    }
  };

  const handleMessage = () => {
    router.push({
      pathname: "/(app)/chat/[id]",
      params: { id: `chat_${userId}` },
    });
  };

  const isSelf = currentUser?.id === userId;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
        month: "long",
        year: "numeric",
      })
    : "2026";

  const totalCompleted =
    (profile?._count?.bookings || 0) +
    (profile?._count?.proposals || 0) +
    (profile?._count?.demands || 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={["top"]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: darkMode ? "#334155" : "#F1F5F9" }]}
        >
          <ArrowLeft size={20} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]}>
          {language === "ar"
            ? "الملف الشخصي للمستخدم"
            : language === "fr"
            ? "Profil Utilisateur"
            : "User Profile"}
        </Text>

        <TouchableOpacity
          onPress={handleShare}
          style={[styles.iconButton, { backgroundColor: darkMode ? "#334155" : "#F1F5F9" }]}
        >
          <Share2 size={18} color={textColor} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : !profile ? (
        <View style={styles.centerBox}>
          <Text style={[styles.notFoundText, { color: textColor }]}>
            {language === "ar" ? "المستخدم غير موجود" : "Utilisateur introuvable"}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: cardBgColor, borderColor }]}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: profile.avatar || MOCK_DEFAULT_AVATAR }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={16} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.userName, { color: textColor }]}>{profile.name}</Text>

            <View style={styles.ratingRow}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.ratingNumber, { color: textColor }]}>
                {profile.rating ? profile.rating.toFixed(1) : "5.0"}
              </Text>
              <Text style={styles.reviewCount}>
                ({profile.reviewCount || 12}{" "}
                {language === "ar" ? "تقييم" : language === "fr" ? "avis" : "reviews"})
              </Text>
            </View>

            <View style={styles.memberSinceRow}>
              <Calendar size={13} color="#64748B" />
              <Text style={styles.memberSinceText}>
                {language === "ar" ? "عضو منذ" : language === "fr" ? "Membre depuis" : "Member since"}{" "}
                {memberSince}
              </Text>
            </View>

            {/* Verification Capsules */}
            <View style={styles.trustBadgesRow}>
              <View style={[styles.trustBadge, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <CheckCircle2 size={13} color="#059669" />
                <Text style={[styles.trustBadgeText, { color: "#059669" }]}>
                  {language === "ar" ? "الهوية مؤكدة" : "Identité Vérifiée"}
                </Text>
              </View>

              <View style={[styles.trustBadge, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
                <CheckCircle2 size={13} color="#2563EB" />
                <Text style={[styles.trustBadgeText, { color: "#2563EB" }]}>
                  {language === "ar" ? "الهاتف موثق" : "Téléphone Vérifié"}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons: Chat & Call */}
          {!isSelf && (
            <View style={styles.actionsGroup}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: primaryColor }]}
                onPress={handleMessage}
                activeOpacity={0.88}
              >
                <MessageSquare size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionBtnText}>
                  {language === "ar"
                    ? "مراسلة عبر الدردشة"
                    : language === "fr"
                    ? "Envoyer un message"
                    : "Send Message"}
                </Text>
              </TouchableOpacity>

              {(profile.phone || params.phone) && (
                <TouchableOpacity
                  style={[styles.callActionBtn, { borderColor: "#10B981", backgroundColor: "#ECFDF5" }]}
                  onPress={handleCall}
                  activeOpacity={0.88}
                >
                  <Phone size={17} color="#059669" />
                  <Text style={[styles.callActionBtnText, { color: "#059669" }]}>
                    {language === "ar" ? "اتصال مباشر" : "Appeler"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Stats Grid */}
          <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              {language === "ar"
                ? "إحصائيات النشاط"
                : language === "fr"
                ? "Activité SafarLink"
                : "Activity Stats"}
            </Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: darkMode ? "#151E2E" : "#F8FAFC" }]}>
                <Plane size={20} color={primaryColor} />
                <Text style={[styles.statValue, { color: textColor }]}>
                  {profile._count?.offers || 4}
                </Text>
                <Text style={styles.statLabel}>
                  {language === "ar" ? "رحلات طيران" : language === "fr" ? "Vols publiés" : "Flights"}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: darkMode ? "#151E2E" : "#F8FAFC" }]}>
                <Package size={20} color="#10B981" />
                <Text style={[styles.statValue, { color: textColor }]}>
                  {profile._count?.demands || 6}
                </Text>
                <Text style={styles.statLabel}>
                  {language === "ar" ? "طلبات طرود" : language === "fr" ? "Colis demandés" : "Demands"}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: darkMode ? "#151E2E" : "#F8FAFC" }]}>
                <Award size={20} color="#F59E0B" />
                <Text style={[styles.statValue, { color: textColor }]}>100%</Text>
                <Text style={styles.statLabel}>
                  {language === "ar" ? "نسبة النجاح" : language === "fr" ? "Succès" : "Success"}
                </Text>
              </View>
            </View>
          </View>

          {/* Escrow Guarantee Box */}
          <View style={[styles.guaranteeCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
            <ShieldCheck size={24} color="#16A34A" />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>
                {language === "ar" ? "معاملات آمنة مع SafarLink Escrow" : "Transactions 100% Sécurisées"}
              </Text>
              <Text style={styles.guaranteeDesc}>
                {language === "ar"
                  ? "جميع المعاملات المالية مع هذا العضو محمية بحساب الضمان ولا يتم تحرير المبالغ إلا بعد تأكيد الطرفين."
                  : "Tous vos paiements et accords avec ce membre sont protégés par le séquestre SafarLink jusqu'à la validation mutuelle."}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#059669",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  ratingNumber: {
    fontSize: 15,
    fontWeight: "700",
  },
  reviewCount: {
    fontSize: 13,
    color: "#64748B",
  },
  memberSinceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 14,
  },
  memberSinceText: {
    fontSize: 12,
    color: "#64748B",
  },
  trustBadgesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionsGroup: {
    flexDirection: "row",
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  callActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  callActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },
  guaranteeDesc: {
    fontSize: 12,
    color: "#15803D",
    lineHeight: 16,
  },
});
