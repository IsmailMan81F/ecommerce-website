import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PromotionBanner } from "@/components/PromotionBanner";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { products } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchDialogOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredPreview = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <>
      <PromotionBanner />
      <header className="sticky top-0 z-40 w-full bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--hairline)] transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-[20px] font-semibold tracking-[-0.04em] text-[var(--ink)] flex items-center gap-2 select-none hover:opacity-85 transition-opacity"
            >
              <span>KØRD</span>
            </Link>
          </div>

          {/* Center: Main Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[14px] transition-colors ${
                    isActive
                      ? "text-[var(--ink)] font-medium"
                      : "text-[var(--mid-gray)] hover:text-[var(--ink)] font-normal"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Cart Icon + Mobile Menu Trigger */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--ink)] hover:text-[var(--ink)]"
              onClick={() => setSearchDialogOpen(true)}
              aria-label="Search catalog"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            <Link to="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-[var(--ink)] px-3 rounded-[18px] gap-2 border border-transparent hover:border-[var(--hairline)]"
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                <span className="text-[13px] font-medium tabular-nums">
                  {itemCount}
                </span>
              </Button>
            </Link>

            {/* Mobile Nav Sheet */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[var(--ink)]"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] flex flex-col justify-between p-6">
                  <div>
                    <SheetHeader className="text-left mb-6">
                      <SheetTitle className="text-lg font-semibold tracking-tight">
                        KØRD
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4 mt-6">
                      {navLinks.map((link) => {
                        const isActive =
                          link.path === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(link.path);
                        return (
                          <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`text-body-lg py-2 transition-colors ${
                              isActive
                                ? "text-[var(--ink)] font-medium"
                                : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                            }`}
                          >
                            {link.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="pt-6 border-t border-[var(--hairline)]">
                    <p className="text-caption text-[var(--mid-gray)] mb-2">Direct Contact</p>
                    <p className="text-body text-[var(--ink)]">studio@kord-objects.com</p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Global Quick Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[540px] p-6">
          <DialogHeader>
            <DialogTitle className="text-heading-sm">Search Catalog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="mt-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                type="search"
                placeholder="Search audio, ceramics, furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 text-[15px]"
                autoFocus
              />
            </div>

            {filteredPreview.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-caption text-[var(--mid-gray)]">Quick Matches</p>
                <div className="divide-y divide-[var(--hairline)] border border-[var(--hairline)] rounded-[18px] overflow-hidden bg-[var(--surface-alt)]">
                  {filteredPreview.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSearchDialogOpen(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--paper)] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-[8px] bg-[var(--canvas)]"
                        />
                        <div>
                          <p className="text-body font-medium text-[var(--ink)] line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-caption text-[var(--mid-gray)]">
                            {product.categoryName}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-medium tabular-nums text-[var(--ink)]">
                        ${product.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-caption text-[var(--mid-gray)]">
                Press enter to view all results
              </span>
              <Button type="submit" size="sm" className="gap-1.5">
                <span>View Results</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
