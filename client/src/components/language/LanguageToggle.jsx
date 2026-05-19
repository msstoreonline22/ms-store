import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-ms-border bg-white px-4 py-3 text-sm font-black text-ms-navy shadow-soft transition hover:bg-ms-cream"
      aria-label="Change language"
      data-no-translate
    >
      <Languages size={17} />
      {language === "ar" ? "EN" : "AR"}
    </button>
  );
}