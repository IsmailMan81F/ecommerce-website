import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Pencil, Minus, Plus, Check } from "lucide-react";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [editOpen, setEditOpen] = useState(false);
  const [editingSize, setEditingSize] = useState(item.selectedSize || item.product.sizes[0] || "");
  const [editingColor, setEditingColor] = useState(item.selectedColor || item.product.colors[0] || "");
  const [editingQty, setEditingQty] = useState(item.quantity);

  const handleSaveEdit = () => {
    // If options changed, we update
    item.selectedSize = editingSize;
    item.selectedColor = editingColor;
    updateQuantity(item.id, editingQty, true);
    setEditOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-[var(--hairline)] last:border-b-0">
        {/* Thumbnail & Product Details */}
        <div className="flex items-center gap-4">
          <Link
            to={`/product/${item.product.slug}`}
            className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-[var(--canvas)] border border-[var(--hairline)]"
          >
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          </Link>

          <div className="space-y-1">
            <Link
              to={`/product/${item.product.slug}`}
              className="text-[15px] font-medium text-[var(--ink)] hover:underline underline-offset-4 line-clamp-1"
            >
              {item.product.name}
            </Link>

            <div className="flex items-center gap-2 text-[13px] text-[var(--mid-gray)]">
              <span>{item.selectedSize || "Standard"}</span>
              {item.selectedColor && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{item.selectedColor}</span>
                </>
              )}
            </div>

            <div className="sm:hidden text-[14px] font-medium text-[var(--ink)] tabular-nums pt-1">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        </div>

        {/* Quantity Controls, Price, & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
          {/* Quantity Stepper */}
          <div className="flex items-center rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-alt)] p-0.5">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, -1)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer disabled:opacity-30"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-[13px] font-medium tabular-nums text-[var(--ink)]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, 1)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Subtotal for this line item */}
          <div className="hidden sm:block text-right min-w-[80px]">
            <p className="text-[15px] font-medium text-[var(--ink)] tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-[12px] text-[var(--mid-gray)] tabular-nums">
                {formatPrice(item.price)} each
              </p>
            )}
          </div>

          {/* Action Buttons: Edit (Neutral) & Remove (Colored #e7000b) */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => setEditOpen(true)}
              className="text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]"
              aria-label={`Edit ${item.product.name} options`}
              title="Edit configuration"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              onClick={() => removeItem(item.id)}
              className="text-[var(--ember)] hover:text-[var(--ember)] hover:bg-[var(--ember)]/10"
              aria-label={`Remove ${item.product.name} from cart`}
              title="Remove item"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Options Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Edit Item Configuration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-caption text-[var(--mid-gray)]">Option / Size</label>
              <Select value={editingSize} onValueChange={setEditingSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {item.product.sizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {item.product.colors && item.product.colors.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-caption text-[var(--mid-gray)]">Material / Finish</label>
                <Select value={editingColor} onValueChange={setEditingColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.product.colors.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-caption text-[var(--mid-gray)]">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="iconSm"
                  disabled={editingQty <= 1}
                  onClick={() => setEditingQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-[14px] font-medium tabular-nums">{editingQty}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="iconSm"
                  onClick={() => setEditingQty((q) => q + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="gap-1.5">
              <Check className="h-4 w-4" />
              <span>Update Item</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
