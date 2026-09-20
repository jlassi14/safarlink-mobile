import { StyleSheet, Platform } from "react-native";

export const requestsStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  safeAreaDark: { backgroundColor: "#0B1120" },
  header: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerDark: { backgroundColor: "#151E2E", borderBottomColor: "#1E293B" },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A", letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: "500" },

  // Mode Segment Switcher
  modeSegmentContainer: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 3, marginTop: 10, marginBottom: 4 },
  modeSegmentContainerDark: { backgroundColor: "#0B1120" },
  modeSegmentBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 7.5, borderRadius: 10 },
  modeSegmentBtnActive: { backgroundColor: "#FFFFFF", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 1.5 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  modeSegmentBtnActiveDark: { backgroundColor: "#1E293B" },
  modeSegmentText: { fontSize: 12.5, fontWeight: "600" },
  countBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 9 },
  countBadgeInactive: { backgroundColor: "#E2E8F0" },
  countBadgeText: { fontSize: 10.5, fontWeight: "800" },

  // Filter Chips
  filterTabsContainer: { gap: 6, paddingHorizontal: 2, paddingTop: 6 },
  filterTab: { paddingHorizontal: 13, paddingVertical: 5.5, borderRadius: 9, backgroundColor: "#F1F5F9" },
  filterTabActive: { backgroundColor: "#2563EB", shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  filterTabText: { fontSize: 11.5, fontWeight: "600", color: "#64748B" },
  filterTabTextActive: { color: "#FFFFFF", fontWeight: "800" },

  // Scroll Content
  scrollContent: { padding: 14 },
  listContainer: { gap: 14 },

  // Card
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", position: "relative", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  cardAccepted: { borderColor: "#BBF7D0", backgroundColor: "#F0FDF4" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  senderProfile: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E2E8F0", borderWidth: 1.5, borderColor: "#FFFFFF" },
  senderInfo: { flex: 1 },
  senderName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  senderNameAndStatusRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  datesMetaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 3, flexWrap: "wrap" },
  dateMetaItem: { flexDirection: "row", alignItems: "center", gap: 3.5 },
  dateMetaText: { fontSize: 10.5, color: "#64748B", fontWeight: "600" },
  dateMetaTextDark: { color: "#94A3B8" },

  // Status Capsule Badge
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7.5, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10.5, fontWeight: "800" },

  // Absolute Naked Trash
  nakedCornerTrashBtn: { position: "absolute", top: 6, right: 6, zIndex: 20, padding: 4, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },

  // Aviation Route Corridor
  routeTimelineBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
  routeTimelineBoxDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  routeLocCol: { flex: 1, minWidth: 0, justifyContent: "center" },
  alignRight: { alignItems: "flex-end" },
  routeCityPrimary: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  routeCountrySecondary: { fontSize: 11, fontWeight: "500", color: "#64748B", marginTop: 1 },
  textRight: { textAlign: "right" },
  routeFlightTrack: { width: 44, alignItems: "center", justifyContent: "center", position: "relative", marginHorizontal: 8 },
  routeTrackLine: { position: "absolute", height: 1.5, left: 0, right: 0, backgroundColor: "#CBD5E1" },
  planeIconBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", zIndex: 2, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 },

  // Specs Row
  specsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  weightBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  weightText: { fontSize: 12, fontWeight: "800" },
  rewardPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  rewardPillDark: { backgroundColor: "#1E293B" },
  rewardPillText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  demandPriceText: { fontSize: 13, fontWeight: "800", color: "#2563EB" },
  editDemandBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#BFDBFE" },
  editDemandBtnDark: { backgroundColor: "#1E293B", borderColor: "#3B82F6" },
  editDemandBtnText: { fontSize: 11, fontWeight: "700" },
  roleBadgePill: { paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 5 },
  roleBadgeText: { fontSize: 10, fontWeight: "800" },
  receptionRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  receptionDateSubtext: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  receptionDateSubtextDark: { color: "#94A3B8" },

  // Proposals Accordion & Banner
  deliveryOffersBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  deliveryOffersBannerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#2563EB40",
  },
  deliveryOffersLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryOffersText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  proposalsContainer: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  proposalsContainerDark: { borderTopColor: "#1E293B" },
  proposalsClickableHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8 },
  proposalsClickableHeaderDark: { backgroundColor: "transparent" },
  proposalsHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  proposalsIconBadge: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  proposalsHeaderTitle: { fontSize: 12.5, fontWeight: "800", color: "#334155" },
  chevronPill: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  chevronPillActive: { backgroundColor: "#EFF6FF" },
  proposalsItemsList: { marginTop: 10, gap: 10 },
  noOffersContainer: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  noOffersContainerDark: { borderTopColor: "#1E293B" },
  noOffersText: { fontSize: 11, color: "#94A3B8", fontStyle: "italic" },

  // Proposal Card
  proposalCard: { backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  proposalCardDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  proposalCardAccepted: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  travelerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  travelerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  travelerInfo: { flex: 1 },
  travelerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  travelerName: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  proposalCreatedAtText: { fontSize: 10.5, color: "#94A3B8", marginTop: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#FEF3C7", paddingHorizontal: 4.5, paddingVertical: 1, borderRadius: 5 },
  ratingText: { fontSize: 10, fontWeight: "800", color: "#D97706" },
  acceptedPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: 6 },
  acceptedPillText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  // Boarding Flight Box
  flightBox: { backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10, gap: 4, borderWidth: 1, borderColor: "#F1F5F9" },
  flightBoxDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  flightBoxItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flightIconPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  flightIconEmoji: { fontSize: 12 },
  flightBoxLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  flightBoxValue: { fontSize: 11.5, fontWeight: "800", color: "#0F172A" },
  dateTimeBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeBadgePill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#F1F5F9", paddingHorizontal: 5.5, paddingVertical: 1.5, borderRadius: 5, borderWidth: 1, borderColor: "#E2E8F0" },
  timeBadgePillDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  timeBadgeText: { fontSize: 10.5, fontWeight: "800", color: "#475569" },

  // Actions
  actionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  acceptBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 13, paddingVertical: 7.5, borderRadius: 8 },
  acceptBtnText: { color: "#FFFFFF", fontSize: 11.5, fontWeight: "800" },
  rejectBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF2F2", paddingHorizontal: 12, paddingVertical: 7.5, borderRadius: 8, borderWidth: 1, borderColor: "#FECACA" },
  rejectBtnText: { color: "#DC2626", fontSize: 11.5, fontWeight: "700" },
  rejectedPill: { backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rejectedPillText: { fontSize: 11, color: "#DC2626", fontWeight: "700" },
  chatBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8.5, borderRadius: 9, width: "100%" },
  chatBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },

  // My Application Submitted Card Box
  myAppSubmissionBox: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, marginTop: 10, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  myAppSubmissionBoxDark: { backgroundColor: "#0B1120", borderColor: "#1E293B" },
  myAppSubmissionHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  myAppSubmissionTitle: { fontSize: 11.5, fontWeight: "800" },

  // Empty State
  emptyCard: { marginHorizontal: 4, marginTop: 20, padding: 30, backgroundColor: "#FFFFFF", borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  emptyCardDark: { backgroundColor: "#151E2E", borderColor: "#1E293B" },
  emptyIconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16.5, fontWeight: "900", color: "#0F172A", textAlign: "center", marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 16, lineHeight: 17, paddingHorizontal: 10 },
  emptyActionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  emptyActionBtnText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "800" },
  textDark: { color: "#FFFFFF" },

  // Edit Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" },
  editModalContainer: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 24, maxHeight: "90%" },
  editModalContainerDark: { backgroundColor: "#151E2E" },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalHeaderTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  modalCloseBtn: { padding: 6, borderRadius: 20, backgroundColor: "#F1F5F9" },
  modalRouteSummary: { backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 16 },
  modalRouteText: { fontSize: 13, fontWeight: "700", color: "#2563EB", textAlign: "center" },
  modalFormGroup: { marginBottom: 14 },
  modalFormLabel: { fontSize: 12.5, fontWeight: "700", color: "#334155", marginBottom: 6 },
  modalInput: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: "#0F172A" },
  modalInputDark: { backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF" },
  modalTextArea: { height: 70, textAlignVertical: "top" },
  modalActionsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9" },
  modalCancelBtnText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  modalSaveBtn: { flex: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 10 },
  modalSaveBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});

// Backward-compatibility export
export const styles = requestsStyles;
