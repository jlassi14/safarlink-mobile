import { StyleSheet } from "react-native";

export const offersStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  safeAreaDark: {
    backgroundColor: "#0B1120",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerDark: {
    backgroundColor: "#151E2E",
    borderBottomColor: "#1E293B",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 12,
    fontWeight: "500",
  },
  textDark: {
    color: "#FFFFFF",
  },
  modeSegmentContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeSegmentContainerDark: {
    backgroundColor: "#1E293B",
  },
  modeSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  modeSegmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  modeSegmentBtnActiveDark: {
    backgroundColor: "#0F172A",
  },
  modeSegmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  modeSegmentTextActive: {
    fontWeight: "800",
  },
  filterTabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingBottom: 2,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
});
