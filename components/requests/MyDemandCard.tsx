import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MyPackageRequest, MOCK_DEFAULT_AVATAR } from "@/lib/mockData";
import { Language, t } from "@/lib/i18n";
import { styles } from "@/styles/requestsStyles";
import { getStatusColor, getCleanWeight } from "./requestsUtils";
import { RouteCorridor } from "./RouteCorridor";
import { ProposalItem } from "./ProposalItem";
import {
  Trash2,
  Clock,
  Calendar,
  Package,
  Edit3,
  Plane,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

interface MyDemandCardProps {
  demand: MyPackageRequest;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string | number) => void;
  onEdit: (demand: MyPackageRequest) => void;
  onAcceptProposal: (demandId: string | number, proposalId: string, travelerName: string) => void;
  onRejectProposal: (demandId: string | number, proposalId: string, travelerName: string) => void;
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
  language,
  darkMode,
  primaryColor,
}) => {
  const reqIdStr = String(demand.id);
  const proposals = demand.proposals || [];
  const proposalsCount = proposals.length;
  const statusInfo = getStatusColor(demand.status || "pending", language);
  const weightStr = getCleanWeight(demand.weight || "1.0 kg");
  const dateDisplay = demand.date || t("flexibleDate", language);
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
        <View style={styles.senderProfile}>
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
                  {t("publishedOn", language)} {demand.createdAt || "16 Aug 2026"}
                </Text>
              </View>
              <View style={styles.dateMetaItem}>
                <Calendar size={10.5} color="#64748B" />
                <Text
                  style={[styles.dateMetaText, darkMode && styles.dateMetaTextDark]}
                  numberOfLines={1}
                >
                  {t("receptionDate", language)} {dateDisplay}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Symmetrical Aviation Flight Corridor */}
      <RouteCorridor
        from={demand.from}
        to={demand.to}
        primaryColor={primaryColor}
        darkMode={darkMode}
      />

      {/* 3. Specs Row */}
      <View style={styles.specsRow}>
        <View style={[styles.weightBadge, { backgroundColor: primaryColor + "12" }]}>
          <Package size={12} color={primaryColor} />
          <Text style={[styles.weightText, { color: primaryColor }]}>{weightStr}</Text>
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

      {/* 4. Proposals Accordion Container */}
      {proposalsCount > 0 ? (
        <View style={[styles.proposalsContainer, darkMode && styles.proposalsContainerDark]}>
          <TouchableOpacity
            style={[
              styles.proposalsClickableHeader,
              darkMode && styles.proposalsClickableHeaderDark,
            ]}
            onPress={() => onToggleExpand(reqIdStr)}
            activeOpacity={0.75}
          >
            <View style={styles.proposalsHeaderLeft}>
              <View style={[styles.proposalsIconBadge, { backgroundColor: primaryColor + "15" }]}>
                <Plane size={13} color={primaryColor} />
              </View>
              <Text style={[styles.proposalsHeaderTitle, darkMode && styles.textDark]}>
                {t("deliveryOffersReceived", language, { count: proposalsCount })}
              </Text>
            </View>
            <View style={[styles.chevronPill, isExpanded && styles.chevronPillActive]}>
              {isExpanded ? (
                <ChevronUp size={14} color={primaryColor} />
              ) : (
                <ChevronDown size={14} color="#64748B" />
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.proposalsItemsList}>
              {proposals.map((prop) => (
                <ProposalItem
                  key={prop.id}
                  proposal={prop}
                  demandId={demand.id}
                  isDemandAccepted={isDemandAccepted}
                  onAccept={onAcceptProposal}
                  onReject={onRejectProposal}
                  language={language}
                  darkMode={darkMode}
                  primaryColor={primaryColor}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.noOffersContainer, darkMode && styles.noOffersContainerDark]}>
          <Clock size={11} color="#94A3B8" />
          <Text style={styles.noOffersText}>{t("noProposalsYet", language)}</Text>
        </View>
      )}
    </View>
  );
};
