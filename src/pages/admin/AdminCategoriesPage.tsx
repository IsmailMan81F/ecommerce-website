import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "@/context/StoreContext";
import { Category, Product } from "@/types";
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
  FolderTree,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Package,
} from "lucide-react";
import { lockViewportScroll } from "@/lib/scrollLock";
import { AdminDeleteConfirmationDialog } from "@/components/admin/AdminDeleteConfirmationDialog";
import { formatPrice } from "@/lib/utils";

const SUGGESTED_PRESETS = [
  {
    name: "T-Shirts & Tops",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    desc: "Heavyweight boxy crewneck t-shirts and architectural basics.",
  },
  {
    name: "Pants & Trousers",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
    desc: "Pleated wide-leg trousers, tailored chinos, and streetwear pants.",
  },
  {
    name: "Shoes & Footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80",
    desc: "Minimalist leather low-top sneakers and lug-sole derby shoes.",
  },
  {
    name: "Outerwear & Jackets",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
    desc: "Minimalist zip jackets, tailored blazers, and clean overcoats.",
  },
];

interface DeleteModalState {
  isOpen: boolean;
  category: Category | null;
  step: 1 | 2;
  affectedProducts: Product[];
}

export const AdminCategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add / Edit Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Delete Double Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    category: null,
    step: 1,
    affectedProducts: [],
  });

  // Fix height of main screen and lock background scroll when category modal is open
  React.useEffect(() => {
    if (formOpen || deleteModal.isOpen) {
      return lockViewportScroll();
    }
  }, [formOpen, deleteModal.isOpen]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setFormOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setImageUrl(category.image);
    setFormOpen(true);
  };

  // Handle local image file upload (converts to persistent Base64 DataURL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("admin.imageUploadInvalidType"));
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        toast.success(t("admin.imageUploadSuccess"));
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error(t("admin.imageUploadFailed"));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Save Category (Create or Edit)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("admin.categoryNameRequired"));
      return;
    }

    const trimmedName = name.trim();
    const finalDescription =
      description.trim() || `Curated ${trimmedName} design objects.`;
    const finalImage =
      imageUrl.trim() ||
      products[0]?.images[0] ||
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80";

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: trimmedName,
        slug: slug.trim() || undefined,
        description: finalDescription,
        image: finalImage,
      });
      toast.success(t("admin.categoryUpdated"), {
        description: `"${trimmedName}"`,
      });
    } else {
      addCategory({
        name: trimmedName,
        slug: slug.trim() || undefined,
        description: finalDescription,
        image: finalImage,
      });
      toast.success(t("admin.categoryCreated"), {
        description: `"${trimmedName}"`,
      });
    }

    setFormOpen(false);
  };

  // Initiate Delete Flow
  const handleInitiateDelete = (category: Category) => {
    const affected = products.filter((p) => p.categorySlug === category.slug);
    setDeleteModal({
      isOpen: true,
      category,
      step: 1,
      affectedProducts: affected,
    });
  };

  // Continue to second confirmation step (if products exist) or execute delete directly
  const handleFirstStepConfirm = () => {
    if (!deleteModal.category) return;

    if (deleteModal.affectedProducts.length === 0) {
      executeDeletion();
    } else {
      setDeleteModal((prev) => ({ ...prev, step: 2 }));
    }
  };

  // Perform actual category & cascaded products deletion
  const executeDeletion = () => {
    if (!deleteModal.category) return;
    const cat = deleteModal.category;
    deleteCategory(cat.id);

    toast.success(t("admin.categoryDeleted"), {
      description: `"${cat.name}"`,
    });

    setDeleteModal({
      isOpen: false,
      category: null,
      step: 1,
      affectedProducts: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading text-[var(--ink)]">{t("admin.categories")}</h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-[12px] bg-[var(--surface-alt)] border border-[var(--hairline)] text-[var(--mid-gray)]">
              {categories.length}
            </span>
          </div>
          <p className="text-body text-[var(--mid-gray)] text-[14px] mt-0.5">
            {t("admin.categoriesSubtitle")}
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.addCategory")}</span>
        </Button>
      </div>

      {/* Filter and Overview Bar */}
      <Card className="rounded-[18px] border-[var(--hairline)] bg-[var(--paper)] shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.searchCategories")}
                className="ps-10 pe-8 rounded-[12px] bg-[var(--canvas)] border-[var(--hairline)] text-[14px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--mid-gray)] hover:text-[var(--ink)] cursor-pointer"
                  aria-label={t("admin.clearSearch")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 text-[13px] text-[var(--mid-gray)]">
              <div className="flex items-center gap-1.5">
                <FolderTree className="h-4 w-4 text-[var(--ink-soft)]" />
                <span>
                  {t("admin.showingCategoriesCount", {
                    filtered: filteredCategories.length,
                    total: categories.length,
                  })}
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--hairline)] hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-[var(--ink-soft)]" />
                <span>
                  <strong className="text-[var(--ink)]">{products.length}</strong> {t("admin.totalObjects")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card className="rounded-[18px] border-[var(--hairline)] bg-[var(--paper)] py-16 text-center">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-alt)] border border-[var(--hairline)] flex items-center justify-center mx-auto text-[var(--mid-gray)]">
              <FolderTree className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[16px] font-medium text-[var(--ink)]">
                {searchQuery ? t("admin.noMatchingCategories") : t("admin.noCategoriesYet")}
              </p>
              <p className="text-[14px] text-[var(--mid-gray)] mt-1">
                {searchQuery
                  ? t("admin.noMatchingCategoriesDesc", { query: searchQuery })
                  : t("admin.noCategoriesYetDesc")}
              </p>
            </div>
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-[14px] border-[var(--hairline)]"
              >
                {t("admin.clearSearch")}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="rounded-[14px] bg-[var(--ink-soft)] text-[var(--paper)]"
              >
                <Plus className="h-4 w-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
                {t("admin.addCategory")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const productCount = products.filter(
              (p) => p.categorySlug === category.slug
            ).length;

            return (
              <Card
                key={category.id}
                className="rounded-[18px] border-[var(--hairline)] bg-[var(--paper)] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Category Image Header */}
                <div className="relative h-44 bg-[var(--surface-alt)] overflow-hidden border-b border-[var(--hairline)]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--mid-gray)] bg-[var(--surface-alt)]">
                      <ImageIcon className="h-8 w-8 mb-1 stroke-1" />
                      <span className="text-[12px]">{t("admin.noImageAssigned")}</span>
                    </div>
                  )}

                  {/* Product Count Pill */}
                  <div className="absolute top-3 end-3 bg-[var(--paper)]/90 backdrop-blur-xs px-2.5 py-1 rounded-[12px] border border-[var(--hairline)] text-[12px] font-medium text-[var(--ink)] shadow-xs flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        productCount > 0 ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                      }`}
                    />
                    <span>
                      {productCount === 1 ? t("admin.itemSingle") : t("admin.itemsCount", { count: productCount })}
                    </span>
                  </div>

                  {/* Slug Pill */}
                  <div className="absolute bottom-3 start-3 bg-[var(--ink)]/80 backdrop-blur-xs text-[var(--paper)] px-2.5 py-0.5 rounded-[8px] text-[11px] font-mono tracking-tight shadow-xs">
                    /{category.slug}
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[17px] font-semibold text-[var(--ink)] leading-snug">
                        {category.name}
                      </h3>
                      <Link
                        to={`/categories/${category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title={t("admin.viewCategoryInStore")}
                        className="text-[var(--mid-gray)] hover:text-[var(--ink)] p-1 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="text-[13px] text-[var(--mid-gray)] line-clamp-2 leading-relaxed">
                      {category.description || t("admin.categoryDescPlaceholder")}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-[var(--hairline)] flex items-center justify-between gap-2">
                    <span className="text-[12px] text-[var(--mid-gray)]">
                      {productCount === 0
                        ? t("admin.emptyDiscipline")
                        : productCount === 1
                        ? t("admin.activeCatalogItemSingle")
                        : t("admin.activeCatalogItems", { count: productCount })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(category)}
                        className="h-8 px-2.5 rounded-[12px] border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--surface-alt)] text-[12px] gap-1 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>{t("admin.edit")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInitiateDelete(category)}
                        className="h-8 w-8 p-0 rounded-[12px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title={t("admin.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-3rem)] rounded-[20px] bg-[var(--paper)] border-[var(--hairline)] p-0 overflow-hidden flex flex-col">
          <form onSubmit={handleSaveCategory} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="shrink-0 p-6 pb-4 border-b border-[var(--hairline)]">
              <DialogTitle className="text-heading text-[var(--ink)]">
                {editingCategory ? t("admin.editCategory") : t("admin.addNewCategory")}
              </DialogTitle>
              <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px]">
                {editingCategory
                  ? t("admin.categoryDescPlaceholder")
                  : t("admin.categoriesSubtitle")}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 p-6 space-y-5 overflow-y-auto overscroll-contain">
              {/* Category Name */}
              <div className="space-y-1.5">
                <Label htmlFor="category-name" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.categoryName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      );
                    }
                  }}
                  placeholder={t("admin.categoryNamePlaceholder")}
                  className="rounded-[12px] bg-[var(--canvas)] border-[var(--hairline)]"
                  required
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category-slug" className="text-[13px] font-medium text-[var(--ink)]">
                    {t("admin.urlSlug")}
                  </Label>
                  <span className="text-[11px] text-[var(--mid-gray)] font-mono">
                    /categories/{slug || "slug"}
                  </span>
                </div>
                <Input
                  id="category-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={t("admin.urlSlugPlaceholder")}
                  className="rounded-[12px] font-mono text-[13px] bg-[var(--canvas)] border-[var(--hairline)]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="category-desc" className="text-[13px] font-medium text-[var(--ink)]">
                  {t("admin.categoryDesc")}
                </Label>
                <Textarea
                  id="category-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("admin.categoryDescPlaceholder")}
                  rows={3}
                  className="rounded-[12px] bg-[var(--canvas)] border-[var(--hairline)] text-[13px] resize-none"
                />
              </div>

              {/* Image Upload & Preview */}
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>{t("admin.visualBanner")}</span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-[12px] text-red-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3 w-3" /> {t("common.delete")}
                    </button>
                  )}
                </Label>

                {/* Preview Box */}
                {imageUrl ? (
                  <div className="relative h-44 w-full rounded-[14px] overflow-hidden border border-[var(--hairline)] bg-[var(--surface-alt)]">
                    <img
                      src={imageUrl}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-[10px] text-[12px] h-8 bg-white text-black hover:bg-neutral-100"
                      >
                        {t("admin.uploadImage")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[var(--hairline)] hover:border-[var(--ink-soft)] rounded-[14px] p-6 text-center cursor-pointer transition-colors bg-[var(--canvas)] flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-alt)] flex items-center justify-center text-[var(--ink-soft)]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--ink)]">
                        {t("admin.uploadImage")}
                      </p>
                      <p className="text-[11px] text-[var(--mid-gray)]">
                        PNG, JPG, WebP
                      </p>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Direct URL input alternative */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-[var(--mid-gray)]">{t("admin.visualBanner")}</span>
                  <Input
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="rounded-[10px] text-[12px] bg-[var(--canvas)] border-[var(--hairline)] h-8"
                  />
                </div>

                {/* Visual Preset Suggestions */}
                <div className="pt-2">
                  <p className="text-[11px] text-[var(--mid-gray)] mb-2">{t("admin.curatedPresets")}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SUGGESTED_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.image);
                          if (!description) setDescription(preset.desc);
                        }}
                        className={`relative rounded-[10px] overflow-hidden h-14 border transition-all cursor-pointer ${
                          imageUrl === preset.image
                            ? "border-[var(--ink)] ring-2 ring-[var(--ink)]/20"
                            : "border-[var(--hairline)] opacity-70 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.image}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        {imageUrl === preset.image && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 p-4 sm:p-6 border-t border-[var(--hairline)] bg-[var(--canvas)] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="rounded-[14px] border-[var(--hairline)] cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="rounded-[14px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 cursor-pointer"
              >
                {editingCategory ? t("admin.saveCategory") : t("admin.createCategory")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminDeleteConfirmationDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteModal({
              isOpen: false,
              category: null,
              step: 1,
              affectedProducts: [],
            });
          }
        }}
        title={
          deleteModal.step === 2
            ? t("admin.deleteStep2Title")
            : t("admin.deleteCategoryTitle")
        }
        description={
          deleteModal.category
            ? deleteModal.step === 2
              ? t("admin.deleteStep2Warning")
              : deleteModal.affectedProducts.length === 0
                ? t("admin.deleteCategoryWarningSafe", { name: deleteModal.category.name })
                : t("admin.deleteCategoryWarningWithProducts", {
                    name: deleteModal.category.name,
                    count: deleteModal.affectedProducts.length,
                  })
            : ""
        }
        cancelLabel={
          deleteModal.step === 2 && deleteModal.affectedProducts.length > 0
            ? t("common.back")
            : t("common.cancel")
        }
        confirmLabel={
          deleteModal.affectedProducts.length > 0 && deleteModal.step === 1
            ? t("admin.continueStep")
            : deleteModal.step === 2
              ? t("admin.confirmDeleteCategory")
              : t("admin.delete")
        }
        onCancel={() => {
          if (deleteModal.step === 2 && deleteModal.affectedProducts.length > 0) {
            setDeleteModal((prev) => ({ ...prev, step: 1 }));
          } else {
            setDeleteModal({
              isOpen: false,
              category: null,
              step: 1,
              affectedProducts: [],
            });
          }
        }}
        onConfirm={
          deleteModal.affectedProducts.length > 0 && deleteModal.step === 1
            ? handleFirstStepConfirm
            : executeDeletion
        }
      >
        {deleteModal.step === 2 && deleteModal.affectedProducts.length > 0 && (
          <div className="mt-4 max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-[12px] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[12px] text-start">
            {deleteModal.affectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 text-[var(--ink)] py-0.5"
              >
                <span className="min-w-0 break-words font-medium">{product.name}</span>
                <span className="font-mono text-[var(--mid-gray)] shrink-0">
                  {formatPrice(product.price)}
                </span>
              </div>
            ))}
          </div>
        )}
      </AdminDeleteConfirmationDialog>
    </div>
  );
};
