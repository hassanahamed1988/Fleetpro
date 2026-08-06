import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLang, useCurrency } from "../context/AppSettingsContext";
import { withAlpha, mix, toSentenceCase } from "../lib/theme-colors";
import {
  X, ChevronDown, Trash2,
} from "lucide-react";

/* ============================================================================
   REUSABLE PRIMITIVES
============================================================================ */

const ICON = 18;

export function Card({ children, style, padding = 20, hoverable = false, className = "" }) {
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

export function Button({
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

export function IconButton({ icon: Icon, onClick, label, active, onLiveBg = false }) {
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

export function Badge({ children, tone = "blue" }) {
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

export function Dot({ tone = "blue", size = 8 }) {
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

export function SectionHeading({ tone = "blue", children, action }) {
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
export function DeleteRowButton({ onClick }) {
  const { tokens, accent } = useTheme();
  const { t } = useLang();
  const [hover, setHover] = useState(false);
  const red = accent("red");
  return (
    <button
      type="button"
      aria-label="Delete row"
      title={t("common.delete", "Delete")}
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

export function Table({ columns, rows, renderCell, onDeleteRow }) {
  const { tokens } = useTheme();
  const { formatAmount } = useCurrency();
  const defaultCell = (col, row) => (col.currency ? formatAmount(row[col.key]) : row[col.key]);
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
                  {renderCell ? renderCell(col.key, row) ?? defaultCell(col, row) : defaultCell(col, row)}
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

export function Dialog({ open, onClose, title, children, footer, width = 460 }) {
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

export function FloatingInput({ label, value, onChange, type = "text", disabled, surfaceBg, ...rest }) {
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

export function FloatingSelect({ label, options, value, onChange, surfaceBg, ...rest }) {
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

