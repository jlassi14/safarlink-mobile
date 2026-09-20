import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MyPackageRequest, TravelerProposal, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { getStatusColor, getCleanWeight, formatDisplayDate } from "./requestsUtils";
import { RouteCorridor } from "./RouteCorridor";
import {
  Trash2,
  Clock,
  Calendar,
  Package,
  Edit3,
  Plane,
  ChevronRight,
} from "lucide-react-native";

interface MyDemandCardProps {
  demand: MyPackageRequest;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string | number) => void;
  onEdit: (demand: MyPackageRequest) => void;
  onAcceptProposal: (demand: MyPackageRequest, proposal: TravelerProposal) => void;
  onRejectProposal: (demandId: string | number, proposalId: string, travelerName: string) => void;
  onCompleteProposal?: (proposalId: string) => void;
  onDisputeProposal?: (proposalId: string) => void;
  onCancelProposal?: (proposalId: string) => void;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const MyDemandCard: React.FC<MyDemandCardProps> = ({
  demand,
  isExpanded,
  onToggleExpand,
  onDelete,
  onEdit,
  onAcceptProposal,
  onRejectProposal,
  onCompleteProposal,
  onDisputeProposal,
  onCancelProposal,
  language,
  darkMode,
  primaryColor,
}) => {
  const router = useRouter();
  const reqIdStr = String(demand.id);
  const proposals = demand.proposals || [];
  const proposalsCount = proposals.length;
  const statusInfo = getStatusColor(demand.status || "pending", language);
  const weightStr = getCleanWeight(demand.weight || "1.0 kg");
  const formattedCreatedAt = formatDisplayDate(demand.createdAt, language) || (language === "ar" ? "حديثاً" : "Récemment");
  const formattedTargetDate = formatDisplayDate(demand.date || (demand as any).targetDate, language) || t("flexibleDate", language);
  const rewardStr = React.useMemo(() => {
    if (demand.reward !== undefined && demand.reward !== null && demand.reward !== "") {
      const val = String(demand.reward);
      const curr = demand.currency || "QAR";
      return val.includes(curr) ? val : `${curr} ${val}`;
    }
    return "";
  }, [demand.reward, demand.currency]);
  const isDemandAccepted = demand.status === "accepted";
  const canDelete = !isDemandAccepted && demand.status !== "completed";

  return (
    <View style={[styles.card, darkMode && styles.cardDark]}>
      {/* Absolute Naked Trash Icon */}
      {canDelete && (
        <TouchableOpacity
          style={styles.nakedCornerTrashBtn}
          onPress={() => onDelete(demand.id)}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      )}

      {/* 1. Header Row: Sender Profile (Avatar + Name + Status Badge) */}
      <View style={[styles.headerRow, canDelete && { paddingRight: 24 }]}>
        <TouchableOpacity
          style={styles.senderProfile}
          onPress={() => {
            if (demand.userId || (demand as any).user?.id) {
              router.push({
                pathname: "/(app)/user/[id]",
                params: {
                  id: demand.userId || (demand as any).user?.id,
                  name: demand.senderName,
                  avatar: demand.senderAvatar,
                },
              });
            }
          }}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: demand.senderAvatar || MOCK_DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View style={styles.senderInfo}>
            <View style={styles.senderNameAndStatusRow}>
              <Text style={[styles.senderName, darkMode && styles.textDark]} numberOfLines={1}>
                {demand.senderName || "Ahmed (Me)"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusInfo.bg, borderColor: statusInfo.border },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusInfo.dot }]} />
                <Text style={[styles.statusText, { color: statusInfo.text }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {/* Dates Metadata: Creation Date & Reception Date */}
            <View style={styles.datesMetaRow}>
              <View style={styles.dateMetaItem}>
                <Clock size={10.5} color="#64748B" />
                <Text
                  style={[styles.dateMetaText, darkMode && styles.dateMetaTextDark]}
                  numberOfLines={1}
                >
                  {t("publishedOn", language)} {formattedCreatedAt}
                </Text>
              </View>
              <View style={styles.dateMetaItem}>
                <Calendar size={10.5} color="#64748B" />
                <Text
                  style={[styles.dateMetaText, darkMode && styles.dateMetaTextDark]}
                  numberOfLines={1}
                >
                  {t("receptionDate", language)} {formattedTargetDate}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Symmetrical Aviation Flight Corridor (Tappable to Details) */}
      <TouchableOpacity
        onPress={() => router.push(`/(app)/request/${demand.id}`)}
        activeOpacity={0.85}
      >
        <RouteCorridor
          from={demand.from}
          to={demand.to}
          primaryColor={primaryColor}
          darkMode={darkMode}
        />
      </TouchableOpacity>

      {/* Tunisia Domestic Delivery Badge */}
      {demand.deliveryMethod ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: darkMode ? "#1E293B" : "#F1F5F9",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginHorizontal: 12,
            marginBottom: 8,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13 }}>🇹🇳</Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: darkMode ? "#CBD5E1" : "#334155",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {demand.deliveryMethod === "FAMILY"
              ? `${t("deliveryMethodFamily", language)}${demand.deliveryContactName ? `: ${demand.deliveryContactName}` : ""}${demand.deliveryContactPhone ? ` • 📞 ${demand.deliveryContactPhone}` : ""}`
              : demand.deliveryMethod === "COURIER"
              ? `${t("deliveryMethodCourier", language)}${demand.deliveryFee ? ` (${demand.deliveryFee} TND)` : ""}`
              : `${t("deliveryMethodIFastPro", language)} (Express)`}
          </Text>
        </View>
      ) : null}

      {/* 3. Specs Row: Weight, Price & Optional Edit */}
      <View style={styles.specsRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[styles.weightBadge, { backgroundColor: primaryColor + "12" }]}>
            <Package size={12} color={primaryColor} />
            <Text style={[styles.weightText, { color: primaryColor }]}>{weightStr}</Text>
          </View>

          {Boolean(rewardStr) && (
            <Text style={[styles.demandPriceText, { color: primaryColor }]}>
              {rewardStr}
            </Text>
          )}
        </View>

        {/* Edit button if 0 proposals received */}
        {!isDemandAccepted && demand.status !== "completed" && proposalsCount === 0 && (
          <TouchableOpacity
            style={[styles.editDemandBtn, darkMode && styles.editDemandBtnDark]}
            onPress={() => onEdit(demand)}
            activeOpacity={0.8}
          >
            <Edit3 size={12} color={primaryColor} />
            <Text style={[styles.editDemandBtnText, { color: primaryColor }]}>
              {t("editDemandBtn", language)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Delivery Offers Blue Banner: Navigates to Details Page */}
      {proposalsCount > 0 ? (
        <TouchableOpacity
          style={[
            styles.deliveryOffersBanner,
            darkMode && styles.deliveryOffersBannerDark,
          ]}
          onPress={() => router.push(`/(app)/request/${demand.id}`)}
          activeOpacity={0.75}
        >
          <View style={styles.deliveryOffersLeft}>
            <Plane size={14} color={primaryColor} />
            <Text style={[styles.deliveryOffersText, { color: primaryColor }]}>
              {t("deliveryOffersReceived", language, { count: proposalsCount })}
            </Text>
          </View>
          <ChevronRight size={14} color={primaryColor} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.noOffersContainer, darkMode && styles.noOffersContainerDark]}>
          <Clock size={11} color="#94A3B8" />
          <Text style={styles.noOffersText}>{t("noProposalsYet", language)}</Text>
        </View>
      )}
    </View>
  );
};
