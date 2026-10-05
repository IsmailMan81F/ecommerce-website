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
import { useStore } from "@/context/StoreContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const {
    storeSettings,
    footerCategories,
    footerStoreData,
    footerDataLoading,
  } = useStore();
  const footerCategoriesToShow = footerCategories ?? [];
  const footerSettings = footerStoreData ?? {
    location: storeSettings.location,
    hours: storeSettings.hours,
    social: {
      facebook: storeSettings.social.facebook,
      instagram: storeSettings.social.instagram,
    },
  };
  const locationText = [
    footerSettings.location.address,
    footerSettings.location.city,
    footerSettings.location.country,
  ].filter(Boolean).join(", ");
  const mapsLink = footerSettings.location.googleMapsUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(locationText)}`;
  const mapsPreviewLink = `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const socialLinks = [
    { name: "Facebook", href: footerSettings.social.facebook, detail: footerSettings.social.facebook, icon: <Facebook className="h-3.5 w-3.5" /> },
    { name: "Instagram", href: footerSettings.social.instagram, detail: footerSettings.social.instagram, icon: <Instagram className="h-3.5 w-3.5" /> },
  ].filter((social) => social.href.trim());

  const formatSocialDetail = (value: string) => {
    try {
      const url = new URL(value);
      return `${url.host}${url.pathname}`.replace(/\/$/, "");
    } catch {
      return value;
    }
  };

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
            <ul className="min-h-[112px] space-y-2.5 text-body text-[14px]" aria-busy={footerDataLoading}>
              <li>
                <Link
                  to="/categories"
                  className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{t("footer.allObjects")}</span>
                  <span className="text-[11px] text-[var(--mid-gray)] font-mono">{t("footer.curated")}</span>
                </Link>
              </li>
              {footerDataLoading
                ? Array.from({ length: 3 }, (_, index) => (
                    <li key={index}>
                      <div className="h-4 w-28 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                    </li>
                  ))
                : footerCategoriesToShow.length > 0 ? footerCategoriesToShow.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/categories/${category.slug}`}
                        className="text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  )) : (
                    <li className="grid min-h-[72px] place-items-center px-2 text-center text-[13px] text-[var(--mid-gray)]">
                      {t("footer.noCategoriesFound")}
                    </li>
                  )}
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
            <div className="flex min-h-[148px] flex-col gap-2.5 pt-1" aria-busy={footerDataLoading}>
              {footerDataLoading
                ? Array.from({ length: 2 }, (_, index) => (
                    <div key={index} className="flex h-[66px] items-center gap-2.5 rounded-[14px] border border-[var(--hairline)] bg-[var(--paper)] p-2.5">
                      <div className="h-7 w-7 animate-pulse rounded-full bg-[var(--hairline)]/70" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-20 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                        <div className="h-3 w-28 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                      </div>
                    </div>
                  ))
                : socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-2 p-2.5 rounded-[14px] bg-[var(--paper)] border border-[var(--hairline)] hover:border-[var(--ink)] transition-all cursor-pointer"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--ink)] group-hover:scale-105 transition-transform">
                          {social.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-[var(--ink)] block">{social.name}</span>
                          <span className="text-[11px] text-[var(--mid-gray)] block font-mono break-all">{formatSocialDetail(social.detail)}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--mid-gray)] group-hover:text-[var(--ink)] transition-colors" />
                    </a>
                  ))}
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

            <div className="min-h-[92px] space-y-2.5 text-[13px]" aria-busy={footerDataLoading}>
              {footerDataLoading ? (
                <div className="space-y-3 pt-1">
                  <div className="space-y-2">
                    <div className="h-4 w-36 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                    <div className="h-3 w-28 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                  </div>
                  <div className="space-y-2 border-t border-[var(--hairline)] pt-2">
                    <div className="h-4 w-20 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                    <div className="h-3 w-28 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-[var(--ink)]">{t("footer.satThu")}</p>
                    <p className="text-[var(--mid-gray)] text-[12px] mt-0.5">
                      {footerSettings.hours.saturday_thursday?.status === "open" &&
                      footerSettings.hours.saturday_thursday.time?.open &&
                      footerSettings.hours.saturday_thursday.time?.close
                        ? `${footerSettings.hours.saturday_thursday.time.open} – ${footerSettings.hours.saturday_thursday.time.close}`
                        : t("admin.closed")}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[var(--hairline)]">
                    <p className="font-medium text-[var(--ink)]">{t("footer.friOnly")}</p>
                    <p className="text-[var(--mid-gray)] text-[12px] mt-0.5">
                      {footerSettings.hours.friday?.status === "open" &&
                      footerSettings.hours.friday.time?.open &&
                      footerSettings.hours.friday.time?.close
                        ? `${footerSettings.hours.friday.time.open} – ${footerSettings.hours.friday.time.close}`
                        : t("admin.closed")}
                    </p>
                  </div>
                </>
              )}
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
            <div className="min-h-[48px] flex items-start gap-2 text-[13px] text-[var(--mid-gray)]" aria-busy={footerDataLoading}>
              {footerDataLoading ? (
                <div className="w-full space-y-2 pt-1">
                  <div className="h-4 w-40 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                  <div className="h-3 w-28 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                </div>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-[var(--ink)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="break-words font-medium text-[var(--ink)]">{footerSettings.location.address}</p>
                    <p className="break-words">
                      {[footerSettings.location.city, footerSettings.location.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Card showing Google Maps Location Preview */}
            <div className="rounded-[18px] bg-[var(--paper)] border border-[var(--hairline)] p-2.5 space-y-2 shadow-xs hover:border-[var(--ink)]/40 transition-colors">
              <div className="relative w-full h-32 rounded-[12px] overflow-hidden bg-[var(--surface-alt)] border border-[var(--hairline)]">
                {footerDataLoading ? (
                  <div className="h-full w-full animate-pulse bg-[var(--hairline)]/70" />
                ) : (
                  <iframe
                    title={`Google Maps preview - ${locationText}`}
                    src={mapsPreviewLink}
                    className="w-full h-full border-0 pointer-events-auto"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>

              {footerDataLoading ? (
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <div className="h-3 w-24 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                  <div className="h-3 w-20 animate-pulse rounded-[6px] bg-[var(--hairline)]/70" />
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                  <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-[var(--mid-gray)]">
                    <Compass className="h-3.5 w-3.5 shrink-0 text-[var(--ink)]" />
                    <span className="truncate">{footerSettings.location.city || footerSettings.location.country}</span>
                  </div>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[12px] font-medium text-[var(--ink)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t("footer.openInMaps")}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
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
