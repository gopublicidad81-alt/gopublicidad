export type EstadoLead =
  | "nuevo"
  | "conversando"
  | "calificado"
  | "propuesta"
  | "negociacion"
  | "ganado"
  | "perdido"
  | "derivado";

export const ESTADOS: EstadoLead[] = [
  "nuevo",
  "conversando",
  "calificado",
  "propuesta",
  "negociacion",
  "ganado",
  "perdido",
  "derivado",
];

export const SECTORES = [
  "mineria",
  "energia",
  "industrial",
  "tecnologia",
  "salud",
  "alimentacion",
  "gobierno",
  "universidades",
  "otro",
  "desconocido",
] as const;

export const TIPOS_STAND = [
  "tradicional",
  "ecostand",
  "ministand",
  "exterior",
  "doble_piso",
  "desconocido",
] as const;

export interface Cliente {
  id: string;
  nombre: string | null;
  empresa: string | null;
  telefono: string | null;
  email: string | null;
  tipo_cliente: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendedor {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  cliente_id: string | null;
  vendedor_id: string | null;
  telefono: string | null;
  estado: EstadoLead;
  sector: string | null;
  tipo_stand: string | null;
  feria: string | null;
  m2: number | null;
  ciudad: string | null;
  fecha_evento: string | null;
  presupuesto_estimado: string | null;
  urgente: boolean;
  score: number;
  resumen: string | null;
  ubicacion: string | null;
  created_at: string;
  updated_at: string;
  cliente?: Cliente | null;
  vendedor?: Vendedor | null;
}

export interface Conversacion {
  id: string;
  lead_id: string;
  canal: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface Mensaje {
  id: string;
  conversacion_id: string;
  rol: string; // "usuario" | "asistente" | ...
  contenido: string | null;
  media: string | null;
  created_at: string;
}
