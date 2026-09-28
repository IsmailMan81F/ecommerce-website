import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  aspectRatio?: "video" | "square" | "standard";
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
}) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-6 transition-all duration-300 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:border-[var(--mid-gray)]/40 h-[320px]"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--canvas)]">
        <img
          src={category.image}
          alt={category.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Subtle dark scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity" />
      </div>

      {/* Floating Content */}
      <div className="relative z-10 space-y-1 text-white text-start">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-wider uppercase text-white/80">
            {t("categories.objectsCount", { count: category.itemCount })}
          </p>
          <div className="h-7 w-7 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </div>
        </div>
        <h3 className="text-heading-sm font-semibold tracking-tight text-white drop-shadow-xs">
          {category.name}
        </h3>
        <p className="text-body text-white/75 text-[13px] line-clamp-1">
          {category.description}
        </p>
      </div>
    </Link>
  );
};
