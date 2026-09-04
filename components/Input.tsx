import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
} from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useAppStore } from "@/lib/store";

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  containerStyle?: object;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  error,
  rightElement,
  leftElement,
  containerStyle,
  style,
  ...props
}) => {
  const darkMode = useAppStore((state) => state.darkMode);

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      {label ? (
        <Text
          style={[styles.fieldLabel, darkMode && styles.fieldLabelDark]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          darkMode && styles.inputContainerDark,
          !!error && (darkMode ? styles.inputContainerErrorDark : styles.inputContainerError),
        ]}
      >
        {leftElement ? (
          leftElement
        ) : Icon ? (
          <Icon
            size={20}
            color={error ? "#EF4444" : darkMode ? "#9CA3AF" : "#6B7280"}
            style={styles.inputIcon}
          />
        ) : null}
        <TextInput
          style={[styles.textInput, darkMode && styles.textInputDark, style]}
          placeholderTextColor={darkMode ? "#9CA3AF" : "#9CA3AF"}
          {...props}
        />
        {rightElement}
      </View>
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 2,
  },
  fieldLabelDark: {
    color: "#D1D5DB",
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
    marginRight: 12,
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
});

export default Input;
