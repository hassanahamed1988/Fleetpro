import {
  LayoutDashboard, Truck, UserSquare2, Users, Route, CalendarCheck, Receipt, Wallet, Fuel, Wrench, BarChart3, Bell, Settings as SettingsIcon, Home, CreditCard, User, Navigation, FolderOpen, Phone, SlidersHorizontal, UserPlus, UserCheck, PiggyBank, CircleDollarSign, HeartHandshake, HandCoins, LifeBuoy, MessageCircle, Palette, FileEdit, FileText, ShieldCheck, Flag, Globe, Landmark, Package, PackageCheck, Building2,
} from "lucide-react";

/* ============================================================================
   APP DATA
============================================================================ */

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "vehicles", label: "Vehicles", icon: Truck },
  { key: "drivers", label: "Drivers", icon: UserSquare2 },
  { key: "customers", label: "Customers", icon: Users },
  { key: "trips", label: "Trips", icon: Route },
  { key: "booking", label: "Booking", icon: CalendarCheck },
  { key: "expenses", label: "Expenses", icon: Receipt },
  { key: "income", label: "Income", icon: Wallet },
  { key: "fuel", label: "Fuel Management", icon: Fuel },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

// Bottom navigation bar — mobile only. Home routes to the Dashboard page
// with the same click logic as the sidebar's Dashboard item. The remaining
// three items aren't wired to any page yet, so tapping them just surfaces
// the "Coming Soon" banner at the top of the page.
export const BOTTOM_NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "trips", label: "Trips", icon: Route },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "profile", label: "Profile", icon: User },
];

export const RECENT_TRIPS = [
  { id: "TRP-2291", route: "Chicago → Detroit", driver: "R. Alvarez", vehicle: "TN-04 GJ 8821", status: "Running", eta: "2h 10m" },
  { id: "TRP-2290", route: "Dallas → Austin", driver: "K. Mensah", vehicle: "TX-91 KL 4470", status: "Completed", eta: "—" },
  { id: "TRP-2289", route: "Seattle → Portland", driver: "J. Okafor", vehicle: "WA-12 PB 9012", status: "Completed", eta: "—" },
  { id: "TRP-2288", route: "Miami → Orlando", driver: "L. Fischer", vehicle: "FL-77 QW 1187", status: "Pending", eta: "Dispatch 4:00 PM" },
  { id: "TRP-2287", route: "Denver → Salt Lake City", driver: "A. Novak", vehicle: "CO-30 ZR 6634", status: "Running", eta: "5h 40m" },
];

export const NOTIFICATIONS = [
  { id: 1, title: "Vehicle TN-04 GJ 8821 due for service", time: "12 min ago", tone: "amber" },
  { id: 2, title: "Trip TRP-2290 completed successfully", time: "48 min ago", tone: "green" },
  { id: 3, title: "Fuel expense exceeded budget — Fleet B", time: "1h ago", tone: "red" },
  { id: 4, title: "New booking request from Meridian Logistics", time: "3h ago", tone: "blue" },
];

export const LIST_CONFIG = {
  vehicles: {
    title: "Vehicles", tone: "blue", icon: Truck, addLabel: "Add Vehicle",
    columns: [
      { key: "id", label: "Vehicle No." }, { key: "type", label: "Type" },
      { key: "driver", label: "Assigned Driver" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Vehicle Number", type: "text" },
      { key: "type", label: "Type", type: "select", options: ["Truck", "Van", "Trailer", "Pickup"] },
      { key: "driver", label: "Assigned Driver", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Active", "In Service", "Idle"] },
    ],
    rows: [
      { id: "TN-04 GJ 8821", type: "Truck", driver: "R. Alvarez", status: "Active" },
      { id: "TX-91 KL 4470", type: "Trailer", driver: "K. Mensah", status: "Active" },
      { id: "WA-12 PB 9012", type: "Van", driver: "J. Okafor", status: "In Service" },
      { id: "FL-77 QW 1187", type: "Truck", driver: "Unassigned", status: "Idle" },
      { id: "CO-30 ZR 6634", type: "Pickup", driver: "A. Novak", status: "Active" },
    ],
    statusKey: "status", statusTone: { Active: "green", "In Service": "amber", Idle: "blue" },
  },
  drivers: {
    title: "Drivers", tone: "teal", icon: UserSquare2, addLabel: "Add Driver",
    columns: [
      { key: "name", label: "Name" }, { key: "license", label: "License No." },
      { key: "trips", label: "Trips Completed" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "name", label: "Driver Name", type: "text" },
      { key: "license", label: "License Number", type: "text" },
      { key: "trips", label: "Trips Completed", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["On Duty", "Off Duty", "On Leave"] },
    ],
    rows: [
      { name: "R. Alvarez", license: "DL-33920", trips: "214", status: "On Duty" },
      { name: "K. Mensah", license: "DL-19204", trips: "186", status: "On Duty" },
      { name: "J. Okafor", license: "DL-58821", trips: "301", status: "Off Duty" },
      { name: "L. Fischer", license: "DL-77410", trips: "97", status: "On Leave" },
      { name: "A. Novak", license: "DL-40093", trips: "155", status: "On Duty" },
    ],
    statusKey: "status", statusTone: { "On Duty": "green", "Off Duty": "blue", "On Leave": "amber" },
  },
  customers: {
    title: "Customers", tone: "violet", icon: Users, addLabel: "Add Customer",
    columns: [
      { key: "name", label: "Company" }, { key: "contact", label: "Contact" },
      { key: "bookings", label: "Bookings" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "name", label: "Company Name", type: "text" },
      { key: "contact", label: "Contact Person", type: "text" },
      { key: "bookings", label: "Bookings", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
    ],
    rows: [
      { name: "Meridian Logistics", contact: "S. Park", bookings: "48", status: "Active" },
      { name: "Harbor & Co.", contact: "D. Reyes", bookings: "22", status: "Active" },
      { name: "Northline Freight", contact: "M. Chen", bookings: "9", status: "Inactive" },
      { name: "Prairie Distributors", contact: "T. Adeyemi", bookings: "63", status: "Active" },
    ],
    statusKey: "status", statusTone: { Active: "green", Inactive: "red" },
  },
  trips: {
    title: "Trips", tone: "blue", icon: Route, addLabel: "Add Trip",
    columns: [
      { key: "id", label: "Trip ID" }, { key: "route", label: "Route" },
      { key: "driver", label: "Driver" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Trip ID", type: "text" },
      { key: "route", label: "Route", type: "text" },
      { key: "driver", label: "Driver", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Running", "Completed", "Pending"] },
    ],
    rows: RECENT_TRIPS.map(({ id, route, driver, status }) => ({ id, route, driver, status })),
    statusKey: "status", statusTone: { Running: "blue", Completed: "green", Pending: "amber" },
  },
  booking: {
    title: "Bookings", tone: "amber", icon: CalendarCheck, addLabel: "New Booking",
    columns: [
      { key: "id", label: "Booking ID" }, { key: "customer", label: "Customer" },
      { key: "date", label: "Date" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Booking ID", type: "text" },
      { key: "customer", label: "Customer", type: "text" },
      { key: "date", label: "Date", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Confirmed", "Pending", "Cancelled"] },
    ],
    rows: [
      { id: "BK-3391", customer: "Meridian Logistics", date: "Aug 4, 2026", status: "Confirmed" },
      { id: "BK-3390", customer: "Harbor & Co.", date: "Aug 5, 2026", status: "Pending" },
      { id: "BK-3389", customer: "Prairie Distributors", date: "Aug 6, 2026", status: "Confirmed" },
    ],
    statusKey: "status", statusTone: { Confirmed: "green", Pending: "amber", Cancelled: "red" },
  },
  expenses: {
    title: "Expenses", tone: "red", icon: Receipt, addLabel: "Add Expense",
    columns: [
      { key: "id", label: "Entry" }, { key: "category", label: "Category" },
      { key: "amount", label: "Amount", currency: true }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Entry Reference", type: "text" },
      { key: "category", label: "Category", type: "select", options: ["Fuel", "Maintenance", "Toll", "Salary", "Insurance"] },
      { key: "amount", label: "Amount", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Paid", "Unpaid"] },
    ],
    rows: [
      { id: "EX-8821", category: "Fuel", amount: 4210, status: "Paid" },
      { id: "EX-8820", category: "Maintenance", amount: 1980, status: "Unpaid" },
      { id: "EX-8819", category: "Toll", amount: 620, status: "Paid" },
      { id: "EX-8818", category: "Salary", amount: 32400, status: "Paid" },
    ],
    statusKey: "status", statusTone: { Paid: "green", Unpaid: "red" },
  },
  income: {
    title: "Income", tone: "green", icon: Wallet, addLabel: "Add Income",
    columns: [
      { key: "id", label: "Entry" }, { key: "source", label: "Source" },
      { key: "amount", label: "Amount", currency: true }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Entry Reference", type: "text" },
      { key: "source", label: "Source", type: "text" },
      { key: "amount", label: "Amount", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Received", "Awaited"] },
    ],
    rows: [
      { id: "IN-5521", source: "Meridian Logistics", amount: 18200, status: "Received" },
      { id: "IN-5520", source: "Harbor & Co.", amount: 9640, status: "Received" },
      { id: "IN-5519", source: "Prairie Distributors", amount: 27100, status: "Awaited" },
    ],
    statusKey: "status", statusTone: { Received: "green", Awaited: "amber" },
  },
  fuel: {
    title: "Fuel Management", tone: "amber", icon: Fuel, addLabel: "Log Fuel Entry",
    columns: [
      { key: "vehicle", label: "Vehicle" }, { key: "liters", label: "Liters" },
      { key: "cost", label: "Cost", currency: true }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "vehicle", label: "Vehicle Number", type: "text" },
      { key: "liters", label: "Liters", type: "text" },
      { key: "cost", label: "Cost", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Logged", "Flagged"] },
    ],
    rows: [
      { vehicle: "TN-04 GJ 8821", liters: "180 L", cost: 310, status: "Logged" },
      { vehicle: "TX-91 KL 4470", liters: "205 L", cost: 352, status: "Logged" },
      { vehicle: "CO-30 ZR 6634", liters: "96 L", cost: 188, status: "Flagged" },
    ],
    statusKey: "status", statusTone: { Logged: "green", Flagged: "red" },
  },
  maintenance: {
    title: "Maintenance", tone: "violet", icon: Wrench, addLabel: "Schedule Service",
    columns: [
      { key: "vehicle", label: "Vehicle" }, { key: "service", label: "Service" },
      { key: "due", label: "Due" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "vehicle", label: "Vehicle Number", type: "text" },
      { key: "service", label: "Service Type", type: "text" },
      { key: "due", label: "Due Date", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Scheduled", "Overdue", "Done"] },
    ],
    rows: [
      { vehicle: "TN-04 GJ 8821", service: "Oil Change", due: "Aug 6, 2026", status: "Scheduled" },
      { vehicle: "FL-77 QW 1187", service: "Brake Inspection", due: "Jul 29, 2026", status: "Overdue" },
      { vehicle: "WA-12 PB 9012", service: "Tire Rotation", due: "Jul 20, 2026", status: "Done" },
    ],
    statusKey: "status", statusTone: { Scheduled: "blue", Overdue: "red", Done: "green" },
  },
  reports: {
    title: "Reports", tone: "blue", icon: BarChart3, addLabel: "Generate Report",
    columns: [
      { key: "name", label: "Report" }, { key: "period", label: "Period" },
      { key: "generated", label: "Generated" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "name", label: "Report Name", type: "text" },
      { key: "period", label: "Period", type: "text" },
      { key: "generated", label: "Generated On", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Ready", "Processing"] },
    ],
    rows: [
      { name: "Monthly P&L Summary", period: "Jun 2026", generated: "Jul 1, 2026", status: "Ready" },
      { name: "Fleet Utilization", period: "Q2 2026", generated: "Jul 3, 2026", status: "Ready" },
      { name: "Driver Performance", period: "Jul 2026", generated: "—", status: "Processing" },
    ],
    statusKey: "status", statusTone: { Ready: "green", Processing: "amber" },
  },
  notifications: {
    title: "Notifications", tone: "blue", icon: Bell, addLabel: "Mark All Read",
    columns: [
      { key: "title", label: "Notification" }, { key: "time", label: "Time" }, { key: "status", label: "Priority" },
    ],
    fields: [],
    rows: [
      { title: "Vehicle TN-04 GJ 8821 due for service", time: "12 min ago", status: "Medium" },
      { title: "Trip TRP-2290 completed successfully", time: "48 min ago", status: "Low" },
      { title: "Fuel expense exceeded budget — Fleet B", time: "1h ago", status: "High" },
      { title: "New booking request from Meridian Logistics", time: "3h ago", status: "Medium" },
    ],
    statusKey: "status", statusTone: { High: "red", Medium: "amber", Low: "blue" },
  },
};

// Human, past-tense wording for the global feedback HUD, keyed by page —
// keeps "Add Vehicle" producing "Vehicle added" rather than a generic
// "Saved successfully" everywhere.
export const ADD_SUCCESS_MESSAGE = {
  vehicles: "Vehicle added",
  drivers: "Driver added",
  customers: "Customer added",
  trips: "Trip added",
  booking: "Booking added",
  expenses: "Expense added",
  income: "Income added",
  fuel: "Fuel entry logged",
  maintenance: "Service scheduled",
  reports: "Report generated",
  notifications: "Updated",
};

export const DELETE_SUCCESS_MESSAGE = {
  vehicles: "Vehicle deleted",
  drivers: "Driver deleted",
  customers: "Customer deleted",
  trips: "Trip deleted",
  booking: "Booking deleted",
  expenses: "Expense deleted",
  income: "Income entry deleted",
  fuel: "Fuel entry deleted",
  maintenance: "Service record deleted",
  reports: "Report deleted",
  notifications: "Notification deleted",
};

/* ============================================================================
   DASHBOARD QUICK ACTIONS — the icon grid shown on the Dashboard home page.
   Tiles that map to a real page (navKey) route there on tap; the rest
   surface the same "Coming Soon" banner already used for unwired bottom-nav
   items, so tapping anything always gives visible feedback.
============================================================================ */

export const DASHBOARD_ICONS = [
  { key: "new-trip", label: "New Trip", icon: Navigation, tone: "blue", navKey: "trips" },
  { key: "monthly-files", label: "Monthly Files", icon: FolderOpen, tone: "violet", navKey: "reports" },
  { key: "contact", label: "Contact", icon: Phone, tone: "green" },
  { key: "control-panel", label: "Control Panel", icon: SlidersHorizontal, tone: "blue", navKey: "control-panel" },
  { key: "new-account", label: "New Account", icon: UserPlus, tone: "teal" },
  { key: "user-accounts", label: "User Accounts", icon: Users, tone: "violet" },
  { key: "user-renew", label: "User Renew", icon: UserCheck, tone: "amber" },
  { key: "my-income", label: "My Income", icon: PiggyBank, tone: "green", navKey: "income" },
  { key: "payment", label: "Payment", icon: CreditCard, tone: "blue" },
  { key: "settings", label: "Settings", icon: SettingsIcon, tone: "blue", navKey: "settings" },
  { key: "add-money", label: "Add Money", icon: CircleDollarSign, tone: "green" },
  { key: "family-maintenance", label: "Family Maintenance", icon: HeartHandshake, tone: "red" },
  { key: "settlement", label: "Settlement", icon: HandCoins, tone: "amber" },
  { key: "support", label: "Support", icon: LifeBuoy, tone: "teal" },
  { key: "chat", label: "Chat", icon: MessageCircle, tone: "blue" },
  { key: "theme", label: "Theme", icon: Palette, tone: "violet", navKey: "settings" },
  { key: "fuel-dash", label: "Fuel", icon: Fuel, tone: "amber", navKey: "fuel" },
  { key: "create-cv", label: "Create CV", icon: FileEdit, tone: "blue" },
  { key: "statement", label: "Statement", icon: FileText, tone: "violet" },
  { key: "invoice", label: "Invoice", icon: Receipt, tone: "red", navKey: "expenses" },
  { key: "wallet", label: "Wallet", icon: Wallet, tone: "green" },
  { key: "security", label: "Security", icon: ShieldCheck, tone: "red" },
];

/* ============================================================================
   CONTROL PANEL — reference-list management. Each entry below is one card
   on the Control Panel grid; tapping a card opens a dedicated subpage with
   its own floating-label add form and saved-entries table, all reusing the
   existing Card / Table / Button primitives so it matches the rest of the
   app exactly.
============================================================================ */

export const CONTROL_PANEL_ITEMS = [
  {
    key: "nationality", label: "Nationality", icon: Flag, tone: "blue",
    description: "Manage nationality options",
    addLabel: "Add Nationality", successLabel: "Nationality added",
    fields: [{ key: "name", label: "Nationality Name" }],
  },
  {
    key: "country", label: "Country", icon: Globe, tone: "teal",
    description: "Manage country list",
    addLabel: "Add Country", successLabel: "Country added",
    fields: [
      { key: "name", label: "Country Name" },
      { key: "code", label: "Country Code" },
    ],
  },
  {
    key: "mobile-code", label: "Mobile Code", icon: Phone, tone: "green",
    description: "Manage country dialing codes",
    addLabel: "Add Mobile Code", successLabel: "Mobile code added",
    fields: [
      { key: "country", label: "Country" },
      { key: "code", label: "Dialing Code" },
    ],
  },
  {
    key: "document", label: "Document", icon: FileText, tone: "violet",
    description: "Manage document types",
    addLabel: "Add Document", successLabel: "Document added",
    fields: [{ key: "name", label: "Document Name" }],
  },
  {
    key: "add-money", label: "Add Money", icon: CircleDollarSign, tone: "amber",
    description: "Manage money top-up entries",
    addLabel: "Add Money", successLabel: "Money entry added",
    fields: [
      { key: "amount", label: "Amount", currency: true },
      { key: "note", label: "Note / Reference" },
    ],
  },
  {
    key: "add-bank", label: "Add Bank", icon: Landmark, tone: "blue",
    description: "Manage linked bank accounts",
    addLabel: "Add Bank", successLabel: "Bank added",
    fields: [
      { key: "name", label: "Bank Name" },
      { key: "branch", label: "Branch" },
      { key: "account", label: "Account Number" },
    ],
  },
  {
    key: "container-title", label: "Container Title", icon: Package, tone: "red",
    description: "Manage container titles",
    addLabel: "Add Container Title", successLabel: "Container title added",
    fields: [{ key: "title", label: "Container Title" }],
  },
  {
    key: "loading-type", label: "Loading Type", icon: PackageCheck, tone: "teal",
    description: "Manage loading type options",
    addLabel: "Add Loading Type", successLabel: "Loading type added",
    fields: [{ key: "type", label: "Loading Type Name" }],
  },
  {
    key: "company-name", label: "Company Name", icon: Building2, tone: "violet",
    description: "Manage company name entries",
    addLabel: "Add Company Name", successLabel: "Company name added",
    fields: [{ key: "name", label: "Company Name" }],
  },
];

