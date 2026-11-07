import { AnimatePresence, motion } from "motion/react";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { Game } from "../data/catalog";
import { cx } from "../lib/utils";
import { Minus, Plus, Trash } from "./icons";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "light";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]",
  accent: "bg-accent text-white hover:bg-accent-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]",
  secondary: "bg-surface text-ink shadow-card hover:bg-sunken/60",
  ghost: "text-ink-2 hover:bg-ink/5 hover:text-ink",
  light: "bg-white text-ink hover:bg-white/90",
};
const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-[15px] gap-2",
};

export function buttonClass(variant: Variant = "primary", size: keyof typeof SIZES = "md", extra?: string) {
  return cx(
    "press inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-40 select-none",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

const PH = ["#5b3df5", "#0c0a09", "#c8f169", "#ff6b4a", "#38bdf8"];

// Si la imagen falla (p. ej. una URL externa de la hoja), reintenta una vez y luego
// muestra la portada de color con el nombre en lugar del ícono de imagen rota.
export function GameCover({ game, className, alt = true, index = 0 }: { game: Game; className?: string; alt?: boolean; index?: number }) {
  const src = game.images[index];
  const [fail, setFail] = useState({ src, count: 0 });
  const failures = fail.src === src ? fail.count : 0;

  if (!src || failures > 1) {
    const n = game.name.length % PH.length;
    const light = PH[n] === "#c8f169";
    return (
      <div
        className={cx("absolute inset-[14%] grid place-items-center rounded-xl p-3 text-center", className)}
        style={{ background: PH[n], color: light ? "#0c0a09" : "#fff" }}
      >
        <span className="serif text-[clamp(1rem,2.4vw,1.5rem)] leading-none">{game.name}</span>
      </div>
    );
  }
  return (
    <img
      key={failures}
      src={src}
      alt={alt ? game.name : ""}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => {
        const next = { src, count: failures + 1 };
        if (next.count === 1) setTimeout(() => setFail(next), 1500);
        else setFail(next);
      }}
      className={cx("absolute inset-0 m-auto h-[78%] w-[78%] object-contain mix-blend-multiply", className)}
    />
  );
}

export function Stepper({
  value,
  max,
  onChange,
  label,
  tone = "dark",
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  tone?: "dark" | "light";
  size?: "sm" | "md";
}) {
  const btn = cx(
    "grid place-items-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 disabled:opacity-30",
    size === "sm" ? "size-7" : "size-8",
    tone === "dark" ? "hover:bg-white/15" : "hover:bg-ink/8",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(
        "inline-flex items-center rounded-full p-0.5",
        tone === "dark" ? "bg-ink text-white" : "bg-sunken text-ink",
      )}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label={value === 1 ? "Quitar del carrito" : "Quitar uno"}>
        {value === 1 ? <Trash width={14} height={14} /> : <Minus width={14} height={14} />}
      </button>
      <span className="relative w-6 overflow-hidden text-center font-mono text-[13px] tabular">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block"
            initial={{ y: 12, opacity: 0, filter: "blur(2px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -12, opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Agregar uno">
        <Plus width={14} height={14} />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  id,
  options,
  value,
  onChange,
  label,
  className,
}: {
  id: string;
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("relative inline-flex rounded-full bg-sunken p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "relative flex-1 rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200",
              active ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-surface shadow-card"
                transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("mb-4 inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.14em] text-ink-3 uppercase", className)}>
      <span className="size-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
