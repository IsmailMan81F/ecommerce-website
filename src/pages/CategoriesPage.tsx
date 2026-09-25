import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SlidersHorizontal, ArrowLeft, RotateCcw } from "lucide-react";
import { FilterState, Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/context/StoreContext";

export const CategoriesPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { products, categories } = useStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    size: "all",
    priceRange: "all",
    availability: "all",
    sortBy: "featured",
  });

  const activeCategory = useMemo(() => {
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [slug, categories]);

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

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (slug && product.categorySlug !== slug) {
        return false;
      }

      // Size filter
      if (filters.size && filters.size !== "all") {
        if (!product.sizes.includes(filters.size)) {
          return false;
        }
      }

      // Price range
      if (filters.priceRange && filters.priceRange !== "all") {
        if (filters.priceRange === "under-200" && product.price >= 200) return false;
        if (filters.priceRange === "200-500" && (product.price < 200 || product.price > 500)) return false;
        if (filters.priceRange === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
        if (filters.priceRange === "over-1000" && product.price <= 1000) return false;
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
      return 0; // featured default
    });
  }, [slug, filters, products]);

  // Extract all distinct sizes available across products
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Info */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)]">
          <Link to="/" className="hover:text-[var(--ink)] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/categories" className="hover:text-[var(--ink)] transition-colors">
            Categories
          </Link>
          {activeCategory && (
            <>
              <span aria-hidden="true">/</span>
              <span className="text-[var(--ink)] font-medium">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-heading-lg text-[var(--ink)]">
              {activeCategory ? activeCategory.name : "All Design Objects"}
            </h1>
            <p className="text-body text-[var(--mid-gray)] mt-1 max-w-2xl">
              {activeCategory
                ? activeCategory.description
                : "Explore our complete catalog of tactile audio, furniture, ceramic stoneware, and handcrafted leather artifacts."}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden self-start">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2 rounded-[18px]">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filter & Categories</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-6 overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-heading-sm">Filters & Categories</SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <p className="text-caption text-[var(--mid-gray)]">Categories</p>
                    <div className="flex flex-col gap-1">
                      <Link
                        to="/categories"
                        onClick={() => setMobileFilterOpen(false)}
                        className={`px-3 py-2 rounded-[12px] text-body transition-colors ${
                          !slug
                            ? "bg-[var(--surface-alt)] font-medium text-[var(--ink)]"
                            : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                        }`}
                      >
                        All Objects ({products.length})
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/categories/${cat.slug}`}
                          onClick={() => setMobileFilterOpen(false)}
                          className={`px-3 py-2 rounded-[12px] text-body transition-colors flex items-center justify-between ${
                            slug === cat.slug
                              ? "bg-[var(--surface-alt)] font-medium text-[var(--ink)]"
                              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-caption text-[var(--mid-gray)] tabular-nums">
                            {cat.itemCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="pt-4 border-t border-[var(--hairline)] space-y-4">
                    <p className="text-caption text-[var(--mid-gray)]">Refine Specifications</p>
                    <FilterBar
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onResetFilters={handleResetFilters}
                      availableSizes={allSizes}
                      totalResultsCount={filteredProducts.length}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar on Desktop */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-alt)] p-5 space-y-6">
            <div>
              <p className="text-caption text-[var(--mid-gray)] px-3 mb-2">
                Disciplines
              </p>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/categories"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[14px] text-[14px] transition-colors ${
                    !slug
                      ? "bg-[var(--paper)] text-[var(--ink)] font-medium shadow-xs"
                      : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span>All Objects</span>
                  <span className="text-[12px] tabular-nums font-mono">
                    {products.length}
                  </span>
                </Link>

                {categories.map((cat) => {
                  const isActive = slug === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-[14px] text-[14px] transition-colors ${
                        isActive
                          ? "bg-[var(--paper)] text-[var(--ink)] font-medium shadow-xs"
                          : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-[12px] tabular-nums font-mono text-[var(--mid-gray)]">
                        {cat.itemCount}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quiet atelier note */}
            <div className="pt-4 border-t border-[var(--hairline)] px-3 text-[12px] text-[var(--mid-gray)] leading-relaxed">
              Standard production batches are limited to 50 numbered copies per season.
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Filter Bar on Desktop/Tablet */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableSizes={allSizes}
            totalResultsCount={filteredProducts.length}
          />

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-12 text-center space-y-4 my-8">
              <div className="space-y-1">
                <h3 className="text-subheading text-[var(--ink)]">
                  No objects matched the selected criteria
                </h3>
                <p className="text-body text-[var(--mid-gray)] max-w-md mx-auto">
                  Try adjusting your size, price range, or category filter to discover available pieces.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="gap-2 rounded-[18px]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset All Filters</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
