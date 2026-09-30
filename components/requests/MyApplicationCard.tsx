import React from "react";
import { useRouter } from "expo-router";
import { MyApplicationItem } from "@/lib/mockData";
import { Language } from "@/lib/i18n";
import BookingItemCard from "@/components/offers/BookingItemCard";

export interface MyApplicationCardProps {
  app: MyApplicationItem;
  onRevoke: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  language?: Language;
  darkMode?: boolean;
  primaryColor?: string;
}

export const MyApplicationCard: React.FC<MyApplicationCardProps> = ({
  app,
  onRevoke,
  onMarkDelivered,
}) => {
  const router = useRouter();

  return (
    <BookingItemCard
      item={app}
      onRevoke={onRevoke}
      onComplete={onMarkDelivered}
      onPress={(id) => {
        try {
          router.push({
            pathname: "/(app)/booking-details" as any,
            params: {
              id,
              type: app.isPriceProposal ? "proposal" : "delivery_proposal",
            },
          });
        } catch (e) {
          router.push(`/booking-details?id=${id}&type=${app.isPriceProposal ? "proposal" : "delivery_proposal"}` as any);
        }
      }}
    />
  );
};

export default MyApplicationCard;
