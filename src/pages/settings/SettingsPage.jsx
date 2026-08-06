import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { useNavigator } from "../../context/NavigationContext";
import { Card } from "../../components/ui-kit";
import { withAlpha } from "../../lib/theme-colors";
import AppearanceModeSubpage, { CustomBackgroundColorSubpage, LayoutColorSubpage, AppLogoSubpage, ThemeSettingsSubpage } from "./AppearanceSettings";
import SecurityPasswordSubpage, { BiometricSecuritySubpage } from "./SecuritySettings";
import LanguageSubpage, { CurrencySubpage } from "./LocaleSettings";
import {
  LayoutDashboard, ChevronRight, Sun, Navigation, SlidersHorizontal, Palette, Globe, Lock, Upload, Image as ImageIcon, Fingerprint, Banknote,
} from "lucide-react";

export default function SettingsPage() {
  const { tokens, accent } = useTheme();
  const { t } = useLang();
  const nav = useNavigator();

  const SETTINGS_CARDS = [
    {
      key: "security-password",
      label: "Security & Password",
      description: "Update your login password",
      icon: Lock,
      tone: "red",
      page: <SecurityPasswordSubpage />,
    },
    {
      key: "biometric-security",
      label: "Biometric Security",
      description: "Fingerprint and Face ID login",
      icon: Fingerprint,
      tone: "violet",
      page: <BiometricSecuritySubpage />,
    },
    {
      key: "language",
      label: "Language",
      description: "Bangla, English, Arabic",
      icon: Globe,
      tone: "teal",
      page: <LanguageSubpage />,
    },
    {
      key: "currency",
      label: "Currency",
      description: "BDT, QAR, USD",
      icon: Banknote,
      tone: "amber",
      page: <CurrencySubpage />,
    },
    {
      key: "theme",
      label: "Theme Settings",
      description: "Preset color palettes",
      icon: Palette,
      tone: "violet",
      page: <ThemeSettingsSubpage />,
    },
    {
      key: "appearance",
      label: "Appearance Mode",
      description: "Switch between light, dark, and system mode",
      icon: Sun,
      tone: "blue",
      page: <AppearanceModeSubpage />,
    },
    {
      key: "custom-bg",
      label: "Custom Background Color",
      description: "Pick and apply your own background color",
      icon: SlidersHorizontal,
      tone: "green",
      page: <CustomBackgroundColorSubpage />,
    },
    {
      key: "layout-color",
      label: "Layout Color",
      description: "Top Bar and Bottom Navigation bar color",
      icon: LayoutDashboard,
      tone: "amber",
      page: <LayoutColorSubpage />,
    },
    {
      key: "app-logo",
      label: "App Logo",
      description: "Upload a custom logo from your phone",
      icon: ImageIcon,
      tone: "red",
      page: <AppLogoSubpage />,
    },
  ];

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 760 }}>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {SETTINGS_CARDS.map((item) => {
          const Icon = item.icon;
          const color = accent(item.tone);
          const label = t(`settingsCard.${item.key}.label`, item.label);
          const description = t(`settingsCard.${item.key}.description`, item.description);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => nav.push(label, item.page)}
              className="flex items-center gap-4 rounded-2xl text-left w-full group"
              style={{
                padding: 20,
                background: tokens.surface,
                border: `1px solid ${tokens.border}`,
                boxShadow: tokens.shadowSm,
                cursor: "pointer",
                transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tokens.borderStrong;
                e.currentTarget.style.boxShadow = tokens.shadow;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = tokens.border;
                e.currentTarget.style.boxShadow = tokens.shadowSm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 46, height: 46, background: withAlpha(color, tokens.isDark ? 0.20 : 0.13) }}
              >
                <Icon size={22} color={color} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14.5, fontWeight: 660, color: tokens.textPrimary }}>{label}</div>
                <div style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 2, lineHeight: 1.4 }}>{description}</div>
              </div>
              <ChevronRight size={17} color={tokens.textTertiary} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

