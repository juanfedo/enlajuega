import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATALOG, CATALOG_UPDATED, type Game } from "./data/catalog";
import { SITE } from "./data/site";
import { cachedCatalog, fetchCatalog } from "./lib/sheet";
import { storage } from "./lib/utils";

type Store = {
  catalog: Game[];
  /** Fecha (AAAA-MM-DD) de la última actualización del catálogo. */
  updated: string;
  games: Map<string, Game>;
  items: Record<string, number>;
  count: number;
  total: number;
  qty: (id: string) => number;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  product: Game | null;
  openProduct: (id: string | null) => void;
  bookingId: string | null;
  openBooking: (id: string | null) => void;
};

const Ctx = createContext<Store | null>(null);

const toMap = (list: Game[]) => new Map(list.map((g) => [g.id, g]));

// Quita del carrito lo que ya no existe o está agotado y ajusta cantidades al stock.
function sanitize(cart: Record<string, number>, games: Map<string, Game>) {
  const clean: Record<string, number> = {};
  for (const [id, q] of Object.entries(cart)) {
    const g = games.get(id);
    if (g && g.stock > 0 && q > 0) clean[id] = Math.min(q, g.stock);
  }
  return clean;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Arranca con la última copia descargada de la hoja (o el catálogo incluido en el sitio)
  // y se actualiza en cuanto llega la versión fresca.
  const [initial] = useState(cachedCatalog);
  const [catalog, setCatalog] = useState<Game[]>(initial?.games ?? CATALOG);
  const [updated, setUpdated] = useState(initial?.updated ?? CATALOG_UPDATED);
  const games = useMemo(() => toMap(catalog), [catalog]);
  const [items, setItems] = useState(() => sanitize(storage.get("elj-cart", {}), games));
  const [cartOpen, setCartOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => storage.set("elj-cart", items), [items]);

  useEffect(() => {
    if (!SITE.catalogSheetUrl) return;
    let alive = true;
    fetchCatalog(SITE.catalogSheetUrl)
      .then(({ games: next, updated }) => {
        if (!alive) return;
        setCatalog(next);
        setUpdated(updated ?? CATALOG_UPDATED);
        setItems((prev) => sanitize(prev, toMap(next)));
      })
      .catch((err) => console.warn("[catálogo] No se pudo leer la hoja, se usa la copia local.", err));
    return () => {
      alive = false;
    };
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      const g = games.get(id);
      if (!g) return;
      setItems((prev) => {
        const next = { ...prev };
        const q = Math.max(0, Math.min(qty, g.stock));
        if (q === 0) delete next[id];
        else next[id] = q;
        return next;
      });
    },
    [games],
  );

  const value = useMemo<Store>(() => {
    const entries = Object.entries(items).filter(([id]) => games.has(id));
    return {
      catalog,
      updated,
      games,
      items,
      count: entries.reduce((a, [, q]) => a + q, 0),
      total: entries.reduce((a, [id, q]) => a + games.get(id)!.price * q, 0),
      qty: (id) => items[id] ?? 0,
      setQty,
      clear: () => setItems({}),
      cartOpen,
      setCartOpen,
      product: productId ? games.get(productId) ?? null : null,
      openProduct: setProductId,
      bookingId,
      openBooking: setBookingId,
    };
  }, [catalog, updated, games, items, setQty, cartOpen, productId, bookingId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore fuera de StoreProvider");
  return s;
}
