import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Game } from "../data/catalog";
import { cx, money, waLink } from "../lib/utils";
import { useStore } from "../store";
import { Check, Sparkle, WhatsApp } from "./icons";
import { useAddToCart } from "./Shop";
import { Button, buttonClass, GameCover } from "./ui";
import { Sheet } from "./Sheet";

export function ProductSheet() {
  const { product, openProduct, qty, setCartOpen } = useStore();
  const add = useAddToCart();
  // Conserva el último juego mientras la hoja anima su cierre
  const last = useRef<Game | null>(null);
  if (product) last.current = product;
  const g = product ?? last.current;
  const [view, setView] = useState(0);
  useEffect(() => setView(0), [product?.id]);

  if (!g) return null;
  const q = qty(g.id);
  const out = g.stock === 0;

  const facts = [
    out
      ? { ok: false, text: "Agotado por ahora. Escríbenos y lo encargamos o te avisamos cuando llegue." }
      : { ok: true, text: g.stock === 1 ? "Queda 1 copia disponible" : `${g.stock} copias disponibles` },
    g.ludoteca
      ? { ok: true, text: "Está en nuestra ludoteca: pruébalo en la Casita antes de comprarlo." }
      : { ok: false, text: "¿Dudas de si es para ti? Te asesoramos por WhatsApp." },
    { ok: true, text: "Recoge en nuestros puntos o pide envío a domicilio." },
  ];

  return (
    <Sheet
      open={!!product}
      onOpenChange={(o) => !o && openProduct(null)}
      title="Detalle del juego"
      wide
      footer={
        <div className="flex flex-col gap-2">
          {out ? (
            <a
              href={waLink(`Hola EnLaJuega, me interesa "${g.name}". ¿Lo pueden encargar?`)}
              target="_blank"
              rel="noopener"
              className={buttonClass("primary", "lg", "w-full")}
            >
              Encargar este juego
            </a>
          ) : q === 0 ? (
            <Button size="lg" className="w-full" onClick={() => add(g)}>
              Agregar al carrito · <span className="font-mono tabular">{money(g.price)}</span>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" className="flex-1" disabled={q >= g.stock} onClick={() => add(g)}>
                {q >= g.stock ? "Sin más copias" : "Agregar otra"}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  openProduct(null);
                  setTimeout(() => setCartOpen(true), 250);
                }}
              >
                <Check /> Ver carrito ({q})
              </Button>
            </div>
          )}
          <a
            href={waLink(`Hola EnLaJuega, quiero saber más sobre "${g.name}".`)}
            target="_blank"
            rel="noopener"
            className={buttonClass("ghost", "md", "w-full")}
          >
            <WhatsApp /> Preguntar por WhatsApp
          </a>
        </div>
      }
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-sunken">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={view}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <GameCover game={g} index={view} className={cx(out && "grayscale opacity-60")} />
          </motion.div>
        </AnimatePresence>
        {g.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-surface/80 p-1 shadow-card backdrop-blur">
            {["Caja", "Componentes"].map((l, i) => (
              <button
                key={l}
                type="button"
                onClick={() => setView(i)}
                aria-pressed={view === i}
                className={cx("relative rounded-full px-3 py-1 text-[12px] font-medium transition-colors", view === i ? "text-white" : "text-ink-2 hover:text-ink")}
              >
                {view === i && <motion.span layoutId="gallery-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {out && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">Agotado</span>}
        {g.ludoteca && <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-medium text-lime-ink">Pruébalo en la Casita</span>}
      </div>
      <h2 className="mt-3 text-[28px] leading-tight font-semibold tracking-[-0.03em]">{g.name}</h2>
      <p className="mt-1 font-mono text-lg tabular">{money(g.price)}</p>

      <ul className="mt-6 divide-y divide-line rounded-2xl bg-canvas px-4">
        {facts.map((f) => (
          <li key={f.text} className="flex gap-3 py-3.5 text-[14px] leading-snug text-ink-2">
            <span className={cx("mt-px grid size-5 shrink-0 place-items-center rounded-full", f.ok ? "bg-lime text-lime-ink" : "bg-accent-soft text-accent")}>
              {f.ok ? <Check width={12} height={12} strokeWidth={2.5} /> : <Sparkle width={12} height={12} strokeWidth={2.2} />}
            </span>
            {f.text}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
