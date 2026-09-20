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
  fullHeight?: boolean;
}

/**
 * Global BottomSheetModal wrapper.
 * Pure native Modal architecture that works 100% reliably on Android, iOS, and Expo:
 * - Direct Modal mounting with visible={visible}
 * - Backdrop Pressable (absoluteFill) behind card for backdrop tap dismissal
 * - Inner View card (NOT Pressable) so child ScrollViews receive 100% of touch & scroll events
 */
export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  contentStyle,
  animationType = "slide",
  centered = false,
  fullHeight = false,
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
        <View
          style={[
            styles.overlay,
            centered ? styles.centeredOverlay : styles.bottomOverlay,
          ]}
        >
          {/* Absolute backdrop to catch outside taps */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
          />

          {/* Modal Card - pure View container so ScrollViews inside are fully scrollable */}
          <View
            style={[
              centered ? styles.centeredCard : styles.bottomCard,
              fullHeight && styles.fullHeightCard,
              darkMode && styles.cardDark,
              { paddingBottom: Math.max(insets.bottom, 16) },
              contentStyle,
            ]}
          >
            {children}
          </View>
        </View>
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
    maxHeight: "92%",
    width: "100%",
  },
  fullHeightCard: {
    height: "92%",
    maxHeight: "95%",
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
