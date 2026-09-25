import React from "react";
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
  availableSizes = ["Standard", "Small (22cm)", "Medium (30cm)", "Large (38cm)", "Compact (13-inch)"],
  totalResultsCount,
}) => {
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
              <SelectValue placeholder="Size / Dimension" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
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
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-200">Under $200</SelectItem>
              <SelectItem value="200-500">$200 – $500</SelectItem>
              <SelectItem value="500-1000">$500 – $1,000</SelectItem>
              <SelectItem value="over-1000">Over $1,000</SelectItem>
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
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock Only</SelectItem>
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
            className="h-9 px-2.5 text-[12px] text-[var(--mid-gray)] hover:text-[var(--ink)] gap-1 rounded-[18px]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Sort By & Results Count */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <span className="text-caption text-[var(--mid-gray)] tabular-nums">
          {totalResultsCount} {totalResultsCount === 1 ? "Object" : "Objects"}
        </span>

        <div className="w-[160px]">
          <Select
            value={filters.sortBy || "featured"}
            onValueChange={(val) => onFilterChange("sortBy", val)}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-[18px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured Order</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
