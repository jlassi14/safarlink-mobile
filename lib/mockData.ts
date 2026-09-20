import { translations } from "./i18n";

export type TranslationKey = keyof typeof translations.en;

export interface DemandItem {
  id: string;
  senderName: string;
  senderAvatar: string;
  weight: string;
  weightKg?: number;
  proposedPrice: string;
  notes?: string;
  status: "pending" | "accepted" | "rejected" | "in_transit" | "delivered" | "completed" | "cancelled" | "disputed";
  paymentStatus?: string;
  deliveryMethod?: "FAMILY" | "COURIER" | "I_FAST_PRO" | null;
  deliveryContactName?: string | null;
  deliveryContactPhone?: string | null;
  deliveryFee?: number | null;
  deliveryPaymentMethod?: "CASH" | "CLICTOPAY" | null;
  deliveryAddress?: string | null;
  deliveryStatus?: string | null;
  senderAction?: "COMPLETED" | "CANCELLED" | null;
  travelerAction?: "COMPLETED" | "CANCELLED" | null;
  createdAt?: string;
}

export interface OfferItem {
  id: string;
  from: string;
  to: string;
  flightDate: string;
  departureDate?: string;
  departureTime?: string;
  destinationDate?: string;
  destinationTime?: string;
  totalKg: number;
  remainingKg?: number;
  capacity: string;
  pricePerKg: string;
  status: string;
  deliveryMethod?: "FAMILY" | "COURIER" | "I_FAST_PRO" | null;
  deliveryContactName?: string | null;
  deliveryContactPhone?: string | null;
  deliveryFee?: number | null;
  deliveryPaymentMethod?: "CASH" | "CLICTOPAY" | null;
  deliveryAddress?: string | null;
  deliveryStatus?: string | null;
  createdAt?: string;
  createdTime?: string;
  createdTimestamp?: number;
  demands: DemandItem[];
}

export interface HomeOfferItem {
  id: string;
  userId?: string;
  user: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  destinationDate: string;
  destinationTime: string;
  weight: string;
  reward: string;
  date: string;
  rating: number;
  avatar: string;
  deliveryMethod?: "FAMILY" | "COURIER" | "I_FAST_PRO" | null;
  deliveryContactName?: string | null;
  deliveryContactPhone?: string | null;
  deliveryFee?: number | null;
  deliveryPaymentMethod?: "CASH" | "CLICTOPAY" | null;
  deliveryAddress?: string | null;
}

export interface MiddlewareOrderContact {
  name: string;
  avatar: string;
  lastMsgKey?: TranslationKey;
  lastMsgEn?: string;
  lastMsgFr?: string;
  lastMsgAr?: string;
}

export interface MiddlewareOrder {
  id: string;
  route: string;
  sender: MiddlewareOrderContact;
  receiver: MiddlewareOrderContact;
  statusKey?: TranslationKey;
  statusEn?: string;
  statusFr?: string;
  statusAr?: string;
  time: string;
  unread: number;
}

export interface ChatParticipantProfile {
  name: string;
  roleKey?: TranslationKey;
  roleEn: string;
  roleFr?: string;
  roleAr: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  textKey?: TranslationKey;
  textEn?: string;
  textFr?: string;
  textAr?: string;
  time: string;
}

export interface TravelerProposal {
  id: string;
  travelerName: string;
  travelerAvatar: string;
  rating?: number;
  flightDate: string;
  flightTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  proposedPrice?: string;
  status: "pending" | "accepted" | "delivered" | "completed" | "rejected" | "cancelled" | "disputed";
  paymentStatus?: "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED" | string;
  payoutStatus?: string | null;
  rawProposal?: any;
  createdAt: string;
}

export interface MyPackageRequest {
  id: number | string;
  title?: string;
  from: string;
  to: string;
  status: "pending" | "accepted" | "completed" | "rejected";
  date: string;
  reward: string;
  weight?: string;
  weightKg?: number;
  senderName?: string;
  senderAvatar?: string;
  description?: string;
  createdAt?: string;
  createdTime?: string;
  createdTimestamp?: number;
  deliveryMethod?: "FAMILY" | "COURIER" | "I_FAST_PRO" | null;
  deliveryContactName?: string | null;
  deliveryContactPhone?: string | null;
  deliveryFee?: number | null;
  deliveryPaymentMethod?: "CASH" | "CLICTOPAY" | null;
  deliveryAddress?: string | null;
  proposals?: TravelerProposal[];
}

export interface NotificationItem {
  id: string;
  type: "demand_received" | "request_accepted" | "request_rejected";
  titleKey?: TranslationKey;
  bodyKey?: TranslationKey;
  titleEn?: string;
  titleFr?: string;
  titleAr?: string;
  bodyEn?: string;
  bodyFr?: string;
  bodyAr?: string;
  time: string;
  read: boolean;
  avatar?: string;
  targetId?: string;
}

export interface AdItem {
  id: string;
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
  title: string;
  subtitle: string;
  phone: string;
  badge: string;
  image: string;
  bgColor: string;
}

export interface BottomMiniAdConfig {
  id: string;
  badge: string;
  badgeBg: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  buttonTextKey: TranslationKey;
  btnColor: string;
  iconType: "globe" | "shield" | "message";
  image: string;
}

export interface CompactAdItem {
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
  title: string;
  subtitle: string;
  phone: string;
  image: string;
}

// ---------------------------------------------------------------------------
// Mock Avatars & Fallbacks
// ---------------------------------------------------------------------------
export const MOCK_DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

export const MOCK_DEMO_AVATARS: string[] = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
];

// ---------------------------------------------------------------------------
// Helper to generate dynamic future mock dates
// ---------------------------------------------------------------------------
export const getRelDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ---------------------------------------------------------------------------
// 1. Real Mock Offers (Shared Across Home, Offers, Offer-Details)
// ---------------------------------------------------------------------------
export const REAL_MOCK_OFFERS: OfferItem[] = [
  {
    id: "off_1",
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    flightDate: getRelDate(3),
    departureDate: getRelDate(3),
    departureTime: "14:30",
    destinationDate: getRelDate(3),
    destinationTime: "18:45",
    totalKg: 20,
    capacity: "14.0 kg available",
    pricePerKg: "QR 35 / kg",
    status: "Active",
    createdAt: "16 Aug 2026",
    createdTime: "11:00",
    createdTimestamp: 1786875600000,
    demands: [
      {
        id: "dem_101",
        senderName: "Yassine H.",
        senderAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        weight: "2.5 kg",
        weightKg: 2.5,
        proposedPrice: "QR 90",
        notes: "Urgent Macbook Pro & legal documents for family in Tunis.",
        status: "pending",
        createdAt: "1h ago",
      },
      {
        id: "dem_102",
        senderName: "Leila A.",
        senderAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        weight: "4.0 kg",
        weightKg: 4.0,
        proposedPrice: "QR 140",
        notes: "Sealed traditional wedding dresses and gifts.",
        status: "accepted",
        createdAt: "3h ago",
      },
      {
        id: "dem_103",
        senderName: "Khaled M.",
        senderAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        weight: "3.5 kg",
        weightKg: 3.5,
        proposedPrice: "QR 125",
        notes: "Prescription asthma medicine & organic vitamins.",
        status: "pending",
        createdAt: "5h ago",
      },
      {
        id: "dem_104",
        senderName: "Amine B.",
        senderAvatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        weight: "5.0 kg",
        weightKg: 5.0,
        proposedPrice: "QR 175",
        notes: "Peugeot engine sensor & brake pads parcel.",
        status: "pending",
        createdAt: "8h ago",
      },
      {
        id: "dem_105",
        senderName: "Fatma Z.",
        senderAvatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        weight: "2.0 kg",
        weightKg: 2.0,
        proposedPrice: "QR 70",
        notes: "French perfumes and skincare gift sets.",
        status: "accepted",
        createdAt: "12h ago",
      },
      {
        id: "dem_106",
        senderName: "Sami K.",
        senderAvatar:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
        weight: "6.0 kg",
        weightKg: 6.0,
        proposedPrice: "QR 210",
        notes: "Medical school textbooks & graduation thesis.",
        status: "pending",
        createdAt: "1d ago",
      },
      {
        id: "dem_107",
        senderName: "Nour E.",
        senderAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
        weight: "1.5 kg",
        weightKg: 1.5,
        proposedPrice: "QR 55",
        notes: "Original running shoes in box.",
        status: "pending",
        createdAt: "1d ago",
      },
      {
        id: "dem_108",
        senderName: "Bilal T.",
        senderAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        weight: "15.0 kg",
        weightKg: 15.0,
        proposedPrice: "QR 525",
        notes: "Espresso machine (exceeds remaining 14 kg!).",
        status: "pending",
        createdAt: "2d ago",
      },
      {
        id: "dem_109",
        senderName: "Hela N.",
        senderAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        weight: "3.0 kg",
        weightKg: 3.0,
        proposedPrice: "QR 105",
        notes: "Canned Deglet Nour dates & spices.",
        status: "rejected",
        createdAt: "2d ago",
      },
      {
        id: "dem_110",
        senderName: "Karim W.",
        senderAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        weight: "1.0 kg",
        weightKg: 1.0,
        proposedPrice: "QR 50",
        notes: "Sealed iPhone 15 Pro Max box.",
        status: "pending",
        createdAt: "3d ago",
      },
      {
        id: "dem_111",
        senderName: "Ines M.",
        senderAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        weight: "2.5 kg",
        weightKg: 2.5,
        proposedPrice: "QR 85",
        notes: "Newborn baby outfits & plush toys.",
        status: "pending",
        createdAt: "3d ago",
      },
      {
        id: "dem_112",
        senderName: "Mehdi R.",
        senderAvatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        weight: "4.0 kg",
        weightKg: 4.0,
        proposedPrice: "QR 140",
        notes: "Traditional Kairouan wool tapestry.",
        status: "pending",
        createdAt: "4d ago",
      },
    ],
  },
  {
    id: "off_2",
    from: "Tunisia - Monastir 🇹🇳",
    to: "Saudi Arabia - Jeddah 🇸🇦",
    flightDate: getRelDate(7),
    departureDate: getRelDate(7),
    departureTime: "08:15",
    destinationDate: getRelDate(7),
    destinationTime: "13:30",
    totalKg: 10,
    capacity: "0.0 kg available",
    pricePerKg: "SAR 45 / kg",
    status: "Fully Booked",
    createdAt: "15 Aug 2026",
    createdTime: "16:30",
    createdTimestamp: 1786795800000,
    demands: [
      {
        id: "dem_201",
        senderName: "Sonia R.",
        senderAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
        weight: "4.0 kg",
        weightKg: 4.0,
        proposedPrice: "€ 56",
        notes: "Tunisian hand-painted ceramics & virgin olive oil.",
        status: "accepted",
        createdAt: "4h ago",
      },
      {
        id: "dem_202",
        senderName: "Tarek J.",
        senderAvatar:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
        weight: "6.0 kg",
        weightKg: 6.0,
        proposedPrice: "€ 84",
        notes: "Woven wool blankets for Paris apartment.",
        status: "accepted",
        createdAt: "6h ago",
      },
      {
        id: "dem_203",
        senderName: "Salma K.",
        senderAvatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        weight: "3.0 kg",
        weightKg: 3.0,
        proposedPrice: "€ 42",
        notes: "Notary contract docs & Harissa spice packs.",
        status: "pending",
        createdAt: "1d ago",
      },
      {
        id: "dem_204",
        senderName: "Rami B.",
        senderAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        weight: "2.0 kg",
        weightKg: 2.0,
        proposedPrice: "€ 28",
        notes: "Custom leather coat.",
        status: "rejected",
        createdAt: "2d ago",
      },
    ],
  },
  {
    id: "off_3",
    from: "UAE - Dubai 🇦🇪",
    to: "Tunisia - Sfax 🇹🇳",
    flightDate: getRelDate(10),
    departureDate: getRelDate(10),
    departureTime: "09:00",
    destinationDate: getRelDate(10),
    destinationTime: "14:15",
    totalKg: 15,
    capacity: "15.0 kg available",
    pricePerKg: "AED 40 / kg",
    status: "Active",
    createdAt: "14 Aug 2026",
    createdTime: "08:45",
    createdTimestamp: 1786709100000,
    demands: [
      {
        id: "dem_301",
        senderName: "Wael G.",
        senderAvatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        weight: "5.0 kg",
        weightKg: 5.0,
        proposedPrice: "AED 200",
        notes: "Dell XPS laptop & iPad for university student.",
        status: "pending",
        createdAt: "2h ago",
      },
      {
        id: "dem_302",
        senderName: "Chaima M.",
        senderAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        weight: "3.0 kg",
        weightKg: 3.0,
        proposedPrice: "AED 120",
        notes: "Oud perfume bottles and silk dresses.",
        status: "pending",
        createdAt: "7h ago",
      },
    ],
  },
  {
    id: "off_4",
    from: "Saudi Arabia - Riyadh 🇸🇦",
    to: "Tunisia - Djerba 🇹🇳",
    flightDate: getRelDate(14),
    departureDate: getRelDate(14),
    departureTime: "11:30",
    destinationDate: getRelDate(14),
    destinationTime: "16:00",
    totalKg: 12,
    capacity: "12.0 kg available",
    pricePerKg: "SAR 30 / kg",
    status: "Active",
    createdAt: "12 Aug 2026",
    createdTime: "13:20",
    createdTimestamp: 1786536000000,
    demands: [],
  },
  {
    id: "off_5",
    from: "Turkey - Istanbul 🇹🇷",
    to: "Tunisia - Tunis 🇹🇳",
    flightDate: getRelDate(18),
    departureDate: getRelDate(18),
    departureTime: "10:30",
    destinationDate: getRelDate(18),
    destinationTime: "12:45",
    totalKg: 25,
    capacity: "18.0 kg available",
    pricePerKg: "$ 12 / kg",
    status: "Active",
    createdAt: "10 Aug 2026",
    createdTime: "15:00",
    createdTimestamp: 1786362000000,
    demands: [],
  },
  {
    id: "off_6",
    from: "Canada - Montreal 🇨🇦",
    to: "Tunisia - Tunis 🇹🇳",
    flightDate: getRelDate(22),
    departureDate: getRelDate(22),
    departureTime: "19:00",
    destinationDate: getRelDate(23),
    destinationTime: "08:30",
    totalKg: 30,
    capacity: "22.0 kg available",
    pricePerKg: "CAD 18 / kg",
    status: "Active",
    createdAt: "05 Aug 2026",
    createdTime: "18:30",
    createdTimestamp: 1785930600000,
    demands: [],
  },
];

// ---------------------------------------------------------------------------
// 2. Base Home Screen Travel Offers
// ---------------------------------------------------------------------------
export const MOCK_BASE_OFFERS: HomeOfferItem[] = [
  {
    id: "tr_ist_1",
    user: "Can Y.",
    from: "Turkey - Istanbul 🇹🇷",
    to: "Tunisia - Tunis 🇹🇳",
    departureDate: getRelDate(18),
    departureTime: "10:30",
    destinationDate: getRelDate(18),
    destinationTime: "12:45",
    weight: "18.0 kg available",
    reward: "$ 12 / kg",
    date: getRelDate(18),
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "ca_yul_1",
    user: "Marc L.",
    from: "Canada - Montreal 🇨🇦",
    to: "Tunisia - Tunis 🇹🇳",
    departureDate: getRelDate(22),
    departureTime: "19:00",
    destinationDate: getRelDate(23),
    destinationTime: "08:30",
    weight: "22.0 kg available",
    reward: "CAD 18 / kg",
    date: getRelDate(22),
    rating: 5.0,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "1",
    user: "Ahmed B.",
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    departureDate: getRelDate(3),
    departureTime: "14:30",
    destinationDate: getRelDate(3),
    destinationTime: "18:45",
    weight: "14.0 kg available",
    reward: "QR 35 / kg",
    date: getRelDate(3),
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "2",
    user: "Fatima K.",
    from: "Qatar - Doha 🇶🇦",
    to: "UAE - Dubai 🇦🇪",
    departureDate: getRelDate(5),
    departureTime: "09:15",
    destinationDate: getRelDate(5),
    destinationTime: "11:30",
    weight: "12.0 kg available",
    reward: "QR 40 / kg",
    date: getRelDate(5),
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "3",
    user: "Omar S.",
    from: "Tunisia - Sousse 🇹🇳",
    to: "Qatar - Doha 🇶🇦",
    departureDate: getRelDate(8),
    departureTime: "07:00",
    destinationDate: getRelDate(8),
    destinationTime: "13:20",
    weight: "20.0 kg available",
    reward: "QR 30 / kg",
    date: getRelDate(8),
    rating: 5.0,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "4",
    user: "Sarah B.",
    from: "Morocco - Casablanca 🇲🇦",
    to: "Qatar - Doha 🇶🇦",
    departureDate: getRelDate(12),
    departureTime: "11:00",
    destinationDate: getRelDate(12),
    destinationTime: "16:30",
    weight: "15.0 kg available",
    reward: "MAD 120 / kg",
    date: getRelDate(12),
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "5",
    user: "Khaled M.",
    from: "Saudi Arabia - Riyadh 🇸🇦",
    to: "Tunisia - Sfax 🇹🇳",
    departureDate: getRelDate(15),
    departureTime: "16:45",
    destinationDate: getRelDate(15),
    destinationTime: "20:10",
    weight: "8.0 kg available",
    reward: "SAR 35 / kg",
    date: getRelDate(15),
    rating: 4.7,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "6",
    user: "Yassine H.",
    from: "Tunisia - Tunis 🇹🇳",
    to: "Qatar - Doha 🇶🇦",
    departureDate: getRelDate(20),
    departureTime: "22:15",
    destinationDate: getRelDate(21),
    destinationTime: "04:30",
    weight: "5.0 kg available",
    reward: "QR 35 / kg",
    date: getRelDate(20),
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "7",
    user: "Leila A.",
    from: "UAE - Abu Dhabi 🇦🇪",
    to: "Tunisia - Djerba 🇹🇳",
    departureDate: getRelDate(25),
    departureTime: "13:00",
    destinationDate: getRelDate(25),
    destinationTime: "17:15",
    weight: "10.0 kg available",
    reward: "AED 30 / kg",
    date: getRelDate(25),
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
  },
];

export interface HomeDemandItem {
  id: string;
  senderName: string;
  senderAvatar: string;
  from: string;
  to: string;
  date: string;
  weight: string;
  weightKg: number;
  reward: string;
  rating: number;
  status: "pending" | "accepted" | "in_transit" | "completed";
}

export const MOCK_BASE_DEMANDS: HomeDemandItem[] = [
  {
    id: "dem_home_1",
    senderName: "Nour E.",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    date: getRelDate(4),
    weight: "3.5 kg",
    weightKg: 3.5,
    reward: "QR 120",
    rating: 4.9,
    status: "pending",
  },
  {
    id: "dem_home_2",
    senderName: "Sami K.",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    from: "Turkey - Istanbul 🇹🇷",
    to: "Tunisia - Tunis 🇹🇳",
    date: getRelDate(7),
    weight: "6.0 kg",
    weightKg: 6.0,
    reward: "TL 850",
    rating: 4.8,
    status: "pending",
  },
  {
    id: "dem_home_3",
    senderName: "Marc L.",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    from: "Canada - Montreal 🇨🇦",
    to: "Tunisia - Tunis 🇹🇳",
    date: getRelDate(10),
    weight: "5.0 kg",
    weightKg: 5.0,
    reward: "CAD 95",
    rating: 5.0,
    status: "pending",
  },
  {
    id: "dem_home_4",
    senderName: "Salma K.",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    from: "Tunisia - Monastir 🇹🇳",
    to: "Saudi Arabia - Jeddah 🇸🇦",
    date: getRelDate(14),
    weight: "4.0 kg",
    weightKg: 4.0,
    reward: "SAR 180",
    rating: 4.9,
    status: "pending",
  },
  {
    id: "dem_home_5",
    senderName: "Wael G.",
    senderAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
    from: "UAE - Dubai 🇦🇪",
    to: "Tunisia - Sfax 🇹🇳",
    date: getRelDate(18),
    weight: "2.5 kg",
    weightKg: 2.5,
    reward: "AED 110",
    rating: 4.7,
    status: "pending",
  },
  {
    id: "dem_home_6",
    senderName: "Sarah B.",
    senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    from: "Morocco - Casablanca 🇲🇦",
    to: "Qatar - Doha 🇶🇦",
    date: getRelDate(22),
    weight: "4.5 kg",
    weightKg: 4.5,
    reward: "MAD 450",
    rating: 5.0,
    status: "pending",
  },
];

// ---------------------------------------------------------------------------
// 3. Middleware Logistics Orders (Chat Tab)
// ---------------------------------------------------------------------------
export const MOCK_MIDDLEWARE_ORDERS: MiddlewareOrder[] = [
  {
    id: "1",
    route: "Qatar (Doha) ➔ Tunisia (Tunis)",
    sender: {
      name: "Ahmed N. (Sender)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      lastMsgKey: "chatMsgPickupReadyDoha",
      lastMsgEn: "Package ready for pickup in Doha",
      lastMsgFr: "Colis prêt pour récupération à Doha",
      lastMsgAr: "الشحنة جاهزة للاستلام في الدوحة",
    },
    receiver: {
      name: "Fatima K. (Receiver)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      lastMsgKey: "chatMsgWaitingPickupTunis",
      lastMsgEn: "Waiting for pickup in Tunis",
      lastMsgFr: "En attente de récupération à Tunis",
      lastMsgAr: "في انتظار وصولك لتونس الاستلام",
    },
    statusKey: "middlewareActiveStatus",
    statusEn: "Middleware Active",
    statusFr: "Intermédiaire Actif",
    statusAr: "جاري التنسيق كـ وسيط",
    time: "10:42 AM",
    unread: 2,
  },
  {
    id: "2",
    route: "Qatar (Doha) ➔ UAE (Dubai)",
    sender: {
      name: "Omar S. (Sender)",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
      lastMsgKey: "chatMsgHandedToCourier",
      lastMsgEn: "Package handed over to courier",
      lastMsgFr: "Colis remis au transporteur",
      lastMsgAr: "تم تسليم الشحنة للوسيط بنجاح",
    },
    receiver: {
      name: "Sarah M. (Receiver)",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
      lastMsgKey: "chatMsgReceivedThanks",
      lastMsgEn: "Received! Thank you",
      lastMsgFr: "Bien reçu ! Merci",
      lastMsgAr: "شكراً جزيلاً! تم الاستلام",
    },
    statusKey: "orderCompletedStatus",
    statusEn: "Completed",
    statusFr: "Terminée",
    statusAr: "مكتملة",
    time: "Yesterday",
    unread: 0,
  },
];

// ---------------------------------------------------------------------------
// 4. Chat Conversation Profiles & Initial Messages (Chat Detail)
// ---------------------------------------------------------------------------
export const MOCK_SENDER_PROFILE: ChatParticipantProfile = {
  name: "Ahmed N.",
  roleKey: "senderQatarRole",
  roleEn: "Sender (Qatar)",
  roleFr: "Expéditeur (Qatar)",
  roleAr: "المرسل (قطر)",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
};

export const MOCK_RECEIVER_PROFILE: ChatParticipantProfile = {
  name: "Fatima K.",
  roleKey: "receiverTunisiaRole",
  roleEn: "Receiver (Tunisia)",
  roleFr: "Destinataire (Tunisie)",
  roleAr: "المستلم (تونس)",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
};

export const MOCK_SENDER_MESSAGES: ChatMessage[] = [
  {
    id: "s1",
    sender: "them",
    textKey: "chatMsgS1",
    textEn: "Hello! The package is ready for pickup at Doha Airport.",
    textFr: "Bonjour ! Le colis est prêt pour récupération à l'aéroport de Doha.",
    textAr: "أهلاً بك! الشحنة جاهزة للتسليم في مطار الدوحة.",
    time: "10:20 AM",
  },
  {
    id: "s2",
    sender: "me",
    textKey: "chatMsgS2",
    textEn: "Great! I will meet you to pick it up at 2 PM.",
    textFr: "Super ! Je vous rejoindrai pour le récupérer à 14h.",
    textAr: "ممتاز! سأستلمها منك الساعة 2 ظهراً.",
    time: "10:25 AM",
  },
];

export const MOCK_RECEIVER_MESSAGES: ChatMessage[] = [
  {
    id: "r1",
    sender: "them",
    textKey: "chatMsgR1",
    textEn: "Hi! When do you expect to arrive in Tunis?",
    textFr: "Salut ! Quand prévoyez-vous d'arriver à Tunis ?",
    textAr: "مرحباً! متى المتوقع وصولك لتونس لتسليم الشحنة؟",
    time: "10:30 AM",
  },
  {
    id: "r2",
    sender: "me",
    textKey: "chatMsgR2",
    textEn: "I arrive tomorrow at 6 PM and will contact you for drop-off.",
    textFr: "J'arrive demain à 18h et je vous contacterai immédiatement.",
    textAr: "سأصل غداً الساعة 6 مساءً وسأتواصل معك فوراً.",
    time: "10:35 AM",
  },
];

// ---------------------------------------------------------------------------
// 5. My Package Requests (Requests Tab & Request Details)
// ---------------------------------------------------------------------------
export const MOCK_MY_REQUESTS: MyPackageRequest[] = [
  {
    id: "req_101",
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    status: "pending",
    date: getRelDate(5),
    reward: "QR 150",
    weight: "2.5 kg",
    weightKg: 2.5,
    senderName: "Ahmed (Me)",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    createdAt: "16 Aug 2026",
    createdTime: "10:30",
    createdTimestamp: 1786873800000,
    proposals: [
      {
        id: "prop_1",
        travelerName: "Can Y.",
        travelerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        rating: 4.9,
        flightDate: getRelDate(4),
        flightTime: "14:30",
        arrivalDate: getRelDate(4),
        arrivalTime: "18:45",
        proposedPrice: "QR 150",
        status: "pending",
        createdAt: "2h ago",
      },
      {
        id: "prop_2",
        travelerName: "Leila A.",
        travelerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        rating: 4.8,
        flightDate: getRelDate(5),
        flightTime: "10:15",
        arrivalDate: getRelDate(5),
        arrivalTime: "14:30",
        proposedPrice: "QR 140",
        status: "pending",
        createdAt: "5h ago",
      },
    ],
  },
  {
    id: "req_102",
    from: "Tunisia - Monastir 🇹🇳",
    to: "France - Paris 🇫🇷",
    status: "accepted",
    date: getRelDate(10),
    reward: "€ 45",
    weight: "4.0 kg",
    weightKg: 4.0,
    senderName: "Ahmed (Me)",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    createdAt: "15 Aug 2026",
    createdTime: "14:15",
    createdTimestamp: 1786787400000,
    proposals: [
      {
        id: "prop_3",
        travelerName: "Mehdi R.",
        travelerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        rating: 4.95,
        flightDate: getRelDate(9),
        flightTime: "08:15",
        arrivalDate: getRelDate(9),
        arrivalTime: "11:45",
        proposedPrice: "€ 45",
        status: "accepted",
        createdAt: "1d ago",
      },
    ],
  },
  {
    id: "req_103",
    from: "Turkey - Istanbul 🇹🇷",
    to: "Tunisia - Tunis 🇹🇳",
    status: "pending",
    date: getRelDate(18),
    reward: "$ 35",
    weight: "1.5 kg",
    weightKg: 1.5,
    senderName: "Ahmed (Me)",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    createdAt: "13 Aug 2026",
    createdTime: "09:00",
    createdTimestamp: 1786614600000,
    proposals: [
      {
        id: "prop_4",
        travelerName: "Yassine H.",
        travelerAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
        rating: 4.7,
        flightDate: getRelDate(18),
        flightTime: "10:30",
        arrivalDate: getRelDate(18),
        arrivalTime: "13:15",
        proposedPrice: "$ 35",
        status: "pending",
        createdAt: "3h ago",
      },
    ],
  },
  {
    id: "req_104",
    from: "Saudi Arabia - Jeddah 🇸🇦",
    to: "Tunisia - Tunis 🇹🇳",
    status: "completed",
    date: "10 May, 2026",
    reward: "SAR 120",
    weight: "3.0 kg",
    weightKg: 3.0,
    senderName: "Ahmed (Me)",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    createdAt: "08 May 2026",
    createdTime: "16:20",
    createdTimestamp: 1778250000000,
    proposals: [],
  },
];

// ---------------------------------------------------------------------------
// 5.b My Applications & Submitted Proposals (Demands/Offers by other users I applied to)
// ---------------------------------------------------------------------------
export interface MyApplicationItem {
  id: string;
  type: "delivery_proposal" | "flight_booking";
  targetTitle: string;
  targetPostId?: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRating?: number;
  from: string;
  to: string;
  targetDate: string;
  weight: string;
  reward: string;
  myFlightDate?: string;
  myFlightTime?: string;
  myArrivalDate?: string;
  myArrivalTime?: string;
  myRequestedWeight?: string;
  myProposedPrice?: string;
  status: "pending" | "accepted" | "rejected" | "in_transit" | "delivered" | "completed" | "cancelled" | "disputed";
  bookingStatus?: string;
  paymentStatus?: string;
  totalPrice?: number;
  currency?: string;
  deliveryMethod?: "FAMILY" | "COURIER" | "I_FAST_PRO" | null;
  deliveryContactName?: string | null;
  deliveryContactPhone?: string | null;
  deliveryFee?: number | null;
  deliveryPaymentMethod?: "CASH" | "CLICTOPAY" | null;
  deliveryAddress?: string | null;
  deliveryStatus?: string | null;
  senderAction?: "COMPLETED" | "CANCELLED" | null;
  travelerAction?: "COMPLETED" | "CANCELLED" | null;
  appliedAt?: string;
  submittedAt?: string;
}

export const MOCK_MY_APPLICATIONS: MyApplicationItem[] = [
  {
    id: "app_1",
    type: "delivery_proposal",
    targetTitle: "Electronics & Gifts Shipment",
    creatorName: "Nour E.",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    creatorRating: 4.9,
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    targetDate: getRelDate(4),
    weight: "3.5 kg",
    reward: "QR 120",
    myFlightDate: getRelDate(4),
    myFlightTime: "14:30",
    myArrivalDate: getRelDate(4),
    myArrivalTime: "18:45",
    status: "pending",
    appliedAt: "2h ago",
  },
  {
    id: "app_2",
    type: "flight_booking",
    targetTitle: "Air Luggage Space Booking",
    creatorName: "Fatima K.",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    creatorRating: 4.9,
    from: "Qatar - Doha 🇶🇦",
    to: "UAE - Dubai 🇦🇪",
    targetDate: getRelDate(5),
    weight: "12.0 kg available",
    reward: "QR 40 / kg",
    myRequestedWeight: "2.5 kg",
    myFlightDate: getRelDate(5),
    myFlightTime: "09:15",
    myArrivalDate: getRelDate(5),
    myArrivalTime: "11:30",
    status: "accepted",
    appliedAt: "1d ago",
  },
  {
    id: "app_3",
    type: "delivery_proposal",
    targetTitle: "Apparel & Textiles Package",
    creatorName: "Sami K.",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    creatorRating: 4.8,
    from: "Turkey - Istanbul 🇹🇷",
    to: "Tunisia - Tunis 🇹🇳",
    targetDate: getRelDate(7),
    weight: "6.0 kg",
    reward: "TL 850",
    myFlightDate: getRelDate(7),
    myFlightTime: "10:00",
    myArrivalDate: getRelDate(7),
    myArrivalTime: "13:15",
    status: "pending",
    appliedAt: "3h ago",
  },
  {
    id: "app_4",
    type: "flight_booking",
    targetTitle: "Luggage Space Request",
    creatorName: "Omar S.",
    creatorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    creatorRating: 5.0,
    from: "Tunisia - Sousse 🇹🇳",
    to: "Qatar - Doha 🇶🇦",
    targetDate: getRelDate(8),
    weight: "20.0 kg available",
    reward: "QR 30 / kg",
    myRequestedWeight: "4.0 kg",
    myFlightDate: getRelDate(8),
    myFlightTime: "07:00",
    myArrivalDate: getRelDate(8),
    myArrivalTime: "13:20",
    status: "rejected",
    appliedAt: "2d ago",
  },
];

// ---------------------------------------------------------------------------
// 6. Notifications List (Notifications Tab)
// ---------------------------------------------------------------------------
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_101",
    type: "demand_received",
    titleKey: "notifDemandReceivedTitle",
    bodyKey: "notif101Body",
    titleEn: "New Package Demand Received",
    titleFr: "Nouvelle demande de colis reçue",
    titleAr: "طلب شحن طرد جديد على عرضك",
    bodyEn: "Yassine H. requested to send a 2.5 kg package (Laptop & Docs) on your Doha ➔ Tunis flight.",
    bodyFr: "Yassine H. a demandé d'envoyer un colis de 2,5 kg (ordinateur portable & documents) sur votre vol Doha ➔ Tunis.",
    bodyAr: "قدّم ياسين ح. طلباً لشحن طرد بحجم 2.5 كغ (حاسوب محمول ووثائق) على رحلتك من الدوحة إلى تونس.",
    time: "15 min ago",
    read: false,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    targetId: "off_1",
  },
  {
    id: "notif_102",
    type: "request_accepted",
    titleKey: "notifRequestAcceptedTitle",
    bodyKey: "notif102Body",
    titleEn: "Package Request Accepted",
    titleFr: "Demande de colis acceptée",
    titleAr: "تم قبول طلب الشحن الخاص بك",
    bodyEn: "Leila A. accepted your 4.0 kg wedding gift package shipment request for the Monastir ➔ Paris flight.",
    bodyFr: "Leila A. a accepté votre demande de colis de cadeaux de mariage (4,0 kg) sur le vol Monastir ➔ Paris.",
    bodyAr: "قبلت ليلى أ. طلبك لشحن طرد هدايا الزفاف (4.0 كغ) على رحلتها من المنستير إلى باريس.",
    time: "2 hours ago",
    read: false,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    targetId: "off_2",
  },
  {
    id: "notif_103",
    type: "demand_received",
    titleKey: "notifDemandReceivedTitle",
    bodyKey: "notif103Body",
    titleEn: "New Package Demand Received",
    titleFr: "Nouvelle demande de colis reçue",
    titleAr: "طلب شحن طرد جديد على عرضك",
    bodyEn: "Khaled M. requested to send a 3.5 kg package (Medicine & Sweets) on your Doha ➔ Tunis flight.",
    bodyFr: "Khaled M. a demandé d'envoyer un colis de 3,5 kg (médicaments & douceurs) sur votre vol Doha ➔ Tunis.",
    bodyAr: "قدّم خالد م. طلباً لشحن طرد بحجم 3.5 كغ (أدوية وشوكولاتة) على رحلتك من الدوحة إلى تونس.",
    time: "4 hours ago",
    read: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    targetId: "off_1",
  },
  {
    id: "notif_104",
    type: "request_rejected",
    titleKey: "notifRequestRejectedTitle",
    bodyKey: "notif104Body",
    titleEn: "Package Request Status Update",
    titleFr: "Mise à jour du statut de la demande",
    titleAr: "تحديث حالة طلب الشحن الخاص بك",
    bodyEn: "Rami B. was unable to accept your 2.0 kg leather jacket package shipment request due to capacity constraints.",
    bodyFr: "Rami B. n'a pas pu accepter votre demande de colis de 2,0 kg en raison de la capacité restante.",
    bodyAr: "تعذر على رامي ب. قبول طلبك لشحن طرد سترة الجلد (2.0 كغ) نظراً لعدم توفر سعة أمتعة كافية.",
    time: "1 day ago",
    read: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "notif_105",
    type: "demand_received",
    titleKey: "notifDemandReceivedTitle",
    bodyKey: "notif105Body",
    titleEn: "New Package Demand Received",
    titleFr: "Nouvelle demande de colis reçue",
    titleAr: "طلب شحن طرد جديد على عرضك",
    bodyEn: "Amine B. requested to send a 5.0 kg package (Auto Spare Parts) on your Doha ➔ Tunis flight.",
    bodyFr: "Amine B. a demandé d'envoyer un colis de 5,0 kg (pièces auto) sur votre vol Doha ➔ Tunis.",
    bodyAr: "قدّم أمين ب. طلباً لشحن طرد بحجم 5.0 كغ (قطع غيار سيارات) على رحلتك من الدوحة إلى تونس.",
    time: "2 days ago",
    read: true,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    targetId: "off_1",
  },
];

// ---------------------------------------------------------------------------
// 7. Carousel Advertisements Data
// ---------------------------------------------------------------------------
export const MOCK_ADS_CAROUSEL: AdItem[] = [
  {
    id: "1",
    titleKey: "adCargoTitle",
    subtitleKey: "adCargoSubtitle",
    title: "SafarLink Premium Cargo",
    subtitle: "Fastest Qatar 🇶🇦 to Tunisia 🇹🇳 Express Shipping",
    phone: "+216 51 181 657 / +974 33 337 551",
    badge: "50% OFF",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    bgColor: "#1E3A8A",
  },
  {
    id: "2",
    titleKey: "adAirLuggageTitle",
    subtitleKey: "adAirLuggageSubtitle",
    title: "Travelers Air Luggage Deals",
    subtitle: "Earn up to QR 500 per extra bag on your flight",
    phone: "+216 22 123 456",
    badge: "HOT DEAL",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
    bgColor: "#047857",
  },
  {
    id: "3",
    titleKey: "adFlightLuggageTitle",
    subtitleKey: "adFlightLuggageSubtitle",
    title: "Special Flight Luggage Partner",
    subtitle: "Insured & Verified door-to-door package delivery",
    phone: "+974 55 123 456",
    badge: "VERIFIED",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    bgColor: "#B91C1C",
  },
];

// ---------------------------------------------------------------------------
// 8. Bottom Mini Advertisements Configuration
// ---------------------------------------------------------------------------
export const MOCK_BOTTOM_MINI_ADS_CONFIG: BottomMiniAdConfig[] = [
  {
    id: "b_ad_1",
    badge: "PARTNER",
    badgeBg: "rgba(37, 99, 235, 0.9)",
    titleKey: "adExpressTitle",
    subtitleKey: "adExpressSubtitle",
    buttonTextKey: "visit",
    btnColor: "#2563EB",
    iconType: "globe",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "b_ad_2",
    badge: "INSURED",
    badgeBg: "rgba(16, 185, 129, 0.9)",
    titleKey: "adInsuredTitle",
    subtitleKey: "adInsuredSubtitle",
    buttonTextKey: "claim",
    btnColor: "#059669",
    iconType: "shield",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "b_ad_3",
    badge: "SPECIAL DEAL",
    badgeBg: "rgba(234, 179, 8, 0.95)",
    titleKey: "adVipTitle",
    subtitleKey: "adVipSubtitle",
    buttonTextKey: "contact",
    btnColor: "#D97706",
    iconType: "message",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
  },
];

// ---------------------------------------------------------------------------
// 9. Default Compact Ad
// ---------------------------------------------------------------------------
export const MOCK_DEFAULT_COMPACT_AD: CompactAdItem = {
  titleKey: "adMotorsTitle",
  subtitleKey: "adMotorsSubtitle",
  title: "Al Taleb Express Motors Cargo",
  subtitle: "Special vehicle & luggage transport across Tunisia & Qatar",
  phone: "+216 51 181 657",
  image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80",
};

// ---------------------------------------------------------------------------
// 10. Accepted People Chat Conversations Hub
// ---------------------------------------------------------------------------
export interface ChatConversationItem {
  id: string;
  name: string;
  avatar: string;
  role: "traveler" | "sender";
  roleLabelFr: string;
  roleLabelAr: string;
  roleLabelEn: string;
  rating?: number;
  phone: string;
  from: string;
  to: string;
  route: string;
  departureDate: string;
  departureTime?: string;
  arrivalDate: string;
  arrivalTime?: string;
  weight: string;
  price: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  status: "accepted";
  messages: ChatMessage[];
}

export const MOCK_ACCEPTED_CHATS: ChatConversationItem[] = [
  {
    id: "chat_mehdi",
    name: "Mehdi R.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    role: "traveler",
    roleLabelFr: "Voyageur",
    roleLabelAr: "مسافر",
    roleLabelEn: "Traveler",
    rating: 4.95,
    phone: "+33 6 12 34 56 78",
    from: "Tunisia - Monastir 🇹🇳",
    to: "France - Paris 🇫🇷",
    route: "Tunisia - Monastir 🇹🇳 ➔ France - Paris 🇫🇷",
    departureDate: "09 Aug 2026",
    departureTime: "14:30",
    arrivalDate: "09 Aug 2026",
    arrivalTime: "18:45",
    weight: "4.0 kg",
    price: "€ 56",
    lastMessage: "J'arrive à Paris le 9 août à 18h45. On se retrouve à l'aéroport pour la remise du colis ?",
    lastMessageTime: "10:35 AM",
    unreadCount: 1,
    isOnline: true,
    status: "accepted",
    messages: [
      {
        id: "m_1",
        sender: "them",
        textEn: "Hello! I have accepted your package delivery request to Paris.",
        textFr: "Bonjour ! J'ai bien accepté votre demande d'acheminement de colis pour Paris.",
        textAr: "مرحباً! لقد قبلت طلب شحن طردك إلى باريس.",
        time: "10:20 AM",
      },
      {
        id: "m_2",
        sender: "me",
        textEn: "Thank you Mehdi! When will you be at Monastir Airport for pickup?",
        textFr: "Merci beaucoup Mehdi ! À quelle heure serez-vous à l'aéroport de Monastir pour la récupération ?",
        textAr: "شكراً جزيلاً مهدي! في أي وقت ستكون في مطار المنستير للاستلام؟",
        time: "10:25 AM",
      },
      {
        id: "m_3",
        sender: "them",
        textEn: "I arrive at Paris CDG at 18:45. Shall we meet at Terminal 2 for drop-off?",
        textFr: "J'arrive à Paris le 9 août à 18h45. On se retrouve à l'aéroport pour la remise du colis ?",
        textAr: "سأصل إلى باريس يوم 9 أوت الساعة 18:45. هل نلتقي في المطار للتسليم؟",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: "chat_sonia",
    name: "Sonia T.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    role: "sender",
    roleLabelFr: "Expéditeur",
    roleLabelAr: "صاحب شحنة",
    roleLabelEn: "Sender",
    rating: 4.9,
    phone: "+974 55 123 456",
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    route: "Qatar - Doha 🇶🇦 ➔ Tunisia - Tunis 🇹🇳",
    departureDate: "19 Aug 2026",
    departureTime: "08:15",
    arrivalDate: "19 Aug 2026",
    arrivalTime: "13:30",
    weight: "2.5 kg",
    price: "QR 120",
    lastMessage: "Merci d'avoir accepté mon colis ! À quelle heure puis-je vous le déposer ?",
    lastMessageTime: "09:15 AM",
    unreadCount: 0,
    isOnline: true,
    status: "accepted",
    messages: [
      {
        id: "m_s1",
        sender: "them",
        textEn: "Thank you for accepting my luggage space request on your flight to Tunis!",
        textFr: "Merci d'avoir accepté mon colis ! À quelle heure puis-je vous le déposer ?",
        textAr: "شكراً لقبولك حجز مساحة الشحن على رحلتك إلى تونس! متى يمكنني تسليمك الطرد؟",
        time: "09:15 AM",
      },
      {
        id: "m_s2",
        sender: "me",
        textEn: "You are welcome Sonia! I can meet you at Hamad Airport tomorrow around 12:00 PM.",
        textFr: "Avec plaisir Sonia ! On peut se voir à l'aéroport Hamad demain vers midi.",
        textAr: "أهلاً بك سنية! يمكننا اللقاء في مطار حمد غداً حوالي الساعة 12:00 ظهراً.",
        time: "09:20 AM",
      },
    ],
  },
  {
    id: "chat_leila",
    name: "Leila A.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "sender",
    roleLabelFr: "Expéditeur",
    roleLabelAr: "صاحب شحنة",
    roleLabelEn: "Sender",
    rating: 4.85,
    phone: "+974 66 987 654",
    from: "Qatar - Doha 🇶🇦",
    to: "Tunisia - Tunis 🇹🇳",
    route: "Qatar - Doha 🇶🇦 ➔ Tunisia - Tunis 🇹🇳",
    departureDate: "21 Aug 2026",
    departureTime: "11:00",
    arrivalDate: "21 Aug 2026",
    arrivalTime: "15:45",
    weight: "4.0 kg",
    price: "QR 160",
    lastMessage: "Parfait, votre vol du 21 août me convient très bien pour le transport du colis.",
    lastMessageTime: "Hier",
    unreadCount: 0,
    isOnline: false,
    status: "accepted",
    messages: [
      {
        id: "m_l1",
        sender: "them",
        textEn: "Hi! I am happy you accepted my shipment proposal.",
        textFr: "Parfait, votre vol du 21 août me convient très bien pour le transport du colis.",
        textAr: "ممتاز، موعد رحلتك في 21 أوت يناسبني جداً لنقل الطرد.",
        time: "Hier",
      },
    ],
  },
  {
    id: "chat_can",
    name: "Can Y.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    role: "traveler",
    roleLabelFr: "Voyageur",
    roleLabelAr: "مسافر",
    roleLabelEn: "Traveler",
    rating: 4.9,
    phone: "+90 532 123 4567",
    from: "Turkey - Istanbul 🇹🇷",
    to: "Tunisia - Tunis 🇹🇳",
    route: "Turkey - Istanbul 🇹🇷 ➔ Tunisia - Tunis 🇹🇳",
    departureDate: "24 Aug 2026",
    departureTime: "16:20",
    arrivalDate: "24 Aug 2026",
    arrivalTime: "18:50",
    weight: "3.5 kg",
    price: "TL 850",
    lastMessage: "Votre réservation de 3.5 kg est bien confirmée pour le vol d'Istanbul !",
    lastMessageTime: "14 Aug",
    unreadCount: 0,
    isOnline: true,
    status: "accepted",
    messages: [
      {
        id: "m_c1",
        sender: "them",
        textEn: "Your 3.5 kg space reservation is fully confirmed for the Istanbul flight!",
        textFr: "Votre réservation de 3.5 kg est bien confirmée pour le vol d'Istanbul !",
        textAr: "تم تأكيد حجز وزن 3.5 كغ لشحنتك على رحلة اسطنبول بنجاح!",
        time: "14 Aug",
      },
    ],
  },
  {
    id: "chat_tarek",
    name: "Tarek J.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    role: "sender",
    roleLabelFr: "Expéditeur",
    roleLabelAr: "صاحب شحنة",
    roleLabelEn: "Sender",
    rating: 4.8,
    phone: "+216 98 765 432",
    from: "Tunisia - Monastir 🇹🇳",
    to: "Saudi Arabia - Jeddah 🇸🇦",
    route: "Tunisia - Monastir 🇹🇳 ➔ Saudi Arabia - Jeddah 🇸🇦",
    departureDate: "27 Aug 2026",
    departureTime: "07:30",
    arrivalDate: "27 Aug 2026",
    arrivalTime: "12:15",
    weight: "6.0 kg",
    price: "SAR 180",
    lastMessage: "Le colis est emballé et prêt pour l'enregistrement.",
    lastMessageTime: "12 Aug",
    unreadCount: 0,
    isOnline: false,
    status: "accepted",
    messages: [
      {
        id: "m_t1",
        sender: "them",
        textEn: "The package is securely packed and ready for drop off.",
        textFr: "Le colis est emballé et prêt pour l'enregistrement.",
        textAr: "الطرد جاهز ومغلف للشحن والتسليم.",
        time: "12 Aug",
      },
    ],
  },
];

