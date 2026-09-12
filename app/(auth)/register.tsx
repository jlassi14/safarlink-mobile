import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { COUNTRIES_LIST, CountryPhoneSchema } from "@/lib/constants";
import {
  User,
  Mail,
  Globe,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Camera,
  X,
  ImageIcon,
  Gift,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Input from "@/components/Input";
import DatePickerInput from "@/components/DatePickerInput";
import Button from "@/components/Button";
import PhoneInput from "@/components/PhoneInput";
import ScreenContainer from "@/components/ScreenContainer";
import AuthLogoHeader from "@/components/AuthLogoHeader";
import AlertBanner from "@/components/AlertBanner";

import { authApi, setAuthTokens } from "@/lib/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setUser, darkMode } = useAppStore();

  // Form Fields State
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Phone State
  const [phoneCountry, setPhoneCountry] = useState<CountryPhoneSchema>(COUNTRIES_LIST[0]); // TN
  const [phoneFormatted, setPhoneFormatted] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [nationality, setNationality] = useState(COUNTRIES_LIST[0]);
  const [residence, setResidence] = useState(COUNTRIES_LIST[0]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const [referralCode, setReferralCode] = useState(ref ? String(ref).trim().toUpperCase() : "");

  React.useEffect(() => {
    if (ref && !referralCode) {
      setReferralCode(String(ref).trim().toUpperCase());
    }
  }, [ref]);

  // Per-Field Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activePicker, setActivePicker] = useState<"nationality" | "residence" | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
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

  const handlePickImageFromLibrary = async () => {
    setShowAvatarModal(false);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setGeneralError(
          language === "ar"
            ? "يرجى منح الإذن للوصول إلى مكتبة الصور"
            : language === "fr"
            ? "Veuillez autoriser l'accès à la galerie photo"
            : "Please grant permission to access the photo library."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("ImagePicker error:", e);
    }
  };

  const handleTakePhoto = async () => {
    setShowAvatarModal(false);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        setGeneralError(
          language === "ar"
            ? "يرجى منح الإذن للوصول إلى الكاميرا"
            : language === "fr"
            ? "Veuillez autoriser l'accès à l'appareil photo"
            : "Please grant permission to access the camera."
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Camera error:", e);
    }
  };

  const getLocalizedCountryName = (c: CountryPhoneSchema) => {
    if (language === "ar") return c.nameAr;
    if (language === "fr") return c.nameFr;
    return c.name;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("fullNameRequired", language);
    }

    if (!email.trim()) {
      newErrors.email = t("emailRequired", language);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("invalidEmail", language);
    }

    if (!phoneDigits) {
      newErrors.phone = t("phoneRequired", language);
    } else if (phoneDigits.length < phoneCountry.digitsCount) {
      newErrors.phone = t("phoneDigitsRequired", language, {
        count: phoneCountry.digitsCount,
        country: getLocalizedCountryName(phoneCountry),
      });
    }

    if (!birthdate) {
      newErrors.birthdate = t("birthdateRequired", language);
    }

    if (!password) {
      newErrors.password = t("passwordRequired", language);
    } else if (password.length < 6) {
      newErrors.password = t("passwordTooShort", language);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("confirmPasswordRequired", language);
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatch", language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setGeneralError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullPhone = `${phoneCountry.dialCode}${phoneDigits}`;
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: fullPhone,
        countryCode: phoneCountry.code,
        nationality: nationality.name,
        countryOfResidence: residence.name,
        dateOfBirth: birthdate ? birthdate.toISOString().split("T")[0] : undefined,
        avatar: avatarUri || undefined,
        password,
        referralCode: referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
      });

      if (response.data?.success && response.data.data) {
        const { user: backendUser, tokens } = response.data.data;
        if (tokens) {
          await setAuthTokens(tokens.accessToken, tokens.refreshToken);
        }
        setUser({
          ...backendUser,
          phone: `${phoneCountry.dialCode} ${phoneFormatted}`,
        });
        router.replace("/(auth)/otp");
      } else {
        setGeneralError(response.data?.error || "Registration failed. Please check your details.");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please check your details and try again.";
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = COUNTRIES_LIST.filter((c) => {
    if (!countrySearch.trim()) return true;
    const query = countrySearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.nameAr.includes(query) ||
      c.nameFr.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  });

  return (
    <ScreenContainer scrollable={true}>
      <AuthLogoHeader />

      <View style={[styles.card, darkMode && styles.cardDark]}>
        <Text style={[styles.cardTitle, darkMode && styles.textDark]}>
          {t("createAccount", language)}
        </Text>
        <Text style={styles.cardSubtitle}>
          {t("signUpSubtitle", language)}
        </Text>

        {/* General Error Banner */}
        <AlertBanner
          message={generalError}
          type="error"
          onClose={() => setGeneralError(null)}
        />

        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.85}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={42} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Camera size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {avatarUri
              ? t("changeProfilePhoto", language)
              : t("addProfilePhoto", language)}
          </Text>
        </View>

        <Input
          icon={User}
          placeholder={`${t("fullName", language)} *`}
          value={name}
          error={errors.name}
          onChangeText={(v) => {
            setName(v);
            clearFieldError("name");
          }}
        />

        <Input
          icon={Mail}
          placeholder={`${t("emailAddress", language)} *`}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          error={errors.email}
          onChangeText={(v) => {
            setEmail(v);
            clearFieldError("email");
          }}
        />

        <PhoneInput
          value={phoneFormatted}
          country={phoneCountry}
          error={errors.phone}
          language={language}
          onCountryChange={(c) => {
            setPhoneCountry(c);
            setPhoneFormatted("");
            setPhoneDigits("");
            clearFieldError("phone");
          }}
          onValueChange={(formatted, digits) => {
            setPhoneFormatted(formatted);
            setPhoneDigits(digits);
            clearFieldError("phone");
          }}
        />

        <DatePickerInput
          placeholder={`${t("dateOfBirth", language)} *`}
          label={t("dateOfBirth", language)}
          value={birthdate}
          error={errors.birthdate}
          language={language}
          mode="birth"
          onChange={(d) => {
            setBirthdate(d);
            clearFieldError("birthdate");
          }}
        />

        <View style={styles.fieldGroup}>
          <TouchableOpacity
            style={[styles.inputContainer, darkMode && styles.inputContainerDark]}
            onPress={() => {
              setCountrySearch("");
              setActivePicker("nationality");
            }}
            activeOpacity={0.7}
          >
            <Globe size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={styles.inputIcon} />
            <View style={styles.pickerValueContainer}>
              <Text style={styles.pickerLabel} numberOfLines={1}>
                {t("nationality", language)}
              </Text>
              <Text style={[styles.pickerValueText, darkMode && styles.textDark]} numberOfLines={1} ellipsizeMode="tail">
                {nationality.flag} {getLocalizedCountryName(nationality)}
              </Text>
            </View>
            <ChevronDown size={18} color={darkMode ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <TouchableOpacity
            style={[styles.inputContainer, darkMode && styles.inputContainerDark]}
            onPress={() => {
              setCountrySearch("");
              setActivePicker("residence");
            }}
            activeOpacity={0.7}
          >
            <MapPin size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} style={styles.inputIcon} />
            <View style={styles.pickerValueContainer}>
              <Text style={styles.pickerLabel} numberOfLines={1}>
                {t("countryOfResidence", language)}
              </Text>
              <Text style={[styles.pickerValueText, darkMode && styles.textDark]} numberOfLines={1} ellipsizeMode="tail">
                {residence.flag} {getLocalizedCountryName(residence)}
              </Text>
            </View>
            <ChevronDown size={18} color={darkMode ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        <Input
          icon={Lock}
          placeholder={`${t("password", language)} *`}
          secureTextEntry={!showPassword}
          value={password}
          error={errors.password}
          onChangeText={(v) => {
            setPassword(v);
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

        <Input
          icon={Lock}
          placeholder={`${t("confirmPassword", language)} *`}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          error={errors.confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
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

        <Input
          icon={Gift}
          placeholder={
            language === "ar"
              ? "رمز الإحالة / كود الدعوة (اختياري)"
              : language === "fr"
              ? "Code de parrainage (Optionnel)"
              : "Referral code (Optional)"
          }
          value={referralCode}
          autoCapitalize="characters"
          error={errors.referralCode}
          onChangeText={(v) => {
            setReferralCode(v.toUpperCase().trim());
            clearFieldError("referralCode");
          }}
        />

        <Button
          title={t("signUp", language)}
          onPress={handleRegister}
          loading={loading}
          variant="primary"
          style={{ marginTop: 8 }}
        />
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {t("alreadyHaveAccount", language)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            try {
              router.push("/login");
            } catch (e) {
              router.push("/(auth)/login");
            }
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.footerLinkText}>
            {t("logIn", language)}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAvatarModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={[styles.avatarModalContent, darkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
              {t("profilePicture", language)}
            </Text>

            <TouchableOpacity
              style={styles.avatarOptionRow}
              onPress={handlePickImageFromLibrary}
            >
              <ImageIcon size={22} color="#2563EB" />
              <Text style={[styles.avatarOptionText, darkMode && styles.textDark]}>
                {t("chooseFromLibrary", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarOptionRow}
              onPress={handleTakePhoto}
            >
              <Camera size={22} color="#2563EB" />
              <Text style={[styles.avatarOptionText, darkMode && styles.textDark]}>
                {t("takePhotoWithCamera", language)}
              </Text>
            </TouchableOpacity>

            {avatarUri ? (
              <TouchableOpacity
                style={styles.avatarOptionRow}
                onPress={() => {
                  setAvatarUri(null);
                  setShowAvatarModal(false);
                }}
              >
                <X size={22} color="#DC2626" />
                <Text style={[styles.avatarOptionText, { color: "#DC2626" }]}>
                  {t("removePhoto", language)}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.cancelButtonText}>
                {t("cancel", language)}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={activePicker !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActivePicker(null)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, darkMode && styles.modalContentDark, { paddingBottom: 20 + Math.max(insets.bottom, Platform.OS === "android" ? 24 : 16) }]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
                {activePicker === "nationality"
                  ? t("selectNationality", language)
                  : t("selectResidence", language)}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={styles.modalCloseText}>
                  {t("close", language)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <TextInput
                style={[styles.searchInput, darkMode && styles.searchInputDark]}
                placeholder={t("searchCountry", language)}
                placeholderTextColor="#9CA3AF"
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected =
                  activePicker === "nationality"
                    ? nationality.code === item.code
                    : residence.code === item.code;

                return (
                  <TouchableOpacity
                    style={[styles.countryOption, darkMode && styles.countryOptionDark]}
                    onPress={() => {
                      if (activePicker === "nationality") {
                        setNationality(item);
                      } else {
                        setResidence(item);
                      }
                      setActivePicker(null);
                    }}
                  >
                    <Text style={styles.countryOptionFlag}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.countryOptionName}>
                        {getLocalizedCountryName(item)}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color="#2563EB" style={{ marginLeft: 8 }} />}
                  </TouchableOpacity>
                );
              }}
            />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
    marginBottom: 16,
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 3,
    borderColor: "#E5E7EB",
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563EB",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 6,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 6,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  pickerValueContainer: {
    flex: 1,
    justifyContent: "center",
  },
  pickerLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 1,
  },
  pickerValueText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  avatarModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  avatarOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatarOptionText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalCloseText: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
  },
  searchRow: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  countryOptionFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryOptionName: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  cardDark: {
    backgroundColor: "#1F2937",
  },
  textDark: {
    color: "#FFFFFF",
  },
  inputContainerDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  modalContentDark: {
    backgroundColor: "#1F2937",
  },
  modalHeaderDark: {
    borderBottomColor: "#374151",
  },
  searchInputDark: {
    backgroundColor: "#374151",
    color: "#FFFFFF",
  },
  countryOptionDark: {
    borderBottomColor: "#374151",
  },
});
