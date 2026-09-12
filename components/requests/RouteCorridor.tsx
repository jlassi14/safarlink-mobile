import React from "react";
import { View, Text } from "react-native";
import { Plane } from "lucide-react-native";
import { styles } from "@/styles/requestsStyles";

interface RouteCorridorProps {
  from: string;
  to: string;
  primaryColor: string;
  darkMode: boolean;
}

export const RouteCorridor: React.FC<RouteCorridorProps> = ({
  from,
  to,
  primaryColor,
  darkMode,
}) => {
  const renderLocation = (loc: string, isRight: boolean = false) => {
    if (!loc) return null;
    const parts = loc.split(" - ");
    if (parts.length >= 2) {
      const country = parts[0].trim();
      const city = parts.slice(1).join(" - ").trim();
      return (
        <View style={[styles.routeLocCol, isRight && styles.alignRight]}>
          <Text
            style={[styles.routeCityPrimary, isRight && styles.textRight, darkMode && styles.textDark]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {city}
          </Text>
          <Text
            style={[styles.routeCountrySecondary, isRight && styles.textRight]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {country}
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.routeLocCol, isRight && styles.alignRight]}>
        <Text
          style={[styles.routeCityPrimary, isRight && styles.textRight, darkMode && styles.textDark]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {loc}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.routeTimelineBox, darkMode && styles.routeTimelineBoxDark]}>
      {renderLocation(from, false)}
      <View style={styles.routeFlightTrack}>
        <View style={styles.routeTrackLine} />
        <View style={[styles.planeIconBadge, { backgroundColor: primaryColor }]}>
          <Plane size={11} color="#FFFFFF" />
        </View>
      </View>
      {renderLocation(to, true)}
    </View>
  );
};
