import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { Search, Check, Coins, X } from "lucide-react-native";
import BottomSheetModal from "./BottomSheetModal";
import { CURRENCIES_LIST, CurrencyOption } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onSelectCurrency: (currency: CurrencyOption) => void;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}) => {
  const { language, darkMode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const primaryColor = colors.primary || "#2563EB";

  const getCurrencyName = (c: CurrencyOption) => {
    if (language === "ar") return c.nameAr;
    if (language === "fr") return c.nameFr;
    return c.name;
  };

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return CURRENCIES_LIST;

    return CURRENCIES_LIST.filter((c) => {
      return (
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.nameAr.toLowerCase().includes(q) ||
        c.nameFr.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  // Auto-clear search query when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const handleSelect = (item: CurrencyOption) => {
    onSelectCurrency(item);
    handleClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View style={[styles.header, darkMode && styles.headerDk]}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
            <Coins size={18} color={primaryColor} />
          </View>
          <Text style={[styles.title, darkMode && styles.tW]}>
            {t("selectCurrencyTitle", language)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtn}>{t("close", language)}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, darkMode && styles.searchBoxDk]}>
        <Search size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, darkMode && styles.tW]}
          placeholder={t("searchCurrencyPlaceholder", language)}
          placeholderTextColor="#9CA3AF"
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

      {/* Currency List */}
      <FlatList
        data={filteredCurrencies}
        keyExtractor={(item) => item.code}
        showsVerticalScrollIndicator={false}
        style={[styles.list, isKeyboardVisible && { maxHeight: 180 }]}
        contentContainerStyle={{ paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => {
          const isSelected = selectedCurrency.toUpperCase() === item.code.toUpperCase();

          return (
            <TouchableOpacity
              style={[
                styles.itemRow,
                darkMode && styles.itemRowDk,
                isSelected && (darkMode ? styles.itemRowSelectedDk : styles.itemRowSelected),
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.itemInfo}>
                  <View style={styles.codeRow}>
                    <Text style={[styles.code, darkMode && styles.tW, isSelected && styles.selectedText]}>
                      {item.code}
                    </Text>
                    <View style={[styles.symbolBadge, darkMode && styles.symbolBadgeDk]}>
                      <Text style={[styles.symbolText, darkMode && styles.symbolTextDk]}>
                        {item.symbol}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.name, darkMode && styles.nameDk]} numberOfLines={1}>
                    {getCurrencyName(item)}
                  </Text>
                </View>
              </View>

              {isSelected ? (
                <View style={[styles.checkCircle, { backgroundColor: primaryColor }]}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 12,
  },
  headerDk: {
    borderBottomColor: "#374151",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  tW: {
    color: "#FFFFFF",
  },
  closeBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    marginBottom: 12,
  },
  searchBoxDk: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  list: {
    maxHeight: 320,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemRowDk: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  itemRowSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  itemRowSelectedDk: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 22,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  code: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  selectedText: {
    color: "#2563EB",
  },
  symbolBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  symbolBadgeDk: {
    backgroundColor: "#374151",
  },
  symbolText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  symbolTextDk: {
    color: "#D1D5DB",
  },
  name: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  nameDk: {
    color: "#9CA3AF",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

export default CurrencyPickerModal;
