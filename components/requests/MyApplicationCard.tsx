import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MyApplicationItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { getApplicationStatusColor } from "./requestsUtils";
import { RouteCorridor } from "./RouteCorridor";
import {
  Star,
  Clock,
  Package,
  Sparkles,
  MessageSquare,
  XCircle,
} from "lucide-react-native";

interface MyApplicationCardProps {
  app: MyApplicationItem;
  onRevoke: (id: string) => void;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const MyApplicationCard: React.FC<MyApplicationCardProps> = ({
  app,
  onRevoke,
  language,
  darkMode,
  primaryColor,
}) => {
  const router = useRouter();
  const appStatus = getApplicationStatusColor(app.status, language);

  return (
    <View
      style={[
        styles.card,
        darkMode && styles.cardDark,
        app.status === "accepted" && styles.cardAccepted,
      ]}
    >
      {/* Creator Profile & Status */}
      <View style={styles.headerRow}>
        <View style={styles.senderProfile}>
          <Image
            source={{ uri: app.creatorAvatar || MOCK_DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View style={styles.senderInfo}>
            <View style={styles.senderNameAndStatusRow}>
              <Text style={[styles.senderName, darkMode && styles.textDark]} numberOfLines={1}>
                {app.creatorName}
              </Text>
              {app.creatorRating && (
                <View style={styles.ratingBadge}>
                  <Star size={10} color="#D97706" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{app.creatorRating.toFixed(1)}</Text>
                </View>
              )}
              <View style={[styles.roleBadgePill, { backgroundColor: "#EFF6FF" }]}>
                <Text style={[styles.roleBadgeText, { color: "#2563EB" }]}>
                  {t("senderRoleBadge", language)}
                </Text>
              </View>
            </View>

            <View style={styles.receptionRow}>
              <Clock size={11} color="#64748B" />
              <Text
                style={[styles.receptionDateSubtext, darkMode && styles.receptionDateSubtextDark]}
                numberOfLines={1}
              >
                {t("appliedAgo", language)} {app.appliedAt}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: appStatus.bg, borderColor: appStatus.border },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: appStatus.dot }]} />
          <Text style={[styles.statusText, { color: appStatus.text }]}>
            {appStatus.label}
          </Text>
        </View>
      </View>

      {/* Symmetrical Aviation Route Corridor */}
      <RouteCorridor
        from={app.from}
        to={app.to}
        primaryColor={primaryColor}
        darkMode={darkMode}
      />

      {/* Target Post Specs */}
      <View style={styles.specsRow}>
        <View style={[styles.weightBadge, { backgroundColor: primaryColor + "12" }]}>
          <Package size={12} color={primaryColor} />
          <Text style={[styles.weightText, { color: primaryColor }]}>{app.weight}</Text>
        </View>
        <View style={styles.rewardPill}>
          <Text style={styles.rewardPillText}>{app.reward}</Text>
        </View>
      </View>

      {/* My Submitted Proposal Box */}
      <View style={[styles.myAppSubmissionBox, darkMode && styles.myAppSubmissionBoxDark]}>
        <View style={styles.myAppSubmissionHeader}>
          <Sparkles size={12} color={primaryColor} />
          <Text style={[styles.myAppSubmissionTitle, { color: primaryColor }]}>
            {t("myProposalDetailsTitle", language)}
          </Text>
        </View>

        <View style={styles.flightBoxItem}>
          <View style={styles.flightIconPill}>
            <Text style={styles.flightIconEmoji}>🛫</Text>
            <Text style={styles.flightBoxLabel}>{t("myFlightLabel", language)}</Text>
          </View>
          <View style={styles.dateTimeBadgeRow}>
            <Text style={[styles.flightBoxValue, darkMode && styles.textDark]}>
              {app.myFlightDate}
            </Text>
            <View style={[styles.timeBadgePill, darkMode && styles.timeBadgePillDark]}>
              <Clock size={10} color="#64748B" />
              <Text style={styles.timeBadgeText}>{app.myFlightTime}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        {app.status === "accepted" ? (
          <TouchableOpacity
            style={[styles.chatBtn, { backgroundColor: primaryColor }]}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat/[id]",
                params: { id: "chat_leila" },
              })
            }
            activeOpacity={0.85}
          >
            <MessageSquare size={13} color="#FFFFFF" />
            <Text style={styles.chatBtnText}>
              {t("chatSenderBtn", language)}
            </Text>
          </TouchableOpacity>
        ) : app.status === "pending" ? (
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => onRevoke(app.id)}
            activeOpacity={0.85}
          >
            <XCircle size={13} color="#DC2626" />
            <Text style={styles.rejectBtnText}>
              {t("withdrawProposalTitle", language)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rejectedPill}>
            <Text style={styles.rejectedPillText}>
              {t("rejectedByCreator", language)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
