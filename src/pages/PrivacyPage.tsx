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
          Privacy Standard & Data Policies
        </h1>
        <p className="text-body-lg text-[var(--mid-gray)]">
          At KØRD, we apply the same reductive philosophy to personal data as we do to our physical objects: only what is strictly necessary, treated with unyielding precision and care.
        </p>
        <p className="text-caption text-[var(--mid-gray)] pt-1">
          Effective Date: September 2026 · Atelier Compliance Revision 4.2
        </p>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <Lock className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">Zero Data Brokerage</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            We never sell, rent, or trade your personal identities or purchase records to advertisers or third-party networks.
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">End-to-End Vaulting</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            Payment transactions are processed through tokenized, encrypted PCI-DSS Tier 1 channels. No card numbers touch our servers.
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
          <div className="h-8 w-8 rounded-full bg-[var(--paper)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink)]">
            <EyeOff className="h-4 w-4" />
          </div>
          <h3 className="text-subheading font-medium text-[var(--ink)] text-[15px]">Transparent Control</h3>
          <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
            You hold unconditional rights to request complete export or permanent erasure of your atelier profile and order history.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-[var(--ink)] border-t border-[var(--hairline)] pt-10">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">1. Scope of Data Collection</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            When you interact with the KØRD digital storefront, submit a concierge inquiry, or acquire a design artifact, we gather essential information required to fulfill our craft:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-body text-[var(--mid-gray)] text-[14px]">
            <li><strong className="text-[var(--ink)]">Identity & Dispatch:</strong> Recipient name, physical mailing destination, telephone contact for white-glove courier dispatch.</li>
            <li><strong className="text-[var(--ink)]">Order History:</strong> Specific catalog objects, selected finishes, dimensions, and purchase timestamp.</li>
            <li><strong className="text-[var(--ink)]">Concierge Inquiries:</strong> Messages, custom dimension specifications, and communications sent to our studio concierge.</li>
            <li><strong className="text-[var(--ink)]">Browser Session Storage:</strong> Local device state to preserve your active shopping bag and aesthetic preferences without cross-site tracking.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">2. Lawful Basis & Usage Purposes</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            All data handling is strictly governed under lawful execution of contracts and legitimate atelier interests:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-body text-[var(--mid-gray)] text-[14px]">
            <li>Processing orders, issuing certificate authenticity seals, and packaging objects.</li>
            <li>Coordinating delivery times and secure signature confirmations through regional carriers.</li>
            <li>Communicating batch dispatch progress, provenance notes, and responding to concierge consultations.</li>
            <li>Preventing fraudulent attempts and securing our storefront infrastructure.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">3. Audited Partners & Logistics</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            We collaborate solely with verified logistics partners (such as direct courier networks and customs authorities) strictly as needed to complete the physical delivery of your order. No third-party data tracking scripts, ad-tech beacons, or behavioral remarketing pixels are installed on KØRD storefronts.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">4. Client Rights & Data Portability</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            Under GDPR, CCPA, and global privacy conventions, you maintain enforceable rights regarding your information:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-[14px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
              <p className="text-[14px] font-medium text-[var(--ink)]">Right to Erasure</p>
              <p className="text-[13px] text-[var(--mid-gray)]">Request complete deletion of your customer records and historical orders.</p>
            </div>
            <div className="p-4 rounded-[14px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
              <p className="text-[14px] font-medium text-[var(--ink)]">Right of Inspection</p>
              <p className="text-[13px] text-[var(--mid-gray)]">Receive an unencrypted copy of all personal records associated with your email.</p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-heading-sm font-semibold tracking-tight">5. Contact Our Privacy Officer</h2>
          <p className="text-body text-[var(--mid-gray)] leading-relaxed">
            To submit a data access request, verify information, or inquire about atelier compliance standards, connect directly with our studio legal concierge:
          </p>
          <div className="p-6 rounded-[20px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">Atelier Data Governance Concierge</p>
              <p className="text-caption text-[var(--mid-gray)] normal-case">privacy@kord-objects.com · 74 Bleecker Street, New York, NY 10012</p>
            </div>
            <Link to="/contact">
              <Button variant="outline" className="rounded-[18px] gap-2">
                <Mail className="h-4 w-4" />
                <span>Contact Concierge</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
