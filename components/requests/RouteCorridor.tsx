import React from "react";
import { View, Text } from "react-native";
import { Plane } from "lucide-react-native";
import { styles } from "@/styles/requestsStyles";
import { useAppStore } from "@/lib/store";

interface RouteCorridorProps {
  from: string;
  to: string;
  primaryColor: string;
  darkMode: boolean;
  showLabels?: boolean;
}

export const extractLocationInfo = (loc: string) => {
  if (!loc) return { city: "", country: "", flag: "✈️" };

  // Detect flag if already present
  let flag = "";
  const flagRegex = /[\uD83C][\uDDE6-\uDDFF]{2}/u;
  const match = loc.match(flagRegex);
  if (match) {
    flag = match[0];
  }

  // Clean location string from emoji flags
  const cleanLoc = loc.replace(/[\uD83C][\uDDE6-\uDDFF]{2}/gu, "").trim();

  let country = "";
  let city = "";

  if (cleanLoc.includes(" - ")) {
    const parts = cleanLoc.split(" - ");
    country = parts[0].trim();
    city = parts.slice(1).join(" - ").trim();
  } else if (cleanLoc.includes("-")) {
    const parts = cleanLoc.split("-");
    country = parts[0].trim();
    city = parts.slice(1).join("-").trim();
  } else {
    city = cleanLoc;
  }

  // Auto-detect flag from country or city name if not already found
  if (!flag) {
    const lower = (country + " " + city + " " + loc).toLowerCase();
    if (lower.includes("tunis") || lower.includes("تونس") || lower.includes("monastir") || lower.includes("sfax") || lower.includes("djerba") || lower.includes("sousse")) {
      flag = "🇹🇳";
    } else if (lower.includes("qatar") || lower.includes("doha") || lower.includes("قطر") || lower.includes("الدوحة")) {
      flag = "🇶🇦";
    } else if (lower.includes("france") || lower.includes("paris") || lower.includes("فرنسا") || lower.includes("باريس")) {
      flag = "🇫🇷";
    } else if (lower.includes("turkey") || lower.includes("turqui") || lower.includes("istanbul") || lower.includes("ankara") || lower.includes("تركيا") || lower.includes("إسطنبول")) {
      flag = "🇹🇷";
    } else if (lower.includes("saudi") || lower.includes("jeddah") || lower.includes("riyadh") || lower.includes("السعودية") || lower.includes("جدة") || lower.includes("الرياض")) {
      flag = "🇸🇦";
    } else if (lower.includes("uae") || lower.includes("dubai") || lower.includes("abu dhabi") || lower.includes("emirates") || lower.includes("الإمارات") || lower.includes("دبي") || lower.includes("أبوظبي")) {
      flag = "🇦🇪";
    } else if (lower.includes("kuwait") || lower.includes("الكويت")) {
      flag = "🇰🇼";
    } else if (lower.includes("oman") || lower.includes("muscat") || lower.includes("عمان") || lower.includes("مسقط")) {
      flag = "🇴🇲";
    } else if (lower.includes("bahrain") || lower.includes("manama") || lower.includes("البحرين")) {
      flag = "🇧🇭";
    } else if (lower.includes("alger") || lower.includes("oran") || lower.includes("الجزائر") || lower.includes("وهران")) {
      flag = "🇩🇿";
    } else if (lower.includes("morocco") || lower.includes("maroc") || lower.includes("casablanca") || lower.includes("marrakech") || lower.includes("المغرب")) {
      flag = "🇲🇦";
    } else if (lower.includes("libya") || lower.includes("tripoli") || lower.includes("ليبيا") || lower.includes("طرابلس")) {
      flag = "🇱🇾";
    } else if (lower.includes("mauritani") || lower.includes("nouakchott") || lower.includes("موريتانيا")) {
      flag = "🇲🇷";
    } else if (lower.includes("canada") || lower.includes("montreal") || lower.includes("toronto") || lower.includes("كندا")) {
      flag = "🇨🇦";
    } else if (lower.includes("egypt") || lower.includes("cairo") || lower.includes("مصر") || lower.includes("القاهرة")) {
      flag = "🇪🇬";
    } else if (lower.includes("germany") || lower.includes("allemagne") || lower.includes("berlin") || lower.includes("ألمانيا")) {
      flag = "🇩🇪";
    } else if (lower.includes("ital") || lower.includes("rome") || lower.includes("إيطاليا")) {
      flag = "🇮🇹";
    } else if (lower.includes("spain") || lower.includes("espagne") || lower.includes("madrid") || lower.includes("barcelona") || lower.includes("إسبانيا")) {
      flag = "🇪🇸";
    } else if (lower.includes("uk") || lower.includes("london") || lower.includes("londres") || lower.includes("بريطانيا") || lower.includes("لندن")) {
      flag = "🇬🇧";
    } else if (lower.includes("usa") || lower.includes("america") || lower.includes("أمريكا") || lower.includes("new york")) {
      flag = "🇺🇸";
    } else {
      flag = "✈️";
    }
  }

  return { city, country, flag };
};

export const getCountryFlag = (locStr: string): string => {
  return extractLocationInfo(locStr).flag;
};

export const RouteCorridor: React.FC<RouteCorridorProps> = ({
  from,
  to,
  primaryColor,
  darkMode,
  showLabels = false,
}) => {
  const { language } = useAppStore();
  const fromInfo = extractLocationInfo(from);
  const toInfo = extractLocationInfo(to);

  return (
    <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
      {/* ── Left Location (Départ) ── */}
      <View style={styles.routeLocCol}>
        {showLabels && (
          <Text style={[styles.routeCityLabel, { marginBottom: 3 }]}>
            {language === "ar" ? "من (الإنطلاق)" : "Départ"}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text style={{ fontSize: 16 }}>{fromInfo.flag}</Text>
          <Text
            style={[
              styles.routeCityPrimary,
              showLabels && { fontSize: 15 },
              { flexShrink: 1 },
              darkMode && styles.textDark,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {fromInfo.city || from}
          </Text>
        </View>
        {fromInfo.country ? (
          <Text
            style={[styles.routeCountrySecondary, showLabels && { fontSize: 11.5 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {fromInfo.country}
          </Text>
        ) : null}
      </View>

      {/* ── Flight Track Center (Solid Line + Centered Airplane Badge) ── */}
      <View style={styles.routeFlightTrack}>
        <View style={styles.routeTrackLine} />
        <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
          <Plane size={11} color="#FFFFFF" style={{ transform: [{ rotate: "45deg" }] }} />
        </View>
      </View>

      {/* ── Right Location (Arrivée) ── */}
      <View style={[styles.routeLocCol, styles.alignRight]}>
        {showLabels && (
          <Text style={[styles.routeCityLabel, styles.textRight, { marginBottom: 3 }]}>
            {language === "ar" ? "إلى (الوصول)" : "Arrivée"}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
          <Text
            style={[
              styles.routeCityPrimary,
              styles.textRight,
              showLabels && { fontSize: 15 },
              { flexShrink: 1 },
              darkMode && styles.textDark,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {toInfo.city || to}
          </Text>
          <Text style={{ fontSize: 16 }}>{toInfo.flag}</Text>
        </View>
        {toInfo.country ? (
          <Text
            style={[styles.routeCountrySecondary, styles.textRight, showLabels && { fontSize: 11.5 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {toInfo.country}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
