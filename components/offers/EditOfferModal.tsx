import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { X, ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import Input from "@/components/Input";
import Button from "@/components/Button";
import DatePickerInput from "@/components/DatePickerInput";
import CurrencyPickerModal from "@/components/CurrencyPickerModal";
import { OfferItem } from "@/lib/mockData";
import { CURRENCIES_LIST, CurrencyOption } from "@/lib/constants";

export interface EditOfferModalProps {
  visible: boolean;
  offer: OfferItem | null;
  onClose: () => void;
  onSave: (data: {
    totalKg: number;
    pricePerKg: string;
    currency: string;
    flightDate: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function EditOfferModal({
  visible,
  offer,
  onClose,
  onSave,
  loading = false,
}: EditOfferModalProps) {
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  const scrollRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [editTotalKg, setEditTotalKg] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCurrency, setEditCurrency] = useState("QAR");
  const [editFlightDateObj, setEditFlightDateObj] = useState<Date | null>(null);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (offer) {
      setEditTotalKg(offer.totalKg ? offer.totalKg.toString() : "");

      // Extract numeric price and currency cleanly
      const rawPrice = offer.pricePerKg || "35";
      const cleanNum = rawPrice.replace(/[^0-9.]/g, "") || "35";
      setEditPrice(cleanNum);

      const foundCurrency = CURRENCIES_LIST.find((c) =>
        rawPrice.toUpperCase().includes(c.code)
      );
      setEditCurrency(foundCurrency ? foundCurrency.code : "QAR");

      // Parse date
      const dateStr = offer.departureDate || offer.flightDate;
      if (dateStr) {
        const d = new Date(dateStr);
        setEditFlightDateObj(isNaN(d.getTime()) ? new Date() : d);
      } else {
        setEditFlightDateObj(new Date());
      }
    }
  }, [offer]);

  if (!offer) return null;

  const currentCurrencyObj: CurrencyOption =
    CURRENCIES_LIST.find(
      (c) => c.code.toUpperCase() === editCurrency.toUpperCase()
    ) || CURRENCIES_LIST[0];

  const handleSave = async () => {
    const parsedKg = parseFloat(editTotalKg) || offer.totalKg;
    const formattedPrice = `${editCurrency} ${editPrice || "0"} / kg`;
    const dateToSave = editFlightDateObj
      ? editFlightDateObj.toISOString().split("T")[0]
      : offer.departureDate || offer.flightDate;

    await onSave({
      totalKg: parsedKg,
      pricePerKg: formattedPrice,
      currency: editCurrency,
      flightDate: dateToSave,
    });
  };

  const numOnly = (str: string) => {
    const c = str.replace(/[^0-9.]/g, "");
    const p = c.split(".");
    return p.length > 2 ? p[0] + "." + p.slice(1).join("") : c;
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <Pressable style={styles.modalOverlay} onPress={onClose}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.modalContent,
                darkMode && styles.modalContentDark,
                { paddingBottom: Math.max(insets.bottom, 20) + 12 },
              ]}
            >
              {/* Header */}
              <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
                <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
                  {t("editOfferTitle", language)}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={20} color={darkMode ? "#FFFFFF" : "#6B7280"} />
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20,
                }}
              >
                {/* Route Corridor Banner */}
                <View style={[styles.summaryBox, darkMode && styles.summaryBoxDark]}>
                  <Text style={[styles.routeText, { color: primaryColor }]}>
                    {offer.from} ➔ {offer.to}
                  </Text>
                </View>

                {/* Capacity Input */}
                <Input
                  label={t("totalCapacityKg", language)}
                  value={editTotalKg}
                  onChangeText={(v) => setEditTotalKg(numOnly(v))}
                  keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                  placeholder="e.g. 20"
                />

                {/* Price and Currency Section */}
                <View style={styles.fieldSection}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={[styles.fieldLabel, darkMode && styles.textDark]}>
                      {t("pricePerKg", language)}
                    </Text>

                    {/* Dedicated Currency Selector Button */}
                    <TouchableOpacity
                      style={[styles.currencyBtn, darkMode && styles.currencyBtnDark]}
                      onPress={() => setCurrencyModalVisible(true)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.currencyFlag}>{currentCurrencyObj.flag}</Text>
                      <Text
                        style={[
                          styles.currencyCodeText,
                          darkMode && styles.currencyCodeTextDark,
                        ]}
                      >
                        {currentCurrencyObj.code}
                      </Text>
                      <ChevronDown
                        size={12}
                        color={darkMode ? "#60A5FA" : "#2563EB"}
                      />
                    </TouchableOpacity>
                  </View>

                  <Input
                    value={editPrice}
                    onChangeText={(v) => setEditPrice(numOnly(v))}
                    keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                    placeholder="e.g. 35"
                  />
                </View>

                {/* Flight Date Picker Modal */}
                <View style={styles.datePickerWrapper}>
                  <DatePickerInput
                    label={t("flightDate", language)}
                    value={editFlightDateObj}
                    language={language}
                    mode="future"
                    minDate={new Date()}
                    onChange={(d) => setEditFlightDateObj(d)}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsRow}>
                  <Button
                    title={t("cancel", language)}
                    variant="outline"
                    onPress={onClose}
                    style={{ flex: 1 }}
                    disabled={loading}
                  />
                  <Button
                    title={t("saveChanges", language)}
                    onPress={handleSave}
                    loading={loading}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Independent Currency Picker Modal */}
      <CurrencyPickerModal
        visible={currencyModalVisible}
        selectedCurrency={editCurrency}
        onSelectCurrency={(cur) => {
          setEditCurrency(cur.code);
          setCurrencyModalVisible(false);
        }}
        onClose={() => setCurrencyModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: "88%",
  },
  modalContentDark: {
    backgroundColor: "#151E2E",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 14,
  },
  modalHeaderDark: {
    borderBottomColor: "#1E293B",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  textDark: {
    color: "#FFFFFF",
  },
  summaryBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  summaryBoxDark: {
    backgroundColor: "#0B1120",
    borderColor: "#1E293B",
  },
  routeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  fieldSection: {
    marginBottom: 4,
  },
  fieldHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  currencyBtnDark: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  currencyFlag: {
    fontSize: 13,
  },
  currencyCodeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },
  currencyCodeTextDark: {
    color: "#60A5FA",
  },
  datePickerWrapper: {
    marginTop: 4,
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    marginBottom: 8,
  },
});
