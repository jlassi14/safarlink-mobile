import React from "react";
import { View, Text } from "react-native";
import { Plane, Package } from "lucide-react-native";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { createStyles as s } from "./createStyles";

interface CreateModeBannerProps {
  isOffer: boolean;
}

export const CreateModeBanner: React.FC<CreateModeBannerProps> = ({ isOffer }) => {
  const { language, darkMode } = useAppStore();

  return (
    <View
      style={[
        s.modeBanner,
        isOffer ? s.modeBannerOffer : s.modeBannerRequest,
        darkMode && (isOffer ? s.modeBannerOfferDk : s.modeBannerRequestDk),
      ]}
    >
      <View
        style={[
          s.modeBannerIconBox,
          { backgroundColor: isOffer ? "#DBEAFE" : "#FEF3C7" },
          darkMode && { backgroundColor: isOffer ? "#1E3A8A" : "#78350F" },
        ]}
      >
        {isOffer ? (
          <Plane size={16} color="#2563EB" />
        ) : (
          <Package size={16} color="#D97706" />
        )}
      </View>
      <View style={s.modeBannerTextCol}>
        <Text
          style={[
            s.modeBannerTitle,
            { color: isOffer ? "#1D4ED8" : "#B45309" },
            darkMode && { color: isOffer ? "#93C5FD" : "#FDE68A" },
          ]}
        >
          {isOffer
            ? t("postTypeOfferBannerTitle", language)
            : t("postTypeRequestBannerTitle", language)}
        </Text>
        <Text style={[s.modeBannerDesc, darkMode && s.tMutedDk]}>
          {isOffer
            ? t("postTypeOfferBannerDesc", language)
            : t("postTypeRequestBannerDesc", language)}
        </Text>
      </View>
    </View>
  );
};

export default CreateModeBanner;
