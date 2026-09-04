import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";
import { ArrowLeft } from "lucide-react-native";

export default function CreateRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, darkMode } = useAppStore();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [reward, setReward] = useState("");

  const textColor = darkMode ? colors.text.dark : colors.text.light;
  const bgColor = darkMode ? colors.background.dark : colors.background.light;
  const inputBgColor = darkMode ? "#1F2937" : "#F3F4F6";
  const topPadding = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) + 8;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>
          {t("createRequestTitle", language)}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* From */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>
            {t("from", language)}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            placeholder={t("startingLocationPlaceholder", language)}
            placeholderTextColor={colors.muted.light}
            value={from}
            onChangeText={setFrom}
          />
        </View>

        {/* To */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>
            {t("to", language)}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            placeholder={t("destinationPlaceholder", language)}
            placeholderTextColor={colors.muted.light}
            value={to}
            onChangeText={setTo}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>
            {t("description", language)}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              { backgroundColor: inputBgColor, color: textColor },
            ]}
            placeholder={t("describeRequestPlaceholder", language)}
            placeholderTextColor={colors.muted.light}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Weight */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>
            {t("weightKgLabel", language)}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            placeholder="0.5"
            placeholderTextColor={colors.muted.light}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Reward */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: textColor }]}>
            {t("rewardQrLabel", language)}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBgColor, color: textColor }]}
            placeholder="150"
            placeholderTextColor={colors.muted.light}
            value={reward}
            onChangeText={setReward}
            keyboardType="number-pad"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => {
            Alert.alert(t("requestCreatedSuccess", language));
            router.back();
          }}
        >
          <Text style={styles.buttonText}>
            {t("createRequestTitle", language)}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
