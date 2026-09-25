import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes[0], product.colors[0]);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-4 sm:p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_-1px_rgba(0,0,0,0.02)] hover:border-[var(--mid-gray)]/40 transition-all duration-300">
      {/* Clickable Image & Info Container */}
      <Link to={`/product/${product.slug}`} className="block focus:outline-none">
        {/* Product Image Frame */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-[var(--canvas)] mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          {/* Quiet Status Text Tag if best seller or low stock */}
          {product.isBestSeller && (
            <div className="absolute top-3 left-3 bg-[var(--paper)]/90 backdrop-blur-xs px-2.5 py-1 rounded-[14px] border border-[var(--hairline)]">
              <span className="text-[11px] font-medium tracking-wider uppercase text-[var(--ink)]">
                Selected
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1.5">
          <p className="text-caption text-[var(--mid-gray)]">
            {product.categoryName}
          </p>
          <h3 className="text-[16px] font-semibold text-[var(--ink)] tracking-tight line-clamp-1 group-hover:text-[var(--ink-soft)] transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Baseline Action & Price Area */}
      <div className="mt-4 pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-medium tabular-nums text-[var(--ink)]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[13px] text-[var(--mid-gray)] line-through tabular-nums">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleQuickAdd}
          variant="secondary"
          size="sm"
          className="h-8 px-3 rounded-[18px] text-[12px] font-medium gap-1 text-[var(--ink)] border border-[var(--hairline)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:border-[var(--ink)] transition-all"
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </Button>
      </div>
    </div>
  );
};
