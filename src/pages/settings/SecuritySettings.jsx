import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/AppSettingsContext";
import { useFeedback } from "../../context/FeedbackContext";
import { withAlpha } from "../../lib/theme-colors";
import { Card, Button, SectionHeading, FloatingInput } from "../../components/ui-kit";
import {
  ShieldCheck, Lock, Fingerprint, Smartphone, QrCode,
} from "lucide-react";

/* ============================================================================
   SECURITY & PASSWORD SUBPAGE
============================================================================ */

// Google Authenticator card — lets the user toggle on 2-step verification,
// scan a (demo) QR code / copy the secret key, then confirm with a 6-digit
// code before the feature is marked as enabled.
function GoogleAuthenticatorCard() {
  const { tokens, accent } = useTheme();
  const { showFeedback } = useFeedback();
  const { t } = useLang();
  const [enabled, setEnabled] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const secretKey = "JBSW Y3DP EHPK 3PXP";

  const handleToggle = (v) => {
    if (v) {
      setSetupOpen(true);
    } else {
      setEnabled(false);
      setSetupOpen(false);
      setOtp("");
      showFeedback(t("security.authenticatorDisabled", "Google Authenticator disabled"));
    }
  };

  const handleVerify = () => {
    if (otp.trim().length !== 6) return;
    setEnabled(true);
    setSetupOpen(false);
    setOtp("");
    showFeedback(t("security.authenticatorEnabled", "Google Authenticator enabled"));
  };

  return (
    <Card padding={22}>
      <SectionHeading tone="blue">{t("security.authenticatorTitle", "Google Authenticator")}</SectionHeading>
      <BiometricRow
        icon={Smartphone}
        tone="blue"
        title={t("security.authenticatorRowTitle", "Authenticator App")}
        description={t("security.authenticatorRowDesc", "Use Google Authenticator for 2-step verification")}
        checked={enabled || setupOpen}
        onChange={handleToggle}
      />

      {setupOpen && !enabled && (
        <div style={{ borderTop: `1px solid ${tokens.divider}`, marginTop: 4, paddingTop: 18 }}>
          <div className="flex items-start gap-4" style={{ marginBottom: 16 }}>
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 84, height: 84, background: tokens.surfaceSunken, border: `1px solid ${tokens.bgBorder}` }}
            >
              <QrCode size={44} color={tokens.textTertiary} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p style={{ fontSize: 12.5, color: tokens.textSecondary, lineHeight: 1.5 }}>
                {t("security.authenticatorScanHint", "Scan this QR code with the Google Authenticator app, or enter the key manually:")}
              </p>
              <div
                style={{
                  fontFamily: "monospace", fontSize: 13, fontWeight: 650, color: accent("blue"),
                  marginTop: 6, letterSpacing: "0.05em", wordBreak: "break-all",
                }}
              >
                {secretKey}
              </div>
            </div>
          </div>
          <FloatingInput
            label={t("security.authenticatorCodeLabel", "6-digit code")}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <Button icon={ShieldCheck} onClick={handleVerify} disabled={otp.trim().length !== 6}>
            {t("security.authenticatorVerify", "Verify & Enable")}
          </Button>
        </div>
      )}

      {enabled && (
        <p style={{ fontSize: 12, color: accent("green"), marginTop: 8, fontWeight: 600 }}>
          {t("security.authenticatorEnabledHint", "Google Authenticator is protecting your account.")}
        </p>
      )}
    </Card>
  );
}

export default function SecurityPasswordSubpage() {
  const { tokens, accent } = useTheme();
  const { showFeedback } = useFeedback();
  const { t } = useLang();
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
    showFeedback(t("security.passwordUpdated", "Password updated"));
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 520 }}>
      <Card padding={22}>
        <SectionHeading tone="red">{t("security.changePassword", "Change Password")}</SectionHeading>
        <FloatingInput
          label={t("security.currentPassword", "Current Password")}
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <FloatingInput
          label={t("security.newPassword", "New Password")}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <FloatingInput
          label={t("security.confirmPassword", "Confirm New Password")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {mismatch && (
          <p style={{ fontSize: 12, color: accent("red"), marginTop: -8, marginBottom: 12 }}>
            {t("security.mismatch", "New password and confirmation don't match.")}
          </p>
        )}
        <Button icon={Lock} onClick={handleUpdate} disabled={!isValid}>{t("common.updatePassword", "Update Password")}</Button>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 12 }}>
          {t("security.hint", "Use at least 6 characters. You'll stay logged in on this device after updating.")}
        </p>
      </Card>

      <GoogleAuthenticatorCard />
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

export function BiometricSecuritySubpage() {
  const { tokens } = useTheme();
  const { showFeedback } = useFeedback();
  const { t } = useLang();
  const [fingerprint, setFingerprint] = useState(false);
  const [faceId, setFaceId] = useState(false);

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 520 }}>
      <Card padding={22}>
        <SectionHeading tone="violet">{t("security.biometricTitle", "Biometric Security")}</SectionHeading>
        <div className="flex flex-col">
          <div style={{ borderBottom: `1px solid ${tokens.divider}` }}>
            <BiometricRow
              icon={Fingerprint}
              tone="violet"
              title={t("security.fingerprintTitle", "Fingerprint Login")}
              description={t("security.fingerprintDesc", "Unlock the app with your fingerprint")}
              checked={fingerprint}
              onChange={(v) => {
                setFingerprint(v);
                showFeedback(v ? t("security.fingerprintEnabled", "Fingerprint login enabled") : t("security.fingerprintDisabled", "Fingerprint login disabled"));
              }}
            />
          </div>
          <BiometricRow
            icon={ShieldCheck}
            tone="blue"
            title={t("security.faceIdTitle", "Face ID Login")}
            description={t("security.faceIdDesc", "Unlock the app by scanning your face")}
            checked={faceId}
            onChange={(v) => {
              setFaceId(v);
              showFeedback(v ? t("security.faceIdEnabled", "Face ID login enabled") : t("security.faceIdDisabled", "Face ID login disabled"));
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: tokens.textTertiary, marginTop: 8 }}>
          {t("security.biometricHint", "When enabled, you can use biometrics instead of your password to log in.")}
        </p>
      </Card>
    </div>
  );
}

