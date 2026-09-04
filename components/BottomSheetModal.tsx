import React from "react";
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@/lib/store";

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  animationType?: "slide" | "fade" | "none";
  centered?: boolean;
}

/**
 * Global BottomSheetModal wrapper.
 * Pure native Modal architecture that works 100% reliably on Android, iOS, and Expo:
 * - Direct Modal mounting with visible={visible}
 * - Outer Pressable overlay for background tap dismissal
 * - Inner Pressable card with stopPropagation to ensure all content clicks work
 */
export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  contentStyle,
  animationType = "slide",
  centered = false,
}) => {
  const darkMode = useAppStore((state) => state.darkMode);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex1}
      >
        <Pressable
          style={[
            styles.overlay,
            centered ? styles.centeredOverlay : styles.bottomOverlay,
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <Pressable
            style={[
              centered ? styles.centeredCard : styles.bottomCard,
              darkMode && styles.cardDark,
              { paddingBottom: Math.max(insets.bottom, 20) + 8 },
              contentStyle,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  bottomOverlay: {
    justifyContent: "flex-end",
  },
  centeredOverlay: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "88%",
    width: "100%",
  },
  centeredCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  cardDark: {
    backgroundColor: "#1F2937",
  },
});

export default BottomSheetModal;
