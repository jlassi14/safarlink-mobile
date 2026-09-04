import React from "react";
import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import { PlaneTakeoff, ChevronDown, ArrowLeftRight } from "lucide-react-native";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { createStyles as s } from "./createStyles";

interface CreateRouteCardProps {
  from: string;
  to: string;
  onOpenFrom: () => void;
  onOpenTo: () => void;
  onSwap: () => void;
  errorFrom?: string;
  errorTo?: string;
}

export const CreateRouteCard: React.FC<CreateRouteCardProps> = ({
  from,
  to,
  onOpenFrom,
  onOpenTo,
  onSwap,
  errorFrom,
  errorTo,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  return (
    <View style={[s.card, darkMode && s.cardDk]}>
      <View style={s.cardHead}>
        <View style={s.cardHeadLeft}>
          <View style={[s.iconCircle, { backgroundColor: "#EFF6FF" }]}>
            <PlaneTakeoff size={15} color={primaryColor} />
          </View>
          <Text style={[s.cardLabel, darkMode && s.tW]}>📍 {t("flightRoute", language)}</Text>
        </View>
      </View>

      <View style={s.routeGrid}>
        {/* Departure */}
        <TouchableOpacity
          style={[
            s.routeBox,
            darkMode && s.routeBoxDk,
            !!from && s.routeBoxActive,
            errorFrom ? s.routeBoxErr : null,
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onOpenFrom();
          }}
          activeOpacity={0.85}
        >
          <View style={s.routeDotBlue} />
          <View style={s.routeTextCol}>
            <Text style={s.routeFieldLabel}>{t("departureLabel", language)}</Text>
            <Text
              style={[
                s.routeFieldVal,
                darkMode && s.tW,
                !from && s.routePlaceholder,
              ]}
              numberOfLines={1}
            >
              {from || t("selectDeparturePlaceholder", language)}
            </Text>
          </View>
          <ChevronDown size={14} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Swap Button */}
        <TouchableOpacity
          style={[s.swapBtn, darkMode && s.swapBtnDk]}
          onPress={onSwap}
          activeOpacity={0.7}
        >
          <ArrowLeftRight size={14} color={primaryColor} />
        </TouchableOpacity>

        {/* Destination */}
        <TouchableOpacity
          style={[
            s.routeBox,
            darkMode && s.routeBoxDk,
            !!to && s.routeBoxActive,
            errorTo ? s.routeBoxErr : null,
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onOpenTo();
          }}
          activeOpacity={0.85}
        >
          <View style={s.routeDotOrange} />
          <View style={s.routeTextCol}>
            <Text style={s.routeFieldLabel}>{t("destinationLabel", language)}</Text>
            <Text
              style={[
                s.routeFieldVal,
                darkMode && s.tW,
                !to && s.routePlaceholder,
              ]}
              numberOfLines={1}
            >
              {to || t("selectDestinationPlaceholder", language)}
            </Text>
          </View>
          <ChevronDown size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {errorFrom ? <Text style={s.errText}>{errorFrom}</Text> : null}
      {errorTo ? <Text style={s.errText}>{errorTo}</Text> : null}
    </View>
  );
};

export default CreateRouteCard;
