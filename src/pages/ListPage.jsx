import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFeedback } from "../context/FeedbackContext";
import { useLang } from "../context/AppSettingsContext";
import StatCard from "../components/StatCard";
import { Card, Button, SectionHeading, Table, Badge, Dialog, FloatingInput, FloatingSelect } from "../components/ui-kit";
import { LIST_CONFIG, ADD_SUCCESS_MESSAGE, DELETE_SUCCESS_MESSAGE } from "../config/appData";
import { Plus, Check } from "lucide-react";

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

export default function ListPage({ pageKey }) {
  const config = LIST_CONFIG[pageKey];
  const { tokens } = useTheme();
  const { showFeedback } = useFeedback();
  const { t, tFeedback } = useLang();
  const [rows, setRows] = useState(config.rows);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { setRows(config.rows); setForm({}); }, [pageKey]); // eslint-disable-line

  const summary = useMemo(() => computeSummary(config, rows), [config, rows]);
  const title = t(`nav.${pageKey}`, config.title);

  const handleAdd = () => {
    if (config.fields.length === 0) { setOpen(false); return; }
    setRows((r) => [{ ...form, id: form.id || `NEW-${r.length + 1}` }, ...r]);
    setForm({});
    setOpen(false);
    showFeedback(tFeedback("add", pageKey, ADD_SUCCESS_MESSAGE[pageKey] || "Saved successfully"));
  };

  const handleDelete = (row, index) => {
    setRows((r) => r.filter((_, i) => i !== index));
    showFeedback(tFeedback("delete", pageKey, DELETE_SUCCESS_MESSAGE[pageKey] || "Deleted successfully"));
  };

  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: tokens.bgTextPrimary, letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p style={{ fontSize: 13.5, color: tokens.bgTextSecondary, marginTop: 3 }}>
            {t("common.recordsCount", `${rows.length} ${rows.length === 1 ? "record" : "records"} total`, {
              count: rows.length,
              unit: rows.length === 1 ? t("common.record", "record") : t("common.records", "records"),
            })}
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
        <SectionHeading tone={config.tone}>{t("common.all", "All")} {title}</SectionHeading>
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
          <Button variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel", "Cancel")}</Button>
          <Button icon={Check} onClick={handleAdd}>{t("common.save", "Save")}</Button>
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

