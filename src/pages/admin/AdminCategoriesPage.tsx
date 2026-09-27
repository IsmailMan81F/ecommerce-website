import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
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
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
  Package,
} from "lucide-react";

const SUGGESTED_PRESETS = [
  {
    name: "Architectural Audio",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80",
    desc: "Acoustic hardware and analog precision playback instruments.",
  },
  {
    name: "Ceramic Stoneware",
    image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80",
    desc: "Handcrafted mineral pottery and tactile sculptural vessels.",
  },
  {
    name: "Vegetable-Tanned Leather",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
    desc: "Architectural leather accessories and bespoke daily folios.",
  },
  {
    name: "Hardwood Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
    desc: "Sculptural seating, monolithic tables, and balanced woodwork.",
  },
];

interface DeleteModalState {
  isOpen: boolean;
  category: Category | null;
  step: 1 | 2;
  affectedProducts: Product[];
}

export const AdminCategoriesPage: React.FC = () => {
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
      toast.error("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        toast.success("Category image uploaded successfully");
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Save Category (Create or Edit)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
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
      toast.success("Category Updated", {
        description: `"${trimmedName}" changes have been saved.`,
      });
    } else {
      addCategory({
        name: trimmedName,
        slug: slug.trim() || undefined,
        description: finalDescription,
        image: finalImage,
      });
      toast.success("Category Created", {
        description: `"${trimmedName}" is now active in your catalog.`,
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
      // No items belong to this category, single confirmation is sufficient!
      executeDeletion();
    } else {
      // Items belong to this category, advance to step 2 with critical alert
      setDeleteModal((prev) => ({ ...prev, step: 2 }));
    }
  };

  // Perform actual category & cascaded products deletion
  const executeDeletion = () => {
    if (!deleteModal.category) return;
    const cat = deleteModal.category;
    const result = deleteCategory(cat.id);

    if (result.deletedProductsCount > 0) {
      toast.success("Category and Products Deleted", {
        description: `"${cat.name}" and ${result.deletedProductsCount} ${
          result.deletedProductsCount === 1 ? "product" : "products"
        } were removed from the catalog.`,
      });
    } else {
      toast.success("Category Deleted", {
        description: `"${cat.name}" was removed.`,
      });
    }

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
            <h1 className="text-heading text-[var(--ink)]">Categories</h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-[12px] bg-[var(--surface-alt)] border border-[var(--hairline)] text-[var(--mid-gray)]">
              {categories.length} {categories.length === 1 ? "discipline" : "disciplines"}
            </span>
          </div>
          <p className="text-body text-[var(--mid-gray)] text-[14px] mt-0.5">
            Organize catalog disciplines, configure hero visuals, and manage departmental taxonomies.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5 gap-2 transition-all shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Filter and Overview Bar */}
      <Card className="rounded-[18px] border-[var(--hairline)] bg-[var(--paper)] shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter categories by name, slug, or description..."
                className="pl-9.5 pr-8 rounded-[12px] bg-[var(--canvas)] border-[var(--hairline)] text-[14px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mid-gray)] hover:text-[var(--ink)]"
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
                  Showing <strong className="text-[var(--ink)]">{filteredCategories.length}</strong> of{" "}
                  {categories.length}
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--hairline)] hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-[var(--ink-soft)]" />
                <span>
                  <strong className="text-[var(--ink)]">{products.length}</strong> Total Objects
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
                {searchQuery ? "No matching categories" : "No categories yet"}
              </p>
              <p className="text-[14px] text-[var(--mid-gray)] mt-1">
                {searchQuery
                  ? `No categories match "${searchQuery}". Clear your search or add a new category.`
                  : "Create your first category to organize your catalog products."}
              </p>
            </div>
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-[14px] border-[var(--hairline)]"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="rounded-[14px] bg-[var(--ink-soft)] text-[var(--paper)]"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Category
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
                      <span className="text-[12px]">No image assigned</span>
                    </div>
                  )}

                  {/* Product Count Pill */}
                  <div className="absolute top-3 right-3 bg-[var(--paper)]/90 backdrop-blur-xs px-2.5 py-1 rounded-[12px] border border-[var(--hairline)] text-[12px] font-medium text-[var(--ink)] shadow-xs flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        productCount > 0 ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                      }`}
                    />
                    <span>
                      {productCount} {productCount === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  {/* Slug Pill */}
                  <div className="absolute bottom-3 left-3 bg-[var(--ink)]/80 backdrop-blur-xs text-[var(--paper)] px-2.5 py-0.5 rounded-[8px] text-[11px] font-mono tracking-tight shadow-xs">
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
                        title="View category page in live store"
                        className="text-[var(--mid-gray)] hover:text-[var(--ink)] p-1 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="text-[13px] text-[var(--mid-gray)] line-clamp-2 leading-relaxed">
                      {category.description || "No description provided."}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-[var(--hairline)] flex items-center justify-between gap-2">
                    <span className="text-[12px] text-[var(--mid-gray)]">
                      {productCount === 0
                        ? "Empty discipline"
                        : `${productCount} active ${productCount === 1 ? "catalog item" : "catalog items"}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(category)}
                        className="h-8 px-2.5 rounded-[12px] border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--surface-alt)] text-[12px] gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInitiateDelete(category)}
                        className="h-8 w-8 p-0 rounded-[12px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete category"
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
        <DialogContent className="max-w-xl rounded-[20px] bg-[var(--paper)] border-[var(--hairline)] p-0 overflow-hidden">
          <form onSubmit={handleSaveCategory}>
            <DialogHeader className="p-6 pb-4 border-b border-[var(--hairline)]">
              <DialogTitle className="text-heading text-[var(--ink)]">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription className="text-body text-[var(--mid-gray)] text-[13px]">
                {editingCategory
                  ? "Update category naming, description, and visual representation."
                  : "Create a new discipline for organizing atelier objects."}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Category Name */}
              <div className="space-y-1.5">
                <Label htmlFor="category-name" className="text-[13px] font-medium text-[var(--ink)]">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory && !slug) {
                      // auto suggest slug
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Studio Audio, Tactile Homeware"
                  className="rounded-[12px] bg-[var(--canvas)] border-[var(--hairline)]"
                  required
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category-slug" className="text-[13px] font-medium text-[var(--ink)]">
                    URL Slug
                  </Label>
                  <span className="text-[11px] text-[var(--mid-gray)]">
                    Used in web URL: /categories/{slug || "category-slug"}
                  </span>
                </div>
                <Input
                  id="category-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. studio-audio"
                  className="rounded-[12px] font-mono text-[13px] bg-[var(--canvas)] border-[var(--hairline)]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="category-desc" className="text-[13px] font-medium text-[var(--ink)]">
                  Description
                </Label>
                <Textarea
                  id="category-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short editorial summary of the aesthetic and material philosophy of this category..."
                  rows={3}
                  className="rounded-[12px] bg-[var(--canvas)] border-[var(--hairline)] text-[13px] resize-none"
                />
              </div>

              {/* Image Upload & Preview */}
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[var(--ink)] flex items-center justify-between">
                  <span>Category Image</span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-[12px] text-red-500 hover:underline inline-flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Remove image
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
                        Change Photo
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
                        Click to upload an image file
                      </p>
                      <p className="text-[11px] text-[var(--mid-gray)]">
                        Supports PNG, JPG, or WebP. Stored locally.
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
                  <span className="text-[11px] text-[var(--mid-gray)]">Or paste an image web link:</span>
                  <Input
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="rounded-[10px] text-[12px] bg-[var(--canvas)] border-[var(--hairline)] h-8"
                  />
                </div>

                {/* Visual Preset Suggestions */}
                <div className="pt-2">
                  <p className="text-[11px] text-[var(--mid-gray)] mb-2">Or select a curated mood visual:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SUGGESTED_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.image);
                          if (!description) setDescription(preset.desc);
                        }}
                        className={`relative rounded-[10px] overflow-hidden h-14 border transition-all ${
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

            <DialogFooter className="p-4 sm:p-6 border-t border-[var(--hairline)] bg-[var(--canvas)] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="rounded-[14px] border-[var(--hairline)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="rounded-[14px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] px-5"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG (DOUBLE CONFIRMATION FLOW) */}
      {/* ========================================================================= */}
      <Dialog
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
      >
        <DialogContent className="max-w-md rounded-[20px] bg-[var(--paper)] border-[var(--hairline)] p-6">
          {deleteModal.category && (
            <>
              {/* If Category Has No Items -> Single Confirmation */}
              {deleteModal.affectedProducts.length === 0 ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                    <Trash2 className="h-6 w-6" />
                  </div>

                  <div className="space-y-2">
                    <DialogTitle className="text-[18px] font-semibold text-[var(--ink)]">
                      Delete Category?
                    </DialogTitle>
                    <DialogDescription className="text-[14px] text-[var(--mid-gray)] leading-relaxed">
                      Are you sure you want to delete{" "}
                      <strong className="text-[var(--ink)]">{deleteModal.category.name}</strong>?
                      <br />
                      <span className="text-emerald-600 dark:text-emerald-400 text-[13px] block mt-1">
                        ✓ No products currently belong to this category.
                      </span>
                    </DialogDescription>
                  </div>

                  <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setDeleteModal({
                          isOpen: false,
                          category: null,
                          step: 1,
                          affectedProducts: [],
                        })
                      }
                      className="rounded-[14px] border-[var(--hairline)]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={executeDeletion}
                      className="rounded-[14px] bg-red-600 hover:bg-red-700 text-white gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Category
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                /* Category Has Items -> 2-Step Confirmation Flow */
                <>
                  {deleteModal.step === 1 ? (
                    /* STEP 1: First Confirmation */
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6" />
                      </div>

                      <div className="space-y-2">
                        <DialogTitle className="text-[18px] font-semibold text-[var(--ink)]">
                          Delete Category &quot;{deleteModal.category.name}&quot;?
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-[var(--mid-gray)] leading-relaxed">
                          Do you really want to delete this category?
                          <span className="block mt-2 font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-[10px] border border-amber-200 dark:border-amber-900/50">
                            Notice: This discipline has active products linked to it in the catalog.
                          </span>
                        </DialogDescription>
                      </div>

                      <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: false,
                              category: null,
                              step: 1,
                              affectedProducts: [],
                            })
                          }
                          className="rounded-[14px] border-[var(--hairline)]"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleFirstStepConfirm}
                          className="rounded-[14px] bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Continue to Confirmation
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    /* STEP 2: Critical Second Confirmation & Cascaded Deletion Alert */
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center animate-pulse">
                        <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                      </div>

                      <div className="space-y-2">
                        <DialogTitle className="text-[18px] font-semibold text-red-600">
                          Critical Alert: {deleteModal.affectedProducts.length}{" "}
                          {deleteModal.affectedProducts.length === 1 ? "Item" : "Items"} Will Be Deleted!
                        </DialogTitle>
                        <p className="text-[13px] text-[var(--mid-gray)] leading-relaxed">
                          Deleting the category{" "}
                          <strong className="text-[var(--ink)]">{deleteModal.category.name}</strong> will{" "}
                          <strong className="text-red-600">permanently delete all ({deleteModal.affectedProducts.length}) catalog items</strong>{" "}
                          belonging to this category:
                        </p>
                      </div>

                      {/* Affected Products List Preview */}
                      <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-[12px] bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-[12px]">
                        {deleteModal.affectedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-[var(--ink)] py-0.5"
                          >
                            <span className="font-medium truncate mr-2">• {p.name}</span>
                            <span className="font-mono text-[var(--mid-gray)] shrink-0">
                              {p.price} DZD
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">
                        This action cannot be undone. All affected inventory, images, and catalog entries will be removed.
                      </p>

                      <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDeleteModal((prev) => ({ ...prev, step: 1 }))}
                          className="rounded-[14px] border-[var(--hairline)]"
                        >
                          Go Back
                        </Button>
                        <Button
                          type="button"
                          onClick={executeDeletion}
                          className="rounded-[14px] bg-red-600 hover:bg-red-700 text-white font-medium shadow-xs"
                        >
                          Delete Category &amp; {deleteModal.affectedProducts.length} Items
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
