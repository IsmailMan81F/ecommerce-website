import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "fr" | "ar";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  flagText: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flagText: "EN",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    dir: "ltr",
    flagText: "FR",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    flagText: "AR",
  },
];

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.collection": "Collection",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.search": "Search",
    "nav.bag": "Bag",
    "nav.admin": "Admin Console",
    "nav.store": "Store",
    "nav.menu": "Menu",
    "nav.all_products": "All Products",

    // General Actions
    "action.save": "Save Changes",
    "action.cancel": "Cancel",
    "action.delete": "Delete",
    "action.edit": "Edit",
    "action.back": "Back",
    "action.view_details": "View Details",
    "action.add_to_bag": "Add to Bag",
    "action.added": "Added to Bag",
    "action.checkout": "Proceed to Checkout",
    "action.filter": "Filters",
    "action.sort": "Sort",
    "action.clear": "Clear",
    "action.close": "Close",
    "action.search_placeholder": "Search catalog, objects, materials...",

    // Product & Collection
    "product.in_stock": "In Stock",
    "product.sold_out": "Sold Out",
    "product.new": "New Arrival",
    "product.essential": "Essential",
    "product.select_size": "Select Size",
    "product.select_color": "Select Finish",
    "product.features": "Material & Architecture",
    "product.specifications": "Technical Specifications",
    "product.available": "Available in Atelier",
    "product.pieces_left": "pieces remaining",

    // Cart & Checkout
    "cart.title": "Shopping Bag",
    "cart.empty_title": "Your bag is empty",
    "cart.empty_desc": "Explore our curated catalog of studio objects and acoustic hardware.",
    "cart.explore_collection": "Explore Collection",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Courier Delivery",
    "cart.free_shipping": "Complimentary",
    "cart.total": "Total Amount",
    "cart.delivery_notice": "Cash on delivery across all 58 Wilayas",
    "cart.recipient_info": "Delivery Coordinates",
    "cart.first_name": "First Name",
    "cart.last_name": "Last Name",
    "cart.phone": "Phone Number",
    "cart.wilaya": "Wilaya (Province)",
    "cart.commune": "Commune / City",
    "cart.address": "Street Address",
    "cart.notes": "Delivery Instructions (optional)",
    "cart.method_home": "Home Delivery",
    "cart.method_office": "Desk / Office Delivery",
    "cart.place_order": "Confirm Order (Cash on Delivery)",
    "cart.order_success": "Order Transmitted",
    "cart.order_success_desc": "Our logistics concierge will contact you via phone prior to courier dispatch.",

    // Contact
    "contact.badge": "Client Services & Inquiries",
    "contact.title": "Contact the Atelier",
    "contact.desc": "For custom dimension requests, private consultations, or courier tracking assistance, connect directly with our studio concierge.",
    "contact.direct_channels": "Direct Channels",
    "contact.email": "Concierge Email",
    "contact.phone": "Order Inquiries",
    "contact.showroom": "Studio & Showroom",
    "contact.hours": "Consultation Hours",
    "contact.send_title": "Send a Message",
    "contact.full_name": "Full Name",
    "contact.email_addr": "Email Address",
    "contact.phone_num": "Phone Number",
    "contact.inquiry_type": "Department / Inquiry Nature",
    "contact.order_ref": "Order Reference (optional)",
    "contact.subject": "Subject",
    "contact.message": "Message Content",
    "contact.dispatch": "Dispatch Inquiry",
    "contact.success_title": "Inquiry Dispatched",
    "contact.success_desc": "Our concierge team will respond within 24 hours.",

    // Footer
    "footer.manifesto": "KØRD is a dedicated design atelier and commerce platform focused on reduction, quiet material presence, and tactile longevity.",
    "footer.navigation": "Navigation",
    "footer.legal": "Legal & Terms",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved. Designed for quiet spatial focus.",
    "footer.theme": "Appearance",

    // Admin
    "admin.orders": "Orders",
    "admin.products": "Products",
    "admin.categories": "Categories",
    "admin.messages": "Messages",
    "admin.store": "Store",
    "admin.settings": "Console Settings",
    "admin.theme": "Theme",
    "admin.logout": "Log Out",
    "admin.console": "Console",

    // Language switcher
    "lang.select": "Language",
    "lang.switch_to": "Switch Language",
  },

  fr: {
    // Nav
    "nav.collection": "Collection",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.search": "Rechercher",
    "nav.bag": "Panier",
    "nav.admin": "Console Admin",
    "nav.store": "Boutique",
    "nav.menu": "Menu",
    "nav.all_products": "Tous les produits",

    // General Actions
    "action.save": "Enregistrer",
    "action.cancel": "Annuler",
    "action.delete": "Supprimer",
    "action.edit": "Modifier",
    "action.back": "Retour",
    "action.view_details": "Voir les détails",
    "action.add_to_bag": "Ajouter au panier",
    "action.added": "Ajouté au panier",
    "action.checkout": "Passer à la caisse",
    "action.filter": "Filtres",
    "action.sort": "Trier",
    "action.clear": "Effacer",
    "action.close": "Fermer",
    "action.search_placeholder": "Rechercher des objets, finitions, matériaux...",

    // Product & Collection
    "product.in_stock": "En stock",
    "product.sold_out": "Épuisé",
    "product.new": "Nouveauté",
    "product.essential": "Essentiel",
    "product.select_size": "Sélectionner la taille",
    "product.select_color": "Sélectionner la finition",
    "product.features": "Matières & Architecture",
    "product.specifications": "Spécifications techniques",
    "product.available": "Disponible à l'Atelier",
    "product.pieces_left": "pièces restantes",

    // Cart & Checkout
    "cart.title": "Panier d'achats",
    "cart.empty_title": "Votre panier est vide",
    "cart.empty_desc": "Découvrez notre sélection d'objets acoustiques et créations d'atelier.",
    "cart.explore_collection": "Découvrir la collection",
    "cart.subtotal": "Sous-total",
    "cart.shipping": "Frais de livraison",
    "cart.free_shipping": "Offerte",
    "cart.total": "Montant total",
    "cart.delivery_notice": "Paiement à la livraison dans les 58 Wilayas",
    "cart.recipient_info": "Coordonnées de livraison",
    "cart.first_name": "Prénom",
    "cart.last_name": "Nom",
    "cart.phone": "Numéro de téléphone",
    "cart.wilaya": "Wilaya (Province)",
    "cart.commune": "Commune / Ville",
    "cart.address": "Adresse complète",
    "cart.notes": "Instructions de livraison (facultatif)",
    "cart.method_home": "Livraison à domicile",
    "cart.method_office": "Livraison au bureau",
    "cart.place_order": "Confirmer la commande (Paiement à la livraison)",
    "cart.order_success": "Commande transmise",
    "cart.order_success_desc": "Notre conciergerie logistique vous contactera par téléphone avant l'expédition.",

    // Contact
    "contact.badge": "Service Client & Demandes",
    "contact.title": "Contacter l'Atelier",
    "contact.desc": "Pour des demandes de dimensions sur mesure, des consultations privées ou le suivi de livraison, contactez directement notre conciergerie.",
    "contact.direct_channels": "Canaux Directs",
    "contact.email": "Email Conciergerie",
    "contact.phone": "Assistance Commandes",
    "contact.showroom": "Studio & Showroom",
    "contact.hours": "Horaires de Consultation",
    "contact.send_title": "Envoyer un message",
    "contact.full_name": "Nom complet",
    "contact.email_addr": "Adresse email",
    "contact.phone_num": "Numéro de téléphone",
    "contact.inquiry_type": "Département / Objet",
    "contact.order_ref": "Référence de commande (facultatif)",
    "contact.subject": "Sujet",
    "contact.message": "Message",
    "contact.dispatch": "Envoyer la demande",
    "contact.success_title": "Demande transmise",
    "contact.success_desc": "Notre équipe de conciergerie vous répondra sous 24 heures.",

    // Footer
    "footer.manifesto": "KØRD est un atelier de design et une maison de commerce axés sur la sobriété, les matières nobles et la longévité tactile.",
    "footer.navigation": "Navigation",
    "footer.legal": "Mentions Légales",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",
    "footer.rights": "Tous droits réservés. Conçu pour la sérénité spatiale.",
    "footer.theme": "Apparence",

    // Admin
    "admin.orders": "Commandes",
    "admin.products": "Produits",
    "admin.categories": "Catégories",
    "admin.messages": "Messages",
    "admin.store": "Boutique",
    "admin.settings": "Paramètres",
    "admin.theme": "Thème",
    "admin.logout": "Déconnexion",
    "admin.console": "Console",

    // Language switcher
    "lang.select": "Langue",
    "lang.switch_to": "Changer de langue",
  },

  ar: {
    // Nav
    "nav.collection": "المجموعة",
    "nav.about": "عن الاستوديو",
    "nav.contact": "اتصل بنا",
    "nav.search": "بحث",
    "nav.bag": "الحقيبة",
    "nav.admin": "لوحة الإدارة",
    "nav.store": "المتجر",
    "nav.menu": "القائمة",
    "nav.all_products": "جميع القطع",

    // General Actions
    "action.save": "حفظ التغييرات",
    "action.cancel": "إلغاء",
    "action.delete": "حذف",
    "action.edit": "تعديل",
    "action.back": "رجوع",
    "action.view_details": "عرض التفاصيل",
    "action.add_to_bag": "إضافة إلى الحقيبة",
    "action.added": "تمت الإضافة",
    "action.checkout": "متابعة الطلب",
    "action.filter": "تصفية",
    "action.sort": "ترتيب",
    "action.clear": "مسح",
    "action.close": "إغلاق",
    "action.search_placeholder": "ابحث في الكتالوج، القطع الفنية، المواد...",

    // Product & Collection
    "product.in_stock": "متوفر حالياً",
    "product.sold_out": "نفدت الكمية",
    "product.new": "وصل حديثاً",
    "product.essential": "قطعة أساسية",
    "product.select_size": "اختر المقاس",
    "product.select_color": "اختر اللمسة النهائية",
    "product.features": "المواد والبنية الهندسية",
    "product.specifications": "المواصفات التقنية",
    "product.available": "متوفر في المشغل",
    "product.pieces_left": "قطع متبقية",

    // Cart & Checkout
    "cart.title": "حقيبة التسوق",
    "cart.empty_title": "حقيبتك فارغة حالياً",
    "cart.empty_desc": "استكشف تشكيلتنا المنتقاة من القطع الهندسية والأجهزة الصوتية الفاخرة.",
    "cart.explore_collection": "استكشف المجموعة",
    "cart.subtotal": "المجموع الفرعي",
    "cart.shipping": "رسوم التوصيل",
    "cart.free_shipping": "شحن مجاني",
    "cart.total": "المبلغ الإجمالي",
    "cart.delivery_notice": "الدفع عند الاستلام متوفر في جميع الولايات الـ 58",
    "cart.recipient_info": "بيانات التوصيل",
    "cart.first_name": "الاسم الأول",
    "cart.last_name": "اسم العائلة",
    "cart.phone": "رقم الهاتف",
    "cart.wilaya": "الولاية",
    "cart.commune": "البلدية / المدينة",
    "cart.address": "العنوان بالتفصيل",
    "cart.notes": "ملاحظات التوصيل (اختياري)",
    "cart.method_home": "توصيل إلى المنزل",
    "cart.method_office": "توصيل إلى مقر العمل / المكتب",
    "cart.place_order": "تأكيد الطلب (الدفع عند الاستلام)",
    "cart.order_success": "تم تأكيد طلبك بنجاح",
    "cart.order_success_desc": "سيتصل بك فريق الشحن هاتفياً قبل خروج المندوب لتسليم الطلب.",

    // Contact
    "contact.badge": "خدمة العملاء والاستفسارات الخاصة",
    "contact.title": "تواصل مع الاستوديو",
    "contact.desc": "لطلبات القياسات الخاصة، أو الاستشارات التصميمية، أو تتبع الشحنات، تواصل مباشرة مع فريق الكونسيرج.",
    "contact.direct_channels": "قنوات التواصل المباشرة",
    "contact.email": "البريد الإلكتروني للكونسيرج",
    "contact.phone": "استفسارات الطلبات",
    "contact.showroom": "الاستوديو وصالة العرض",
    "contact.hours": "أوقات الاستقبال والاستشارة",
    "contact.send_title": "أرسل رسالة",
    "contact.full_name": "الاسم الكامل",
    "contact.email_addr": "البريد الإلكتروني",
    "contact.phone_num": "رقم الهاتف",
    "contact.inquiry_type": "نوع الاستفسار / القسم",
    "contact.order_ref": "رقم الطلب (اختياري)",
    "contact.subject": "موضوع الرسالة",
    "contact.message": "نص الرسالة",
    "contact.dispatch": "إرسال الاستفسار",
    "contact.success_title": "تم إرسال استفسارك",
    "contact.success_desc": "سيقوم فريق الكونسيرج بالرد عليك خلال 24 ساعة عمل.",

    // Footer
    "footer.manifesto": "KØRD هو استوديو تصميم ومنصة تجارية قائمة على الاختزال الهندسي، والأصالة الملموسة، واستدامة المواد الطبيعية.",
    "footer.navigation": "روابط سريعة",
    "footer.legal": "الشروط والسياسات",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "شروط الاستخدام",
    "footer.rights": "جميع الحقوق محفوظة. صُمم للهدوء والتركيز البصري.",
    "footer.theme": "المظهر",

    // Admin
    "admin.orders": "الطلبات",
    "admin.products": "المنتجات",
    "admin.categories": "الفئات",
    "admin.messages": "الرسائل",
    "admin.store": "المتجر",
    "admin.settings": "إعدادات الإدارة",
    "admin.theme": "المظهر",
    "admin.logout": "تسجيل الخروج",
    "admin.console": "لوحة الإدارة",

    // Language switcher
    "lang.select": "اللغة",
    "lang.switch_to": "تغيير اللغة",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  t: (key: string, fallback?: string) => string;
  currentOption: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "kord_language";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === "en" || saved === "fr" || saved === "ar") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const isRTL = language === "ar";
  const dir: "ltr" | "rtl" = isRTL ? "rtl" : "ltr";

  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    if (language === "ar") {
      document.body.classList.add("lang-ar");
      document.documentElement.classList.add("font-arabic");
    } else {
      document.body.classList.remove("lang-ar");
      document.documentElement.classList.remove("font-arabic");
    }
  }, [language, dir]);

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? fallback ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        isRTL,
        t,
        currentOption,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
