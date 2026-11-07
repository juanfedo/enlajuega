import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Game } from "../data/catalog";
import { cx, money, normalize, waLink } from "../lib/utils";
import { useStore } from "../store";
import { Chevron, Plus, Search } from "./icons";
import { buttonClass, GameCover, Kicker, Reveal, Segmented, Stepper } from "./ui";

type Filter = "all" | "stock" | "ludo";
type Sort = "featured" | "price-asc" | "price-desc" | "name";
const PRICES = [
  { value: "all", label: "Cualquier precio", min: 0, max: Infinity },
  { value: "50", label: "Hasta $50.000", min: 0, max: 50000 },
  { value: "100", label: "$50.000 – $100.000", min: 50001, max: 100000 },
  { value: "200", label: "$100.000 – $200.000", min: 100001, max: 200000 },
  { value: "max", label: "Más de $200.000", min: 200001, max: Infinity },
];
const PAGE = 16;
const bare = (s: string) => s.replace(/^[¡¿]/, "");

export function useAddToCart() {
  const { qty, setQty, setCartOpen } = useStore();
  return (g: Game) => {
    setQty(g.id, qty(g.id) + 1);
    toast(`${g.name} agregado`, {
      description: money(g.price),
      action: { label: "Ver carrito", onClick: () => setCartOpen(true) },
    });
  };
}

export function Shop() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [price, setPrice] = useState("all");
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(query);
  const { catalog } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !document.querySelector("[data-vaul-drawer]")) {
        e.preventDefault();
        searchRef.current?.focus();
        document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setLimit(PAGE), [q, filter, sort, price]);

  const list = useMemo(() => {
    const nq = normalize(q.trim());
    const range = PRICES.find((p) => p.value === price)!;
    const out = catalog.filter(
      (g) =>
        (!nq || normalize(g.name).includes(nq)) &&
        (filter !== "stock" || g.stock > 0) &&
        (filter !== "ludo" || g.ludoteca) &&
        g.price >= range.min &&
        g.price <= range.max,
    );
    const sorters: Record<Sort, (a: Game, b: Game) => number> = {
      featured: (a, b) => Number(b.stock > 0) - Number(a.stock > 0) || Number(b.images.length > 0) - Number(a.images.length > 0),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => bare(a.name).localeCompare(bare(b.name), "es"),
    };
    return out.sort(sorters[sort]);
  }, [catalog, q, filter, sort, price]);

  const visible = list.slice(0, limit);

  return (
    <section id="tienda" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 sm:px-6 md:pt-28">
      <Reveal className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Kicker>Tienda</Kicker>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
            Encuentra tu próximo <span className="serif text-accent">juego favorito</span>
          </h2>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-2 md:justify-self-end">
          Te asesoramos para que compres lo que de verdad vas a jugar. Los marcados con{" "}
          <span className="rounded-full bg-lime px-1.5 py-0.5 text-[12px] font-medium text-lime-ink">Pruébalo</span> los puedes jugar
          primero en la Casita.
        </p>
      </Reveal>

      {/* Barra de filtros */}
      <div className="z-30 -mx-4 mb-6 bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:sticky md:top-16">
        <div className="flex flex-wrap items-center gap-2">
          <label className="group relative flex h-10 min-w-0 flex-[1_1_240px] items-center gap-2.5 rounded-full bg-surface px-3.5 shadow-card transition-shadow focus-within:shadow-[0_0_0_1px_var(--color-accent),0_0_0_4px_rgb(91_61_245/0.15)]">
            <Search className="shrink-0 text-ink-4" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar juego…"
              aria-label="Buscar juego"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-4"
            />
            <kbd className="hidden rounded-md border border-line-2 px-1.5 font-mono text-[11px] text-ink-4 [@media(pointer:fine)]:block">/</kbd>
          </label>
          <Segmented
            id="shop-filter"
            label="Filtrar"
            className="flex-[1_1_100%] sm:flex-none"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Todos" },
              { value: "stock", label: "Disponibles" },
              { value: "ludo", label: "Para probar" },
            ]}
          />
          <Select label="Precio" value={price} onChange={setPrice} options={PRICES.map(({ value, label }) => ({ value, label }))} />
          <Select
            label="Ordenar"
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            options={[
              { value: "featured", label: "Destacados" },
              { value: "price-asc", label: "Menor precio" },
              { value: "price-desc", label: "Mayor precio" },
              { value: "name", label: "A – Z" },
            ]}
          />
        </div>
      </div>

      <p className="mb-4 font-mono text-[12px] text-ink-3" aria-live="polite">
        {list.length === catalog.length ? `${list.length} juegos` : `${list.length} de ${catalog.length} juegos`}
      </p>

      {list.length ? (
        <motion.ul layout className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((g, i) => (
              <ProductCard key={g.id} game={g} index={i % PAGE} />
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="rounded-3xl bg-surface px-6 py-16 text-center shadow-card">
          <p className="text-lg font-medium">No encontramos “{query}”</p>
          <p className="mt-1 text-sm text-ink-3">Escríbenos y lo buscamos por ti.</p>
          <a
            href={waLink(`Hola EnLaJuega, ¿tienen o pueden conseguir "${query || "un juego"}"?`)}
            target="_blank"
            rel="noopener"
            className={buttonClass("secondary", "md", "mt-5")}
          >
            Preguntar por WhatsApp
          </a>
        </div>
      )}

      {list.length > limit && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={buttonClass("secondary", "md")}>
            Ver más juegos
            <span className="font-mono text-[12px] text-ink-3">{list.length - limit}</span>
          </button>
        </div>
      )}
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative flex-1 sm:flex-none">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "h-10 w-full cursor-pointer appearance-none rounded-full bg-surface pr-9 pl-4 text-[13px] font-medium shadow-card outline-none",
          "focus-visible:shadow-[0_0_0_1px_var(--color-accent),0_0_0_4px_rgb(91_61_245/0.15)]",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Chevron className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-4" />
    </label>
  );
}

function ProductCard({ game: g, index }: { game: Game; index: number }) {
  const { qty, setQty, openProduct } = useStore();
  const add = useAddToCart();
  const q = qty(g.id);
  const out = g.stock === 0;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: index * 0.025 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      className="group relative"
    >
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-sunken transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_0_0_1px_var(--color-line)]">
        <button
          type="button"
          onClick={() => openProduct(g.id)}
          aria-label={`Ver detalle de ${g.name}`}
          className="absolute inset-0 cursor-zoom-in"
        >
          <GameCover
            game={g}
            className={cx(
              "transition-[opacity,transform] duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]",
              g.images.length > 1 && "[@media(hover:hover)]:group-hover:opacity-0",
              out && "opacity-50 grayscale",
            )}
          />
          {g.images.length > 1 && (
            <GameCover
              game={g}
              index={1}
              alt={false}
              className="scale-95 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
        </button>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {out && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">Agotado</span>}
          {g.ludoteca && <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-medium text-lime-ink">Pruébalo</span>}
        </div>

        <div className="absolute right-2.5 bottom-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {out ? (
              <motion.a
                key="ask"
                href={waLink(`Hola EnLaJuega, me interesa "${g.name}". ¿Lo pueden encargar?`)}
                target="_blank"
                rel="noopener"
                className="press flex h-8 items-center rounded-full bg-surface px-3 text-[12px] font-medium shadow-card"
              >
                Encargar
              </motion.a>
            ) : q === 0 ? (
              <motion.button
                key="add"
                type="button"
                onClick={() => add(g)}
                aria-label={`Agregar ${g.name} al carrito`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
                className="grid size-9 place-items-center rounded-full bg-ink text-white shadow-float transition-[background-color] hover:bg-accent active:scale-90"
              >
                <Plus />
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                className="origin-right shadow-float rounded-full"
              >
                <Stepper value={q} max={g.stock} onChange={(n) => setQty(g.id, n)} label={`Cantidad de ${g.name}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-[14.5px] leading-snug font-medium tracking-tight">
          <button type="button" onClick={() => openProduct(g.id)} className="text-left hover:underline hover:decoration-ink/25 hover:underline-offset-4">
            {g.name}
          </button>
        </h3>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="font-mono text-[13.5px] font-medium tabular">{money(g.price)}</p>
          <p className={cx("text-[12px]", g.stock === 1 ? "text-accent" : "text-ink-3")}>
            {out ? "Agotado" : g.stock === 1 ? "Última copia" : `${g.stock} copias`}
          </p>
        </div>
      </div>
    </motion.li>
  );
}
