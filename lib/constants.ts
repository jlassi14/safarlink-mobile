export interface CountryPhoneSchema {
  code: string;
  flag: string;
  name: string;
  nameAr: string;
  nameFr: string;
  dialCode: string;
  mask: string;
  digitsCount: number;
  placeholder: string;
}

export interface LocationOption {
  id: string;
  country: string;
  countryAr: string;
  city: string;
  cityAr: string;
  airport: string;
  airportAr: string;
  flag: string;
  formatted: string;
  formattedAr: string;
}

export const COUNTRIES_LIST: CountryPhoneSchema[] = [
  // Maghreb Arabi Countries
  { code: "TN", flag: "🇹🇳", name: "Tunisia", nameAr: "تونس", nameFr: "Tunisie", dialCode: "+216", mask: "XX XXX XXX", digitsCount: 8, placeholder: "22 123 456" },
  { code: "DZ", flag: "🇩🇿", name: "Algeria", nameAr: "الجزائر", nameFr: "Algérie", dialCode: "+213", mask: "X XX XX XX XX", digitsCount: 9, placeholder: "5 55 12 34 56" },
  { code: "MA", flag: "🇲🇦", name: "Morocco", nameAr: "المغرب", nameFr: "Maroc", dialCode: "+212", mask: "X XX XX XX XX", digitsCount: 9, placeholder: "6 12 34 56 78" },
  { code: "LY", flag: "🇱🇾", name: "Libya", nameAr: "ليبيا", nameFr: "Libye", dialCode: "+218", mask: "XX XXX XXXX", digitsCount: 9, placeholder: "91 123 4567" },
  { code: "MR", flag: "🇲🇷", name: "Mauritania", nameAr: "موريتانيا", nameFr: "Mauritanie", dialCode: "+222", mask: "XX XX XX XX", digitsCount: 8, placeholder: "45 12 34 56" },

  // Khalij (GCC) & Middle East Countries
  { code: "QA", flag: "🇶🇦", name: "Qatar", nameAr: "قطر", nameFr: "Qatar", dialCode: "+974", mask: "XXXX XXXX", digitsCount: 8, placeholder: "5512 3456" },
  { code: "AE", flag: "🇦🇪", name: "UAE", nameAr: "الإمارات", nameFr: "Émirats Arabes Unis", dialCode: "+971", mask: "XX XXX XXXX", digitsCount: 9, placeholder: "50 123 4567" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", nameAr: "السعودية", nameFr: "Arabie Saoudite", dialCode: "+966", mask: "XX XXX XXXX", digitsCount: 9, placeholder: "50 123 4567" },
  { code: "KW", flag: "🇰🇼", name: "Kuwait", nameAr: "الكويت", nameFr: "Koweït", dialCode: "+965", mask: "XXXX XXXX", digitsCount: 8, placeholder: "9912 3456" },
  { code: "OM", flag: "🇴🇲", name: "Oman", nameAr: "عمان", nameFr: "Oman", dialCode: "+968", mask: "XXXX XXXX", digitsCount: 8, placeholder: "9123 4567" },
  { code: "BH", flag: "🇧🇭", name: "Bahrain", nameAr: "البحرين", nameFr: "Bahreïn", dialCode: "+973", mask: "XXXX XXXX", digitsCount: 8, placeholder: "3912 3456" },
  { code: "TR", flag: "🇹🇷", name: "Turkey", nameAr: "تركيا", nameFr: "Turquie", dialCode: "+90", mask: "XXX XXX XX XX", digitsCount: 10, placeholder: "532 123 4567" },

  // International & Americas
  { code: "CA", flag: "🇨🇦", name: "Canada", nameAr: "كندا", nameFr: "Canada", dialCode: "+1", mask: "XXX XXX XXXX", digitsCount: 10, placeholder: "416 123 4567" },
];

export const POPULAR_LOCATIONS: LocationOption[] = [
  // Qatar
  { id: "loc_qa_doh", country: "Qatar", countryAr: "قطر", city: "Doha", cityAr: "الدوحة", airport: "Hamad Int. Airport (DOH)", airportAr: "مطار حمد الدولي (DOH)", flag: "🇶🇦", formatted: "Qatar - Doha 🇶🇦", formattedAr: "قطر - الدوحة 🇶🇦" },

  // UAE
  { id: "loc_ae_dxb", country: "UAE", countryAr: "الإمارات", city: "Dubai", cityAr: "دبي", airport: "Dubai Int. Airport (DXB)", airportAr: "مطار دبي الدولي (DXB)", flag: "🇦🇪", formatted: "UAE - Dubai 🇦🇪", formattedAr: "الإمارات - دبي 🇦🇪" },
  { id: "loc_ae_auh", country: "UAE", countryAr: "الإمارات", city: "Abu Dhabi", cityAr: "أبوظبي", airport: "Zayed Int. Airport (AUH)", airportAr: "مطار زايد الدولي (AUH)", flag: "🇦🇪", formatted: "UAE - Abu Dhabi 🇦🇪", formattedAr: "الإمارات - أبوظبي 🇦🇪" },

  // Saudi Arabia
  { id: "loc_sa_ruh", country: "Saudi Arabia", countryAr: "السعودية", city: "Riyadh", cityAr: "الرياض", airport: "King Khalid Int. (RUH)", airportAr: "مطار الملك خالد (RUH)", flag: "🇸🇦", formatted: "Saudi Arabia - Riyadh 🇸🇦", formattedAr: "السعودية - الرياض 🇸🇦" },
  { id: "loc_sa_jed", country: "Saudi Arabia", countryAr: "السعودية", city: "Jeddah", cityAr: "جدة", airport: "King Abdulaziz Int. (JED)", airportAr: "مطار الملك عبد العزيز (JED)", flag: "🇸🇦", formatted: "Saudi Arabia - Jeddah 🇸🇦", formattedAr: "السعودية - جدة 🇸🇦" },

  // Kuwait
  { id: "loc_kw_kwi", country: "Kuwait", countryAr: "الكويت", city: "Kuwait City", cityAr: "مدينة الكويت", airport: "Kuwait Int. Airport (KWI)", airportAr: "مطار الكويت الدولي (KWI)", flag: "🇰🇼", formatted: "Kuwait - Kuwait City 🇰🇼", formattedAr: "الكويت - مدينة الكويت 🇰🇼" },

  // Oman
  { id: "loc_om_mct", country: "Oman", countryAr: "عمان", city: "Muscat", cityAr: "مسقط", airport: "Muscat Int. Airport (MCT)", airportAr: "مطار مسقط الدولي (MCT)", flag: "🇴🇲", formatted: "Oman - Muscat 🇴🇲", formattedAr: "عمان - مسقط 🇴🇲" },

  // Bahrain
  { id: "loc_bh_bah", country: "Bahrain", countryAr: "البحرين", city: "Manama", cityAr: "المنامة", airport: "Bahrain Int. Airport (BAH)", airportAr: "مطار البحرين الدولي (BAH)", flag: "🇧🇭", formatted: "Bahrain - Manama 🇧🇭", formattedAr: "البحرين - المنامة 🇧🇭" },

  // Turkey
  { id: "loc_tr_ist", country: "Turkey", countryAr: "تركيا", city: "Istanbul", cityAr: "إسطنبول", airport: "Istanbul Int. Airport (IST)", airportAr: "مطار إسطنبول الدولي (IST)", flag: "🇹🇷", formatted: "Turkey - Istanbul 🇹🇷", formattedAr: "تركيا - إسطنبول 🇹🇷" },
  { id: "loc_tr_ank", country: "Turkey", countryAr: "تركيا", city: "Ankara", cityAr: "أنقرة", airport: "Esenboğa Airport (ESB)", airportAr: "مطار إيسنبوجا (ESB)", flag: "🇹🇷", formatted: "Turkey - Ankara 🇹🇷", formattedAr: "تركيا - أنقرة 🇹🇷" },

  // Canada
  { id: "loc_ca_yul", country: "Canada", countryAr: "كندا", city: "Montreal", cityAr: "مونتريال", airport: "Montréal-Trudeau (YUL)", airportAr: "مطار مونتريال ترودو (YUL)", flag: "🇨🇦", formatted: "Canada - Montreal 🇨🇦", formattedAr: "كندا - مونتريال 🇨🇦" },
  { id: "loc_ca_yyz", country: "Canada", countryAr: "كندا", city: "Toronto", cityAr: "تورونتو", airport: "Toronto Pearson Int. (YYZ)", airportAr: "مطار تورونتو بيرسون (YYZ)", flag: "🇨🇦", formatted: "Canada - Toronto 🇨🇦", formattedAr: "كندا - تورونتو 🇨🇦" },

  // Tunisia
  { id: "loc_tn_tun", country: "Tunisia", countryAr: "تونس", city: "Tunis", cityAr: "تونس العاصمة", airport: "Tunis-Carthage Airport (TUN)", airportAr: "مطار تونس قرطاج (TUN)", flag: "🇹🇳", formatted: "Tunisia - Tunis 🇹🇳", formattedAr: "تونس - تونس 🇹🇳" },
  { id: "loc_tn_mon", country: "Tunisia", countryAr: "تونس", city: "Monastir", cityAr: "المنستير", airport: "Habib Bourguiba Airport (MIR)", airportAr: "مطار الحبيب بورقيبة (MIR)", flag: "🇹🇳", formatted: "Tunisia - Monastir 🇹🇳", formattedAr: "تونس - المنستير 🇹🇳" },
  { id: "loc_tn_sfa", country: "Tunisia", countryAr: "تونس", city: "Sfax", cityAr: "صفاقس", airport: "Thyna Airport (SFA)", airportAr: "مطار طينة (SFA)", flag: "🇹🇳", formatted: "Tunisia - Sfax 🇹🇳", formattedAr: "تونس - صفاقس 🇹🇳" },
  { id: "loc_tn_dje", country: "Tunisia", countryAr: "تونس", city: "Djerba", cityAr: "جربة", airport: "Djerba-Zarzis Airport (DJE)", airportAr: "مطار جربة جرجيس (DJE)", flag: "🇹🇳", formatted: "Tunisia - Djerba 🇹🇳", formattedAr: "تونس - جربة 🇹🇳" },

  // Algeria
  { id: "loc_dz_alg", country: "Algeria", countryAr: "الجزائر", city: "Algiers", cityAr: "الجزائر العاصمة", airport: "Houari Boumediene (ALG)", airportAr: "مطار هواري بومدين (ALG)", flag: "🇩🇿", formatted: "Algeria - Algiers 🇩🇿", formattedAr: "الجزائر - العاصمة 🇩🇿" },
  { id: "loc_dz_orn", country: "Algeria", countryAr: "الجزائر", city: "Oran", cityAr: "وهران", airport: "Ahmed Ben Bella (ORN)", airportAr: "مطار أحمد بن بلة (ORN)", flag: "🇩🇿", formatted: "Algeria - Oran 🇩🇿", formattedAr: "الجزائر - وهران 🇩🇿" },

  // Morocco
  { id: "loc_ma_cas", country: "Morocco", countryAr: "المغرب", city: "Casablanca", cityAr: "الدار البيضاء", airport: "Mohammed V Int. (CMN)", airportAr: "مطار محمد الخامس (CMN)", flag: "🇲🇦", formatted: "Morocco - Casablanca 🇲🇦", formattedAr: "المغرب - الدار البيضاء 🇲🇦" },
  { id: "loc_ma_rak", country: "Morocco", countryAr: "المغرب", city: "Marrakech", cityAr: "مراكش", airport: "Menara Airport (RAK)", airportAr: "مطار مراكش المنارة (RAK)", flag: "🇲🇦", formatted: "Morocco - Marrakech 🇲🇦", formattedAr: "المغرب - مراكش 🇲🇦" },

  // Libya
  { id: "loc_ly_tip", country: "Libya", countryAr: "ليبيا", city: "Tripoli", cityAr: "طرابلس", airport: "Mitiga Int. Airport (MJI)", airportAr: "مطار معيتيقة الدولي (MJI)", flag: "🇱🇾", formatted: "Libya - Tripoli 🇱🇾", formattedAr: "ليبيا - طرابلس 🇱🇾" },

  // Mauritania
  { id: "loc_mr_nkc", country: "Mauritania", countryAr: "موريتانيا", city: "Nouakchott", cityAr: "نواكشوط", airport: "Oumtounsy Int. Airport (NKC)", airportAr: "مطار أم التونسي الدولي (NKC)", flag: "🇲🇷", formatted: "Mauritania - Nouakchott 🇲🇷", formattedAr: "موريتانيا - نواكشوط 🇲🇷" },
];

export const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const MONTHS_FR = [
  "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
];

export const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  nameAr: string;
  nameFr: string;
  flag: string;
}

export const CURRENCIES_LIST: CurrencyOption[] = [
  { code: "USD", symbol: "$", name: "US Dollar", nameAr: "دولار أمريكي", nameFr: "Dollar américain", flag: "🇺🇸" },
];

// Re-export all centralized mock data models and constants
export * from "./mockData";


