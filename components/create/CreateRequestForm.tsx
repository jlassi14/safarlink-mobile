import React from "react";
import { View, Text, Platform, TouchableOpacity, TextInput } from "react-native";
import { Weight, DollarSign, Package, Calendar, ChevronDown } from "lucide-react-native";
import Input from "@/components/Input";
import DatePickerInput from "@/components/DatePickerInput";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { CURRENCIES_LIST, CurrencyOption } from "@/lib/constants";
import { createStyles as s } from "./createStyles";

interface CreateRequestFormProps {
  reqDate: Date | null;
  setReqDate: (d: Date | null) => void;
  pkgKg: string;
  setPkgKg: (v: string) => void;
  reward: string;
  setReward: (v: string) => void;
  currency: string;
  onOpenCurrencyModal: () => void;
  desc?: string;
  setDesc?: (v: string) => void;
  onFocusInput: () => void;
  errors: Record<string, string | undefined>;
  clearError: (field: string) => void;
}

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({
  reqDate,
  setReqDate,
  pkgKg,
  setPkgKg,
  reward,
  setReward,
  currency,
  onOpenCurrencyModal,
  desc,
  setDesc,
  onFocusInput,
  errors,
  clearError,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const currencyObj =
    CURRENCIES_LIST.find((c) => c.code.toUpperCase() === currency.toUpperCase()) ||
    CURRENCIES_LIST[0];

  const numOnly = (str: string) => {
    const c = str.replace(/[^0-9.]/g, "");
    const p = c.split(".");
    return p.length > 2 ? p[0] + "." + p.slice(1).join("") : c;
  };

  const getRewardLabel = () => {
    if (language === "ar") return `المكافأة المقترحة *`;
    if (language === "fr") return `Récompense proposée *`;
    return `Proposed reward *`;
  };

  const getWeightLabel = () => {
    if (language === "ar") return `الوزن (كغ) *`;
    if (language === "fr") return `Poids (kg) *`;
    return `Weight (kg) *`;
  };

  return (
    <>
      {/* Preferred Date Card */}
      <View style={[s.card, darkMode && s.cardDk]}>
        <View style={s.cardHead}>
          <View style={s.cardHeadLeft}>
            <View style={[s.iconCircle, { backgroundColor: "#F5F3FF" }]}>
              <Calendar size={15} color="#7C3AED" />
            </View>
            <Text style={[s.cardLabel, darkMode && s.tW]}>📅 {t("preferredDateLabel", language)}</Text>
          </View>
        </View>
        <DatePickerInput
          label={t("preferredDateLabel", language)}
          value={reqDate}
          language={language}
          mode="future"
          minDate={new Date()}
          onChange={(d) => {
            setReqDate(d);
            if (errors.date) clearError("date");
          }}
          error={errors.date}
        />
      </View>

      {/* Package Info Card */}
      <View style={[s.card, darkMode && s.cardDk]}>
        <View style={s.cardHead}>
          <View style={s.cardHeadLeft}>
            <View style={[s.iconCircle, { backgroundColor: "#EFF6FF" }]}>
              <Package size={15} color={primaryColor} />
            </View>
            <Text style={[s.cardLabel, darkMode && s.tW]}>📦 {t("packageInfo", language)}</Text>
          </View>

          {/* Dedicated Currency Selector Badge in Card Header */}
          <TouchableOpacity
            style={[s.currencyBadge, darkMode && s.currencyBadgeDk]}
            onPress={onOpenCurrencyModal}
            activeOpacity={0.7}
          >
            <Text style={s.currencyBadgeFlag}>{currencyObj.flag}</Text>
            <Text style={[s.currencyBadgeText, darkMode && s.currencyBadgeTextDk]}>
              {currencyObj.code}
            </Text>
            <ChevronDown size={12} color={darkMode ? "#60A5FA" : "#2563EB"} />
          </TouchableOpacity>
        </View>

        <View style={s.responsiveRow}>
          <View style={s.flex1}>
            <Input
              icon={Weight}
              label={getWeightLabel()}
              placeholder={t("packageWeightPlaceholder", language)}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              inputMode="decimal"
              value={pkgKg}
              onFocus={onFocusInput}
              onChangeText={(v) => {
                setPkgKg(numOnly(v));
                if (errors.weight) clearError("weight");
              }}
              error={errors.weight}
            />
          </View>

          <View style={s.flex1}>
            <Input
              leftElement={
                <View style={[s.currencyPrefixBox, darkMode && s.currencyPrefixBoxDk]}>
                  <Text style={[s.currencyPrefixText, darkMode && s.currencyPrefixTextDk]}>
                    {currencyObj.symbol}
                  </Text>
                </View>
              }
              label={getRewardLabel()}
              placeholder={language === "ar" ? "مثلاً 50" : language === "fr" ? "Ex: 50" : "Ex: 50"}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              inputMode="decimal"
              value={reward}
              onFocus={onFocusInput}
              onChangeText={(v) => {
                setReward(numOnly(v));
                if (errors.price) clearError("price");
              }}
              error={errors.price}
            />
          </View>
        </View>

        {/* Optional Description / Package Details */}
        {setDesc && (
          <View style={{ marginTop: 10 }}>
            <Text style={[s.fieldLabel, darkMode && s.tW]}>
              📝 {language === "ar" ? "تفاصيل الشحنة (اختياري)" : language === "fr" ? "Détails du colis (optionnel)" : "Package details (optional)"}
            </Text>
            <TextInput
              style={[s.textarea, darkMode && s.textareaDk]}
              placeholder={
                language === "ar"
                  ? "وصف المحتوى (ملابس، وثائق، هدايا...)"
                  : language === "fr"
                  ? "Description du contenu (vêtements, documents, cadeaux...)"
                  : "Content description (clothes, documents, gifts...)"
              }
              placeholderTextColor={darkMode ? "#64748B" : "#94A3B8"}
              value={desc || ""}
              onChangeText={setDesc}
              multiline
              numberOfLines={2}
              onFocus={onFocusInput}
            />
          </View>
        )}
      </View>
    </>
  );
};

export default CreateRequestForm;
