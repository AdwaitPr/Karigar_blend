# AGENTS.md — Kārigar Engineering & Architectural Guidelines

This document contains canonical rules for engineers and AI agents working on the **Kārigar** marketplace codebase. All code modifications and future implementations MUST strictly comply with these guidelines.

---

## 1. Architecture & Framework Directives

- **Current Architecture**: The application is currently structured as a client-side Vite + React 19 + Tailwind CSS v4 single-page editorial prototype.
- **Migration Policy**: Immediate full migration to Next.js App Router is **deferred** in this wave to preserve interactive animation performance (`useScrollProgress`, CSS scroll-linked hero transformations, hash-route overlays) without risking destabilization.
- **Server / Client Boundaries**:
  - Pure data schemas, domain entities (`src/types/catalog.ts`), utility formatters (`src/lib/media.ts`), routing parsers (`src/lib/routes.ts`), and static catalog records (`src/data/catalog.ts`) MUST remain client-agnostic and side-effect free so they can run unchanged on server contexts in Next.js.
  - Interactive UI components using React state, event listeners, DOM measurements (`scroll`, `resize`, `IntersectionObserver`), or browser APIs (`localStorage`, `window.location.hash`) MUST be explicitly isolated as Client Boundary components in future SSR builds.
- **Data Layer Contracts**:
  - The `ContentSource` discriminator (`"demo"` vs `"verified"`) MUST be present on all catalog records (`Product`, `Artisan`, `Craft`, `JournalEntry`).
  - Never present artificial stock photography or art-directed demo text as verified artisan facts.

---

## 2. Directory Responsibilities

```text
src/
├── components/          # Visual layout modules & page sections
│   ├── overlays/        # Interactive sheets, modal dialogs, and slide-out drawers
│   └── ui/              # Reusable design system primitives (EditorialImage, Primitives, Sheet)
├── context/             # Global React state (e.g. BagContext for shopping cart)
├── data/                # Catalog records & static content models
├── hooks/               # Custom hooks for scroll, hash routing, media queries & in-view detection
├── lib/                 # Core domain utilities (search calculations, media resolution, formatting)
└── types/               # TypeScript domain contracts and interface declarations
```

---

## 3. Domain Terminology

Maintain consistent naming across code, comments, and schemas:
- **Kārigar (कारीगर)**: Indian artisan or master craftsperson.
- **Object**: A physical craft item or product (preferred over generic "Item" or "SKU").
- **Bag**: The shopping cart / selection drawer (referred to as "Bag", not "Cart").
- **Object Sheet**: The deep-linkable product detail view (`#object/[id]`).
- **Atlas**: The regional craft index mapping crafts across geographical coordinates.
- **Craft**: The specific traditional technique, medium, or lineage (e.g. Banarasi brocade, Kutch embroidery).
- **Provenance**: The traced origin, master artisan, village, material filaments, and time on loom.

---

## 4. Design System & Styling Rules

- **Palette**: Use warm paper and ink neutrals (`--color-paper` `#F3EFE7`, `--color-ink` `#151412`, `--color-bone` `#E9E3D8`). Material color accents (`--color-madder`, `--color-indigo`, `--color-turmeric`) MUST be drawn from Indian textiles and natural dyes, used sparingly.
- **Typography**: Display serif (`Instrument Serif`), body sans (`Inter`), and optional Devanagari display (`Tiro Devanagari Hindi`).
- **Borders & Radii**: Sharp square geometry (`--radius-none: 0px`). Hairline dividers (`1px border-ink/10` or `border-paper/15`). Avoid rounded card corners or floating soft shadows.

---

## 5. Image & Photography Rules

- **Image Abstraction**: All imagery MUST render through the `EditorialImage` primitive component (`src/components/ui/EditorialImage.tsx`).
- **Aspect Ratios & Crop**: Image cropping MUST utilize the `position` property (`object-position` CSS) rather than cropping source assets destructively.
- **Responsive Serving**: Remote assets (CDN / Pexels) MUST use `imageSrc` and `imageSrcSet` helpers with explicit width parameters.
- **LCP & Performance**:
  - Eager load primary above-the-fold hero imagery (`priority={true}`).
  - Lazy load all below-the-fold images (`loading="lazy"`, `decoding="async"`).

---

## 6. Accessibility & Motion Rules

- **Reduced Motion**:
  - All scroll-linked transitions, CSS clip-path reveals, line masks, and entrance animations MUST strictly check `prefers-reduced-motion`.
  - CSS rule `@media (prefers-reduced-motion: reduce)` is defined in `index.css` to disable transitions, delays, and transforms globally.
- **Keyboard Navigation**:
  - Global omni-search MUST respond to `/`.
  - Modal sheets and drawers MUST dismiss on `Escape`.
  - Provide a visible skip link (`#intro`).
- **A11y Semantics**:
  - Decorative hover alternate images MUST be hidden from screen readers (`decorative={true}` / `alt=""`).
  - Interactive triggers must carry descriptive `aria-label` attributes (e.g., dynamic bag count, object action status).

---

## 7. Prohibited Generic E-Commerce Patterns

Do **NOT** implement the following generic e-commerce tropes:
- Pop-ups or modal newsletters offering discount codes.
- Countdown urgency timers ("Only 2 hours left!").
- Artificial scarcity badges ("5 people looking at this now!").
- Aggressive discount strikethrough badges (`₹12,000` ~~`₹18,000`~~ `30% OFF`).
- Flashy neon sale tags or star rating stars.

---

## 8. Testing & Verification Commands

Run the following commands before committing any work:
```bash
# Typecheck TypeScript definitions
npm run typecheck

# Execute production build
npm run build

# Preview production build locally
npm run preview
```

---

## 9. Future Jules-Agent Boundaries

When extending this repository in subsequent tasks:
- **Do NOT implement**: Backend databases, live OAuth/Auth systems, payment gateways, GST calculation engines, seller dashboards, CMS backends, or automated shipping integrations until explicitly tasked.
- **Always preserve**: Existing visual composition, typography tokens, image abstractions, and demo data contracts.
