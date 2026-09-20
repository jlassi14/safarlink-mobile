import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { MyApplicationItem, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { getApplicationStatusColor } from "./requestsUtils";
import { RouteCorridor } from "./RouteCorridor";
import TunisiaDeliveryDetailsCard from "@/components/TunisiaDeliveryDetailsCard";
import {
  Star,
  Clock,
  Package,
  Sparkles,
  MessageSquare,
  XCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";

interface MyApplicationCardProps {
  app: MyApplicationItem;
  onRevoke: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  language: Language;
  darkMode: boolean;
  primaryColor: string;
}

export const MyApplicationCard: React.FC<MyApplicationCardProps> = ({
  app,
  onRevoke,
  onMarkDelivered,
  language,
  darkMode,
  primaryColor,
}) => {
  const router = useRouter();
  const isArabic = language === "ar";
  const appStatus = getApplicationStatusColor(app.status, language);

  const isAccepted = app.status === "accepted";
  const isDelivered = app.status === "delivered";
  const isCompleted = app.status === "completed";
  const isDisputed = app.status === "disputed";
  const isPending = app.status === "pending";

  return (
    <View
      style={[
        styles.card,
        darkMode && styles.cardDark,
        (isAccepted || isDelivered || isCompleted) && styles.cardAccepted,
      ]}
    >
      {/* Creator Profile & Status */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.senderProfile}
          onPress={() => {
            const creatorId = app.creatorId || (app as any).userId;
            if (creatorId) {
              router.push({
                pathname: "/(app)/user/[id]",
                params: {
                  id: creatorId,
                  name: app.creatorName,
                  avatar: app.creatorAvatar,
                },
              });
            }
          }}
          activeOpacity={0.8}
        >
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
                {t("appliedAgo", language)} {app.appliedAt || app.submittedAt || "Recently"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

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

      {/* Symmetrical Aviation Route Corridor (Tappable to Details) */}
      <TouchableOpacity
        onPress={() => {
          const targetId = app.demandId || app.id;
          if (targetId) {
            router.push(`/(app)/request/${targetId}`);
          }
        }}
        activeOpacity={0.85}
      >
        <RouteCorridor
          from={app.from}
          to={app.to}
          primaryColor={primaryColor}
          darkMode={darkMode}
        />
      </TouchableOpacity>

      {/* Target Post Specs */}
      <View style={styles.specsRow}>
        <View style={[styles.weightBadge, { backgroundColor: primaryColor + "12" }]}>
          <Package size={12} color={primaryColor} />
          <Text style={[styles.weightText, { color: primaryColor }]}>{app.weight || app.myRequestedWeight || "1 kg"}</Text>
        </View>
        <View style={styles.rewardPill}>
          <Text style={styles.rewardPillText}>{app.reward || app.myProposedPrice || "Reward"}</Text>
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
              {app.myFlightDate || app.targetDate}
            </Text>
            <View style={[styles.timeBadgePill, darkMode && styles.timeBadgePillDark]}>
              <Clock size={10} color="#64748B" />
              <Text style={styles.timeBadgeText}>{app.myFlightTime || "14:30"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Escrow Guarantee Banner for Traveler */}
      {isAccepted && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F0FDF4",
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#BBF7D0",
            marginVertical: 10,
            gap: 8,
          }}
        >
          <ShieldCheck size={16} color="#16A34A" />
          <Text style={{ fontSize: 12, color: "#15803D", fontWeight: "600", flex: 1 }}>
            {isArabic
              ? "🔒 المبلغ مؤمن في الضمان: سيتم تحرير مكافأتك فور تسليم الشحنة وتأكيد الاستلام."
              : "🔒 Paiement garanti sous séquestre : vos gains vous seront versés dès livraison confirmée."}
          </Text>
        </View>
      )}

      {/* Tunisia Domestic Delivery Full Details Card if applicable */}
      {app.deliveryMethod && (
        <View style={{ marginVertical: 8 }}>
          <TunisiaDeliveryDetailsCard
            deliveryMethod={app.deliveryMethod}
            contactName={app.deliveryContactName}
            contactPhone={app.deliveryContactPhone}
            deliveryFee={app.deliveryFee}
            paymentMethod={app.deliveryPaymentMethod}
            deliveryAddress={app.deliveryAddress}
            bookingStatus={app.status}
            isTraveler={true}
            hidePricing={true}
          />
        </View>
      )}

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        {isAccepted ? (
          <View style={{ flexDirection: "column", gap: 8, flex: 1, width: "100%" }}>
            {onMarkDelivered && (
              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  {
                    backgroundColor: "#16A34A",
                    width: "100%",
                    paddingVertical: 10,
                    justifyContent: "center",
                  },
                ]}
                onPress={() => onMarkDelivered(app.id)}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={[styles.acceptBtnText, { fontSize: 13, fontWeight: "700" }]}>
                  {isArabic ? "تأكيد تسليم الشحنة 📦" : "Marquer comme livré 📦"}
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
              <TouchableOpacity
                style={[styles.chatBtn, { backgroundColor: primaryColor, flex: 1 }]}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/chat/[id]",
                    params: { id: `chat_${app.id}` },
                  })
                }
                activeOpacity={0.85}
              >
                <MessageSquare size={13} color="#FFFFFF" />
                <Text style={styles.chatBtnText}>
                  {t("chatSenderBtn", language)}
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
                  const targetId = app.demandId || app.id;
                  if (targetId) {
                    router.push(`/(app)/request/${targetId}`);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.chatBtnText, { color: primaryColor }]}>
                  {isArabic ? "تفاصيل الطلب ➔" : "Détails ➔"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isDelivered ? (
          <View style={{ flexDirection: "column", gap: 8, flex: 1, width: "100%" }}>
            <View
              style={[
                styles.acceptedPill,
                {
                  backgroundColor: "#F0FDFA",
                  borderColor: "#99F6E4",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  justifyContent: "center",
                },
              ]}
            >
              <Clock size={13} color="#0D9488" />
              <Text style={{ fontSize: 12, color: "#0D9488", fontWeight: "700", marginLeft: 6 }}>
                {isArabic
                  ? "تم تسليم الشحنة - بانتظار تأكيد المرسل لتحرير المبلغ"
                  : "Colis livré - En attente de confirmation de l'expéditeur"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
              <TouchableOpacity
                style={[styles.chatBtn, { backgroundColor: primaryColor, flex: 1 }]}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/chat/[id]",
                    params: { id: `chat_${app.id}` },
                  })
                }
                activeOpacity={0.85}
              >
                <MessageSquare size={13} color="#FFFFFF" />
                <Text style={styles.chatBtnText}>
                  {t("chatSenderBtn", language)}
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
                  const targetId = app.demandId || app.id;
                  if (targetId) {
                    router.push(`/(app)/request/${targetId}`);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.chatBtnText, { color: primaryColor }]}>
                  {isArabic ? "تفاصيل الطلب ➔" : "Détails ➔"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isCompleted ? (
          <View
            style={[
              styles.acceptedPill,
              {
                backgroundColor: "#ECFDF5",
                borderColor: "#A7F3D0",
                paddingHorizontal: 12,
                paddingVertical: 8,
                width: "100%",
                justifyContent: "center",
              },
            ]}
          >
            <CheckCircle2 size={14} color="#059669" />
            <Text style={{ fontSize: 12, color: "#059669", fontWeight: "700", marginLeft: 6 }}>
              {isArabic
                ? "تم تحرير المبلغ بنجاح! شكراً لك 🎉"
                : "Livraison terminée ! Paiement libéré 💰"}
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
                paddingVertical: 8,
                width: "100%",
                justifyContent: "center",
              },
            ]}
          >
            <AlertCircle size={14} color="#E11D48" />
            <Text style={{ fontSize: 12, color: "#E11D48", fontWeight: "700", marginLeft: 6 }}>
              {isArabic
                ? "نزاع مفتوح - قيد مراجعة فريق SafarLink"
                : "Litige ouvert - Examen en cours"}
            </Text>
          </View>
        ) : isPending ? (
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
