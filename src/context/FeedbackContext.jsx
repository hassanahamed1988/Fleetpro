import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { withAlpha } from "../lib/theme-colors";
import { Check } from "lucide-react";

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
export function useFeedback() {
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

export function FeedbackProvider({ children }) {
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

