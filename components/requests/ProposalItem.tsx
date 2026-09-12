import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { PackageProposal } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import {
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react-native";

interface ProposalItemProps {
  proposal: PackageProposal;
  demandId: string | number;
  isDemandAccepted: boolean;
  onAccept: (demandId: string | number, proposalId: string, travelerName: string) => void;
  onReject: (demandId: string | number, proposalId: string, travelerName: string) => void;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const ProposalItem: React.FC<ProposalItemProps> = ({
  proposal,
  demandId,
  isDemandAccepted,
  onAccept,
  onReject,
  language,
  darkMode,
  primaryColor,
}) => {
  const router = useRouter();

  return (
    <View
      style={[
        styles.proposalCard,
        darkMode && styles.proposalCardDark,
        proposal.status === "accepted" && styles.proposalCardAccepted,
      ]}
    >
      <View style={styles.travelerRow}>
        <Image source={{ uri: proposal.travelerAvatar }} style={styles.travelerAvatar} />
        <View style={styles.travelerInfo}>
          <View style={styles.travelerNameRow}>
            <Text style={[styles.travelerName, darkMode && styles.textDark]}>
              {proposal.travelerName}
            </Text>
            {proposal.rating && (
              <View style={styles.ratingBadge}>
                <Star size={10} color="#D97706" fill="#F59E0B" />
                <Text style={styles.ratingText}>{proposal.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.proposalCreatedAtText}>
            {proposal.createdAt || "Just now"}
          </Text>
        </View>
        {proposal.status === "accepted" && (
          <View style={styles.acceptedPill}>
            <CheckCircle2 size={11} color="#059669" />
            <Text style={styles.acceptedPillText}>
              {t("statusAcceptedBadge", language)}
            </Text>
          </View>
        )}
      </View>

      {/* Boarding Pass Timing Box */}
      <View style={[styles.flightBox, darkMode && styles.flightBoxDark]}>
        <View style={styles.flightBoxItem}>
          <View style={styles.flightIconPill}>
            <Text style={styles.flightIconEmoji}>🛫</Text>
            <Text style={styles.flightBoxLabel}>
              {t("flightDepartureTime", language)}
            </Text>
          </View>
          <View style={styles.dateTimeBadgeRow}>
            <Text style={[styles.flightBoxValue, darkMode && styles.textDark]}>
              {proposal.flightDate}
            </Text>
            <View style={[styles.timeBadgePill, darkMode && styles.timeBadgePillDark]}>
              <Clock size={10} color="#64748B" />
              <Text style={styles.timeBadgeText}>{proposal.flightTime || "14:30"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.flightBoxItem}>
          <View style={styles.flightIconPill}>
            <Text style={styles.flightIconEmoji}>🛬</Text>
            <Text style={styles.flightBoxLabel}>
              {t("flightArrivalTime", language)}
            </Text>
          </View>
          <View style={styles.dateTimeBadgeRow}>
            <Text style={[styles.flightBoxValue, { color: primaryColor, fontWeight: "800" }]}>
              {proposal.arrivalDate}
            </Text>
            <View
              style={[
                styles.timeBadgePill,
                { backgroundColor: primaryColor + "15", borderColor: primaryColor + "30" },
              ]}
            >
              <Clock size={10} color={primaryColor} />
              <Text style={[styles.timeBadgeText, { color: primaryColor, fontWeight: "700" }]}>
                {proposal.arrivalTime || "18:45"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {proposal.status === "pending" && !isDemandAccepted ? (
          <>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: primaryColor }]}
              onPress={() => onAccept(demandId, proposal.id, proposal.travelerName)}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.acceptBtnText}>{t("acceptBtn", language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onReject(demandId, proposal.id, proposal.travelerName)}
              activeOpacity={0.85}
            >
              <XCircle size={13} color="#DC2626" />
              <Text style={styles.rejectBtnText}>{t("declineBtn", language)}</Text>
            </TouchableOpacity>
          </>
        ) : proposal.status === "accepted" ? (
          <TouchableOpacity
            style={[styles.chatBtn, { backgroundColor: primaryColor }]}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat/[id]",
                params: { id: "chat_mehdi" },
              })
            }
            activeOpacity={0.85}
          >
            <MessageSquare size={13} color="#FFFFFF" />
            <Text style={styles.chatBtnText}>
              {t("chatTravelerBtn", language)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rejectedPill}>
            <Text style={styles.rejectedPillText}>
              {t("rejectedOfferBadge", language)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
