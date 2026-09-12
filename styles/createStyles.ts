import { StyleSheet } from "react-native";

export const createStyles = StyleSheet.create({
  flex1: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  safeDk: { backgroundColor: "#111827" },
  tW: { color: "#FFFFFF" },
  tMuted: { color: "#6B7280" },
  tMutedDk: { color: "#9CA3AF" },

  // Header
  head: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headDk: { backgroundColor: "#1F2937", borderBottomColor: "#374151" },
  headTopRow: { marginBottom: 8 },
  headTitle: { fontSize: 21, fontWeight: "900", color: "#1F2937", letterSpacing: -0.4 },
  headSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  // Segmented Switcher
  seg: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segDk: { backgroundColor: "#27303F" },
  segTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  segTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segTabActiveDk: {
    backgroundColor: "#1F2937",
  },
  segIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segIconActive: {
    backgroundColor: "#EFF6FF",
  },
  segIconInactive: {
    backgroundColor: "transparent",
  },
  segLabel: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Mode Clarity Hint Banner
  modeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  modeBannerOffer: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  modeBannerOfferDk: {
    backgroundColor: "#1E293B",
    borderColor: "#1E3A8A",
  },
  modeBannerRequest: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  modeBannerRequestDk: {
    backgroundColor: "#292524",
    borderColor: "#78350F",
  },
  modeBannerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBannerTextCol: {
    flex: 1,
  },
  modeBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  modeBannerDesc: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 15,
  },

  // Scroll Content
  scroll: {
    padding: 14,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDk: { backgroundColor: "#1F2937", borderColor: "#374151" },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeadLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: { fontSize: 14, fontWeight: "800", color: "#1F2937" },

  // Route Grid
  routeGrid: { gap: 0 },
  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 9,
  },
  routeBoxDk: { backgroundColor: "#111827", borderColor: "#374151" },
  routeBoxActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  routeBoxErr: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  routeDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  routeDotOrange: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F89A1C",
  },
  routeTextCol: { flex: 1 },
  routeFieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  routeFieldVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 1,
  },
  routePlaceholder: { color: "#9CA3AF", fontWeight: "500" },

  swapBtn: {
    alignSelf: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: -5,
    zIndex: 2,
  },
  swapBtnDk: { backgroundColor: "#374151", borderColor: "#4B5563" },

  // Responsive Fields Row
  responsiveRow: {
    flexDirection: "row",
    gap: 8,
  },
  rowItemLarge: {
    flex: 1.25,
  },
  rowItemSmall: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 5,
    marginLeft: 2,
  },

  // Textarea
  textarea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: "#1F2937",
    textAlignVertical: "top",
    minHeight: 70,
  },
  textareaDk: { backgroundColor: "#111827", borderColor: "#374151", color: "#FFFFFF" },

  // Error
  errText: { fontSize: 11, color: "#EF4444", fontWeight: "500", marginTop: 3, marginLeft: 4 },

  // Currency Badge Selector inside Input
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 4,
    marginLeft: 6,
  },
  currencyBadgeDk: {
    backgroundColor: "#1E293B",
    borderColor: "#3B82F6",
  },
  currencyBadgeFlag: {
    fontSize: 13,
  },
  currencyBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },
  currencyBadgeTextDk: {
    color: "#60A5FA",
  },

  // Dynamic Currency Prefix inside Input
  currencyPrefixBox: {
    minWidth: 26,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 4,
  },
  currencyPrefixBoxDk: {
    backgroundColor: "#374151",
  },
  currencyPrefixText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },
  currencyPrefixTextDk: {
    color: "#60A5FA",
  },

  // Publish Button
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 2,
  },
  publishText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.2 },
});

export default createStyles;
