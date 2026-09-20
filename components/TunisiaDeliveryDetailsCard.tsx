import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import {
  Users,
  Truck,
  Building2,
  User,
  Phone,
  Banknote,
  CreditCard,
  MapPin,
  ShieldCheck,
  Info,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { colors } from "@/lib/theme";

interface TunisiaDeliveryDetailsCardProps {
  deliveryMethod?: "FAMILY" | "COURIER" | "I_FAST_PRO" | null;
  contactName?: string | null;
  contactPhone?: string | null;
  deliveryFee?: number | null;
  paymentMethod?: "CASH" | "CLICTOPAY" | null;
  deliveryAddress?: string | null;
  deliveryStatus?: string | null;
  bookingStatus?: string | null;
  containerStyle?: object;
  hidePricing?: boolean;
  isTraveler?: boolean;
}

export const TunisiaDeliveryDetailsCard: React.FC<TunisiaDeliveryDetailsCardProps> = ({
  deliveryMethod,
  contactName,
  contactPhone,
  deliveryFee,
  paymentMethod,
  deliveryAddress,
  deliveryStatus,
  bookingStatus,
  containerStyle,
  hidePricing = false,
  isTraveler = false,
}) => {
  const { language, darkMode } = useAppStore();
  const primaryColor = colors.primary || "#2563EB";

  if (!deliveryMethod) return null;

  const normalizedMethod = (deliveryMethod || "").toUpperCase();
  const isFamily = normalizedMethod === "FAMILY" || normalizedMethod.includes("FAMILY");
  const isCourier = normalizedMethod === "COURIER" || normalizedMethod.includes("COURIER");
  const isIFastPro = normalizedMethod === "I_FAST_PRO" || normalizedMethod.includes("FAST");

  // Determine effective status: explicit deliveryStatus takes priority, else derived from bookingStatus
  const rawStatus = (deliveryStatus || bookingStatus || "pending").toLowerCase();
  const isApproved = rawStatus === "approved" || rawStatus === "accepted";
  const isInTransit = rawStatus === "in_transit" || rawStatus === "in-transit";
  const isDelivered = rawStatus === "delivered" || rawStatus === "completed";
  const isCancelled = rawStatus === "cancelled" || rawStatus === "rejected";
  const isPending = !isApproved && !isInTransit && !isDelivered && !isCancelled;

  // Status configuration tailored for each delivery method
  let statusBadgeColor = "#D97706";
  let statusBg = darkMode ? "#2D1D04" : "#FFFBEB";
  let statusBorder = darkMode ? "#78350F" : "#FDE68A";
  let statusDotColor = "#F59E0B";
  let statusLabel = "";
  let statusTag = "";
  let statusDescription = "";
  let StatusIcon = Clock;

  if (isFamily) {
    if (isDelivered) {
      statusBadgeColor = "#059669";
      statusBg = darkMode ? "#062E1E" : "#ECFDF5";
      statusBorder = darkMode ? "#065F46" : "#A7F3D0";
      statusDotColor = "#10B981";
      StatusIcon = CheckCircle2;
      statusTag =
        language === "ar"
          ? "تم التسليم للأقارب ✓"
          : language === "fr"
          ? "Remis aux proches ✓"
          : "Delivered to Family ✓";
      statusLabel =
        language === "ar"
          ? "تم تسليم الطرد للعائلة بنجاح"
          : language === "fr"
          ? "Colis remis à la famille avec succès"
          : "Parcel successfully delivered to family";
      statusDescription =
        language === "ar"
          ? "تم استلام الطرد بنجاح يداً بيد من قبل العائلة في تونس."
          : language === "fr"
          ? "Le colis a été remis en mains propres à la famille en Tunisie."
          : "The parcel was delivered in-person to family in Tunisia.";
    } else if (isCancelled) {
      statusBadgeColor = "#DC2626";
      statusBg = darkMode ? "#3B0D0D" : "#FEF2F2";
      statusBorder = darkMode ? "#991B1B" : "#FECACA";
      statusDotColor = "#EF4444";
      StatusIcon = AlertCircle;
      statusTag =
        language === "ar" ? "ملغى" : language === "fr" ? "Annulé" : "Cancelled";
      statusLabel =
        language === "ar"
          ? "تم إلغاء التوصيل"
          : language === "fr"
          ? "Livraison annulée"
          : "Delivery Cancelled";
      statusDescription =
        language === "ar"
          ? "تم إلغاء هذه العملية."
          : language === "fr"
          ? "La transaction a été annulée."
          : "Transaction cancelled.";
    } else {
      // Family delivery has NO pending status because sender's family directly receives parcel
      statusBadgeColor = "#059669";
      statusBg = darkMode ? "#062E1E" : "#ECFDF5";
      statusBorder = darkMode ? "#065F46" : "#A7F3D0";
      statusDotColor = "#10B981";
      StatusIcon = Users;
      statusTag =
        language === "ar"
          ? "تسليم مباشر"
          : language === "fr"
          ? "Remise directe"
          : "Direct Handover";
      statusLabel =
        language === "ar"
          ? "تنسيق مباشر مع العائلة"
          : language === "fr"
          ? "Remise en mains propres (Famille)"
          : "In-Person Handover (Family)";
      statusDescription =
        language === "ar"
          ? "لا يوجد وسيط لوجستي: العائلة في تونس هي التي ستستلم الطرد مباشرة يداً بيد من المسافر. استخدم زر الاتصال للتنسيق."
          : language === "fr"
          ? "Aucun intermédiaire logistique : la famille en Tunisie récupère le colis directement en mains propres auprès du voyageur."
          : "Direct handover between traveler and family in Tunisia without courier.";
    }
  } else if (isPending) {
    statusBadgeColor = "#D97706";
    statusBg = darkMode ? "#2D1D04" : "#FFFBEB";
    statusBorder = darkMode ? "#78350F" : "#FDE68A";
    statusDotColor = "#F59E0B";
    StatusIcon = Clock;
    statusTag =
      language === "ar"
        ? "قيد الانتظار"
        : language === "fr"
        ? "En attente"
        : "Pending";

    if (isIFastPro) {
      statusLabel =
        language === "ar"
          ? "في انتظار تأكيد i Fast Pro"
          : language === "fr"
          ? "En attente d'acceptation i Fast Pro"
          : "Pending i Fast Pro Approval";
      statusDescription =
        language === "ar"
          ? "الطلب قيد المراجعة لدى شريكنا i Fast Pro. سيتحول Statut إلى 'مقبول' فور تأكيدهم."
          : language === "fr"
          ? "La demande est transmise à i Fast Pro. Le statut passera à 'Approuvé' dès validation."
          : "Request transmitted to partner i Fast Pro. Status becomes 'Approved' once accepted.";
    } else {
      statusLabel =
        language === "ar"
          ? "في انتظار استلام الموزع"
          : language === "fr"
          ? "En attente de prise en charge coursier"
          : "Pending Courier Pickup";
      statusDescription =
        language === "ar"
          ? "في انتظار استلام الطرد من قبل الموزع ليتحول إلى 'مقبول'."
          : language === "fr"
          ? "En attente d'un coursier pour récupérer le colis. Devient 'Approuvé' dès prise en charge."
          : "Waiting for a courier to pick up the parcel. Turns 'Approved' once taken.";
    }
  } else if (isApproved) {
    statusBadgeColor = "#059669";
    statusBg = darkMode ? "#062E1E" : "#ECFDF5";
    statusBorder = darkMode ? "#065F46" : "#A7F3D0";
    statusDotColor = "#10B981";
    StatusIcon = CheckCircle2;
    statusTag =
      language === "ar"
        ? "تمت الموافقة"
        : language === "fr"
        ? "Approuvé"
        : "Approved";

    if (isIFastPro) {
      statusLabel =
        language === "ar"
          ? "مقبول ومؤكد من طرف i Fast Pro"
          : language === "fr"
          ? "Approuvé par i Fast Pro"
          : "Approved by i Fast Pro";
      statusDescription =
        language === "ar"
          ? "تمت موافقة شريكنا الرسمي i Fast Pro على استلام وتوصيل هذا الطرد."
          : language === "fr"
          ? "Notre partenaire officiel i Fast Pro a validé et accepté la livraison."
          : "Partner i Fast Pro has officially approved and accepted this delivery.";
    } else if (isCourier) {
      statusLabel =
        language === "ar"
          ? "تم استلام الطرد وقبول التوصيل"
          : language === "fr"
          ? "Pris en charge & Approuvé"
          : "Courier Assigned & Approved";
      statusDescription =
        language === "ar"
          ? "تم تكليف الموزع وقبول مهمة التوصيل بنجاح."
          : language === "fr"
          ? "Le coursier a pris en charge le colis pour la livraison."
          : "Courier has taken charge of the parcel for delivery.";
    } else {
      statusLabel =
        language === "ar"
          ? "تم تأكيد الاستلام من الأقارب"
          : language === "fr"
          ? "Prise en charge confirmée"
          : "Handover Confirmed";
      statusDescription =
        language === "ar"
          ? "تم تأكيد التنسيق مع جهة الاتصال في تونس."
          : language === "fr"
          ? "La coordination avec la personne de contact est validée."
          : "Coordination with contact person is validated.";
    }
  } else if (isInTransit) {
    statusBadgeColor = "#2563EB";
    statusBg = darkMode ? "#0F2347" : "#EFF6FF";
    statusBorder = darkMode ? "#1E40AF" : "#BFDBFE";
    statusDotColor = "#3B82F6";
    StatusIcon = Truck;
    statusTag =
      language === "ar"
        ? "في الطريق"
        : language === "fr"
        ? "En transit"
        : "In Transit";
    statusLabel =
      language === "ar"
        ? "الطرد في طريق التوصيل"
        : language === "fr"
        ? "Colis en cours d'acheminement"
        : "Out for Delivery";
    statusDescription =
      language === "ar"
        ? "الطرد حالياً في مرحلة النقل والتوصيل داخل تونس."
        : language === "fr"
        ? "Le colis est actuellement en cours d'acheminement en Tunisie."
        : "The parcel is currently in transit for domestic delivery in Tunisia.";
  } else if (isDelivered) {
    statusBadgeColor = "#059669";
    statusBg = darkMode ? "#062E1E" : "#ECFDF5";
    statusBorder = darkMode ? "#065F46" : "#A7F3D0";
    statusDotColor = "#10B981";
    StatusIcon = CheckCircle2;
    statusTag =
      language === "ar"
        ? "تم التسليم"
        : language === "fr"
        ? "Livré"
        : "Delivered";
    statusLabel =
      language === "ar"
        ? "تم تسليم الطرد بنجاح"
        : language === "fr"
        ? "Colis livré avec succès"
        : "Successfully Delivered";
    statusDescription =
      language === "ar"
        ? "تم تسليم الطرد إلى المستلم بنجاح."
        : language === "fr"
        ? "Le colis a été remis en main propre au destinataire."
        : "The parcel has been successfully handed over to recipient.";
  } else {
    statusBadgeColor = "#DC2626";
    statusBg = darkMode ? "#3B0D0D" : "#FEF2F2";
    statusBorder = darkMode ? "#991B1B" : "#FECACA";
    statusDotColor = "#EF4444";
    StatusIcon = AlertCircle;
    statusTag =
      language === "ar"
        ? "ملغى"
        : language === "fr"
        ? "Annulé"
        : "Cancelled";
    statusLabel =
      language === "ar"
        ? "تم إلغاء التوصيل"
        : language === "fr"
        ? "Livraison annulée"
        : "Delivery Cancelled";
    statusDescription =
      language === "ar"
        ? "تم رفض أو إلغاء الحجز من قبل صاحب العرض، وبالتالي أُلغيت مهمة التوصيل وتسترجع أموالك تلقائياً."
        : language === "fr"
        ? "La réservation a été refusée ou annulée par le voyageur. La livraison est annulée et vos fonds sont remboursés."
        : "The booking was declined or cancelled by traveler. Delivery cancelled and funds refunded.";
  }

  const handleCallPhone = () => {
    if (contactPhone) {
      Linking.openURL(`tel:${contactPhone.replace(/\s+/g, "")}`).catch(() => {});
    }
  };

  const paymentLabel =
    paymentMethod === "CASH"
      ? t("payCash", language)
      : paymentMethod === "CLICTOPAY"
      ? t("payClicToPay", language)
      : undefined;

  return (
    <View style={[styles.card, darkMode && styles.cardDark, containerStyle]}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.flagCircle}>
          <Text style={styles.flagEmoji}>🇹🇳</Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={[styles.cardTitle, darkMode && styles.textWhite]}>
            {t("tunisiaDeliveryTitle", language)}
          </Text>
          <Text style={[styles.cardSubtitle, darkMode && styles.textMutedDark]}>
            {isFamily
              ? t("deliveryMethodFamilyDesc", language)
              : isCourier
              ? t("deliveryMethodCourierDesc", language)
              : t("deliveryMethodIFastProDesc", language)}
          </Text>
        </View>
      </View>

      {/* Selected Delivery Method Card with Status on far right & descriptive line below */}
      <View style={[styles.methodCard, darkMode && styles.methodCardDark]}>
        {/* Top Row: Method Info (Left) + Status Badge (Far Right) */}
        <View style={styles.methodTopRow}>
          <View style={styles.methodLeftGroup}>
            <View style={[styles.methodIconBox, { backgroundColor: primaryColor + "15" }]}>
              {isFamily ? (
                <Users size={16} color={primaryColor} />
              ) : isCourier ? (
                <Truck size={16} color={primaryColor} />
              ) : (
                <Building2 size={16} color={primaryColor} />
              )}
            </View>
            <View style={styles.methodTitleRow}>
              <Text
                style={[styles.methodTitleText, darkMode && styles.textWhite]}
                numberOfLines={1}
              >
                {isFamily
                  ? t("deliveryMethodFamily", language)
                  : isCourier
                  ? t("deliveryMethodCourier", language)
                  : t("deliveryMethodIFastPro", language)}
              </Text>
              {isIFastPro && (
                <View style={styles.officialBadge}>
                  <ShieldCheck size={10} color="#059669" />
                  <Text style={styles.officialBadgeText}>{t("partnerBadge", language)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Badge on the far right (Hidden when method is Family / Relative) */}
          {!isFamily && (
            <View
              style={[
                styles.methodStatusPill,
                {
                  backgroundColor: statusBadgeColor + "18",
                  borderColor: statusBadgeColor + "38",
                },
              ]}
            >
              <View
                style={[
                  styles.methodStatusDot,
                  { backgroundColor: statusDotColor },
                ]}
              />
              <Text
                style={[
                  styles.methodStatusPillText,
                  { color: statusBadgeColor },
                ]}
              >
                {statusTag}
              </Text>
            </View>
          )}
        </View>

        {/* Descriptive Line under it (Hidden for Family/Relative) */}
        {Boolean(statusDescription) && !isFamily && (
          <View style={[styles.methodDescBox, darkMode && styles.methodDescBoxDark]}>
            <Text
              style={[
                styles.methodDescText,
                darkMode && styles.textMutedDark,
              ]}
            >
              {statusDescription}
            </Text>
          </View>
        )}
      </View>

      {/* Dynamic Details rows */}
      {/* Dynamic Details rows */}
      <View style={[styles.detailsBox, darkMode && styles.detailsBoxDark]}>
        {/* FAMILY: Contact Name, Phone, and optional Address */}
        {isFamily && (
          <>
            <View style={styles.detailRow}>
              <View style={styles.labelCol}>
                <User size={15} color="#6B7280" style={styles.rowIcon} />
                <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                  {t("contactNameLabel", language)}:
                </Text>
              </View>
              <Text style={[styles.fieldValue, darkMode && styles.textWhite]}>
                {contactName || "—"}
              </Text>
            </View>

            <View style={[styles.detailRow, !Boolean(deliveryAddress && deliveryAddress.trim()) && { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={styles.labelCol}>
                <Phone size={15} color="#6B7280" style={styles.rowIcon} />
                <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                  {t("contactPhoneLabel", language)}:
                </Text>
              </View>
              <View style={styles.phoneActionRow}>
                <Text style={[styles.fieldValue, { color: primaryColor, fontWeight: "700" }]}>
                  {contactPhone || "—"}
                </Text>
                {contactPhone ? (
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: primaryColor + "15" }]}
                    onPress={handleCallPhone}
                    activeOpacity={0.7}
                  >
                    <PhoneCall size={13} color={primaryColor} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {Boolean(deliveryAddress && deliveryAddress.trim()) && (
              <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <View style={styles.labelCol}>
                  <MapPin size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("deliveryAddressLabel", language)}:
                  </Text>
                </View>
                <Text
                  style={[styles.fieldValue, darkMode && styles.textWhite, { flex: 1, textAlign: "right" }]}
                  numberOfLines={2}
                >
                  {deliveryAddress}
                </Text>
              </View>
            )}
          </>
        )}

        {/* COURIER: Address, Recipient Contact, Fee (Sender only), Payment (Sender only) */}
        {isCourier && (
          <>
            {Boolean(deliveryAddress && deliveryAddress.trim()) && (
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <MapPin size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("deliveryAddressLabel", language)}:
                  </Text>
                </View>
                <Text
                  style={[styles.fieldValue, darkMode && styles.textWhite, { flex: 1, textAlign: "right" }]}
                  numberOfLines={2}
                >
                  {deliveryAddress}
                </Text>
              </View>
            )}

            {Boolean(contactName && contactName.trim()) && (
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <User size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("contactNameLabel", language)}:
                  </Text>
                </View>
                <Text style={[styles.fieldValue, darkMode && styles.textWhite]}>
                  {contactName}
                </Text>
              </View>
            )}

            {Boolean(contactPhone && contactPhone.trim()) && (
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <Phone size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("contactPhoneLabel", language)}:
                  </Text>
                </View>
                <View style={styles.phoneActionRow}>
                  <Text style={[styles.fieldValue, { color: primaryColor, fontWeight: "700" }]}>
                    {contactPhone}
                  </Text>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: primaryColor + "15" }]}
                    onPress={handleCallPhone}
                    activeOpacity={0.7}
                  >
                    <PhoneCall size={13} color={primaryColor} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!hidePricing && !isTraveler && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.labelCol}>
                    <Banknote size={15} color="#6B7280" style={styles.rowIcon} />
                    <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                      {t("deliveryFeeLabel", language)}:
                    </Text>
                  </View>
                  <Text style={[styles.fieldValue, { color: primaryColor, fontWeight: "800" }]}>
                    {deliveryFee !== undefined && deliveryFee !== null ? `${deliveryFee} TND` : "—"}
                  </Text>
                </View>

                {paymentLabel && (
                  <View style={styles.detailRow}>
                    <View style={styles.labelCol}>
                      <CreditCard size={15} color="#6B7280" style={styles.rowIcon} />
                      <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                        {t("paymentMethodLabel", language)}:
                      </Text>
                    </View>
                    <Text style={[styles.fieldValue, darkMode && styles.textWhite]}>
                      {paymentLabel}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={[styles.noticeBanner, darkMode && styles.noticeBannerDark]}>
              <Info size={14} color="#2563EB" style={styles.noticeIcon} />
              <Text style={[styles.noticeText, darkMode && styles.noticeTextDark]}>
                {t("courierContactNotice", language)}
              </Text>
            </View>
          </>
        )}

        {/* I_FAST_PRO: Address, Recipient Contact, Payment (Sender only) */}
        {isIFastPro && (
          <>
            <View style={styles.detailRow}>
              <View style={styles.labelCol}>
                <MapPin size={15} color="#6B7280" style={styles.rowIcon} />
                <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                  {t("deliveryAddressLabel", language)}:
                </Text>
              </View>
              <Text
                style={[styles.fieldValue, darkMode && styles.textWhite, { flex: 1, textAlign: "right" }]}
                numberOfLines={2}
              >
                {deliveryAddress || "—"}
              </Text>
            </View>

            {Boolean(contactName && contactName.trim()) && (
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <User size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("contactNameLabel", language)}:
                  </Text>
                </View>
                <Text style={[styles.fieldValue, darkMode && styles.textWhite]}>
                  {contactName}
                </Text>
              </View>
            )}

            {Boolean(contactPhone && contactPhone.trim()) && (
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <Phone size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("contactPhoneLabel", language)}:
                  </Text>
                </View>
                <View style={styles.phoneActionRow}>
                  <Text style={[styles.fieldValue, { color: primaryColor, fontWeight: "700" }]}>
                    {contactPhone}
                  </Text>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: primaryColor + "15" }]}
                    onPress={handleCallPhone}
                    activeOpacity={0.7}
                  >
                    <PhoneCall size={13} color={primaryColor} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!hidePricing && !isTraveler && paymentLabel && (
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <CreditCard size={15} color="#6B7280" style={styles.rowIcon} />
                  <Text style={[styles.fieldLabel, darkMode && styles.textMutedDark]}>
                    {t("paymentMethodLabel", language)}:
                  </Text>
                </View>
                <Text style={[styles.fieldValue, darkMode && styles.textWhite]}>
                  {paymentLabel}
                </Text>
              </View>
            )}

            <View style={[styles.noticeBanner, styles.partnerNoticeBanner, darkMode && styles.partnerNoticeBannerDark]}>
              <ShieldCheck size={14} color="#059669" style={styles.noticeIcon} />
              <Text style={[styles.noticeText, { color: darkMode ? "#34D399" : "#065F46" }]}>
                {t("iFastProNotice", language)}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  flagEmoji: {
    fontSize: 18,
  },
  titleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textMutedDark: {
    color: "#94A3B8",
  },
  methodCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  methodCardDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  methodTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  methodLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  methodTitleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  methodIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  methodStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
    flexShrink: 0,
  },
  methodStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  methodStatusPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  methodDescBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  methodDescBoxDark: {
    borderTopColor: "#1F2937",
  },
  methodDescText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: "#64748B",
  },
  detailsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  detailsBoxDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  labelCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIcon: {
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  phoneActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  noticeBannerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#1E40AF",
  },
  partnerNoticeBanner: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  partnerNoticeBannerDark: {
    backgroundColor: "#064E3B",
    borderColor: "#059669",
  },
  noticeIcon: {
    marginRight: 6,
  },
  noticeText: {
    fontSize: 11,
    color: "#1E40AF",
    lineHeight: 15,
    flex: 1,
  },
  noticeTextDark: {
    color: "#93C5FD",
  },
});

export default TunisiaDeliveryDetailsCard;
