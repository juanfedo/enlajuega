import type { ReactNode } from "react";
import { cx, waLink } from "../lib/utils";
import { useStore } from "../store";
import { Arrow } from "./icons";
import { buttonClass, Kicker, Reveal } from "./ui";

function PhotoTile({
  src,
  alt,
  title,
  text,
  action,
  className,
  delay,
}: {
  src: string;
  alt: string;
  title: string;
  text: string;
  action?: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cx("group relative isolate flex min-h-[340px] overflow-hidden rounded-[28px] bg-ink", className)}>
      <img src={src} alt={alt} loading="lazy" className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.03]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="mt-auto flex w-full flex-col items-start gap-2 p-6 text-white md:p-7">
        <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="max-w-sm text-[14.5px] leading-relaxed text-white/75">{text}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </Reveal>
  );
}

const ORG = [
  "Fortalecimiento de habilidades del equipo de trabajo",
  "Trabajo en equipo y comunicación",
  "Formación experiencial en cultura organizacional",
  "Encuentros pedagógicos y lúdicos para equipos",
  "Diseño de experiencias personalizadas",
];

export function Experiences() {
  const { openBooking } = useStore();

  return (
    <section id="experiencias" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 md:pt-32">
      <Reveal className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Kicker>Experiencias</Kicker>
          <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
            Disfrutar <span className="serif text-accent">y conectar</span>
          </h2>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-2 md:justify-self-end">
          Juego presencial, en tu casa o en tu negocio. Siempre con alguien que te explica las reglas y te recomienda qué jugar.
        </p>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-6">
        <PhotoTile
          className="md:col-span-4 md:min-h-[460px]"
          src="assets/photos/casita-0.webp"
          alt="Personas jugando en la Casita EnLaJuega"
          title="Casita EnLaJuega"
          text="Ven a nuestra ludoteca: un espacio pensado para jugar con quienes más disfrutas. Más de 60 juegos probados."
          action={
            <button type="button" onClick={() => openBooking("casita")} className={buttonClass("light", "md")}>
              Reservar · $15.000 p/p
            </button>
          }
        />
        <PhotoTile
          className="md:col-span-2"
          delay={0.06}
          src="assets/photos/itinerante-0.webp"
          alt="Manos jugando sobre un mantel con juegos de mesa"
          title="Vamos a tu casa"
          text="Llevamos la ludoteca itinerante a tu espacio."
          action={
            <button type="button" onClick={() => openBooking("itinerante")} className={buttonClass("light", "md")}>
              Reservar · $25.000 p/p
            </button>
          }
        />
        <PhotoTile
          className="md:col-span-3"
          src="assets/photos/alianza-0.webp"
          alt="Postres de Amalaya Dulcera"
          title="Alianza con Amalaya Dulcera"
          text="La Casita puede ir acompañada de un menú abierto o personalizado, dulce o salado. Ideal para eventos, talleres y jornadas de juego."
        />
        <Reveal delay={0.06} className="relative flex min-h-[340px] flex-col overflow-hidden rounded-[28px] bg-accent p-6 text-white md:col-span-3 md:p-7">
          <div aria-hidden className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10" />
          <div aria-hidden className="absolute top-16 right-10 size-24 rounded-[28px] bg-lime/90 rotate-12" />
          <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">Acompañando tu espacio</p>
          <h3 className="mt-auto max-w-sm text-[clamp(1.6rem,3vw,2.1rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            ¿Tienes un café o restaurante?
          </h3>
          <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-white/75">
            Llevamos nuestra ludoteca itinerante para crear una experiencia de conexión con tus clientes.
          </p>
          <a
            href={waLink("Hola EnLaJuega, tengo un espacio (café/restaurante) y me interesa la ludoteca itinerante para mis clientes.")}
            target="_blank"
            rel="noopener"
            className={buttonClass("light", "md", "group mt-5 self-start")}
          >
            Hablemos <Arrow className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>

      {/* Organizaciones */}
      <Reveal className="mt-4 grid gap-10 rounded-[28px] bg-surface p-6 shadow-card md:grid-cols-[1fr_1.2fr] md:p-10">
        <div>
          <Kicker>Para organizaciones</Kicker>
          <h3 className="text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            El juego como herramienta <span className="serif text-accent">de equipo</span>
          </h3>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-ink-2">
            Empresas, ONG, organizaciones con o sin ánimo de lucro, instituciones educativas y afines.
          </p>
          <button type="button" onClick={() => openBooking("exp-espacio")} className={buttonClass("primary", "md", "mt-6")}>
            Cotizar una experiencia
          </button>
        </div>
        <ol className="divide-y divide-line">
          {ORG.map((t, i) => (
            <li key={t} className="flex items-baseline gap-5 py-4 text-[15px] font-medium tracking-tight">
              <span className="font-mono text-[12px] text-ink-4 tabular">{String(i + 1).padStart(2, "0")}</span>
              {t}
            </li>
          ))}
        </ol>
      </Reveal>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Reveal className="flex flex-col overflow-hidden rounded-[28px] bg-surface shadow-card">
          <img src="assets/photos/procesos-0.webp" alt="Jornada comunitaria de juego al aire libre" loading="lazy" className="aspect-[16/9] w-full object-cover" />
          <div className="p-6 md:p-7">
            <p className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">Procesos terapéuticos y comunitarios</p>
            <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em]">Jugar también sana</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
              Acompañamos procesos terapéuticos individuales y comunitarios, con más de 5 años de experiencia con infancias y adultos mayores.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.06} className="flex flex-col overflow-hidden rounded-[28px] bg-surface shadow-card">
          <img src="assets/photos/personalizados-0.webp" alt="Prototipo de juego de mesa personalizado" loading="lazy" className="aspect-[16/9] w-full object-cover" />
          <div className="p-6 md:p-7">
            <p className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">Juegos personalizados</p>
            <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em]">Tu propio juego de mesa</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
              Creamos la mecánica de juegos de mesa para procesos educativos, organizativos y a la medida.
            </p>
            <ol className="mt-5 flex flex-wrap items-center gap-1.5 text-[12.5px] font-medium">
              {["Idea", "Diseño", "Pruebas", "Tu juego"].map((s, i, a) => (
                <li key={s} className="flex items-center gap-1.5">
                  <span className={cx("rounded-full px-2.5 py-1", i === a.length - 1 ? "bg-ink text-white" : "bg-sunken")}>{s}</span>
                  {i < a.length - 1 && <span className="text-ink-4">→</span>}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
