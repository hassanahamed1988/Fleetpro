// Every UI string lives here, one language per top-level key. Nested paths
// are looked up with t("a.b.c"). Anything missing for the active language
// silently falls back to English, then to the caller-supplied fallback (or
// the key itself) — so a partially-translated new string never breaks.
export const TRANSLATIONS = {
  en: {
    nav: {
      dashboard: "Dashboard", vehicles: "Vehicles", drivers: "Drivers", customers: "Customers",
      trips: "Trips", booking: "Booking", expenses: "Expenses", income: "Income",
      fuel: "Fuel Management", maintenance: "Maintenance", reports: "Reports",
      notifications: "Notifications", settings: "Settings", "control-panel": "Control Panel",
    },
    bottomNav: { home: "Home", trips: "Trips", payment: "Payment", profile: "Profile" },
    dashboardTile: {
      "new-trip": "New Trip", "monthly-files": "Monthly Files", contact: "Contact",
      "control-panel": "Control Panel", "new-account": "New Account", "user-accounts": "User Accounts",
      "user-renew": "User Renew", "my-income": "My Income", payment: "Payment", settings: "Settings",
      "add-money": "Add Money", "family-maintenance": "Family Maintenance", settlement: "Settlement",
      support: "Support", chat: "Chat", theme: "Theme", "fuel-dash": "Fuel", "create-cv": "Create CV",
      statement: "Statement", invoice: "Invoice", wallet: "Wallet", security: "Security",
    },
    settingsCard: {
      "security-password": { label: "Security & Password", description: "Update your login password" },
      "biometric-security": { label: "Biometric Security", description: "Fingerprint and Face ID login" },
      language: { label: "Language", description: "Bangla, English, Arabic" },
      currency: { label: "Currency", description: "BDT, QAR, USD" },
      theme: { label: "Theme Settings", description: "Preset color palettes" },
      appearance: { label: "Appearance Mode", description: "Switch between light, dark, and system mode" },
      "custom-bg": { label: "Custom Background Color", description: "Pick and apply your own background color" },
      "layout-color": { label: "Layout Color", description: "Top Bar and Bottom Navigation bar color" },
      "app-logo": { label: "App Logo", description: "Upload a custom logo from your phone" },
    },
    controlPanel: {
      nationality: { label: "Nationality", description: "Manage nationality options" },
      country: { label: "Country", description: "Manage country list" },
      "mobile-code": { label: "Mobile Code", description: "Manage country dialing codes" },
      document: { label: "Document", description: "Manage document types" },
      "add-money": { label: "Add Money", description: "Manage money top-up entries" },
      "add-bank": { label: "Add Bank", description: "Manage linked bank accounts" },
      "container-title": { label: "Container Title", description: "Manage container titles" },
      "loading-type": { label: "Loading Type", description: "Manage loading type options" },
      "company-name": { label: "Company Name", description: "Manage company name entries" },
    },
    languageOption: {
      bnLabel: "Bangla", bnCountry: "Bangladesh",
      enLabel: "English", enCountry: "United States",
      arLabel: "Arabic", arCountry: "Qatar",
    },
    currencyOption: {
      bdtCountry: "Bangladesh", qarCountry: "Qatar", usdCountry: "United States",
    },
    common: {
      save: "Save", cancel: "Cancel", delete: "Delete", add: "Add", added: "added", deleted: "deleted",
      addNew: "Add New", savedEntries: "Saved Entries", search: "Search",
      login: "Login", logout: "Logout", exitApplication: "Exit Application",
      comingSoon: "Coming Soon", total: "Total", all: "All", record: "record", records: "records",
      recordsCount: "{count} {unit} total", notifications: "Notifications",
      update: "Update", updatePassword: "Update Password", yes: "Yes", no: "No", selected: "selected",
      collapse: "Collapse",
    },
    login: {
      subtitle: "Sign in to continue", email: "Email", password: "Password", emailPlaceholder: "you@company.com",
    },
    security: {
      changePassword: "Change Password", currentPassword: "Current Password", newPassword: "New Password",
      confirmPassword: "Confirm New Password", mismatch: "New password and confirmation don't match.",
      hint: "Use at least 6 characters. You'll stay logged in on this device after updating.",
      passwordUpdated: "Password updated",
      biometricTitle: "Biometric Security",
      fingerprintTitle: "Fingerprint Login", fingerprintDesc: "Unlock the app with your fingerprint",
      faceIdTitle: "Face ID Login", faceIdDesc: "Unlock the app by scanning your face",
      biometricHint: "When enabled, you can use biometrics instead of your password to log in.",
      fingerprintEnabled: "Fingerprint login enabled", fingerprintDisabled: "Fingerprint login disabled",
      faceIdEnabled: "Face ID login enabled", faceIdDisabled: "Face ID login disabled",
      authenticatorTitle: "Google Authenticator",
      authenticatorRowTitle: "Authenticator App", authenticatorRowDesc: "Use Google Authenticator for 2-step verification",
      authenticatorScanHint: "Scan this QR code with the Google Authenticator app, or enter the key manually:",
      authenticatorCodeLabel: "6-digit code",
      authenticatorVerify: "Verify & Enable",
      authenticatorEnabledHint: "Google Authenticator is protecting your account.",
      authenticatorEnabled: "Google Authenticator enabled", authenticatorDisabled: "Google Authenticator disabled",
    },
    dialog: {
      logoutTitle: "Logout", logoutMessage: "Are you sure you want to close your current session and log out?",
      exitTitle: "Exit Application", exitMessage: "Are you sure you want to exit the application?",
    },
  },
  bn: {
    nav: {
      dashboard: "ড্যাশবোর্ড", vehicles: "যানবাহন", drivers: "চালক", customers: "গ্রাহক",
      trips: "ট্রিপ", booking: "বুকিং", expenses: "খরচ", income: "আয়",
      fuel: "জ্বালানি ব্যবস্থাপনা", maintenance: "রক্ষণাবেক্ষণ", reports: "রিপোর্ট",
      notifications: "নোটিফিকেশন", settings: "সেটিংস", "control-panel": "কন্ট্রোল প্যানেল",
    },
    bottomNav: { home: "হোম", trips: "ট্রিপ", payment: "পেমেন্ট", profile: "প্রোফাইল" },
    dashboardTile: {
      "new-trip": "নতুন ট্রিপ", "monthly-files": "মাসিক ফাইল", contact: "যোগাযোগ",
      "control-panel": "কন্ট্রোল প্যানেল", "new-account": "নতুন অ্যাকাউন্ট", "user-accounts": "ইউজার অ্যাকাউন্ট",
      "user-renew": "ইউজার রিনিউ", "my-income": "আমার আয়", payment: "পেমেন্ট", settings: "সেটিংস",
      "add-money": "টাকা যোগ করুন", "family-maintenance": "পারিবারিক ভরণপোষণ", settlement: "সেটেলমেন্ট",
      support: "সাপোর্ট", chat: "চ্যাট", theme: "থিম", "fuel-dash": "জ্বালানি", "create-cv": "সিভি তৈরি করুন",
      statement: "স্টেটমেন্ট", invoice: "ইনভয়েস", wallet: "ওয়ালেট", security: "নিরাপত্তা",
    },
    settingsCard: {
      "security-password": { label: "নিরাপত্তা ও পাসওয়ার্ড", description: "আপনার লগইন পাসওয়ার্ড পরিবর্তন করুন" },
      "biometric-security": { label: "বায়োমেট্রিক নিরাপত্তা", description: "ফিঙ্গারপ্রিন্ট ও ফেস আইডি লগইন" },
      language: { label: "ভাষা", description: "বাংলা, ইংরেজি, আরবি" },
      currency: { label: "কারেন্সি", description: "BDT, QAR, USD" },
      theme: { label: "থিম সেটিংস", description: "প্রিসেট কালার প্যালেট" },
      appearance: { label: "অ্যাপিয়ারেন্স মোড", description: "লাইট, ডার্ক ও সিস্টেম মোডের মধ্যে পরিবর্তন করুন" },
      "custom-bg": { label: "কাস্টম ব্যাকগ্রাউন্ড কালার", description: "নিজস্ব ব্যাকগ্রাউন্ড কালার বেছে নিন ও প্রয়োগ করুন" },
      "layout-color": { label: "লেআউট কালার", description: "টপ বার ও বটম নেভিগেশন বারের কালার" },
      "app-logo": { label: "অ্যাপ লোগো", description: "আপনার ফোন থেকে কাস্টম লোগো আপলোড করুন" },
    },
    controlPanel: {
      nationality: { label: "জাতীয়তা", description: "জাতীয়তার অপশন পরিচালনা করুন" },
      country: { label: "দেশ", description: "দেশের তালিকা পরিচালনা করুন" },
      "mobile-code": { label: "মোবাইল কোড", description: "দেশের ডায়ালিং কোড পরিচালনা করুন" },
      document: { label: "ডকুমেন্ট", description: "ডকুমেন্টের ধরন পরিচালনা করুন" },
      "add-money": { label: "টাকা যোগ করুন", description: "টাকা যোগ করার এন্ট্রি পরিচালনা করুন" },
      "add-bank": { label: "ব্যাংক যোগ করুন", description: "সংযুক্ত ব্যাংক অ্যাকাউন্ট পরিচালনা করুন" },
      "container-title": { label: "কনটেইনার টাইটেল", description: "কনটেইনার টাইটেল পরিচালনা করুন" },
      "loading-type": { label: "লোডিং টাইপ", description: "লোডিং টাইপের অপশন পরিচালনা করুন" },
      "company-name": { label: "কোম্পানির নাম", description: "কোম্পানির নামের এন্ট্রি পরিচালনা করুন" },
    },
    languageOption: {
      bnLabel: "বাংলা", bnCountry: "বাংলাদেশ",
      enLabel: "ইংরেজি", enCountry: "যুক্তরাষ্ট্র",
      arLabel: "আরবি", arCountry: "কাতার",
    },
    currencyOption: {
      bdtCountry: "বাংলাদেশ", qarCountry: "কাতার", usdCountry: "যুক্তরাষ্ট্র",
    },
    common: {
      save: "সেভ", cancel: "বাতিল", delete: "ডিলিট", add: "যোগ করুন", added: "যোগ হয়েছে", deleted: "ডিলিট হয়েছে",
      addNew: "নতুন যোগ করুন", savedEntries: "সংরক্ষিত এন্ট্রি", search: "খুঁজুন",
      login: "লগইন", logout: "লগআউট", exitApplication: "অ্যাপ্লিকেশন বন্ধ করুন",
      comingSoon: "শীঘ্রই আসছে", total: "মোট", all: "সব", record: "টি রেকর্ড", records: "টি রেকর্ড",
      recordsCount: "মোট {count} {unit}", notifications: "নোটিফিকেশন",
      update: "আপডেট", updatePassword: "পাসওয়ার্ড আপডেট করুন", yes: "হ্যাঁ", no: "না", selected: "নির্বাচিত",
      collapse: "সংকুচিত করুন",
    },
    login: {
      subtitle: "চালিয়ে যেতে সাইন ইন করুন", email: "ইমেইল", password: "পাসওয়ার্ড", emailPlaceholder: "you@company.com",
    },
    security: {
      changePassword: "পাসওয়ার্ড পরিবর্তন করুন", currentPassword: "বর্তমান পাসওয়ার্ড", newPassword: "নতুন পাসওয়ার্ড",
      confirmPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন", mismatch: "নতুন পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না।",
      hint: "কমপক্ষে ৬টি অক্ষর ব্যবহার করুন। আপডেট করার পর এই ডিভাইসে আপনি লগইন থাকবেন।",
      passwordUpdated: "পাসওয়ার্ড আপডেট হয়েছে",
      biometricTitle: "বায়োমেট্রিক নিরাপত্তা",
      fingerprintTitle: "ফিঙ্গারপ্রিন্ট লগইন", fingerprintDesc: "আপনার ফিঙ্গারপ্রিন্ট দিয়ে অ্যাপ আনলক করুন",
      faceIdTitle: "ফেস আইডি লগইন", faceIdDesc: "মুখ স্ক্যান করে অ্যাপ আনলক করুন",
      biometricHint: "চালু করা থাকলে, পাসওয়ার্ডের পরিবর্তে বায়োমেট্রিক দিয়ে লগইন করতে পারবেন।",
      fingerprintEnabled: "ফিঙ্গারপ্রিন্ট লগইন চালু হয়েছে", fingerprintDisabled: "ফিঙ্গারপ্রিন্ট লগইন বন্ধ হয়েছে",
      faceIdEnabled: "ফেস আইডি লগইন চালু হয়েছে", faceIdDisabled: "ফেস আইডি লগইন বন্ধ হয়েছে",
      authenticatorTitle: "গুগল অথেনটিকেটর",
      authenticatorRowTitle: "অথেনটিকেটর অ্যাপ", authenticatorRowDesc: "টু-স্টেপ ভেরিফিকেশনের জন্য গুগল অথেনটিকেটর ব্যবহার করুন",
      authenticatorScanHint: "গুগল অথেনটিকেটর অ্যাপ দিয়ে এই QR কোডটি স্ক্যান করুন, অথবা কী-টি ম্যানুয়ালি লিখুন:",
      authenticatorCodeLabel: "৬-সংখ্যার কোড",
      authenticatorVerify: "যাচাই করে চালু করুন",
      authenticatorEnabledHint: "গুগল অথেনটিকেটর আপনার অ্যাকাউন্ট সুরক্ষা দিচ্ছে।",
      authenticatorEnabled: "গুগল অথেনটিকেটর চালু হয়েছে", authenticatorDisabled: "গুগল অথেনটিকেটর বন্ধ হয়েছে",
    },
    dialog: {
      logoutTitle: "লগআউট", logoutMessage: "আপনি কি নিশ্চিতভাবে বর্তমান সেশন বন্ধ করে লগআউট করতে চান?",
      exitTitle: "অ্যাপ্লিকেশন বন্ধ করুন", exitMessage: "আপনি কি নিশ্চিতভাবে অ্যাপ্লিকেশনটি বন্ধ করতে চান?",
    },
  },
  ar: {
    nav: {
      dashboard: "لوحة التحكم", vehicles: "المركبات", drivers: "السائقون", customers: "العملاء",
      trips: "الرحلات", booking: "الحجوزات", expenses: "المصروفات", income: "الإيرادات",
      fuel: "إدارة الوقود", maintenance: "الصيانة", reports: "التقارير",
      notifications: "الإشعارات", settings: "الإعدادات", "control-panel": "لوحة الإدارة",
    },
    bottomNav: { home: "الرئيسية", trips: "الرحلات", payment: "الدفع", profile: "الملف الشخصي" },
    dashboardTile: {
      "new-trip": "رحلة جديدة", "monthly-files": "الملفات الشهرية", contact: "اتصال",
      "control-panel": "لوحة الإدارة", "new-account": "حساب جديد", "user-accounts": "حسابات المستخدمين",
      "user-renew": "تجديد المستخدم", "my-income": "دخلي", payment: "الدفع", settings: "الإعدادات",
      "add-money": "إضافة رصيد", "family-maintenance": "نفقة الأسرة", settlement: "التسوية",
      support: "الدعم", chat: "الدردشة", theme: "المظهر", "fuel-dash": "الوقود", "create-cv": "إنشاء سيرة ذاتية",
      statement: "كشف الحساب", invoice: "الفاتورة", wallet: "المحفظة", security: "الأمان",
    },
    settingsCard: {
      "security-password": { label: "الأمان وكلمة المرور", description: "تحديث كلمة مرور تسجيل الدخول" },
      "biometric-security": { label: "الأمان البيومتري", description: "تسجيل الدخول بالبصمة والتعرف على الوجه" },
      language: { label: "اللغة", description: "البنغالية، الإنجليزية، العربية" },
      currency: { label: "العملة", description: "BDT, QAR, USD" },
      theme: { label: "إعدادات المظهر", description: "لوحات ألوان جاهزة" },
      appearance: { label: "وضع المظهر", description: "التبديل بين الوضع الفاتح والداكن ووضع النظام" },
      "custom-bg": { label: "لون خلفية مخصص", description: "اختر لون الخلفية الخاص بك وطبّقه" },
      "layout-color": { label: "لون التخطيط", description: "لون الشريط العلوي وشريط التنقل السفلي" },
      "app-logo": { label: "شعار التطبيق", description: "تحميل شعار مخصص من هاتفك" },
    },
    controlPanel: {
      nationality: { label: "الجنسية", description: "إدارة خيارات الجنسية" },
      country: { label: "الدولة", description: "إدارة قائمة الدول" },
      "mobile-code": { label: "رمز الجوال", description: "إدارة رموز الاتصال الدولية" },
      document: { label: "المستند", description: "إدارة أنواع المستندات" },
      "add-money": { label: "إضافة رصيد", description: "إدارة عمليات إضافة الرصيد" },
      "add-bank": { label: "إضافة بنك", description: "إدارة الحسابات المصرفية المرتبطة" },
      "container-title": { label: "عنوان الحاوية", description: "إدارة عناوين الحاويات" },
      "loading-type": { label: "نوع التحميل", description: "إدارة خيارات نوع التحميل" },
      "company-name": { label: "اسم الشركة", description: "إدارة إدخالات اسم الشركة" },
    },
    languageOption: {
      bnLabel: "البنغالية", bnCountry: "بنغلاديش",
      enLabel: "الإنجليزية", enCountry: "الولايات المتحدة",
      arLabel: "العربية", arCountry: "قطر",
    },
    currencyOption: {
      bdtCountry: "بنغلاديش", qarCountry: "قطر", usdCountry: "الولايات المتحدة",
    },
    common: {
      save: "حفظ", cancel: "إلغاء", delete: "حذف", add: "إضافة", added: "تمت الإضافة", deleted: "تم الحذف",
      addNew: "إضافة جديد", savedEntries: "الإدخالات المحفوظة", search: "بحث",
      login: "تسجيل الدخول", logout: "تسجيل الخروج", exitApplication: "إغلاق التطبيق",
      comingSoon: "قريباً", total: "الإجمالي", all: "الكل", record: "سجل", records: "سجلات",
      recordsCount: "إجمالي {count} {unit}", notifications: "الإشعارات",
      update: "تحديث", updatePassword: "تحديث كلمة المرور", yes: "نعم", no: "لا", selected: "محدد",
      collapse: "طي",
    },
    login: {
      subtitle: "سجّل الدخول للمتابعة", email: "البريد الإلكتروني", password: "كلمة المرور", emailPlaceholder: "you@company.com",
    },
    security: {
      changePassword: "تغيير كلمة المرور", currentPassword: "كلمة المرور الحالية", newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور الجديدة", mismatch: "كلمة المرور الجديدة والتأكيد غير متطابقين.",
      hint: "استخدم 6 أحرف على الأقل. ستبقى مسجلاً للدخول على هذا الجهاز بعد التحديث.",
      passwordUpdated: "تم تحديث كلمة المرور",
      biometricTitle: "الأمان البيومتري",
      fingerprintTitle: "تسجيل الدخول بالبصمة", fingerprintDesc: "افتح التطبيق ببصمتك",
      faceIdTitle: "تسجيل الدخول بالتعرف على الوجه", faceIdDesc: "افتح التطبيق بمسح وجهك",
      biometricHint: "عند التفعيل، يمكنك استخدام البيانات البيومترية بدلاً من كلمة المرور لتسجيل الدخول.",
      fingerprintEnabled: "تم تفعيل تسجيل الدخول بالبصمة", fingerprintDisabled: "تم تعطيل تسجيل الدخول بالبصمة",
      faceIdEnabled: "تم تفعيل تسجيل الدخول بالوجه", faceIdDisabled: "تم تعطيل تسجيل الدخول بالوجه",
      authenticatorTitle: "تطبيق Google Authenticator",
      authenticatorRowTitle: "تطبيق المصادقة", authenticatorRowDesc: "استخدم Google Authenticator للتحقق بخطوتين",
      authenticatorScanHint: "امسح رمز QR هذا باستخدام تطبيق Google Authenticator، أو أدخل المفتاح يدويًا:",
      authenticatorCodeLabel: "رمز مكون من 6 أرقام",
      authenticatorVerify: "تحقق وتفعيل",
      authenticatorEnabledHint: "يقوم Google Authenticator بحماية حسابك.",
      authenticatorEnabled: "تم تفعيل Google Authenticator", authenticatorDisabled: "تم تعطيل Google Authenticator",
    },
    dialog: {
      logoutTitle: "تسجيل الخروج", logoutMessage: "هل أنت متأكد أنك تريد إنهاء الجلسة الحالية وتسجيل الخروج؟",
      exitTitle: "إغلاق التطبيق", exitMessage: "هل أنت متأكد أنك تريد إغلاق التطبيق؟",
    },
  },
};

// Human, past-tense feedback toasts, keyed by page — mirrors
// ADD_SUCCESS_MESSAGE / DELETE_SUCCESS_MESSAGE below but per-language, so
// "Vehicle added" becomes "যানবাহন যোগ হয়েছে" / "تمت إضافة المركبة" instead
// of a generic message once the person switches language.
export const FEEDBACK_TRANSLATIONS = {
  en: {
    add: {
      vehicles: "Vehicle added", drivers: "Driver added", customers: "Customer added", trips: "Trip added",
      booking: "Booking added", expenses: "Expense added", income: "Income added", fuel: "Fuel entry logged",
      maintenance: "Service scheduled", reports: "Report generated", notifications: "Updated",
    },
    delete: {
      vehicles: "Vehicle deleted", drivers: "Driver deleted", customers: "Customer deleted", trips: "Trip deleted",
      booking: "Booking deleted", expenses: "Expense deleted", income: "Income entry deleted", fuel: "Fuel entry deleted",
      maintenance: "Service record deleted", reports: "Report deleted", notifications: "Notification deleted",
    },
  },
  bn: {
    add: {
      vehicles: "যানবাহন যোগ হয়েছে", drivers: "চালক যোগ হয়েছে", customers: "গ্রাহক যোগ হয়েছে", trips: "ট্রিপ যোগ হয়েছে",
      booking: "বুকিং যোগ হয়েছে", expenses: "খরচ যোগ হয়েছে", income: "আয় যোগ হয়েছে", fuel: "জ্বালানি এন্ট্রি লগ হয়েছে",
      maintenance: "সার্ভিস শিডিউল হয়েছে", reports: "রিপোর্ট তৈরি হয়েছে", notifications: "আপডেট হয়েছে",
    },
    delete: {
      vehicles: "যানবাহন ডিলিট হয়েছে", drivers: "চালক ডিলিট হয়েছে", customers: "গ্রাহক ডিলিট হয়েছে", trips: "ট্রিপ ডিলিট হয়েছে",
      booking: "বুকিং ডিলিট হয়েছে", expenses: "খরচ ডিলিট হয়েছে", income: "আয় এন্ট্রি ডিলিট হয়েছে", fuel: "জ্বালানি এন্ট্রি ডিলিট হয়েছে",
      maintenance: "সার্ভিস রেকর্ড ডিলিট হয়েছে", reports: "রিপোর্ট ডিলিট হয়েছে", notifications: "নোটিফিকেশন ডিলিট হয়েছে",
    },
  },
  ar: {
    add: {
      vehicles: "تمت إضافة المركبة", drivers: "تمت إضافة السائق", customers: "تمت إضافة العميل", trips: "تمت إضافة الرحلة",
      booking: "تمت إضافة الحجز", expenses: "تمت إضافة المصروف", income: "تمت إضافة الإيراد", fuel: "تم تسجيل إدخال الوقود",
      maintenance: "تمت جدولة الصيانة", reports: "تم إنشاء التقرير", notifications: "تم التحديث",
    },
    delete: {
      vehicles: "تم حذف المركبة", drivers: "تم حذف السائق", customers: "تم حذف العميل", trips: "تم حذف الرحلة",
      booking: "تم حذف الحجز", expenses: "تم حذف المصروف", income: "تم حذف الإيراد", fuel: "تم حذف إدخال الوقود",
      maintenance: "تم حذف سجل الصيانة", reports: "تم حذف التقرير", notifications: "تم حذف الإشعار",
    },
  },
};

// Currency metadata — symbol shown before the formatted number. Extend this
// object (and CURRENCY_OPTIONS in the Currency subpage) to support more
// currencies; every amount in the app formats through formatAmount() so
// nothing else needs to change.
export const CURRENCY_META = {
  bdt: { code: "BDT", symbol: "৳" },
  qar: { code: "QAR", symbol: "ر.ق" },
  usd: { code: "USD", symbol: "$" },
};

// Accepts either a raw number or a legacy formatted string ("$4,210") and
// returns it re-formatted in the currently active currency.
export function parseAmount(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatAmountWith(currencyId, value) {
  const meta = CURRENCY_META[currencyId] || CURRENCY_META.usd;
  const n = parseAmount(value);
  const formatted = n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${meta.symbol}${formatted}`;
}
