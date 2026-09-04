import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LogOut, X, ShieldAlert } from "lucide-react-native";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

interface LogoutConfirmModalProps {
  visible: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  loading = false,
  onConfirm,
  onClose,
}) => {
  const { language, darkMode } = useAppStore();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={loading ? undefined : onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={loading ? undefined : onClose}
      >
        <Pressable
          style={[styles.card, darkMode && styles.cardDark]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {!loading && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={darkMode ? "#9CA3AF" : "#64748B"} />
            </TouchableOpacity>
          )}

          {/* Icon Header */}
          <View style={[styles.iconCircle, darkMode && styles.iconCircleDark]}>
            <View style={[styles.innerIconCircle, darkMode && styles.innerIconCircleDark]}>
              <LogOut size={28} color="#EF4444" />
            </View>
          </View>

          {/* Texts */}
          <Text style={[styles.title, darkMode && styles.textDark]}>
            {t("signOutConfirmTitle", language)}
          </Text>
          <Text style={styles.subtitle}>
            {t("signOutConfirmMessage", language)}
          </Text>

          {/* Security Notice Box */}
          <View style={[styles.infoNotice, darkMode && styles.infoNoticeDark]}>
            <ShieldAlert size={16} color="#DC2626" style={{ marginTop: 1 }} />
            <Text style={[styles.infoText, darkMode && styles.infoTextDark]}>
              {language === "ar"
                ? "سيتم إنهاء جلستك وحذف الرموز المشفرة بأمان من هذا الجهاز."
                : language === "fr"
                ? "Votre session sera terminée et vos jetons sécurisés seront effacés de cet appareil."
                : "Your active session will be ended and secure tokens purged from this device."}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelButton, darkMode && styles.cancelButtonDark]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, darkMode && styles.textDark]}>
                {t("cancel", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <LogOut size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.logoutText}>
                    {t("logOut", language)}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    position: "relative",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
    borderWidth: 1,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconCircleDark: {
    backgroundColor: "#451A1A",
  },
  innerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  innerIconCircleDark: {
    backgroundColor: "#5C1D1D",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  infoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
    width: "100%",
  },
  infoNoticeDark: {
    backgroundColor: "#3A1818",
    borderColor: "#7F1D1D",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "500",
    lineHeight: 16,
  },
  infoTextDark: {
    color: "#FCA5A5",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonDark: {
    backgroundColor: "#334155",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  logoutButton: {
    flex: 1.2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textDark: {
    color: "#F8FAFC",
  },
});

export default LogoutConfirmModal;
