import React from "react";
import { View, Text, Platform } from "react-native";
import { Weight, DollarSign, Calendar, Info } from "lucide-react-native";
import Input from "@/components/Input";
import DatePickerInput from "@/components/DatePickerInput";
import TimePickerInput from "@/components/TimePickerInput";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { createStyles as s } from "./createStyles";

interface CreateOfferFormProps {
  depDate: Date | null;
  setDepDate: (d: Date | null) => void;
  depTime: string;
  setDepTime: (t: string) => void;
  arrDate: Date | null;
  setArrDate: (d: Date | null) => void;
  arrTime: string;
  setArrTime: (t: string) => void;
  offerKg: string;
  setOfferKg: (v: string) => void;
  priceKg: string;
  setPriceKg: (v: string) => void;
  currency?: string;
  onOpenCurrencyModal?: () => void;
  onFocusInput: () => void;
  errors: Record<string, string | undefined>;
  clearError: (field: string) => void;
}

export const CreateOfferForm: React.FC<CreateOfferFormProps> = ({
  depDate,
  setDepDate,
  depTime,
  setDepTime,
  arrDate,
  setArrDate,
  arrTime,
  setArrTime,
  offerKg,
  setOfferKg,
  priceKg,
  setPriceKg,
  currency,
  onOpenCurrencyModal,
  onFocusInput,
  errors,
  clearError,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const numOnly = (str: string) => {
    const c = str.replace(/[^0-9.]/g, "");
    const p = c.split(".");
    return p.length > 2 ? p[0] + "." + p.slice(1).join("") : c;
  };

  const getPriceLabel = () => {
    if (language === "ar") return `السعر / كغ *`;
    if (language === "fr") return `Prix / kg *`;
    return `Price / kg *`;
  };

  const getCapacityLabel = () => {
    if (language === "ar") return `السعة (كغ) *`;
    if (language === "fr") return `Capacité (kg) *`;
    return `Capacity (kg) *`;
  };

  return (
    <>
      {/* Flight Schedule Card */}
      <View style={[s.card, darkMode && s.cardDk]}>
        <View style={s.cardHead}>
          <View style={s.cardHeadLeft}>
            <View style={[s.iconCircle, { backgroundColor: "#F5F3FF" }]}>
              <Calendar size={15} color="#7C3AED" />
            </View>
            <Text style={[s.cardLabel, darkMode && s.tW]}>📅 {t("flightSchedule", language)}</Text>
          </View>
        </View>

        <View style={s.responsiveRow}>
          <View style={s.rowItemLarge}>
            <DatePickerInput
              label={t("travelDateLabel", language)}
              value={depDate}
              language={language}
              mode="future"
              minDate={new Date()}
              onChange={(d) => {
                setDepDate(d);
                if (errors.date) clearError("date");
                if (arrDate && d && arrDate < d) {
                  setArrDate(d);
                }
              }}
              error={errors.date}
            />
          </View>
          <View style={s.rowItemSmall}>
            <TimePickerInput
              label={t("departureTimeLabel", language)}
              value={depTime}
              language={language}
              onChange={setDepTime}
            />
          </View>
        </View>

        <View style={[s.responsiveRow, { marginTop: 4 }]}>
          <View style={s.rowItemLarge}>
            <DatePickerInput
              label={t("destinationDateLabel", language)}
              value={arrDate}
              language={language}
              mode="future"
              minDate={depDate || new Date()}
              disabled={!depDate}
              onChange={(d) => {
                setArrDate(d);
                if (errors.arrDate) clearError("arrDate");
              }}
              error={errors.arrDate}
            />
          </View>
          <View style={s.rowItemSmall}>
            <TimePickerInput
              label={t("destinationTimeLabel", language)}
              value={arrTime}
              language={language}
              onChange={setArrTime}
            />
          </View>
        </View>
      </View>

      {/* Baggage Capacity & Pricing Card */}
      <View style={[s.card, darkMode && s.cardDk]}>
        <View style={s.cardHead}>
          <View style={s.cardHeadLeft}>
            <View style={[s.iconCircle, { backgroundColor: "#EFF6FF" }]}>
              <Weight size={15} color={primaryColor} />
            </View>
            <Text style={[s.cardLabel, darkMode && s.tW]}>⚖️ {t("baggagePricing", language)}</Text>
          </View>

        </View>

        <View style={s.responsiveRow}>
          <View style={s.flex1}>
            <Input
              icon={Weight}
              label={getCapacityLabel()}
              placeholder={t("capacityPlaceholder", language)}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              inputMode="decimal"
              value={offerKg}
              onFocus={onFocusInput}
              onChangeText={(v) => {
                setOfferKg(numOnly(v));
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
                    $
                  </Text>
                </View>
              }
              label={getPriceLabel()}
              placeholder={t("pricePlaceholder", language)}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              inputMode="decimal"
              value={priceKg}
              onFocus={onFocusInput}
              onChangeText={(v) => {
                setPriceKg(numOnly(v));
                if (errors.price) clearError("price");
              }}
              error={errors.price}
            />
          </View>
        </View>

        {/* Currency Info Note */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: darkMode ? "#1E293B" : "#F0F9FF",
            borderWidth: 1,
            borderColor: darkMode ? "#334155" : "#BAE6FD",
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Info size={15} color="#0284C7" />
          <Text
            style={{
              fontSize: 12,
              color: darkMode ? "#94A3B8" : "#0369A1",
              fontWeight: "500",
              flex: 1,
            }}
          >
            {language === "ar"
              ? "جميع الأسعار والمعاملات على المنصة تُحسب بالدولار الأمريكي ($ USD)."
              : "Tous les tarifs et transactions sur SafarLink sont traités en Dollar américain ($ USD)."}
          </Text>
        </View>
      </View>
    </>
  );
};

export default CreateOfferForm;
