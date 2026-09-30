import { router } from "expo-router";

export function handleNotificationNavigation(data?: Record<string, any>) {
  if (!data) return;

  try {
    const type = data.type || data.notificationType;
    const bookingId = data.bookingId;
    const offerId = data.offerId;
    const targetId = data.targetId;

    console.log("[Notifications] Navigating for notification payload:", {
      type,
      bookingId,
      offerId,
      targetId,
    });

    // 1. Direct price proposal navigation
    const resolvedProposalId = data.proposalId || targetId;
    if (
      (type === "PRICE_PROPOSAL_CREATED" ||
        type === "PRICE_PROPOSAL_ACCEPTED" ||
        type === "PRICE_PROPOSAL_REJECTED" ||
        type === "PRICE_PROPOSAL_UPDATED" ||
        (type && String(type).startsWith("PRICE_PROPOSAL"))) &&
      resolvedProposalId
    ) {
      router.push({
        pathname: "/(app)/booking-details" as any,
        params: { id: resolvedProposalId, type: "proposal", from: "notifications" },
      });
      return;
    }

    // 2. Direct booking details
    const resolvedBookingId = targetId || bookingId;
    if (
      (type === "BOOKING_CREATED" ||
        type === "BOOKING_ACCEPTED" ||
        type === "BOOKING_CANCELLED" ||
        type === "BOOKING_CONFIRMED" ||
        type === "ACTION_SUBMITTED" ||
        type === "BOOKING_COMPLETED" ||
        type === "BOOKING_DISPUTED") &&
      resolvedBookingId
    ) {
      router.push({
        pathname: "/(app)/booking-details" as any,
        params: { id: resolvedBookingId, from: "notifications" },
      });
      return;
    }

    // 2. Direct offer details
    const resolvedOfferId = targetId || offerId;
    if (type === "OFFER_FULLY_BOOKED" && resolvedOfferId) {
      router.push({
        pathname: "/(app)/offer-details" as any,
        params: { offerId: resolvedOfferId, from: "notifications" },
      });
      return;
    }

    // Fallback: notifications tab
    router.push("/(app)/(tabs)/notifications" as any);
  } catch (err) {
    console.warn("[Notifications] Deep link navigation failed:", err);
  }
}
