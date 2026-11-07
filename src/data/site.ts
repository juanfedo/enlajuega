// Datos de contacto y portafolio de servicios. Edita aquí precios y textos.
export const SITE = {
  whatsapp: "573104332533",
  phoneLabel: "+57 310 433 2533",
  email: "EnlaJuega111@gmail.com",
  instagram: "enlajuega.ald",
  // Enlace CSV de la hoja de Google Sheets con el catálogo (Archivo → Compartir → Publicar en la web → CSV).
  // Vacío = se usa src/data/catalog.ts. Ver src/lib/sheet.ts para el formato de columnas.
  catalogSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRj3mHC90g3efYOekCjTajJHghf7LBasWf9sqbZW6BZ0S1mglQ_aNsIOda-pK1Hln6uUP6ONKhA4TtI/pub?gid=801094766&single=true&output=csv",
  points: [
    { id: "p1", label: "Punto 1", address: "Carrera 9na #13-145" },
    { id: "p2", label: "Punto 2", address: "Calle 18e #24-49" },
  ],
};

export type Unit = "persona" | "hora" | "sesion";

export type Service = {
  id: string;
  name: string;
  price: number | null; // null = a convenir
  unit: Unit;
  includes: string[];
  featured?: boolean;
};

export type ServiceGroup = { id: string; label: string; blurb: string; items: Service[] };

export const UNIT_LABEL: Record<Unit, string> = {
  persona: "por persona",
  hora: "por hora",
  sesion: "por sesión",
};

export const SERVICES: ServiceGroup[] = [
  {
    id: "ludoteca",
    label: "Ludoteca",
    blurb: "Tres horas de juego con una ludoteca curada y probada por nosotros.",
    items: [
      {
        id: "casita",
        name: "Casita EnLaJuega",
        price: 15000,
        unit: "persona",
        featured: true,
        includes: ["Tiempo 3 horas", "Acceso a ludoteca con al menos 60 juegos probados"],
      },
      {
        id: "itinerante",
        name: "Ludoteca Itinerante",
        price: 25000,
        unit: "persona",
        includes: ["Tiempo 3 horas", "Vamos a tu casa o a tu espacio", "Adaptación de juegos para adultos mayores y PcD"],
      },
    ],
  },
  {
    id: "experiencias",
    label: "Experiencias lúdicas",
    blurb: "Para empresas, ONG, instituciones educativas y organizaciones con o sin ánimo de lucro.",
    items: [
      {
        id: "exp-casita",
        name: "Asesoría en Casita",
        price: 40000,
        unit: "hora",
        includes: ["Revisión de la solicitud", "Muestra pedagógica", "Acuerdos de servicio"],
      },
      {
        id: "exp-espacio",
        name: "Asesoría en tu espacio",
        price: 60000,
        unit: "hora",
        featured: true,
        includes: ["Desplazamiento de ludoteca itinerante", "Revisión de la solicitud", "Muestra pedagógica", "Acuerdos de servicio"],
      },
    ],
  },
  {
    id: "terapeuticos",
    label: "Procesos terapéuticos",
    blurb: "Acompañamiento individual y comunitario. Más de 5 años de experiencia con infancias y adultos mayores.",
    items: [
      {
        id: "proc-individual",
        name: "Proceso individual",
        price: 80000,
        unit: "sesion",
        includes: ["Acompañamiento", "Recomendaciones", "Plan de manejo"],
      },
      {
        id: "proc-colectivo",
        name: "Colectivos, familias y parejas",
        price: 80000,
        unit: "persona",
        featured: true,
        includes: ["Acompañamiento", "Recomendaciones", "Plan de manejo"],
      },
      {
        id: "proc-comunitario",
        name: "De base comunitaria",
        price: null,
        unit: "persona",
        includes: ["Acuerdo de objetivos", "Planeación y ejecución de la jornada"],
      },
    ],
  },
  {
    id: "personalizados",
    label: "Juegos personalizados",
    blurb: "Creamos la mecánica de juegos de mesa para procesos educativos, organizativos y a la medida.",
    items: [
      {
        id: "jp-desarrollo",
        name: "Asesoría para desarrollo en Casita",
        price: 80000,
        unit: "sesion",
        includes: ["Acompañamiento", "Recomendaciones", "Plan de manejo"],
      },
      {
        id: "jp-asesoria",
        name: "Asesoría",
        price: 80000,
        unit: "persona",
        featured: true,
        includes: ["Acompañamiento", "Recomendaciones", "Plan de manejo"],
      },
      {
        id: "jp-comunitario",
        name: "De base comunitaria",
        price: null,
        unit: "persona",
        includes: ["Acuerdo de objetivos", "Planeación y ejecución de la jornada"],
      },
    ],
  },
  {
    id: "produccion",
    label: "Juego a la medida",
    blurb: "De la idea a tu propio juego de mesa: proyectamos y producimos contigo.",
    items: [
      {
        id: "jm-casita",
        name: "Asesoría en Casita",
        price: 40000,
        unit: "hora",
        includes: ["Revisión de la solicitud", "Proyección", "Acuerdos de servicio"],
      },
      {
        id: "jm-espacio",
        name: "Asesoría en tu espacio",
        price: 60000,
        unit: "hora",
        featured: true,
        includes: ["Desplazamiento con elementos para producción", "Revisión de la solicitud", "Proyección", "Acuerdos de servicio"],
      },
    ],
  },
];

export const ALL_SERVICES = new Map(
  SERVICES.flatMap((g) => g.items.map((s) => [s.id, { ...s, group: g.label }] as const)),
);
