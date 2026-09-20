import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  Users,
  Truck,
  Building2,
  Phone,
  User,
  MapPin,
  Banknote,
  CreditCard,
  CheckCircle2,
  Info,
  ShieldCheck,
} from "lucide-react-native";
import Input from "@/components/Input";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { TunisiaDeliveryMethod, TunisiaPaymentMethod } from "@/lib/api";

interface TunisiaDeliverySectionProps {
  deliveryMethod: TunisiaDeliveryMethod | null;
  setDeliveryMethod: (m: TunisiaDeliveryMethod) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  deliveryFee: string;
  setDeliveryFee: (v: string) => void;
  paymentMethod: TunisiaPaymentMethod;
  setPaymentMethod: (m: TunisiaPaymentMethod) => void;
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
  errors: Record<string, string | undefined>;
  clearError: (field: string) => void;
  onFocusInput?: () => void;
}

export const TunisiaDeliverySection: React.FC<TunisiaDeliverySectionProps> = ({
  deliveryMethod,
  setDeliveryMethod,
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  deliveryFee,
  setDeliveryFee,
  paymentMethod,
  setPaymentMethod,
  deliveryAddress,
  setDeliveryAddress,
  errors,
  clearError,
  onFocusInput,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const isFamily = deliveryMethod === "FAMILY";
  const isCourier = deliveryMethod === "COURIER";
  const isIFastPro = deliveryMethod === "I_FAST_PRO";

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header with Tunisia Flag Badge */}
      <View style={styles.headerRow}>
        <View style={styles.flagBadge}>
          <Text style={styles.flagText}>🇹🇳</Text>
        </View>
        <View style={styles.headerTextCol}>
          <Text style={[styles.sectionTitle, darkMode && styles.textWhite]}>
            {t("tunisiaDeliveryTitle", language)}
          </Text>
          <Text style={[styles.sectionSubtitle, darkMode && styles.textMutedDark]}>
            {t("tunisiaDeliverySubtitle", language)}
          </Text>
        </View>
      </View>

      {/* Required Error Message if none selected */}
      {errors.deliveryMethod && (
        <View style={styles.errorAlert}>
          <Info size={14} color="#EF4444" />
          <Text style={styles.errorAlertText}>{errors.deliveryMethod}</Text>
        </View>
      )}

      {/* 3 Delivery Options */}
      <View style={styles.methodsContainer}>
        {/* Option 1: FAMILY */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            darkMode && styles.methodCardDark,
            isFamily && styles.methodCardActive,
          ]}
          onPress={() => {
            setDeliveryMethod("FAMILY");
            clearError("deliveryMethod");
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, isFamily && styles.iconBoxActive]}>
              <Users size={20} color={isFamily ? "#FFFFFF" : darkMode ? "#9CA3AF" : "#4B5563"} />
            </View>
            <View style={styles.cardHeaderCol}>
              <Text style={[styles.cardTitle, darkMode && styles.textWhite, isFamily && { color: primaryColor }]}>
                {t("deliveryMethodFamily", language)}
              </Text>
              <Text style={[styles.cardDesc, darkMode && styles.textMutedDark]} numberOfLines={2}>
                {t("deliveryMethodFamilyDesc", language)}
              </Text>
            </View>
            <View style={[styles.radioCircle, isFamily && styles.radioCircleActive]}>
              {isFamily && <View style={styles.radioInnerDot} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Option 2: COURIER */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            darkMode && styles.methodCardDark,
            isCourier && styles.methodCardActive,
          ]}
          onPress={() => {
            setDeliveryMethod("COURIER");
            clearError("deliveryMethod");
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, isCourier && styles.iconBoxActive]}>
              <Truck size={20} color={isCourier ? "#FFFFFF" : darkMode ? "#9CA3AF" : "#4B5563"} />
            </View>
            <View style={styles.cardHeaderCol}>
              <Text style={[styles.cardTitle, darkMode && styles.textWhite, isCourier && { color: primaryColor }]}>
                {t("deliveryMethodCourier", language)}
              </Text>
              <Text style={[styles.cardDesc, darkMode && styles.textMutedDark]} numberOfLines={2}>
                {t("deliveryMethodCourierDesc", language)}
              </Text>
            </View>
            <View style={[styles.radioCircle, isCourier && styles.radioCircleActive]}>
              {isCourier && <View style={styles.radioInnerDot} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Option 3: I_FAST_PRO */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            darkMode && styles.methodCardDark,
            isIFastPro && styles.methodCardActive,
          ]}
          onPress={() => {
            setDeliveryMethod("I_FAST_PRO");
            clearError("deliveryMethod");
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, isIFastPro && styles.iconBoxActive]}>
              <Building2 size={20} color={isIFastPro ? "#FFFFFF" : darkMode ? "#9CA3AF" : "#4B5563"} />
            </View>
            <View style={styles.cardHeaderCol}>
              <View style={styles.partnerTitleRow}>
                <Text style={[styles.cardTitle, darkMode && styles.textWhite, isIFastPro && { color: primaryColor }]}>
                  {t("deliveryMethodIFastPro", language)}
                </Text>
                <View style={styles.officialBadge}>
                  <ShieldCheck size={11} color="#059669" />
                  <Text style={styles.officialBadgeText}>{t("partnerBadge", language)}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, darkMode && styles.textMutedDark]} numberOfLines={2}>
                {t("deliveryMethodIFastProDesc", language)}
              </Text>
            </View>
            <View style={[styles.radioCircle, isIFastPro && styles.radioCircleActive]}>
              {isIFastPro && <View style={styles.radioInnerDot} />}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sub-inputs conditional on selected method */}
      {isFamily && (
        <View style={[styles.subInputsContainer, darkMode && styles.subInputsContainerDark]}>
          <Input
            label={t("contactNameLabel", language)}
            placeholder={t("contactNamePlaceholder", language)}
            value={contactName}
            onChangeText={(txt) => {
              setContactName(txt);
              clearError("deliveryContactName");
            }}
            icon={User}
            error={errors.deliveryContactName}
            onFocus={onFocusInput}
          />
          <Input
            label={t("contactPhoneLabel", language)}
            placeholder={t("contactPhonePlaceholder", language)}
            value={contactPhone}
            onChangeText={(txt) => {
              setContactPhone(txt);
              clearError("deliveryContactPhone");
            }}
            keyboardType="phone-pad"
            icon={Phone}
            error={errors.deliveryContactPhone}
            onFocus={onFocusInput}
          />
        </View>
      )}

      {isCourier && (
        <View style={[styles.subInputsContainer, darkMode && styles.subInputsContainerDark]}>
          <Input
            label={t("deliveryAddressLabel", language)}
            placeholder={t("deliveryAddressPlaceholder", language)}
            value={deliveryAddress}
            onChangeText={(txt) => {
              setDeliveryAddress(txt);
              clearError("deliveryAddress");
            }}
            icon={MapPin}
            error={errors.deliveryAddress}
            onFocus={onFocusInput}
          />
          <Input
            label={t("deliveryFeeLabel", language)}
            placeholder={t("deliveryFeePlaceholder", language)}
            value={deliveryFee}
            onChangeText={(txt) => {
              const cleaned = txt.replace(/[^0-9.]/g, "");
              setDeliveryFee(cleaned);
              clearError("deliveryFee");
            }}
            keyboardType="decimal-pad"
            icon={Banknote}
            error={errors.deliveryFee}
            rightElement={
              <Text style={[styles.currencySuffix, darkMode && styles.textMutedDark]}>TND</Text>
            }
            onFocus={onFocusInput}
          />

          {/* Payment Method Selector */}
          <Text style={[styles.subSectionLabel, darkMode && styles.textWhite]}>
            {t("paymentMethodLabel", language)}
          </Text>
          <View style={styles.paymentMethodsRow}>
            <TouchableOpacity
              style={[
                styles.paymentMethodPill,
                darkMode && styles.paymentMethodPillDark,
                paymentMethod === "CASH" && styles.paymentMethodPillActive,
              ]}
              onPress={() => setPaymentMethod("CASH")}
              activeOpacity={0.8}
            >
              <Banknote size={16} color={paymentMethod === "CASH" ? "#2563EB" : darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={[
                  styles.paymentMethodText,
                  darkMode && styles.textMutedDark,
                  paymentMethod === "CASH" && styles.paymentMethodTextActive,
                ]}
              >
                {t("payCash", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodPill,
                darkMode && styles.paymentMethodPillDark,
                paymentMethod === "CLICTOPAY" && styles.paymentMethodPillActive,
              ]}
              onPress={() => setPaymentMethod("CLICTOPAY")}
              activeOpacity={0.8}
            >
              <CreditCard size={16} color={paymentMethod === "CLICTOPAY" ? "#2563EB" : darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={[
                  styles.paymentMethodText,
                  darkMode && styles.textMutedDark,
                  paymentMethod === "CLICTOPAY" && styles.paymentMethodTextActive,
                ]}
              >
                {t("payClicToPay", language)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Courier Info Notice */}
          <View style={[styles.infoBanner, darkMode && styles.infoBannerDark]}>
            <Info size={16} color="#3B82F6" style={styles.infoIcon} />
            <Text style={[styles.infoBannerText, darkMode && styles.infoBannerTextDark]}>
              {t("courierContactNotice", language)}
            </Text>
          </View>
        </View>
      )}

      {isIFastPro && (
        <View style={[styles.subInputsContainer, darkMode && styles.subInputsContainerDark]}>
          <Input
            label={t("deliveryAddressLabel", language)}
            placeholder={t("deliveryAddressPlaceholder", language)}
            value={deliveryAddress}
            onChangeText={(txt) => {
              setDeliveryAddress(txt);
              clearError("deliveryAddress");
            }}
            icon={MapPin}
            error={errors.deliveryAddress}
            onFocus={onFocusInput}
          />

          {/* Payment Method Selector */}
          <Text style={[styles.subSectionLabel, darkMode && styles.textWhite]}>
            {t("paymentMethodLabel", language)}
          </Text>
          <View style={styles.paymentMethodsRow}>
            <TouchableOpacity
              style={[
                styles.paymentMethodPill,
                darkMode && styles.paymentMethodPillDark,
                paymentMethod === "CASH" && styles.paymentMethodPillActive,
              ]}
              onPress={() => setPaymentMethod("CASH")}
              activeOpacity={0.8}
            >
              <Banknote size={16} color={paymentMethod === "CASH" ? "#2563EB" : darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={[
                  styles.paymentMethodText,
                  darkMode && styles.textMutedDark,
                  paymentMethod === "CASH" && styles.paymentMethodTextActive,
                ]}
              >
                {t("payCash", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodPill,
                darkMode && styles.paymentMethodPillDark,
                paymentMethod === "CLICTOPAY" && styles.paymentMethodPillActive,
              ]}
              onPress={() => setPaymentMethod("CLICTOPAY")}
              activeOpacity={0.8}
            >
              <CreditCard size={16} color={paymentMethod === "CLICTOPAY" ? "#2563EB" : darkMode ? "#9CA3AF" : "#6B7280"} />
              <Text
                style={[
                  styles.paymentMethodText,
                  darkMode && styles.textMutedDark,
                  paymentMethod === "CLICTOPAY" && styles.paymentMethodTextActive,
                ]}
              >
                {t("payClicToPay", language)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* i Fast Pro Partner Banner */}
          <View style={[styles.infoBanner, styles.partnerNoticeBanner, darkMode && styles.partnerNoticeBannerDark]}>
            <ShieldCheck size={16} color="#059669" style={styles.infoIcon} />
            <Text style={[styles.infoBannerText, { color: darkMode ? "#34D399" : "#065F46" }]}>
              {t("iFastProNotice", language)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  containerDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  flagBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  flagText: {
    fontSize: 20,
  },
  headerTextCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textMutedDark: {
    color: "#9CA3AF",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    gap: 6,
  },
  errorAlertText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    flex: 1,
  },
  methodsContainer: {
    gap: 10,
  },
  methodCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  methodCardDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  methodCardActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconBoxActive: {
    backgroundColor: "#2563EB",
  },
  cardHeaderCol: {
    flex: 1,
    paddingRight: 8,
  },
  partnerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: "#2563EB",
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  subInputsContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  subInputsContainerDark: {
    borderTopColor: "#374151",
  },
  subSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  paymentMethodsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  paymentMethodPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    gap: 6,
  },
  paymentMethodPillDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  paymentMethodPillActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  paymentMethodTextActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  currencySuffix: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    paddingRight: 12,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoBannerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#1E40AF",
  },
  partnerNoticeBanner: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  partnerNoticeBannerDark: {
    backgroundColor: "#064E3B",
    borderColor: "#059669",
  },
  infoIcon: {
    marginRight: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 16,
    flex: 1,
  },
  infoBannerTextDark: {
    color: "#93C5FD",
  },
});

export default TunisiaDeliverySection;
