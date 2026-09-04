import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Globe, ShieldCheck, MessageCircle } from "lucide-react-native";
import { MOCK_BOTTOM_MINI_ADS_CONFIG } from "@/lib/constants";

export default function BottomMiniAdsSection() {
  const { language, darkMode } = useAppStore();

  const [activeIndex, setActiveIndex] = useState(0);

  // Vertical Translation & Opacity Animations for smooth bottom-to-top transition
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const adsList = MOCK_BOTTOM_MINI_ADS_CONFIG.map((ad) => {
    let iconComp = Globe;
    if (ad.iconType === "shield") iconComp = ShieldCheck;
    if (ad.iconType === "message") iconComp = MessageCircle;

    return {
      id: ad.id,
      badge: ad.badge,
      badgeBg: ad.badgeBg,
      title: t(ad.titleKey, language),
      subtitle: t(ad.subtitleKey, language),
      buttonText: t(ad.buttonTextKey, language),
      btnColor: ad.btnColor,
      icon: iconComp,
      image: ad.image,
    };
  });

  // Auto-slide vertical content transition every 3.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Step 1: Fade out & move slightly up (-15px)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 2: Switch active ad index
        setActiveIndex((prev) => (prev + 1) % adsList.length);

        // Step 3: Reset to bottom position (+20px)
        translateY.setValue(20);

        // Step 4: Animate vertically from bottom to top (+20px -> 0px) and fade in (0 -> 1)
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [adsList.length, opacity, translateY]);

  const currentAd = adsList[activeIndex];
  const ButtonIconComp = currentAd.icon;

  const handleAdPress = () => {
    Alert.alert(
      t("sponsoredAdDetails", language),
      `${t("selectedAdPrompt", language)} ${currentAd.title}`
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.card, darkMode && styles.cardDark]}
        onPress={handleAdPress}
        activeOpacity={0.88}
      >
        {/* Background Image with Overlay */}
        <Animated.Image
          source={{ uri: currentAd.image }}
          style={[styles.cardImage, { opacity: opacity }]}
          resizeMode="cover"
        />
        <View style={styles.overlay} />

        {/* Slider Indicator Dots Positioned INSIDE Card (Top Right) */}
        <View style={styles.dotsInsideCard}>
          {adsList.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Animated Inner Content Container moving vertically (Bottom to Top) */}
        <Animated.View
          style={[
            styles.contentRow,
            {
              opacity: opacity,
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          <View style={styles.textColumn}>
            <View style={[styles.sponsoredBadge, { backgroundColor: currentAd.badgeBg }]}>
              <Text style={styles.sponsoredText}>{currentAd.badge}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {currentAd.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {currentAd.subtitle}
            </Text>
          </View>

          <View style={styles.actionColumn}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: currentAd.btnColor }]}
              onPress={handleAdPress}
              activeOpacity={0.8}
            >
              <ButtonIconComp size={12} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>
                {currentAd.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  card: {
    height: 92,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111827",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardDark: {
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "#1F2937",
  },
  cardImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
  },
  dotsInsideCard: {
    position: "absolute",
    top: 10,
    right: 14,
    flexDirection: "row",
    gap: 4,
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 14,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 5,
  },
  textColumn: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  sponsoredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  sponsoredText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  actionColumn: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
