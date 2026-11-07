import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ALL_SERVICES, SERVICES, UNIT_LABEL } from "../data/site";
import { cx, money, storage, waLink } from "../lib/utils";
import { useStore } from "../store";
import { Check, Minus, Plus } from "./icons";
import { Button, Kicker, Reveal } from "./ui";
import { Field, inputClass } from "./CartSheet";
import { Sheet } from "./Sheet";

const ease = [0.23, 1, 0.32, 1] as const;

export function Services() {
  const [tab, setTab] = useState(SERVICES[0].id);
  const { openBooking } = useStore();
  const group = SERVICES.find((s) => s.id === tab)!;

  return (
    <section id="servicios" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 md:pt-32">
      <Reveal className="flex flex-col items-center text-center">
        <Kicker>Servicios y precios</Kicker>
        <h2 className="max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
          Precios claros, <span className="serif text-accent">sin letra pequeña</span>
        </h2>
      </Reveal>

      <div className="mt-10 flex justify-center">
        <div role="tablist" aria-label="Categorías de servicios" className="relative flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-sunken p-1 [scrollbar-width:none]">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={tab === s.id}
              onClick={(e) => {
                setTab(s.id);
                e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
              }}
              className={cx(
                "relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200",
                tab === s.id ? "text-ink" : "text-ink-3 hover:text-ink-2",
              )}
            >
              {tab === s.id && (
                <motion.span layoutId="service-tab" className="absolute inset-0 rounded-full bg-surface shadow-card" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
              )}
              <span className="relative">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.3, ease }}
        >
          <p className="mx-auto mt-6 mb-10 max-w-lg text-center text-[15px] text-ink-3">{group.blurb}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {group.items.map((s) => (
              <article
                key={s.id}
                className={cx(
                  "flex w-full flex-col rounded-[24px] p-6 sm:w-[calc(50%-8px)] lg:w-[340px]",
                  s.featured ? "bg-ink text-white shadow-float" : "bg-surface shadow-card",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[17px] font-semibold tracking-tight">{s.name}</h3>
                  {s.featured && <span className="shrink-0 rounded-full bg-lime px-2 py-0.5 text-[11px] font-medium text-lime-ink">Popular</span>}
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-[40px] leading-none font-semibold tracking-[-0.04em] tabular">{s.price ? money(s.price) : "A convenir"}</span>
                  {s.price && <span className={cx("text-[13px]", s.featured ? "text-white/50" : "text-ink-3")}>{UNIT_LABEL[s.unit]}</span>}
                </div>
                <ul className={cx("mt-6 flex flex-1 flex-col gap-2.5 border-t pt-5 text-[14px]", s.featured ? "border-white/10 text-white/75" : "border-line text-ink-2")}>
                  {s.includes.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <Check className={cx("mt-0.5 shrink-0", s.featured ? "text-lime" : "text-accent")} />
                      {x}
                    </li>
                  ))}
                </ul>
                <Button variant={s.featured ? "light" : "primary"} size="lg" className="mt-7 w-full" onClick={() => openBooking(s.id)}>
                  {s.price ? "Reservar" : "Solicitar propuesta"}
                </Button>
              </article>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export function BookingSheet() {
  const { bookingId, openBooking } = useStore();
  const service = bookingId ? ALL_SERVICES.get(bookingId) : undefined;
  const [last, setLast] = useState(service);
  if (service && service !== last) setLast(service);
  const s = service ?? last;

  const [qty, setQty] = useState(2);
  const [date, setDate] = useState("");
  const [name, setName] = useState(() => storage.get("elj-customer", { name: "" }).name);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);
  const [prevId, setPrevId] = useState<string | null>(null);
  if (bookingId && bookingId !== prevId) {
    setPrevId(bookingId);
    setQty(ALL_SERVICES.get(bookingId)?.unit === "hora" ? 1 : 2);
  }

  if (!s) return null;
  const n = s.unit === "sesion" ? 1 : qty;
  const showQty = s.unit !== "sesion";

  function send() {
    if (!s) return;
    if (!name.trim()) {
      setError(true);
      document.querySelector<HTMLInputElement>('[data-field="book-name"]')?.focus();
      return;
    }
    const when = date
      ? new Date(date + "T12:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
      : "por definir";
    const msg = [
      `¡Hola EnLaJuega! Quiero reservar: *${s.name}* (${s.group}).`,
      s.unit === "persona" ? `Personas: ${n}` : s.unit === "hora" ? `Horas: ${n}` : null,
      `Fecha tentativa: ${when}`,
      s.price ? `Estimado: ${money(s.price * n)}` : null,
      `Nombre: ${name}`,
      notes ? `Detalles: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener");
    toast.success("Abrimos WhatsApp con tu reserva", { description: "Te confirmamos disponibilidad por ese chat." });
  }

  return (
    <Sheet
      open={!!service}
      onOpenChange={(o) => !o && openBooking(null)}
      title="Reservar"
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-sm text-ink-3">
            <span>Estimado</span>
            <span className="font-mono text-lg font-medium text-ink tabular">{s.price ? money(s.price * n) : "A convenir"}</span>
          </div>
          <Button variant="accent" size="lg" className="w-full" onClick={send}>
            Enviar por WhatsApp
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-canvas p-4">
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">{s.group}</p>
          <p className="mt-1 text-[17px] font-semibold tracking-tight">{s.name}</p>
          <p className="mt-0.5 text-[13px] text-ink-3">{s.price ? `${money(s.price)} ${UNIT_LABEL[s.unit]}` : "Valor a convenir según la jornada"}</p>
        </div>

        {showQty && (
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-2">{s.unit === "hora" ? "Horas" : "Personas"}</p>
            <div className="inline-flex items-center rounded-full bg-sunken p-1">
              <button type="button" aria-label="Menos" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-9 place-items-center rounded-full bg-surface shadow-card transition-transform active:scale-90 disabled:opacity-40">
                <Minus />
              </button>
              <span className="w-12 text-center font-mono text-[15px] tabular" aria-live="polite">
                {qty}
              </span>
              <button type="button" aria-label="Más" onClick={() => setQty((q) => q + 1)} className="grid size-9 place-items-center rounded-full bg-surface shadow-card transition-transform active:scale-90">
                <Plus />
              </button>
            </div>
          </div>
        )}

        <Field label="Fecha tentativa" hint="Opcional">
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={inputClass(false)} />
        </Field>
        <Field label="Nombre" error={error && "Cuéntanos tu nombre"}>
          <input
            data-field="book-name"
            autoComplete="name"
            value={name}
            onChange={(e) => (setName(e.target.value), setError(false))}
            placeholder="¿Cómo te llamas?"
            className={inputClass(error)}
          />
        </Field>
        <Field label="Cuéntanos un poco" hint="Opcional">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ocasión, edades, lugar, objetivos…" className={cx(inputClass(false), "h-auto resize-none py-2.5")} />
        </Field>
      </div>
    </Sheet>
  );
}
