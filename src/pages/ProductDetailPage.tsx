import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Minus,
  Plus,
  Maximize2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";

export const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useStore();

  const product = products.find((p) => p.slug === slug);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Initialize selected options when product loads
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "Standard");
      setSelectedColor(product.colors[0] || "");
      setQuantity(1);
      setCurrentSlide(0);
      window.scrollTo(0, 0);
    }
  }, [product, slug]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

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

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const relatedProducts = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 3);

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
                        className="h-full w-full object-cover object-center"
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
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
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
              <span>Atelier Ref. {product.id.toUpperCase()}</span>
            </div>

            <h1 className="text-heading-lg text-[var(--ink)] tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-[28px] font-semibold tabular-nums text-[var(--ink)]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-body text-[var(--mid-gray)] line-through tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-[12px] font-medium text-[var(--mid-gray)] ms-auto">
                {product.isAvailable
                  ? product.stock > 0
                    ? `${t("common.inStock")} (${product.stock})`
                    : t("productDetail.inStockStatus")
                  : t("common.outOfStock")}
              </span>
            </div>

            <p className="text-body text-[var(--mid-gray)] leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Option Selectors: Sizes / Variants */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-caption">
                <span className="text-[var(--ink)]">{t("productDetail.selectDimension")}</span>
                <span className="text-[var(--mid-gray)]">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 px-4 text-[13px] font-medium rounded-[18px] border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                          : "bg-[var(--paper)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option Selectors: Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-caption">
                <span className="text-[var(--ink)]">{t("productDetail.selectFinish")}</span>
                <span className="text-[var(--mid-gray)]">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-11 px-4 text-[13px] font-medium rounded-[18px] border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                          : "bg-[var(--paper)] text-[var(--ink)] border-[var(--hairline)] hover:border-[var(--mid-gray)]"
                      }`}
                    >
                      {color}
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
                  disabled={quantity <= 1 || !product.isAvailable}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer disabled:opacity-30"
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
                  disabled={!product.isAvailable}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Full-width / wrapping "Add to Cart" button */}
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                size="lg"
                className="flex-1 min-w-[220px] h-12 rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] text-[15px] font-medium disabled:opacity-50 cursor-pointer"
              >
                {product.isAvailable
                  ? `${t("productDetail.addToCart")} · ${formatPrice(product.price * quantity)}`
                  : t("common.outOfStock")}
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="pt-6 border-t border-[var(--hairline)] space-y-4">
            <h3 className="text-subheading font-medium text-[var(--ink)]">
              {t("common.details")}
            </h3>
            <ul className="space-y-2.5">
              {(product.features && product.features.length > 0
                ? product.features
                : [
                    "Crafted from premium sustainable materials with exceptional structural integrity",
                    "Designed for spatial balance, minimalist clarity, and long-lasting durability",
                    "Finished by hand in small artisanal batches with natural protective treatments",
                    "Accompanied by an individual certificate of authenticity and numbered release",
                  ]
              ).map((detail, i) => (
                <li key={i} className="flex items-start gap-2.5 text-body text-[var(--mid-gray)] text-[14px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] mt-2 shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
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
