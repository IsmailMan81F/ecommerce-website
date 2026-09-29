import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShoppingBag,
  Menu,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useTheme } from "@/context/ThemeContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { lockViewportScroll } from "@/lib/scrollLock";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { products } = useStore();
  const { theme, resolvedTheme, setTheme, cycleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const isRtl = i18n.language === "ar";

  // Prevent main page scrolling and fix body height/width on viewport when mobile menu or search dialog is opened
  React.useEffect(() => {
    if (mobileMenuOpen || searchDialogOpen) {
      return lockViewportScroll();
    }
  }, [mobileMenuOpen, searchDialogOpen]);

  // Ensure keyboard opens and pushes the search bar above the keyboard every time it opens
  React.useEffect(() => {
    if (searchDialogOpen) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [searchDialogOpen]);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.categories"), path: "/categories" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
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
      <header className="sticky top-0 z-40 w-full bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--hairline)] transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo - never translate KØRD as specified */}
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
                  key={link.path}
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

          {/* Right: Language Switcher + Search + Theme Toggle + Cart Icon + Mobile Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher in Navigation: Desktop selection card / dropdown on tablet screens, hidden on mobile */}
            <div className="hidden lg:flex items-center">
              <LanguageSwitcher variant="card" />
            </div>
            <div className="hidden sm:flex lg:hidden items-center">
              <LanguageSwitcher variant="dropdown" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--ink)] hover:text-[var(--ink)] cursor-pointer"
              onClick={() => setSearchDialogOpen(true)}
              aria-label={t("common.searchCatalog")}
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            {/* Quick Theme Toggle Button: only dark and light, hidden on mobile screens */}
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              className="hidden sm:inline-flex text-[var(--ink)] hover:text-[var(--ink)] cursor-pointer"
              title={`Theme: ${resolvedTheme}. Click to toggle.`}
              aria-label={t("common.theme")}
            >
              {resolvedTheme === "dark" ? (
                <Moon className="h-[18px] w-[18px]" />
              ) : (
                <Sun className="h-[18px] w-[18px]" />
              )}
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

            {/* Mobile Nav Sheet: Side opens on left for Arabic, right for LTR with smooth slide */}
            <div className="md:hidden">
              <Sheet modal={true} open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[var(--ink)] cursor-pointer"
                    aria-label={t("nav.menu")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side={isRtl ? "left" : "right"}
                  className="w-[300px] sm:w-[340px] flex flex-col justify-between p-6 duration-300 ease-out"
                >
                  <div>
                    {/* Brand header in drawer: keep on the left for all screen sizes including Arabic mobile */}
                    <div dir="ltr" className="text-left">
                      <SheetHeader className="text-left mb-6">
                        <SheetTitle className="text-lg font-semibold tracking-tight text-left">
                          <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-left font-semibold text-[var(--ink)] select-none"
                          >
                            KØRD
                          </Link>
                        </SheetTitle>
                      </SheetHeader>
                    </div>
                    <nav className="flex flex-col gap-4 mt-6">
                      {navLinks.map((link) => {
                        const isActive =
                          link.path === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(link.path);
                        return (
                          <Link
                            key={link.path}
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

                  <div className="pt-6 border-t border-[var(--hairline)] space-y-4">
                    {/* Language selector in mobile drawer */}
                    <div className="space-y-1.5">
                      <p className="text-[12px] font-medium text-[var(--mid-gray)]">
                        {t("common.language")}
                      </p>
                      <LanguageSwitcher variant="card" className="w-full justify-between" />
                    </div>

                    {/* Theme selector in mobile drawer: only light and dark, no system option */}
                    <div className="space-y-1.5">
                      <p className="text-[12px] font-medium text-[var(--mid-gray)]">
                        {t("common.theme")}
                      </p>
                      <div className="grid grid-cols-2 gap-1 bg-[var(--surface-alt)] p-1 rounded-[14px] border border-[var(--hairline)]">
                        <button
                          type="button"
                          onClick={() => setTheme("light")}
                          className={`py-1.5 px-2 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            resolvedTheme === "light"
                              ? "bg-[var(--paper)] text-[var(--ink)] shadow-2xs font-semibold"
                              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                          }`}
                        >
                          <Sun className="h-3.5 w-3.5" />
                          <span>{t("common.light")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("dark")}
                          className={`py-1.5 px-2 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            resolvedTheme === "dark"
                              ? "bg-[var(--paper)] text-[var(--ink)] shadow-2xs font-semibold"
                              : "text-[var(--mid-gray)] hover:text-[var(--ink)]"
                          }`}
                        >
                          <Moon className="h-3.5 w-3.5" />
                          <span>{t("common.dark")}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-caption text-[var(--mid-gray)] mb-1">
                        {t("footer.clientSupport")}
                      </p>
                      <p className="text-body text-[var(--ink)]">studio@kord-objects.com</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Global Quick Search Dialog */}
      <Dialog modal={true} open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[540px] p-6">
          <DialogHeader>
            <DialogTitle className="text-heading-sm">
              {t("common.searchCatalog")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="mt-2 space-y-4">
            <div className="relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mid-gray)]" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder={t("common.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-11 pe-4 h-12 text-[15px]"
                autoFocus
              />
            </div>

            {filteredPreview.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-caption text-[var(--mid-gray)]">
                  {t("common.quickMatches")}
                </p>
                <div className="divide-y divide-[var(--hairline)] border border-[var(--hairline)] rounded-[18px] overflow-hidden bg-[var(--surface-alt)]">
                  {filteredPreview.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSearchDialogOpen(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-[var(--paper)] transition-colors text-start cursor-pointer"
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
                {t("common.pressEnterToView")}
              </span>
              <Button type="submit" size="sm" className="gap-1.5 cursor-pointer">
                <span>{t("common.viewResults")}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
