import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LucideIcon } from "lucide-react-native";

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
  icon?: LucideIcon | React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  icon: Icon,
  disabled,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "danger":
        return styles.dangerButton;
      case "primary":
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "danger":
        return styles.dangerText;
      case "primary":
      default:
        return styles.primaryText;
    }
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const IconComponent = Icon as LucideIcon;
    const iconColor =
      variant === "primary" || variant === "danger" ? "#FFFFFF" : "#2563EB";
    return <IconComponent size={20} color={iconColor} style={styles.iconStyle} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getButtonStyle(),
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#2563EB"}
          size="small"
        />
      ) : (
        <>
          {renderIcon()}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },
  dangerButton: {
    backgroundColor: "#DC2626",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },
  outlineText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  iconStyle: {
    marginRight: 8,
  },
});

export default Button;
