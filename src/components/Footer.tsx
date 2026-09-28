import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Mail,
  ExternalLink,
  Instagram,
  Facebook,
  ArrowRight,
  Compass,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Crisp WhatsApp SVG Icon for brand accuracy
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.031 2C6.511 2 2.029 6.48 2.029 12c0 1.942.553 3.754 1.512 5.289L2.004 22l4.869-1.503A9.92 9.92 0 0012.031 22C17.551 22 22.033 17.52 22.033 12c0-5.52-4.482-10-10.002-10zm0 18.235c-1.637 0-3.18-.46-4.508-1.258l-.323-.193-2.885.89.907-2.809-.211-.336A8.17 8.17 0 013.794 12c0-4.542 3.695-8.235 8.237-8.235 4.542 0 8.237 3.693 8.237 8.235 0 4.542-3.695 8.235-8.237 8.235zm4.512-6.177c-.247-.124-1.464-.722-1.691-.805-.227-.082-.392-.124-.557.124-.165.247-.64 0.805-.784.97-.144.165-.289.186-.536.062-.247-.124-1.043-.385-1.986-1.226-.734-.655-1.229-1.464-1.373-1.711-.144-.247-.015-.381.109-.504.111-.111.247-.289.371-.433.124-.144.165-.247.247-.412.082-.165.041-.309-.021-.433-.062-.124-.557-1.34-.763-1.835-.2-.485-.403-.419-.557-.427-.144-.007-.309-.009-.474-.009s-.433.062-.66.309c-.227.247-.866.846-.866 2.062s.887 2.392 1.01 2.557c.124.165 1.745 2.665 4.227 3.737.59.255 1.052.408 1.411.522.593.188 1.133.161 1.56.097.476-.071 1.464-.598 1.67-1.175.206-.577.206-1.072.144-1.175-.062-.103-.227-.165-.474-.289z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <footer className="w-full bg-[var(--surface-alt)] border-t border-[var(--hairline)] mt-24 text-[var(--ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Main 5-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Logo & Description (Never translate KØRD) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4">
            <Link
              to="/"
              className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--ink)] block select-none hover:opacity-85 transition-opacity"
            >
              KØRD
            </Link>
            <p className="text-body text-[var(--mid-gray)] text-[13px] leading-relaxed max-w-sm">
              {t("footer.description")}
            </p>
            <p className="text-caption text-[var(--mid-gray)]">
              {t("footer.edition")}
            </p>
          </div>

          {/* Column 2: Categories */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-4">
            <div>
              <p className="text-caption text-[var(--mid-gray)] font-semibold tracking-wider">
                {t("footer.categoriesTitle")}
              </p>
              <h3 className="text-body font-semibold text-[var(--ink)] mt-1">
                {t("footer.categoriesSubtitle")}
              </h3>
            </div>
            <ul className="space-y-2.5 text-body text-[14px]">
              <li>
                <Link
                  to="/categories"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{t("footer.allObjects")}</span>
                  <span className="text-[11px] text-[var(--mid-gray)] font-mono">{t("footer.curated")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/studio-audio"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors"
                >
                  Studio Audio
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/ceramics-objects"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors"
                >
                  Ceramics & Objects
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/minimalist-furniture"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors"
                >
                  Minimalist Furniture
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/leather-goods"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors"
                >
                  Leather Goods
                </Link>
              </li>
              <li>
                <Link
                  to="/categories/tactile-homeware"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors"
                >
                  Tactile Homeware
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Media & Channels */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-4">
            <div>
              <p className="text-caption text-[var(--mid-gray)] font-semibold tracking-wider">
                {t("footer.socialTitle")}
              </p>
              <h3 className="text-body font-semibold text-[var(--ink)] mt-1">
                {t("footer.socialSubtitle")}
              </h3>
            </div>
            <p className="text-caption text-[var(--mid-gray)] normal-case text-[13px] leading-relaxed">
              {t("footer.socialDesc")}
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] hover:border-[var(--ink)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--ink)] group-hover:scale-105 transition-transform">
                    <Facebook className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-medium text-[var(--ink)] block">Facebook</span>
                    <span className="text-[11px] text-[var(--mid-gray)] block font-mono">@kord.atelier</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--mid-gray)] group-hover:text-[var(--ink)] transition-colors" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] hover:border-[var(--ink)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--ink)] group-hover:scale-105 transition-transform">
                    <Instagram className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-medium text-[var(--ink)] block">Instagram</span>
                    <span className="text-[11px] text-[var(--mid-gray)] block font-mono">@kord.objects</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--mid-gray)] group-hover:text-[var(--ink)] transition-colors" />
              </a>

              <a
                href="https://wa.me/18004829021"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] hover:border-[var(--ink)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--ink)] group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-medium text-[var(--ink)] block">WhatsApp</span>
                    <span className="text-[11px] text-[var(--mid-gray)] block font-mono">+1 (800) 482-9021</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[var(--mid-gray)] group-hover:text-[var(--ink)] transition-colors" />
              </a>
            </div>
          </div>

          {/* Column 4: Opening Hours & Contact */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-4">
            <div>
              <p className="text-caption text-[var(--mid-gray)] font-semibold tracking-wider">
                {t("footer.hoursTitle")}
              </p>
              <h3 className="text-body font-semibold text-[var(--ink)] mt-1">
                {t("footer.hoursSubtitle")}
              </h3>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <div>
                <p className="font-medium text-[var(--ink)]">{t("footer.satThu")}</p>
                <p className="text-[var(--mid-gray)] text-[12px] mt-0.5">
                  {t("footer.timeRangeSatThu")}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--hairline)]">
                <p className="font-medium text-[var(--ink)]">{t("footer.friOnly")}</p>
                <p className="text-[var(--mid-gray)] text-[12px] mt-0.5">
                  {t("footer.timeRangeFri")}
                </p>
              </div>
            </div>

            {/* Direct Contact Page Link */}
            <div className="pt-2">
              <Link
                to="/contact"
                className="group flex items-center justify-between p-3 rounded-[14px] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-soft)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--paper)]" />
                  <span className="text-[13px] font-medium">{t("footer.contactConcierge")}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 rtl:rotate-180 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Column 5: Location Address & Google Maps Location Card Preview */}
          <div className="col-span-1 md:col-span-1 lg:col-span-3 space-y-4">
            <div>
              <p className="text-caption text-[var(--mid-gray)] font-semibold tracking-wider">
                {t("footer.locationTitle")}
              </p>
              <h3 className="text-body font-semibold text-[var(--ink)] mt-1">
                {t("footer.locationSubtitle")}
              </h3>
            </div>

            {/* Location Address */}
            <div className="flex items-start gap-2 text-[13px] text-[var(--mid-gray)]">
              <MapPin className="h-4 w-4 text-[var(--ink)] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--ink)]">{t("footer.addressStreet")}</p>
                <p>{t("footer.addressCity")}</p>
              </div>
            </div>

            {/* Card showing Google Maps Location Preview */}
            <div className="rounded-[18px] bg-[var(--paper)] border border-[var(--hairline)] p-2.5 space-y-2 shadow-xs hover:border-[var(--ink)]/40 transition-colors">
              <div className="relative w-full h-32 rounded-[12px] overflow-hidden bg-[var(--surface-alt)] border border-[var(--hairline)]">
                <iframe
                  title="Google Maps Location Preview - 74 Bleecker Street, New York"
                  src="https://maps.google.com/maps?q=74%20Bleecker%20Street%2C%20New%20York%2C%20NY%2010012&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 pointer-events-auto"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="flex items-center justify-between px-1 pt-0.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--mid-gray)]">
                  <Compass className="h-3.5 w-3.5 text-[var(--ink)]" />
                  <span>{t("footer.district")}</span>
                </div>
                <a
                  href="https://maps.google.com/?q=74+Bleecker+Street,+New+York,+NY+10012"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] font-medium text-[var(--ink)] hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("footer.openInMaps")}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Language Switcher, Theme Switcher, Privacy, Terms, Support */}
        <div className="mt-14 pt-8 border-t border-[var(--hairline)] flex flex-col lg:flex-row items-center justify-between gap-4 text-[12px] text-[var(--mid-gray)]">
          <p>{t("footer.copyright")}</p>

          {/* Language Switcher besides Theme Switcher as explicitly requested */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LanguageSwitcher variant="card" />

            {/* Theme Switcher Card */}
            <div className="flex items-center gap-1 bg-[var(--paper)] p-1 rounded-[14px] border border-[var(--hairline)]">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 px-2.5 rounded-[10px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  theme === "light"
                    ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs border border-[var(--hairline)]"
                    : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                }`}
                title="Light mode"
                aria-label="Light mode"
              >
                <Sun className="h-3 w-3" />
                <span>{t("common.light")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 px-2.5 rounded-[10px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  theme === "dark"
                    ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs border border-[var(--hairline)]"
                    : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                }`}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <Moon className="h-3 w-3" />
                <span>{t("common.dark")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-1.5 px-2.5 rounded-[10px] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  theme === "system"
                    ? "bg-[var(--surface-alt)] text-[var(--ink)] font-semibold shadow-2xs border border-[var(--hairline)]"
                    : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                }`}
                title="System preference"
                aria-label="System preference"
              >
                <Laptop className="h-3 w-3" />
                <span>{t("common.system")}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              to="/privacy"
              className="hover:text-[var(--ink)] transition-colors underline-offset-4 hover:underline"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <span aria-hidden="true" className="text-[var(--hairline)]">·</span>
            <Link
              to="/terms"
              className="hover:text-[var(--ink)] transition-colors underline-offset-4 hover:underline"
            >
              {t("footer.termsOfService")}
            </Link>
            <span aria-hidden="true" className="text-[var(--hairline)]">·</span>
            <Link
              to="/contact"
              className="hover:text-[var(--ink)] transition-colors underline-offset-4 hover:underline"
            >
              {t("footer.clientSupport")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
