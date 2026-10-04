import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck, Compass, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/data";

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Title & Philosophy */}
      <div className="max-w-3xl space-y-4">
        <p className="text-caption text-[var(--mid-gray)]">{t("about.badge")}</p>
        <h1 className="text-display text-[var(--ink)] tracking-tight">
          {t("about.title")}
        </h1>
        <p className="text-body-lg text-[var(--mid-gray)] leading-relaxed">
          {t("about.mainDesc")}
        </p>
      </div>

      {/* Main Showcase Banner */}
      <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas)]">
        <img
          src={HERO_IMAGE}
          alt="KØRD atelier space"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-1 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <p className="text-[28px] font-semibold tabular-nums text-[var(--ink)]">100%</p>
          <p className="text-caption text-[var(--mid-gray)]">{t("about.statsPlasticFree")}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-1 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <p className="text-[28px] font-semibold tabular-nums text-[var(--ink)]">12</p>
          <p className="text-caption text-[var(--mid-gray)]">{t("about.statsAteliers")}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-1 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <p className="text-[28px] font-semibold tabular-nums text-[var(--ink)]">25+ Yrs</p>
          <p className="text-caption text-[var(--mid-gray)]">{t("about.statsWarranty")}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 space-y-1 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <p className="text-[28px] font-semibold tabular-nums text-[var(--ink)]">50 / Run</p>
          <p className="text-caption text-[var(--mid-gray)]">{t("about.statsHandBatch")}</p>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="space-y-3 p-6 rounded-[24px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
          <div className="h-10 w-10 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <Feather className="h-5 w-5" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)]">
            {t("about.pillar1Title")}
          </h3>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("about.pillar1Desc")}
          </p>
        </div>

        <div className="space-y-3 p-6 rounded-[24px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
          <div className="h-10 w-10 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)]">
            {t("about.pillar2Title")}
          </h3>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("about.pillar2Desc")}
          </p>
        </div>

        <div className="space-y-3 p-6 rounded-[24px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
          <div className="h-10 w-10 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)]">
            {t("about.pillar3Title")}
          </h3>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            {t("about.pillar3Desc")}
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center pt-8 space-y-4">
        <h2 className="text-heading text-[var(--ink)]">{t("home.exploreCollection")}</h2>
        <div>
          <Link to="/categories">
            <Button size="lg" className="rounded-[18px] gap-2 px-8 cursor-pointer">
              <span>{t("home.viewFullCatalog")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
