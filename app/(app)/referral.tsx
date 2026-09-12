import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Share,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Safe dynamic loader: avoids crash when native module isn't yet compiled into current APK
let Clipboard: any = null;
try {
  Clipboard = require("expo-clipboard");
} catch {
  Clipboard = null;
}
import { useAppStore } from "@/lib/store";
import { colors, borderRadius, spacing, shadows } from "@/lib/theme";
import {
  referralApi,
  ReferralStats,
  ReferralRewardItem,
  ReferredUserItem,
} from "@/lib/api";
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  Sparkles,
  Package,
  ShoppingBag,
  Plane,
  AlertCircle,
} from "lucide-react-native";

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user, darkMode } = useAppStore();
  const isArabic = language === "ar";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Referral Data State
  const [myCode, setMyCode] = useState<string>(user?.referralCode || "");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    walletBalance: 0,
    totalEarned: 0,
    pendingRewards: 0,
    approvedRewards: 0,
  });
  const [rewards, setRewards] = useState<ReferralRewardItem[]>([]);
  const [referredUsers, setReferredUsers] = useState<ReferredUserItem[]>([]);
  const [activeTab, setActiveTab] = useState<"rewards" | "users">("rewards");

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 24 : 16);

  const fetchData = useCallback(async () => {
    setErrorMsg(null);
    try {
      const [codeRes, statsRes, rewardsRes, usersRes] = await Promise.allSettled([
        referralApi.getMyCode(),
        referralApi.getStats(),
        referralApi.getRewards(1, 30),
        referralApi.getReferredUsers(1, 30),
      ]);

      if (codeRes.status === "fulfilled" && codeRes.value?.data?.data?.referralCode) {
        setMyCode(codeRes.value.data.data.referralCode);
      } else if (user?.referralCode) {
        setMyCode(user.referralCode);
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      }

      if (rewardsRes.status === "fulfilled" && rewardsRes.value?.data?.data?.rewards) {
        setRewards(rewardsRes.value.data.data.rewards);
      }

      if (usersRes.status === "fulfilled" && usersRes.value?.data?.data?.users) {
        setReferredUsers(usersRes.value.data.data.users);
      }

      // Check if all failed due to auth/session issues
      if (
        codeRes.status === "rejected" &&
        statsRes.status === "rejected"
      ) {
        setErrorMsg(
          language === "ar"
            ? "تعذر تحميل البيانات. يرجى تسجيل الخروج وإعادة تسجيل الدخول لتحديث الجلسة."
            : language === "fr"
            ? "Impossible de charger les données. Veuillez vous reconnecter pour rafraîchir votre session."
            : "Failed to load data. Please log out and log back in to refresh your session."
        );
      }
    } catch (err: any) {
      console.error("[ReferralScreen] Error loading data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.referralCode, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Dedicated Copy to Clipboard action
  const handleCopy = async () => {
    if (!myCode || myCode === "---") return;
    let copiedSuccess = false;

    if (Clipboard && typeof Clipboard.setStringAsync === "function") {
      try {
        await Clipboard.setStringAsync(myCode);
        copiedSuccess = true;
      } catch (e) {
        copiedSuccess = false;
      }
    } else if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(myCode);
        copiedSuccess = true;
      } catch {
        copiedSuccess = false;
      }
    }

    if (copiedSuccess) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Fallback: Use native Share sheet which includes "Copier dans le presse-papier" on Android
      await handleShare();
    }
  };

  // Dedicated Native Share action
  const handleShare = async () => {
    if (!myCode || myCode === "---") return;
    try {
      const shareUrl = `safarlink://register?ref=${myCode}`;
      const message =
        language === "ar"
          ? `انضم إلى SafarLink لنقل الطرود والأمتعة بسهولة! استخدم رمز الإحالة الخاص بي: ${myCode}\n${shareUrl}`
          : language === "fr"
          ? `Rejoins SafarLink pour transporter ou envoyer tes colis facilement ! Utilise mon code de parrainage : ${myCode}\n${shareUrl}`
          : `Join SafarLink to ship or carry parcels easily! Use my referral code: ${myCode}\n${shareUrl}`;

      await Share.share({
        message,
        title: "SafarLink Referral",
      });
    } catch (error) {
      console.error("Error sharing referral code:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        language === "ar" ? "ar-TN" : language === "fr" ? "fr-FR" : "en-US",
        { day: "numeric", month: "short", year: "numeric" }
      );
    } catch {
      return dateStr;
    }
  };

  const renderTxIcon = (type: string) => {
    switch (type) {
      case "DEAL":
        return <Plane size={16} color={colors.primary} />;
      case "SHOPPING_ORDER":
        return <ShoppingBag size={16} color={colors.accent} />;
      default:
        return <Package size={16} color={colors.success} />;
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, darkMode && styles.safeAreaDark]}
      edges={["left", "right", "bottom"]}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding }, darkMode && styles.headerDark]}>
        <TouchableOpacity
          style={[styles.iconButton, darkMode && styles.iconButtonDark]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={darkMode ? "#FFFFFF" : colors.text.light} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
          {language === "ar"
            ? "نظام الإحالة والمكافآت"
            : language === "fr"
            ? "Parrainage & Récompenses"
            : "Refer & Earn"}
        </Text>

        <TouchableOpacity
          style={[styles.iconButton, darkMode && styles.iconButtonDark]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Share2 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing["2xl"] + bottomInset }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {errorMsg && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={colors.error} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          )}

          {/* Hero Earnings Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <Sparkles size={13} color={colors.accent} />
                <Text style={styles.heroBadgeText}>
                  {language === "ar"
                    ? "عمولة 1% مدى الحياة"
                    : language === "fr"
                    ? "1% de commission à vie"
                    : "1% Lifetime Commission"}
                </Text>
              </View>
              <Wallet size={22} color="#FFFFFF" opacity={0.9} />
            </View>

            <Text style={styles.heroLabel}>
              {language === "ar" ? "رصيد المحفظة الحالي" : language === "fr" ? "Solde de votre cagnotte" : "Wallet Balance"}
            </Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>{stats.walletBalance.toFixed(2)}</Text>
              <Text style={styles.currencyTag}>QAR</Text>
            </View>

            <View style={styles.heroFooter}>
              <View style={{ flex: 1 }}>
                <Text style={styles.footerStatLabel}>
                  {language === "ar" ? "إجمالي الأرباح" : language === "fr" ? "Total gagné" : "Total Earned"}
                </Text>
                <Text style={styles.footerStatVal}>{stats.totalEarned.toFixed(2)} QAR</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={{ flex: 1 }}>
                <Text style={styles.footerStatLabel}>
                  {language === "ar" ? "أصدقاء مسجلون" : language === "fr" ? "Filleuls actifs" : "Referred Users"}
                </Text>
                <Text style={styles.footerStatVal}>{stats.totalReferrals}</Text>
              </View>
            </View>
          </View>

          {/* Referral Code & Share Section */}
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              {language === "ar" ? "رمز الإحالة الخاص بك" : language === "fr" ? "Votre code de parrainage" : "Your Referral Code"}
            </Text>
            <Text style={[styles.sectionSubtitle, darkMode && styles.textMutedDark]}>
              {language === "ar"
                ? "شارك هذا الرمز لربح 1% عمولة نقدية على كل عملية شحن يقوم بها أصدقاؤك."
                : language === "fr"
                ? "Partagez ce code pour toucher 1% de commission sur chaque transaction de vos filleuls."
                : "Share this code to earn 1% cash commission on every transaction your friends complete."}
            </Text>

            <View style={[styles.codeBox, darkMode && styles.codeBoxDark]}>
              <Text style={styles.codeText}>{myCode || "---"}</Text>
              <TouchableOpacity
                style={[styles.copyButton, copied && styles.copyButtonActive]}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                {copied ? <Check size={16} color="#FFFFFF" /> : <Copy size={16} color={colors.primary} />}
                <Text style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}>
                  {copied
                    ? language === "ar"
                      ? "تم النسخ!"
                      : "Copié !"
                    : language === "ar"
                    ? "نسخ"
                    : "Copier"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryShareBtn}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Share2 size={18} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
              <Text style={styles.primaryShareBtnText}>
                {language === "ar"
                  ? "مشاركة الرابط مع الأصدقاء"
                  : language === "fr"
                  ? "Partager mon lien d'invitation"
                  : "Share Invitation Link"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* KPI Mini-Cards */}
          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, darkMode && styles.cardDark]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#E0F2FE" }]}>
                <Users size={18} color={colors.primary} />
              </View>
              <Text style={[styles.kpiValue, darkMode && styles.textDark]}>{stats.totalReferrals}</Text>
              <Text style={styles.kpiLabel}>
                {language === "ar" ? "أصدقاء" : language === "fr" ? "Filleuls" : "Referrals"}
              </Text>
            </View>

            <View style={[styles.kpiCard, darkMode && styles.cardDark]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#ECFDF5" }]}>
                <CheckCircle2 size={18} color={colors.success} />
              </View>
              <Text style={[styles.kpiValue, darkMode && styles.textDark]}>{stats.approvedRewards}</Text>
              <Text style={styles.kpiLabel}>
                {language === "ar" ? "معتمدة" : language === "fr" ? "Validées" : "Approved"}
              </Text>
            </View>

            <View style={[styles.kpiCard, darkMode && styles.cardDark]}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#FFFBEB" }]}>
                <Clock size={18} color={colors.warning} />
              </View>
              <Text style={[styles.kpiValue, darkMode && styles.textDark]}>{stats.pendingRewards}</Text>
              <Text style={styles.kpiLabel}>
                {language === "ar" ? "قيد الانتظار" : language === "fr" ? "En attente" : "Pending"}
              </Text>
            </View>
          </View>

          {/* Tabs Header */}
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "rewards" && styles.tabButtonActive,
                darkMode && styles.tabButtonDark,
              ]}
              onPress={() => setActiveTab("rewards")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "rewards" && styles.tabButtonTextActive,
                ]}
              >
                {language === "ar"
                  ? `المكافآت (${rewards.length})`
                  : language === "fr"
                  ? `Gains (${rewards.length})`
                  : `Rewards (${rewards.length})`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "users" && styles.tabButtonActive,
                darkMode && styles.tabButtonDark,
              ]}
              onPress={() => setActiveTab("users")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "users" && styles.tabButtonTextActive,
                ]}
              >
                {language === "ar"
                  ? `الأصدقاء (${referredUsers.length})`
                  : language === "fr"
                  ? `Filleuls (${referredUsers.length})`
                  : `Friends (${referredUsers.length})`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={[styles.card, darkMode && styles.cardDark, { padding: spacing.md }]}>
            {activeTab === "rewards" ? (
              rewards.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Gift size={32} color={colors.muted.light} />
                  <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
                    {language === "ar" ? "لا توجد مكافآت حتى الآن" : language === "fr" ? "Aucune commission pour le moment" : "No rewards yet"}
                  </Text>
                  <Text style={styles.emptyDesc}>
                    {language === "ar"
                      ? "شارك كودك لتبدأ في جني الأرباح فور إتمام أول عملية."
                      : language === "fr"
                      ? "Partagez votre code d'invitation pour recevoir vos premières commissions !"
                      : "Share your code to earn your first commission!"}
                  </Text>
                </View>
              ) : (
                rewards.map((reward) => (
                  <View key={reward.id} style={[styles.listRow, darkMode && styles.listRowDark]}>
                    <View style={styles.rowLeft}>
                      <View style={styles.txIconBox}>{renderTxIcon(reward.transactionType)}</View>
                      <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                        <Text style={[styles.rowTitle, darkMode && styles.textDark]}>
                          {reward.transactionType.replace("_", " ")}
                        </Text>
                        <Text style={styles.rowSub}>
                          {formatDate(reward.createdAt)} • {reward.transactionId}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.amountText}>+{reward.amount.toFixed(2)} QAR</Text>
                      <View
                        style={[
                          styles.badge,
                          reward.status === "APPROVED" && styles.badgeSuccess,
                          reward.status === "PENDING" && styles.badgeWarning,
                          reward.status === "REJECTED" && styles.badgeDanger,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            reward.status === "APPROVED" && styles.badgeTextSuccess,
                            reward.status === "PENDING" && styles.badgeTextWarning,
                            reward.status === "REJECTED" && styles.badgeTextDanger,
                          ]}
                        >
                          {reward.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )
            ) : referredUsers.length === 0 ? (
              <View style={styles.emptyBox}>
                <Users size={32} color={colors.muted.light} />
                <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>
                  {language === "ar" ? "لم يسجل أي صديق بعد" : language === "fr" ? "Aucun ami inscrit pour le moment" : "No friends registered yet"}
                </Text>
                <Text style={styles.emptyDesc}>
                  {language === "ar"
                    ? "كن أول من يدعو أصدقاءه للاستفادة من المزايا."
                    : language === "fr"
                    ? "Partagez votre lien pour inviter votre premier ami !"
                    : "Share your link to invite your first friend!"}
                </Text>
              </View>
            ) : (
              referredUsers.map((item) => (
                <View key={item.id} style={[styles.listRow, darkMode && styles.listRowDark]}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={[styles.rowTitle, darkMode && styles.textDark]}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.email}</Text>
                  </View>
                  <Text style={styles.rowSub}>{formatDate(item.createdAt)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeAreaDark: {
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerDark: {
    backgroundColor: "#171717",
    borderBottomColor: colors.border.dark,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.light,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDark: {
    backgroundColor: "#262626",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: 4,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  heroLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.lg,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },
  currencyTag: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  heroFooter: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  footerStatLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    marginBottom: 2,
  },
  footerStatVal: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: spacing.md,
  },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardDark: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.light,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.muted.light,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderStyle: "dashed",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  codeBoxDark: {
    backgroundColor: "#262626",
    borderColor: colors.border.dark,
  },
  codeText: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.primary,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  copyButtonActive: {
    backgroundColor: colors.success,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  copyButtonTextActive: {
    color: "#FFFFFF",
  },
  primaryShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  primaryShareBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // KPI Row
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    ...shadows.sm,
  },
  kpiIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.light,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.muted.light,
    marginTop: 2,
  },

  // Tabs Header
  tabsHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  tabButtonDark: {
    backgroundColor: "#262626",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted.dark,
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // List Rows
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  listRowDark: {
    borderBottomColor: colors.border.dark,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  txIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.light,
  },
  rowSub: {
    fontSize: 11,
    color: colors.muted.light,
    marginTop: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.success,
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeSuccess: { backgroundColor: "#DCFCE7" },
  badgeWarning: { backgroundColor: "#FEF3C7" },
  badgeDanger: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeTextSuccess: { color: "#15803D" },
  badgeTextWarning: { color: "#B45309" },
  badgeTextDanger: { color: "#B91C1C" },

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.light,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.muted.light,
    textAlign: "center",
  },

  textDark: { color: colors.text.dark },
  textMutedDark: { color: colors.muted.dark },
});
