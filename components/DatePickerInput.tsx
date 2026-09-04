import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { Calendar, ChevronDown } from "lucide-react-native";
import Button from "./Button";
import BottomSheetModal from "./BottomSheetModal";
import { Language, t } from "@/lib/i18n";
import { MONTHS_EN, MONTHS_FR, MONTHS_AR } from "@/lib/constants";
import { useAppStore } from "@/lib/store";

export interface DatePickerInputProps {
  label?: string;
  placeholder?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  language?: Language;
  containerStyle?: object;
  mode?: "future" | "birth" | "all";
  minDate?: Date;
  disabled?: boolean;
}

const ITEM_ROW_HEIGHT = 44;
const LIST_HEIGHT = 200;

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  language = "en",
  containerStyle,
  mode = "all",
  minDate,
  disabled = false,
}) => {
  const darkMode = useAppStore((state) => state.darkMode);
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDateNum = today.getDate();

  // All 3 items are unselected (null) by default when opening without a value
  const [tempYear, setTempYear] = useState<number | null>(
    value ? value.getFullYear() : null
  );
  const [tempMonth, setTempMonth] = useState<number | null>(
    value ? value.getMonth() : null
  );
  const [tempDay, setTempDay] = useState<number | null>(
    value ? value.getDate() : null
  );

  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Year list based on mode:
  // - "birth": strictly past dates from 1800 up to currentYear (max is today)
  // - other modes ("future", "all"): strictly future dates from currentYear up to 2100 (min is today)
  const yearList =
    mode === "birth"
      ? Array.from({ length: currentYear - 1800 + 1 }, (_, i) => 1800 + i)
      : Array.from({ length: 2100 - currentYear + 1 }, (_, i) => currentYear + i);

  const activeYearForCalculation = tempYear ?? currentYear;
  const activeMonthForCalculation = tempMonth ?? currentMonth;
  const daysInMonth = new Date(activeYearForCalculation, activeMonthForCalculation + 1, 0).getDate();

  const isDayDisabled = (d: number) => {
    const y = tempYear ?? currentYear;
    const m = tempMonth ?? currentMonth;
    if (mode === "birth") {
      if (y > currentYear) return true;
      if (y === currentYear && m > currentMonth) return true;
      if (y === currentYear && m === currentMonth && d > currentDateNum) return true;
      return false;
    } else {
      const effectiveMinDate = minDate ? new Date(minDate) : new Date(currentYear, currentMonth, currentDateNum);
      const minYear = effectiveMinDate.getFullYear();
      const minMonth = effectiveMinDate.getMonth();
      const minDay = effectiveMinDate.getDate();

      if (y < minYear) return true;
      if (y === minYear && m < minMonth) return true;
      if (y === minYear && m === minMonth && d < minDay) return true;
      return false;
    }
  };

  const isMonthDisabled = (mIdx: number) => {
    const y = tempYear ?? currentYear;
    if (mode === "birth") {
      if (y > currentYear) return true;
      if (y === currentYear && mIdx > currentMonth) return true;
      return false;
    } else {
      const effectiveMinDate = minDate ? new Date(minDate) : new Date(currentYear, currentMonth, currentDateNum);
      const minYear = effectiveMinDate.getFullYear();
      const minMonth = effectiveMinDate.getMonth();

      if (y < minYear) return true;
      if (y === minYear && mIdx < minMonth) return true;
      return false;
    }
  };

  const getOffsets = (targetYear: number, targetMonth: number, targetDay: number) => {
    const centerOffset = LIST_HEIGHT / 2 - ITEM_ROW_HEIGHT / 2;
    const dOffset = Math.max(0, (targetDay - 1) * ITEM_ROW_HEIGHT - centerOffset);
    const mOffset = Math.max(0, targetMonth * ITEM_ROW_HEIGHT - centerOffset);
    const yIdx = yearList.indexOf(targetYear);
    const yOffset = yIdx >= 0 ? Math.max(0, yIdx * ITEM_ROW_HEIGHT - centerOffset) : 0;
    return { dOffset, mOffset, yOffset };
  };

  const scrollToCurrentPositions = (targetYear: number, targetMonth: number, targetDay: number) => {
    const { dOffset, mOffset, yOffset } = getOffsets(targetYear, targetMonth, targetDay);
    dayScrollRef.current?.scrollTo({ y: dOffset, animated: false });
    monthScrollRef.current?.scrollTo({ y: mOffset, animated: false });
    yearScrollRef.current?.scrollTo({ y: yOffset, animated: false });
  };

  const handleOpenModal = () => {
    if (value) {
      setTempYear(value.getFullYear());
      setTempMonth(value.getMonth());
      setTempDay(value.getDate());
    } else {
      setTempYear(null);
      setTempMonth(null);
      setTempDay(null);
    }
    setModalVisible(true);
  };

  // Only center once on modal open, never fight manual user taps/scrolls
  useEffect(() => {
    if (modalVisible) {
      const activeYear = value ? value.getFullYear() : currentYear;
      const activeMonth = value ? value.getMonth() : currentMonth;
      const activeDay = value ? value.getDate() : currentDateNum;

      const t0 = setTimeout(() => scrollToCurrentPositions(activeYear, activeMonth, activeDay), 30);
      const t1 = setTimeout(() => scrollToCurrentPositions(activeYear, activeMonth, activeDay), 120);

      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
      };
    }
  }, [modalVisible]);

  const getMonthsList = () => {
    if (language === "ar") return MONTHS_AR;
    if (language === "fr") return MONTHS_FR;
    return MONTHS_EN;
  };

  const getLocaleCode = () => {
    if (language === "ar") return "ar-EG";
    if (language === "fr") return "fr-FR";
    return "en-US";
  };

  const handleConfirm = () => {
    if (tempDay === null || tempMonth === null || tempYear === null) {
      Alert.alert(
        t("selectFlightDateError", language),
        t("selectCompleteDateError", language)
      );
      return;
    }

    const validDay = Math.min(tempDay, daysInMonth);
    const selectedDate = new Date(tempYear, tempMonth, validDay);
    selectedDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (mode === "birth") {
      if (selectedDate > todayEnd) {
        Alert.alert(
          t("invalidBirthDateTitle", language),
          t("birthDateFutureError", language)
        );
        return;
      }
    } else {
      const effectiveMinDate = minDate ? new Date(minDate) : todayStart;
      effectiveMinDate.setHours(0, 0, 0, 0);

      if (selectedDate < effectiveMinDate) {
        Alert.alert(
          t("invalidTravelDateTitle", language),
          t("futureFlightDateError", language)
        );
        return;
      }
    }

    onChange(selectedDate);
    setModalVisible(false);
  };

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          darkMode && styles.inputContainerDark,
          !!error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
        onPress={() => {
          if (!disabled) handleOpenModal();
        }}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Calendar
          size={20}
          color={error ? "#EF4444" : darkMode ? "#9CA3AF" : "#6B7280"}
          style={styles.inputIcon}
        />
        <View style={styles.valueContainer}>
          <Text style={[styles.label, darkMode && styles.labelDark]} numberOfLines={1}>
            {label || t("dateOfBirth", language)}
          </Text>
          {value ? (
            <Text style={[styles.valueText, darkMode && styles.textDark]} numberOfLines={1} ellipsizeMode="tail">
              {value.toLocaleDateString(getLocaleCode(), {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          ) : (
            <Text style={[styles.placeholderText, darkMode && styles.placeholderTextDark]} numberOfLines={1} ellipsizeMode="tail">
              {placeholder || (language === "ar" ? "يوم/شهر/سنة" : language === "fr" ? "JJ/MM/AAAA" : "DD/MM/YYYY")}
            </Text>
          )}
        </View>
        <ChevronDown size={18} color="#6B7280" />
      </TouchableOpacity>

      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}

      {/* Date Selector Modal */}
      <BottomSheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
          <Text style={[styles.modalTitle, darkMode && styles.textDark]}>
            {label || (mode === "future" ? t("flightDateHeader", language) : t("dateOfBirth", language))}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.modalCloseText}>
              {t("close", language)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateControlRow}>
          {/* Day Selection */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateColumnLabel}>{t("day", language)}</Text>
            <ScrollView
              ref={dayScrollRef}
              style={styles.dateScrollView}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const isSelected = tempDay === d;
                const isCurrent = currentDateNum === d;
                const disabled = isDayDisabled(d);

                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.dateItem,
                      isCurrent && !isSelected && (darkMode ? styles.dateItemTodayDk : styles.dateItemToday),
                      isSelected && styles.dateItemSelected,
                      disabled && styles.dateItemDisabled,
                    ]}
                    onPress={() => {
                      if (!disabled) setTempDay(d);
                    }}
                    activeOpacity={disabled ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.dateItemText,
                        darkMode && styles.textDark,
                        isCurrent && !isSelected && styles.dateItemTextToday,
                        isSelected && styles.dateItemTextSelected,
                        disabled && styles.dateItemTextDisabled,
                      ]}
                    >
                      {d}
                    </Text>
                    {isCurrent && !isSelected ? (
                      <View style={styles.todayIndicator} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Month Selection */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateColumnLabel}>{t("month", language)}</Text>
            <ScrollView
              ref={monthScrollRef}
              style={styles.dateScrollView}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {getMonthsList().map((m, idx) => {
                const isSelected = tempMonth === idx;
                const isCurrent = currentMonth === idx;
                const disabled = isMonthDisabled(idx);

                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.dateItem,
                      isCurrent && !isSelected && (darkMode ? styles.dateItemTodayDk : styles.dateItemToday),
                      isSelected && styles.dateItemSelected,
                      disabled && styles.dateItemDisabled,
                    ]}
                    onPress={() => {
                      if (!disabled) setTempMonth(idx);
                    }}
                    activeOpacity={disabled ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.dateItemText,
                        darkMode && styles.textDark,
                        isCurrent && !isSelected && styles.dateItemTextToday,
                        isSelected && styles.dateItemTextSelected,
                        disabled && styles.dateItemTextDisabled,
                      ]}
                    >
                      {m}
                    </Text>
                    {isCurrent && !isSelected ? (
                      <View style={styles.todayIndicator} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Year Selection */}
          <View style={styles.dateColumn}>
            <Text style={styles.dateColumnLabel}>{t("year", language)}</Text>
            <ScrollView
              ref={yearScrollRef}
              style={styles.dateScrollView}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {yearList.map((y) => {
                const isSelected = tempYear === y;
                const isCurrent = currentYear === y;

                return (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.dateItem,
                      isCurrent && !isSelected && (darkMode ? styles.dateItemTodayDk : styles.dateItemToday),
                      isSelected && styles.dateItemSelected,
                    ]}
                    onPress={() => setTempYear(y)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dateItemText,
                        darkMode && styles.textDark,
                        isCurrent && !isSelected && styles.dateItemTextToday,
                        isSelected && styles.dateItemTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                    {isCurrent && !isSelected ? (
                      <View style={styles.todayIndicator} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.confirmBtnContainer}>
          <Button
            title={t("confirmDate", language)}
            onPress={handleConfirm}
            variant="primary"
          />
        </View>
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
  inputContainerDisabled: {
    opacity: 0.5,
    backgroundColor: "#F3F4F6",
  },
  inputIcon: {
    marginRight: 12,
  },
  valueContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 1,
  },
  labelDark: {
    color: "#9CA3AF",
  },
  valueText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
  },
  textDark: {
    color: "#FFFFFF",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontWeight: "500",
    fontSize: 13,
  },
  placeholderTextDark: {
    color: "#64748B",
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
  dateControlRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: LIST_HEIGHT,
    marginVertical: 14,
  },
  dateColumn: {
    flex: 1,
    alignItems: "center",
  },
  dateColumnLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  dateScrollView: {
    width: "100%",
  },
  dateItem: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    position: "relative",
    marginHorizontal: 4,
    marginVertical: 1,
  },
  dateItemToday: {
    borderWidth: 1.5,
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
  },
  dateItemTodayDk: {
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    backgroundColor: "#1E293B",
  },
  dateItemTextToday: {
    color: "#2563EB",
    fontWeight: "800",
  },
  todayIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2563EB",
    position: "absolute",
    bottom: 3,
  },
  dateItemSelected: {
    backgroundColor: "#2563EB",
  },
  dateItemText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  dateItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dateItemDisabled: {
    opacity: 0.25,
  },
  dateItemTextDisabled: {
    color: "#9CA3AF",
  },
  confirmBtnContainer: {
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 16 : 20,
  },
});

export default DatePickerInput;
