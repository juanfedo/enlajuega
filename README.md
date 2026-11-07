# EnLaJuega — sitio web

React 19 + Vite + TypeScript + Tailwind CSS v4. Interacciones con `motion`, hojas deslizables con `vaul` y notificaciones con `sonner`.

## Comandos

```bash
npm install      # primera vez
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera /dist listo para subir (Netlify, Vercel, GitHub Pages…)
```

## Dónde editar

| Archivo | Para qué |
| --- | --- |
| Hoja de Google Sheets | Catálogo en vivo (ver abajo). |
| `src/data/catalog.ts` | Copia de respaldo del catálogo, usada si la hoja no responde o `catalogSheetUrl` está vacío. |
| `src/data/site.ts` | Enlace de la hoja (`catalogSheetUrl`), WhatsApp, correo, Instagram, puntos de entrega y servicios con precios. |
| `public/assets/games/` | Fotos de cada juego: `NNb.webp` (caja) y `NNc.webp` (componentes). |
| `public/assets/photos/` | Fotos del portafolio. |
| `src/index.css` | Paleta de colores y tipografías (bloque `@theme`). |

- Con `stock: 0` el juego aparece como *Agotado* con botón "Encargar".
- Sin foto, se genera una portada de color con el nombre.

## Cómo funciona la compra

El carrito se guarda en el navegador del cliente. Al finalizar, se abre WhatsApp (+57 310 433 2533) con el pedido, el subtotal, los datos y el tipo de entrega. El pago y el envío se confirman por ese chat. Las reservas de servicios funcionan igual.

## Catálogo desde Google Sheets

El catálogo se lee al abrir la página desde una hoja de Google Sheets, así que cambiar precios o stock **no requiere volver a desplegar**.

1. Importa `catalogo.csv` en una hoja nueva (Archivo → Importar → Subir).
2. Archivo → Compartir → **Publicar en la web** → elige la pestaña y el formato **CSV** → Publicar. Copia el enlace.
3. Pega el enlace en `catalogSheetUrl` de `src/data/site.ts`, ejecuta `npm run build` y sube `dist/` una última vez.

Columnas: `id` (opcional), `nombre`, `precio`, `stock`, `ludoteca` (sí/no o casilla), `imagenes` (archivos de `public/assets/games/` como `07b.webp 07c.webp`, o URLs completas). Las filas sin nombre o sin precio se ignoran. Google tarda unos minutos en reflejar los cambios en el CSV publicado.

No cambies el `id` de un juego existente: es lo que identifica el producto en el carrito de los clientes.
