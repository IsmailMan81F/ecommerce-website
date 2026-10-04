import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANGUAGES, type LanguageCode } from "@/i18n";

interface LanguageSwitcherProps {
  variant?: "card" | "dropdown";
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "card",
  className = "",
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) as LanguageCode) || "en";

  const changeLanguage = (code: LanguageCode) => {
    i18n.changeLanguage(code);
  };

  // Selection Options Card (inline card with simple options: English, French, العربية)
  if (variant === "card") {
    return (
      <div
        className={`flex items-center gap-1 bg-[var(--paper)] p-1 rounded-[14px] border border-[var(--hairline)] ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => changeLanguage("en")}
          className={`p-1.5 px-2.5 rounded-[10px] text-[11px] font-medium transition-colors cursor-pointer ${
            currentLang === "en"
              ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs border border-[var(--hairline)]"
              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
          }`}
          title="English"
        >
          English
        </button>
        <button
          type="button"
          onClick={() => changeLanguage("fr")}
          className={`p-1.5 px-2.5 rounded-[10px] text-[11px] font-medium transition-colors cursor-pointer ${
            currentLang === "fr"
              ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs border border-[var(--hairline)]"
              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
          }`}
          title="French"
        >
          French
        </button>
        <button
          type="button"
          onClick={() => changeLanguage("ar")}
          className={`p-1.5 px-2.5 rounded-[10px] text-[11px] font-medium transition-colors cursor-pointer ${
            currentLang === "ar"
              ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs border border-[var(--hairline)]"
              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
          }`}
          title="العربية"
        >
          العربية
        </button>
      </div>
    );
  }

  // Dropdown that opens a simple Selection Options Card
  const currentOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 px-2.5 rounded-[18px] text-[13px] font-medium text-[var(--ink)] border border-transparent hover:border-[var(--hairline)] gap-1.5 ${className}`}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 text-[var(--mid-gray)]" />
          <span className="hidden sm:inline font-medium">
            {currentOption.code === "ar" ? "العربية" : currentOption.code === "fr" ? "French" : "English"}
          </span>
          <span className="sm:hidden uppercase text-[11px] font-mono">
            {currentOption.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] p-1.5 rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={`flex items-center justify-between px-3 py-2 rounded-[12px] text-[13px] cursor-pointer ${
            currentLang === "en" ? "bg-[var(--surface-alt)] font-semibold text-[var(--ink)]" : "text-[var(--mid-gray)]"
          }`}
        >
          <span>English</span>
          {currentLang === "en" && <Check className="h-3.5 w-3.5 text-[var(--ink)]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("fr")}
          className={`flex items-center justify-between px-3 py-2 rounded-[12px] text-[13px] cursor-pointer ${
            currentLang === "fr" ? "bg-[var(--surface-alt)] font-semibold text-[var(--ink)]" : "text-[var(--mid-gray)]"
          }`}
        >
          <span>French</span>
          {currentLang === "fr" && <Check className="h-3.5 w-3.5 text-[var(--ink)]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ar")}
          className={`flex items-center justify-between px-3 py-2 rounded-[12px] text-[13px] cursor-pointer ${
            currentLang === "ar" ? "bg-[var(--surface-alt)] font-semibold text-[var(--ink)]" : "text-[var(--mid-gray)]"
          }`}
        >
          <span className="font-arabic">العربية</span>
          {currentLang === "ar" && <Check className="h-3.5 w-3.5 text-[var(--ink)]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
