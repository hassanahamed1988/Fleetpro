# RouteWise TMS — মডুলার স্ট্রাকচার

মূল একক ফাইলটি (৪৭০০+ লাইন) নিচের মত আলাদা আলাদা ফাইলে ভাগ করা হয়েছে। ড্যাসবোর্ড/সাইডবারের প্রত্যেকটি অপশন (Vehicles, Drivers, Customers, Trips, Booking, Expenses, Income, Fuel, Maintenance, Reports, Notifications) এখন আলাদা ফাইলে — `src/pages/dashboard-options/`।

```
src/
  App.jsx                     ← রুট কম্পোনেন্ট (Provider ট্রি + এন্ট্রি পয়েন্ট)
  AuthGate.jsx                ← লগইন/লগআউট গেট

  lib/
    theme-colors.js           ← কালার হেল্পার (hexToRgb, buildTokens, ইত্যাদি)
    i18n.js                   ← সব ভাষার অনুবাদ (en/bn/ar) + কারেন্সি ফরম্যাটিং

  context/
    ThemeContext.jsx           ← থিম (ডার্ক/লাইট, কাস্টম কালার, লোগো)
    AppSettingsContext.jsx     ← ভাষা ও কারেন্সি
    FeedbackContext.jsx        ← সাকসেস/টোস্ট HUD
    ConfirmDialogContext.jsx   ← Yes/No কনফার্ম ডায়ালগ + Exit গার্ড
    NavigationContext.jsx      ← পেজ পুশ/পপ নেভিগেশন স্ট্যাক

  components/
    ui-kit.jsx                 ← Card, Button, Table, Dialog, FloatingInput ইত্যাদি
    StatCard.jsx                ← StatCard + DashboardIconTile
    layout/
      Sidebar.jsx, TopBar.jsx, BottomNav.jsx, AppShell.jsx

  config/
    appData.js                 ← NAV_ITEMS, LIST_CONFIG, DASHBOARD_ICONS, CONTROL_PANEL_ITEMS

  pages/
    Dashboard.jsx               ← ড্যাসবোর্ডের আইকন গ্রিড
    ListPage.jsx                ← জেনেরিক লিস্ট পেজ (সব option এটাই শেয়ার করে)
    ControlPanel.jsx            ← Control Panel গ্রিড + ডেটা কনটেক্সট
    dashboard-options/          ← প্রতিটি অপশনের জন্য আলাদা ফাইল
      VehiclesPage.jsx
      DriversPage.jsx
      CustomersPage.jsx
      TripsPage.jsx
      BookingPage.jsx
      ExpensesPage.jsx
      IncomePage.jsx
      FuelPage.jsx
      MaintenancePage.jsx
      ReportsPage.jsx
      NotificationsPage.jsx
    dashboard-tiles/            ← ড্যাসবোর্ডের ২২টি আইকন/অপশনের জন্য আলাদা ফাইল
      NewTripPage.jsx            (reuse → TripsPage)
      MonthlyFilesPage.jsx       (reuse → ReportsPage)
      ContactPage.jsx            (placeholder)
      ControlPanelTilePage.jsx   (reuse → ControlPanel)
      NewAccountPage.jsx         (placeholder)
      UserAccountsPage.jsx       (placeholder)
      UserRenewPage.jsx          (placeholder)
      MyIncomePage.jsx           (reuse → IncomePage)
      PaymentPage.jsx            (placeholder)
      SettingsTilePage.jsx       (reuse → SettingsPage)
      AddMoneyPage.jsx           (reuse → ControlPanel "Add Money" subpage)
      FamilyMaintenancePage.jsx  (placeholder)
      SettlementPage.jsx         (placeholder)
      SupportPage.jsx            (placeholder)
      ChatPage.jsx               (placeholder)
      ThemePage.jsx              (reuse → SettingsPage)
      FuelTilePage.jsx           (reuse → FuelPage)
      CreateCvPage.jsx           (placeholder)
      StatementPage.jsx          (placeholder)
      InvoicePage.jsx            (reuse → ExpensesPage)
      WalletPage.jsx             (placeholder)
      SecurityPage.jsx           (placeholder)
    settings/
      SettingsPage.jsx           ← মূল সেটিংস পেজ
      SettingsShared.jsx         ← ModeOption, ComingSoonBanner
      AppearanceSettings.jsx     ← থিম মোড, কাস্টম কালার, লেআউট কালার, অ্যাপ লোগো
      SecuritySettings.jsx       ← পাসওয়ার্ড, Google Authenticator, বায়োমেট্রিক
      LocaleSettings.jsx         ← ভাষা ও কারেন্সি সাবপেজ
    AdminProfile.jsx
    UserProfile.jsx
    LoginScreen.jsx
```

## গুরুত্বপূর্ণ নোট

- প্রতিটি "dashboard option" (Vehicles, Drivers, ...) বাস্তবে একই জেনেরিক
  `ListPage` কম্পোনেন্ট ব্যবহার করে, যেটা `config/appData.js`-এর
  `LIST_CONFIG` থেকে কলাম/ফিল্ড/রো ডেটা পড়ে। তাই প্রতিটি অপশনের জন্য
  আলাদা ফাইল বানানো হয়েছে (`pages/dashboard-options/*.jsx`) কিন্তু ভেতরে
  কোড ডুপ্লিকেট না করে `ListPage`-কে নির্দিষ্ট `pageKey` দিয়ে কল করা হয়েছে —
  এতে প্রতিটি অপশন সত্যিকারের আলাদা ফাইল পায়, আবার একই জায়গায় বাগ ফিক্স
  করলে সব অপশনেই কাজ করে।
- `pages/dashboard-options/` হলো সাইডবার/জেনেরিক লিস্ট-ভিত্তিক অপশনগুলোর
  (Vehicles, Drivers, ...) ফাইল। `pages/dashboard-tiles/` হলো ড্যাসবোর্ডের
  ২২টি আইকনের জন্য আলাদা ফাইল — যেগুলোর ইতিমধ্যে একটা পেজ আছে (যেমন
  New Trip, My Income, Invoice) সেগুলো শুধু সেই পেজটাকেই পুনরায় ব্যবহার
  করে (কোড ডুপ্লিকেট না করে); বাকিগুলো (Contact, Chat, Support, Wallet,
  Security ইত্যাদি) এখনো "placeholder" — `AdminProfile.jsx` /
  `UserProfile.jsx`-এর মতোই কাঠামো তৈরি করা আছে, ভবিতরে কনটেন্ট বসানোর
  জন্য প্রস্তুত।
- এই মুহূর্তে `Dashboard.jsx`-এর ক্লিক হ্যান্ডলার আগের মতোই কাজ করে
  (যেগুলোর navKey আছে সেগুলো সেই সেকশনে যায়, বাকিগুলো "Coming Soon"
  ব্যানার দেখায়) — `dashboard-tiles/` ফাইলগুলো এখনো রাউটিং-এ যুক্ত করা
  হয়নি, শুধু ফাইল হিসেবে বানানো হয়েছে। বললে আমি এগুলোকেও পূর্ণাঙ্গ
  রাউটিং-এ যুক্ত করে দিতে পারি।
- এটি একটি সাধারণ React প্রজেক্ট স্ট্রাকচার (import/export সহ) — Vite বা
  Create React App প্রজেক্টে `src/` কপি করলেই কাজ করবে। `lucide-react`
  প্যাকেজ ইনস্টল থাকা দরকার (`npm install lucide-react`)।

---

## Vite দিয়ে রান করার নিয়ম (লোকাল প্রিভিউ)

```bash
# 1) unzip করার পর প্রজেক্ট ফোল্ডারে যাও
cd routewise-tms

# 2) dependency ইনস্টল করো (একবারই)
npm install

# 3) dev server চালু করো
npm run dev
```

টার্মিনালে একটা লিংক আসবে (সাধারণত `http://localhost:5173`) — ব্রাউজারে
ওটা খুললেই পুরো অ্যাপ চলবে। কোড এডিট করলে ব্রাউজার নিজে থেকেই রিফ্রেশ
হয়ে যাবে (hot reload) — merge/zip করার দরকার নেই।

**প্রোডাকশন বিল্ড** (deploy করার জন্য):
```bash
npm run build
```
এটা `dist/` ফোল্ডারে static ফাইল বানাবে, যেটা Vercel/Netlify/যেকোনো
স্ট্যাটিক হোস্টে আপলোড করা যায়।

### প্রয়োজনীয় ভার্সন
- Node.js 18+ (LTS recommended)
- npm 9+ (Node-এর সাথেই আসে)
