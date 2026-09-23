import { useCallback, useEffect, useState } from "react";
import { BagProvider } from "./context/BagContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { EditorialIntro } from "./components/EditorialIntro";
import { CraftAtlas } from "./components/CraftAtlas";
import { CraftStory } from "./components/CraftStory";
import { ProductGrid } from "./components/ProductGrid";
import { ArtisanStory } from "./components/ArtisanStory";
import { MaterialMoment } from "./components/MaterialMoment";
import { JournalGrid } from "./components/JournalGrid";
import { ClosingStatement } from "./components/ClosingStatement";
import { Footer } from "./components/Footer";
import { Cursor } from "./components/Cursor";
import { SearchDialog } from "./components/overlays/SearchDialog";
import { BagDrawer } from "./components/overlays/BagDrawer";
import { MobileMenu } from "./components/overlays/MobileMenu";
import { ObjectSheet } from "./components/overlays/ObjectSheet";
import { useHashRoute } from "./hooks/useHashRoute";

/**
 * Kārigar — landing page. Design prototype / interaction specification.
 *
 * This Vite app is the visual foundation, not the production architecture.
 * Objects open as `#object/[id]` so the PDP language can be locked before
 * the App Router, catalogue index, and marketplace checkout exist.
 *
 * Narrative:
 *   hero → intro (slides over the hero) → atlas → featured story (pinned)
 *   → objects → maker → material → journal → closing → colophon.
 */
export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { route, closeObject } = useHashRoute();
  const objectId = route.type === "object" ? route.id : null;

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // "/" opens search, as on most reading-first sites.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <BagProvider>
      <a href="#intro" className="skip-link caps">
        Skip to content
      </a>

      <Navbar onSearch={openSearch} onMenu={openMenu} />

      <div className="overflow-x-clip">
        <main id="main">
          {/* The intro is a page that slides over the sticky hero */}
          <div className="relative">
            <Hero />
            <EditorialIntro />
          </div>
          <CraftAtlas />
          <CraftStory />
          <ProductGrid />
          <ArtisanStory />
          <MaterialMoment />
          <JournalGrid />
          <ClosingStatement />
        </main>
        <Footer />
      </div>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
      <BagDrawer />
      <MobileMenu open={menuOpen} onClose={closeMenu} onSearch={openSearch} />
      <ObjectSheet id={objectId} onClose={closeObject} />
      <Cursor />
    </BagProvider>
  );
}
