import React from "react";
import { useTranslation } from "react-i18next";
import { FilterState } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DEFAULT_SIZES } from "@/lib/data";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  availableSizes?: string[];
  totalResultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableSizes = DEFAULT_SIZES,
  totalResultsCount,
}) => {
  const { t } = useTranslation();

  const isFiltered =
    (filters.size && filters.size !== "all") ||
    (filters.priceRange && filters.priceRange !== "all") ||
    (filters.availability && filters.availability !== "all") ||
    (filters.sortBy && filters.sortBy !== "featured");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[var(--hairline)]">
      {/* Filters row: Size, Price, Availability */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Size Filter */}
        <div className="w-[140px]">
          <Select
            value={filters.size || "all"}
            onValueChange={(val) => onFilterChange("size", val)}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-[18px]">
              <SelectValue placeholder={t("categories.size")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("categories.allSizes")}</SelectItem>
              {availableSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="w-[145px]">
          <Select
            value={filters.priceRange || "all"}
            onValueChange={(val) => onFilterChange("priceRange", val)}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-[18px]">
              <SelectValue placeholder={t("categories.priceRange")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("categories.allPrices")}</SelectItem>
              <SelectItem value="under-200">{t("categories.under200")}</SelectItem>
              <SelectItem value="200-500">{t("categories.p200to500")}</SelectItem>
              <SelectItem value="500-1000">{t("categories.p500to1000")}</SelectItem>
              <SelectItem value="over-1000">{t("categories.over1000")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="w-[130px]">
          <Select
            value={filters.availability || "all"}
            onValueChange={(val) => onFilterChange("availability", val)}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-[18px]">
              <SelectValue placeholder={t("categories.availability")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("categories.allStock")}</SelectItem>
              <SelectItem value="in-stock">{t("categories.inStockOnly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters button if filtered */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-3 text-[12px] text-[var(--mid-gray)] hover:text-[var(--ink)] gap-1 rounded-[18px] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 rtl:rotate-180" />
            <span>{t("common.reset")}</span>
          </Button>
        )}
      </div>

      {/* Sort By & Results Count */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
        <span className="text-caption text-[var(--mid-gray)] tabular-nums">
          {t("categories.objectsCount", { count: totalResultsCount })}
        </span>

        <div className="w-[160px]">
          <Select
            value={filters.sortBy || "featured"}
            onValueChange={(val) => onFilterChange("sortBy", val)}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-[18px]">
              <SelectValue placeholder={t("common.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t("categories.featuredOrder")}</SelectItem>
              <SelectItem value="price-asc">{t("categories.priceLowToHigh")}</SelectItem>
              <SelectItem value="price-desc">{t("categories.priceHighToLow")}</SelectItem>
              <SelectItem value="name-asc">{t("categories.nameAtoZ")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
