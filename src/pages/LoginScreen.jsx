import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/AppSettingsContext";
import { logoFrameRadius } from "../lib/theme-colors";
import {
  Route, Lock, Mail,
} from "lucide-react";

/* ============================================================================
   LOGIN SCREEN — entry point before the app shell. Demo-only auth (any
   non-empty credentials proceed); its job here is to give "Exit Application"
   confirmation somewhere to apply before the user is ever logged in.
============================================================================ */

export default function LoginScreen({ onLogin }) {
  const { tokens, accent, appLogo, logoRadiusFraction, pageBgStyle } = useTheme();
  const { t } = useLang();
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
              {t("login.subtitle", "Sign in to continue")}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textSecondary }}>{t("login.email", "Email")}</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: tokens.textTertiary }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder", "you@company.com")}
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textSecondary }}>{t("login.password", "Password")}</label>
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
          {t("common.login", "Login")}
        </button>
      </div>
    </div>
  );
}

