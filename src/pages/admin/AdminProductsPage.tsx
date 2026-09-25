import React, { useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { Product, ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  X,
  Layers,
  Image as ImageIcon,
  Check,
  RotateCcw,
} from "lucide-react";

interface VariantRow {
  id: string;
  size: string;
  color: string;
  stock: number;
  isAvailable: boolean;
}

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    categories,
    toggleProductAvailability,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Dialog State
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [categorySlug, setCategorySlug] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Delete Confirmation Dialog
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (
        selectedCategoryFilter !== "all" &&
        p.categorySlug !== selectedCategoryFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.categoryName.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }

      return true;
    });
  }, [products, selectedCategoryFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("120");
    setCategorySlug(categories[0]?.slug || "");
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setImages(products[0]?.images ? [products[0].images[0]] : []);
    setVariants([
      {
        id: `var-${Date.now()}-1`,
        size: "Standard",
        color: "Matte Black",
        stock: 10,
        isAvailable: true,
      },
    ]);
    setIsAvailable(true);
    setFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setCategorySlug(p.categorySlug);
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setImages(p.images && p.images.length > 0 ? [...p.images] : []);

    if (p.variants && p.variants.length > 0) {
      setVariants(
        p.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          isAvailable: v.isAvailable,
        }))
      );
    } else {
      // Create initial variant rows from sizes and colors
      const initialVariants: VariantRow[] = [];
      const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ["Standard"];
      const colors = p.colors && p.colors.length > 0 ? p.colors : ["Default"];

      sizes.forEach((s, sIdx) => {
        colors.forEach((c, cIdx) => {
          initialVariants.push({
            id: `var-${sIdx}-${cIdx}`,
            size: s,
            color: c,
            stock: Math.max(1, Math.floor(p.stock / (sizes.length * colors.length))),
            isAvailable: p.isAvailable,
          });
        });
      });

      setVariants(
        initialVariants.length > 0
          ? initialVariants
          : [
              {
                id: `var-${Date.now()}`,
                size: "Standard",
                color: "Default",
                stock: p.stock || 5,
                isAvailable: p.isAvailable,
              },
            ]
      );
    }

    setIsAvailable(p.isAvailable);
    setFormOpen(true);
  };

  // Handle local image file upload preview
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls: string[] = [];
      Array.from(e.target.files).forEach((file) => {
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      });
      setImages((prev) => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} image(s) attached`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Variants management
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        size: "Standard",
        color: "Custom Finish",
        stock: 5,
        isAvailable: true,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (
    id: string,
    key: keyof VariantRow,
    value: string | number | boolean
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, [key]: value };
        }
        return v;
      })
    );
  };

  // Submit Add / Edit Form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    let finalCategorySlug = categorySlug;
    let finalCategoryName = "";

    if (isCreatingNewCategory) {
      if (!newCategoryName.trim()) {
        toast.error("Please enter a name for the new category");
        return;
      }
      const newCat = addCategory(newCategoryName.trim());
      finalCategorySlug = newCat.slug;
      finalCategoryName = newCat.name;
    } else {
      const foundCat = categories.find((c) => c.slug === categorySlug);
      finalCategoryName = foundCat ? foundCat.name : "Curated Objects";
    }

    // Extract unique sizes and colors from variants
    const uniqueSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
    const uniqueColors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const productPayload = {
      name: name.trim(),
      description: description.trim() || "Sculptural architectural object.",
      price: parsedPrice,
      categorySlug: finalCategorySlug,
      categoryName: finalCategoryName,
      images: images.length > 0 ? images : [products[0]?.images[0] || ""],
      sizes: uniqueSizes.length > 0 ? uniqueSizes : ["Standard"],
      colors: uniqueColors.length > 0 ? uniqueColors : ["Default"],
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        isAvailable: v.isAvailable,
      })),
      stock: totalStock,
      isAvailable,
      features: editingProduct?.features || [
        "Machined from solid raw materials",
        "Hand-finished in small batch atelier",
        "Natural non-toxic plant wax finish",
      ],
      specs: editingProduct?.specs || {
        Finish: uniqueColors.join(", ") || "Raw Natural",
        Origin: "Atelier Studio",
      },
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      toast.success("Product Updated", {
        description: `${name} has been updated in the catalog.`,
      });
    } else {
      addProduct(productPayload);
      toast.success("Product Created", {
        description: `${name} added to ${finalCategoryName}.`,
      });
    }

    setFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast.success("Product Deleted", {
        description: `${productToDelete.name} was removed from the catalog.`,
      });
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Add Product Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-[var(--ink)]">Catalog Objects</h1>
          <p className="text-body text-[var(--mid-gray)] text-[14px]">
            Manage products, toggle availability in real-time, configure variant stock, and add atelier pieces.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Main Card with Filter Bar and Products Grid / Table */}
      <Card className="rounded-[24px]">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                type="search"
                placeholder="Search products by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-[14px] rounded-[18px]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <div className="w-[180px]">
                <Select
                  value={selectedCategoryFilter}
                  onValueChange={setSelectedCategoryFilter}
                >
                  <SelectTrigger className="h-10 text-[13px] rounded-[18px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || selectedCategoryFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategoryFilter("all");
                  }}
                  className="h-10 px-3 text-[12px] text-[var(--mid-gray)] rounded-[18px] gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-[20px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-xs hover:border-[var(--mid-gray)]/40 transition-all"
              >
                <div>
                  {/* Top: Thumbnail + Name + Price */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-16 w-16 rounded-[12px] object-cover bg-[var(--canvas)] border border-[var(--hairline)] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-caption text-[var(--mid-gray)] truncate">
                        {p.categoryName}
                      </p>
                      <h3 className="text-[15px] font-medium text-[var(--ink)] tracking-tight truncate">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[14px] font-semibold text-[var(--ink)] tabular-nums">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-[12px] text-[var(--mid-gray)] tabular-nums">
                          · {p.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Inline Switch to toggle availability + Edit/Delete action buttons */}
                <div className="mt-4 pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
                  {/* Availability Toggle Switch */}
                  <div className="flex items-center gap-2.5">
                    <Switch
                      id={`avail-${p.id}`}
                      checked={p.isAvailable}
                      onCheckedChange={() => {
                        toggleProductAvailability(p.id);
                        toast.success(
                          `${p.name} is now ${!p.isAvailable ? "In Stock" : "Out of Stock"}`
                        );
                      }}
                    />
                    <Label
                      htmlFor={`avail-${p.id}`}
                      className="text-[12px] font-medium text-[var(--ink)] cursor-pointer select-none"
                    >
                      {p.isAvailable ? "In Stock" : "Out of Stock"}
                    </Label>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      onClick={() => handleOpenEdit(p)}
                      className="text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]"
                      title="Edit product"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setProductToDelete(p)}
                      className="text-[var(--ember)] hover:text-[var(--ember)] hover:bg-[var(--ember)]/10"
                      title="Delete product"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-[var(--mid-gray)]">
              No products found matching the criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Product Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[620px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-heading-sm">
              {editingProduct ? "Edit Product" : "Add New Design Object"}
            </DialogTitle>
            <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px]">
              Configure object metadata, images, and variant inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-6 pt-2">
            {/* Title & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="prod-name">Object Title *</Label>
                <Input
                  id="prod-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linear Monolith Turntable"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-price">Price (USD) *</Label>
                <Input
                  id="prod-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category Selection + Inline Category Creation */}
            <div className="space-y-2">
              <Label>Category</Label>
              {!isCreatingNewCategory ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={categorySlug} onValueChange={setCategorySlug}>
                      <SelectTrigger className="h-10 text-[14px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.slug}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreatingNewCategory(true)}
                    className="h-10 rounded-[18px] text-[13px] whitespace-nowrap"
                  >
                    + Create new category
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-[var(--ink)]">New Category Details</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(false)}
                      className="text-[12px] text-[var(--mid-gray)] hover:text-[var(--ink)]"
                    >
                      Cancel new category
                    </button>
                  </div>
                  <Input
                    placeholder="Category title (e.g. Cast Iron Cookware)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe material composition, tactile finishes, and dimensions..."
                rows={3}
              />
            </div>

            {/* Images Upload / Previews */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label>Object Imagery</Label>
                <label className="text-[12px] text-[var(--ink)] font-medium cursor-pointer flex items-center gap-1 hover:underline">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Attach local image</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Thumbnails list */}
              <div className="flex flex-wrap gap-2.5 p-2 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] min-h-[76px] items-center">
                {images.length > 0 ? (
                  images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-14 w-14 rounded-[10px] overflow-hidden border border-[var(--hairline)] group"
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[var(--ink)]/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-[var(--mid-gray)] px-3">
                    No images attached. Click &ldquo;Attach local image&rdquo; to add photos.
                  </p>
                )}
              </div>
            </div>

            {/* Variants Section: Repeatable rows for size/color combinations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Variants & Stock Inventory</Label>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    Define sizes, finishes, and individual stock quantities.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                  className="rounded-[18px] text-[12px] h-8 px-2.5 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Variant</span>
                </Button>
              </div>

              <div className="space-y-2">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center gap-2.5"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder="Size / Format"
                        value={variant.size}
                        onChange={(e) =>
                          handleUpdateVariant(variant.id, "size", e.target.value)
                        }
                        className="h-8 text-[12px] rounded-[12px]"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Finish / Color"
                        value={variant.color}
                        onChange={(e) =>
                          handleUpdateVariant(variant.id, "color", e.target.value)
                        }
                        className="h-8 text-[12px] rounded-[12px]"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) =>
                          handleUpdateVariant(
                            variant.id,
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-8 text-[12px] rounded-[12px] tabular-nums"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variant.isAvailable}
                        onCheckedChange={(checked) =>
                          handleUpdateVariant(variant.id, "isAvailable", checked)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ember)] hover:bg-[var(--ember)]/10 transition-colors"
                        title="Remove variant row"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall In-Stock toggle */}
            <div className="flex items-center justify-between p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)]">
              <div>
                <p className="text-[13px] font-medium text-[var(--ink)]">Catalog Availability</p>
                <p className="text-[12px] text-[var(--mid-gray)]">
                  When enabled, buyers can purchase this item immediately.
                </p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormOpen(false)}
                className="rounded-[18px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>{editingProduct ? "Save Product" : "Publish Object"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <DialogContent className="sm:max-w-[420px] p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-[var(--ember)]/10 text-[var(--ember)] flex items-center justify-center mx-auto mb-2">
            <Trash2 className="h-5 w-5" />
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-heading-sm">Remove Product?</DialogTitle>
            <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px] pt-1">
              Are you sure you want to delete{" "}
              <strong className="text-[var(--ink)]">{productToDelete?.name}</strong>?
              This action will remove it from the public catalog.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 flex-col sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setProductToDelete(null)}
              className="rounded-[18px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="rounded-[18px] px-5"
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
