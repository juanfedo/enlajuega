import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { useStore } from "../store";
import { cx } from "../lib/utils";
import { Bag } from "./icons";

const LINKS = [
  { href: "#tienda", label: "Tienda" },
  { href: "#experiencias", label: "Experiencias" },
  { href: "#servicios", label: "Servicios" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#inicio" aria-label="EnLaJuega, inicio" className={cx("group inline-flex items-center gap-2", className)}>
      <span className="grid size-7 grid-cols-2 place-items-center gap-0 rounded-[9px] bg-ink p-[5px] transition-transform duration-500 ease-[var(--ease-out)] group-hover:rotate-90">
        <i className="size-[5px] rounded-full bg-white" />
        <i className="size-[5px] rounded-full bg-white" />
        <i className="size-[5px] rounded-full bg-white" />
        <i className="size-[5px] rounded-full bg-lime" />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.03em]">
        enla<span className="text-ink-3">juega</span>
      </span>
    </a>
  );
}

export function Header() {
  const { count, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive("#" + e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => {
      const el = document.querySelector(l.href);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled && "bg-canvas/75 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl backdrop-saturate-150",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Principal" className="ml-auto hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cx(
                "relative rounded-full px-3 py-1.5 text-[13.5px] font-medium transition-colors duration-200",
                active === l.href ? "text-ink" : "text-ink-3 hover:text-ink",
              )}
            >
              {active === l.href && (
                <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-ink/[0.06]" transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
            className="press flex h-9 items-center gap-2 rounded-full bg-ink pr-1.5 pl-3.5 text-[13px] font-medium text-white"
          >
            <Bag width={15} height={15} />
            <span className="hidden sm:inline">Carrito</span>
            <span className="relative grid h-6 min-w-6 place-items-center overflow-hidden rounded-full bg-lime px-1.5 font-mono text-[12px] text-ink tabular">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>

          <Drawer.Root open={menu} onOpenChange={setMenu}>
            <Drawer.Trigger
              aria-label="Abrir menú"
              className="press grid size-9 place-items-center rounded-full bg-surface shadow-card md:hidden"
            >
              <span className="flex w-3.5 flex-col gap-[3px]">
                <i className="h-[1.5px] rounded bg-ink" />
                <i className="h-[1.5px] rounded bg-ink" />
              </span>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/30" />
              <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-50 rounded-t-[22px] bg-surface px-4 pt-2.5 pb-[max(env(safe-area-inset-bottom),20px)] outline-none">
                <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
                <Drawer.Title className="sr-only">Menú</Drawer.Title>
                <nav className="flex flex-col">
                  {LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenu(false)}
                      className="flex items-center justify-between border-b border-line py-4 text-2xl font-medium tracking-tight last:border-0"
                    >
                      {l.label}
                      <span className="text-ink-4">→</span>
                    </a>
                  ))}
                </nav>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>
    </header>
  );
}
