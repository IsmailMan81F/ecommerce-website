import React, { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES, Language } from "@/context/LanguageContext";
import { Globe, Check } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "header" | "inline";
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "header",
  className = "",
}) => {
  const { language, setLanguage, currentOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (variant === "inline") {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--mid-gray)]">
          Language / اللغة
        </p>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-center gap-1.5 h-9 px-2 rounded-[14px] text-[12px] font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-2xs"
                    : "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                } ${lang.code === "ar" ? "font-arabic" : ""}`}
              >
                <span className="font-semibold text-[11px]">{lang.flagText}</span>
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button behind the Theme switch */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-[16px] border border-[var(--hairline)] bg-[var(--surface-alt)] hover:bg-[var(--paper)] text-[var(--ink)] text-[12px] font-medium transition-all shadow-2xs cursor-pointer hover:border-[var(--mid-gray)]/40"
        title="Change language / تغيير اللغة"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-[var(--mid-gray)]" />
        <span className="font-mono font-semibold tracking-wider text-[11px]">
          {currentOption.flagText}
        </span>
        <span className={`text-[12px] ${language === "ar" ? "font-arabic font-semibold" : ""}`}>
          {currentOption.nativeName}
        </span>
      </button>

      {/* Floating Selection Card */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-64 z-50 p-2 rounded-[20px] border border-[var(--hairline)] bg-[var(--paper)] text-[var(--ink)] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] animate-in fade-in-0 zoom-in-95 duration-100 ${
            language === "ar" ? "left-0" : "right-0"
          }`}
        >
          <div className="px-3 py-2 border-b border-[var(--hairline)]">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--mid-gray)]">
              Select Language / اختر اللغة
            </p>
          </div>

          <div className="p-1 space-y-1 mt-1">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[14px] text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold border border-[var(--hairline)]"
                      : "text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center justify-center h-6 w-7 rounded-[8px] text-[10px] font-mono font-semibold border ${
                        isSelected
                          ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                          : "bg-[var(--canvas)] text-[var(--mid-gray)] border-[var(--hairline)]"
                      }`}
                    >
                      {lang.flagText}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`text-[13px] leading-tight text-[var(--ink)] ${
                          lang.code === "ar" ? "font-arabic font-semibold" : ""
                        }`}
                      >
                        {lang.nativeName}
                      </span>
                      <span className="text-[11px] text-[var(--mid-gray)] leading-tight">
                        {lang.name}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
