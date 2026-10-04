import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-8">
      {/* Visual Indicator */}
      <div className="space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] text-[var(--mid-gray)] shadow-xs">
          <Compass className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <p className="text-caption text-[var(--mid-gray)] font-mono tracking-widest">
            Error 404
          </p>
          <h1 className="text-display text-[var(--ink)] tracking-tight">
            {t("productDetail.notFoundTitle")}
          </h1>
        </div>

        <p className="text-body-lg text-[var(--mid-gray)] max-w-lg mx-auto leading-relaxed">
          {t("productDetail.notFoundDesc")}
        </p>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button size="lg" className="rounded-[18px] gap-2 px-7 bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] cursor-pointer">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t("productDetail.backToCatalog")}</span>
          </Button>
        </Link>
        <Link to="/categories">
          <Button variant="outline" size="lg" className="rounded-[18px] gap-2 px-6 text-[var(--ink)] cursor-pointer">
            <span>{t("home.exploreCollection")}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
      </div>

      {/* Quick Collection Links */}
      <div className="pt-12 border-t border-[var(--hairline)] max-w-xl mx-auto">
        <p className="text-caption text-[var(--mid-gray)] mb-4">
          {t("home.curatedCategories")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            to="/categories/studio-audio"
            className="text-[13px] px-3.5 py-1.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--mid-gray)] transition-colors"
          >
            Studio Audio
          </Link>
          <Link
            to="/categories/ceramics-objects"
            className="text-[13px] px-3.5 py-1.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--mid-gray)] transition-colors"
          >
            Ceramics & Objects
          </Link>
          <Link
            to="/categories/minimalist-furniture"
            className="text-[13px] px-3.5 py-1.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--mid-gray)] transition-colors"
          >
            Minimalist Furniture
          </Link>
          <Link
            to="/search"
            className="text-[13px] px-3.5 py-1.5 rounded-[14px] bg-[var(--surface-alt)] border border-[var(--hairline)] text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1.5"
          >
            <Search className="h-3 w-3" />
            <span>{t("common.searchCatalog")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
