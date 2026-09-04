import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, ChevronDown, Check } from "lucide-react-native";
import { Language, t } from "@/lib/i18n";
import { COUNTRIES_LIST, CountryPhoneSchema } from "@/lib/constants";
import { useAppStore } from "@/lib/store";

export { type CountryPhoneSchema, COUNTRIES_LIST };

export const formatPhoneByMask = (rawInput: string, mask: string): string => {
  const cleanDigits = rawInput.replace(/\D/g, "");
  let formatted = "";
  let digitIdx = 0;

  for (let i = 0; i < mask.length && digitIdx < cleanDigits.length; i++) {
    if (mask[i] === "X") {
      formatted += cleanDigits[digitIdx];
      digitIdx++;
    } else {
      formatted += mask[i];
    }
  }

  return formatted;
};

export interface PhoneInputProps {
  value: string;
  country: CountryPhoneSchema;
  onValueChange: (formattedValue: string, rawDigits: string) => void;
  onCountryChange: (country: CountryPhoneSchema) => void;
  error?: string;
  language?: Language;
  containerStyle?: object;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  country,
  onValueChange,
  onCountryChange,
  error,
  language = "en",
  containerStyle,
}) => {
  const darkMode = useAppStore((state) => state.darkMode);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 24 : 16);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const handleTextChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, country.digitsCount);
    const formatted = formatPhoneByMask(digitsOnly, country.mask);
    onValueChange(formatted, digitsOnly);
  };

  const handleKeyPress = (e: any) => {
    if (Platform.OS === "web" && e.nativeEvent) {
      const key = e.nativeEvent.key;
      const isControlKey = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Enter",
        "Home",
        "End",
      ].includes(key);
      if (!isControlKey && key && key.length === 1 && !/^\d$/.test(key)) {
        if (typeof e.preventDefault === "function") {
          e.preventDefault();
        }
      }
    }
  };

  const filteredCountries = COUNTRIES_LIST.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nameAr.includes(q) ||
      item.nameFr.toLowerCase().includes(q) ||
      item.dialCode.includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  const getLocalizedCountryName = (c: CountryPhoneSchema) => {
    if (language === "ar") return c.nameAr;
    if (language === "fr") return c.nameFr;
    return c.name;
  };

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          darkMode && styles.inputContainerDark,
          !!error && (darkMode ? styles.inputContainerErrorDark : styles.inputContainerError),
        ]}
      >
        <Phone
          size={20}
          color={error ? "#EF4444" : darkMode ? "#9CA3AF" : "#6B7280"}
          style={styles.inputIcon}
        />

        {/* Country Code Trigger Badge */}
        <TouchableOpacity
          style={[styles.countryBadge, darkMode && styles.countryBadgeDark]}
          onPress={() => {
            setSearch("");
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.countryFlag}>{country.flag}</Text>
          <Text style={[styles.countryDial, darkMode && styles.textDark]}>{country.dialCode}</Text>
          <ChevronDown size={14} color={darkMode ? "#FFFFFF" : "#6B7280"} />
        </TouchableOpacity>

        <View style={styles.verticalSeparator} />

        <TextInput
          style={[styles.textInput, darkMode && styles.textInputDark]}
          placeholder={country.placeholder || country.mask}
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={value}
          maxLength={country.mask.length}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
        />
      </View>

      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, darkMode && styles.modalContentDark, { paddingBottom: 20 + bottomInset }]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
                {t("selectCountryCode", language)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = country.code === item.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryOption, darkMode && styles.countryOptionDark]}
                    onPress={() => {
                      onCountryChange(item);
                      onValueChange("", "");
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.countryOptionFlag}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.countryOptionName, darkMode && styles.textDark]}>
                        {getLocalizedCountryName(item)}
                      </Text>
                    </View>
                    <Text style={styles.countryDialText}>{item.dialCode}</Text>
                    {isSelected && (
                      <Check size={18} color="#2563EB" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  inputContainerDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputContainerErrorDark: {
    borderColor: "#EF4444",
    backgroundColor: "#3A1B1B",
  },
  inputIcon: {
    marginRight: 10,
  },
  countryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginRight: 8,
  },
  countryBadgeDark: {
    backgroundColor: "#4B5563",
  },
  countryFlag: {
    fontSize: 16,
  },
  countryDial: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  textDark: {
    color: "#FFFFFF",
  },
  verticalSeparator: {
    width: 1,
    height: 20,
    backgroundColor: "#D1D5DB",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  textInputDark: {
    color: "#FFFFFF",
  },
  fieldErrorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4,
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
    maxHeight: "75%",
    padding: 20,
  },
  modalContentDark: {
    backgroundColor: "#1F2937",
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
  modalHeaderDark: {
    borderBottomColor: "#374151",
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
  searchInputDark: {
    backgroundColor: "#374151",
    color: "#FFFFFF",
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  countryOptionDark: {
    borderBottomColor: "#374151",
  },
  countryOptionFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryOptionName: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
  },
  countryDialText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "700",
  },
});

export default PhoneInput;
