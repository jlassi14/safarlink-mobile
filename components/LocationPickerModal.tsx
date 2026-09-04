import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X, Check, MapPin } from "lucide-react-native";
import BottomSheetModal from "./BottomSheetModal";
import { POPULAR_LOCATIONS, LocationOption } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { colors } from "@/lib/theme";

interface LocationPickerModalProps {
  visible: boolean;
  mode: "from" | "to" | null;
  selectedLocation: string;
  excludedLocation?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  mode,
  selectedLocation,
  excludedLocation,
  onSelect,
  onClose,
}) => {
  const { language, darkMode } = useAppStore();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const primaryColor = colors.primary || "#2563EB";

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Auto-clear search when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const filteredLocations = useMemo(() => {
    let list = POPULAR_LOCATIONS;

    // Filter out locations that share the country of excludedLocation
    if (excludedLocation && excludedLocation.trim()) {
      const exclLower = excludedLocation.toLowerCase();
      list = list.filter((loc) => {
        const countryMatch =
          exclLower.includes(loc.country.toLowerCase()) ||
          exclLower.includes(loc.countryAr) ||
          loc.country.toLowerCase().includes(exclLower) ||
          loc.countryAr.includes(exclLower);
        return !countryMatch;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((loc) => {
      return (
        loc.country.toLowerCase().includes(q) ||
        loc.countryAr.includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.cityAr.includes(q) ||
        loc.airport.toLowerCase().includes(q) ||
        loc.airportAr.includes(q) ||
        loc.formatted.toLowerCase().includes(q) ||
        loc.formattedAr.includes(q)
      );
    });
  }, [searchQuery, excludedLocation]);

  const handleSelect = (item: LocationOption) => {
    const value = language === "ar" ? item.formattedAr : item.formatted;
    onSelect(value);
    handleClose();
  };

  const getCityName = (loc: LocationOption) => (language === "ar" ? loc.cityAr : loc.city);
  const getCountryName = (loc: LocationOption) => (language === "ar" ? loc.countryAr : loc.country);
  const getAirportName = (loc: LocationOption) => (language === "ar" ? loc.airportAr : loc.airport);

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
            <MapPin size={18} color={primaryColor} />
          </View>
          <Text style={[styles.title, darkMode && styles.textDark]}>
            {mode === "from"
              ? t("selectDepartureTitle", language)
              : t("selectDestinationTitle", language)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.closeBtn, darkMode && styles.closeBtnDark]}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={darkMode ? "#FFFFFF" : "#1F2937"} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
        <Search size={16} color="#9CA3AF" />
        <TextInput
          style={[styles.searchInput, darkMode && styles.textDark]}
          placeholder={t("searchLocationPlaceholder", language)}
          placeholderTextColor={darkMode ? "#6B7280" : "#9CA3AF"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Locations List */}
      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={[styles.list, isKeyboardVisible && { maxHeight: 220 }]}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => {
          const locStr = selectedLocation || "";
          const isSelected =
            (item.city && locStr.includes(item.city)) ||
            (item.cityAr && locStr.includes(item.cityAr));

          return (
            <TouchableOpacity
              style={[
                styles.locationItem,
                darkMode && styles.locationItemDark,
                isSelected && (darkMode ? styles.locationItemSelectedDark : styles.locationItemSelected),
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.flagEmoji}>{item.flag}</Text>
              <View style={styles.locationInfo}>
                <View style={styles.cityRow}>
                  <Text style={[styles.locationLabel, darkMode && styles.textDark, isSelected && styles.selectedLabel]}>
                    {getCityName(item)}, {getCountryName(item)}
                  </Text>
                </View>
                <Text style={[styles.locationSub, darkMode && styles.locationSubDark]} numberOfLines={1}>
                  {getAirportName(item)}
                </Text>
              </View>
              {isSelected && (
                <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, darkMode && styles.textDark]}>
              {t("noLocationMatches", language)}
            </Text>
          </View>
        }
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerDark: {
    borderBottomColor: "#374151",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginLeft: 8,
  },
  closeBtnDark: {
    backgroundColor: "#374151",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  searchBarDark: {
    backgroundColor: "#374151",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  list: {
    maxHeight: 380,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 10,
  },
  locationItemDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  locationItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  locationItemSelectedDark: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  flagEmoji: {
    fontSize: 22,
  },
  locationInfo: {
    flex: 1,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  selectedLabel: {
    color: "#2563EB",
  },
  locationSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  locationSubDark: {
    color: "#9CA3AF",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  textDark: {
    color: "#FFFFFF",
  },
});

export default LocationPickerModal;
