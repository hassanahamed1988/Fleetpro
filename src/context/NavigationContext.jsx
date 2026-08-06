import { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { withAlpha } from "../lib/theme-colors";
import { ChevronLeft } from "lucide-react";

/* ============================================================================
   ROOT APP
============================================================================ */

export function useIsMobile() {
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

export function PageTransition({ pageKey, children, direction = "forward" }) {
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
export function useNavigator() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }) {
  const idRef = useRef(0);
  const [section, setSectionState] = useState("dashboard");
  const [overlays, setOverlays] = useState([]); // [{ id, label, element }]

  // depthRef always mirrors "how many history entries this provider has
  // pushed beyond the root": 0 on the dashboard, 1 while on any other
  // section, or 1+N with N subpages drilled into. sectionRef mirrors the
  // current section the same way. Both are read by push()/navigateToSection
  // BEFORE their own state updates land, and the effect below re-syncs them
  // right after every render — so they're always correct at the moment
  // each handler actually runs, even from inside the same tick a state
  // change was just made in.
  const depthRef = useRef(0);
  const sectionRef = useRef("dashboard");
  useEffect(() => {
    depthRef.current = (section !== "dashboard" ? 1 : 0) + overlays.length;
    sectionRef.current = section;
  }, [section, overlays]);

  // One real Android-app-style back stack, all the way down:
  //   depth 0        → Dashboard (root)
  //   depth 1        → any other section (Vehicles, Settings, …)
  //   depth 1+N      → N subpages drilled into from that section
  // The hardware/gesture Back button, Chrome's back button, and every
  // in-app "back" (pop / closeAll / navigateToSection("dashboard")) all
  // funnel through this ONE popstate listener — a single source of truth
  // instead of several independent handlers stepping on each other.
  const exitGuardRef = useRef(null);
  const exitGuardBusyRef = useRef(false);

  // Seed a TWO-entry bottom: a "guard" entry, then the Dashboard entry on
  // top of it. This is what makes the exit-confirmation fire ONLY on a
  // genuine hardware/gesture Back press with truly nothing left to close —
  // not on every arrival at the dashboard. Closing an overlay, returning
  // from a section, or tapping the in-app Home button all land back on the
  // plain Dashboard entry (tmsDepth: 0) sitting ABOVE the guard; only a
  // Back press from THERE reaches the guard entry underneath and asks to
  // exit. Without this second bottom entry, "arrived at the dashboard" and
  // "there's nothing left to go back to" were indistinguishable, which is
  // exactly what made the in-app Home button wrongly trigger the exit
  // dialog before.
  useEffect(() => {
    try {
      window.history.replaceState({ tmsGuard: true }, "");
      window.history.pushState({ tmsDepth: 0 }, "");
    } catch { /* iframe/sandbox without History permission — degrade silently */ }
  }, []);

  useEffect(() => {
    const onPopState = async (e) => {
      const state = e.state;

      if (state && state.tmsGuard) {
        // Landed on the bottom guard entry — nothing of ours is left above
        // it. This is a real Back press with the app already at rest on
        // the Dashboard, so it means "leave the app": ask for confirmation
        // exactly like a native Android app.
        setOverlays([]);
        setSectionState("dashboard");
        if (exitGuardBusyRef.current) return;
        const guard = exitGuardRef.current;
        if (!guard) return; // dialog system not mounted yet — just stay put
        exitGuardBusyRef.current = true;
        const confirmed = await guard();
        exitGuardBusyRef.current = false;
        if (confirmed) {
          // Browsers only allow window.close() on tabs opened by script; a
          // PWA launched from the home screen (the normal case here)
          // closes fine. Where it's blocked, nothing is re-pushed here, so
          // the very next native Back press exits the ordinary way.
          try { window.close(); } catch { /* not permitted here — ignore */ }
        } else {
          try { window.history.pushState({ tmsDepth: 0 }, ""); } catch { /* ignore */ }
        }
        return;
      }

      // Any other landing spot (an overlay depth, or the plain Dashboard
      // entry) — never the exit dialog, just reconcile in-app state to
      // match wherever history landed.
      const target = state?.tmsDepth ?? 0;
      if (target > 0) {
        setOverlays((s) => s.slice(0, target - 1));
      } else {
        setOverlays([]);
        setSectionState("dashboard");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Registered once by useExitGuard() — decouples "what happens at the
  // root" (ask a confirm() question) from "how the back stack is modeled"
  // (this provider), so the dialog UI itself lives in ConfirmDialogContext.
  const registerExitGuard = useCallback((fn) => { exitGuardRef.current = fn; }, []);

  // Switch top-level section (sidebar / bottom nav). Any open subpage is
  // always closed first — matches the app's own rule that a section isn't
  // itself back-stackable, only the subpages drilled into from it are.
  // Dashboard → another section pushes one entry (so Back returns Home).
  // Section → a different section replaces that entry (tab-switch style —
  // doesn't grow the stack, still just one Back press from Home either way).
  // Re-tapping the SAME section you're already on (e.g. Home while a
  // Dashboard-opened subpage like "Add Money" is showing) still has to
  // unwind that subpage's own pushed history entries — skipping that step
  // was the original bug: it left a phantom entry behind that silently
  // corrupted every later back-depth calculation until it eventually
  // walked straight into the exit-confirmation guard.
  const navigateToSection = useCallback((key) => {
    const prev = sectionRef.current;
    const overlaysOpen = depthRef.current - (prev !== "dashboard" ? 1 : 0);

    if (key === prev) {
      if (overlaysOpen > 0) {
        setOverlays([]);
        try { window.history.go(-overlaysOpen); } catch { /* ignore */ }
      }
      return;
    }

    setOverlays([]);

    if (key === "dashboard") {
      if (depthRef.current > 0) {
        try { window.history.go(-depthRef.current); } catch { /* ignore */ }
      }
      setSectionState("dashboard");
      return;
    }

    try {
      if (prev === "dashboard") window.history.pushState({ tmsDepth: 1 }, "");
      else window.history.replaceState({ tmsDepth: 1 }, "");
    } catch { /* ignore */ }
    setSectionState(key);
  }, []);

  // Drill into a subpage from whatever is currently on top.
  const push = useCallback((label, element) => {
    idRef.current += 1;
    const newDepth = depthRef.current + 1;
    setOverlays((s) => [...s, { id: idRef.current, label, element }]);
    try { window.history.pushState({ tmsDepth: newDepth }, ""); } catch { /* ignore */ }
  }, []);

  // Return to the previous layer. No-op if nothing is pushed. Goes through
  // history.back() (not a direct state slice) so a subsequent hardware
  // Back press doesn't also try to "consume" an entry that's already gone.
  const pop = useCallback(() => {
    if (depthRef.current <= (section === "dashboard" ? 0 : 1)) return;
    try { window.history.back(); } catch { /* ignore */ }
  }, [section]);

  // Instantly clear every pushed subpage layer — used when the user
  // switches top-level section via the sidebar / bottom nav while a
  // subpage is open. Unwinds the matching history entries too, so Back
  // doesn't later replay through subpages dismissed this way.
  const closeAll = useCallback(() => {
    setOverlays((s) => {
      if (s.length > 0) { try { window.history.go(-s.length); } catch { /* ignore */ } }
      return s;
    });
  }, []);

  const top = overlays.length > 0 ? overlays[overlays.length - 1] : null;
  const canGoBack = overlays.length > 0;

  const value = useMemo(
    () => ({ overlays, top, canGoBack, push, pop, closeAll, section, navigateToSection, registerExitGuard }),
    [overlays, top, canGoBack, push, pop, closeAll, section, navigateToSection, registerExitGuard]
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
export function NavigationOverlayOutlet({ children }) {
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

