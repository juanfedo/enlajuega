warning: in the working copy of 'CLAUDE.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/About.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/Hero.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/CLAUDE.md b/CLAUDE.md[m
[1mindex e07924d..e10bfac 100644[m
[1m--- a/CLAUDE.md[m
[1m+++ b/CLAUDE.md[m
[36m@@ -20,7 +20,7 @@[m [mThere is no test suite or linter; `npm run build` (via `tsc -b`, with `noUnusedL[m
 ## Architecture[m
 [m
 - **`src/main.tsx`** composes the whole page: section components in order (Hero, Marquee, Shop, Experiences, Services, About, Contact, Footer) plus three globally mounted drawers (`CartSheet`, `ProductSheet`, `BookingSheet`) and the `Toaster`. There is no router; navigation is anchor scrolling.[m
[31m-- **Catalog loading:** `src/lib/sheet.ts` fetches and parses the CSV at `SITE.catalogSheetUrl` (column format documented there and in the README). The store starts from the last cached download (localStorage `elj-catalog`), or from the bundled `CATALOG` in `catalog.ts` as a fallback, then swaps in the fresh sheet data. Components must read `catalog`/`games` from `useStore()` and never import `CATALOG` directly. `catalogo.csv` is the seed export used to create the sheet.[m
[32m+[m[32m- **Catalog loading:** `src/lib/sheet.ts` fetches and parses the CSV at `SITE.catalogSheetUrl` (column format documented there and in the README). The store starts from the last cached download (localStorage `elj-catalog`), or from the bundled `CATALOG` in `catalog.ts` as a fallback, then swaps in the fresh sheet data. The optional `destacado` column sets `Game.featured`, which picks the up-to-5 games in the Hero fan (`components/Hero.tsx`, falls back to the first in-stock games with images). The optional `actualizado` column (first non-empty value, written by the Apps Script `onEdit` in the README) becomes `updated` in the store and is shown in the Footer; without it, `CATALOG_UPDATED` from `catalog.ts` is used. Components must read `catalog`/`games` from `useStore()` and never import `CATALOG` directly. `catalogo.csv` is the seed export used to create the sheet.[m
 - **`src/store.tsx`** is the single React context (`useStore`). It holds the catalog and the cart (`items: Record<gameId, qty>`, persisted to localStorage key `elj-cart`, quantities clamped to `stock` and re-sanitized whenever the catalog changes) and which drawer is open: `cartOpen`, `product` (via `openProduct(id)`), and `bookingId` (via `openBooking(serviceId)`). Any component opens a drawer by calling these setters rather than owning drawer state.[m
 - **`src/data/catalog.ts`** — the `Game` type and the fallback `CATALOG: Game[]` (price in COP, `stock` = copies, `ludoteca` = playable at the Casita, `images` = `[NNb.webp box, NNc.webp components]`). `stock: 0` renders as "Agotado" with an "Encargar" (order via WhatsApp) action. Empty `images` makes `GameCover` (`components/ui.tsx`) generate a colored cover with the name.[m
 - **`src/data/site.ts`** — `SITE` contact info and pickup points, plus `SERVICES` groups. Service `id`s are what `openBooking()` receives, and `price: null` means "a convenir".[m
[1mdiff --git a/README.md b/README.md[m
[1mindex f4cbc3f..ccb95dc 100644[m
[1m--- a/README.md[m
[1m+++ b/README.md[m
[36m@@ -36,6 +36,27 @@[m [mEl catálogo se lee al abrir la página desde una hoja de Google Sheets, así qu[m
 2. Archivo → Compartir → **Publicar en la web** → elige la pestaña y el formato **CSV** → Publicar. Copia el enlace.[m
 3. Pega el enlace en `catalogSheetUrl` de `src/data/site.ts`, ejecuta `npm run build` y sube `dist/` una última vez.[m
 [m
[31m-Columnas: `id` (opcional), `nombre`, `precio`, `stock`, `ludoteca` (sí/no o casilla), `imagenes` (archivos de `public/assets/games/` como `07b.webp 07c.webp`, o URLs completas). Las filas sin nombre o sin precio se ignoran. Google tarda unos minutos en reflejar los cambios en el CSV publicado.[m
[32m+[m[32mColumnas: `id` (opcional), `nombre`, `precio`, `stock`, `ludoteca` (sí/no o casilla), `imagenes` (archivos de `public/assets/games/` como `07b.webp 07c.webp`, o URLs completas), `destacado` (opcional: "sí" para que el juego aparezca en el abanico del inicio; máximo 5, en el orden de la hoja; si ninguno está marcado se muestran los primeros con stock y foto). Las filas sin nombre o sin precio se ignoran. Google tarda unos minutos en reflejar los cambios en el CSV publicado.[m
[32m+[m
[32m+[m[32m### Fecha de actualización automática[m
[32m+[m
[32m+[m[32mEl pie de página muestra "Catálogo actualizado al …" con la fecha de la columna `actualizado` (se toma el primer valor no vacío). Google no publica la fecha de modificación de la hoja, así que la escribe un pequeño script cada vez que alguien edita:[m
[32m+[m
[32m+[m[32m1. Agrega una columna con el encabezado `actualizado` (puede ser la última).[m
[32m+[m[32m2. En la hoja: Extensiones → **Apps Script**, borra lo que haya, pega esto y guarda:[m
[32m+[m
[32m+[m[32m   ```js[m
[32m+[m[32m   function onEdit(e) {[m
[32m+[m[32m     // Sin `e` = se ejecutó con el botón "Ejecutar" (prueba manual).[m
[32m+[m[32m     const sheet = e ? e.range.getSheet() : SpreadsheetApp.getActiveSheet();[m
[32m+[m[32m     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];[m
[32m+[m[32m     const col = headers.findIndex((h) => String(h).trim().toLowerCase() === "actualizado") + 1;[m
[32m+[m[32m     if (!col || (e && e.range.getColumn() === col && e.range.getNumColumns() === 1)) return;[m
[32m+[m[32m     const hoy = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd");[m
[32m+[m[32m     sheet.getRange(2, col).setNumberFormat("@").setValue(hoy);[m
[32m+[m[32m   }[m
[32m+[m[32m   ```[m
[32m+[m
[32m+[m[32mNo hace falta autorizar nada: `onEdit` es un activador simple que corre solo con cada edición manual. Si la hoja no tiene la columna, el pie muestra `CATALOG_UPDATED` de `src/data/catalog.ts`.[m
 [m
 No cambies el `id` de un juego existente: es lo que identifica el producto en el carrito de los clientes.[m
[1mdiff --git a/catalogo.csv b/catalogo.csv[m
[1mindex 0086116..cc51993 100644[m
[1m--- a/catalogo.csv[m
[1m+++ b/catalogo.csv[m
[36m@@ -1,89 +1,89 @@[m
[31m-﻿id,nombre,precio,stock,ludoteca,imagenes[m
[31m-kadogemo,Kadogemo,12000,2,no,00b.webp 00c.webp[m
[31m-palabreria,Palabrería,27500,1,sí,01b.webp 01c.webp[m
[31m-tridomino,Tridominó,55000,0,sí,02b.webp 02c.webp[m
[31m-lobos,Lobos,60000,0,sí,03b.webp 03c.webp[m
[31m-busywood,BusyWood,25000,5,no,04b.webp 04c.webp[m
[31m-por-que-siempre-yo,¿Por qué siempre yo?,30000,1,no,05b.webp[m
[31m-dobble,Dobble,50000,0,sí,06b.webp 06c.webp[m
[31m-fantasma-blitz,Fantasma Blitz,128900,1,sí,07b.webp 07c.webp[m
[31m-pinguinos,Pingüinos,30000,1,sí,[m
[31m-hanabi,Hanabi,45000,1,sí,09b.webp 09c.webp[m
[31m-virus,Virus!,45000,0,sí,10b.webp 10c.webp[m
[31m-agilizate,Agilízate,30000,0,no,11b.webp[m
[31m-sushi-go,Sushi Go!,79900,0,sí,12b.webp 12c.webp[m
[31m-taco-gato,Taco Gato,76900,0,sí,13b.webp 13c.webp[m
[31m-ritmo-y-bola,Ritmo y Bola,68000,0,no,14b.webp 14c.webp[m
[31m-bendito-7,Bendito 7,60000,1,no,15b.webp 15c.webp[m
[31m-cosechas,Cosechas,60000,0,no,16b.webp 16c.webp[m
[31m-toma-6,Toma 6,65000,0,no,17b.webp 17c.webp[m
[31m-dados,Dados,12000,2,sí,18b.webp 18c.webp[m
[31m-flip-7,Flip 7,40000,1,sí,19b.webp 19c.webp[m
[31m-pelusas,Pelusas,45000,1,sí,20b.webp 20c.webp[m
[31m-tacta,Tacta,33000,1,sí,21b.webp 21c.webp[m
[31m-nesting-doll-triqui,Nesting Doll (Triqui),33000,1,no,22c.webp[m
[31m-catan,Catan,250000,0,no,23b.webp 23c.webp[m
[31m-mariposas,Mariposas,200000,1,no,24b.webp 24c.webp[m
[31m-carcassonne,Carcassonne,177000,1,sí,25b.webp 25c.webp[m
[31m-savernake-forest,Savernake Forest,95000,1,sí,26b.webp 26c.webp[m
[31m-fritanga,Fritanga,125000,1,no,27b.webp 27c.webp[m
[31m-dog,Dog,30000,1,sí,28b.webp 28c.webp[m
[31m-tetra-tower,Tetra Tower,35000,0,no,[m
[31m-battle-wood,Battle Wood,33000,2,no,30b.webp[m
[31m-walkie-talkie,Walkie Talkie,60000,1,sí,31b.webp 31c.webp[m
[31m-mente-vacuna,Mente Vacuna,125000,4,sí,32b.webp 32c.webp[m
[31m-gansferatu,Gansferatu,70000,1,sí,33b.webp 33c.webp[m
[31m-flores,Flores,89000,2,sí,34b.webp 34c.webp[m
[31m-villa-panda,Villa Panda,110000,3,sí,35b.webp 35c.webp[m
[31m-the-game,The Game,70000,2,sí,36b.webp 36c.webp[m
[31m-que-gonorrea,¡Qué Gonorrea!,80000,0,sí,37b.webp 37c.webp[m
[31m-teto,¡Teto!,100000,0,sí,38b.webp 38c.webp[m
[31m-la-cuenta,La Cuenta,92000,3,sí,39b.webp 39c.webp[m
[31m-magic-maze,Magic Maze,195000,1,sí,40b.webp 40c.webp[m
[31m-quita-esa-mano,¡Quita esa mano!,80000,0,sí,41b.webp 41c.webp[m
[31m-vudu,Vudú,150000,0,sí,42b.webp 42c.webp[m
[31m-macho,Macho,170000,1,sí,43b.webp[m
[31m-fiesta-de-calcetines,Fiesta de Calcetines,65000,1,sí,44b.webp[m
[31m-artline,Artline,145000,2,sí,45b.webp 45c.webp[m
[31m-boop,Boop,160000,1,sí,46b.webp 46c.webp[m
[31m-walpurgisnacht-la-danza-de-las-brujas,Walpurgisnacht: La danza de las brujas,50000,0,no,[m
[31m-abejas-las-ordenes-de-la-reina,Abejas: Las órdenes de la reina,109000,3,sí,48b.webp 48c.webp[m
[31m-compostate-bien,Compóstate bien,125000,3,sí,49b.webp 49c.webp[m
[31m-llamagedon,Llamagedón,95000,3,sí,50b.webp 50c.webp[m
[31m-anda-a-lavar,Anda a lavar,75000,2,sí,51b.webp 51c.webp[m
[31m-scout,Scout,80000,3,sí,52b.webp 52c.webp[m
[31m-barrio,Barrio,75000,2,sí,53b.webp 53c.webp[m
[31m-draftosaurus,Draftosaurus,120000,2,sí,54b.webp 54c.webp[m
[31m-abuela-co,Abuela Co.,108900,3,sí,55b.webp 55c.webp[m
[31m-guanga,Guanga,113900,3,sí,56b.webp 56c.webp[m
[31m-bim-bam-bum,Bim Bam Bum,80000,4,sí,57b.webp 57c.webp[m
[31m-postres,Postres,120000,3,sí,58b.webp 58c.webp[m
[31m-regroup-chicken-army,ReGroup: Chicken Army,75000,5,sí,59b.webp 59c.webp[m
[31m-coral,Coral,170000,1,no,60b.webp 60c.webp[m
[31m-paddy,Paddy,195000,1,no,61b.webp 61c.webp[m
[31m-ensemble,Ensemble,160000,2,no,62b.webp 62c.webp[m
[31m-voodoom,Voodoom,85000,2,no,63b.webp 63c.webp[m
[31m-brujeria,¡Brujería!,150000,2,no,64b.webp 64c.webp[m
[31m-worm-up,Worm Up,110000,1,sí,65b.webp 65c.webp[m
[31m-aventureros-al-tren,Aventureros al Tren,280000,1,sí,[m
[31m-bandido,Bandido,50000,4,sí,67b.webp 67c.webp[m
[31m-cakes,Cakes!,150000,2,no,68b.webp 68c.webp[m
[31m-coffee-rush,Coffee Rush,215000,1,sí,69b.webp 69c.webp[m
[31m-dixit-classic,Dixit Classic,180000,1,sí,70b.webp 70c.webp[m
[31m-p-de-pizza,P de Pizza,85000,2,sí,71b.webp 71c.webp[m
[31m-palabra-de-pirata,Palabra de Pirata,95000,2,sí,72b.webp 72c.webp[m
[31m-root-juego-base,Root (juego base),410000,1,sí,73b.webp 73c.webp[m
[31m-splendor-nueva-edicion,Splendor (nueva edición),185000,1,no,74b.webp 74c.webp[m
[31m-survive-the-island,Survive the Island,195000,1,no,75b.webp 75c.webp[m
[31m-survive-the-island-expansion-monstruosa,Survive the Island: expansión monstruosa,95000,1,no,76b.webp 76c.webp[m
[31m-take-time,Take Time,165000,0,sí,77b.webp 77c.webp[m
[31m-mal-trago,Mal Trago,102000,2,no,78b.webp 78c.webp[m
[31m-no-puedes-decir-eh,No puedes decir Eh,130000,5,sí,79b.webp 79c.webp[m
[31m-salem,Salem,159000,3,sí,80b.webp 80c.webp[m
[31m-wisp,Wisp,50000,2,sí,[m
[31m-que-gonorrea-1-5,¡Qué Gonorrea! 1.5,79900,4,sí,82b.webp 82c.webp[m
[31m-rummy-familiar,Rummy familiar,70000,1,no,83b.webp 83c.webp[m
[31m-torre-de-bloques,Torre de bloques,50000,1,no,84b.webp 84c.webp[m
[31m-dominoes,Dominoes,38000,2,no,85b.webp 85c.webp[m
[31m-koko,Koko,45000,1,no,86b.webp 86c.webp[m
[31m-basta,¡Basta!,29900,1,no,87b.webp 87c.webp[m
[32m+[m[32m﻿id,nombre,precio,stock,ludoteca,imagenes,destacado[m
[32m+[m[32mkadogemo,Kadogemo,12000,2,no,00b.webp 00c.webp,[m
[32m+[m[32mpalabreria,Palabrería,27500,1,sí,01b.webp 01c.webp,[m
[32m+[m[32mtridomino,Tridominó,55000,0,sí,02b.webp 02c.webp,[m
[32m+[m[32mlobos,Lobos,60000,0,sí,03b.webp 03c.webp,[m
[32m+[m[32mbusywood,BusyWood,25000,5,no,04b.webp 04c.webp,[m
[32m+[m[32mpor-que-siempre-yo,¿Por qué siempre yo?,30000,1,no,05b.webp,[m
[32m+[m[32mdobble,Dobble,50000,0,sí,06b.webp 06c.webp,[m
[32m+[m[32mfantasma-blitz,Fantasma Blitz,128900,1,sí,07b.webp 07c.webp,[m
[32m+[m[32mpinguinos,Pingüinos,30000,1,sí,,[m
[32m+[m[32mhanabi,Hanabi,45000,1,sí,09b.webp 09c.webp,[m
[32m+[m[32mvirus,Virus!,45000,0,sí,10b.webp 10c.webp,[m
[32m+[m[32magilizate,Agilízate,30000,0,no,11b.webp,[m
[32m+[m[32msushi-go,Sushi Go!,79900,0,sí,12b.webp 12c.webp,[m
[32m+[m[32mtaco-gato,Taco Gato,76900,0,sí,13b.webp 13c.webp,[m
[32m+[m[32mritmo-y-bola,Ritmo y Bola,68000,0,no,14b.webp 14c.webp,[m
[32m+[m[32mbendito-7,Bendito 7,60000,1,no,15b.webp 15c.webp,[m
[32m+[m[32mcosechas,Cosechas,60000,0,no,16b.webp 16c.webp,[m
[32m+[m[32mtoma-6,Toma 6,65000,0,no,17b.webp 17c.webp,[m
[32m+[m[32mdados,Dados,12000,2,sí,18b.webp 18c.webp,[m
[32m+[m[32mflip-7,Flip 7,40000,1,sí,19b.webp 19c.webp,[m
[32m+[m[32mpelusas,Pelusas,45000,1,sí,20b.webp 20c.webp,[m
[32m+[m[32mtacta,Tacta,33000,1,sí,21b.webp 21c.webp,[m
[32m+[m[32mnesting-doll-triqui,Nesting Doll (Triqui),33000,1,no,22c.webp,[m
[32m+[m[32mcatan,Catan,250000,0,no,23b.webp 23c.webp,[m
[32m+[m[32mmariposas,Mariposas,200000,1,no,24b.webp 24c.webp,[m
[32m+[m[32mcarcassonne,Carcassonne,177000,1,sí,25b.webp 25c.webp,sí[m
[32m+[m[32msavernake-forest,Savernake Forest,95000,1,sí,26b.webp 26c.webp,[m
[32m+[m[32mfritanga,Fritanga,125000,1,no,27b.webp 27c.webp,[m
[32m+[m[32mdog,Dog,30000,1,sí,28b.webp 28c.webp,[m
[32m+[m[32mtetra-tower,Tetra Tower,35000,0,no,,[m
[32m+[m[32mbattle-wood,Battle Wood,33000,2,no,30b.webp,[m
[32m+[m[32mwalkie-talkie,Walkie Talkie,60000,1,sí,31b.webp 31c.webp,[m
[32m+[m[32mmente-vacuna,Mente Vacuna,125000,4,sí,32b.webp 32c.webp,[m
[32m+[m[32mgansferatu,Gansferatu,70000,1,sí,33b.webp 33c.webp,[m
[32m+[m[32mflores,Flores,89000,2,sí,34b.webp 34c.webp,[m
[32m+[m[32mvilla-panda,Villa Panda,110000,3,sí,35b.webp 35c.webp,[m
[32m+[m[32mthe-game,The Game,70000,2,sí,36b.webp 36c.webp,[m
[32m+[m[32mque-gonorrea,¡Qué Gonorrea!,80000,0,sí,37b.webp 37c.webp,[m
[32m+[m[32mteto,¡Teto!,100000,0,sí,38b.webp 38c.webp,[m
[32m+[m[32mla-cuenta,La Cuenta,92000,3,sí,39b.webp 39c.webp,[m
[32m+[m[32mmagic-maze,Magic Maze,195000,1,sí,40b.webp 40c.webp,sí[m
[32m+[m[32mquita-esa-mano,¡Quita esa mano!,80000,0,sí,41b.webp 41c.webp,[m
[32m+[m[32mvudu,Vudú,150000,0,sí,42b.webp 42c.webp,[m
[32m+[m[32mmacho,Macho,170000,1,sí,43b.webp,[m
[32m+[m[32mfiesta-de-calcetines,Fiesta de Calcetines,65000,1,sí,44b.webp,[m
[32m+[m[32martline,Artline,145000,2,sí,45b.webp 45c.webp,[m
[32m+[m[32mboop,Boop,160000,1,sí,46b.webp 46c.webp,[m
[32m+[m[32mwalpurgisnacht-la-danza-de-las-brujas,Walpurgisnacht: La danza de las brujas,50000,0,no,,[m
[32m+[m[32mabejas-las-ordenes-de-la-reina,Abejas: Las órdenes de la reina,109000,3,sí,48b.webp 48c.webp,[m
[32m+[m[32mcompostate-bien,Compóstate bien,125000,3,sí,49b.webp 49c.webp,[m
[32m+[m[32mllamagedon,Llamagedón,95000,3,sí,50b.webp 50c.webp,[m
[32m+[m[32manda-a-lavar,Anda a lavar,75000,2,sí,51b.webp 51c.webp,[m
[32m+[m[32mscout,Scout,80000,3,sí,52b.webp 52c.webp,[m
[32m+[m[32mbarrio,Barrio,75000,2,sí,53b.webp 53c.webp,[m
[32m+[m[32mdraftosaurus,Draftosaurus,120000,2,sí,54b.webp 54c.webp,sí[m
[32m+[m[32mabuela-co,Abuela Co.,108900,3,sí,55b.webp 55c.webp,[m
[32m+[m[32mguanga,Guanga,113900,3,sí,56b.webp 56c.webp,[m
[32m+[m[32mbim-bam-bum,Bim Bam Bum,80000,4,sí,57b.webp 57c.webp,[m
[32m+[m[32mpostres,Postres,120000,3,sí,58b.webp 58c.webp,[m
[32m+[m[32mregroup-chicken-army,ReGroup: Chicken Army,75000,5,sí,59b.webp 59c.webp,[m
[32m+[m[32mcoral,Coral,170000,1,no,60b.webp 60c.webp,[m
[32m+[m[32mpaddy,Paddy,195000,1,no,61b.webp 61c.webp,[m
[32m+[m[32mensemble,Ensemble,160000,2,no,62b.webp 62c.webp,[m
[32m+[m[32mvoodoom,Voodoom,85000,2,no,63b.webp 63c.webp,[m
[32m+[m[32mbrujeria,¡Brujería!,150000,2,no,64b.webp 64c.webp,[m
[32m+[m[32mworm-up,Worm Up,110000,1,sí,65b.webp 65c.webp,[m
[32m+[m[32maventureros-al-tren,Aventureros al Tren,280000,1,sí,,[m
[32m+[m[32mbandido,Bandido,50000,4,sí,67b.webp 67c.webp,[m
[32m+[m[32mcakes,Cakes!,150000,2,no,68b.webp 68c.webp,[m
[32m+[m[32mcoffee-rush,Coffee Rush,215000,1,sí,69b.webp 69c.webp,[m
[32m+[m[32mdixit-classic,Dixit Classic,180000,1,sí,70b.webp 70c.webp,[m
[32m+[m[32mp-de-pizza,P de Pizza,85000,2,sí,71b.webp 71c.webp,[m
[32m+[m[32mpalabra-de-pirata,Palabra de Pirata,95000,2,sí,72b.webp 72c.webp,[m
[32m+[m[32mroot-juego-base,Root (juego base),410000,1,sí,73b.webp 73c.webp,[m
[32m+[m[32msplendor-nueva-edicion,Splendor (nueva edición),185000,1,no,74b.webp 74c.webp,[m
[32m+[m[32msurvive-the-island,Survive the Island,195000,1,no,75b.webp 75c.webp,[m
[32m+[m[32msurvive-the-island-expansion-monstruosa,Survive the Island: expansión monstruosa,95000,1,no,76b.webp 76c.webp,[m
[32m+[m[32mtake-time,Take Time,165000,0,sí,77b.webp 77c.webp,[m
[32m+[m[32mmal-trago,Mal Trago,102000,2,no,78b.webp 78c.webp,[m
[32m+[m[32mno-puedes-decir-eh,No puedes decir Eh,130000,5,sí,79b.webp 79c.webp,[m
[32m+[m[32msalem,Salem,159000,3,sí,80b.webp 80c.webp,[m
[32m+[m[32mwisp,Wisp,50000,2,sí,,[m
[32m+[m[32mque-gonorrea-1-5,¡Qué Gonorrea! 1.5,79900,4,sí,82b.webp 82c.webp,[m
[32m+[m[32mrummy-familiar,Rummy familiar,70000,1,no,83b.webp 83c.webp,[m
[32m+[m[32mtorre-de-bloques,Torre de bloques,50000,1,no,84b.webp 84c.webp,[m
[32m+[m[32mdominoes,Dominoes,38000,2,no,85b.webp 85c.webp,[m
[32m+[m[32mkoko,Koko,45000,1,no,86b.webp 86c.webp,[m
[32m+[m[32mbasta,¡Basta!,29900,1,no,87b.webp 87c.webp,[m
[1mdiff --git a/src/components/About.tsx b/src/components/About.tsx[m
[1mindex 02c6366..37339f5 100644[m
[1m--- a/src/components/About.tsx[m
[1m+++ b/src/components/About.tsx[m
[36m@@ -2,6 +2,7 @@[m [mimport { SITE } from "../data/site";[m
 import { waLink } from "../lib/utils";[m
 import { Instagram, Mail, Pin, WhatsApp } from "./icons";[m
 import { Logo } from "./Header";[m
[32m+[m[32mimport { useStore } from "../store";[m
 import { buttonClass, Kicker, Reveal } from "./ui";[m
 [m
 const TEAM = [[m
[36m@@ -96,11 +97,17 @@[m [mexport function Contact() {[m
   );[m
 }[m
 [m
[32m+[m[32mconst formatDate = (iso: string) => {[m
[32m+[m[32m  const [y, m, d] = iso.split("-").map(Number);[m
[32m+[m[32m  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });[m
[32m+[m[32m};[m
[32m+[m
 export function Footer() {[m
[32m+[m[32m  const { updated } = useStore();[m
   return ([m
     <footer className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line px-4 py-8 text-[12.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">[m
       <Logo />[m
[31m-      <p>Precios en pesos colombianos. Catálogo actualizado al 2 de noviembre de 2026.</p>[m
[32m+[m[32m      <p>Precios en pesos colombianos. Catálogo actualizado al {formatDate(updated)}.</p>[m
       <p>© {new Date().getFullYear()} EnLaJuega</p>[m
     </footer>[m
   );[m
[1mdiff --git a/src/components/Hero.tsx b/src/components/Hero.tsx[m
[1mindex 7bc0a39..17279e2 100644[m
[1m--- a/src/components/Hero.tsx[m
[1m+++ b/src/components/Hero.tsx[m
[36m@@ -3,7 +3,8 @@[m [mimport { useStore } from "../store";[m
 import { Arrow } from "./icons";[m
 import { buttonClass, GameCover } from "./ui";[m
 [m
[31m-const FAN = ["dixit-classic", "carcassonne", "splendor-nueva-edicion", "magic-maze", "draftosaurus"];[m
[32m+[m[32m// El abanico admite hasta 5 cartas; con más se sale del contenedor.[m
[32m+[m[32mconst FAN_MAX = 5;[m
 const ease = [0.23, 1, 0.32, 1] as const;[m
 [m
 const container: Variants = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };[m
[36m@@ -13,9 +14,11 @@[m [mconst item: Variants = {[m
 };[m
 [m
 export function Hero() {[m
[31m-  const { openProduct, catalog, games } = useStore();[m
[32m+[m[32m  const { openProduct, catalog } = useStore();[m
   const inStock = catalog.filter((g) => g.stock > 0).length;[m
[31m-  const fan = FAN.map((id) => games.get(id)!).filter(Boolean);[m
[32m+[m[32m  // Juegos marcados como "destacado" en la hoja; si no hay ninguno, los primeros con stock y foto.[m
[32m+[m[32m  const featured = catalog.filter((g) => g.featured);[m
[32m+[m[32m  const fan = (featured.length ? featured : catalog.filter((g) => g.stock > 0 && g.images.length)).slice(0, FAN_MAX);[m
 [m
   return ([m
     <section id="inicio" className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 md:pt-20 md:pb-24">[m
[1mdiff --git a/src/data/catalog.ts b/src/data/catalog.ts[m
[1mindex dc12ba6..92f807d 100644[m
[1m--- a/src/data/catalog.ts[m
[1m+++ b/src/data/catalog.ts[m
[36m@@ -1,6 +1,9 @@[m
[31m-export type Game = { id: string; name: string; price: number; stock: number; ludoteca: boolean; images: string[] };[m
[32m+[m[32mexport type Game = { id: string; name: string; price: number; stock: number; ludoteca: boolean; images: string[]; featured?: boolean };[m
 [m
[31m-// Catálogo actualizado al 02/11/2026. price en COP, stock = copias disponibles,[m
[32m+[m[32m/** Fecha de esta copia de respaldo; se muestra en el pie si la hoja no trae la columna "actualizado". */[m
[32m+[m[32mexport const CATALOG_UPDATED = "2026-11-02";[m
[32m+[m
[32m+[m[32m// Catálogo de respaldo. price en COP, stock = copias disponibles,[m
 // ludoteca = se puede probar en la Casita antes de comprar.[m
 export const CATALOG: Game[] = [[m
   {"id":"kadogemo","name":"Kadogemo","price":12000,"stock":2,"ludoteca":false,"images":["assets/games/00b.webp","assets/games/00c.webp"]},[m
[36m@@ -28,7 +31,7 @@[m [mexport const CATALOG: Game[] = [[m
   {"id":"nesting-doll-triqui","name":"Nesting Doll (Triqui)","price":33000,"stock":1,"ludoteca":false,"images":["assets/games/22c.webp"]},[m
   {"id":"catan","name":"Catan","price":250000,"stock":0,"ludoteca":false,"images":["assets/games/23b.webp","assets/games/23c.webp"]},[m
   {"id":"mariposas","name":"Mariposas","price":200000,"stock":1,"ludoteca":false,"images":["assets/games/24b.webp","assets/games/24c.webp"]},[m
[31m-  {"id":"carcassonne","name":"Carcassonne","price":177000,"stock":1,"ludoteca":true,"images":["assets/games/25b.webp","assets/games/25c.webp"]},[m
[32m+[m[32m  {"id":"carcassonne","name":"Carcassonne","price":177000,"stock":1,"ludoteca":true,"images":["assets/games/25b.webp","assets/games/25c.webp"],"featured":true},[m
   {"id":"savernake-forest","name":"Savernake Forest","price":95000,"stock":1,"ludoteca":true,"images":["assets/games/26b.webp","assets/games/26c.webp"]},[m
   {"id":"fritanga","name":"Fritanga","price":125000,"stock":1,"ludoteca":false,"images":["assets/games/27b.webp","assets/games/27c.webp"]},[m
   {"id":"dog","name":"Dog","price":30000,"stock":1,"ludoteca":true,"images":["assets/games/28b.webp","assets/games/28c.webp"]},[m
[36m@@ -43,7 +46,7 @@[m [mexport const CATALOG: Game[] = [[m
   {"id":"que-gonorrea","name":"¡Qué Gonorrea!","price":80000,"stock":0,"ludoteca":true,"images":["assets/games/37b.webp","assets/games/37c.webp"]},[m
   {"id":"teto","name":"¡Teto!","price":100000,"stock":0,"ludoteca":true,"images":["assets/games/38b.webp","assets/games/38c.webp"]},[m
   {"id":"la-cuenta","name":"La Cuenta","price":92000,"stock":3,"ludoteca":true,"images":["assets/games/39b.webp","assets/games/39c.webp"]},[m
[31m-  {"id":"magic-maze","name":"Magic Maze","price":195000,"stock":1,"ludoteca":true,"images":["assets/games/40b.webp","assets/games/40c.webp"]},[m
[32m+[m[32m  {"id":"magic-maze","name":"Magic Maze","price":195000,"stock":1,"ludoteca":true,"images":["assets/games/40b.webp","assets/games/40c.webp"],"featured":true},[m
   {"id":"quita-esa-mano","name":"¡Quita esa mano!","price":80000,"stock":0,"ludoteca":true,"images":["assets/games/41b.webp","assets/games/41c.webp"]},[m
   {"id":"vudu","name":"Vudú","price":150000,"stock":0,"ludoteca":true,"images":["assets/games/42b.webp","assets/games/42c.webp"]},[m
   {"id":"macho","name":"Macho","price":170000,"stock":1,"ludoteca":true,"images":["assets/games/43b.webp"]},[m
[36m@@ -57,7 +60,7 @@[m [mexport const CATALOG: Game[] = [[m
   {"id":"anda-a-lavar","name":"Anda a lavar","price":75000,"stock":2,"ludoteca":true,"images":["assets/games/51b.webp","assets/games/51c.webp"]},[m
   {"id":"scout","name":"Scout","price":80000,"stock":3,"ludoteca":true,"images":["assets/games/52b.webp","assets/games/52c.webp"]},[m
   {"id":"barrio","name":"Barrio","price":75000,"stock":2,"ludoteca":true,"images":["assets/games/53b.webp","assets/games/53c.webp"]},[m
[31m-  {"id":"draftosaurus","name":"Draftosaurus","price":120000,"stock":2,"ludoteca":true,"images":["assets/games/54b.webp","assets/games/54c.webp"]},[m
[32m+[m[32m  {"id":"draftosaurus","name":"Draftosaurus","price":120000,"stock":2,"ludoteca":true,"images":["assets/games/54b.webp","assets/games/54c.webp"],"featured":true},[m
   {"id":"abuela-co","name":"Abuela Co.","price":108900,"stock":3,"ludoteca":true,"images":["assets/games/55b.webp","assets/games/55c.webp"]},[m
   {"id":"guanga","name":"Guanga","price":113900,"stock":3,"ludoteca":true,"images":["assets/games/56b.webp","assets/games/56c.webp"]},[m
   {"id":"bim-bam-bum","name":"Bim Bam Bum","price":80000,"stock":4,"ludoteca":true,"images":["assets/games/57b.webp","assets/games/57c.webp"]},[m
[1mdiff --git a/src/lib/sheet.ts b/src/lib/sheet.ts[m
[1mindex 5c6de1c..7064464 100644[m
[1m--- a/src/lib/sheet.ts[m
[1m+++ b/src/lib/sheet.ts[m
[36m@@ -1,4 +1,6 @@[m
 import type { Game } from "../data/catalog";[m
[32m+[m
[32m+[m[32mexport type SheetCatalog = { games: Game[]; updated: string | null };[m
 import { normalize, storage } from "./utils";[m
 [m
 // Lee el catálogo desde una hoja de Google Sheets publicada como CSV[m
[36m@@ -12,6 +14,10 @@[m [mimport { normalize, storage } from "./utils";[m
 //   ludoteca  sí / no (también vale TRUE/FALSE de una casilla de verificación, x, 1)[m
 //   imagenes  nombres de archivo de public/assets/games ("07b.webp 07c.webp")[m
 //             o URLs completas, separados por espacio o coma[m
[32m+[m[32m//   destacado opcional; "sí" = aparece en el abanico del inicio (máximo 5, en el orden de la hoja)[m
[32m+[m[32m//   actualizado opcional; fecha de la última edición de la hoja (AAAA-MM-DD o DD/MM/AAAA).[m
[32m+[m[32m//             Se toma el primer valor no vacío de la columna. La escribe automáticamente[m
[32m+[m[32m//             el Apps Script del README en cada edición.[m
 [m
 const CACHE_KEY = "elj-catalog";[m
 [m
[36m@@ -62,8 +68,19 @@[m [mconst YES = new Set(["si", "s", "x", "true", "verdadero", "1", "yes"]);[m
 [m
 const toImage = (s: string) => (/^https?:\/\//i.test(s) || s.startsWith("assets/") ? s : `assets/games/${s}`);[m
 [m
[32m+[m[32mconst pad = (n: number) => String(n).padStart(2, "0");[m
[32m+[m
[32m+[m[32m/** Normaliza "2026-11-07", "2026-11-07T10:00…" o "7/11/2026 10:00" a "2026-11-07". */[m
[32m+[m[32mexport function toISODate(s: string): string | null {[m
[32m+[m[32m  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);[m
[32m+[m[32m  if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;[m
[32m+[m[32m  m = s.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);[m
[32m+[m[32m  if (m && +m[2] <= 12) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;[m
[32m+[m[32m  return null;[m
[32m+[m[32m}[m
[32m+[m
 /** Convierte el CSV en juegos. Lanza un error si la hoja no tiene el formato esperado. */[m
[31m-export function csvToCatalog(text: string): Game[] {[m
[32m+[m[32mexport function csvToCatalog(text: string): SheetCatalog {[m
   const [header, ...rows] = parseCSV(text);[m
   if (!header) throw new Error("Hoja vacía");[m
   const col = Object.fromEntries(header.map((h, i) => [normalize(h.trim()).replace(/\s+/g, ""), i]));[m
[36m@@ -72,7 +89,9 @@[m [mexport function csvToCatalog(text: string): Game[] {[m
   const get = (r: string[], name: string) => (col[name] === undefined ? "" : (r[col[name]] ?? "").trim());[m
   const seen = new Set<string>();[m
   const games: Game[] = [];[m
[32m+[m[32m  let updated: string | null = null;[m
   for (const r of rows) {[m
[32m+[m[32m    updated ??= toISODate(get(r, "actualizado"));[m
     const name = get(r, "nombre");[m
     const price = toInt(get(r, "precio"));[m
     if (!name || Number.isNaN(price)) continue;[m
[36m@@ -87,22 +106,25 @@[m [mexport function csvToCatalog(text: string): Game[] {[m
       stock: Number.isNaN(stock) ? 0 : stock,[m
       ludoteca: YES.has(normalize(get(r, "ludoteca"))),[m
       images: get(r, "imagenes").split(/[\s,]+/).filter(Boolean).map(toImage),[m
[32m+[m[32m      ...(YES.has(normalize(get(r, "destacado"))) && { featured: true }),[m
     });[m
   }[m
   if (!games.length) throw new Error("La hoja no tiene juegos válidos");[m
[31m-  return games;[m
[32m+[m[32m  return { games, updated };[m
 }[m
 [m
[31m-export async function fetchCatalog(url: string): Promise<Game[]> {[m
[32m+[m[32mexport async function fetchCatalog(url: string): Promise<SheetCatalog> {[m
   const res = await fetch(url, { cache: "no-store" });[m
   if (!res.ok) throw new Error(`HTTP ${res.status}`);[m
[31m-  const games = csvToCatalog(await res.text());[m
[31m-  storage.set(CACHE_KEY, games);[m
[31m-  return games;[m
[32m+[m[32m  const data = csvToCatalog(await res.text());[m
[32m+[m[32m  storage.set(CACHE_KEY, data);[m
[32m+[m[32m  return data;[m
 }[m
 [m
 /** Última versión descargada de la hoja (o null si nunca se ha descargado). */[m
[31m-export const cachedCatalog = () => {[m
[31m-  const c = storage.get<Game[] | null>(CACHE_KEY, null);[m
[31m-  return Array.isArray(c) && c.length ? c : null;[m
[32m+[m[32mexport const cachedCatalog = (): SheetCatalog | null => {[m
[32m+[m[32m  const c = storage.get<SheetCatalog | Game[] | null>(CACHE_KEY, null);[m
[32m+[m[32m  // Formato antiguo de la caché: solo el arreglo de juegos.[m
[32m+[m[32m  if (Array.isArray(c)) return c.length ? { games: c, updated: null } : null;[m
[32m+[m[32m  return c && Array.isArray(c.games) && c.games.length ? { games: c.games, updated: c.updated ?? null } : null;[m
 };[m
[1mdiff --git a/src/store.tsx b/src/store.tsx[m
[1mindex 913ee65..d9886ee 100644[m
[1m--- a/src/store.tsx[m
[1m+++ b/src/store.tsx[m
[36m@@ -1,11 +1,13 @@[m
 import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";[m
[31m-import { CATALOG, type Game } from "./data/catalog";[m
[32m+[m[32mimport { CATALOG, CATALOG_UPDATED, type Game } from "./data/catalog";[m
 import { SITE } from "./data/site";[m
 import { cachedCatalog, fetchCatalog } from "./lib/sheet";[m
 import { storage } from "./lib/utils";[m
 [m
 type Store = {[m
   catalog: Game[];[m
[32m+[m[32m  /** Fecha (AAAA-MM-DD) de la última actualización del catálogo. */[m
[32m+[m[32m  updated: string;[m
   games: Map<string, Game>;[m
   items: Record<string, number>;[m
   count: number;[m
[36m@@ -38,7 +40,9 @@[m [mfunction sanitize(cart: Record<string, number>, games: Map<string, Game>) {[m
 export function StoreProvider({ children }: { children: ReactNode }) {[m
   // Arranca con la última copia descargada de la hoja (o el catálogo incluido en el sitio)[m
   // y se actualiza en cuanto llega la versión fresca.[m
[31m-  const [catalog, setCatalog] = useState<Game[]>(() => cachedCatalog() ?? CATALOG);[m
[32m+[m[32m  const [initial] = useState(cachedCatalog);[m
[32m+[m[32m  const [catalog, setCatalog] = useState<Game[]>(initial?.games ?? CATALOG);[m
[32m+[m[32m  const [updated, setUpdated] = useState(initial?.updated ?? CATALOG_UPDATED);[m
   const games = useMemo(() => toMap(catalog), [catalog]);[m
   const [items, setItems] = useState(() => sanitize(storage.get("elj-cart", {}), games));[m
   const [cartOpen, setCartOpen] = useState(false);[m
[36m@@ -51,9 +55,10 @@[m [mexport function StoreProvider({ children }: { children: ReactNode }) {[m
     if (!SITE.catalogSheetUrl) return;[m
     let alive = true;[m
     fetchCatalog(SITE.catalogSheetUrl)[m
[31m-      .then((next) => {[m
[32m+[m[32m      .then(({ games: next, updated }) => {[m
         if (!alive) return;[m
         setCatalog(next);[m
[32m+[m[32m        setUpdated(updated ?? CATALOG_UPDATED);[m
         setItems((prev) => sanitize(prev, toMap(next)));[m
       })[m
       .catch((err) => console.warn("[catálogo] No se pudo leer la hoja, se usa la copia local.", err));[m
[36m@@ -81,6 +86,7 @@[m [mexport function StoreProvider({ children }: { children: ReactNode }) {[m
     const entries = Object.entries(items).filter(([id]) => games.has(id));[m
     return {[m
       catalog,[m
[32m+[m[32m      updated,[m
       games,[m
       items,[m
       count: entries.reduce((a, [, q]) => a + q, 0),[m
[36m@@ -95,7 +101,7 @@[m [mexport function StoreProvider({ children }: { children: ReactNode }) {[m
       bookingId,[m
       openBooking: setBookingId,[m
     };[m
[31m-  }, [catalog, games, items, setQty, cartOpen, productId, bookingId]);[m
[32m+[m[32m  }, [catalog, updated, games, items, setQty, cartOpen, productId, bookingId]);[m
 [m
   return <Ctx.Provider value={value}>{children}</Ctx.Provider>;[m
 }[m
