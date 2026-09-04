import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useAppStore } from "@/lib/store";

export interface OTPInputProps {
  codeLength?: number;
  value: string;
  onChangeText: (code: string) => void;
  error?: string;
  containerStyle?: object;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  codeLength = 6,
  value,
  onChangeText,
  error,
  containerStyle,
}) => {
  const darkMode = useAppStore((state) => state.darkMode);
  const hiddenInputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = value.split("");

  const handlePress = () => {
    hiddenInputRef.current?.focus();
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

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.boxesRow}
      >
        {Array.from({ length: codeLength }).map((_, index) => {
          const char = digits[index] || "";
          const isCurrentIndex = index === digits.length;
          const isLastIndex = index === codeLength - 1 && digits.length === codeLength;
          const isFocusedBox = isFocused && (isCurrentIndex || isLastIndex);

          return (
            <View
              key={index}
              style={[
                styles.box,
                darkMode && styles.boxDark,
                !!char && styles.boxFilled,
                isFocusedBox && styles.boxFocused,
                !!error && styles.boxError,
              ]}
            >
              <Text
                style={[
                  styles.boxText,
                  darkMode && styles.boxTextDark,
                  !!error && styles.boxTextError,
                ]}
              >
                {char || (isFocusedBox ? "|" : "")}
              </Text>
            </View>
          );
        })}
      </TouchableOpacity>

      {/* Hidden Real TextInput */}
      <TextInput
        ref={hiddenInputRef}
        value={value}
        onChangeText={(text) => {
          const cleanDigits = text.replace(/\D/g, "").slice(0, codeLength);
          onChangeText(cleanDigits);
        }}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={codeLength}
        style={styles.hiddenInput}
        caretHidden={true}
      />

      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  box: {
    flex: 1,
    height: 52,
    maxWidth: 48,
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  boxDark: {
    backgroundColor: "#374151",
    borderColor: "#4B5563",
  },
  boxFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },
  boxFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
  },
  boxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  boxText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  boxTextDark: {
    color: "#FFFFFF",
  },
  boxTextError: {
    color: "#EF4444",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  fieldErrorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
    textAlign: "center",
  },
});

export default OTPInput;
