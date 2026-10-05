import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Minus,
  Plus,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

interface SupabaseProductDetailRow {
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
  product_variant?: { id: string; size: string; color: string; stock: number }[] | null;
  category?: { id: string; name: string; image_url?: string | null } | null;
}

const toSlug = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const mapDetailProduct = (
  row: SupabaseProductDetailRow,
  fallbackCategoryName?: string
): Product => {
  const rawVariants = row.product_variant ?? [];
  const variants = rawVariants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stock: typeof v.stock === "number" ? v.stock : 0,
    isAvailable: !row.is_out_of_stock && (v.stock || 0) > 0,
  }));
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const details = row.details;

  let features: string[] = [];
  let specs: Record<string, string> | undefined = undefined;

  if (Array.isArray(details)) {
    features = details.filter((d): d is string => typeof d === "string");
  } else if (details && typeof details === "object") {
    specs = Object.fromEntries(
      Object.entries(details)
        .filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" || typeof entry[1] === "number"
        )
        .map(([k, v]) => [k, String(v)])
    );
  } else if (typeof details === "string") {
    features = [details];
  }

  const rawImages = (row.product_image ?? []).map((img) => img.image_url).filter(Boolean);
  const categoryName = row.category?.name || fallbackCategoryName || "Catalog";
  const fallbackImage = row.category?.image_url;
  const images = rawImages.length > 0 ? rawImages : (fallbackImage ? [fallbackImage] : []);

  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  return {
    id: row.id,
    name: row.name,
    slug: toSlug(row.name) || row.id,
    categorySlug: toSlug(categoryName) || row.category_id,
    categoryName,
    price: row.price,
    originalPrice: row.old_price ?? undefined,
    description: row.description ?? "",
    features,
    images,
    sizes,
    colors,
    variants,
    stock: totalStock,
    isAvailable: !row.is_out_of_stock && totalStock > 0,
    isBestSeller: row.best_seller,
    specs,
  };
};

export const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Load product & related products from Supabase
  useEffect(() => {
    let isMounted = true;
    setProductLoading(true);

    const loadProductData = async () => {
      if (!slug) {
        setProductLoading(false);
        return;
      }

      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        let productRow: SupabaseProductDetailRow | null = null;

        if (isUuid) {
          const { data, error } = await supabase
            .from("product")
            .select("id,name,description,category_id,price,old_price,best_seller,is_out_of_stock,details,product_image(image_url),product_variant(id,size,color,stock),category:category_id(id,name,image_url)")
            .eq("id", slug)
            .maybeSingle();

          if (!error && data) {
            productRow = data as unknown as SupabaseProductDetailRow;
          }
        }

        if (!productRow) {
          const { data, error } = await supabase
            .from("product")
            .select("id,name,description,category_id,price,old_price,best_seller,is_out_of_stock,details,product_image(image_url),product_variant(id,size,color,stock),category:category_id(id,name,image_url)");

          if (!error && data) {
            const rows = data as unknown as SupabaseProductDetailRow[];
            productRow = rows.find((p) => toSlug(p.name) === slug || p.id === slug) || null;
          }
        }

        if (!isMounted) return;

        if (!productRow) {
          setProduct(null);
          setProductLoading(false);
          return;
        }

        const mapped = mapDetailProduct(productRow);
        setProduct(mapped);

        // Fetch related products belonging to the same category
        if (productRow.category_id) {
          const { data: relatedData } = await supabase
            .from("product")
            .select("id,name,description,category_id,price,old_price,best_seller,is_out_of_stock,details,product_image(image_url),product_variant(id,size,color,stock),category:category_id(id,name,image_url)")
            .eq("category_id", productRow.category_id)
            .neq("id", productRow.id)
            .limit(3);

          if (isMounted && relatedData) {
            setRelatedProducts(
              (relatedData as unknown as SupabaseProductDetailRow[]).map((r) =>
                mapDetailProduct(r)
              )
            );
          }
        }
      } catch (err) {
        console.error("Failed to load product details from Supabase:", err);
      } finally {
        if (isMounted) setProductLoading(false);
      }
    };

    void loadProductData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Derived stock & variant collections
  const variants = useMemo(() => product?.variants ?? [], [product]);
  const totalStock = useMemo(
    () => variants.reduce((sum, v) => sum + (v.stock || 0), 0),
    [variants]
  );
  const isProductOutOfStock = Boolean(
    !product ||
    product.isAvailable === false ||
    totalStock <= 0 ||
    (variants.length > 0 && variants.every((v) => v.stock <= 0))
  );

  const allSizes = useMemo(
    () =>
      product?.sizes && product.sizes.length > 0
        ? product.sizes
        : [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [product?.sizes, variants]
  );

  const allColors = useMemo(
    () =>
      product?.colors && product.colors.length > 0
        ? product.colors
        : [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [product?.colors, variants]
  );

  // Variant disabling calculations
  const isColorDisabled = (color: string) => {
    if (isProductOutOfStock) return true;
    if (!selectedSize) {
      const stock = variants
        .filter((v) => v.color === color)
        .reduce((sum, v) => sum + v.stock, 0);
      return stock <= 0;
    }
    const match = variants.find((v) => v.size === selectedSize && v.color === color);
    return !match || match.stock <= 0;
  };

  const isSizeDisabled = (size: string) => {
    if (isProductOutOfStock) return true;
    if (!selectedColor) {
      const stock = variants
        .filter((v) => v.size === size)
        .reduce((sum, v) => sum + v.stock, 0);
      return stock <= 0;
    }
    const match = variants.find((v) => v.size === size && v.color === selectedColor);
    return !match || match.stock <= 0;
  };

  // Variant click handlers with auto-fallback to first available counterpart
  const handleSizeClick = (size: string) => {
    if (isSizeDisabled(size)) return;
    setSelectedSize(size);

    const currentCombo = variants.find((v) => v.size === size && v.color === selectedColor);
    if (!currentCombo || currentCombo.stock <= 0) {
      const availableColor = allColors.find((c) => {
        const match = variants.find((v) => v.size === size && v.color === c);
        return match && match.stock > 0;
      });
      if (availableColor) {
        setSelectedColor(availableColor);
      }
    }
  };

  const handleColorClick = (color: string) => {
    if (isColorDisabled(color)) return;
    setSelectedColor(color);

    const currentCombo = variants.find((v) => v.size === selectedSize && v.color === color);
    if (!currentCombo || currentCombo.stock <= 0) {
      const availableSize = allSizes.find((s) => {
        const match = variants.find((v) => v.size === s && v.color === color);
        return match && match.stock > 0;
      });
      if (availableSize) {
        setSelectedSize(availableSize);
      }
    }
  };

  // Initialize selected options when product or out-of-stock state changes
  useEffect(() => {
    if (product) {
      if (isProductOutOfStock) {
        setSelectedSize("");
        setSelectedColor("");
      } else {
        const firstAvailable = variants.find((v) => v.stock > 0) || variants[0];
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
          setSelectedColor(firstAvailable.color);
        } else {
          setSelectedSize(allSizes[0] || "");
          setSelectedColor(allColors[0] || "");
        }
      }
      setQuantity(1);
      setCurrentSlide(0);
      window.scrollTo(0, 0);
    }
  }, [product?.id, isProductOutOfStock]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Selected variant state
  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const selectedVariantStock = selectedVariant ? selectedVariant.stock : 0;
  const canAddToCart =
    !isProductOutOfStock &&
    selectedVariant !== undefined &&
    selectedVariantStock > 0 &&
    quantity >= 1 &&
    quantity <= selectedVariantStock;

  const handleAddToCart = () => {
    if (!canAddToCart || !product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  // Loading Skeleton State
  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse space-y-8">
        <div className="h-5 w-48 bg-[var(--hairline)] rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] sm:aspect-[1/1] w-full rounded-[24px] bg-[var(--surface-alt)]" />
            <div className="flex gap-3">
              <div className="h-20 w-20 rounded-[14px] bg-[var(--surface-alt)]" />
              <div className="h-20 w-20 rounded-[14px] bg-[var(--surface-alt)]" />
              <div className="h-20 w-20 rounded-[14px] bg-[var(--surface-alt)]" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3 pb-6 border-b border-[var(--hairline)]">
              <div className="h-4 w-28 bg-[var(--hairline)] rounded-full" />
              <div className="h-9 w-3/4 bg-[var(--hairline)] rounded-full" />
              <div className="h-7 w-36 bg-[var(--hairline)] rounded-full" />
              <div className="h-16 w-full bg-[var(--hairline)] rounded-[14px]" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-20 bg-[var(--hairline)] rounded-full" />
              <div className="flex gap-2">
                <div className="h-11 w-16 bg-[var(--hairline)] rounded-[18px]" />
                <div className="h-11 w-16 bg-[var(--hairline)] rounded-[18px]" />
                <div className="h-11 w-16 bg-[var(--hairline)] rounded-[18px]" />
              </div>
            </div>
            <div className="h-12 w-full bg-[var(--hairline)] rounded-[18px]" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-heading text-[var(--ink)]">
          {t("productDetail.notFoundTitle")}
        </h1>
        <p className="text-body text-[var(--mid-gray)]">
          {t("productDetail.notFoundDesc")}
        </p>
        <Link to="/categories">
          <Button variant="secondary" className="rounded-[18px] cursor-pointer">
            {t("productDetail.backToCatalog")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)] mb-8">
        <Link to="/" className="hover:text-[var(--ink)] transition-colors">
          {t("categories.breadcrumbsHome")}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/categories/${product.categorySlug}`}
          className="hover:text-[var(--ink)] transition-colors"
        >
          {product.categoryName}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--ink)] font-medium truncate max-w-xs">
          {product.name}
        </span>
      </div>

      {/* Main Two-Column PDP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Image Carousel with Thumbnails & Zoom */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative group">
            {/* Out of Stock red badge over the product image */}
            {isProductOutOfStock && (
              <div className="absolute top-4 start-4 z-20 bg-rose-600 text-white font-semibold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md pointer-events-none">
                {t("common.outOfStock")}
              </div>
            )}

            {product.images && product.images.length > 0 ? (
              <Carousel
                dir="ltr"
                setApi={setCarouselApi}
                opts={{
                  loop: true,
                  direction: "ltr",
                }}
                className="w-full overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas)] shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
              >
                <CarouselContent dir="ltr">
                  {product.images.map((img, index) => (
                    <CarouselItem key={index}>
                      <div
                        className="relative aspect-[4/3] sm:aspect-[1/1] w-full cursor-zoom-in"
                        onClick={() => setZoomImage(img)}
                      >
                        <img
                          src={img}
                          alt={`${product.name} perspective ${index + 1}`}
                          referrerPolicy="no-referrer"
                          className={`h-full w-full object-cover object-center ${
                            isProductOutOfStock ? "grayscale-[25%] opacity-90" : ""
                          }`}
                        />
                        <div className="absolute top-4 right-4 bg-[var(--paper)]/80 backdrop-blur-xs p-2 rounded-full border border-[var(--hairline)] text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="h-4 w-4" />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {product.images.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="iconSm"
                      onClick={() => carouselApi?.scrollPrev()}
                      aria-label="Previous image"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full opacity-80 hover:opacity-100 group-hover:opacity-100 transition-opacity bg-[var(--paper)]/90 backdrop-blur-xs text-[var(--ink)] shadow-md cursor-pointer border border-[var(--hairline)]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="iconSm"
                      onClick={() => carouselApi?.scrollNext()}
                      aria-label="Next image"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full opacity-80 hover:opacity-100 group-hover:opacity-100 transition-opacity bg-[var(--paper)]/90 backdrop-blur-xs text-[var(--ink)] shadow-md cursor-pointer border border-[var(--hairline)]"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </Carousel>
            ) : (
              <div className="relative aspect-[4/3] sm:aspect-[1/1] w-full overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas)] flex flex-col items-center justify-center text-[var(--mid-gray)] space-y-2 select-none">
                <ImageIcon className="h-12 w-12 stroke-[1.25] opacity-40" />
                <span className="text-[13px] font-medium tracking-wide">
                  {t("common.noImage")}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div dir="ltr" className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border transition-all cursor-pointer ${
                    currentSlide === index
                      ? "border-[var(--ink)] ring-1 ring-[var(--ink)]"
                      : "border-[var(--hairline)] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-8">
          {/* Header & Pricing */}
          <div className="space-y-3 pb-6 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2 text-caption text-[var(--mid-gray)]">
              <span>{product.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>SKU: {product.id.slice(0, 8).toUpperCase()}</span>
            </div>

            <h1 className="text-heading-lg text-[var(--ink)] tracking-tight">
              {product.name}
            </h1>

            {/* Price & Old Price with Cross Line */}
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="text-[28px] font-semibold tabular-nums text-[var(--ink)]">
                {formatPrice(product.price)}
              </span>

              {/* Old price with cross line in the middle */}
              {product.originalPrice != null && product.originalPrice > product.price && (
                <span className="text-[18px] font-normal text-[var(--mid-gray)] line-through tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}

              {product.originalPrice != null && product.originalPrice > product.price && (
                <span className="text-[12px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}

              {/* Total Stock / Out of Stock Flag */}
              <div className="ms-auto flex items-center gap-2">
                {isProductOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-rose-600 text-white shadow-xs uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    {t("common.outOfStock")}
                  </span>
                ) : (
                  <span className="text-[12px] font-medium text-[var(--mid-gray)]">
                    {t("productDetail.totalStock", { count: totalStock })}
                  </span>
                )}
              </div>
            </div>

            <p className="text-body text-[var(--mid-gray)] leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Out of Stock Notice Banner */}
          {isProductOutOfStock && (
            <div className="rounded-[18px] border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/25 p-4 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-[13px]">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-medium">
                {t("productDetail.outOfStockStatus")}
              </span>
            </div>
          )}

          {/* Option Selectors: Sizes */}
          {allSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-caption">
                <span className="text-[var(--ink)] font-medium">
                  {t("productDetail.selectDimension")}
                </span>
                <span className="text-[var(--mid-gray)] font-mono">
                  {selectedSize || "—"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const disabled = isSizeDisabled(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSizeClick(size)}
                      title={disabled ? t("productDetail.variantOutOfStock") : undefined}
                      className={`relative h-11 px-4 text-[13px] font-medium rounded-[18px] border transition-all ${
                        disabled
                          ? "bg-[var(--surface-alt)]/60 text-[var(--mid-gray)]/60 border-[var(--hairline)] opacity-40 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-xs cursor-pointer"
                          : "bg-[var(--paper)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)] cursor-pointer"
                      }`}
                    >
                      <span>{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option Selectors: Colors */}
          {allColors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-caption">
                <span className="text-[var(--ink)] font-medium">
                  {t("productDetail.selectFinish")}
                </span>
                <span className="text-[var(--mid-gray)] font-mono">
                  {selectedColor || "—"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => {
                  const disabled = isColorDisabled(color);
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleColorClick(color)}
                      title={disabled ? t("productDetail.variantOutOfStock") : undefined}
                      className={`relative h-11 px-4 text-[13px] font-medium rounded-[18px] border transition-all ${
                        disabled
                          ? "bg-[var(--surface-alt)]/60 text-[var(--mid-gray)]/60 border-[var(--hairline)] opacity-40 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-xs cursor-pointer"
                          : "bg-[var(--paper)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)] cursor-pointer"
                      }`}
                    >
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add to Cart Action */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !canAddToCart}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-[15px] font-medium tabular-nums text-[var(--ink)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!canAddToCart || quantity >= selectedVariantStock}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* "Add to Cart" Button */}
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                size="lg"
                className={`flex-1 min-w-[220px] h-12 rounded-[18px] text-[15px] font-medium transition-all ${
                  isProductOutOfStock
                    ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 cursor-not-allowed opacity-80"
                    : !canAddToCart
                    ? "bg-[var(--surface-alt)] text-[var(--mid-gray)] border border-[var(--hairline)] cursor-not-allowed opacity-60"
                    : "bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] cursor-pointer"
                }`}
              >
                {isProductOutOfStock
                  ? t("common.outOfStock")
                  : !selectedVariant || selectedVariantStock <= 0
                  ? t("productDetail.variantOutOfStock")
                  : `${t("productDetail.addToCart")} · ${formatPrice(product.price * quantity)}`}
              </Button>
            </div>

            {/* Selected Variant Stock Feedback */}
            {!isProductOutOfStock && selectedVariant && (
              <p className="text-[12px] text-[var(--mid-gray)]">
                {t("productDetail.variantStock", { count: selectedVariantStock })}
              </p>
            )}
          </div>

          {/* Details Section */}
          <div className="pt-6 border-t border-[var(--hairline)] space-y-4">
            <h3 className="text-subheading font-medium text-[var(--ink)]">
              {t("common.details")}
            </h3>

            {/* Structured Specifications Grid */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex flex-col justify-center"
                  >
                    <span className="text-[11px] uppercase tracking-wider text-[var(--mid-gray)] font-medium">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-[13px] font-medium text-[var(--ink)] capitalize mt-0.5">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bulleted Features List */}
            {product.features && product.features.length > 0 && (
              <ul className="space-y-2.5 pt-1">
                {product.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-body text-[var(--mid-gray)] text-[14px]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] mt-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Fallback craftsmanship points if no specifications or features exist */}
            {(!product.specs || Object.keys(product.specs).length === 0) &&
              (!product.features || product.features.length === 0) && (
                <ul className="space-y-2.5">
                  {[
                    "Crafted from premium sustainable materials with exceptional structural integrity",
                    "Designed for spatial balance, minimalist clarity, and long-lasting durability",
                    "Finished by hand in small artisanal batches with natural protective treatments",
                  ].map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-body text-[var(--mid-gray)] text-[14px]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] mt-2 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomImage} onOpenChange={(open) => !open && setZoomImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-[var(--paper)]">
          {zoomImage && (
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[18px]">
              <img
                src={zoomImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain bg-[var(--canvas)]"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-12 border-t border-[var(--hairline)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-caption text-[var(--mid-gray)]">
                {t("productDetail.relatedSubtitle")}
              </p>
              <h2 className="text-heading text-[var(--ink)]">
                {t("productDetail.relatedTitle")}
              </h2>
            </div>
            <Link
              to={`/categories/${product.categorySlug}`}
              className="text-[14px] font-medium text-[var(--ink)] hover:underline underline-offset-4"
            >
              {t("categories.viewObject")}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
