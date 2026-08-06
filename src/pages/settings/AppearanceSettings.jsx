import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { useFeedback } from "../../context/FeedbackContext";
import { withAlpha, isDarkColor } from "../../lib/theme-colors";
import { Card, Button, SectionHeading, Dialog, FloatingInput } from "../../components/ui-kit";
import { ModeOption } from "./SettingsShared";
import {
  fileToLogoDataUrl, fileToCompactDataUrl, detectLogoCornerRadius, logoFrameRadius,
  LIGHT_BG_DEFAULT, DARK_BG_DEFAULT,
} from "../../lib/theme-colors";
import {
  Route, Sun, Moon, Monitor, RotateCcw, Check, Trash2, Navigation, Upload, Image as ImageIcon,
} from "lucide-react";

/* ============================================================================
   THEME SETTINGS SUBPAGE
   Preset palette grid (3 columns) + custom color picker.
   Selecting any swatch instantly applies it as the app background.
   Icons, input-focus borders, and app chrome all update from the same token.
============================================================================ */

// 32 curated presets — 4 columns × 8 rows.
// Each has a light and dark variant so the right one is applied depending on
// the current mode. label is shown on hover as a tooltip.
const THEME_PRESETS = [
  // ── Blues ──────────────────────────────────────────────────────────────────
  {
    id: "ocean", label: "Ocean",
    light: { bg: "#E8F0FE", chrome: "#C8D9FB", sidebar: "#BBCFF9" },
    dark:  { bg: "#0A1628", chrome: "#071020", sidebar: "#050D1A" },
  },
  {
    id: "navy", label: "Navy",
    light: { bg: "#EFF3FB", chrome: "#D5E0F6", sidebar: "#C4D4F2" },
    dark:  { bg: "#002843", chrome: "#001D30", sidebar: "#001525" },
  },
  {
    id: "cobalt", label: "Cobalt",
    light: { bg: "#E6EDFF", chrome: "#C5D4FF", sidebar: "#B3C6FF" },
    dark:  { bg: "#0D1B45", chrome: "#091235", sidebar: "#060D28" },
  },
  {
    id: "slate", label: "Slate",
    light: { bg: "#EEF2F7", chrome: "#D4DCE9", sidebar: "#C5CFDF" },
    dark:  { bg: "#1A2332", chrome: "#111926", sidebar: "#0C121B" },
  },
  // ── Greens ─────────────────────────────────────────────────────────────────
  {
    id: "forest", label: "Forest",
    light: { bg: "#E8F5EE", chrome: "#C5E6D2", sidebar: "#B2DCBF" },
    dark:  { bg: "#0D2018", chrome: "#081610", sidebar: "#050F0A" },
  },
  {
    id: "emerald", label: "Emerald",
    light: { bg: "#E6F4EF", chrome: "#C3E6D8", sidebar: "#AEE0CB" },
    dark:  { bg: "#08241C", chrome: "#051912", sidebar: "#03100B" },
  },
  {
    id: "sage", label: "Sage",
    light: { bg: "#EDF4EE", chrome: "#D2E7D4", sidebar: "#C2DEC4" },
    dark:  { bg: "#15251A", chrome: "#0E1A11", sidebar: "#09100B" },
  },
  {
    id: "teal", label: "Teal",
    light: { bg: "#E5F4F4", chrome: "#C1E6E6", sidebar: "#ADDCDC" },
    dark:  { bg: "#08232A", chrome: "#051720", sidebar: "#030F16" },
  },
  // ── Purples ────────────────────────────────────────────────────────────────
  {
    id: "violet", label: "Violet",
    light: { bg: "#F0EBFF", chrome: "#D9CFFF", sidebar: "#CCBFFF" },
    dark:  { bg: "#1A1035", chrome: "#110A24", sidebar: "#0B0618" },
  },
  {
    id: "plum", label: "Plum",
    light: { bg: "#F3EAFF", chrome: "#DFD0FF", sidebar: "#D3C0FF" },
    dark:  { bg: "#210D33", chrome: "#160822", sidebar: "#0F0516" },
  },
  {
    id: "grape", label: "Grape",
    light: { bg: "#EDE6FF", chrome: "#D5CAFF", sidebar: "#C8BAFF" },
    dark:  { bg: "#1B0F38", chrome: "#110926", sidebar: "#0B0619" },
  },
  {
    id: "mauve", label: "Mauve",
    light: { bg: "#F4EDF8", chrome: "#E2D2EC", sidebar: "#D8C6E4" },
    dark:  { bg: "#22112E", chrome: "#170B1F", sidebar: "#0F0714" },
  },
  // ── Warm ───────────────────────────────────────────────────────────────────
  {
    id: "rose", label: "Rose",
    light: { bg: "#FFF0F2", chrome: "#FFD5DA", sidebar: "#FFC8CE" },
    dark:  { bg: "#2A0E14", chrome: "#1C090D", sidebar: "#120507" },
  },
  {
    id: "crimson", label: "Crimson",
    light: { bg: "#FDEAEC", chrome: "#FAD0D5", sidebar: "#F8BEC4" },
    dark:  { bg: "#2D0A10", chrome: "#1E060A", sidebar: "#140305" },
  },
  {
    id: "amber", label: "Amber",
    light: { bg: "#FFF8E6", chrome: "#FFEDC0", sidebar: "#FFE7AB" },
    dark:  { bg: "#271A00", chrome: "#1A1100", sidebar: "#100A00" },
  },
  {
    id: "caramel", label: "Caramel",
    light: { bg: "#FDF4E8", chrome: "#FAE5C8", sidebar: "#F9DDB6" },
    dark:  { bg: "#2A1600", chrome: "#1C0E00", sidebar: "#110800" },
  },
  // ── Neutrals ───────────────────────────────────────────────────────────────
  {
    id: "cloud", label: "Cloud",
    light: { bg: "#F7F9FC", chrome: "#E4EAEF", sidebar: "#D9E2EA" },
    dark:  { bg: "#10131C", chrome: "#0A0D14", sidebar: "#06080F" },
  },
  {
    id: "ash", label: "Ash",
    light: { bg: "#F2F4F7", chrome: "#DDE2E9", sidebar: "#D1D8E2" },
    dark:  { bg: "#151B25", chrome: "#0D121A", sidebar: "#080C12" },
  },
  {
    id: "stone", label: "Stone",
    light: { bg: "#F4F3F0", chrome: "#E1DFDA", sidebar: "#D6D4CE" },
    dark:  { bg: "#1C1B18", chrome: "#121110", sidebar: "#0B0A09" },
  },
  {
    id: "carbon", label: "Carbon",
    light: { bg: "#F0F0F0", chrome: "#DCDCDC", sidebar: "#D0D0D0" },
    dark:  { bg: "#111111", chrome: "#0A0A0A", sidebar: "#050505" },
  },
  // ── Deep / Bold ────────────────────────────────────────────────────────────
  {
    id: "midnight", label: "Midnight",
    light: { bg: "#EBF0FF", chrome: "#CDDAFF", sidebar: "#BECCFF" },
    dark:  { bg: "#05091F", chrome: "#030614", sidebar: "#02040D" },
  },
  {
    id: "ink", label: "Ink",
    light: { bg: "#ECEEF5", chrome: "#D5D9E9", sidebar: "#C9CDE0" },
    dark:  { bg: "#0C0E1A", chrome: "#07080F", sidebar: "#040509" },
  },
  {
    id: "obsidian", label: "Obsidian",
    light: { bg: "#EEEDF4", chrome: "#D8D6E9", sidebar: "#CCCAE0" },
    dark:  { bg: "#0E0D1A", chrome: "#09080F", sidebar: "#050409" },
  },
  {
    id: "abyss", label: "Abyss",
    light: { bg: "#EAF0F6", chrome: "#CAD9E8", sidebar: "#B8CDE2" },
    dark:  { bg: "#030A12", chrome: "#02070D", sidebar: "#010408" },
  },
  // ── Tinted ─────────────────────────────────────────────────────────────────
  {
    id: "mint", label: "Mint",
    light: { bg: "#E8FBF4", chrome: "#C2F4E3", sidebar: "#ADEFD9" },
    dark:  { bg: "#06201A", chrome: "#041610", sidebar: "#020D09" },
  },
  {
    id: "sky", label: "Sky",
    light: { bg: "#E5F5FF", chrome: "#C0E8FF", sidebar: "#AADFFF" },
    dark:  { bg: "#061B2A", chrome: "#04111C", sidebar: "#020A11" },
  },
  {
    id: "lavender", label: "Lavender",
    light: { bg: "#F2EEFF", chrome: "#DDDAFF", sidebar: "#D1CCFF" },  /* updated chrome */
    dark:  { bg: "#160E2E", chrome: "#0E091F", sidebar: "#080514" },
  },
  {
    id: "blush", label: "Blush",
    light: { bg: "#FFF0F5", chrome: "#FFD5E6", sidebar: "#FFC8DC" },
    dark:  { bg: "#280A15", chrome: "#1A060D", sidebar: "#100308" },
  },
  // ── Extra ──────────────────────────────────────────────────────────────────
  {
    id: "sand", label: "Sand",
    light: { bg: "#FAF6EF", chrome: "#EDE4D5", sidebar: "#E5D9C6" },
    dark:  { bg: "#231D10", chrome: "#17130A", sidebar: "#0E0B05" },
  },
  {
    id: "copper", label: "Copper",
    light: { bg: "#FBF0E8", chrome: "#F3DFCA", sidebar: "#EED5BC" },
    dark:  { bg: "#271308", chrome: "#1A0C04", sidebar: "#100702" },
  },
  {
    id: "moss", label: "Moss",
    light: { bg: "#EDF2E5", chrome: "#D5E3C4", sidebar: "#C8DAB2" },
    dark:  { bg: "#131D0A", chrome: "#0C1306", sidebar: "#070C03" },
  },
  {
    id: "dusk", label: "Dusk",
    light: { bg: "#F0EDF8", chrome: "#DDD8F2", sidebar: "#D2CCF0" },
    dark:  { bg: "#16102B", chrome: "#0E0A1E", sidebar: "#080613" },
  },
];

// LAYOUT_COLOR_PRESETS — colors for the Top Bar + Bottom Navigation bar only
// (both surfaces read tokens.chrome, so one color drives both at once).
// Each preset carries a light-mode and dark-mode shade.
const LAYOUT_COLOR_PRESETS = [
  { id: "slate",    label: "Slate",    light: "#E4E9F2", dark: "#0B1220" },
  { id: "indigo",   label: "Indigo",   light: "#E1E4FB", dark: "#161233" },
  { id: "ocean",    label: "Ocean",    light: "#DCEEFB", dark: "#04202F" },
  { id: "emerald",  label: "Emerald",  light: "#DBF3E6", dark: "#052617" },
  { id: "sunrise",  label: "Sunrise",  light: "#FCE9D8", dark: "#301604" },
  { id: "berry",    label: "Berry",    light: "#F8DEEB", dark: "#2C0A1D" },
  { id: "graphite", label: "Graphite", light: "#E7E7EA", dark: "#141416" },
  { id: "sand",     label: "Sand",     light: "#F3ECDD", dark: "#241D0C" },
  { id: "lagoon",   label: "Lagoon",   light: "#D9F1EF", dark: "#032220" },
];

export default function AppearanceModeSubpage() {
  const { tokens, mode, setMode } = useTheme();
  const { showFeedback } = useFeedback();

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 820 }}>
      <Card padding={22}>
        <SectionHeading tone="blue">Appearance Mode</SectionHeading>
        <div className="flex gap-3 flex-wrap">
          <ModeOption value="light" label="Light" icon={Sun} current={mode} onSelect={(v) => { setMode(v); showFeedback("Light mode activated"); }} />
          <ModeOption value="dark" label="Dark" icon={Moon} current={mode} onSelect={(v) => { setMode(v); showFeedback("Dark mode activated"); }} />
          <ModeOption value="system" label="System" icon={Monitor} current={mode} onSelect={(v) => { setMode(v); showFeedback("System mode activated"); }} />
        </div>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 10 }}>
          "System" follows your device's light/dark preference automatically.
        </p>
      </Card>
    </div>
  );
}

export function CustomBackgroundColorSubpage() {
  const { tokens, mode, customBg, setCustomBackground, restoreDefaultBackground, bgImage, setBackgroundImage, clearBackgroundImage } = useTheme();
  const { showFeedback } = useFeedback();
  const resolvedIsDark = mode === "dark" || (mode === "system" && tokens.isDark);
  const [draftColor, setDraftColor] = useState(customBg || (resolvedIsDark ? DARK_BG_DEFAULT : LIGHT_BG_DEFAULT));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setDraftColor(customBg || (resolvedIsDark ? DARK_BG_DEFAULT : LIGHT_BG_DEFAULT));
  }, [customBg, resolvedIsDark]); // eslint-disable-line

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToCompactDataUrl(file);
      setBackgroundImage(dataUrl);
      showFeedback("Background image applied");
    } catch {
      showFeedback("Couldn't load that image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 820 }}>
      <Card padding={22}>
        <SectionHeading tone="green">Custom Background Color</SectionHeading>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="color"
            value={draftColor}
            onChange={(e) => setDraftColor(e.target.value)}
            style={{
              width: 52, height: 52, borderRadius: 12,
              border: `1px solid ${tokens.border}`, cursor: "pointer", background: "none",
            }}
          />
          <div className="flex-1" style={{ minWidth: 160 }}>
            <FloatingInput
              label="Hex Color"
              value={draftColor}
              onChange={(e) => setDraftColor(e.target.value)}
            />
          </div>
          <div
            className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ width: 90, height: 52, background: draftColor, border: `1px solid ${tokens.border}` }}
          >
            <span style={{ fontSize: 11, fontWeight: 650, color: isDarkColor(draftColor) ? "#fff" : "#111" }}>
              Preview
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button icon={Check} onClick={() => { setCustomBackground(draftColor); showFeedback("Custom theme saved"); }}>
            Apply Color
          </Button>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => { restoreDefaultBackground(); showFeedback("Default theme restored"); }}
          >
            Restore Default
          </Button>
        </div>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 10 }}>
          All text, icons, and input focus colors adapt automatically to stay readable.
        </p>
      </Card>

      {/* Background Image — uploaded from the phone, applied live across
          every page in the app (see pageBgStyle in ThemeProvider). */}
      <Card padding={22}>
        <SectionHeading tone="violet">Background Image</SectionHeading>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: -4, marginBottom: 14 }}>
          Upload a photo from your phone to use as the app's background. It updates instantly across every page.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 90, height: 60, borderRadius: 12,
              border: `1px solid ${tokens.border}`,
              background: bgImage ? `center / cover no-repeat url(${bgImage})` : tokens.surfaceSunken,
              overflow: "hidden",
            }}
          >
            {!bgImage && <ImageIcon size={22} color={tokens.textTertiary} />}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button icon={Upload} onClick={handlePickImage} disabled={uploading}>
              {uploading ? "Uploading…" : bgImage ? "Change Image" : "Upload Image"}
            </Button>
            {bgImage && (
              <Button
                variant="secondary"
                icon={Trash2}
                onClick={() => { clearBackgroundImage(); showFeedback("Background image removed"); }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 10 }}>
          The uploaded image sits above the background color and is cropped to cover each page.
        </p>
      </Card>
    </div>
  );
}

export function LayoutColorSubpage() {
  const { tokens, mode, setLayoutColor, accent } = useTheme();
  const { showFeedback } = useFeedback();
  const resolvedIsDark = mode === "dark" || (mode === "system" && tokens.isDark);
  const blue = accent("blue");

  const applyLayoutColor = (preset) => {
    const hex = resolvedIsDark ? preset.dark : preset.light;
    setLayoutColor(hex);
    showFeedback(`${preset.label} layout color applied`);
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 820 }}>
      {/* Layout Color — sets the Top Bar + Bottom Navigation bar background
          (both surfaces share tokens.chrome, so one pick drives both). */}
      <Card padding={22}>
        <SectionHeading tone="amber">Layout Color</SectionHeading>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: -4, marginBottom: 14 }}>
          Changes the Top Bar and Bottom Navigation bar background together.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {LAYOUT_COLOR_PRESETS.map((preset) => {
            const swatch = resolvedIsDark ? preset.dark : preset.light;
            const isActive = tokens.chrome === swatch;
            return (
              <button
                key={preset.id}
                title={preset.label}
                onClick={() => applyLayoutColor(preset)}
                className="flex flex-col items-center gap-2 rounded-xl"
                style={{
                  padding: "12px 10px",
                  background: tokens.surfaceSunken,
                  border: `1.5px solid ${isActive ? blue : tokens.border}`,
                  boxShadow: isActive ? `0 0 0 3px ${withAlpha(blue, 0.18)}` : "none",
                  cursor: "pointer",
                  transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                  position: "relative",
                }}
              >
                {isActive && (
                  <span
                    className="flex items-center justify-center rounded-full"
                    style={{
                      position: "absolute", top: 6, right: 6, width: 18, height: 18,
                      background: blue, flexShrink: 0,
                    }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </span>
                )}
                <span
                  style={{
                    width: "100%", height: 40, borderRadius: 8, flexShrink: 0,
                    background: swatch,
                    border: `1px solid ${tokens.borderStrong}`,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
                  }}
                />
                <span style={{ fontSize: 12.5, fontWeight: 580, color: tokens.textPrimary, lineHeight: 1.2, textAlign: "center" }}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function AppLogoSubpage() {
  const { tokens, appLogo, setAppLogo, clearAppLogo, logoRadiusFraction, accent } = useTheme();
  const { showFeedback } = useFeedback();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const blue = accent("blue");
  const previewSize = 64;

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToLogoDataUrl(file, 512);
      const radiusFraction = await detectLogoCornerRadius(dataUrl);
      setAppLogo(dataUrl, radiusFraction);
      showFeedback("App logo updated");
    } catch {
      showFeedback("Couldn't load that image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 820 }}>
      <Card padding={22}>
        <SectionHeading tone="blue">App Logo</SectionHeading>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: -4, marginBottom: 14 }}>
          Upload a logo from your phone to replace the default app icon in the sidebar and login screen. The frame automatically matches your logo's own corners — square, rounded, or fully circular.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: previewSize, height: previewSize,
              borderRadius: appLogo ? logoFrameRadius(logoRadiusFraction, previewSize) : 16,
              background: appLogo ? "transparent" : blue,
              border: `1px solid ${tokens.border}`,
              overflow: "hidden",
              transition: "border-radius 200ms ease",
            }}
          >
            {appLogo ? (
              <img src={appLogo} alt="App logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Route size={28} color="#fff" strokeWidth={2.25} />
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button icon={Upload} onClick={handlePickImage} disabled={uploading}>
              {uploading ? "Uploading…" : appLogo ? "Change Logo" : "Upload Logo"}
            </Button>
            {appLogo && (
              <Button
                variant="secondary"
                icon={Trash2}
                onClick={() => { clearAppLogo(); showFeedback("App logo removed"); }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 10 }}>
          Applies instantly across the app — no restart needed. A square image works best.
        </p>
      </Card>
    </div>
  );
}

export function ThemeSettingsSubpage() {
  const { tokens, mode, customBg, setPresetPalette, accent } = useTheme();
  const { showFeedback } = useFeedback();
  const resolvedIsDark = mode === "dark" || (mode === "system" && tokens.isDark);
  const blue = accent("blue");

  const applyPreset = (preset) => {
    // Use setPresetPalette so bg, chrome, and sidebar each get their own
    // distinct color — not the same hex for all three.
    const palette = resolvedIsDark ? preset.dark : preset.light;
    setPresetPalette(palette);
    showFeedback(`${preset.label} theme applied`);
  };

  // Active bg to detect which preset is currently applied.
  const activeColor = customBg || (resolvedIsDark ? DARK_BG_DEFAULT : LIGHT_BG_DEFAULT);

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 820 }}>
      {/* Preset palette grid — 3 columns */}
      <Card padding={22}>
        <SectionHeading tone="violet">Preset Color Themes</SectionHeading>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {THEME_PRESETS.map((preset) => {
            const swatch = resolvedIsDark ? preset.dark : preset.light;
            // Active when the current bg matches this preset's bg color
            const isActive = activeColor === swatch.bg;
            return (
              <button
                key={preset.id}
                title={preset.label}
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center gap-2 rounded-xl"
                style={{
                  padding: "12px 10px",
                  background: tokens.surfaceSunken,
                  border: `1.5px solid ${isActive ? blue : tokens.border}`,
                  boxShadow: isActive ? `0 0 0 3px ${withAlpha(blue, 0.18)}` : "none",
                  cursor: "pointer",
                  transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                  position: "relative",
                }}
              >
                {isActive && (
                  <span
                    className="flex items-center justify-center rounded-full"
                    style={{
                      position: "absolute", top: 6, right: 6, width: 18, height: 18,
                      background: blue, flexShrink: 0,
                    }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </span>
                )}
                {/* Three-segment color swatch, above the label */}
                <span
                  style={{
                    width: "100%", height: 40, borderRadius: 8, flexShrink: 0,
                    overflow: "hidden",
                    border: `1px solid ${tokens.borderStrong}`,
                    display: "flex",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  <span style={{ flex: 1, background: swatch.bg }} />
                  <span style={{ flex: 1, background: swatch.chrome }} />
                  <span style={{ flex: 1, background: swatch.sidebar }} />
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 580, color: tokens.textPrimary, lineHeight: 1.2, textAlign: "center" }}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

