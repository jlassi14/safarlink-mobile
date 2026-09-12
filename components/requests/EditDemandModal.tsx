import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { DatePickerInput } from "@/components/DatePickerInput";
import { MyPackageRequest } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { X, Check } from "lucide-react-native";

interface EditDemandModalProps {
  visible: boolean;
  editingDemand: MyPackageRequest | null;
  editWeight: string;
  setEditWeight: (val: string) => void;
  editDate: Date | null;
  setEditDate: (val: Date | null) => void;
  editNotes: string;
  setEditNotes: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const EditDemandModal: React.FC<EditDemandModalProps> = ({
  visible,
  editingDemand,
  editWeight,
  setEditWeight,
  editDate,
  setEditDate,
  editNotes,
  setEditNotes,
  onClose,
  onSave,
  language,
  darkMode,
  primaryColor,
}) => {
  if (!editingDemand) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.editModalContainer, darkMode && styles.editModalContainerDark]}>
          <View style={styles.modalHeaderRow}>
            <Text style={[styles.modalHeaderTitle, darkMode && styles.textDark]}>
              {t("editDemandTitle", language)}
            </Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalRouteSummary}>
            <Text style={styles.modalRouteText}>
              {editingDemand.from} ➔ {editingDemand.to}
            </Text>
          </View>

          <View style={styles.modalFormGroup}>
            <Text style={[styles.modalFormLabel, darkMode && styles.textDark]}>
              {t("packageWeightKg", language)}
            </Text>
            <TextInput
              style={[styles.modalInput, darkMode && styles.modalInputDark]}
              value={editWeight}
              onChangeText={setEditWeight}
              keyboardType="numeric"
              placeholder="e.g. 2.5"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.modalFormGroup}>
            <DatePickerInput
              label={t("deliveryDateLabel", language)}
              value={editDate}
              onChange={(d) => setEditDate(d)}
              mode="future"
            />
          </View>

          <View style={styles.modalFormGroup}>
            <Text style={[styles.modalFormLabel, darkMode && styles.textDark]}>
              {t("notesPlaceholder", language)}
            </Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, darkMode && styles.modalInputDark]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.modalActionsRow}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelBtnText}>{t("cancelBtn", language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: primaryColor }]}
              onPress={onSave}
              activeOpacity={0.85}
            >
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.modalSaveBtnText}>{t("saveBtn", language)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
