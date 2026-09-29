import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Lock, EyeOff, FileText, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)]">
          <Link to="/" className="hover:text-[var(--ink)] transition-colors">
            {t("categories.breadcrumbsHome")}
          </Link>
          <span>/</span>
          <span className="text-[var(--ink)]">{t("footer.privacyPolicy")}</span>
        </div>
        <h1 className="text-heading-lg text-[var(--ink)] tracking-tight">
          {t("privacy.title")}
        </h1>
        <p className="text-body-lg text-[var(--mid-gray)]">
          {t("privacy.subtitle")}
        </p>
        <p className="text-caption text-[var(--mid-gray)] pt-1">
          {t("privacy.effectiveDate")}
        </p>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <Lock className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">{t("privacy.card1Title")}</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            {t("privacy.card1Desc")}
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">{t("privacy.card2Title")}</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            {t("privacy.card2Desc")}
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <EyeOff className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">{t("privacy.card3Title")}</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            {t("privacy.card3Desc")}
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-[var(--ink)] border-t border-[var(--hairline)] pt-10">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("privacy.sec1Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("privacy.sec1Desc")}
          </p>
          <ul className="list-disc ps-5 space-y-1.5 text-body text-[var(--mid-gray)] text-[14px]">
            <li><strong className="text-[var(--ink)]">{t("privacy.sec1Item1Title")} </strong>{t("privacy.sec1Item1Desc")}</li>
            <li><strong className="text-[var(--ink)]">{t("privacy.sec1Item2Title")} </strong>{t("privacy.sec1Item2Desc")}</li>
            <li><strong className="text-[var(--ink)]">{t("privacy.sec1Item3Title")} </strong>{t("privacy.sec1Item3Desc")}</li>
            <li><strong className="text-[var(--ink)]">{t("privacy.sec1Item4Title")} </strong>{t("privacy.sec1Item4Desc")}</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("privacy.sec2Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("privacy.sec2Desc")}
          </p>
          <ul className="list-disc ps-5 space-y-1.5 text-body text-[var(--mid-gray)] text-[14px]">
            <li>{t("privacy.sec2Item1")}</li>
            <li>{t("privacy.sec2Item2")}</li>
            <li>{t("privacy.sec2Item3")}</li>
            <li>{t("privacy.sec2Item4")}</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("privacy.sec3Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("privacy.sec3Desc")}
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("privacy.sec4Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("privacy.sec4Desc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-[14px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
              <p className="text-[14px] font-medium text-[var(--ink)]">{t("privacy.sec4Card1Title")}</p>
              <p className="text-[13px] text-[var(--mid-gray)]">{t("privacy.sec4Card1Desc")}</p>
            </div>
            <div className="p-4 rounded-[14px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
              <p className="text-[14px] font-medium text-[var(--ink)]">{t("privacy.sec4Card2Title")}</p>
              <p className="text-[13px] text-[var(--mid-gray)]">{t("privacy.sec4Card2Desc")}</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("privacy.sec5Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("privacy.sec5Desc")}
          </p>
          <div className="p-6 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">{t("privacy.governanceTitle")}</p>
              <p className="text-caption text-[var(--mid-gray)] normal-case">{t("privacy.governanceCoords")}</p>
            </div>
            <Link to="/contact">
              <Button variant="outline" className="rounded-[18px] gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                <span>{t("privacy.contactBtn")}</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
