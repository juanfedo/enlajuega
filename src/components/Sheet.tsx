import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { useMediaQuery } from "../lib/utils";
import { Close } from "./icons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

// Panel lateral en escritorio, hoja inferior arrastrable en móvil.
export function Sheet({ open, onOpenChange, title, children, footer, wide }: Props) {
  const desktop = useMediaQuery("(min-width: 768px)");

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={desktop ? "right" : "bottom"}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/35" />
        <Drawer.Content
          aria-describedby={undefined}
          className={
            desktop
              ? `fixed top-3 right-3 bottom-3 z-50 flex ${wide ? "w-[520px]" : "w-[440px]"} max-w-[calc(100vw-24px)] flex-col rounded-[22px] bg-surface shadow-float outline-none`
              : "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[22px] bg-surface pb-[env(safe-area-inset-bottom)] outline-none"
          }
        >
          {!desktop && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15" />}
          <div className="flex shrink-0 items-center justify-between gap-4 px-5 pt-4 pb-3 md:px-6 md:pt-5">
            <Drawer.Title className="text-[17px] font-semibold tracking-tight">{title}</Drawer.Title>
            <Drawer.Close
              aria-label="Cerrar"
              className="press grid size-8 place-items-center rounded-full bg-sunken text-ink-2 transition-colors hover:bg-ink/10 hover:text-ink"
            >
              <Close />
            </Drawer.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 md:px-6">{children}</div>
          {footer && <div className="shrink-0 border-t border-line px-5 py-4 md:px-6">{footer}</div>}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
