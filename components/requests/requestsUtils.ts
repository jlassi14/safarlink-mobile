import { Language, t } from "@/lib/i18n";
import { BackendDemandItem } from "@/lib/api";
import { MyPackageRequest } from "@/lib/mockData";

export type FilterTab = "all" | "proposals" | "pending" | "accepted" | "completed";
export type ModeTab = "my_demands" | "my_applications";
export type AppFilterTab = "all" | "pending" | "accepted" | "rejected";

export const formatDisplayDate = (rawDate?: string | Date, lang: Language = "fr"): string => {
  if (!rawDate) return "";
  try {
    const d = typeof rawDate === "string" ? new Date(rawDate) : rawDate;
    if (isNaN(d.getTime())) return String(rawDate);
    return d.toLocaleDateString(lang === "ar" ? "ar-TN" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(rawDate);
  }
};

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
    case "delivered":
      return {
        bg: "#F0FDFA",
        text: "#0D9488",
        border: "#99F6E4",
        dot: "#14B8A6",
        label: lang === "ar" ? "تم التسليم 📦" : lang === "fr" ? "Livré 📦" : "Delivered 📦",
      };
    case "completed":
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: lang === "ar" ? "مكتمل & مدفوع 💰" : lang === "fr" ? "Complété & Payé 💰" : "Completed & Paid 💰",
      };
    case "disputed":
      return {
        bg: "#FFF1F2",
        text: "#E11D48",
        border: "#FECDD3",
        dot: "#F43F5E",
        label: lang === "ar" ? "نزاع مفتوح ⚠️" : lang === "fr" ? "En litige ⚠️" : "Disputed ⚠️",
      };
    case "cancelled":
      return {
        bg: "#F1F5F9",
        text: "#64748B",
        border: "#CBD5E1",
        dot: "#94A3B8",
        label: lang === "ar" ? "ملغي" : lang === "fr" ? "Annulé" : "Cancelled",
      };
    case "rejected":
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: lang === "ar" ? "مرفوض ✗" : lang === "fr" ? "Refusé ✗" : "Declined ✗",
      };
    default:
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        border: "#BFDBFE",
        dot: "#3B82F6",
        label: lang === "ar" ? "قيد التنفيذ ⏳" : lang === "fr" ? "En attente ⏳" : "Active ⏳",
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
        label: lang === "ar" ? "مقبول 🔒" : lang === "fr" ? "Accepté 🔒" : "Accepted 🔒",
      };
    case "delivered":
      return {
        bg: "#F0FDFA",
        text: "#0D9488",
        border: "#99F6E4",
        dot: "#14B8A6",
        label: lang === "ar" ? "تم التسليم 📦" : lang === "fr" ? "Livré 📦" : "Delivered 📦",
      };
    case "completed":
      return {
        bg: "#ECFDF5",
        text: "#059669",
        border: "#A7F3D0",
        dot: "#10B981",
        label: lang === "ar" ? "مكتمل ✅" : lang === "fr" ? "Terminé ✅" : "Completed ✅",
      };
    case "disputed":
      return {
        bg: "#FFF1F2",
        text: "#E11D48",
        border: "#FECDD3",
        dot: "#F43F5E",
        label: lang === "ar" ? "نزاع مفتوح ⚠️" : lang === "fr" ? "En litige ⚠️" : "Disputed ⚠️",
      };
    case "cancelled":
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: lang === "ar" ? "ملغى ✗" : lang === "fr" ? "Annulé ✗" : "Cancelled ✗",
      };
    case "rejected":
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        border: "#FECACA",
        dot: "#EF4444",
        label: lang === "ar" ? "مرفوض ✗" : lang === "fr" ? "Refusé ✗" : "Declined ✗",
      };
    default:
      return {
        bg: "#FFFBEB",
        text: "#D97706",
        border: "#FDE68A",
        dot: "#F59E0B",
        label: lang === "ar" ? "قيد الانتظار ⏳" : lang === "fr" ? "En attente ⏳" : "Pending ⏳",
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
    deliveryMethod: d.deliveryMethod || null,
    deliveryContactName: d.deliveryContactName || null,
    deliveryContactPhone: d.deliveryContactPhone || null,
    deliveryFee: d.deliveryFee !== undefined ? d.deliveryFee : null,
    deliveryPaymentMethod: d.deliveryPaymentMethod || null,
    deliveryAddress: d.deliveryAddress || null,
    createdAt: d.createdAt,
    createdTimestamp: new Date(d.createdAt).getTime(),
    proposals: [],
  };
};
