import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Clock, ChevronDown } from "lucide-react-native";
import Button from "./Button";
import BottomSheetModal from "./BottomSheetModal";
import { Language, t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export interface TimePickerInputProps {
  label?: string;
  placeholder?: string;
  value: string; // "14:30"
  onChange: (timeStr: string) => void;
  error?: string;
  language?: Language;
  containerStyle?: object;
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  language = "en",
  containerStyle,
}) => {
  const darkMode = useAppStore((state) => state.darkMode);
  const [modalVisible, setModalVisible] = useState(false);

  // Initial time parsing
  const initialParts = value ? value.split(":") : ["12", "00"];
  const [tempHour, setTempHour] = useState(initialParts[0] || "12");
  const [tempMinute, setTempMinute] = useState(initialParts[1] || "00");

  const hoursList = Array.from({ length: 24 }, (_, i) =>
    i < 10 ? `0${i}` : `${i}`
  );

  const minutesList = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const handleConfirm = () => {
    const formatted = `${tempHour}:${tempMinute}`;
    onChange(formatted);
    setModalVisible(false);
  };

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          darkMode && styles.inputContainerDark,
          !!error && styles.inputContainerError,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Clock
          size={20}
          color={error ? "#EF4444" : darkMode ? "#9CA3AF" : "#6B7280"}
          style={styles.inputIcon}
        />
        <View style={styles.valueContainer}>
          {value ? (
            <>
              <Text style={styles.label} numberOfLines={1}>
                {label || t("departureTimeLabel", language)}
              </Text>
              <Text
                style={[styles.valueText, darkMode && styles.textDark]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {value}
              </Text>
            </>
          ) : (
            <Text style={styles.placeholderText} numberOfLines={1} ellipsizeMode="tail">
              {placeholder || `${label || "Select Time"} *`}
            </Text>
          )}
        </View>
        <ChevronDown size={18} color="#6B7280" />
      </TouchableOpacity>

      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}

      {/* Time Selector Modal */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
          <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
            {label || "Select Time"}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.modalCloseText}>
              {t("close", language)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateControlRow}>
          {/* Hour Selection */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateColumnLabel}>
              {language === "ar" ? "الساعة" : "Hour"}
            </Text>
            <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
              {hoursList.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.dateItem, tempHour === h && styles.dateItemSelected]}
                  onPress={() => setTempHour(h)}
                >
                  <Text
                    style={[
                      styles.dateItemText,
                      darkMode && styles.textDark,
                      tempHour === h && styles.dateItemTextSelected,
                    ]}
                  >
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.colonSeparatorBox}>
            <Text style={[styles.colonSeparatorText, darkMode && styles.textDark]}>:</Text>
          </View>

          {/* Minute Selection */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateColumnLabel}>
              {language === "ar" ? "الدقيقة" : "Minute"}
            </Text>
            <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
              {minutesList.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.dateItem, tempMinute === m && styles.dateItemSelected]}
                  onPress={() => setTempMinute(m)}
                >
                  <Text
                    style={[
                      styles.dateItemText,
                      darkMode && styles.textDark,
                      tempMinute === m && styles.dateItemTextSelected,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <Button
          title={t("confirmDate", language)}
          onPress={handleConfirm}
          variant="primary"
        />
      </BottomSheetModal>
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
    paddingVertical: 10,
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
  inputIcon: {
    marginRight: 12,
  },
  valueContainer: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 1,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholderText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  fieldErrorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textDark: {
    color: "#FFFFFF",
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
    padding: 20,
    maxHeight: "75%",
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
    marginBottom: 16,
  },
  modalHeaderDark: {
    borderBottomColor: "#374151",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalCloseText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  dateControlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 180,
    marginBottom: 20,
    gap: 16,
  },
  dateColumn: {
    flex: 1,
    height: "100%",
  },
  dateColumnLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  dateScrollView: {
    flex: 1,
  },
  colonSeparatorBox: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  colonSeparatorText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
  },
  dateItem: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 4,
  },
  dateItemSelected: {
    backgroundColor: "#EFF6FF",
  },
  dateItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  dateItemTextSelected: {
    color: "#2563EB",
    fontWeight: "800",
  },
});

export default TimePickerInput;
