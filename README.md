# KORD E-commerce Website

A React + TypeScript storefront with a small admin console. This README is a codebase map: use it to find routes, page content, reusable components, shared state, and the files to edit for common changes.

## Start Here

- [src/main.tsx](src/main.tsx) is the browser entry point. It loads global styles and scroll restoration, then renders the app inside React `StrictMode`.
- [src/App.tsx](src/App.tsx) creates the router, installs the providers, and declares every route and shared layout.
- [src/pages/](src/pages/) contains route-level screens. Most page-specific sections are written directly in their page component.
- [src/components/](src/components/) contains reusable storefront, admin, and UI components.
- [src/context/](src/context/) contains app-wide state providers and their hooks.
- [src/lib/data.ts](src/lib/data.ts) contains the initial sample catalog, category data, orders, and hero image reference.

## How the App Fits Together

```text
index.html
  -> src/main.tsx
      -> src/App.tsx
          -> BrowserRouter
          -> ThemeProvider
          -> StoreProvider
          -> AuthProvider
          -> CartProvider
          -> Storefront routes (StorefrontLayout: Navbar + page + Footer)
          -> Admin routes (/admin: AdminGate + AdminLayout + admin page)
```

The provider order matters when adding a provider: children can use contexts provided above them. `App` also mounts route scroll-to-top behavior and a global Sonner toaster.

## Routes and Pages

Routes are declared in [src/App.tsx](src/App.tsx). The storefront routes render inside `StorefrontLayout`, which supplies the public navigation bar and footer. Admin routes use a separate layout and do not show the storefront header/footer.

| URL | Page | What it contains |
| --- | --- | --- |
| `/` | [HomePage](src/pages/HomePage.tsx) | Hero, category carousel, best-selling products, editorial/craftsmanship callout. These sections are composed in this file, not split into separate section files. |
| `/categories` | [CategoriesPage](src/pages/CategoriesPage.tsx) | Full catalog, category navigation, filters, sorting, and product grid. |
| `/categories/:slug` | [CategoriesPage](src/pages/CategoriesPage.tsx) | Same catalog screen filtered to the category whose slug is in the URL. |
| `/product/:slug` | [ProductDetailPage](src/pages/ProductDetailPage.tsx) | Product gallery/zoom, options, quantity, add-to-cart action, details, and related products. |
| `/cart` | [CartPage](src/pages/CartPage.tsx) | Cart review and multi-step checkout/order confirmation. |
| `/search` | [SearchPage](src/pages/SearchPage.tsx) | Search results; the navbar sends the search text as the `q` query parameter. |
| `/about` | [AboutPage](src/pages/AboutPage.tsx) | Store/about content. |
| `/contact` | [ContactPage](src/pages/ContactPage.tsx) | Contact content. |
| `/privacy` and `/policies` | [PrivacyPage](src/pages/PrivacyPage.tsx) | Privacy/policy content; both paths render the same page. |
| `/terms` | [TermsPage](src/pages/TermsPage.tsx) | Terms content. |
| `/404` and any unmatched path | [NotFoundPage](src/pages/NotFoundPage.tsx) | Not-found screen. |
| `/admin` | [AdminDashboardPage](src/pages/admin/AdminDashboardPage.tsx) | Admin dashboard, rendered after the login gate. |
| `/admin/orders` | [AdminOrdersPage](src/pages/admin/AdminOrdersPage.tsx) | Order management screen. |
| `/admin/products` | [AdminProductsPage](src/pages/admin/AdminProductsPage.tsx) | Product management screen. |

### Admin Route Flow

`/admin` is a parent route in `App.tsx`. [AdminGate](src/components/admin/AdminGate.tsx) checks `useAuth()`:

1. If not authenticated, it renders [AdminLogin](src/components/admin/AdminLogin.tsx).
2. If authenticated, it renders [AdminLayout](src/components/admin/AdminLayout.tsx).
3. `AdminLayout` provides the console sidebar/header and an `<Outlet />`; the nested URL selects the dashboard, orders, or products page.

Admin settings are opened from the layout and implemented in [AdminSettingsDialog](src/components/admin/AdminSettingsDialog.tsx).

## Folder Map

### Root

- `index.html`: Vite's HTML document and React mount element.
- `package.json`: dependencies and scripts (`npm run dev`, `npm run build`, `npm run lint`, `npm run preview`).
- `vite.config.ts`: Vite plugins and the `@` alias pointing to `src/`.
- `tsconfig.json`: TypeScript configuration.
- `components.json`: shadcn/ui configuration.
- `vercel.json`: Vercel deployment configuration.
- `metadata.json`: project metadata.

### `src/`

- `App.tsx`: route tree, layouts, provider composition, scroll-to-top, and toaster.
- `main.tsx`: app bootstrap and global stylesheet import.
- `index.css`: Tailwind import, theme/design tokens, and global styles.
- `assets/images/`: local image assets used by the catalog and page layouts.
- `components/`: shared visual building blocks (see below).
- `context/`: global state providers/hooks (see Contexts below).
- `lib/`: seed data, general utilities, and scroll restoration.
- `pages/`: storefront route screens.
- `pages/admin/`: admin route screens.
- `types/index.ts`: shared TypeScript data contracts such as `Product`, `Category`, `CartItem`, and `Order`.

## Components and Where They Are Used

### Storefront components (`src/components/`)

- [Navbar](src/components/Navbar.tsx): public navigation, category/about/contact links, search dialog, cart count, theme control, and mobile navigation. It is mounted by `StorefrontLayout` in `App.tsx`.
- [Footer](src/components/Footer.tsx): public-site footer, also mounted by `StorefrontLayout`.
- [ProductCard](src/components/ProductCard.tsx): reusable product preview/link and quick-add button. Used in the home/catalog/product-related-product views.
- [CategoryCard](src/components/CategoryCard.tsx): category image/link card. Used by the homepage category carousel.
- [FilterBar](src/components/FilterBar.tsx): size, price, availability, sorting, and reset controls. Used by `CategoriesPage`.
- [CartItemRow](src/components/CartItemRow.tsx): one cart line with quantity, edit-options, and remove controls. Used by `CartPage`.

### Admin components (`src/components/admin/`)

- `AdminGate.tsx`: chooses login screen or authenticated admin layout.
- `AdminLogin.tsx`: admin login form.
- `AdminLayout.tsx`: console navigation, theme controls, user information, settings entry, and nested route outlet.
- `AdminSettingsDialog.tsx`: admin settings modal, including settings/actions exposed by the console.

### UI primitives (`src/components/ui/`)

Reusable low-level controls used by pages and components: buttons, cards, dialogs, dropdowns, inputs, labels, selects, separators, sheets, skeletons, switches, tables, tabs, carousels, and Sonner toaster integration. If you need a common control style, check here before building a one-off. The `switch.tsx` file in this folder is a UI primitive, not an application page or route.

## Contexts and Shared State

Contexts are created under [src/context/](src/context/). Their providers wrap the route tree in `App.tsx`; components consume them through hooks.

| Context | Hook | Owns | Persistence / usage |
| --- | --- | --- | --- |
| [StoreContext](src/context/StoreContext.tsx) | `useStore()` | Products, categories, orders; add/update/delete products, category creation, order creation/status updates, availability toggles. | Starts from constants in `lib/data.ts`; mirrors catalog and orders to `sessionStorage`. Shared by storefront and admin. |
| [CartContext](src/context/CartContext.tsx) | `useCart()` | Cart lines, quantities, subtotal/shipping/total, add/remove/clear actions. | Persists cart in `localStorage`. Used by `Navbar`, `ProductCard`, `ProductDetailPage`, `CartItemRow`, and `CartPage`. |
| [AuthContext](src/context/AuthContext.tsx) | `useAuth()` | Admin login state, username, login/logout, and credential updates. | Session state and demo credentials are stored in `sessionStorage`. Used by the admin gate, login, layout, and settings. |
| [ThemeContext](src/context/ThemeContext.tsx) | `useTheme()` | Light/dark/system preference and resolved theme. Adds/removes the `dark` class on the document root. | Persists theme preference in `localStorage`; storefront navbar and global styles use it. |
| [AdminThemeContext](src/context/AdminThemeContext.tsx) | `useAdminTheme()` | Admin-facing wrapper around theme APIs. | Currently delegates to `ThemeContext`; it does not maintain a separate theme state. |

**Important:** this project currently uses browser storage and in-file sample data, not a server/database API. The admin login is a client-side demo gate (default credentials in `AuthContext` are `admin` / `123`); it is not production-grade authentication or authorization. Do not rely on it to protect real data.

## Data, Types, and Utilities

- [src/lib/data.ts](src/lib/data.ts): initial `PRODUCTS`, `CATEGORIES`, `INITIAL_ORDERS`, and `HERO_IMAGE` data. Update this when changing the sample catalog or starter content.
- [src/types/index.ts](src/types/index.ts): canonical shapes for categories, products, product variants, cart lines, customers, orders, order status, and catalog filters.
- [src/lib/utils.ts](src/lib/utils.ts): shared utility functions such as class-name composition and price formatting.
- [src/lib/restoreScroll.ts](src/lib/restoreScroll.ts): scroll restoration behavior imported by the entry point.
- [src/assets/images/](src/assets/images/): source images imported by `lib/data.ts` and components/pages.

The storefront and admin share the same `StoreContext`, so an admin product/order change is reflected in storefront state for the current browser session. Because this state is client-side storage, it is not shared between users or devices and may reset when session storage is cleared.

## Common Changes: Where to Edit

- Add or change a URL: add a `<Route>` in [src/App.tsx](src/App.tsx), then create/update its page in `src/pages/`.
- Change the storefront header/footer: edit [Navbar.tsx](src/components/Navbar.tsx) or [Footer.tsx](src/components/Footer.tsx). The shared wrapper is `StorefrontLayout` in `App.tsx`.
- Change a homepage section: edit [HomePage.tsx](src/pages/HomePage.tsx). Reuse or add a component under `src/components/` if the section is needed in multiple places.
- Change category filtering or catalog layout: edit [CategoriesPage.tsx](src/pages/CategoriesPage.tsx); filter controls are in [FilterBar.tsx](src/components/FilterBar.tsx).
- Change product display/add-to-cart cards: edit [ProductCard.tsx](src/components/ProductCard.tsx). Change the full product page in [ProductDetailPage.tsx](src/pages/ProductDetailPage.tsx).
- Change checkout steps or order submission: edit [CartPage.tsx](src/pages/CartPage.tsx); cart state/actions belong in [CartContext.tsx](src/context/CartContext.tsx), and order creation belongs in [StoreContext.tsx](src/context/StoreContext.tsx).
- Change admin navigation or shared console chrome: edit [AdminLayout.tsx](src/components/admin/AdminLayout.tsx). Change a specific admin screen under `src/pages/admin/`.
- Change seed catalog content: edit [data.ts](src/lib/data.ts), keeping it consistent with [types/index.ts](src/types/index.ts).
- Change a shared UI primitive: edit the matching file in `src/components/ui/`.
- Change global colors, typography, or base styles: edit [src/index.css](src/index.css).

## Development

Requires Node.js and npm.

```bash
npm install
npm run dev
```

The Vite dev server is configured on port `3000`. Other useful scripts:

```bash
npm run lint    # TypeScript check (tsc --noEmit)
npm run build   # Production build
npm run preview # Serve the production build locally
```

## Dependencies at a Glance

- React 19 and TypeScript: UI and application code.
- Vite: development server and production bundling.
- React Router: client-side route matching and nested layouts.
- Tailwind CSS: utility styling and theme tokens.
- Radix UI / Base UI-based wrappers: accessible UI controls under `components/ui/`.
- `lucide-react`: icons; `sonner`: toast notifications; Embla carousel integration: carousel behavior; Motion: animation support.