import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { SITE } from "../data/site";
import { cx, money, storage, waLink } from "../lib/utils";
import { useStore } from "../store";
import { ArrowLeft } from "./icons";
import { Button, GameCover, Stepper } from "./ui";
import { Sheet } from "./Sheet";

type Customer = { name: string; phone: string; address: string };
const ease = [0.23, 1, 0.32, 1] as const;

export function CartSheet() {
  const { cartOpen, setCartOpen, items, total, count, setQty, clear, games } = useStore();
  const [step, setStep] = useState<"items" | "checkout">("items");
  const [customer, setCustomer] = useState<Customer>(() => storage.get("elj-customer", { name: "", phone: "", address: "" }));
  const [delivery, setDelivery] = useState(SITE.points[0].id);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (cartOpen) setStep("items");
  }, [cartOpen]);
  useEffect(() => {
    if (count === 0) setStep("items");
  }, [count]);

  const entries = Object.entries(items).filter(([id]) => games.has(id));
  const dir = step === "checkout" ? 1 : -1;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const errs: Record<string, boolean> = {
      name: !customer.name.trim(),
      phone: !customer.phone.trim(),
      address: delivery === "home" && !customer.address.trim(),
    };
    setErrors(errs);
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) {
      document.querySelector<HTMLInputElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    storage.set("elj-customer", customer);
    const point = SITE.points.find((p) => p.id === delivery);
    const lines = entries.map(([id, q]) => {
      const g = games.get(id)!;
      return `• ${q} × ${g.name} — ${money(g.price * q)}`;
    });
    const msg = [
      "¡Hola EnLaJuega! 🎲 Quiero hacer este pedido:",
      "",
      ...lines,
      "",
      `*Subtotal: ${money(total)}*`,
      "",
      `Nombre: ${customer.name}`,
      `Celular: ${customer.phone}`,
      `Entrega: ${point ? `Recoger en ${point.label} (${point.address})` : `Domicilio — ${customer.address}`}`,
      notes ? `Notas: ${notes}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener");
    toast.success("Abrimos WhatsApp con tu pedido", {
      description: "Envía el mensaje y te confirmamos disponibilidad y pago.",
      action: { label: "Vaciar carrito", onClick: () => clear() },
      duration: 8000,
    });
  }

  const footer =
    count === 0 ? null : (
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between text-sm text-ink-3">
          <span>Subtotal</span>
          <span className="font-mono text-lg font-medium text-ink tabular">{money(total)}</span>
        </div>
        {step === "items" ? (
          <Button size="lg" className="w-full" onClick={() => setStep("checkout")}>
            Continuar con el pedido
          </Button>
        ) : (
          <Button variant="accent" size="lg" className="w-full" onClick={() => submit()}>
            Enviar pedido por WhatsApp
          </Button>
        )}
        <p className="text-center text-[12px] text-ink-4">El envío y el pago se confirman por WhatsApp.</p>
      </div>
    );

  return (
    <Sheet
      open={cartOpen}
      onOpenChange={setCartOpen}
      title={
        <span className="flex items-center gap-2">
          {step === "checkout" ? "Tus datos" : "Tu carrito"}
          {count > 0 && <span className="rounded-full bg-sunken px-2 py-0.5 font-mono text-[12px] font-normal text-ink-3">{count}</span>}
        </span>
      }
      footer={footer}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        {count === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center px-4 py-16 text-center"
          >
            <div className="mb-5 grid size-14 grid-cols-2 place-items-center rounded-2xl bg-sunken p-3.5">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={cx("size-2 rounded-full", i === 3 ? "bg-accent" : "bg-ink/25")} />
              ))}
            </div>
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-ink-3">Elige un juego y empecemos la partida.</p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => {
                setCartOpen(false);
                setTimeout(() => document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" }), 250);
              }}
            >
              Ir a la tienda
            </Button>
          </motion.div>
        ) : step === "items" ? (
          <motion.ul
            key="items"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="divide-y divide-line"
          >
            <AnimatePresence initial={false}>
              {entries.map(([id, q]) => {
                const g = games.get(id)!;
                return (
                  <motion.li
                    key={id}
                    layout
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3.5 py-3.5"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sunken">
                      <GameCover game={g} className="!inset-[8%]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{g.name}</p>
                      <p className="mt-0.5 font-mono text-[12.5px] text-ink-3 tabular">
                        {money(g.price)}
                        {q > 1 && <span className="text-ink-4"> × {q}</span>}
                      </p>
                    </div>
                    <Stepper value={q} max={g.stock} onChange={(n) => setQty(id, n)} label={`Cantidad de ${g.name}`} tone="light" size="sm" />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <motion.form key="checkout" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" onSubmit={submit} className="flex flex-col gap-5 pt-1" noValidate>
            <button type="button" onClick={() => setStep("items")} className="-ml-1 inline-flex items-center gap-1.5 self-start rounded-full px-1 text-[13px] font-medium text-ink-3 hover:text-ink">
              <ArrowLeft width={14} height={14} /> Volver al carrito
            </button>
            <Field label="Nombre" error={errors.name && "Cuéntanos tu nombre"}>
              <input
                data-field="name"
                autoComplete="name"
                value={customer.name}
                onChange={(e) => (setCustomer({ ...customer, name: e.target.value }), setErrors({ ...errors, name: false }))}
                placeholder="¿Cómo te llamas?"
                className={inputClass(errors.name)}
              />
            </Field>
            <Field label="Celular" error={errors.phone && "Necesitamos un número de contacto"}>
              <input
                data-field="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={customer.phone}
                onChange={(e) => (setCustomer({ ...customer, phone: e.target.value }), setErrors({ ...errors, phone: false }))}
                placeholder="300 000 0000"
                className={inputClass(errors.phone)}
              />
            </Field>
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-ink-2">Entrega</legend>
              <div role="radiogroup" className="grid gap-2">
                {[...SITE.points.map((p) => ({ id: p.id, t: `Recoger en ${p.label}`, s: p.address })), { id: "home", t: "Envío a domicilio", s: "Te confirmamos el costo por WhatsApp" }].map((o) => (
                  <label
                    key={o.id}
                    className={cx(
                      "flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 transition-shadow duration-200",
                      delivery === o.id ? "shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "shadow-[inset_0_0_0_1px_var(--color-line-2)] hover:shadow-[inset_0_0_0_1px_var(--color-ink-4)]",
                    )}
                  >
                    <input type="radio" name="delivery" value={o.id} checked={delivery === o.id} onChange={() => setDelivery(o.id)} className="peer sr-only" />
                    <span
                      className={cx(
                        "mt-0.5 size-4 shrink-0 rounded-full transition-shadow duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2",
                        delivery === o.id ? "shadow-[inset_0_0_0_5px_var(--color-ink)]" : "shadow-[inset_0_0_0_1.5px_var(--color-line-2)]",
                      )}
                    />
                    <span>
                      <span className="block text-[14px] font-medium">{o.t}</span>
                      <span className="block text-[12.5px] text-ink-3">{o.s}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <AnimatePresence initial={false}>
              {delivery === "home" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="-m-1 overflow-hidden p-1"
                >
                  <Field label="Dirección" error={errors.address && "¿A dónde te lo enviamos?"}>
                    <input
                      data-field="address"
                      autoComplete="street-address"
                      value={customer.address}
                      onChange={(e) => (setCustomer({ ...customer, address: e.target.value }), setErrors({ ...errors, address: false }))}
                      placeholder="Calle, número, barrio, ciudad"
                      className={inputClass(errors.address)}
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
            <Field label="Notas" hint="Opcional">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Es un regalo? ¿Quieres que te expliquemos las reglas?"
                className={cx(inputClass(false), "h-auto resize-none py-2.5")}
              />
            </Field>
          </motion.form>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 28, filter: "blur(3px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.35, ease } },
  exit: (d: number) => ({ opacity: 0, x: d * -28, filter: "blur(3px)", transition: { duration: 0.2, ease } }),
};

export function inputClass(error?: boolean) {
  return cx(
    "h-11 w-full rounded-xl bg-canvas px-3.5 text-[16px] outline-none transition-shadow duration-200 placeholder:text-ink-4 md:text-[15px]",
    error
      ? "shadow-[inset_0_0_0_1.5px_#e5484d]"
      : "shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_1.5px_var(--color-accent),0_0_0_4px_rgb(91_61_245/0.12)]",
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | false; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink-2">
        {label}
        {hint && <span className="text-[12px] font-normal text-ink-4">{hint}</span>}
      </span>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2, ease }}
            className="block pt-1.5 text-[12.5px] text-[#d93d42]"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}
