import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { About, Contact, Footer } from "./components/About";
import { CartSheet } from "./components/CartSheet";
import { Experiences } from "./components/Experiences";
import { Header } from "./components/Header";
import { Hero, Marquee } from "./components/Hero";
import { ProductSheet } from "./components/ProductSheet";
import { BookingSheet, Services } from "./components/Services";
import { Shop } from "./components/Shop";
import { useMediaQuery } from "./lib/utils";
import { StoreProvider } from "./store";
import "./index.css";

function App() {
  // En móvil los avisos van arriba para no tapar los botones de las hojas inferiores
  const desktop = useMediaQuery("(min-width: 768px)");
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <div vaul-drawer-wrapper="" className="min-h-dvh bg-canvas">
          <Header />
          <main className="overflow-x-clip">
            <Hero />
            <Marquee />
            <Shop />
            <Experiences />
            <Services />
            <About />
            <Contact />
          </main>
          <Footer />
        </div>
        <CartSheet />
        <ProductSheet />
        <BookingSheet />
        <Toaster
          position={desktop ? "bottom-center" : "top-center"}
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-0 !bg-ink !text-white !shadow-float !font-sans",
              description: "!text-white/55 !font-mono !text-[12px]",
              actionButton: "!rounded-full !bg-lime !text-ink !font-medium !h-7 !px-3",
              success: "[&_[data-icon]]:!text-lime",
            },
          }}
        />
      </StoreProvider>
    </MotionConfig>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
