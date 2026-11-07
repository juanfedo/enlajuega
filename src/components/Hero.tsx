import { motion, type Variants } from "motion/react";
import { useStore } from "../store";
import { Arrow } from "./icons";
import { buttonClass, GameCover } from "./ui";

const FAN = ["dixit-classic", "carcassonne", "splendor-nueva-edicion", "magic-maze", "draftosaurus"];
const ease = [0.23, 1, 0.32, 1] as const;

const container: Variants = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
};

export function Hero() {
  const { openProduct, catalog, games } = useStore();
  const inStock = catalog.filter((g) => g.stock > 0).length;
  const fan = FAN.map((id) => games.get(id)!).filter(Boolean);

  return (
    <section id="inicio" className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 md:pt-20 md:pb-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.a
            variants={item}
            href="#tienda"
            className="group mb-7 inline-flex items-center gap-2 rounded-full bg-surface py-1 pr-3 pl-1 text-[13px] text-ink-2 shadow-card transition-shadow hover:shadow-float"
          >
            <span className="rounded-full bg-lime px-2 py-0.5 font-mono text-[11px] font-medium text-lime-ink">{inStock} disponibles</span>
            Juegos listos para llevar
            <Arrow width={13} height={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </motion.a>

          <motion.h1 variants={item} className="text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
            Juegos de mesa que te ponen <span className="serif pr-1 text-accent">en la juega.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-ink-2 text-pretty">
            Tienda, ludoteca y experiencias lúdicas. Compra tu próximo juego favorito, pruébalo antes en la Casita o llevamos la ludoteca a tu espacio.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <a href="#tienda" className={buttonClass("primary", "lg", "group pr-4")}>
              Explorar la tienda
              <Arrow className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a href="#servicios" className={buttonClass("secondary", "lg")}>
              Reservar una experiencia
            </a>
          </motion.div>

          <motion.dl variants={item} className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              [String(catalog.length), "juegos en catálogo"],
              ["60+", "probados en ludoteca"],
              ["5 años", "creando experiencias"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-mono text-xl font-medium tracking-tight tabular">{n}</dt>
                <dd className="mt-1 text-[13px] leading-snug text-ink-3">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Abanico de cajas: se abre al pasar el cursor */}
        <motion.div
          className="relative mx-auto aspect-[1.15] w-full max-w-[520px]"
          initial="hidden"
          animate="rest"
          whileHover="spread"
        >
          <div aria-hidden className="absolute inset-[8%] rounded-full bg-accent/15 blur-3xl" />
          {fan.map((g, i) => {
            const o = i - (fan.length - 1) / 2;
            // x en % del ancho de la carta (38% del contenedor)
            return (
              <motion.div
                key={g.id}
                className="absolute top-[12%] left-[31%] aspect-[3/4] w-[38%] origin-bottom"
                style={{ zIndex: 10 - Math.abs(o) }}
                variants={{
                  hidden: { opacity: 0, x: "0%", y: 60, rotate: 0 },
                  rest: {
                    opacity: 1,
                    x: `${o * 52}%`,
                    y: Math.abs(o) * 12,
                    rotate: o * 7,
                    transition: { type: "spring", bounce: 0.2, duration: 1, delay: 0.3 + i * 0.06 },
                  },
                  spread: {
                    opacity: 1,
                    x: `${o * 70}%`,
                    y: Math.abs(o) * 20 - 8,
                    rotate: o * 10,
                    transition: { type: "spring", bounce: 0.25, duration: 0.6 },
                  },
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => openProduct(g.id)}
                  aria-label={`Ver ${g.name}`}
                  className="relative size-full cursor-pointer rounded-[20px] bg-surface shadow-float"
                  whileHover={{ y: -20 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                >
                  <GameCover game={g} />
                </motion.button>
              </motion.div>
            );
          })}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -4, transition: { delay: 0.8, duration: 0.6, ease } }}
            className="absolute bottom-[6%] left-[4%] z-20 rounded-2xl bg-ink px-4 py-3 text-white shadow-float"
          >
            <p className="font-mono text-[11px] tracking-wider text-white/50 uppercase">Pruébalo primero</p>
            <p className="text-sm font-medium">+60 juegos en la Casita</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function Marquee() {
  const games = useStore().catalog.filter((g) => g.ludoteca && g.images.length).slice(0, 24);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-3 pr-3">
      {games.map((g) => (
        <li key={g.id} className="relative size-24 shrink-0 rounded-2xl bg-surface shadow-card sm:size-28">
          <GameCover game={g} alt={!hidden} />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Juegos de la ludoteca" className="relative overflow-hidden py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
