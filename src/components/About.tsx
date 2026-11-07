import { SITE } from "../data/site";
import { waLink } from "../lib/utils";
import { Instagram, Mail, Pin, WhatsApp } from "./icons";
import { Logo } from "./Header";
import { buttonClass, Kicker, Reveal } from "./ui";

const TEAM = [
  {
    name: "Daniel Mesa",
    role: "Terapeuta Ocupacional · 2019",
    bio: "5 años de experiencia en juegos teatrales, juegos de mesa modernos y elementos didácticos.",
    img: "assets/photos/daniel.webp",
  },
  {
    name: "Leidy Pineda",
    role: "Terapeuta Ocupacional · 2021",
    bio: "5 años de experiencia en salud mental y adultos mayores, 1 año en juegos de mesa modernos.",
    img: "assets/photos/leidy.webp",
  },
];

export function About() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 md:pt-32">
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <Reveal className="flex flex-col justify-between rounded-[28px] bg-surface p-6 shadow-card md:p-10">
          <div>
            <Kicker>Nuestra historia</Kicker>
            <h2 className="text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.04] font-semibold tracking-[-0.04em] text-balance">
              Un grupo de amigos que se tomó <span className="serif text-accent">el juego en serio.</span>
            </h2>
          </div>
          <p className="mt-8 max-w-md text-[16px] leading-relaxed text-ink-2">
            Somos apasionados por el juego, en especial por los juegos de mesa modernos, que nos permiten compartir, aprender y crear comunidad.
            Somos tienda, casa de juegos, ludoteca itinerante y diseñadores de experiencias lúdicas.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06} className="overflow-hidden rounded-[28px] bg-surface shadow-card">
              <img src={p.img} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
              <div className="p-5">
                <h3 className="text-[16px] font-semibold tracking-tight">{p.name}</h3>
                <p className="font-mono text-[11.5px] text-accent">{p.role}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-3">{p.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const items = [
    ...SITE.points.map((p) => ({ icon: <Pin />, label: p.label, value: p.address, href: `https://www.google.com/maps/search/${encodeURIComponent(p.address)}` })),
    { icon: <WhatsApp />, label: "WhatsApp", value: SITE.phoneLabel, href: waLink("Hola EnLaJuega 👋") },
    { icon: <Mail />, label: "Correo", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: <Instagram />, label: "Instagram", value: "@" + SITE.instagram, href: `https://instagram.com/${SITE.instagram}` },
  ];
  return (
    <section id="contacto" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 pb-16 sm:px-6 md:pt-32">
      <Reveal className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-white md:px-14 md:py-20">
        <div aria-hidden className="absolute -right-24 -bottom-32 size-[420px] rounded-full bg-accent/40 blur-[90px]" />
        <div aria-hidden className="absolute top-10 right-10 hidden size-28 rotate-12 grid-cols-2 place-items-center rounded-[30px] bg-lime p-6 md:grid">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="size-4 rounded-full bg-ink" />
          ))}
        </div>
        <div className="relative">
          <p className="font-mono text-[11px] tracking-[0.14em] text-white/50 uppercase">Contacto</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.045em]">
            ¡Pongámonos <span className="serif text-lime">EnLaJuega!</span>
          </h2>
          <p className="mt-5 max-w-md text-[16px] text-white/60">Escríbenos para pedidos, reservas, asesorías o para recomendarte tu próximo juego.</p>
          <a href={waLink("Hola EnLaJuega 👋 Quiero más información.")} target="_blank" rel="noopener" className={buttonClass("light", "lg", "mt-8")}>
            <WhatsApp /> Escríbenos por WhatsApp
          </a>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.45fr_1fr]">
            {items.map((it) => (
              <li key={it.label + it.value} className="bg-ink">
                <a href={it.href} target="_blank" rel="noopener" className="flex h-full flex-col gap-3 p-5 transition-colors hover:bg-white/[0.04]">
                  <span className="text-white/40">{it.icon}</span>
                  <span>
                    <span className="block font-mono text-[11px] tracking-wider text-white/40 uppercase">{it.label}</span>
                    <span className="mt-1 block text-[14px] break-words">{it.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line px-4 py-8 text-[12.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <Logo />
      <p>Precios en pesos colombianos. Catálogo actualizado al 2 de noviembre de 2026.</p>
      <p>© {new Date().getFullYear()} EnLaJuega</p>
    </footer>
  );
}
