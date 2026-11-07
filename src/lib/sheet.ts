import type { Game } from "../data/catalog";

export type SheetCatalog = { games: Game[]; updated: string | null };
import { normalize, storage } from "./utils";

// Lee el catálogo desde una hoja de Google Sheets publicada como CSV
// (Archivo → Compartir → Publicar en la web → CSV).
//
// Columnas esperadas (la primera fila son los encabezados; mayúsculas y tildes no importan):
//   id        opcional; si está vacío se genera a partir del nombre
//   nombre    obligatorio
//   precio    obligatorio, en COP ("45000", "$45.000" y "45,000" valen igual)
//   stock     copias disponibles; vacío = 0
//   ludoteca  sí / no (también vale TRUE/FALSE de una casilla de verificación, x, 1)
//   imagenes  nombres de archivo de public/assets/games ("07b.webp 07c.webp")
//             o URLs completas, separados por espacio o coma
//   destacado opcional; "sí" = aparece en el abanico del inicio (máximo 5, en el orden de la hoja)
//   actualizado opcional; fecha de la última edición de la hoja (AAAA-MM-DD o DD/MM/AAAA).
//             Se toma el primer valor no vacío de la columna. La escribe automáticamente
//             el Apps Script del README en cada edición.

const CACHE_KEY = "elj-catalog";

/** Parser CSV mínimo: soporta comillas, comas y saltos de línea dentro de comillas. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

const slug = (s: string) =>
  normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toInt = (s = "") => {
  const digits = s.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : NaN;
};

const YES = new Set(["si", "s", "x", "true", "verdadero", "1", "yes"]);

const toImage = (s: string) => (/^https?:\/\//i.test(s) || s.startsWith("assets/") ? s : `assets/games/${s}`);

const pad = (n: number) => String(n).padStart(2, "0");

/** Normaliza "2026-11-07", "2026-11-07T10:00…" o "7/11/2026 10:00" a "2026-11-07". */
export function toISODate(s: string): string | null {
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  m = s.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (m && +m[2] <= 12) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
  return null;
}

/** Convierte el CSV en juegos. Lanza un error si la hoja no tiene el formato esperado. */
export function csvToCatalog(text: string): SheetCatalog {
  const [header, ...rows] = parseCSV(text);
  if (!header) throw new Error("Hoja vacía");
  const col = Object.fromEntries(header.map((h, i) => [normalize(h.trim()).replace(/\s+/g, ""), i]));
  if (col.nombre === undefined || col.precio === undefined) throw new Error("Faltan las columnas 'nombre' o 'precio'");

  const get = (r: string[], name: string) => (col[name] === undefined ? "" : (r[col[name]] ?? "").trim());
  const seen = new Set<string>();
  const games: Game[] = [];
  let updated: string | null = null;
  for (const r of rows) {
    updated ??= toISODate(get(r, "actualizado"));
    const name = get(r, "nombre");
    const price = toInt(get(r, "precio"));
    if (!name || Number.isNaN(price)) continue;
    let id = slug(get(r, "id") || name);
    if (!id || seen.has(id)) id = `${id || "juego"}-${games.length}`;
    seen.add(id);
    const stock = toInt(get(r, "stock"));
    games.push({
      id,
      name,
      price,
      stock: Number.isNaN(stock) ? 0 : stock,
      ludoteca: YES.has(normalize(get(r, "ludoteca"))),
      images: get(r, "imagenes").split(/[\s,]+/).filter(Boolean).map(toImage),
      ...(YES.has(normalize(get(r, "destacado"))) && { featured: true }),
    });
  }
  if (!games.length) throw new Error("La hoja no tiene juegos válidos");
  return { games, updated };
}

export async function fetchCatalog(url: string): Promise<SheetCatalog> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = csvToCatalog(await res.text());
  storage.set(CACHE_KEY, data);
  return data;
}

/** Última versión descargada de la hoja (o null si nunca se ha descargado). */
export const cachedCatalog = (): SheetCatalog | null => {
  const c = storage.get<SheetCatalog | Game[] | null>(CACHE_KEY, null);
  // Formato antiguo de la caché: solo el arreglo de juegos.
  if (Array.isArray(c)) return c.length ? { games: c, updated: null } : null;
  return c && Array.isArray(c.games) && c.games.length ? { games: c.games, updated: c.updated ?? null } : null;
};
