import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from "i18next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, lang?: string): string {
  const currentLang = lang || (typeof i18n !== "undefined" && i18n.language ? i18n.language : "en");
  const formattedNumber = new Intl.NumberFormat(
    currentLang === "ar" ? "ar-DZ" : currentLang === "fr" ? "fr-FR" : "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(price);

  if (currentLang === "ar") {
    return `${formattedNumber} دج`;
  }
  return `${formattedNumber} DZD`;
}
