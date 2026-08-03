import React, {
  createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef,
} from "react";
import {
  LayoutDashboard, Truck, UserSquare2, Users, Route, CalendarCheck, Receipt,
  Wallet, Fuel, Wrench, BarChart3, Bell, Settings as SettingsIcon, ChevronLeft,
  ChevronRight, Menu, Sun, Moon, Monitor, X, Search, Plus, TrendingUp,
  TrendingDown, RotateCcw, Check, ChevronDown, Home, CreditCard, User,
  Trash2, Navigation, FolderOpen, Phone, SlidersHorizontal, UserPlus,
  UserCheck, PiggyBank, CircleDollarSign, HeartHandshake, HandCoins,
  LifeBuoy, MessageCircle, Palette, FileEdit, FileText, ShieldCheck,
  Flag, Globe, Landmark, Package, PackageCheck, LogOut, Lock, Mail,
  Upload, Image as ImageIcon, Building2, Fingerprint, Banknote,
} from "lucide-react";

/* ============================================================================
   COLOR SYSTEM — single source of truth. Every surface, border, and text
   color in the app is derived from the active background color, so contrast
   is guaranteed no matter what the user picks.
============================================================================ */

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const h = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function isDarkColor(hex) {
  try {
    return relativeLuminance(hexToRgb(hex)) < 0.5;
  } catch {
    return false;
  }
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Floating-label text style: first letter capitalized, everything else
// lowercase — e.g. "Company Name" → "Company name". Applied at render time
// so the underlying label strings (used elsewhere as titles, headings,
// success messages, etc.) stay unchanged; only what's shown inside the
// floating-label fields is affected.
function toSentenceCase(str) {
  if (!str) return str;
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Reads an uploaded image file and returns a compact base64 data URL,
// downscaling large photos so they stay well under storage limits.
function fileToCompactDataUrl(file, maxDimension = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Reads an uploaded logo file as PNG (keeps transparency — needed both for
// a clean look and so detectLogoCornerRadius() can read the alpha channel),
// downscaled to keep storage small.
function fileToLogoDataUrl(file, maxDimension = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Auto-detects how "rounded" an uploaded logo's corners already are by
// reading its alpha channel, so the frame around it can match automatically
// — a square logo gets a square-ish frame, a circular logo gets a circular
// frame, a pill/rounded logo gets a matching rounded frame. Returns a
// fraction 0 (sharp corners) .. 0.5 (full circle).
function detectLogoCornerRadius(dataUrl) {
  return new Promise((resolve) => {
    const img = new window.Image();
    const fallback = () => resolve(0.28); // sensible rounded-square default
    img.onerror = fallback;
    img.onload = () => {
      try {
        const size = 128; // fixed analysis resolution — fast and consistent
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const alphaAt = (x, y) => data[(y * size + x) * 4 + 3];

        // No meaningful transparency anywhere → treat as a solid rectangle.
        let hasAlpha = false;
        for (let i = 3; i < data.length; i += 4 * 41) {
          if (data[i] < 250) { hasAlpha = true; break; }
        }
        if (!hasAlpha) { resolve(0); return; }

        const half = size / 2;
        const corners = [
          { ox: 0,        oy: 0,        dx: 1,  dy: 1  }, // top-left
          { ox: size - 1, oy: 0,        dx: -1, dy: 1  }, // top-right
          { ox: 0,        oy: size - 1, dx: 1,  dy: -1 }, // bottom-left
          { ox: size - 1, oy: size - 1, dx: -1, dy: -1 }, // bottom-right
        ];
        const threshold = 128;
        const radii = corners.map(({ ox, oy, dx, dy }) => {
          let t = 0;
          for (; t < half; t++) {
            const x = ox + dx * t;
            const y = oy + dy * t;
            if (alphaAt(x, y) >= threshold) break;
          }
          // Convert the diagonal offset where opacity begins into an
          // equivalent orthogonal corner radius (geometry of a circular
          // corner crossed along its 45° diagonal).
          const r = t / 0.2929;
          return Math.min(r, half);
        });
        const avgR = radii.reduce((a, b) => a + b, 0) / radii.length;
        resolve(Math.max(0, Math.min(0.5, avgR / size)));
      } catch {
        fallback();
      }
    };
    img.src = dataUrl;
  });
}

// Converts a detected radius fraction (0..0.5) into a CSS border-radius for
// a frame of a given pixel size — snaps to a perfect circle near the top.
function logoFrameRadius(fraction, sizePx) {
  if (fraction >= 0.47) return "50%";
  return Math.round(fraction * sizePx);
}

const LIGHT_BG_DEFAULT = "#F1F4F9";
// Global dark-mode base color. Every dark-mode surface in the app — main
// background, sidebar, top bar, cards, dialogs, tables — is derived from
// this single value via buildTokens(), so switching to dark mode applies it
// everywhere consistently, not just on one type of card.
const DARK_BG_DEFAULT = "#002843";

const BRAND = {
  blue: { base: "#2F6FED", dark: "#6C97F5" },
  green: { base: "#159A73", dark: "#3ED9A6" },
  amber: { base: "#DA8A1F", dark: "#F3B65E" },
  red: { base: "#E1444B", dark: "#FF7A7F" },
  violet: { base: "#7C5CF0", dark: "#A796FF" },
  teal: { base: "#0E9E9C", dark: "#4EE0DC" },
};

function accentColor(name, isDark) {
  return isDark ? BRAND[name].dark : BRAND[name].base;
}

function buildTokens(bgHex, chromeHex, sidebarHex, modeIsDark) {
  const dark = modeIsDark;
  const bgDark     = isDarkColor(bgHex);
  const chromeDark = isDarkColor(chromeHex);

  const cardSurface      = dark ? mix(DARK_BG_DEFAULT, "#FFFFFF", 0.07) : "#FFFFFF";
  const cardSurfaceRaised = dark ? mix(DARK_BG_DEFAULT, "#FFFFFF", 0.11) : "#FFFFFF";
  // inputBg = exact same solid color as the card surface.
  const inputBg = cardSurface;

  return {
    isDark: dark,
    isBgDark: bgDark,
    // ── Page background ──────────────────────────────────────────────────────
    bg: bgHex,
    // ── Card / dialog / table surfaces (fixed, not hue-shifted by custom bg) ─
    surface: cardSurface,
    surfaceRaised: cardSurfaceRaised,
    surfaceSunken: dark ? mix(bgHex, "#000000", 0.18) : mix(bgHex, "#000000", 0.02),
    inputBg,
    // ── Header (top app bar) — its own distinct color ────────────────────────
    chrome: chromeHex,
    chromeDark,
    // ── Sidebar / nav drawer — its own distinct color ────────────────────────
    sidebarChrome: sidebarHex,
    // ── Borders derived from card surface (light/dark mode) ──────────────────
    border:       dark ? "rgba(255,255,255,0.10)" : "rgba(16,24,40,0.09)",
    borderStrong: dark ? "rgba(255,255,255,0.18)" : "rgba(16,24,40,0.16)",
    divider:      dark ? "rgba(255,255,255,0.08)" : "rgba(16,24,40,0.07)",
    // ── Borders derived from live bg color (for surfaces on the bg itself) ───
    bgBorder:       bgDark ? "rgba(255,255,255,0.10)" : "rgba(16,24,40,0.09)",
    bgBorderStrong: bgDark ? "rgba(255,255,255,0.18)" : "rgba(16,24,40,0.16)",
    bgDivider:      bgDark ? "rgba(255,255,255,0.08)" : "rgba(16,24,40,0.07)",
    // ── Borders for chrome / header surface ──────────────────────────────────
    chromeBorder: chromeDark ? "rgba(255,255,255,0.12)" : "rgba(16,24,40,0.10)",
    // ── Text on card surfaces ─────────────────────────────────────────────────
    textPrimary:   dark ? "#F4F6FA" : "#141924",
    textSecondary: dark ? "rgba(244,246,250,0.64)" : "rgba(20,25,36,0.60)",
    textTertiary:  dark ? "rgba(244,246,250,0.42)" : "rgba(20,25,36,0.40)",
    // ── Text on page bg ───────────────────────────────────────────────────────
    bgTextPrimary:   bgDark ? "#F4F6FA" : "#141924",
    bgTextSecondary: bgDark ? "rgba(244,246,250,0.64)" : "rgba(20,25,36,0.60)",
    bgTextTertiary:  bgDark ? "rgba(244,246,250,0.42)" : "rgba(20,25,36,0.40)",
    // ── Text on chrome / header surface ──────────────────────────────────────
    chromeTextPrimary:   chromeDark ? "#F4F6FA" : "#141924",
    chromeTextSecondary: chromeDark ? "rgba(244,246,250,0.64)" : "rgba(20,25,36,0.60)",
    chromeTextTertiary:  chromeDark ? "rgba(244,246,250,0.42)" : "rgba(20,25,36,0.40)",
    // ── Shadows ───────────────────────────────────────────────────────────────
    shadow:   dark ? "0 10px 28px rgba(0,0,0,0.45)" : "0 10px 28px rgba(16,24,40,0.09)",
    shadowSm: dark ? "0 3px 10px rgba(0,0,0,0.35)" : "0 3px 10px rgba(16,24,40,0.07)",
    overlay: "rgba(8,10,16,0.55)",
    hoverTint:  dark ? "rgba(255,255,255,0.06)" : "rgba(16,24,40,0.045)",
    activeTint: dark ? "rgba(255,255,255,0.10)" : "rgba(16,24,40,0.07)",
  };
}

/* ============================================================================
   THEME PROVIDER — mode (light / dark / system) + optional custom background,
   persisted via the artifact storage API.
============================================================================ */

const ThemeContext = createContext(null);
export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "tms-theme-settings-v1";
const APP_LOGO_STORAGE_KEY = "tms-app-logo-v1";
const BG_IMAGE_STORAGE_KEY = "tms-bg-image-v1";

function useSystemPrefersDark() {
  const [prefersDark, setPrefersDark] = useState(
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setPrefersDark(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return prefersDark;
}

function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  // Each mode stores three separate colors: bg, chrome (header), sidebar.
  // Stored as { bg, chrome, sidebar } objects, null = use default.
  const [paletteLight, setPaletteLight] = useState(null);
  const [paletteDark,  setPaletteDark]  = useState(null);

  // App Logo — a single base64 data URL, applied everywhere the brand mark
  // is shown (Sidebar header, Login screen). null = use default Route icon.
  const [appLogo, setAppLogoState] = useState(null);
  // Auto-detected from the logo's own alpha channel — see
  // detectLogoCornerRadius(). Drives the frame's border-radius so it always
  // matches whatever shape the uploaded logo already has.
  const [logoRadiusFraction, setLogoRadiusFraction] = useState(0.28);

  // Background Image — a single base64 data URL layered under every page
  // background surface. null = use the plain background color only.
  const [bgImage, setBgImageState] = useState(null);

  const [loaded, setLoaded] = useState(false);
  const systemPrefersDark = useSystemPrefersDark();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage?.get(STORAGE_KEY, false);
        if (!cancelled && res?.value) {
          const parsed = JSON.parse(res.value);
          if (parsed.mode) setMode(parsed.mode);
          // New format: paletteLight / paletteDark
          if (parsed.paletteLight) setPaletteLight(parsed.paletteLight);
          if (parsed.paletteDark)  setPaletteDark(parsed.paletteDark);
          // Legacy migration: single customBg → bg only, no chrome/sidebar
          else if (parsed.customBgLight) setPaletteLight({ bg: parsed.customBgLight, chrome: null, sidebar: null });
          else if (parsed.customBgDark)  setPaletteDark({ bg: parsed.customBgDark, chrome: null, sidebar: null });
        }
      } catch { /* no saved settings */ }
      try {
        const logoRes = await window.storage?.get(APP_LOGO_STORAGE_KEY, false);
        if (!cancelled && logoRes?.value) {
          try {
            const parsedLogo = JSON.parse(logoRes.value);
            setAppLogoState(parsedLogo.dataUrl || null);
            if (typeof parsedLogo.radiusFraction === "number") setLogoRadiusFraction(parsedLogo.radiusFraction);
          } catch {
            // Legacy format: value was the raw data URL string.
            setAppLogoState(logoRes.value);
          }
        }
      } catch { /* no saved logo */ }
      try {
        const bgImgRes = await window.storage?.get(BG_IMAGE_STORAGE_KEY, false);
        if (!cancelled && bgImgRes?.value) setBgImageState(bgImgRes.value);
      } catch { /* no saved background image */ }
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage?.set(STORAGE_KEY, JSON.stringify({ mode, paletteLight, paletteDark }), false);
      } catch { /* best-effort */ }
    })();
  }, [mode, paletteLight, paletteDark, loaded]);

  const resolvedModeIsDark = mode === "system" ? systemPrefersDark : mode === "dark";
  const activePalette = resolvedModeIsDark ? paletteDark : paletteLight;

  // Resolve each of the three surfaces, falling back to defaults.
  const activeBg     = activePalette?.bg     || (resolvedModeIsDark ? DARK_BG_DEFAULT  : LIGHT_BG_DEFAULT);
  const activeChrome = activePalette?.chrome  || activeBg;
  const activeSidebar= activePalette?.sidebar || activeBg;

  const tokens = useMemo(
    () => buildTokens(activeBg, activeChrome, activeSidebar, resolvedModeIsDark),
    [activeBg, activeChrome, activeSidebar, resolvedModeIsDark]
  );

  // setCustomBackground: accepts a single bg hex (custom picker).
  // Derives distinct chrome and sidebar shades from it so all three surfaces
  // have related but visibly different colors, matching the preset behavior.
  const setCustomBackground = useCallback((hex) => {
    const setter = resolvedModeIsDark ? setPaletteDark : setPaletteLight;
    // For dark mode: darken toward black; for light mode: darken slightly.
    const chromeMix = resolvedModeIsDark ? 0.20 : 0.08;
    const sidebarMix = resolvedModeIsDark ? 0.35 : 0.14;
    const chrome  = mix(hex, resolvedModeIsDark ? "#000000" : "#000000", chromeMix);
    const sidebar = mix(hex, resolvedModeIsDark ? "#000000" : "#000000", sidebarMix);
    setter({ bg: hex, chrome, sidebar });
  }, [resolvedModeIsDark]);

  // setPresetPalette: accepts the full { bg, chrome, sidebar } preset object.
  const setPresetPalette = useCallback(({ bg, chrome, sidebar }) => {
    const setter = resolvedModeIsDark ? setPaletteDark : setPaletteLight;
    setter({ bg, chrome, sidebar });
  }, [resolvedModeIsDark]);

  // setLayoutColor: updates ONLY the chrome color (shared by the Top Bar and
  // the Bottom Navigation bar, since both read tokens.chrome). bg and
  // sidebar are left untouched.
  const setLayoutColor = useCallback((hex) => {
    const setter = resolvedModeIsDark ? setPaletteDark : setPaletteLight;
    setter((prev) => {
      const bg = prev?.bg || (resolvedModeIsDark ? DARK_BG_DEFAULT : LIGHT_BG_DEFAULT);
      const sidebar = prev?.sidebar || null;
      return { bg, chrome: hex, sidebar };
    });
  }, [resolvedModeIsDark]);

  const restoreDefaultBackground = useCallback(() => {
    const setter = resolvedModeIsDark ? setPaletteDark : setPaletteLight;
    setter(null);
  }, [resolvedModeIsDark]);

  // setAppLogo / clearAppLogo — persist the uploaded logo data URL together
  // with its auto-detected corner-radius fraction (see detectLogoCornerRadius)
  // so it survives reloads, and update state immediately so every consumer
  // (Sidebar, Login screen) re-renders with the new logo + matching frame
  // shape right away.
  const setAppLogo = useCallback((dataUrl, radiusFraction = 0.28) => {
    setAppLogoState(dataUrl);
    setLogoRadiusFraction(radiusFraction);
    (async () => {
      try {
        await window.storage?.set(
          APP_LOGO_STORAGE_KEY,
          JSON.stringify({ dataUrl, radiusFraction }),
          false
        );
      } catch { /* best-effort */ }
    })();
  }, []);

  const clearAppLogo = useCallback(() => {
    setAppLogoState(null);
    setLogoRadiusFraction(0.28);
    (async () => {
      try { await window.storage?.delete(APP_LOGO_STORAGE_KEY, false); } catch { /* best-effort */ }
    })();
  }, []);

  // setBackgroundImage / clearBackgroundImage — same pattern, drives the
  // page-background image layered under every page in the app.
  const setBackgroundImage = useCallback((dataUrl) => {
    setBgImageState(dataUrl);
    (async () => {
      try { await window.storage?.set(BG_IMAGE_STORAGE_KEY, dataUrl, false); } catch { /* best-effort */ }
    })();
  }, []);

  const clearBackgroundImage = useCallback(() => {
    setBgImageState(null);
    (async () => {
      try { await window.storage?.delete(BG_IMAGE_STORAGE_KEY, false); } catch { /* best-effort */ }
    })();
  }, []);

  // customBg exposed for backwards compat (settings page uses it to init draft)
  const customBg = activePalette?.bg || null;

  // pageBgStyle — spread this onto any full-page background surface so the
  // uploaded Background Image (if any) shows through consistently across
  // every page; falls back to the plain background color otherwise.
  const pageBgStyle = bgImage
    ? {
        backgroundColor: tokens.bg,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { background: tokens.bg };

  const value = useMemo(() => ({
    mode, setMode, tokens, customBg,
    setCustomBackground, setPresetPalette, setLayoutColor, restoreDefaultBackground,
    appLogo, setAppLogo, clearAppLogo, logoRadiusFraction,
    bgImage, setBackgroundImage, clearBackgroundImage, pageBgStyle,
    accent: (name) => accentColor(name, tokens.isDark),
  }), [mode, tokens, customBg, setCustomBackground, setPresetPalette, setLayoutColor, restoreDefaultBackground,
      appLogo, setAppLogo, clearAppLogo, logoRadiusFraction, bgImage, setBackgroundImage, clearBackgroundImage, pageBgStyle]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={{
          ...pageBgStyle,
          color: tokens.bgTextPrimary,
          minHeight: "100%",
          transition: "background-color 260ms ease, color 260ms ease",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/* ============================================================================
   GLOBAL FEEDBACK SYSTEM — iOS-style confirmation HUD. Call showFeedback()
   from anywhere in the app after a create / update / delete action and a
   card drops into the center of the screen: a ring spins while the action
   settles, then a checkmark draws itself live inside that same ring, then
   the whole card fades back out. The full screen behind it dims and blurs
   for as long as the card is visible. Fully global — mounted once at the
   app root, driven by React context, so any component can trigger it.
============================================================================ */

const FeedbackContext = createContext(null);
function useFeedback() {
  return useContext(FeedbackContext);
}

const FEEDBACK_SPIN_MS = 650;   // ring spins before resolving to a check
const FEEDBACK_HOLD_MS = 900;   // check stays visible before closing
const FEEDBACK_EXIT_MS = 280;   // fade / scale out duration

function FeedbackRing({ phase }) {
  const { tokens, accent } = useTheme();
  const green = accent("green");
  const track = withAlpha(green, tokens.isDark ? 0.24 : 0.16);
  return (
    <span style={{ position: "relative", width: 52, height: 52, flexShrink: 0, display: "inline-block" }}>
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: "absolute", inset: 0 }}>
        <circle cx="26" cy="26" r="20" fill="none" stroke={track} strokeWidth="4.5" />
        {phase === "spinning" ? (
          <circle
            cx="26" cy="26" r="20" fill="none" stroke={green} strokeWidth="4.5" strokeLinecap="round"
            strokeDasharray="31 95"
            style={{ transformOrigin: "26px 26px", animation: "tms-feedback-spin 0.8s linear infinite" }}
          />
        ) : (
          <circle cx="26" cy="26" r="20" fill="none" stroke={green} strokeWidth="4.5" strokeLinecap="round" />
        )}
      </svg>
      {phase === "success" && (
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: "absolute", inset: 0 }}>
          <polyline
            points="15.7,26.9 22.2,33.4 36.3,17.7"
            fill="none" stroke={green} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
              strokeDasharray: 31,
              strokeDashoffset: 31,
              animation: "tms-feedback-tick 0.32s ease-out 0.05s forwards",
            }}
          />
        </svg>
      )}
    </span>
  );
}

function FeedbackHUD({ state }) {
  const { tokens } = useTheme();
  const { visible, message, phase } = state;
  return (
    <>
      {/* Full-screen dim + blur behind the card while it's up */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 190,
          backdropFilter: visible ? "blur(6px)" : "blur(0px)",
          WebkitBackdropFilter: visible ? "blur(6px)" : "blur(0px)",
          background: visible ? "rgba(8,10,16,0.22)" : "rgba(8,10,16,0)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: `opacity ${FEEDBACK_EXIT_MS}ms ease, background-color ${FEEDBACK_EXIT_MS}ms ease`,
        }}
      />
      {/* Centered result card — the ring/tick and message render on top of it */}
      <div
        aria-live="polite"
        style={{
          position: "fixed", top: "50%", left: "50%", zIndex: 200,
          transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.92)",
          opacity: visible ? 1 : 0,
          pointerEvents: "none",
          transition: `opacity ${FEEDBACK_EXIT_MS}ms ease, transform ${FEEDBACK_EXIT_MS}ms cubic-bezier(.2,.8,.2,1)`,
        }}
      >
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-3xl"
          style={{
            width: 280, minHeight: 208,
            padding: "34px 36px",
            background: tokens.surfaceRaised,
            border: `1px solid ${tokens.borderStrong}`,
            boxShadow: tokens.shadow,
          }}
        >
          <FeedbackRing phase={phase} />
          <span style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary, textAlign: "center", lineHeight: 1.4 }}>
            {message}
          </span>
        </div>
      </div>
    </>
  );
}

function FeedbackProvider({ children }) {
  const [state, setState] = useState({ visible: false, message: "", phase: "spinning" });
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // Any component in the tree calls showFeedback("Vehicle added") and this
  // drives the whole spin → tick → close sequence globally.
  const showFeedback = useCallback((message) => {
    clearTimers();
    setState({ visible: true, message, phase: "spinning" });
    timers.current.push(setTimeout(() => {
      setState((s) => ({ ...s, phase: "success" }));
    }, FEEDBACK_SPIN_MS));
    timers.current.push(setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, FEEDBACK_SPIN_MS + FEEDBACK_HOLD_MS));
  }, []);

  useEffect(() => clearTimers, []);

  const value = useMemo(() => ({ showFeedback }), [showFeedback]);

  return (
    <FeedbackContext.Provider value={value}>
      <style>{`
        @keyframes tms-feedback-spin { to { transform: rotate(360deg); } }
        @keyframes tms-feedback-tick { to { stroke-dashoffset: 0; } }
      `}</style>
      {children}
      <FeedbackHUD state={state} />
    </FeedbackContext.Provider>
  );
}

/* ============================================================================
   GLOBAL CONFIRMATION DIALOG — one reusable iOS-style Yes/No dialog for the
   entire app (Exit, Logout, and anything added later). Any component calls
   useConfirmDialog().confirm({ title, message }) and awaits a boolean; the
   design, animation, and blur behavior live here ONCE, so no page ever needs
   to build or style its own confirmation dialog.
============================================================================ */

const ConfirmDialogContext = createContext(null);
function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}

const CONFIRM_ANIM_MS = 240;

function ConfirmDialogHUD({ state, onYes, onNo }) {
  const { tokens, accent } = useTheme();
  const { visible, title, message, confirmLabel, cancelLabel, danger } = state;
  const [yesPressed, setYesPressed] = useState(false);
  const [noPressed, setNoPressed] = useState(false);

  return (
    <>
      {/* Backdrop — soft blur, background still faintly visible underneath,
          fades/blurs in and out in lockstep with the card. */}
      <div
        aria-hidden
        onClick={onNo}
        style={{
          position: "fixed", inset: 0, zIndex: 280,
          backdropFilter: visible ? "blur(10px)" : "blur(0px)",
          WebkitBackdropFilter: visible ? "blur(10px)" : "blur(0px)",
          background: visible ? "rgba(8,10,16,0.34)" : "rgba(8,10,16,0)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: `opacity ${CONFIRM_ANIM_MS}ms ease, background-color ${CONFIRM_ANIM_MS}ms ease, backdrop-filter ${CONFIRM_ANIM_MS}ms ease`,
        }}
      />
      {/* Card — fade + scale, same easing as the rest of the app's motion */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="tms-confirm-title"
        aria-describedby="tms-confirm-message"
        style={{
          position: "fixed", top: "50%", left: "50%", zIndex: 290,
          width: "min(320px, calc(100vw - 40px))",
          transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.88)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: `opacity ${CONFIRM_ANIM_MS}ms cubic-bezier(.2,.8,.2,1), transform ${CONFIRM_ANIM_MS}ms cubic-bezier(.2,.8,.2,1)`,
        }}
      >
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            background: tokens.surfaceRaised,
            border: `1px solid ${tokens.borderStrong}`,
            boxShadow: tokens.shadow,
          }}
        >
          <div style={{ padding: "22px 22px 18px", textAlign: "center" }}>
            <div id="tms-confirm-title" style={{ fontSize: 16.5, fontWeight: 700, color: tokens.textPrimary, letterSpacing: "-0.01em" }}>
              {title}
            </div>
            <div id="tms-confirm-message" style={{ fontSize: 13.5, color: tokens.textSecondary, marginTop: 7, lineHeight: 1.45 }}>
              {message}
            </div>
          </div>
          <div style={{ display: "flex", borderTop: `1px solid ${tokens.divider}` }}>
            <button
              type="button"
              onClick={onNo}
              onMouseDown={() => setNoPressed(true)}
              onMouseUp={() => setNoPressed(false)}
              onMouseLeave={() => setNoPressed(false)}
              style={{
                flex: 1, padding: "13px 0", fontSize: 15, fontWeight: 500,
                color: tokens.textPrimary,
                borderRight: `1px solid ${tokens.divider}`,
                background: noPressed ? tokens.hoverTint : "transparent",
                transition: "background-color 120ms ease",
                cursor: "pointer",
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onYes}
              onMouseDown={() => setYesPressed(true)}
              onMouseUp={() => setYesPressed(false)}
              onMouseLeave={() => setYesPressed(false)}
              style={{
                flex: 1, padding: "13px 0", fontSize: 15, fontWeight: 700,
                color: danger ? accent("red") : accent("blue"),
                background: yesPressed ? tokens.hoverTint : "transparent",
                transition: "background-color 120ms ease",
                cursor: "pointer",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState({
    visible: false, title: "", message: "",
    confirmLabel: "Yes", cancelLabel: "No", danger: false,
  });
  // Holds the Promise resolver for whichever confirm() call is currently
  // showing, so Yes/No can settle it and the caller's `await` continues.
  const resolverRef = useRef(null);

  // The single global entry point: useConfirmDialog().confirm({...}) shows
  // the dialog and resolves true (Yes) / false (No) — every confirmation
  // anywhere in the app (Exit, Logout, future ones) goes through this same
  // function, so behavior can never drift page to page.
  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        visible: true,
        title: opts.title || "",
        message: opts.message || "",
        confirmLabel: opts.confirmLabel || "Yes",
        cancelLabel: opts.cancelLabel || "No",
        danger: !!opts.danger,
      });
    });
  }, []);

  const settle = useCallback((result) => {
    setState((s) => ({ ...s, visible: false }));
    const resolve = resolverRef.current;
    resolverRef.current = null;
    if (resolve) resolve(result);
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <ConfirmDialogHUD state={state} onYes={() => settle(true)} onNo={() => settle(false)} />
    </ConfirmDialogContext.Provider>
  );
}

// Global "Exit Application" guard — intercepts the Back gesture (browser
// Back button / Android hardware back inside a WebView) on EVERY screen,
// Login included, and routes it through the exact same confirm() dialog
// used for Logout. A sentinel history entry is (re)seeded so Back never
// silently leaves the app; only a confirmed "Yes" is allowed to proceed.
function useExitGuard() {
  const { confirm } = useConfirmDialog();
  const guardingRef = useRef(false);

  useEffect(() => {
    // Some preview/sandboxed environments (e.g. an iframe without
    // same-origin permissions) throw a SecurityError on pushState. That
    // throw was previously unguarded, so it crashed the whole React tree
    // on mount — which is what made the Login button (and everything
    // else) appear dead. Guard it: if the History API isn't usable here,
    // just skip the back-button guard instead of taking the app down.
    const seedGuard = () => {
      try {
        window.history.pushState({ tmsExitGuard: true }, "");
        return true;
      } catch {
        return false;
      }
    };

    if (!seedGuard()) return;

    const handlePopState = async () => {
      if (guardingRef.current) return;
      guardingRef.current = true;
      const confirmed = await confirm({
        title: "Exit Application",
        message: "Are you sure you want to exit the application?",
      });
      guardingRef.current = false;
      if (confirmed) {
        // Browsers only permit window.close() on tabs opened by script;
        // where that's blocked (a browser security restriction, not
        // something this app can override), the guard below is simply not
        // re-seeded, so the very next native Back press exits normally.
        try { window.close(); } catch { /* not permitted here — ignore */ }
      } else {
        seedGuard();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [confirm]);
}

/* ============================================================================
   REUSABLE PRIMITIVES
============================================================================ */

const ICON = 18;

function Card({ children, style, padding = 20, hoverable = false, className = "" }) {
  const { tokens } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`rounded-2xl ${className}`}
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: tokens.surface,
        border: `1px solid ${hover ? tokens.borderStrong : tokens.border}`,
        boxShadow: hover ? tokens.shadow : tokens.shadowSm,
        padding,
        transition: "box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({
  children, onClick, variant = "primary", size = "md", icon: Icon, disabled, type = "button", full,
}) {
  const { tokens, accent } = useTheme();
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const blue = accent("blue");

  const sizes = {
    sm: { padY: 6, padX: 12, font: 13 },
    md: { padY: 9, padX: 16, font: 14 },
    lg: { padY: 12, padX: 20, font: 15 },
  }[size];

  const palette = {
    primary: {
      bg: blue, bgHover: mix(blue, "#000000", 0.12), text: "#FFFFFF", border: "transparent",
    },
    secondary: {
      bg: tokens.surfaceRaised, bgHover: tokens.hoverTint, text: tokens.textPrimary, border: tokens.borderStrong,
    },
    ghost: {
      bg: "transparent", bgHover: tokens.hoverTint, text: tokens.textSecondary, border: "transparent",
    },
    danger: {
      bg: accent("red"), bgHover: mix(accent("red"), "#000000", 0.12), text: "#FFFFFF", border: "transparent",
    },
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      className="inline-flex items-center justify-center gap-2 rounded-xl font-medium select-none"
      style={{
        background: hover && !disabled ? palette.bgHover : palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        padding: `${sizes.padY}px ${sizes.padX}px`,
        fontSize: sizes.font,
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: active && !disabled ? "scale(0.97)" : "scale(1)",
        transition: "background-color 160ms ease, transform 120ms ease, opacity 160ms ease",
        boxShadow: variant === "primary" && !disabled ? `0 4px 12px ${withAlpha(blue, 0.28)}` : "none",
      }}
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  );
}

function IconButton({ icon: Icon, onClick, label, active, onLiveBg = false }) {
  const { tokens } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center justify-center rounded-xl"
      style={{
        width: 38, height: 38,
        background: active ? tokens.activeTint : hover ? tokens.hoverTint : "transparent",
        color: onLiveBg ? tokens.bgTextSecondary : tokens.textSecondary,
        border: `1px solid ${active || hover ? (onLiveBg ? tokens.bgBorder : tokens.border) : "transparent"}`,
        transition: "background-color 160ms ease, border-color 160ms ease",
        cursor: "pointer",
      }}
    >
      <Icon size={ICON} strokeWidth={2} />
    </button>
  );
}

function Badge({ children, tone = "blue" }) {
  const { accent } = useTheme();
  const color = accent(tone);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        background: withAlpha(color, 0.14),
        color,
        padding: "3px 10px",
        fontSize: 12.5,
        lineHeight: "18px",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {children}
    </span>
  );
}

function Dot({ tone = "blue", size = 8 }) {
  const { accent } = useTheme();
  return (
    <span
      style={{
        display: "inline-block", width: size, height: size, borderRadius: 999,
        background: accent(tone), flexShrink: 0,
      }}
    />
  );
}

function SectionHeading({ tone = "blue", children, action }) {
  const { tokens } = useTheme();
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <Dot tone={tone} size={9} />
        <h2 style={{ fontSize: 15.5, fontWeight: 650, color: tokens.textPrimary, letterSpacing: "-0.01em" }}>
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}

// Trash icon shown on the right edge of a table row. Stays invisible until
// the row is hovered (via the row's "group" class), then fades in — so the
// table stays clean at rest but deleting a record is always one tap away.
function DeleteRowButton({ onClick }) {
  const { tokens, accent } = useTheme();
  const [hover, setHover] = useState(false);
  const red = accent("red");
  return (
    <button
      type="button"
      aria-label="Delete row"
      title="Delete"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center rounded-lg flex-shrink-0"
      style={{
        width: 30, height: 30,
        color: hover ? red : tokens.textTertiary,
        background: hover ? withAlpha(red, tokens.isDark ? 0.18 : 0.12) : "transparent",
        transition: "opacity 160ms ease, background-color 160ms ease, color 160ms ease",
        cursor: "pointer",
      }}
    >
      <Trash2 size={15} strokeWidth={2} />
    </button>
  );
}

function Table({ columns, rows, renderCell, onDeleteRow }) {
  const { tokens } = useTheme();
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-3 py-2.5"
                style={{
                  fontSize: 12, fontWeight: 650, textTransform: "uppercase", letterSpacing: "0.04em",
                  color: tokens.textTertiary, borderBottom: `1px solid ${tokens.divider}`,
                }}
              >
                {col.label}
              </th>
            ))}
            {onDeleteRow && (
              <th className="px-3 py-2.5" style={{ width: 40, borderBottom: `1px solid ${tokens.divider}` }} />
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              style={{
                borderBottom: i === rows.length - 1 ? "none" : `1px solid ${tokens.divider}`,
                transition: "background-color 140ms ease",
              }}
              className="group"
              onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-3 py-3"
                  style={{ fontSize: 13.5, color: tokens.textPrimary, whiteSpace: "nowrap" }}
                >
                  {renderCell ? renderCell(col.key, row) ?? row[col.key] : row[col.key]}
                </td>
              ))}
              {onDeleteRow && (
                <td className="px-3 py-3" style={{ width: 40, textAlign: "right" }}>
                  <DeleteRowButton onClick={() => onDeleteRow(row, i)} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="py-10 text-center" style={{ color: tokens.textTertiary, fontSize: 13.5 }}>
          No records yet.
        </div>
      )}
    </div>
  );
}

function Dialog({ open, onClose, title, children, footer, width = 460 }) {
  const { tokens } = useTheme();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        background: tokens.overlay,
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 220ms ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl w-full"
        style={{
          maxWidth: width,
          background: tokens.surfaceRaised,
          border: `1px solid ${tokens.borderStrong}`,
          boxShadow: tokens.shadow,
          transform: open ? "scale(1) translateY(0)" : "scale(0.94) translateY(8px)",
          opacity: open ? 1 : 0,
          transition: "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${tokens.divider}` }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 650, color: tokens.textPrimary }}>{title}</h3>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-5 py-4"
            style={{ borderTop: `1px solid ${tokens.divider}` }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   GLOBAL FLOATING LABEL FIELDS — every text input and select in the app
   (list-page dialogs, Control Panel forms, Settings) shares this one
   component pair.
   - Border radius is fixed at 8px everywhere, no exceptions.
   - At rest, the label sits centered inside the box like a placeholder.
   - The moment the field is focused (or already holds a value), the label
     rises and sits directly ON the border line itself, with a small opaque
     backdrop behind it that "cuts" the border — the classic outlined
     floating-label treatment, not just a label parked above the box.
   - Once the label has floated off the text area, the input's real
     placeholder kicks in as "Enter {label}" so typing is still guided.
   A select is treated as always "filled" since it never has a truly empty
   state, so its label is always in the floated/on-border position.
============================================================================ */

const FIELD_RADIUS = 8;

function FloatingInput({ label, value, onChange, type = "text", disabled, surfaceBg, ...rest }) {
  const { tokens, accent } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const floated = focused || hasValue;
  // Label backdrop: match the card surface the input sits on.
  const labelBg = surfaceBg || tokens.surface;
  // Input background: always the card-surface-derived inputBg token —
  // never the raw app background color, regardless of which custom bg is active.
  const focusBorder = accent("blue");
  return (
    <div className="relative mb-4">
      <input
        {...rest}
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        placeholder={floated ? `Enter ${toSentenceCase(label)}` : ""}
        style={{
          width: "100%",
          background: tokens.inputBg,
          border: `1.5px solid ${focused ? focusBorder : tokens.bgBorder}`,
          borderRadius: FIELD_RADIUS,
          padding: "10px 12px",
          fontSize: 13.5,
          color: tokens.textPrimary,
          outline: "none",
          opacity: disabled ? 0.6 : 1,
          transition: "border-color 150ms ease, background-color 260ms ease",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 12,
          top: floated ? 0 : "50%",
          transform: "translateY(-50%)",
          background: floated ? labelBg : "transparent",
          padding: floated ? "0 5px" : 0,
          fontSize: floated ? 11 : 13.5,
          fontWeight: floated ? 650 : 500,
          letterSpacing: floated ? "0.02em" : "normal",
          textTransform: "none",
          color: focused ? focusBorder : floated ? tokens.textSecondary : tokens.textTertiary,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transition: "top 160ms ease, font-size 160ms ease, color 160ms ease, letter-spacing 160ms ease, background-color 160ms ease",
        }}
      >
        {toSentenceCase(label)}
      </span>
    </div>
  );
}

function FloatingSelect({ label, options, value, onChange, surfaceBg, ...rest }) {
  const { tokens, accent } = useTheme();
  const [focused, setFocused] = useState(false);
  const labelBg = surfaceBg || tokens.surface;
  const focusBorder = accent("blue");
  return (
    <div className="relative mb-4">
      <select
        {...rest}
        value={value}
        onChange={onChange}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        style={{
          width: "100%",
          appearance: "none",
          background: tokens.inputBg,
          border: `1.5px solid ${focused ? focusBorder : tokens.bgBorder}`,
          borderRadius: FIELD_RADIUS,
          padding: "10px 30px 10px 12px",
          fontSize: 13.5,
          color: tokens.textPrimary,
          outline: "none",
          transition: "border-color 150ms ease, background-color 260ms ease",
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 12,
          top: 0,
          transform: "translateY(-50%)",
          background: labelBg,
          padding: "0 5px",
          fontSize: 11, fontWeight: 650, letterSpacing: "0.02em", textTransform: "none",
          color: focused ? focusBorder : tokens.textSecondary,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transition: "color 160ms ease, background-color 160ms ease",
        }}
      >
        {toSentenceCase(label)}
      </span>
      <ChevronDown
        size={14} color={tokens.textTertiary}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      />
    </div>
  );
}

/* ============================================================================
   APP DATA
============================================================================ */

const NAV_ITEMS = [
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
const BOTTOM_NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "trips", label: "Trips", icon: Route },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "profile", label: "Profile", icon: User },
];

const RECENT_TRIPS = [
  { id: "TRP-2291", route: "Chicago → Detroit", driver: "R. Alvarez", vehicle: "TN-04 GJ 8821", status: "Running", eta: "2h 10m" },
  { id: "TRP-2290", route: "Dallas → Austin", driver: "K. Mensah", vehicle: "TX-91 KL 4470", status: "Completed", eta: "—" },
  { id: "TRP-2289", route: "Seattle → Portland", driver: "J. Okafor", vehicle: "WA-12 PB 9012", status: "Completed", eta: "—" },
  { id: "TRP-2288", route: "Miami → Orlando", driver: "L. Fischer", vehicle: "FL-77 QW 1187", status: "Pending", eta: "Dispatch 4:00 PM" },
  { id: "TRP-2287", route: "Denver → Salt Lake City", driver: "A. Novak", vehicle: "CO-30 ZR 6634", status: "Running", eta: "5h 40m" },
];

const NOTIFICATIONS = [
  { id: 1, title: "Vehicle TN-04 GJ 8821 due for service", time: "12 min ago", tone: "amber" },
  { id: 2, title: "Trip TRP-2290 completed successfully", time: "48 min ago", tone: "green" },
  { id: 3, title: "Fuel expense exceeded budget — Fleet B", time: "1h ago", tone: "red" },
  { id: 4, title: "New booking request from Meridian Logistics", time: "3h ago", tone: "blue" },
];

const LIST_CONFIG = {
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
      { key: "amount", label: "Amount" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Entry Reference", type: "text" },
      { key: "category", label: "Category", type: "select", options: ["Fuel", "Maintenance", "Toll", "Salary", "Insurance"] },
      { key: "amount", label: "Amount", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Paid", "Unpaid"] },
    ],
    rows: [
      { id: "EX-8821", category: "Fuel", amount: "$4,210", status: "Paid" },
      { id: "EX-8820", category: "Maintenance", amount: "$1,980", status: "Unpaid" },
      { id: "EX-8819", category: "Toll", amount: "$620", status: "Paid" },
      { id: "EX-8818", category: "Salary", amount: "$32,400", status: "Paid" },
    ],
    statusKey: "status", statusTone: { Paid: "green", Unpaid: "red" },
  },
  income: {
    title: "Income", tone: "green", icon: Wallet, addLabel: "Add Income",
    columns: [
      { key: "id", label: "Entry" }, { key: "source", label: "Source" },
      { key: "amount", label: "Amount" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "id", label: "Entry Reference", type: "text" },
      { key: "source", label: "Source", type: "text" },
      { key: "amount", label: "Amount", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Received", "Awaited"] },
    ],
    rows: [
      { id: "IN-5521", source: "Meridian Logistics", amount: "$18,200", status: "Received" },
      { id: "IN-5520", source: "Harbor & Co.", amount: "$9,640", status: "Received" },
      { id: "IN-5519", source: "Prairie Distributors", amount: "$27,100", status: "Awaited" },
    ],
    statusKey: "status", statusTone: { Received: "green", Awaited: "amber" },
  },
  fuel: {
    title: "Fuel Management", tone: "amber", icon: Fuel, addLabel: "Log Fuel Entry",
    columns: [
      { key: "vehicle", label: "Vehicle" }, { key: "liters", label: "Liters" },
      { key: "cost", label: "Cost" }, { key: "status", label: "Status" },
    ],
    fields: [
      { key: "vehicle", label: "Vehicle Number", type: "text" },
      { key: "liters", label: "Liters", type: "text" },
      { key: "cost", label: "Cost", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Logged", "Flagged"] },
    ],
    rows: [
      { vehicle: "TN-04 GJ 8821", liters: "180 L", cost: "$310", status: "Logged" },
      { vehicle: "TX-91 KL 4470", liters: "205 L", cost: "$352", status: "Logged" },
      { vehicle: "CO-30 ZR 6634", liters: "96 L", cost: "$188", status: "Flagged" },
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
const ADD_SUCCESS_MESSAGE = {
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

const DELETE_SUCCESS_MESSAGE = {
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

const DASHBOARD_ICONS = [
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

const CONTROL_PANEL_ITEMS = [
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
      { key: "amount", label: "Amount" },
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

/* ============================================================================
   LAYOUT: SIDEBAR
============================================================================ */

function Sidebar({ active, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile, isMobile, onLogout }) {
  const { tokens, accent, appLogo, logoRadiusFraction } = useTheme();
  const width = collapsed && !isMobile ? 76 : 256;

  return (
    <>
      {isMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: tokens.overlay,
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "auto" : "none",
            transition: "opacity 220ms ease",
          }}
        />
      )}
      <aside
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0, left: 0, height: "100vh", zIndex: 50,
          width: isMobile ? 264 : width,
          transform: isMobile ? `translateX(${mobileOpen ? "0" : "-100%"})` : "none",
          background: tokens.sidebarChrome,
          borderRight: `1px solid ${tokens.bgBorder}`,
          display: "flex", flexDirection: "column",
          transition: "width 240ms cubic-bezier(.2,.8,.2,1), transform 240ms cubic-bezier(.2,.8,.2,1)",
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: 60, borderBottom: `1px solid ${tokens.bgDivider}` }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 34, height: 34,
              borderRadius: appLogo ? logoFrameRadius(logoRadiusFraction, 34) : 12,
              background: appLogo ? "transparent" : accent("blue"),
              overflow: "hidden",
              transition: "border-radius 200ms ease",
            }}
          >
            {appLogo ? (
              <img src={appLogo} alt="App logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Route size={18} color="#fff" strokeWidth={2.25} />
            )}
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <div style={{ fontSize: 14.5, fontWeight: 700, color: tokens.bgTextPrimary, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                RouteWise TMS
              </div>
              <div style={{ fontSize: 11, color: tokens.bgTextTertiary, whiteSpace: "nowrap" }}>
                Fleet & Logistics
              </div>
            </div>
          )}
          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="ml-auto rounded-lg flex items-center justify-center"
              style={{ width: 30, height: 30, color: tokens.bgTextSecondary }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                title={collapsed && !isMobile ? item.label : undefined}
                className="w-full flex items-center gap-3 rounded-xl mb-1 relative"
                style={{
                  padding: collapsed && !isMobile ? "10px" : "10px 12px",
                  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  background: isActive ? tokens.activeTint : "transparent",
                  color: isActive ? accent("blue") : tokens.bgTextSecondary,
                  transition: "background-color 160ms ease, color 160ms ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = tokens.hoverTint; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {isActive && (
                  <span
                    style={{
                      position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
                      width: 3, height: 18, borderRadius: 999, background: accent("blue"),
                    }}
                  />
                )}
                <Icon size={ICON} strokeWidth={2} style={{ flexShrink: 0 }} />
                {(!collapsed || isMobile) && (
                  <span style={{ fontSize: 13.5, fontWeight: isActive ? 620 : 500, whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2.5 flex flex-col gap-1" style={{ borderTop: `1px solid ${tokens.bgDivider}` }}>
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center gap-2 rounded-xl justify-center"
              style={{ padding: "9px", color: tokens.bgTextSecondary, transition: "background-color 160ms ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {collapsed ? <ChevronRight size={ICON} /> : <><ChevronLeft size={ICON} /><span style={{ fontSize: 13 }}>Collapse</span></>}
            </button>
          )}
          <button
            onClick={onLogout}
            title={collapsed && !isMobile ? "Logout" : undefined}
            className="w-full flex items-center gap-2 rounded-xl"
            style={{
              padding: collapsed && !isMobile ? "9px" : "9px 12px",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
              color: accent("red"),
              transition: "background-color 160ms ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={ICON} strokeWidth={2} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span style={{ fontSize: 13.5, fontWeight: 500 }}>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ============================================================================
   LAYOUT: BOTTOM NAVIGATION (MOBILE ONLY)
   A simple, independent tab strip for small screens. Nothing is active or
   selected by default — tapping any item does not navigate anywhere, it
   just tells the parent to show the "Coming Soon" banner at the top.
============================================================================ */

// Home here uses the exact same click logic as the Dashboard item in the
// sidebar drawer — it calls onNavigate("dashboard") and gets the same
// active-state highlight. The other three items are still unwired and keep
// surfacing the "Coming Soon" banner.
function BottomNav({ active, onNavigate, onComingSoon }) {
  const { tokens, accent } = useTheme();
  return (
    <nav
      className="flex items-stretch flex-shrink-0"
      style={{
        height: 58,
        background: tokens.chrome,
        borderTop: `1px solid ${tokens.bgBorder}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isHome = item.key === "home";
        const isActive = isHome && active === "dashboard";
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => (isHome ? onNavigate("dashboard") : onComingSoon(item.label))}
            className="flex-1 flex flex-col items-center justify-center gap-1"
            style={{ color: isActive ? accent("blue") : tokens.bgTextSecondary, cursor: "pointer" }}
            onMouseDown={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Icon size={20} strokeWidth={2} />
            <span style={{ fontSize: 11, fontWeight: 550 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ============================================================================
   LAYOUT: TOP APP BAR
============================================================================ */

function TopBar({ onMenuClick, activeLabel, onNavigate, onBack, hasSubpage }) {
  const { tokens, accent, mode, setMode } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef(null);

  const isDark = mode === "dark" || (mode === "system" && tokens.isDark);
  const toggleDarkLight = () => {
    if (mode === "system") {
      setMode(tokens.isDark ? "light" : "dark");
    } else {
      setMode(mode === "dark" ? "light" : "dark");
    }
  };

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-5 flex-shrink-0"
      style={{
        height: 60, background: tokens.chrome, borderBottom: `1px solid ${tokens.bgBorder}`,
        position: "sticky", top: 0, zIndex: 30,
      }}
    >
      {/* When a subpage is open show a back arrow; otherwise the hamburger menu */}
      {hasSubpage ? (
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 38, height: 38, color: tokens.bgTextSecondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ChevronLeft size={20} />
        </button>
      ) : (
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 38, height: 38, color: tokens.bgTextSecondary }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Menu size={20} />
        </button>
      )}

      <div
        style={{
          fontSize: 15.5,
          fontWeight: 650,
          color: tokens.bgTextPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: "0 1 auto",
          minWidth: 0,
        }}
      >
        {activeLabel}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="relative" ref={ref}>
          <IconButton icon={Bell} label="Notifications" active={notifOpen} onLiveBg onClick={() => setNotifOpen((v) => !v)} />
          <span
            style={{
              position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: 999,
              background: accent("red"), border: `1.5px solid ${tokens.surface}`,
            }}
          />
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 rounded-2xl overflow-hidden"
              style={{
                width: 320, background: tokens.surfaceRaised, border: `1px solid ${tokens.borderStrong}`,
                boxShadow: tokens.shadow, zIndex: 50,
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${tokens.divider}`, fontSize: 13.5, fontWeight: 650, color: tokens.textPrimary }}>
                Notifications
              </div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${tokens.divider}` }}>
                  <div style={{ marginTop: 5 }}><Dot tone={n.tone} /></div>
                  <div>
                    <div style={{ fontSize: 13, color: tokens.textPrimary, lineHeight: 1.4 }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: tokens.textTertiary, marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Light / Dark mode toggle */}
        <IconButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onLiveBg
          onClick={toggleDarkLight}
        />

        <div
          className="hidden sm:flex items-center gap-2 rounded-xl pl-1 pr-3"
          style={{ height: 38, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = tokens.hoverTint)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 30, height: 30, background: accent("violet"), color: "#fff", fontSize: 12.5, fontWeight: 650 }}
          >
            AM
          </div>
          <div className="leading-tight">
            <div style={{ fontSize: 12.5, fontWeight: 620, color: tokens.bgTextPrimary }}>Ava Morgan</div>
            <div style={{ fontSize: 10.5, color: tokens.bgTextTertiary }}>Fleet Manager</div>
          </div>
          <ChevronDown size={14} color={tokens.bgTextTertiary} />
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   DASHBOARD
============================================================================ */

// Top-of-page summary card. Uses the same app-wide theme tokens as every
// other card, so in dark mode it automatically picks up the #002843-derived
// surface, border, shadow, and high-contrast text — and reverts to the
// normal light card look when light mode is active.
function StatCard({ item }) {
  const { tokens, accent } = useTheme();
  const color = accent(item.tone);
  const positiveColor = accent("green");
  const negativeColor = accent("red");
  const Icon = item.icon;
  const [hover, setHover] = useState(false);

  return (
    <div
      className="rounded-2xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: tokens.surface,
        border: `1px solid ${hover ? tokens.borderStrong : tokens.border}`,
        boxShadow: hover ? tokens.shadow : tokens.shadowSm,
        padding: 18,
        transition: "background-color 240ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 38, height: 38, background: withAlpha(color, tokens.isDark ? 0.20 : 0.14) }}
        >
          <Icon size={19} color={color} strokeWidth={2} />
        </div>
        {item.up !== null && (
          <span
            className="inline-flex items-center gap-1 rounded-full"
            style={{
              fontSize: 11.5, fontWeight: 650, padding: "2.5px 8px",
              color: item.up ? positiveColor : negativeColor,
              background: withAlpha(item.up ? positiveColor : negativeColor, tokens.isDark ? 0.20 : 0.12),
            }}
          >
            {item.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {item.trend}
          </span>
        )}
        {item.up === null && (
          <span
            style={{
              fontSize: 11.5, fontWeight: 650, padding: "2.5px 8px", borderRadius: 999,
              color, background: withAlpha(color, tokens.isDark ? 0.20 : 0.12),
            }}
          >
            {item.trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: tokens.textPrimary, letterSpacing: "-0.02em" }}>
        {item.value}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textPrimary, marginTop: 3 }}>{item.label}</div>
      {item.sub && <div style={{ fontSize: 11, color: tokens.textSecondary, marginTop: 1 }}>{item.sub}</div>}
    </div>
  );
}

// Single tappable tile in the Dashboard quick-action grid: a tinted icon
// chip over a short label, matching the same card/hover language used by
// StatCard elsewhere in the app.
function DashboardIconTile({ item, onClick }) {
  const { tokens, accent } = useTheme();
  const [hover, setHover] = useState(false);
  const color = accent(item.tone);
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col items-center gap-2 rounded-2xl"
      style={{
        padding: "16px 6px",
        background: tokens.surface,
        border: `1px solid ${hover ? tokens.borderStrong : tokens.border}`,
        boxShadow: hover ? tokens.shadow : tokens.shadowSm,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        cursor: "pointer",
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 42, height: 42, background: withAlpha(color, tokens.isDark ? 0.20 : 0.13) }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <span
        style={{
          fontSize: 11.5, fontWeight: 600, color: tokens.textPrimary,
          textAlign: "center", lineHeight: 1.25,
        }}
      >
        {item.label}
      </span>
    </button>
  );
}

function Dashboard({ onNavigate, onComingSoon }) {
  const { tokens } = useTheme();
  const nav = useNavigator();

  // The dashboard's "Add Money" tile has no page of its own — it opens the
  // exact same Control Panel > Add Money subpage (same form, same saved
  // entries, same data via ControlPanelDataProvider) rather than a
  // duplicate/disconnected screen, so entries added from either entry
  // point stay in sync automatically.
  const handleTileClick = (item) => {
    if (item.key === "add-money") {
      const cpItem = CONTROL_PANEL_ITEMS.find((i) => i.key === "add-money");
      nav.push(cpItem.label, <ControlPanelItemPage item={cpItem} />);
      return;
    }
    if (item.navKey) {
      onNavigate(item.navKey);
      return;
    }
    onComingSoon();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {DASHBOARD_ICONS.map((item) => (
          <DashboardIconTile
            key={item.key}
            item={item}
            onClick={() => handleTileClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   GENERIC LIST PAGE (Vehicles, Drivers, Trips, Expenses, etc.)
============================================================================ */

// Builds the top summary-card row for a module page: a total count plus a
// card per distinct status value present in the data (max 4 cards total).
function computeSummary(config, rows) {
  const cards = [
    { key: "total", label: `Total ${config.title}`, value: rows.length, icon: config.icon, tone: config.tone, up: null, trend: "100%" },
  ];
  if (config.statusKey) {
    const counts = {};
    rows.forEach((r) => {
      const v = r[config.statusKey];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    Object.entries(counts).forEach(([status, count]) => {
      cards.push({
        key: status,
        label: status,
        value: count,
        icon: config.icon,
        tone: config.statusTone[status] || "blue",
        up: null,
        trend: `${Math.round((count / rows.length) * 100)}%`,
      });
    });
  }
  return cards.slice(0, 4);
}

function ListPage({ pageKey }) {
  const config = LIST_CONFIG[pageKey];
  const { tokens } = useTheme();
  const { showFeedback } = useFeedback();
  const [rows, setRows] = useState(config.rows);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { setRows(config.rows); setForm({}); }, [pageKey]); // eslint-disable-line

  const summary = useMemo(() => computeSummary(config, rows), [config, rows]);

  const handleAdd = () => {
    if (config.fields.length === 0) { setOpen(false); return; }
    setRows((r) => [{ ...form, id: form.id || `NEW-${r.length + 1}` }, ...r]);
    setForm({});
    setOpen(false);
    showFeedback(ADD_SUCCESS_MESSAGE[pageKey] || "Saved successfully");
  };

  const handleDelete = (row, index) => {
    setRows((r) => r.filter((_, i) => i !== index));
    showFeedback(DELETE_SUCCESS_MESSAGE[pageKey] || "Deleted successfully");
  };

  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: tokens.bgTextPrimary, letterSpacing: "-0.02em" }}>
            {config.title}
          </h1>
          <p style={{ fontSize: 13.5, color: tokens.bgTextSecondary, marginTop: 3 }}>
            {rows.length} {rows.length === 1 ? "record" : "records"} total
          </p>
        </div>
        {config.fields.length > 0 && (
          <Button icon={Plus} onClick={() => setOpen(true)}>{config.addLabel}</Button>
        )}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {summary.map((item) => <StatCard key={item.key} item={item} />)}
      </div>

      <Card padding={20}>
        <SectionHeading tone={config.tone}>All {config.title}</SectionHeading>
        <Table
          columns={config.columns}
          rows={rows}
          onDeleteRow={handleDelete}
          renderCell={(key, row) => {
            if (key === config.statusKey) {
              return <Badge tone={config.statusTone[row[key]] || "blue"}>{row[key]}</Badge>;
            }
            return undefined;
          }}
        />
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={config.addLabel}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button icon={Check} onClick={handleAdd}>Save</Button>
        </>}
      >
        {config.fields.map((f) => (
          f.type === "select" ? (
            <FloatingSelect
              key={f.key}
              label={f.label}
              options={f.options}
              value={form[f.key] || f.options[0]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              surfaceBg={tokens.surfaceRaised}
            />
          ) : (
            <FloatingInput
              key={f.key}
              label={f.label}
              value={form[f.key] || ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              surfaceBg={tokens.surfaceRaised}
            />
          )
        ))}
        <Icon size={0} />
      </Dialog>
    </div>
  );
}

/* ============================================================================
   CONTROL PANEL DATA — lives above both ControlPanelPage (the grid) and
   ControlPanelItemPage (the pushed subpage) so the subpage can read/write
   it directly via context. Keeping it here means ControlPanelPage never
   needs to unmount or stay alive purely to "hold" this state — the subpage
   is a self-sufficient navigation stack entry.
============================================================================ */

const ControlPanelDataContext = createContext(null);
function useControlPanelData() {
  return useContext(ControlPanelDataContext);
}

function ControlPanelDataProvider({ children }) {
  const [entriesByItem, setEntriesByItem] = useState(() =>
    Object.fromEntries(CONTROL_PANEL_ITEMS.map((i) => [i.key, []]))
  );
  const addEntry = useCallback((key, record) => {
    setEntriesByItem((s) => ({ ...s, [key]: [record, ...s[key]] }));
  }, []);
  const deleteEntry = useCallback((key, index) => {
    setEntriesByItem((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== index) }));
  }, []);
  const value = useMemo(
    () => ({ entriesByItem, addEntry, deleteEntry }),
    [entriesByItem, addEntry, deleteEntry]
  );
  return <ControlPanelDataContext.Provider value={value}>{children}</ControlPanelDataContext.Provider>;
}

/* ============================================================================
   CONTROL PANEL PAGES — grid of the 8 reference-list cards, plus the
   per-item subpage that opens when one is tapped.
============================================================================ */

function ControlPanelCard({ item, onClick }) {
  const { tokens, accent } = useTheme();
  const [hover, setHover] = useState(false);
  const color = accent(item.tone);
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-3.5 rounded-2xl text-left w-full"
      style={{
        padding: 18,
        background: tokens.surface,
        border: `1px solid ${hover ? tokens.borderStrong : tokens.border}`,
        boxShadow: hover ? tokens.shadow : tokens.shadowSm,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        cursor: "pointer",
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ width: 44, height: 44, background: withAlpha(color, tokens.isDark ? 0.20 : 0.13) }}
      >
        <Icon size={21} color={color} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div style={{ fontSize: 14, fontWeight: 650, color: tokens.textPrimary }}>{item.label}</div>
        <div style={{ fontSize: 11.5, color: tokens.textTertiary, marginTop: 1 }}>{item.description}</div>
      </div>
      <ChevronRight size={17} color={tokens.textTertiary} style={{ flexShrink: 0 }} />
    </button>
  );
}

function ControlPanelItemPage({ item }) {
  const { tokens } = useTheme();
  const { showFeedback } = useFeedback();
  const { entriesByItem, addEntry, deleteEntry } = useControlPanelData();
  const [form, setForm] = useState({});
  const entries = entriesByItem[item.key];

  const isValid = item.fields.every((f) => (form[f.key] || "").trim().length > 0);

  const handleAdd = () => {
    if (!isValid) return;
    addEntry(item.key, { ...form, id: `${item.key}-${Date.now()}` });
    setForm({});
    showFeedback(item.successLabel);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card padding={22}>
        <SectionHeading tone={item.tone}>Add New</SectionHeading>
        {item.fields.map((f) => (
          <FloatingInput
            key={f.key}
            label={f.label}
            value={form[f.key] || ""}
            onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
          />
        ))}
        <Button icon={Plus} onClick={handleAdd} disabled={!isValid}>{item.addLabel}</Button>
      </Card>

      <Card padding={20}>
        <SectionHeading tone={item.tone}>Saved Entries</SectionHeading>
        <Table columns={item.fields} rows={entries} onDeleteRow={(row, i) => deleteEntry(item.key, i)} />
      </Card>
    </div>
  );
}

function ControlPanelPage() {
  const nav = useNavigator();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {CONTROL_PANEL_ITEMS.map((item) => (
          <ControlPanelCard
            key={item.key}
            item={item}
            onClick={() => nav.push(item.label, <ControlPanelItemPage item={item} />)}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   SETTINGS PAGE — theme mode, custom background, persistence controls
============================================================================ */

function ModeOption({ value, label, icon: Icon, current, onSelect }) {
  const { tokens, accent } = useTheme();
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className="flex flex-col items-center gap-2 rounded-2xl flex-1"
      style={{
        padding: "18px 12px",
        background: active ? withAlpha(accent("blue"), 0.1) : tokens.surfaceSunken,
        border: `1.5px solid ${active ? accent("blue") : tokens.bgBorder}`,
        transition: "all 180ms ease",
        cursor: "pointer",
      }}
    >
      <Icon size={22} color={active ? accent("blue") : tokens.bgTextSecondary} strokeWidth={2} />
      <span style={{ fontSize: 13, fontWeight: 600, color: active ? accent("blue") : tokens.bgTextPrimary }}>
        {label}
      </span>
    </button>
  );
}

/* ============================================================================
   COMING SOON BANNER — shown at the top of the page when a bottom-nav
   item (Home / Trips / Payment / Profile) is tapped; those items aren't
   wired to any page yet.
============================================================================ */

function ComingSoonBanner({ show }) {
  const { tokens, accent } = useTheme();
  const blue = accent("blue");
  return (
    <div
      style={{
        maxHeight: show ? 46 : 0,
        opacity: show ? 1 : 0,
        overflow: "hidden",
        flexShrink: 0,
        background: withAlpha(blue, 0.12),
        borderBottom: show ? `1px solid ${tokens.border}` : "none",
        transition: "max-height 220ms ease, opacity 200ms ease, border-color 200ms ease",
      }}
    >
      <div
        className="flex items-center justify-center gap-2 px-4"
        style={{ height: 46, fontSize: 13.5, fontWeight: 650, color: blue }}
      >
        Coming Soon
      </div>
    </div>
  );
}

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

function AppearanceModeSubpage() {
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

function CustomBackgroundColorSubpage() {
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

function LayoutColorSubpage() {
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

function AppLogoSubpage() {
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

function ThemeSettingsSubpage() {
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

/* ============================================================================
   SECURITY & PASSWORD SUBPAGE
============================================================================ */

function SecurityPasswordSubpage() {
  const { tokens, accent } = useTheme();
  const { showFeedback } = useFeedback();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValid = currentPassword.trim().length > 0 && newPassword.trim().length >= 6 && newPassword === confirmPassword;

  const handleUpdate = () => {
    if (!isValid) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showFeedback("Password updated");
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 460 }}>
      <Card padding={22}>
        <SectionHeading tone="red">Change Password</SectionHeading>
        <FloatingInput
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <FloatingInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <FloatingInput
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {mismatch && (
          <p style={{ fontSize: 12, color: accent("red"), marginTop: -8, marginBottom: 12 }}>
            New password and confirmation don't match.
          </p>
        )}
        <Button icon={Lock} onClick={handleUpdate} disabled={!isValid}>Update Password</Button>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 12 }}>
          Use at least 6 characters. You'll stay logged in on this device after updating.
        </p>
      </Card>
    </div>
  );
}

/* ============================================================================
   BIOMETRIC SECURITY SUBPAGE
============================================================================ */

// Reusable pill toggle switch, styled with the same theme tokens as every
// other control in the app.
function ToggleSwitch({ checked, onChange }) {
  const { tokens, accent } = useTheme();
  const blue = accent("blue");
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        padding: 3,
        background: checked ? blue : tokens.bgBorder,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: checked ? "flex-end" : "flex-start",
        flexShrink: 0,
        transition: "background-color 180ms ease",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "transform 180ms ease",
        }}
      />
    </button>
  );
}

function BiometricRow({ icon: Icon, tone, title, description, checked, onChange }) {
  const { tokens, accent } = useTheme();
  const color = accent(tone);
  return (
    <div className="flex items-center gap-3.5" style={{ padding: "14px 0" }}>
      <div
        className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ width: 40, height: 40, background: withAlpha(color, tokens.isDark ? 0.20 : 0.13) }}
      >
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13.5, fontWeight: 650, color: tokens.textPrimary }}>{title}</div>
        <div style={{ fontSize: 11.5, color: tokens.textTertiary, marginTop: 1 }}>{description}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function BiometricSecuritySubpage() {
  const { tokens } = useTheme();
  const { showFeedback } = useFeedback();
  const [fingerprint, setFingerprint] = useState(false);
  const [faceId, setFaceId] = useState(false);

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 520 }}>
      <Card padding={22}>
        <SectionHeading tone="violet">Biometric Security</SectionHeading>
        <div className="flex flex-col">
          <div style={{ borderBottom: `1px solid ${tokens.divider}` }}>
            <BiometricRow
              icon={Fingerprint}
              tone="violet"
              title="Fingerprint Login"
              description="Unlock the app with your fingerprint"
              checked={fingerprint}
              onChange={(v) => { setFingerprint(v); showFeedback(v ? "Fingerprint login enabled" : "Fingerprint login disabled"); }}
            />
          </div>
          <BiometricRow
            icon={ShieldCheck}
            tone="blue"
            title="Face ID Login"
            description="Unlock the app by scanning your face"
            checked={faceId}
            onChange={(v) => { setFaceId(v); showFeedback(v ? "Face ID login enabled" : "Face ID login disabled"); }}
          />
        </div>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 8 }}>
          When enabled, you can use biometrics instead of your password to log in.
        </p>
      </Card>
    </div>
  );
}

/* ============================================================================
   LANGUAGE & CURRENCY SUBPAGES — each option shows its country in small
   text underneath the main label.
============================================================================ */

const LANGUAGE_OPTIONS = [
  { id: "bn", label: "Bangla", country: "Bangladesh" },
  { id: "en", label: "English", country: "United States" },
  { id: "ar", label: "Arabic", country: "Qatar" },
];

const CURRENCY_OPTIONS = [
  { id: "bdt", label: "BDT", country: "Bangladesh" },
  { id: "qar", label: "QAR", country: "Qatar" },
  { id: "usd", label: "USD", country: "United States" },
];

function SettingsOptionRow({ label, country, selected, onSelect }) {
  const { tokens, accent } = useTheme();
  const blue = accent("blue");
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center justify-between w-full rounded-2xl text-left"
      style={{
        padding: "14px 16px",
        marginBottom: 10,
        background: selected ? withAlpha(blue, 0.1) : tokens.surfaceSunken,
        border: `1.5px solid ${selected ? blue : tokens.bgBorder}`,
        cursor: "pointer",
        transition: "all 180ms ease",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 650, color: selected ? blue : tokens.bgTextPrimary }}>
          {label}
        </div>
        <div style={{ fontSize: 11.5, color: tokens.bgTextTertiary, marginTop: 2 }}>
          {country}
        </div>
      </div>
      {selected && <Check size={18} color={blue} strokeWidth={2.5} />}
    </button>
  );
}

function LanguageSubpage() {
  const { showFeedback } = useFeedback();
  const [language, setLanguage] = useState("en");

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 460 }}>
      <Card padding={22}>
        <SectionHeading tone="teal">Language</SectionHeading>
        {LANGUAGE_OPTIONS.map((opt) => (
          <SettingsOptionRow
            key={opt.id}
            label={opt.label}
            country={opt.country}
            selected={language === opt.id}
            onSelect={() => { setLanguage(opt.id); showFeedback(`${opt.label} selected`); }}
          />
        ))}
      </Card>
    </div>
  );
}

function CurrencySubpage() {
  const { showFeedback } = useFeedback();
  const [currency, setCurrency] = useState("qar");

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 460 }}>
      <Card padding={22}>
        <SectionHeading tone="amber">Currency</SectionHeading>
        {CURRENCY_OPTIONS.map((opt) => (
          <SettingsOptionRow
            key={opt.id}
            label={opt.label}
            country={opt.country}
            selected={currency === opt.id}
            onSelect={() => { setCurrency(opt.id); showFeedback(`${opt.label} selected`); }}
          />
        ))}
      </Card>
    </div>
  );
}

function SettingsPage() {
  const { tokens, accent } = useTheme();
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
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => nav.push(item.label, item.page)}
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
                <div style={{ fontSize: 14.5, fontWeight: 660, color: tokens.textPrimary }}>{item.label}</div>
                <div style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 2, lineHeight: 1.4 }}>{item.description}</div>
              </div>
              <ChevronRight size={17} color={tokens.textTertiary} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   ROOT APP
============================================================================ */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

// iPhone-style push navigation — two layers slide simultaneously.
// Forward: old page exits left (-30%, dims), new page enters from right (100%→0).
// Back:    old page exits right (100%), new page enters from left (-30%→0).
// Same cubic-bezier as the sidebar drawer: .2 .8 .2 1
const SLIDE_MS     = 340;
const SLIDE_EASE   = "cubic-bezier(.2,.8,.2,1)";

function PageTransition({ pageKey, children, direction = "forward" }) {
  const { tokens, pageBgStyle } = useTheme();
  const [layers, setLayers] = useState({
    current:   { key: pageKey, content: children },
    incoming:  null,
    dir:       "forward",
    animating: false,
  });
  const timerRef    = useRef(null);
  // ref দিয়ে "এখন আসলে কোন key দেখাচ্ছে" track করা হয় —
  // state closure stale হলেও ref সবসময় latest value দেয়
  const currentKeyRef = useRef(pageKey);

  // useLayoutEffect (not useEffect): the state flip that starts an
  // animation must land in the SAME paint as the pageKey change that
  // triggered it. useEffect runs after the browser has already painted the
  // "old" frame, so on a slow frame the user briefly sees the previous page
  // sitting still before the slide kicks in on the next frame — that's the
  // 1-frame jump/flash reported. useLayoutEffect runs synchronously after
  // DOM mutation but before paint, so React commits the animating state
  // before anything hits the screen — no intermediate frame is ever shown.
  useLayoutEffect(() => {
    if (pageKey === currentKeyRef.current) {
      // Same key — animation চলাকালীন content update করা যাবে না,
      // তাহলে incoming-এর উপর পুরনো content চলে আসবে
      setLayers((l) => {
        if (l.animating) return l; // animation চলছে — update বন্ধ
        return { ...l, current: { ...l.current, content: children } };
      });
      return;
    }

    // নতুন page-এ যাচ্ছি — ref এখনই আপডেট করো
    currentKeyRef.current = pageKey;
    clearTimeout(timerRef.current);

    // Capture করো এই render-এর pageKey ও children
    // যাতে setTimeout-এর closure সঠিক value পায়
    const targetKey     = pageKey;
    const targetContent = children;
    const targetDir     = direction;

    setLayers((l) => ({
      // If a previous transition was interrupted mid-flight (rapid nav
      // clicks), promote its still-animating "incoming" layer to be the
      // new base instead of the older "current". Otherwise the layer that
      // was visibly sliding in just vanishes mid-motion — a hard visual
      // jump — instead of continuing as the (now outgoing) base.
      current:   l.animating && l.incoming ? l.incoming : l.current,
      incoming:  { key: targetKey, content: targetContent },
      dir:       targetDir,
      animating: true,
    }));

    timerRef.current = setTimeout(() => {
      setLayers({
        current:   { key: targetKey, content: targetContent },
        incoming:  null,
        dir:       targetDir,
        animating: false,
      });
    }, SLIDE_MS + 30);

    return () => clearTimeout(timerRef.current);
  }, [pageKey]); // eslint-disable-line

  const { current, incoming, animating, dir } = layers;
  const fwd = dir !== "back";

  // Overflow is intentionally NEVER toggled between "hidden" and "auto".
  // Flipping overflow-y on/off exactly when the animation starts/ends was
  // the main cause of the layout jump: if the page content is taller than
  // the viewport, switching to "auto" makes the scrollbar suddenly appear
  // and reflow the content by the scrollbar's width — a visible sideways
  // "shake" right as the transition finishes. Keeping overflow-y constant
  // and letting the (always-clipping) parent's overflow:hidden do the
  // clipping while a layer is off-screen removes that reflow entirely.
  const baseLayerStyle = {
    overflowY: "auto",
    overscrollBehavior: "contain",
    scrollbarGutter: "stable",
    ...pageBgStyle,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "translateZ(0)", // own compositor layer: stops subpixel text jitter while translating
  };

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", contain: "layout paint" }}>
      {/* Current page — solid background দিয়ে পেছনের layer আড়াল করে */}
      <div
        key={`cur-${current.key}`}
        style={{
          ...baseLayerStyle,
          position:      animating ? "absolute" : "relative",
          inset:         animating ? 0 : undefined,
          flex:          animating ? undefined : 1,
          animation:     animating
            ? `${fwd ? "tms-exit-fwd" : "tms-exit-back"} ${SLIDE_MS}ms ${SLIDE_EASE} both`
            : "none",
          pointerEvents: animating ? "none" : undefined,
          willChange:    animating ? "transform, opacity" : "auto",
          zIndex:        animating ? 1 : undefined,
        }}
      >
        <div className="px-4 sm:px-6 py-5">{current.content}</div>
      </div>

      {/* Incoming page — solid background, সবার উপরে আসে */}
      {animating && incoming && (
        <div
          key={`inc-${incoming.key}`}
          style={{
            ...baseLayerStyle,
            position:      "absolute",
            inset:         0,
            animation:     `${fwd ? "tms-enter-fwd" : "tms-enter-back"} ${SLIDE_MS}ms ${SLIDE_EASE} both`,
            pointerEvents: "none",
            willChange:    "transform, opacity",
            zIndex:        2,
          }}
        >
          <div className="px-4 sm:px-6 py-5">{incoming.content}</div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   GLOBAL NAVIGATION STACK — the single, reusable push()/pop() API for every
   parent → subpage drill-down in the app, available anywhere via
   useNavigator(). A pushed subpage renders as a layer stacked on top of
   whatever section is currently active (Dashboard / Vehicles / Settings /
   Control Panel / …); the page underneath is never unmounted, so its state
   is always preserved automatically without it needing to know or care.

   To add a brand-new subpage anywhere in the app: write the component, then
   call nav.push("Label", <YourSubpage />) from wherever it should open. That
   is the entire integration — no local "which subpage is open" state, no
   transition config, no changes to AppShell, TopBar, or any other file.
   The back arrow (wired once, globally, in TopBar) always calls nav.pop()
   and reverses the exact same slide, with identical timing and easing —
   this is the same SLIDE_MS / SLIDE_EASE / cubic-bezier used for top-level
   section switches above, so the whole app feels like one continuous
   navigation system rather than a patchwork of per-page transitions.
============================================================================ */

const NavigationContext = createContext(null);
function useNavigator() {
  return useContext(NavigationContext);
}

function NavigationProvider({ children }) {
  const idRef = useRef(0);
  const [overlays, setOverlays] = useState([]); // [{ id, label, element }]

  // Drill into a subpage from whatever is currently on top.
  const push = useCallback((label, element) => {
    idRef.current += 1;
    setOverlays((s) => [...s, { id: idRef.current, label, element }]);
  }, []);

  // Return to the previous layer. No-op if nothing is pushed.
  const pop = useCallback(() => {
    setOverlays((s) => (s.length > 0 ? s.slice(0, -1) : s));
  }, []);

  // Instantly clear every pushed layer — used when the user switches
  // top-level section via the sidebar / bottom nav while a subpage is open.
  const closeAll = useCallback(() => setOverlays([]), []);

  const top = overlays.length > 0 ? overlays[overlays.length - 1] : null;
  const canGoBack = overlays.length > 0;

  const value = useMemo(
    () => ({ overlays, top, canGoBack, push, pop, closeAll }),
    [overlays, top, canGoBack, push, pop, closeAll]
  );

  return (
    <NavigationContext.Provider value={value}>
      {/* One definition of the app's entire push/pop motion language.
          Top-level section switches (PageTransition) and every subpage
          push/pop (NavigationOverlayOutlet) both animate with exactly
          these four keyframes — never their own copies — so the whole
          app shares one literal, identical transition, not just matching
          numbers. */}
      <style>{`
        @keyframes tms-exit-fwd  { from{transform:translateX(0);opacity:1} to{transform:translateX(-30%);opacity:0.35} }
        @keyframes tms-exit-back { from{transform:translateX(0);opacity:1} to{transform:translateX(100%);opacity:1} }
        @keyframes tms-enter-fwd { from{transform:translateX(100%)}        to{transform:translateX(0)} }
        @keyframes tms-enter-back{ from{transform:translateX(-30%);opacity:0.35} to{transform:translateX(0);opacity:1} }
      `}</style>
      {children}
    </NavigationContext.Provider>
  );
}

// Renders the ENTIRE navigation stack for the current section: the base
// page (whatever AppShell is showing — Dashboard / a list / Settings / …)
// as the bottom layer, plus every pushed subpage on top of it, in order.
//
// Only the top layer is ever interactive or scrollable; every layer below
// it stays mounted (fully covered, inert) so its state — scroll position,
// form input, whatever — survives for whenever the user pops back to it.
//
// The layer directly beneath the active one gets the exact same parallax
// recede (shift left 30%, dim to 35% opacity) that PageTransition gives
// the outgoing page on a top-level section switch — same keyframes, same
// SLIDE_MS/SLIDE_EASE — so drilling into a subpage and switching sections
// feel like one continuous motion language, not two different systems.
// Deeper layers never need their own animation: they're always fully
// hidden under an opaque layer, however many levels are pushed.
function NavigationOverlayOutlet({ children }) {
  const nav = useNavigator();
  const { tokens, pageBgStyle } = useTheme();
  const [transition, setTransition] = useState(null); // null | {kind:"push"} | {kind:"pop", exitingLayer}
  const prevOverlaysRef = useRef(nav.overlays);
  const timerRef = useRef(null);

  // useLayoutEffect (not useEffect) — same reasoning as PageTransition:
  // this must commit before the browser paints the overlay-count change,
  // otherwise there's a frame where the new/removed layer is present in
  // the DOM but not yet animating, which reads as a jump/flash.
  useLayoutEffect(() => {
    const prev = prevOverlaysRef.current;
    const curr = nav.overlays;
    if (curr.length > prev.length) {
      clearTimeout(timerRef.current);
      setTransition({ kind: "push" });
      timerRef.current = setTimeout(() => setTransition(null), SLIDE_MS + 20);
    } else if (curr.length < prev.length) {
      // Keep the just-removed layer rendered on top a little longer so it
      // can slide out instead of vanishing instantly.
      const removed = prev[prev.length - 1];
      clearTimeout(timerRef.current);
      setTransition({ kind: "pop", exitingLayer: removed });
      timerRef.current = setTimeout(() => setTransition(null), SLIDE_MS + 20);
    }
    prevOverlaysRef.current = curr;
  }, [nav.overlays]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const isPush = transition?.kind === "push";
  const isPop = transition?.kind === "pop";
  const exitingLayer = isPop ? transition.exitingLayer : null;

  // Bottom → top: the base page, then every currently pushed subpage.
  const settled = [
    { id: "base", element: children },
    ...nav.overlays,
  ];
  // Mid-pop, the removed layer rides on top a little longer so it can exit.
  // Important: keep its ORIGINAL id as the key. It's no longer in
  // nav.overlays, so there's no collision risk — and giving it a new key
  // here would make React unmount + remount the subpage component mid
  // slide-out (losing its state and causing a visible jitter) instead of
  // letting the same element smoothly finish animating away.
  const stack = exitingLayer ? [...settled, exitingLayer] : settled;

  const topPos = stack.length - 1;
  const belowTopPos = topPos - 1;

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      {stack.map((layer, pos) => {
        const isTop = pos === topPos;
        const isBelowTop = pos === belowTopPos;

        let animation = "none";
        let transform = "translateX(0)";
        let opacity = 1;

        if (isTop) {
          if (isPush) animation = `tms-enter-fwd ${SLIDE_MS}ms ${SLIDE_EASE} both`;
          else if (isPop) animation = `tms-exit-back ${SLIDE_MS}ms ${SLIDE_EASE} both`;
        } else if (isBelowTop) {
          if (isPush) animation = `tms-exit-fwd ${SLIDE_MS}ms ${SLIDE_EASE} both`;
          else if (isPop) animation = `tms-enter-back ${SLIDE_MS}ms ${SLIDE_EASE} both`;
          else {
            // Settled, with a subpage permanently stacked on top of it.
            transform = "translateX(-30%)";
            opacity = 0.35;
          }
        }

        const isAnimating = animation !== "none";

        return (
          <div
            key={layer.id}
            style={{
              position: "absolute", inset: 0, zIndex: pos,
              ...pageBgStyle,
              display: "flex", flexDirection: "column",
              // Overflow is constant (never toggled hidden↔auto). Toggling
              // it exactly when a transition starts/ends is what caused the
              // scrollbar to pop in/out and shove content sideways right at
              // the most visible moment of the animation. The parent's own
              // overflow:hidden already clips any off-screen layer, so this
              // can safely stay "auto" for the top layer at all times and
              // "hidden" for background layers at all times.
              overflowY: isTop ? "auto" : "hidden",
              overscrollBehavior: "contain",
              scrollbarGutter: "stable",
              pointerEvents: isTop ? undefined : "none",
              transform: animation === "none" ? `${transform} translateZ(0)` : undefined,
              opacity: animation === "none" ? opacity : undefined,
              animation,
              transition: animation === "none" ? "transform 0ms, opacity 0ms" : undefined,
              boxShadow: pos > 0 ? "-6px 0 24px rgba(0,0,0,0.10)" : "none",
              willChange: isAnimating ? "transform, opacity" : "auto",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className={pos === 0 ? undefined : "px-4 sm:px-6 py-5"} style={pos === 0 ? { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 } : undefined}>
              {layer.element}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AppShell({ onLogout }) {
  const { tokens, pageBgStyle } = useTheme();
  const nav = useNavigator();
  const [active, setActive]       = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const isMobile = useIsMobile();
  const comingSoonTimer = useRef(null);

  const pageBaseLabel = active === "control-panel"
    ? "Control Panel"
    : NAV_ITEMS.find((n) => n.key === active)?.label || "";

  // TopBar shows the pushed subpage's label when one is open, else the
  // current section's own label — driven entirely by the global navigator.
  const activeLabel = nav.top?.label || pageBaseLabel;

  // Keep browser tab title in sync — "SubPage · RouteWise TMS" or "Page · RouteWise TMS"
  useEffect(() => {
    document.title = activeLabel ? `${activeLabel} · RouteWise TMS` : "RouteWise TMS";
  }, [activeLabel]);

  // Switching top-level section always closes any open subpage first — you
  // can't "back" into a previously visited section, only into a subpage
  // drilled into from whichever one is currently active.
  const handleNavigate = (key) => {
    nav.closeAll();
    setActive(key);
    if (isMobile) setMobileOpen(false);
  };

  const handleBottomNavClick = () => {
    setComingSoon(true);
    clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setComingSoon(false), 2200);
  };

  useEffect(() => () => clearTimeout(comingSoonTimer.current), []);

  const renderPage = () => {
    if (active === "dashboard") return (
      <Dashboard onNavigate={handleNavigate} onComingSoon={handleBottomNavClick} />
    );
    if (active === "settings") return <SettingsPage />;
    if (active === "control-panel") return <ControlPanelPage />;
    return <ListPage pageKey={active} />;
  };

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isMobile={isMobile}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0" style={{ height: "100vh", overflow: "hidden" }}>
        <TopBar
          onMenuClick={() => (isMobile ? setMobileOpen((v) => !v) : setCollapsed((v) => !v))}
          activeLabel={activeLabel}
          hasSubpage={nav.canGoBack}
          onBack={nav.pop}
        />
        <ComingSoonBanner show={comingSoon} />
        <div
          className="flex-1"
          style={{ ...pageBgStyle, transition: "background-color 260ms ease", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", minHeight: 0 }}
        >
          <NavigationOverlayOutlet>
            <PageTransition pageKey={active} direction="forward">
              {renderPage()}
            </PageTransition>
          </NavigationOverlayOutlet>
        </div>
        {isMobile && <BottomNav active={active} onNavigate={handleNavigate} onComingSoon={handleBottomNavClick} />}
      </div>
    </div>
  );
}

/* ============================================================================
   LOGIN SCREEN — entry point before the app shell. Demo-only auth (any
   non-empty credentials proceed); its job here is to give "Exit Application"
   confirmation somewhere to apply before the user is ever logged in.
============================================================================ */

function LoginScreen({ onLogin }) {
  const { tokens, accent, appLogo, logoRadiusFraction, pageBgStyle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Demo login: fields are optional — clicking Login always proceeds,
  // with or without values entered.
  //
  // Deliberately NOT a native <form onSubmit>/<button type="submit"> pair:
  // the sandboxed preview iframe this app renders in has no "allow-forms"
  // permission, so the browser blocks native form submission outright
  // before it ever reaches a React handler — the Login button looked
  // completely dead because of that, not because of any app logic. A plain
  // click handler (plus a manual Enter-key listener for the same UX) sidesteps
  // the browser's form-submission gating entirely and works everywhere.
  const handleLogin = () => {
    onLogin();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    background: tokens.inputBg,
    border: `1px solid ${tokens.border}`,
    color: tokens.textPrimary,
    fontSize: 14,
    outline: "none",
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: "100vh", width: "100vw", ...pageBgStyle, padding: 20, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <div
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-5"
        style={{
          width: "min(360px, 100%)",
          padding: "32px 28px",
          borderRadius: 24,
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadow,
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 52, height: 52,
              borderRadius: appLogo ? logoFrameRadius(logoRadiusFraction, 52) : 16,
              background: appLogo ? "transparent" : accent("blue"),
              overflow: "hidden",
              transition: "border-radius 200ms ease",
            }}
          >
            {appLogo ? (
              <img src={appLogo} alt="App logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Route size={26} color="#fff" strokeWidth={2.25} />
            )}
          </div>
          <div className="text-center">
            <div style={{ fontSize: 18, fontWeight: 700, color: tokens.textPrimary, letterSpacing: "-0.01em" }}>
              RouteWise TMS
            </div>
            <div style={{ fontSize: 13, color: tokens.textSecondary, marginTop: 2 }}>
              Sign in to continue
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textSecondary }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: tokens.textTertiary }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textSecondary }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: tokens.textTertiary }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="rounded-xl"
          style={{
            padding: "12px 0", fontSize: 14.5, fontWeight: 700,
            color: "#fff", background: accent("blue"), border: "none", cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   AUTH GATE — sits directly under the global providers so BOTH the Login
   screen and the full app share the exact same Exit-confirmation guard, and
   the exact same confirm() dialog is used for Logout as for Exit. This is
   the only place either flow is wired up.
============================================================================ */

function AuthGate() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { confirm } = useConfirmDialog();
  useExitGuard(); // Back button → "Exit Application" dialog, on every screen

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout",
      message: "Are you sure you want to close your current session and log out?",
      danger: true,
    });
    if (confirmed) setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <NavigationProvider>
      <ControlPanelDataProvider>
        <AppShell onLogout={handleLogout} />
      </ControlPanelDataProvider>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FeedbackProvider>
        <ConfirmDialogProvider>
          <AuthGate />
        </ConfirmDialogProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}
