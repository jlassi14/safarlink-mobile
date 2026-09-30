import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { TravelerProposal } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import {
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Coins,
  Lock,
  ExternalLink,
} from "lucide-react-native";
import MutualResolutionSection from "@/components/offers/MutualResolutionSection";

interface ProposalItemProps {
  proposal: TravelerProposal;
  demand: any;
  isDemandAccepted: boolean;
  onAccept: (demand: any, proposal: TravelerProposal) => void;
  onReject: (demandId: string | number, proposalId: string, travelerName: string) => void;
  onComplete?: (proposalId: string) => void;
  onDispute?: (proposalId: string) => void;
  onCancel?: (proposalId: string) => void;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const ProposalItem: React.FC<ProposalItemProps> = ({
  proposal,
  demand,
  isDemandAccepted,
  onAccept,
  onReject,
  onComplete,
  onDispute,
  onCancel,
  language,
  darkMode,
  primaryColor,
}) => {
  const router = useRouter();
  const isArabic = language === "ar";

  const demandId = demand?.id;
  const isPending = proposal.status === "pending";
  const isAccepted = proposal.status === "accepted";
  const isDelivered = proposal.status === "delivered";
  const isCompleted = proposal.status === "completed";
  const isDisputed = proposal.status === "disputed";
  const isRejected = proposal.status === "rejected";
  const isCancelled = proposal.status === "cancelled";

  return (
    <View
      style={[
        styles.proposalCard,
        darkMode && styles.proposalCardDark,
        (isAccepted || isDelivered || isCompleted) && styles.proposalCardAccepted,
        isDelivered && { borderColor: "#10B981", borderWidth: 1.5 },
      ]}
    >
      <View style={styles.travelerRow}>
        <TouchableOpacity
          onPress={() => {
            const travelerId = (proposal as any).travelerId || (proposal as any).traveler?.id;
            if (travelerId) {
              router.push({
                pathname: "/(app)/user/[id]",
                params: {
                  id: travelerId,
                  name: proposal.travelerName,
                  avatar: proposal.travelerAvatar,
                },
              });
            }
          }}
          activeOpacity={0.8}
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
        >
          <Image
            source={{
              uri:
                proposal.travelerAvatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            }}
            style={styles.travelerAvatar}
          />
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
        </TouchableOpacity>

        {isAccepted && (
          <View style={styles.acceptedPill}>
            <CheckCircle2 size={11} color="#059669" />
            <Text style={styles.acceptedPillText}>
              {t("statusAcceptedBadge", language)}
            </Text>
          </View>
        )}

        {isDelivered && (
          <View style={[styles.acceptedPill, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
            <Text style={{ fontSize: 11, color: "#059669", fontWeight: "700" }}>
              {isArabic ? "تم التسليم 📦" : "Livré 📦"}
            </Text>
          </View>
        )}

        {isCompleted && (
          <View style={[styles.acceptedPill, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
            <CheckCircle2 size={11} color="#2563EB" />
            <Text style={{ fontSize: 11, color: "#2563EB", fontWeight: "700" }}>
              {isArabic ? "مكتمل 💰" : "Complété 🎉"}
            </Text>
          </View>
        )}

        {isDisputed && (
          <View style={[styles.rejectedPill, { backgroundColor: "#FFF1F2", borderColor: "#FECDD3" }]}>
            <AlertCircle size={11} color="#E11D48" />
            <Text style={{ fontSize: 11, color: "#E11D48", fontWeight: "700" }}>
              {isArabic ? "نزاع ⚠️" : "Litige ⚠️"}
            </Text>
          </View>
        )}

        {isRejected && (
          <View style={[styles.rejectedPill, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
            <Text style={{ fontSize: 11, color: "#DC2626", fontWeight: "700" }}>
              {isArabic ? "مرفوض ✗" : "Refusé ✗"}
            </Text>
          </View>
        )}

        {isCancelled && (
          <View style={[styles.rejectedPill, { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" }]}>
            <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "700" }}>
              {isArabic ? "ملغى ✗" : "Annulé ✗"}
            </Text>
          </View>
        )}

        {isPending && (
          <View style={[styles.acceptedPill, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
            <Clock size={11} color="#D97706" />
            <Text style={{ fontSize: 11, color: "#D97706", fontWeight: "700" }}>
              {isArabic ? "قيد الانتظار ⏳" : "En attente ⏳"}
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
              {proposal.arrivalDate || proposal.flightDate}
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

      {/* Mutual Resolution Section when Accepted or Delivered */}
      {(isAccepted || isDelivered) && (
        <View style={{ marginVertical: 6 }}>
          <MutualResolutionSection
            proposalId={proposal.id}
            itemType="PROPOSAL"
            role="SENDER"
            senderAction={(proposal as any).senderAction}
            travelerAction={(proposal as any).travelerAction}
            bookingStatus={proposal.status}
            paymentStatus={(proposal as any).paymentStatus || "HELD"}
            totalPrice={demand?.reward}
            currency={demand?.currency || "USD"}
            onActionSubmitted={() => {
              if (demandId) {
                router.push(`/(app)/request/${demandId}`);
              }
            }}
          />
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {isPending && !isDemandAccepted ? (
          <>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: primaryColor }]}
              onPress={() => onAccept(demand, proposal)}
              activeOpacity={0.85}
            >
              <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.acceptBtnText}>
                {isArabic ? "قبول وتأمين الدفع 🔒" : "Accepter & Payer 🔒"}
              </Text>
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
        ) : (isAccepted || isDelivered) ? (
          <View style={{ flexDirection: "row", gap: 8, flex: 1, flexWrap: "wrap" }}>
            <TouchableOpacity
              style={[styles.chatBtn, { backgroundColor: primaryColor, flex: 1 }]}
              onPress={() =>
                router.push({
                  pathname: "/(app)/chat/[id]",
                  params: { id: `chat_${proposal.id}` },
                })
              }
              activeOpacity={0.85}
            >
              <MessageSquare size={13} color="#FFFFFF" />
              <Text style={styles.chatBtnText}>
                {t("chatTravelerBtn", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chatBtn,
                {
                  backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                  borderColor: primaryColor + "40",
                  borderWidth: 1,
                  paddingHorizontal: 12,
                },
              ]}
              onPress={() => {
                if (demandId) {
                  router.push(`/(app)/request/${demandId}`);
                }
              }}
              activeOpacity={0.85}
            >
              <ExternalLink size={13} color={primaryColor} />
              <Text style={[styles.chatBtnText, { color: primaryColor }]}>
                {isArabic ? "تفاصيل الطلب ➔" : "Page Détails ➔"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : isCompleted ? (
          <View
            style={[
              styles.acceptedPill,
              {
                backgroundColor: "#ECFDF5",
                borderColor: "#A7F3D0",
                paddingHorizontal: 12,
                paddingVertical: 6,
              },
            ]}
          >
            <CheckCircle2 size={13} color="#059669" />
            <Text style={{ fontSize: 12, color: "#059669", fontWeight: "700" }}>
              {isArabic
                ? "تم تسليم الشحنة وتحرير المبلغ بنجاح 🎉"
                : "Livraison confirmée et fonds libérés 🎉"}
            </Text>
          </View>
        ) : isDisputed ? (
          <View
            style={[
              styles.rejectedPill,
              {
                backgroundColor: "#FFF1F2",
                borderColor: "#FECDD3",
                paddingHorizontal: 12,
                paddingVertical: 6,
              },
            ]}
          >
            <AlertCircle size={13} color="#E11D48" />
            <Text style={{ fontSize: 12, color: "#E11D48", fontWeight: "700" }}>
              {isArabic
                ? "نزاع مفتوح - الأموال مجمدة قيد المراجعة"
                : "Litige ouvert - Fonds gelés sous séquestre"}
            </Text>
          </View>
        ) : (
          <View style={styles.rejectedPill}>
            <Text style={styles.rejectedPillText}>
              {isCancelled
                ? isArabic
                  ? "تم الإلغاء واسترداد المبلغ"
                  : "Demande annulée / Remboursée"
                : t("rejectedOfferBadge", language)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
