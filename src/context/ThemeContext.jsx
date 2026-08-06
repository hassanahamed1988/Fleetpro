import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  LIGHT_BG_DEFAULT, DARK_BG_DEFAULT, buildTokens, mix, accentColor,
} from "../lib/theme-colors";

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

export function ThemeProvider({ children }) {
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
    setBgImageTopColor(null);
    (async () => {
      try { await window.storage?.delete(BG_IMAGE_STORAGE_KEY, false); } catch { /* best-effort */ }
    })();
  }, []);

  // bgImageTopColor — a solid color sampled from the top strip of the
  // uploaded background image. Browsers only let a status bar be painted
  // with a single flat color (there's no way to show the actual photo
  // behind the phone's status-bar icons), so instead of leaving a
  // mismatched theme color up there, we pick the color that's actually
  // showing at the top edge of the image and use that for the status bar
  // — the closest approximation to "the image continues underneath".
  const [bgImageTopColor, setBgImageTopColor] = useState(null);
  useEffect(() => {
    if (!bgImage) {
      setBgImageTopColor(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = 40, h = 8;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        // Mirror the CSS `background-size: cover; background-position:
        // center` math so we sample the same strip of the source image
        // that ends up rendered behind the status bar.
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (w - dw) / 2, 0, dw, dh);
        const { data } = ctx.getImageData(0, 0, w, h);
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1;
        }
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        if (!cancelled) setBgImageTopColor(hex);
      } catch {
        if (!cancelled) setBgImageTopColor(null);
      }
    };
    img.onerror = () => { if (!cancelled) setBgImageTopColor(null); };
    img.src = bgImage;
    return () => { cancelled = true; };
  }, [bgImage]);

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

  // ---------------------------------------------------------------------
  // EDGE-TO-EDGE STATUS BAR — makes the app background reach all the way
  // up behind the device status bar (time / signal / battery / wifi icons),
  // with no separate white or black strip ever showing behind it, and with
  // the icons themselves auto-switching light/dark to stay legible. Wired
  // here (not per-page) so it's automatically global — every screen shares
  // this same ThemeProvider and therefore the same fix.
  //
  //  1. `viewport-fit=cover` tells the browser/webview the page is allowed
  //     to draw underneath the notch/status bar, which is what makes
  //     `env(safe-area-inset-top)` resolve to a real, non-zero value.
  //  2. `theme-color` is kept in sync with the live background color, so
  //     Android's status bar (and Chrome's UI chrome) always matches.
  //  3. `apple-mobile-web-app-status-bar-style` flips between
  //     "black-translucent" (light icons, for dark backgrounds) and
  //     "default" (dark icons, for light backgrounds) so iOS status bar
  //     icons stay visible against whatever background color is active.
  useEffect(() => {
    const ensureMeta = (attr, name, content) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    let vp = document.querySelector('meta[name="viewport"]');
    if (!vp) {
      vp = document.createElement("meta");
      vp.setAttribute("name", "viewport");
      document.head.appendChild(vp);
    }
    const currentVp = vp.getAttribute("content") || "width=device-width, initial-scale=1";
    if (!/viewport-fit=cover/.test(currentVp)) {
      vp.setAttribute("content", `${currentVp}, viewport-fit=cover`);
    }

    ensureMeta("name", "theme-color", tokens.chrome);
    ensureMeta("name", "apple-mobile-web-app-capable", "yes");
    ensureMeta("name", "mobile-web-app-capable", "yes");
    // Dark background → light (translucent) status bar icons. Light
    // background → default dark icons. Always legible either way.
    ensureMeta("name", "apple-mobile-web-app-status-bar-style", tokens.chromeDark ? "black-translucent" : "default");
  }, [tokens.chrome, tokens.chromeDark]);

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
        {/* Full-bleed strip painted behind the device status bar. Fixed +
            highest z-index so it always sits above every screen, dialog,
            and menu. Uses `tokens.chrome` — not `tokens.bg` — because the
            header bar sitting directly underneath is always painted with
            tokens.chrome (opaque, even over a custom background image),
            so matching that color (not the page background) is what
            actually makes the seam between them disappear. */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            height: "env(safe-area-inset-top, 0px)",
            background: tokens.chrome,
            zIndex: 2147483000,
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

