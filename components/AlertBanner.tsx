import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";

export interface AlertBannerProps {
  type?: AlertBannerType;
  message?: string | null;
  onClose?: () => void;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  containerStyle?: ViewStyle;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = "error",
  message,
  onClose,
  onDismiss,
  containerStyle,
}) => {
  const handleClose = onClose || onDismiss;
  const darkMode = useAppStore((state) => state.darkMode);

  if (!message) return null;

  const getThemeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: darkMode ? "#064E3B" : "#F0FDF4",
          border: darkMode ? "#059669" : "#BBF7D0",
          text: darkMode ? "#A7F3D0" : "#166534",
          iconColor: darkMode ? "#34D399" : "#16A34A",
          Icon: CheckCircle2,
        };
      case "warning":
        return {
          bg: darkMode ? "#78350F" : "#FFFBEB",
          border: darkMode ? "#D97706" : "#FDE68A",
          text: darkMode ? "#FDE68A" : "#92400E",
          iconColor: darkMode ? "#FBBF24" : "#D97706",
          Icon: AlertTriangle,
        };
      case "info":
        return {
          bg: darkMode ? "#1E3A8A" : "#EFF6FF",
          border: darkMode ? "#3B82F6" : "#BFDBFE",
          text: darkMode ? "#BFDBFE" : "#1E40AF",
          iconColor: darkMode ? "#60A5FA" : "#2563EB",
          Icon: Info,
        };
      case "error":
      default:
        return {
          bg: darkMode ? "#450A0A" : "#FEF2F2",
          border: darkMode ? "#DC2626" : "#FECACA",
          text: darkMode ? "#FECACA" : "#991B1B",
          iconColor: darkMode ? "#F87171" : "#DC2626",
          Icon: AlertCircle,
        };
    }
  };

  const theme = getThemeStyles();
  const IconComponent = theme.Icon;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        containerStyle,
      ]}
    >
      <IconComponent
        size={20}
        color={theme.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.messageText, { color: theme.text }]}>
        {message}
      </Text>
      {handleClose ? (
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <X size={16} color={theme.text} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    width: "100%",
  },
  icon: {
    marginRight: 10,
    flexShrink: 0,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

export default AlertBanner;
