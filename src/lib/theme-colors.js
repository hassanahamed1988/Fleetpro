// Color system: hex/rgb helpers, contrast, brand accents, and the
// buildTokens() function that derives every surface/border/text color
// in the app from a single background color.

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex({ r, g, b }) {
  const h = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function isDarkColor(hex) {
  try {
    return relativeLuminance(hexToRgb(hex)) < 0.5;
  } catch {
    return false;
  }
}

export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Floating-label text style: first letter capitalized, everything else
// lowercase — e.g. "Company Name" → "Company name". Applied at render time
// so the underlying label strings (used elsewhere as titles, headings,
// success messages, etc.) stay unchanged; only what's shown inside the
// floating-label fields is affected.
export function toSentenceCase(str) {
  if (!str) return str;
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Reads an uploaded image file and returns a compact base64 data URL,
// downscaling large photos so they stay well under storage limits.
export function fileToCompactDataUrl(file, maxDimension = 1600, quality = 0.85) {
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
export function fileToLogoDataUrl(file, maxDimension = 512) {
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
export function detectLogoCornerRadius(dataUrl) {
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
export function logoFrameRadius(fraction, sizePx) {
  if (fraction >= 0.47) return "50%";
  return Math.round(fraction * sizePx);
}

export const LIGHT_BG_DEFAULT = "#F1F4F9";
// Global dark-mode base color. Every dark-mode surface in the app — main
// background, sidebar, top bar, cards, dialogs, tables — is derived from
// this single value via buildTokens(), so switching to dark mode applies it
// everywhere consistently, not just on one type of card.
export const DARK_BG_DEFAULT = "#002843";

export const BRAND = {
  blue: { base: "#2F6FED", dark: "#6C97F5" },
  green: { base: "#159A73", dark: "#3ED9A6" },
  amber: { base: "#DA8A1F", dark: "#F3B65E" },
  red: { base: "#E1444B", dark: "#FF7A7F" },
  violet: { base: "#7C5CF0", dark: "#A796FF" },
  teal: { base: "#0E9E9C", dark: "#4EE0DC" },
};

export function accentColor(name, isDark) {
  return isDark ? BRAND[name].dark : BRAND[name].base;
}

export function buildTokens(bgHex, chromeHex, sidebarHex, modeIsDark) {
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
