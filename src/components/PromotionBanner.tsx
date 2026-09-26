import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";

interface PromotionBannerProps {
  className?: string;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({ className = "" }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("kord_promo_dismissed") !== "true";
    } catch {
      return true;
    }
  });

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem("kord_promo_dismissed", "true");
    } catch {
      // Ignore storage errors
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Promotion Announcement"
      className={`relative w-full bg-[var(--ink)] text-[var(--paper)] py-2.5 px-4 sm:px-6 transition-all border-b border-[var(--ink-soft)] ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Center content */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center text-[12px] sm:text-[13px] font-normal tracking-wide">
          <span className="font-medium text-[var(--paper)] shrink-0 uppercase text-[11px] tracking-wider">
            Archive Event:
          </span>
          <p className="text-[var(--paper)]/90 leading-tight">
            Up to 20% off selected design objects and studio acoustic editions.
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:opacity-80 transition-opacity ml-1 shrink-0 text-[12px]"
          >
            <span>Explore Collections</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Right: Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss promotion banner"
          className="p-1 rounded-full text-[var(--paper)]/75 hover:text-[var(--paper)] hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
