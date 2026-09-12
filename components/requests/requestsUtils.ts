import { Language, t } from "@/lib/i18n";
import { BackendDemandItem } from "@/lib/api";
import { MyPackageRequest } from "@/lib/mockData";

export type FilterTab = "all" | "proposals" | "pending" | "accepted" | "completed";
export type ModeTab = "my_demands" | "my_applications";
export type AppFilterTab = "all" | "pending" | "accepted" | "rejected";

export const getCleanWeight = (rawWeight?: string): string => {
  if (!rawWeight) return "1.0 kg";
  const match = rawWeight.match(/(\d+(?:\.\d+)?\s*kg)/i);
  if (match) return match[1].toLowerCase();
  const numMatch = rawWeight.match(/\d+(?:\.\d+)?/);
  if (numMatch) return `${numMatch[0]} kg`;
  return rawWeight;
};

export const getStatusColor = (st: string, lang: Language) => {
  switch (st) {
    case "accepted":
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: t("statusAcceptedBadge", lang),
      };
    case "completed":
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: t("statusCompletedBadge", lang),
      };
    case "rejected":
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: t("statusRejectedBadge", lang),
      };
    default:
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: t("statusInProgressBadge", lang),
      };
  }
};

export const getApplicationStatusColor = (st: string, lang: Language) => {
  switch (st) {
    case "accepted":
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: t("statusAcceptedProposal", lang),
      };
    case "rejected":
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: t("statusDeclinedProposal", lang),
      };
    default:
      return {
        bg: "#FFFBEB",
        text: "#D97706",
        border: "#FDE68A",
        dot: "#F59E0B",
        label: t("statusPendingProposal", lang),
      };
  }
};

export const mapBackendDemand = (d: BackendDemandItem): MyPackageRequest => {
  const rawDate = d.targetDate ? new Date(d.targetDate) : new Date();
  const formattedDate = isNaN(rawDate.getTime())
    ? String(d.targetDate || "Flexible")
    : rawDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  let statusMapped: "pending" | "accepted" | "completed" | "rejected" = "pending";
  if (d.status === "ACCEPTED") statusMapped = "accepted";
  else if (d.status === "COMPLETED") statusMapped = "completed";
  else if (d.status === "REJECTED" || d.status === "CANCELLED") statusMapped = "rejected";

  return {
    id: d.id,
    title: "Package Shipment",
    from: d.from,
    to: d.to,
    status: statusMapped,
    date: formattedDate,
    reward: `${d.currency} ${d.reward}`,
    weight: `${d.weightKg.toFixed(1)} kg`,
    weightKg: d.weightKg,
    senderName: d.user?.name || "Sender",
    senderAvatar: d.user?.avatar || undefined,
    description: d.description || undefined,
    createdAt: d.createdAt,
    createdTimestamp: new Date(d.createdAt).getTime(),
    proposals: [],
  };
};
