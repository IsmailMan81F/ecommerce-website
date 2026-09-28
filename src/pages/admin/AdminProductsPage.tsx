import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
  const [detailsText, setDetailsText] = useState(
    "Crafted from premium sustainable materials with exceptional structural integrity\nDesigned for spatial balance, minimalist clarity, and long-lasting durability\nFinished by hand in small artisanal batches with natural protective treatments\nAccompanied by an individual certificate of authenticity and numbered release"
  );

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
    setDetailsText(
      "Crafted from premium sustainable materials with exceptional structural integrity\nDesigned for spatial balance, minimalist clarity, and long-lasting durability\nFinished by hand in small artisanal batches with natural protective treatments\nAccompanied by an individual certificate of authenticity and numbered release"
    );
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
    setDetailsText(
      p.features && p.features.length > 0
        ? p.features.join("\n")
        : "Crafted from premium sustainable materials with exceptional structural integrity\nDesigned for spatial balance, minimalist clarity, and long-lasting durability\nFinished by hand in small artisanal batches with natural protective treatments\nAccompanied by an individual certificate of authenticity and numbered release"
    );

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
        color: "Matte Black",
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

    const parsedDetails = detailsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

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
      features:
        parsedDetails.length > 0
          ? parsedDetails
          : [
              "Crafted from premium sustainable materials with exceptional structural integrity",
              "Designed for spatial balance, minimalist clarity, and long-lasting durability",
              "Finished by hand in small artisanal batches with natural protective treatments",
              "Accompanied by an individual certificate of authenticity and numbered release",
            ],
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      toast.success(t("admin.productUpdated"), {
        description: `${name}`,
      });
    } else {
      addProduct(productPayload);
      toast.success(t("admin.productCreated"), {
        description: `${name}`,
      });
    }

    setFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast.success(t("admin.productDeleted"), {
        description: `${productToDelete.name}`,
      });
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Add Product Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-heading text-[var(--ink)]">{t("admin.products")}</h1>
          <p className="text-body text-[var(--mid-gray)] text-[14px]">
            {t("admin.productsSubtitle")}
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.addProduct")}</span>
        </Button>
      </div>

      {/* Main Card with Filter Bar and Products Grid / Table */}
      <Card className="rounded-[24px]">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                type="search"
                placeholder={t("admin.searchProductsPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 h-10 text-[14px] rounded-[18px]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-[180px]">
                <Select
                  value={selectedCategoryFilter}
                  onValueChange={setSelectedCategoryFilter}
                >
                  <SelectTrigger className="h-10 text-[13px] rounded-[18px]">
                    <SelectValue placeholder={t("admin.allCategories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin.allCategories")}</SelectItem>
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
                  <span>{t("admin.reset")}</span>
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
                className="flex flex-col justify-between rounded-[20px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-xs hover:border-[var(--mid-gray)]/40 transition-all min-w-0"
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
                      <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                        <span className="text-[14px] font-semibold text-[var(--ink)] tabular-nums">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-[12px] text-[var(--mid-gray)] tabular-nums">
                          · {t("admin.stockCount", { count: p.stock })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Inline Switch to toggle availability + Edit/Delete action buttons */}
                <div className="mt-4 pt-3 border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-2.5">
                  {/* Availability Toggle Switch */}
                  <div className="flex items-center gap-2.5">
                    <Switch
                      id={`avail-${p.id}`}
                      checked={p.isAvailable}
                      onCheckedChange={() => {
                        toggleProductAvailability(p.id);
                        const statusText = !p.isAvailable ? t("admin.inStock") : t("admin.outOfStock");
                        toast.success(`${p.name} - ${statusText}`);
                      }}
                    />
                    <Label
                      htmlFor={`avail-${p.id}`}
                      className="text-[12px] font-medium text-[var(--ink)] cursor-pointer select-none"
                    >
                      {p.isAvailable ? t("admin.inStock") : t("admin.outOfStock")}
                    </Label>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 ml-auto rtl:ml-0 rtl:mr-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      onClick={() => handleOpenEdit(p)}
                      className="text-[var(--mid-gray)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]"
                      title={t("common.edit")}
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
                      title={t("common.delete")}
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
              {t("admin.noProductsFound")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Product Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[620px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-heading-sm">
              {editingProduct ? t("admin.editProduct") : t("admin.addDesignObject")}
            </DialogTitle>
            <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px]">
              {t("admin.editProductDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-6 pt-2">
            {/* Title & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="prod-name">{t("admin.objectTitle")} *</Label>
                <Input
                  id="prod-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linear Monolith Turntable"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-price">{t("admin.priceUsd")} *</Label>
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
              <Label>{t("admin.category")}</Label>
              {!isCreatingNewCategory ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={categorySlug} onValueChange={setCategorySlug}>
                      <SelectTrigger className="h-10 text-[14px]">
                        <SelectValue placeholder={t("admin.selectCategory")} />
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
                    {t("admin.createNewCategory")}
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-[16px] bg-[var(--surface-alt)] border border-[var(--hairline)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-[var(--ink)]">{t("admin.newCategoryDetails")}</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(false)}
                      className="text-[12px] text-[var(--mid-gray)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      {t("admin.cancelNewCategory")}
                    </button>
                  </div>
                  <Input
                    placeholder={t("admin.categoryTitlePlaceholder")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-desc">{t("admin.description")}</Label>
              <Textarea
                id="prod-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("admin.descPlaceholder")}
                rows={3}
              />
            </div>

            {/* Details (Lines) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="prod-details">{t("admin.detailsLines")}</Label>
                <span className="text-[11px] text-[var(--mid-gray)]">
                  {t("admin.detailsHint")}
                </span>
              </div>
              <Textarea
                id="prod-details"
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder={t("admin.detailsPlaceholder")}
                rows={4}
              />
            </div>

            {/* Images Upload / Previews */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label>{t("admin.objectImagery")}</Label>
                <label className="text-[12px] text-[var(--ink)] font-medium cursor-pointer flex items-center gap-1 hover:underline">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{t("admin.attachLocalImage")}</span>
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
                    {t("admin.noImagesAttached")}
                  </p>
                )}
              </div>
            </div>

            {/* Variants Section: Repeatable rows for size/color combinations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("admin.variantsInventory")}</Label>
                  <p className="text-[12px] text-[var(--mid-gray)]">
                    {t("admin.variantsDesc")}
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
                  <span>{t("admin.addVariant")}</span>
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
                        placeholder={t("admin.sizeFormat")}
                        value={variant.size}
                        onChange={(e) =>
                          handleUpdateVariant(variant.id, "size", e.target.value)
                        }
                        className="h-8 text-[12px] rounded-[12px]"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder={t("admin.color")}
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
                        placeholder={t("admin.stock")}
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
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ember)] hover:bg-[var(--ember)]/10 transition-colors cursor-pointer"
                        title="Remove variant"
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
                <p className="text-[13px] font-medium text-[var(--ink)]">{t("admin.catalogAvailability")}</p>
                <p className="text-[12px] text-[var(--mid-gray)]">
                  {t("admin.catalogAvailabilityDesc")}
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
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>{editingProduct ? t("admin.saveProduct") : t("admin.publishObject")}</span>
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
          <div className="h-16 w-16 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Trash2 className="h-7 w-7 text-rose-600" />
          </div>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-heading-sm text-[var(--ink)]">{t("admin.removeProductTitle")}</DialogTitle>
            <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px] pt-1">
              {t("admin.removeProductConfirm", { name: productToDelete?.name })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-wrap items-center justify-end gap-2.5 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setProductToDelete(null)}
              className="rounded-[18px]"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="rounded-[18px] px-5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {t("admin.deleteProduct")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
