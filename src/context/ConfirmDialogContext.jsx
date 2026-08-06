import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { useAppSettings, useLang } from "./AppSettingsContext";
import { useNavigator } from "./NavigationContext";

/* ============================================================================
   GLOBAL CONFIRMATION DIALOG — one reusable iOS-style Yes/No dialog for the
   entire app (Exit, Logout, and anything added later). Any component calls
   useConfirmDialog().confirm({ title, message }) and awaits a boolean; the
   design, animation, and blur behavior live here ONCE, so no page ever needs
   to build or style its own confirmation dialog.
============================================================================ */

const ConfirmDialogContext = createContext(null);
export function useConfirmDialog() {
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

export function ConfirmDialogProvider({ children }) {
  const { t } = useLang();
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
        confirmLabel: opts.confirmLabel || t("common.yes", "Yes"),
        cancelLabel: opts.cancelLabel || t("common.no", "No"),
        danger: !!opts.danger,
      });
    });
  }, [t]);

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

// Global "Exit Application" guard — registers a confirm() callback with
// NavigationProvider's single back-stack handler, which calls it exactly
// when Back is pressed at the true root (Dashboard, nothing pushed on top)
// — the same confirm() dialog used for Logout, on every screen including
// Login (NavigationProvider now wraps both — see AuthGate.jsx).
export function useExitGuard() {
  const { confirm } = useConfirmDialog();
  const { t } = useLang();
  const { registerExitGuard } = useNavigator();

  useEffect(() => {
    if (!registerExitGuard) return;
    registerExitGuard(() => confirm({
      title: t("dialog.exitTitle", "Exit Application"),
      message: t("dialog.exitMessage", "Are you sure you want to exit the application?"),
    }));
    return () => registerExitGuard(null);
  }, [confirm, t, registerExitGuard]);
}

