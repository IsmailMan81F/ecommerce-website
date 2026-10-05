import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Category, FilterState, Product, ProductVariant } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { lockViewportScroll } from "@/lib/scrollLock";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SIZES } from "@/lib/data";

const PRODUCTS_PER_PAGE = 10;

interface SupabaseCategoryRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  product?: { id: string }[] | null;
}

interface SupabaseProductRow {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  price: number;
  old_price: number | null;
  best_seller: boolean;
  is_out_of_stock: boolean;
  details: unknown;
  product_image?: { image_url: string }[] | null;
  product_variant?: Omit<ProductVariant, "isAvailable">[] | null;
}

const toSlug = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const mapProduct = (row: SupabaseProductRow, categories: Category[]): Product => {
  const category = categories.find((candidate) => candidate.id === row.category_id);
  const variants = (row.product_variant ?? []).map((variant) => ({
    ...variant,
    isAvailable: !row.is_out_of_stock && variant.stock > 0,
  }));
  const details = row.details;
  const features = Array.isArray(details)
    ? details.filter((detail): detail is string => typeof detail === "string")
    : [];
  const specs = details && typeof details === "object" && !Array.isArray(details)
    ? Object.fromEntries(
        Object.entries(details).filter((entry): entry is [string, string] => typeof entry[1] === "string")
      )
    : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: toSlug(row.name) || row.id,
    categorySlug: category?.slug ?? row.category_id,
    categoryName: category?.name ?? "",
    price: row.price,
    originalPrice: row.old_price ?? undefined,
    description: row.description ?? "",
    features,
    images: (row.product_image ?? []).map((image) => image.image_url).filter(Boolean),
    sizes: [...new Set(variants.map((variant) => variant.size))],
    colors: [...new Set(variants.map((variant) => variant.color))],
    variants,
    stock: variants.reduce((total, variant) => total + variant.stock, 0),
    isAvailable: !row.is_out_of_stock,
    isBestSeller: row.best_seller,
    specs,
  };
};

export const CategoriesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug?: string }>();
  const isRtl = i18n.language === "ar";

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [allSizes, setAllSizes] = useState<string[]>(DEFAULT_SIZES);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const requestVersion = useRef(0);
  const activeCategoryRef = useRef<HTMLAnchorElement | null>(null);

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
  const activeCategoryId = activeCategory?.id;

  useEffect(() => {
    if (slug && activeCategoryRef.current) {
      activeCategoryRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const loadCategoryOptions = async () => {
      try {
        const [categoryResult, storeResult] = await Promise.all([
          supabase
            .from("category")
            .select("id,name,description,image_url,product(id)")
            .order("name", { ascending: true }),
          supabase
            .from("store")
            .select("product_variants")
            .order("id", { ascending: true })
            .limit(1)
            .maybeSingle(),
        ]);

        if (!isMounted) return;

        if (categoryResult.error) {
          console.error("Failed to load catalog categories:", categoryResult.error);
        } else {
          const rows = (categoryResult.data ?? []) as unknown as SupabaseCategoryRow[];
          setCategories(rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: toSlug(row.name) || row.id,
            description: row.description ?? "",
            image: row.image_url ?? "",
            itemCount: row.product?.length ?? 0,
          })));
        }

        if (storeResult.error) {
          console.error("Failed to load catalog sizes:", storeResult.error);
        } else if (storeResult.data) {
          const storeVariants = storeResult.data.product_variants as { sizes?: string[] } | null;
          if (storeVariants?.sizes && Array.isArray(storeVariants.sizes) && storeVariants.sizes.length > 0) {
            setAllSizes(storeVariants.sizes);
          }
        }
      } catch (error) {
        console.error("Failed to load catalog options:", error);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    void loadCategoryOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProductPage = async (pageNumber: number, categoryId?: string) => {
    const needsVariantJoin =
      (filters.size && filters.size !== "all") || filters.availability === "in-stock";
    const variantJoin = needsVariantJoin ? "product_variant!inner" : "product_variant";
    let query = supabase
      .from("product")
      .select(
        `id,name,description,category_id,price,old_price,best_seller,is_out_of_stock,details,product_image(image_url),${variantJoin}(id,size,color,stock)`,
        { count: "exact" }
      );

    if (categoryId) query = query.eq("category_id", categoryId);
    if (filters.size && filters.size !== "all") {
      query = query.eq("product_variant.size", filters.size);
    }
    if (filters.availability === "in-stock") {
      query = query.eq("is_out_of_stock", false).gt("product_variant.stock", 0);
    }

    if (filters.priceRange === "under-200") query = query.lt("price", 4000);
    if (filters.priceRange === "200-500") query = query.gte("price", 4000).lte("price", 6000);
    if (filters.priceRange === "500-1000") query = query.gte("price", 6000).lte("price", 8000);
    if (filters.priceRange === "over-1000") query = query.gt("price", 8000);

    if (filters.sortBy === "price-asc") query = query.order("price", { ascending: true });
    if (filters.sortBy === "price-desc") query = query.order("price", { ascending: false });
    if (filters.sortBy === "name-asc") query = query.order("name", { ascending: true });

    const from = (pageNumber - 1) * PRODUCTS_PER_PAGE;
    return query.range(from, from + PRODUCTS_PER_PAGE - 1);
  };

  const sortFeatured = (items: Product[]) =>
    filters.sortBy === "featured"
      ? items.sort((first, second) => Number(second.isBestSeller) - Number(first.isBestSeller))
      : items;

  useEffect(() => {
    if (categoriesLoading) return;

    const version = ++requestVersion.current;
    let isCurrent = true;
    setProducts([]);
    setPage(1);
    setHasMore(false);
    setTotalResultsCount(0);
    setLoadFailed(false);
    setProductsLoading(true);

    const loadFirstPage = async () => {
      if (slug && !activeCategoryId) {
        setProductsLoading(false);
        return;
      }

      try {
        const { data, error, count } = await fetchProductPage(1, activeCategoryId);
        if (!isCurrent || version !== requestVersion.current) return;
        if (error) throw error;

        const rows = (data ?? []) as unknown as SupabaseProductRow[];
        const mappedProducts = rows.map((row) => mapProduct(row, categories));
        setProducts(sortFeatured(mappedProducts));
        setTotalResultsCount(count ?? mappedProducts.length);
        setHasMore(count === null ? mappedProducts.length === PRODUCTS_PER_PAGE : count > mappedProducts.length);
      } catch (error) {
        console.error("Failed to load catalog products:", error);
        if (isCurrent && version === requestVersion.current) setLoadFailed(true);
      } finally {
        if (isCurrent && version === requestVersion.current) setProductsLoading(false);
      }
    };

    void loadFirstPage();
    return () => {
      isCurrent = false;
      requestVersion.current += 1;
    };
  }, [categoriesLoading, categories, activeCategoryId, slug, filters.size, filters.priceRange, filters.availability, filters.sortBy]);

  const handleLoadMore = async () => {
    if (loadingMore || productsLoading || !hasMore) return;

    const version = requestVersion.current;
    const nextPage = page + 1;
    setLoadingMore(true);
    setLoadFailed(false);
    try {
      const { data, error, count } = await fetchProductPage(nextPage, activeCategoryId);
      if (version !== requestVersion.current) return;
      if (error) throw error;

      const rows = (data ?? []) as unknown as SupabaseProductRow[];
      const mappedProducts = rows.map((row) => mapProduct(row, categories));
      setProducts((current) => sortFeatured([...current, ...mappedProducts]));
      setPage(nextPage);
      setTotalResultsCount(count ?? Math.max(totalResultsCount, (nextPage - 1) * PRODUCTS_PER_PAGE + mappedProducts.length));
      setHasMore(count === null ? mappedProducts.length === PRODUCTS_PER_PAGE : nextPage * PRODUCTS_PER_PAGE < count);
    } catch (error) {
      console.error("Failed to load more catalog products:", error);
      setLoadFailed(true);
    } finally {
      if (version === requestVersion.current) setLoadingMore(false);
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

  const filteredProducts = products;

  const isFiltered =
    Boolean(filters.size && filters.size !== "all") ||
    Boolean(filters.priceRange && filters.priceRange !== "all") ||
    Boolean(filters.availability && filters.availability !== "all") ||
    Boolean(filters.sortBy && filters.sortBy !== "featured");

  // Disable scrolling on the main page when the filter sheet is open, fixing body to viewport
  React.useEffect(() => {
    if (mobileFilterOpen) {
      return lockViewportScroll();
    }
  }, [mobileFilterOpen]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Info */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)]">
          <Link to="/" className="hover:text-[var(--ink)] transition-colors">
            {t("categories.breadcrumbsHome")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/categories" className="hover:text-[var(--ink)] transition-colors">
            {t("categories.breadcrumbsCategories")}
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
              {activeCategory ? activeCategory.name : t("categories.pageTitle")}
            </h1>
            <p className="text-body text-[var(--mid-gray)] mt-1 max-w-2xl">
              {activeCategory
                ? activeCategory.description
                : t("categories.allObjectsSubtitle")}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex flex-wrap gap-2">
            <Sheet modal={true} open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2 rounded-[18px] cursor-pointer">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{t("categories.filterHeading")}</span>
                </Button>
              </SheetTrigger>
              {/* Sidebar opens on right for Arabic, left for LTR. Full 100vh/100vw on mobile without slide, smooth slide on tablet */}
              <SheetContent
                side={isRtl ? "right" : "left"}
                className="w-full max-sm:fixed max-sm:inset-0 max-sm:w-screen max-sm:h-screen max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:!transform-none max-sm:![animation:none] sm:max-w-md sm:w-[420px] sm:h-full p-6 overflow-y-auto flex flex-col justify-between bg-[var(--paper)]"
              >
                <div>
                  <SheetHeader className="mb-6 text-start">
                    <SheetTitle className="text-heading-sm">{t("categories.filterHeading")}</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-3">
                      <p className="text-caption text-[var(--mid-gray)]">{t("nav.categories")}</p>
                      <div className="flex flex-col gap-1">
                        <Link
                          to="/categories"
                          onClick={() => setMobileFilterOpen(false)}
                          className={`px-3 py-2.5 rounded-[14px] text-body transition-colors flex items-center justify-between ${
                            !slug
                              ? "bg-[var(--surface-alt)] font-medium text-[var(--ink)]"
                              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                          }`}
                        >
                          <span>{t("footer.allObjects")}</span>
                          <span className="text-caption text-[var(--mid-gray)] tabular-nums">
                            {totalResultsCount}
                          </span>
                        </Link>
                        {categoriesLoading ? (
                          Array.from({ length: 3 }, (_, index) => (
                            <Skeleton key={index} className="h-10 w-full rounded-[14px]" />
                          ))
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <Link
                              key={cat.id}
                              to={`/categories/${cat.slug}`}
                              onClick={() => setMobileFilterOpen(false)}
                              className={`px-3 py-2.5 rounded-[14px] text-body transition-colors flex items-center justify-between ${
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
                          ))
                        ) : (
                          <p className="px-3 py-2 text-[13px] text-[var(--mid-gray)]">
                            {t("categories.noCategoriesFound")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="pt-4 border-t border-[var(--hairline)] space-y-4">
                      <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onResetFilters={handleResetFilters}
                        availableSizes={allSizes}
                        totalResultsCount={totalResultsCount}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Filter Footer Actions with wrapping buttons */}
                <div className="pt-6 border-t border-[var(--hairline)] flex flex-wrap items-center gap-3 mt-6">
                  <Button
                    type="button"
                    className="flex-1 min-w-[160px] rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] h-11 cursor-pointer"
                    onClick={() => setMobileFilterOpen(false)}
                  >
                    {t("categories.viewObject")} ({totalResultsCount})
                  </Button>
                  {isFiltered && (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-[18px] h-11 px-4 cursor-pointer"
                      onClick={handleResetFilters}
                    >
                      {t("categories.resetFilters")}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Categories Sidebar on Desktop */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-alt)] p-5 space-y-6">
            <div>
              <p className="text-caption text-[var(--mid-gray)] px-3 mb-2">
                {t("home.disciplines")}
              </p>
              <nav className="flex flex-col gap-1">
                {/* "All" Category Option */}
                <Link
                  to="/categories"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[14px] text-[14px] transition-colors ${
                    !slug
                      ? "bg-[var(--paper)] text-[var(--ink)] font-medium shadow-xs"
                      : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span>{t("footer.allObjects")}</span>
                  <span className="text-[12px] tabular-nums font-mono">
                    {totalResultsCount}
                  </span>
                </Link>

                {/* Show 3 other categories visible with internal scrollbar for hidden categories */}
                <div className="flex flex-col gap-1 max-h-[136px] overflow-y-auto pe-1.5 focus:outline-none">
                  {categoriesLoading ? (
                    Array.from({ length: 3 }, (_, index) => (
                      <Skeleton key={index} className="h-10 w-full rounded-[14px]" />
                    ))
                  ) : (
                    categories.map((cat) => {
                      const isActive = slug === cat.slug;
                      return (
                        <Link
                          key={cat.id}
                          ref={isActive ? activeCategoryRef : undefined}
                          to={`/categories/${cat.slug}`}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-[14px] text-[14px] transition-colors ${
                            isActive
                              ? "bg-[var(--paper)] text-[var(--ink)] font-medium shadow-xs"
                              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                          }`}
                        >
                          <span className="truncate pe-2">{cat.name}</span>
                          <span className="text-[12px] tabular-nums font-mono text-[var(--mid-gray)]">
                            {cat.itemCount}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </nav>
            </div>

            {/* Quiet atelier note */}
            <div className="pt-4 border-t border-[var(--hairline)] px-3 text-[12px] text-[var(--mid-gray)] leading-relaxed">
              Standard production batches are limited to 50 numbered copies per season.
            </div>
          </div>
        </aside>

        {/* Products Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Filter Bar on Desktop/Tablet */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableSizes={allSizes}
            totalResultsCount={totalResultsCount}
          />

          {/* Product Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PRODUCTS_PER_PAGE }, (_, index) => (
                <div key={index} className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-4 sm:p-5">
                  <Skeleton className="aspect-[4/3] w-full rounded-[18px]" />
                  <div className="mt-4 space-y-3">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[var(--hairline)] pt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16 rounded-[18px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadFailed && filteredProducts.length === 0 ? (
            <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-12 text-center text-[14px] text-[var(--mid-gray)]">
              {t("categories.catalogLoadFailed")}
            </div>
          ) : filteredProducts.length > 0 ? (
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
                  {t("categories.noObjectsFound")}
                </h3>
              </div>
              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="gap-2 rounded-[18px] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 rtl:rotate-180" />
                <span>{t("categories.resetFilters")}</span>
              </Button>
            </div>
          )}

          {loadFailed && filteredProducts.length > 0 && (
            <p className="text-center text-[13px] text-[var(--mid-gray)]">
              {t("categories.loadMoreFailed")}
            </p>
          )}

          {hasMore && !productsLoading && filteredProducts.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="min-w-36 rounded-[18px]"
              >
                {loadingMore ? t("categories.loadingMore") : t("categories.loadMore")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
