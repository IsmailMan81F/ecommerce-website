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
          Terms of Service & Atelier Governance
        </h1>
        <p className="text-body-lg text-[var(--mid-gray)]">
          Please review the operating terms governing the acquisition, ownership, and maintenance of KØRD physical artifacts and digital storefront services.
        </p>
        <p className="text-caption text-[var(--mid-gray)] pt-1">
          Effective Date: September 2026 · Global Commercial Edition
        </p>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">Atelier Provenance</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            Every object is dispatched with an archival serial number and physical certificate of authenticity.
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <RotateCcw className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">14-Day Archival Window</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            Returns accepted within 14 calendar days of delivery for unaltered objects in original studio packaging.
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">2-Year Guarantee</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            All structural frameworks, audio components, and precision mechanical joints carry a comprehensive 2-year warranty.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-[var(--ink)] border-t border-[var(--hairline)] pt-10">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">1. Purchase & Object Acquisition</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            By placing an order through the KØRD platform, you enter into a binding agreement with KØRD Design Atelier Inc. Orders are confirmed upon receipt of transaction verification. We reserve the right to decline or cancel orders in cases of stock exhaustion, typographical errors in catalog pricing, or suspected unauthorized merchant redistribution.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">2. Material Variations & Handcrafted Characteristics</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            Our artifacts utilize raw mineral pigments, untreated Scandinavian timber, cast iron, and organic stoneware. Minor variations in grain pattern, tonal shading, micro-patina, and surface texture are natural hallmarks of artisanal craftsmanship rather than defects.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">3. Dispatch, White-Glove Shipping & Risk of Loss</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            Standard catalog objects are prepared and dispatched within 2–4 business days. High-dimension furniture and made-to-order acoustic turntable assemblies are shipped via specialized white-glove carriers. Title and risk of loss pass to the client upon recorded doorstep signature confirmation.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">4. Returns, Restocking & Refunds</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            To initiate an archival return, notify our concierge within 14 calendar days of receipt. Artifacts must be packaged in their original protective wooden or custom-molded pulp crates with unbroken tamper seals. Upon inspection at our Brooklyn facility, approved refunds are remitted to the original payment channel within 5 business days.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">5. Intellectual Property & Design Copyright</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            All industrial designs, typography, brand marks, photography, and conceptual blueprints hosted on this storefront remain the exclusive intellectual property of KØRD Atelier Inc. Any unauthorized reproduction or industrial reverse-engineering is strictly prohibited.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">6. Client Support & Legal Inquiries</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            If you require assistance regarding warranty enforcement, bespoke contracts, or trade partnership agreements, our concierge desk is available to assist:
          </p>
          <div className="p-6 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">Client Concierge & Governance</p>
              <p className="text-caption text-[var(--mid-gray)] normal-case">concierge@kord-objects.com · +1 (800) 482-9021</p>
            </div>
            <Link to="/contact">
              <Button variant="outline" className="rounded-[18px] gap-2">
                <Mail className="h-4 w-4" />
                <span>Contact Client Support</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
