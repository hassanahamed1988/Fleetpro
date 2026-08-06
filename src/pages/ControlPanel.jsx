import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFeedback } from "../context/FeedbackContext";
import { useLang } from "../context/AppSettingsContext";
import { useNavigator } from "../context/NavigationContext";
import { withAlpha } from "../lib/theme-colors";
import { Card, Button, SectionHeading, Table, Dialog, FloatingInput } from "../components/ui-kit";
import { CONTROL_PANEL_ITEMS } from "../config/appData";
import { Check, ChevronRight, Plus } from "lucide-react";

/* ============================================================================
   CONTROL PANEL DATA — lives above both ControlPanelPage (the grid) and
   ControlPanelItemPage (the pushed subpage) so the subpage can read/write
   it directly via context. Keeping it here means ControlPanelPage never
   needs to unmount or stay alive purely to "hold" this state — the subpage
   is a self-sufficient navigation stack entry.
============================================================================ */

const ControlPanelDataContext = createContext(null);
export function useControlPanelData() {
  return useContext(ControlPanelDataContext);
}

export function ControlPanelDataProvider({ children }) {
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

function ControlPanelCard({ item, label, description, onClick }) {
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
        <div style={{ fontSize: 14, fontWeight: 650, color: tokens.textPrimary }}>{label}</div>
        <div style={{ fontSize: 11.5, color: tokens.textTertiary, marginTop: 1 }}>{description}</div>
      </div>
      <ChevronRight size={17} color={tokens.textTertiary} style={{ flexShrink: 0 }} />
    </button>
  );
}

export function ControlPanelItemPage({ item }) {
  const { tokens } = useTheme();
  const { showFeedback } = useFeedback();
  const { t } = useLang();
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
        <SectionHeading tone={item.tone}>{t("common.addNew", "Add New")}</SectionHeading>
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
        <SectionHeading tone={item.tone}>{t("common.savedEntries", "Saved Entries")}</SectionHeading>
        <Table columns={item.fields} rows={entries} onDeleteRow={(row, i) => deleteEntry(item.key, i)} />
      </Card>
    </div>
  );
}

export default function ControlPanelPage() {
  const nav = useNavigator();
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {CONTROL_PANEL_ITEMS.map((item) => {
          const label = t(`controlPanel.${item.key}.label`, item.label);
          const description = t(`controlPanel.${item.key}.description`, item.description);
          return (
            <ControlPanelCard
              key={item.key}
              item={item}
              label={label}
              description={description}
              onClick={() => nav.push(label, <ControlPanelItemPage item={item} />)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   SETTINGS PAGE — theme mode, custom background, persistence controls
============================================================================ */

