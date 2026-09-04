import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Phone, Sparkles } from "lucide-react-native";
import { MOCK_ADS_CAROUSEL, AdItem } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export { type AdItem };
export const ADS_DATA: AdItem[] = MOCK_ADS_CAROUSEL;

export const AdsCarousel: React.FC = () => {
  const { language } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % ADS_DATA.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex && slide >= 0 && slide < ADS_DATA.length) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {ADS_DATA.map((ad) => {
          const displayTitle = ad.titleKey ? t(ad.titleKey, language) : ad.title;
          const displaySubtitle = ad.subtitleKey ? t(ad.subtitleKey, language) : ad.subtitle;

          return (
            <View key={ad.id} style={styles.cardOuter}>
              <TouchableOpacity style={styles.adCard} activeOpacity={0.9}>
                <Image
                  source={{ uri: ad.image }}
                  style={styles.adImage}
                  resizeMode="cover"
                />
                <View style={styles.adOverlay} />

                <View style={styles.adContent}>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Sparkles size={12} color="#FFFFFF" />
                      <Text style={styles.badgeText}>{ad.badge}</Text>
                    </View>
                  </View>

                  <Text style={styles.adTitle} numberOfLines={1}>
                    {displayTitle}
                  </Text>
                  <Text style={styles.adSubtitle} numberOfLines={2}>
                    {displaySubtitle}
                  </Text>

                  <View style={styles.phoneBadge}>
                    <Phone size={13} color="#FFFFFF" />
                    <Text style={styles.phoneText}>{ad.phone}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationRow}>
        {ADS_DATA.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: "center",
  },
  scrollContent: {
    alignItems: "center",
  },
  cardOuter: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  adCard: {
    width: "100%",
    maxWidth: 480,
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1F2937",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  adImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  adOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  adContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  adTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  adSubtitle: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 18,
  },
  phoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  phoneText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: "#2563EB",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "#D1D5DB",
  },
});

export default AdsCarousel;
