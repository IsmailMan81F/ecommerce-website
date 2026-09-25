import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { HERO_IMAGE, ABOUT_CONTENT } from "@/lib/data";
import { useStore } from "@/context/StoreContext";

export const HomePage: React.FC = () => {
  const { products, categories } = useStore();
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-20 sm:space-y-28 pb-12">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Typography & CTA */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <p className="text-caption text-[var(--mid-gray)]">
                Collection Edition 2026 · Monolith Atelier
              </p>
              <h1 className="text-display text-[var(--ink)] tracking-tight max-w-xl text-balance">
                Tactile permanence for modern living.
              </h1>
            </div>

            <p className="text-body-lg text-[var(--mid-gray)] max-w-lg leading-relaxed">
              Curated analog audio, hand-thrown ceramics, raw vegetable-tanned leather, and sculptural timber objects engineered with uncompromising material honesty.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/categories">
                <Button size="lg" className="rounded-[18px] gap-2 px-7">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[18px] px-6 text-[var(--ink)]"
                >
                  <span>Our Philosophy</span>
                </Button>
              </Link>
            </div>

            {/* Quiet trust markers */}
            <div className="pt-6 border-t border-[var(--hairline)] grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-[18px] font-semibold tabular-nums text-[var(--ink)]">100%</p>
                <p className="text-caption text-[var(--mid-gray)]">Plastic-Free</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold tabular-nums text-[var(--ink)]">12</p>
                <p className="text-caption text-[var(--mid-gray)]">Ateliers</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold tabular-nums text-[var(--ink)]">25+ Yrs</p>
                <p className="text-caption text-[var(--mid-gray)]">Longevity</p>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas)] shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
              <img
                src={HERO_IMAGE}
                alt="Minimalist architectural living interior with sculptural furniture"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[var(--paper)]/90 backdrop-blur-xs p-4 rounded-[18px] border border-[var(--hairline)] flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--ink)]">
                    Scandinave & Kyoto Editions
                  </p>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    Solid ash timber, tactile bouclé & coarse stoneware
                  </p>
                </div>
                <Link to="/categories/minimalist-furniture">
                  <span className="text-caption text-[var(--ink)] hover:underline inline-flex items-center gap-1 font-medium">
                    View <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-caption text-[var(--mid-gray)]">Disciplines</p>
            <h2 className="text-heading text-[var(--ink)]">Curated Categories</h2>
          </div>
          <Link
            to="/categories"
            className="text-[14px] font-medium text-[var(--ink)] hover:underline underline-offset-4 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>All Categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* shadcn Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 sm:-ml-6">
            {categories.map((category) => (
              <CarouselItem
                key={category.id}
                className="pl-4 sm:pl-6 basis-[80%] sm:basis-[48%] lg:basis-[33.33%]"
              >
                <CategoryCard category={category} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:flex items-center justify-end gap-2 mt-6">
            <CarouselPrevious className="static translate-y-0 h-10 w-10" />
            <CarouselNext className="static translate-y-0 h-10 w-10" />
          </div>
        </Carousel>
      </section>

      {/* Best Selling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-caption text-[var(--mid-gray)]">Signature Selection</p>
            <h2 className="text-heading text-[var(--ink)]">Best Selling Objects</h2>
          </div>
          <Link
            to="/categories"
            className="text-[14px] font-medium text-[var(--ink)] hover:underline underline-offset-4 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Craftsmanship Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-alt)] p-8 sm:p-12 lg:p-16">
          <div className="max-w-3xl space-y-6">
            <p className="text-caption text-[var(--mid-gray)]">The Atelier Creed</p>
            <blockquote className="text-heading font-normal text-[var(--ink)] leading-snug tracking-tight">
              &ldquo;We design not for the visual spectacle of the moment, but for the tactile intimacy of daily touch and lifelong resonance.&rdquo;
            </blockquote>
            <p className="text-body text-[var(--mid-gray)] leading-relaxed">
              Every curve, seam, and chamfer is calibrated to withstand the entropy of trends. Materials are left in their honest states—unlacquered brass, unpigmented full-grain leather, and unglazed volcanic stoneware.
            </p>
            <div className="pt-2">
              <Link to="/about">
                <Button variant="outline" className="rounded-[18px]">
                  Read Our Full Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
