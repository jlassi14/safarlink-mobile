import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  Alert,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  ShieldCheck,
  Clock,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronRight,
  LogOut,
  Send,
  Package,
  Settings,
} from "lucide-react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import OTPInput from "@/components/OTPInput";
import DatePickerInput from "@/components/DatePickerInput";
import PhoneInput, { COUNTRIES_LIST, CountryPhoneSchema } from "@/components/PhoneInput";
import { MOCK_DEMO_AVATARS } from "@/lib/constants";
import { MOCK_MY_APPLICATIONS } from "@/lib/mockData";
import { authApi, getRefreshToken, clearAuthTokens } from "@/lib/api";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user, updateUser, logout, darkMode } = useAppStore();
  const isArabic = language === "ar";

  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 6;
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 24 : 16);

  // Modals state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      const refreshToken = await getRefreshToken();
      await authApi.logout(refreshToken || undefined);
    } catch (e) {
      console.error("Backend logout error:", e);
    } finally {
      await clearAuthTokens();
      logout();
      setShowLogoutModal(false);
      setLogoutLoading(false);
      router.replace("/(auth)/login");
    }
  };

  // Full Profile Edit Demand fields
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "");
  const [editName, setEditName] = useState(user?.name || "");
  const [editBirthdate, setEditBirthdate] = useState<Date | null>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : null
  );
  const [editNationality, setEditNationality] = useState<CountryPhoneSchema>(
    COUNTRIES_LIST.find((c) => c.name === user?.nationality) || COUNTRIES_LIST[0]
  );
  const [editResidence, setEditResidence] = useState<CountryPhoneSchema>(
    COUNTRIES_LIST.find((c) => c.name === user?.countryOfResidence) || COUNTRIES_LIST[1]
  );

  // Country Picker Modal in Demand Form
  const [countryPickerType, setCountryPickerType] = useState<"nationality" | "residence" | null>(null);
  const [countrySearch, setCountrySearch] = useState("");

  // Email / Phone OTP modal state
  const [newEmail, setNewEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryPhoneSchema>(COUNTRIES_LIST[0]);
  const [phoneFormatted, setPhoneFormatted] = useState("");
  const [phoneRawDigits, setPhoneRawDigits] = useState("");

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailStep, setEmailStep] = useState<"input" | "otp">("input");
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [modalError, setModalError] = useState("");
  const [loading, setLoading] = useState(false);

  // 60-Second Resend Code Timer
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if ((emailStep === "otp" || phoneStep === "otp") && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailStep, phoneStep, resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
    setCanResend(false);
  };

  // Demo avatar photo selection
  const handleSelectDemoAvatar = () => {
    const demoAvatars = MOCK_DEMO_AVATARS;
    const nextAvatar = demoAvatars[Math.floor(Math.random() * demoAvatars.length)];
    setEditAvatar(nextAvatar);
  };

  // Handle Admin Change Demand for Full Personal Profile Info (Avatar, Name, Birthdate, Nationality, Residence)
  const handleSubmitDemand = () => {
    if (!editName.trim()) {
      setModalError(t("fullNameRequired", language));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const birthdateStr = editBirthdate ? editBirthdate.toISOString().split("T")[0] : "N/A";
      updateUser({
        pendingEditDemand: {
          id: "dem_" + Date.now(),
          field: "Full Profile Information",
          oldValue: `${user?.name || ""}, ${user?.nationality || ""}, ${user?.countryOfResidence || ""}`,
          newValue: `${editName} (${editNationality.flag} ${editNationality.name}, ${editResidence.flag} ${editResidence.name}, DOB: ${birthdateStr})`,
          date: new Date().toLocaleDateString(),
          status: "pending",
        },
      });
      setLoading(false);
      setShowDemandModal(false);
      Alert.alert(
        t("requestInfoChangeTitle", language),
        t("demandSubmittedSuccess", language)
      );
    }, 600);
  };

  // Handle Email Change with 30-Day Frequency Limit & OTP
  const handleOpenEmailModal = () => {
    const lastChange = user?.lastEmailChangeDate;
    if (lastChange) {
      const daysDiff = Math.floor(
        (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 30) {
        Alert.alert(
          t("changeEmailTitle", language),
          `${t("rateLimitError", language)} (${30 - daysDiff} days remaining)`
        );
        return;
      }
    }
    setNewEmail("");
    setEmailOtp("");
    setEmailStep("input");
    setModalError("");
    setShowEmailModal(true);
  };

  const handleSendEmailOtp = () => {
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
      setModalError(t("invalidEmail", language));
      return;
    }
    setModalError("");
    setEmailStep("otp");
    startResendTimer();
  };

  const handleVerifyEmailOtp = () => {
    if (!emailOtp || emailOtp.length < 6) {
      setModalError(t("otpRequired", language));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      updateUser({
        email: newEmail,
        lastEmailChangeDate: new Date().toISOString(),
      });
      setLoading(false);
      setShowEmailModal(false);
      Alert.alert(t("changeEmailTitle", language), t("passwordResetSuccess", language));
    }, 800);
  };

  // Handle Phone Change with 30-Day Frequency Limit, Country Selector & OTP
  const handleOpenPhoneModal = () => {
    const lastChange = user?.lastPhoneChangeDate;
    if (lastChange) {
      const daysDiff = Math.floor(
        (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 30) {
        Alert.alert(
          t("changePhoneTitle", language),
          `${t("rateLimitError", language)} (${30 - daysDiff} days remaining)`
        );
        return;
      }
    }
    setPhoneFormatted("");
    setPhoneRawDigits("");
    setPhoneCountry(COUNTRIES_LIST[0]);
    setPhoneOtp("");
    setPhoneStep("input");
    setModalError("");
    setShowPhoneModal(true);
  };

  const handleSendPhoneOtp = () => {
    if (!phoneRawDigits || phoneRawDigits.length < phoneCountry.digitsCount) {
      setModalError(
        t("phoneDigitsRequired", language, {
          count: phoneCountry.digitsCount,
          country: phoneCountry.name,
        })
      );
      return;
    }
    setModalError("");
    setPhoneStep("otp");
    startResendTimer();
  };

  const handleVerifyPhoneOtp = () => {
    if (!phoneOtp || phoneOtp.length < 6) {
      setModalError(t("otpRequired", language));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const fullPhone = `${phoneCountry.dialCode} ${phoneFormatted}`;
      updateUser({
        phone: fullPhone,
        countryCode: phoneCountry.code,
        lastPhoneChangeDate: new Date().toISOString(),
      });
      setLoading(false);
      setShowPhoneModal(false);
      Alert.alert(t("changePhoneTitle", language), t("passwordResetSuccess", language));
    }, 800);
  };

  const filteredCountries = COUNTRIES_LIST.filter((item) => {
    if (!countrySearch.trim()) return true;
    const q = countrySearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nameAr.includes(q) ||
      item.nameFr.toLowerCase().includes(q) ||
      item.dialCode.includes(q)
    );
  });

  const getLocalizedCountryName = (c: CountryPhoneSchema) => {
    if (language === "ar") return c.nameAr;
    if (language === "fr") return c.nameFr;
    return c.name;
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, darkMode && styles.textDark]}>
          {t("profile", language)}
        </Text>
        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => {
              setEditAvatar(user?.avatar || "");
              setEditName(user?.name || "");
              setEditBirthdate(user?.dateOfBirth ? new Date(user.dateOfBirth) : null);
              setModalError("");
              setShowDemandModal(true);
            }}
          >
            <Edit3 size={15} color="#2563EB" />
            <Text style={styles.editHeaderBtnText}>{t("editProfile", language)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsHeaderIconBtn, darkMode && styles.settingsHeaderIconBtnDark]}
            onPress={() => router.push("/(app)/settings")}
            activeOpacity={0.75}
          >
            <Settings size={18} color={darkMode ? "#FFFFFF" : "#1F2937"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pending Admin Demand Banner */}
        {user?.pendingEditDemand && (
          <View style={styles.pendingDemandCard}>
            <View style={styles.pendingBadgeRow}>
              <Clock size={16} color="#D97706" />
              <Text style={styles.pendingBadgeText}>{t("pendingAdminApproval", language)}</Text>
            </View>
            <Text style={styles.pendingDemandDesc}>
              {t("profileChangeReviewMessage", language)}{" "}
              {user.pendingEditDemand.newValue}
            </Text>
          </View>
        )}

        {/* User Card Overview */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <UserIcon size={44} color="#6B7280" />
              )}
            </View>
            <View style={styles.userInfoColumn}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.userNameText, darkMode && styles.textDark]}>
                  {user?.name || "Traveler User"}
                </Text>
                {user?.isVerified && <ShieldCheck size={18} color="#2563EB" />}
              </View>
              <Text style={styles.userRoleText}>
                {user?.isVerified
                  ? t("verifiedAccount", language)
                  : t("unverifiedAccount", language)}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Info Items */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
            {t("accountSettings", language)}
          </Text>

          {/* Email Row */}
          <TouchableOpacity style={styles.infoRow} onPress={handleOpenEmailModal}>
            <Mail size={20} color="#2563EB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("emailAddress", language)}</Text>
              <Text style={[styles.infoValue, darkMode && styles.textDark]}>
                {user?.email || "user@safarlink.com"}
              </Text>
            </View>
            <Edit3 size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Phone Row */}
          <TouchableOpacity style={styles.infoRow} onPress={handleOpenPhoneModal}>
            <Phone size={20} color="#2563EB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("phoneNumber", language)}</Text>
              <Text style={[styles.infoValue, darkMode && styles.textDark]}>
                {user?.phone || "+216 22 123 456"}
              </Text>
            </View>
            <Edit3 size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Birthdate Row */}
          <View style={styles.infoRow}>
            <Calendar size={20} color="#2563EB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("dateOfBirth", language)}</Text>
              <Text style={[styles.infoValue, darkMode && styles.textDark]}>
                {user?.dateOfBirth || "1998-05-15"}
              </Text>
            </View>
          </View>

          {/* Nationality Row */}
          <View style={styles.infoRow}>
            <Globe size={20} color="#2563EB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("nationality", language)}</Text>
              <Text style={[styles.infoValue, darkMode && styles.textDark]}>
                {user?.nationality || "Tunisia 🇹🇳"}
              </Text>
            </View>
          </View>

          {/* Residence Row */}
          <View style={styles.infoRow}>
            <MapPin size={20} color="#2563EB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t("countryOfResidence", language)}</Text>
              <Text style={[styles.infoValue, darkMode && styles.textDark]}>
                {user?.countryOfResidence || "Qatar 🇶🇦"}
              </Text>
            </View>
          </View>

          <View style={styles.rateLimitNoteBox}>
            <AlertTriangle size={14} color="#D97706" />
            <Text style={styles.rateLimitNoteText}>{t("rateLimitNotice", language)}</Text>
          </View>

          {/* Settings & Preferences Navigation Row */}
          <TouchableOpacity
            style={[styles.settingsCardRow, darkMode && styles.settingsCardRowDark]}
            onPress={() => router.push("/(app)/settings")}
            activeOpacity={0.75}
          >
            <View style={styles.settingsRowLeft}>
              <View style={styles.settingsIconCircle}>
                <Settings size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsRowTitle, darkMode && styles.textDark]}>
                  {language === "ar"
                    ? "الإعدادات والتفضيلات"
                    : language === "fr"
                    ? "Paramètres & Préférences"
                    : "Settings & Preferences"}
                </Text>
                <Text style={styles.settingsRowSubtitle}>
                  {language === "ar"
                    ? "اللغة، الوضع الليلي، الشروط والمساعدة"
                    : "Langue, Mode sombre, Confidentialité & Aide"}
                </Text>
              </View>
            </View>
            <ChevronRight size={17} color="#94A3B8" />
          </TouchableOpacity>

          {/* Log Out Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>{t("logOut", language)}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Admin Demand Request Modal (Avatar, Full Name, Birthdate, Nationality, Residence) */}
      <Modal
        visible={showDemandModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDemandModal(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDemandModal(false)}>
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContentLarge, darkMode && styles.modalContentDark, { paddingBottom: 24 + bottomInset }]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>{t("requestInfoChangeTitle", language)}</Text>
              <TouchableOpacity onPress={() => setShowDemandModal(false)}>
                <X size={20} color={darkMode ? "#FFFFFF" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.noticeText, darkMode && styles.textDark]}>{t("adminApprovalNotice", language)}</Text>

              {/* Avatar Photo Picker Section */}
              <View style={styles.avatarPickerBox}>
                <TouchableOpacity
                  style={[styles.avatarPickerCircle, darkMode && styles.avatarPickerCircleDark]}
                  onPress={handleSelectDemoAvatar}
                  activeOpacity={0.8}
                >
                  {editAvatar ? (
                    <Image source={{ uri: editAvatar }} style={styles.avatarImg} />
                  ) : (
                    <UserIcon size={36} color="#9CA3AF" />
                  )}
                  <View style={styles.cameraBadge}>
                    <Camera size={12} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarPickerText}>
                  {editAvatar ? t("changeProfilePhoto", language) : t("addProfilePhoto", language)}
                </Text>
              </View>

              {/* Full Name Input */}
              <Input
                icon={UserIcon}
                placeholder={`${t("fullName", language)} *`}
                value={editName}
                error={modalError}
                onChangeText={(val) => {
                  setEditName(val);
                  if (modalError) setModalError("");
                }}
              />

              {/* Date of Birth Picker */}
              <DatePickerInput
                label={`${t("dateOfBirth", language)} *:`}
                value={editBirthdate}
                language={language}
                mode="birth"
                onChange={setEditBirthdate}
              />

              {/* Nationality Selector Trigger */}
              <TouchableOpacity
                style={[styles.pickerTriggerCard, darkMode && styles.pickerTriggerCardDark]}
                onPress={() => {
                  setCountrySearch("");
                  setCountryPickerType("nationality");
                }}
              >
                <Globe size={18} color="#2563EB" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerTriggerLabel}>{t("nationality", language)}</Text>
                  <Text style={[styles.pickerTriggerValue, darkMode && styles.textDark]}>
                    {editNationality.flag} {getLocalizedCountryName(editNationality)}
                  </Text>
                </View>
                <ChevronDown size={18} color={darkMode ? "#FFFFFF" : "#6B7280"} />
              </TouchableOpacity>

              {/* Country of Residence Selector Trigger */}
              <TouchableOpacity
                style={[styles.pickerTriggerCard, darkMode && styles.pickerTriggerCardDark]}
                onPress={() => {
                  setCountrySearch("");
                  setCountryPickerType("residence");
                }}
              >
                <MapPin size={18} color="#2563EB" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerTriggerLabel}>{t("countryOfResidence", language)}</Text>
                  <Text style={[styles.pickerTriggerValue, darkMode && styles.textDark]}>
                    {editResidence.flag} {getLocalizedCountryName(editResidence)}
                  </Text>
                </View>
                <ChevronDown size={18} color={darkMode ? "#FFFFFF" : "#6B7280"} />
              </TouchableOpacity>

              <Button
                title={t("submitDemandToAdmin", language)}
                onPress={handleSubmitDemand}
                loading={loading}
                variant="primary"
                style={{ marginTop: 16 }}
              />
            </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Country Selection Modal for Demand Form */}
      <Modal
        visible={countryPickerType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCountryPickerType(null)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={() => setCountryPickerType(null)}>
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContentList, darkMode && styles.modalContentDark, { paddingBottom: 24 + bottomInset }]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
                {countryPickerType === "nationality"
                  ? t("selectNationality", language)
                  : t("selectResidence", language)}
              </Text>
              <TouchableOpacity onPress={() => setCountryPickerType(null)}>
                <X size={20} color={darkMode ? "#FFFFFF" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, darkMode && styles.searchInputDark]}
              placeholder={t("searchCountry", language)}
              placeholderTextColor="#9CA3AF"
              value={countrySearch}
              onChangeText={setCountrySearch}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryOptionRow, darkMode && styles.countryOptionRowDark]}
                  onPress={() => {
                    if (countryPickerType === "nationality") {
                      setEditNationality(item);
                    } else {
                      setEditResidence(item);
                    }
                    setCountryPickerType(null);
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 10 }}>{item.flag}</Text>
                  <Text style={[styles.countryOptionName, darkMode && styles.textDark]}>{getLocalizedCountryName(item)}</Text>
                </TouchableOpacity>
              )}
            />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Email Change Modal with OTP & 60s Resend Timer */}
      <Modal
        visible={showEmailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmailModal(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowEmailModal(false)}>
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, darkMode && styles.modalContentDark, { paddingBottom: 24 + bottomInset }]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>{t("changeEmailTitle", language)}</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <X size={20} color={darkMode ? "#FFFFFF" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            {emailStep === "input" ? (
              <>
                <Text style={[styles.noticeText, darkMode && styles.textDark]}>{t("rateLimitNotice", language)}</Text>
                <Input
                  icon={Mail}
                  placeholder={`${t("emailAddress", language)} *`}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  error={modalError}
                  onChangeText={(val) => {
                    setNewEmail(val);
                    if (modalError) setModalError("");
                  }}
                />
                <Button
                  title={t("sendResetCode", language)}
                  onPress={handleSendEmailOtp}
                  variant="primary"
                />
              </>
            ) : (
              <>
                <Text style={[styles.noticeText, darkMode && styles.textDark]}>{t("emailOtpNotice", language)}</Text>
                <OTPInput
                  value={emailOtp}
                  error={modalError}
                  onChangeText={(val) => {
                    setEmailOtp(val);
                    if (modalError) setModalError("");
                  }}
                />

                {/* 60s Resend Code Row */}
                <View style={styles.resendRow}>
                  <Text style={[styles.resendText, darkMode && styles.textDark]}>{t("didntReceiveCode", language)}</Text>
                  <TouchableOpacity
                    disabled={!canResend}
                    onPress={startResendTimer}
                  >
                    <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                      {t("resendCode", language)} {!canResend ? `(${resendTimer}s)` : ""}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title={t("verifyProceed", language)}
                  onPress={handleVerifyEmailOtp}
                  loading={loading}
                  variant="primary"
                />
              </>
            )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Phone Change Modal with Country Selector, OTP & 60s Resend Timer */}
      <Modal
        visible={showPhoneModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowPhoneModal(false)}>
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, darkMode && styles.modalContentDark, { paddingBottom: 24 + bottomInset }]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>{t("changePhoneTitle", language)}</Text>
              <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
                <X size={20} color={darkMode ? "#FFFFFF" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            {phoneStep === "input" ? (
              <>
                <Text style={[styles.noticeText, darkMode && styles.textDark]}>{t("rateLimitNotice", language)}</Text>
                
                {/* Phone Input with Country Code Picker */}
                <PhoneInput
                  value={phoneFormatted}
                  country={phoneCountry}
                  onValueChange={(fmt, raw) => {
                    setPhoneFormatted(fmt);
                    setPhoneRawDigits(raw);
                    if (modalError) setModalError("");
                  }}
                  onCountryChange={(c) => {
                    setPhoneCountry(c);
                    setPhoneFormatted("");
                    setPhoneRawDigits("");
                  }}
                  error={modalError}
                  language={language}
                />

                <Button
                  title={t("sendResetCode", language)}
                  onPress={handleSendPhoneOtp}
                  variant="primary"
                />
              </>
            ) : (
              <>
                <Text style={[styles.noticeText, darkMode && styles.textDark]}>{t("phoneOtpNotice", language)}</Text>
                <OTPInput
                  value={phoneOtp}
                  error={modalError}
                  onChangeText={(val) => {
                    setPhoneOtp(val);
                    if (modalError) setModalError("");
                  }}
                />

                {/* 60s Resend Code Row */}
                <View style={styles.resendRow}>
                  <Text style={[styles.resendText, darkMode && styles.textDark]}>{t("didntReceiveCode", language)}</Text>
                  <TouchableOpacity
                    disabled={!canResend}
                    onPress={startResendTimer}
                  >
                    <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                      {t("resendCode", language)} {!canResend ? `(${resendTimer}s)` : ""}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title={t("verifyProceed", language)}
                  onPress={handleVerifyPhoneOtp}
                  loading={loading}
                  variant="primary"
                />
              </>
            )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        visible={showLogoutModal}
        loading={logoutLoading}
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  safeAreaDark: {
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerDark: {
    backgroundColor: "#1F2937",
    borderBottomColor: "#374151",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
  },
  textDark: {
    color: "#FFFFFF",
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsHeaderIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsHeaderIconBtnDark: {
    backgroundColor: "#374151",
  },
  editHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  editHeaderBtnText: {
    color: "#2563EB",
    fontSize: 12.5,
    fontWeight: "700",
  },
  settingsCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  settingsCardRowDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  settingsIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsRowTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  settingsRowSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
  },
  pendingDemandCard: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  pendingBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  pendingBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B45309",
  },
  pendingDemandDesc: {
    fontSize: 13,
    color: "#78350F",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "#1F2937",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  userInfoColumn: {
    flex: 1,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  userRoleText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "700",
    marginTop: 2,
  },
  rateLimitNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  rateLimitNoteText: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: "600",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalContentLarge: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalContentList: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  noticeText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  avatarPickerBox: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarPickerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarPickerText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 6,
  },
  pickerTriggerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 10,
  },
  pickerTriggerLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  pickerTriggerValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 10,
  },
  countryOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  countryOptionName: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
    gap: 4,
  },
  resendText: {
    fontSize: 13,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700",
  },
  resendLinkDisabled: {
    color: "#9CA3AF",
  },
  modalContentDark: {
    backgroundColor: "#1F2937",
  },
  modalHeaderDark: {
    borderBottomColor: "#374151",
  },
  avatarPickerCircleDark: {
    backgroundColor: "#374151",
  },
  pickerTriggerCardDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  countryOptionRowDark: {
    borderBottomColor: "#374151",
  },
  searchInputDark: {
    backgroundColor: "#374151",
    color: "#FFFFFF",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },
});
