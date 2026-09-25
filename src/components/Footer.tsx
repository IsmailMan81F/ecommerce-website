import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--surface-alt)] border-t border-[var(--hairline)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link
              to="/"
              className="text-[20px] font-semibold tracking-[-0.04em] text-[var(--ink)] block"
            >
              KØRD
            </Link>
            <p className="text-body text-[var(--mid-gray)] text-[13px] leading-relaxed">
              Quiet material presence. Objects engineered for spatial harmony, analog purity, and enduring tactile longevity.
            </p>
            <p className="text-caption text-[var(--mid-gray)]">
              Atelier batch release 2026
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <p className="text-caption text-[var(--ink)] font-semibold">Storefront</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Home Catalog
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/categories/studio-audio" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Studio Audio
                </Link>
              </li>
              <li>
                <Link to="/categories/ceramics-objects" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Ceramics & Stoneware
                </Link>
              </li>
              <li>
                <Link to="/categories/minimalist-furniture" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Minimalist Furniture
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio & Craft */}
          <div className="space-y-3">
            <p className="text-caption text-[var(--ink)] font-semibold">Studio</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Design Constitution
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Concierge & Inquiries
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <span className="text-body text-[var(--mid-gray)]">
                  74 Bleeker St, New York
                </span>
              </li>
            </ul>
          </div>

          {/* Dispatch & Social Links */}
          <div className="space-y-3">
            <p className="text-caption text-[var(--ink)] font-semibold">Dispatch</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
                >
                  <span>Journal Archive</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://are.na"
                  target="_blank"
                  rel="noreferrer"
                  className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
                >
                  <span>Research Library</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://threads.net"
                  target="_blank"
                  rel="noreferrer"
                  className="text-body text-[var(--mid-gray)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
                >
                  <span>Audio Editions</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-16 pt-8 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-[var(--mid-gray)]">
          <p>© 2026 KØRD Design Atelier Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-[var(--ink)] transition-colors">
              Privacy Standard
            </Link>
            <Link to="/about" className="hover:text-[var(--ink)] transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-[var(--ink)] transition-colors">
              Client Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
