import { useEffect, useState } from "react";
import { SITE } from "../data/site";

export const money = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const waLink = (text: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatch(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return match;
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* modo privado: ignoramos */
    }
  },
};
