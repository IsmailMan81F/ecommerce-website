import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Scale, CheckCircle2, RotateCcw, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TermsPage: React.FC = () => {
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
          <span className="text-[var(--ink)]">{t("footer.termsOfService")}</span>
        </div>
        <h1 className="text-heading-lg text-[var(--ink)] tracking-tight">
          {t("terms.title")}
        </h1>
        <p className="text-body-lg text-[var(--mid-gray)]">
          {t("terms.subtitle")}
        </p>
        <p className="text-caption text-[var(--mid-gray)] pt-1">
          {t("terms.effectiveDate")}
        </p>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">{t("terms.card1Title")}</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            {t("terms.card1Desc")}
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <RotateCcw className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">{t("terms.card2Title")}</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            {t("terms.card2Desc")}
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">{t("terms.card3Title")}</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            {t("terms.card3Desc")}
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-[var(--ink)] border-t border-[var(--hairline)] pt-10">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("terms.sec1Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("terms.sec1Desc")}
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("terms.sec2Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("terms.sec2Desc")}
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("terms.sec3Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("terms.sec3Desc")}
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("terms.sec4Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("terms.sec4Desc")}
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("terms.sec5Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("terms.sec5Desc")}
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">{t("terms.sec6Title")}</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("terms.sec6Desc")}
          </p>
          <div className="p-6 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">{t("terms.supportTitle")}</p>
              <p className="text-caption text-[var(--mid-gray)] normal-case">{t("terms.supportCoords")}</p>
            </div>
            <Link to="/contact">
              <Button variant="outline" className="rounded-[18px] gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                <span>{t("terms.contactBtn")}</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
