import React from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { Weight, DollarSign, Calendar, ChevronDown } from "lucide-react-native";
import Input from "@/components/Input";
import DatePickerInput from "@/components/DatePickerInput";
import TimePickerInput from "@/components/TimePickerInput";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { CURRENCIES_LIST, CurrencyOption } from "@/lib/constants";
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
  currency: string;
  onOpenCurrencyModal: () => void;
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

  const currencyObj =
    CURRENCIES_LIST.find((c) => c.code.toUpperCase() === currency.toUpperCase()) ||
    CURRENCIES_LIST[0];

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
                    {currencyObj.symbol}
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
      </View>
    </>
  );
};

export default CreateOfferForm;
