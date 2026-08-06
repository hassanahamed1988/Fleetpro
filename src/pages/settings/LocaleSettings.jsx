import { useTheme } from "../../context/ThemeContext";
import { useLang, useCurrency } from "../../context/AppSettingsContext";
import { useFeedback } from "../../context/FeedbackContext";
import { withAlpha } from "../../lib/theme-colors";
import { Card, SectionHeading } from "../../components/ui-kit";
import {
  Check,
} from "lucide-react";

/* ============================================================================
   LANGUAGE & CURRENCY SUBPAGES — each option shows its country in small
   text underneath the main label.
============================================================================ */

const LANGUAGE_OPTIONS = [
  { id: "bn", label: "Bangla", country: "Bangladesh" },
  { id: "en", label: "English", country: "United States" },
  { id: "ar", label: "Arabic", country: "Qatar" },
];

const CURRENCY_OPTIONS = [
  { id: "bdt", label: "BDT", country: "Bangladesh" },
  { id: "qar", label: "QAR", country: "Qatar" },
  { id: "usd", label: "USD", country: "United States" },
];

function SettingsOptionRow({ label, country, selected, onSelect }) {
  const { tokens, accent } = useTheme();
  const blue = accent("blue");
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center justify-between w-full rounded-2xl text-left"
      style={{
        padding: "14px 16px",
        marginBottom: 10,
        background: selected ? withAlpha(blue, 0.1) : tokens.surfaceSunken,
        border: `1.5px solid ${selected ? blue : tokens.bgBorder}`,
        cursor: "pointer",
        transition: "all 180ms ease",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 650, color: selected ? blue : tokens.bgTextPrimary }}>
          {label}
        </div>
        <div style={{ fontSize: 11.5, color: tokens.bgTextTertiary, marginTop: 2 }}>
          {country}
        </div>
      </div>
      {selected && <Check size={18} color={blue} strokeWidth={2.5} />}
    </button>
  );
}

export default function LanguageSubpage() {
  const { showFeedback } = useFeedback();
  const { lang, setLang, t } = useLang();

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 460 }}>
      <Card padding={22}>
        <SectionHeading tone="teal">{t("settingsCard.language.label", "Language")}</SectionHeading>
        {LANGUAGE_OPTIONS.map((opt) => {
          const label = t(`languageOption.${opt.id}Label`, opt.label);
          const country = t(`languageOption.${opt.id}Country`, opt.country);
          return (
            <SettingsOptionRow
              key={opt.id}
              label={label}
              country={country}
              selected={lang === opt.id}
              onSelect={() => { setLang(opt.id); showFeedback(`${label} ${t("common.selected", "selected")}`); }}
            />
          );
        })}
      </Card>
    </div>
  );
}

export function CurrencySubpage() {
  const { showFeedback } = useFeedback();
  const { currency, setCurrency } = useCurrency();
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 460 }}>
      <Card padding={22}>
        <SectionHeading tone="amber">{t("settingsCard.currency.label", "Currency")}</SectionHeading>
        {CURRENCY_OPTIONS.map((opt) => {
          const country = t(`currencyOption.${opt.id}Country`, opt.country);
          return (
            <SettingsOptionRow
              key={opt.id}
              label={opt.label}
              country={country}
              selected={currency === opt.id}
              onSelect={() => { setCurrency(opt.id); showFeedback(`${opt.label} ${t("common.selected", "selected")}`); }}
            />
          );
        })}
      </Card>
    </div>
  );
}

