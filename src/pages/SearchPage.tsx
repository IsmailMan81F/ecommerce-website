import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight } from "lucide-react";
import { FilterState } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { FilterBar } from "@/components/FilterBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);

  const [filters, setFilters] = useState<FilterState>({
    size: "all",
    priceRange: "all",
    availability: "all",
    sortBy: "featured",
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      size: "all",
      priceRange: "all",
      availability: "all",
      sortBy: "featured",
    });
  };

  // Extract all distinct sizes available across products
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const searchResults = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();

    return products.filter((product) => {
      if (cleanQuery) {
        const matchesName = product.name.toLowerCase().includes(cleanQuery);
        const matchesCat = product.categoryName.toLowerCase().includes(cleanQuery);
        const matchesDesc = product.description.toLowerCase().includes(cleanQuery);
        const matchesFeatures = product.features.some((f) =>
          f.toLowerCase().includes(cleanQuery)
        );

        if (!matchesName && !matchesCat && !matchesDesc && !matchesFeatures) {
          return false;
        }
      }

      // Size filter
      if (filters.size && filters.size !== "all") {
        if (!product.sizes.includes(filters.size)) {
          return false;
        }
      }

      // Price range
      if (filters.priceRange && filters.priceRange !== "all") {
        if (filters.priceRange === "under-200" && product.price >= 4000) return false;
        if (filters.priceRange === "200-500" && (product.price < 4000 || product.price > 6000)) return false;
        if (filters.priceRange === "500-1000" && (product.price < 6000 || product.price > 8000)) return false;
        if (filters.priceRange === "over-1000" && product.price <= 8000) return false;
      }

      // Availability
      if (filters.availability === "in-stock" && (!product.isAvailable || product.stock <= 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      if (filters.sortBy === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [query, filters, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)]">
          <Link to="/" className="hover:text-[var(--ink)] transition-colors">
            {t("categories.breadcrumbsHome")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--ink)] font-medium">{t("common.search")}</span>
        </div>

        <h1 className="text-heading-lg text-[var(--ink)]">{t("common.searchCatalog")}</h1>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
            <Input
              type="search"
              placeholder={t("common.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="ps-11 pe-4 h-12 text-[15px] rounded-[18px]"
            />
          </div>
          <Button type="submit" size="lg" className="rounded-[18px] px-6 cursor-pointer">
            {t("common.search")}
          </Button>
        </form>

        {query && (
          <p className="text-body text-[var(--mid-gray)] text-[13px]">
            {t("categories.objectsCount", { count: searchResults.length })}: <span className="font-semibold text-[var(--ink)]">&ldquo;{query}&rdquo;</span>
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        availableSizes={allSizes}
        totalResultsCount={searchResults.length}
      />

      {/* Product Grid or Empty State */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-12 text-center space-y-4 my-8 max-w-xl mx-auto">
          <div className="h-12 w-12 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center mx-auto text-[var(--mid-gray)]">
            <Search className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-subheading text-[var(--ink)]">{t("categories.noObjectsFound")}</h3>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchParams({});
                setSearchInput("");
                handleResetFilters();
              }}
              className="rounded-[18px] cursor-pointer"
            >
              {t("common.reset")}
            </Button>
            <Link to="/categories">
              <Button className="rounded-[18px] gap-1.5 cursor-pointer">
                <span>{t("home.viewFullCatalog")}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
