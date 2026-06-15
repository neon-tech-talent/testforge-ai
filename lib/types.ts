// ============================================================
// TIPOS GLOBALES DE TESTFORGE AI
// ============================================================

export type TipoDoc = "HU" | "Figma" | "PDF" | "MD" | "Texto";

export type TipoAccion = "bateria_tests" | "rellenado_formulario";

export type EstadoEjecucion =
  | "pendiente"
  | "en_progreso"
  | "completado"
  | "fallido";

export type TipoPrueba =
  | "funcional"
  | "formulario"
  | "estres"
  | "diseno"
  | "seguridad"
  | "ortografia"
  | "accesibilidad"
  | "links_rotos";

export type NivelSeveridad = "critico" | "advertencia" | "info" | "exito";

// ============================================================
// ENTIDADES DE BASE DE DATOS
// ============================================================

export interface Proyecto {
  id: string;
  nombre: string;
  url_sitio: string;
  repo_github?: string | null;
  descripcion?: string | null;
  session_id: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Documentacion {
  id: string;
  proyecto_id: string;
  tipo_doc: TipoDoc;
  nombre_archivo?: string | null;
  contenido_texto_o_url: string;
  tamanio_bytes?: number | null;
  creado_en: string;
}

export interface DatosFormulario {
  id: string;
  proyecto_id: string;
  nombre_set: string;
  descripcion?: string | null;
  datos_json: Record<string, string>[];
  creado_en: string;
}

export interface EjecucionTest {
  id: string;
  proyecto_id: string;
  tipo_accion: TipoAccion;
  estado: EstadoEjecucion;
  modulos_activos: string[];
  configuracion_json: ConfiguracionEjecucion;
  progreso: number;
  iniciado_en: string;
  finalizado_en?: string | null;
  logs_consola: LogConsola[];
}

export interface ResultadoTest {
  id: string;
  ejecucion_id: string;
  tipo_prueba: TipoPrueba;
  nivel_severidad: NivelSeveridad;
  descripcion_error: string;
  componente_afectado_html?: string | null;
  url_afectada?: string | null;
  captura_pantalla_url?: string | null;
  codigo_solucion_sugerido?: string | null;
  lenguaje_codigo?: string | null;
  metadatos_adicionales?: Record<string, unknown>;
  creado_en: string;
}

// ============================================================
// CONFIGURACIÓN DE EJECUCIÓN
// ============================================================

export interface ConfiguracionEjecucion {
  // Módulo de estrés
  peticiones_concurrentes?: number;
  duracion_segundos?: number;
  // Módulo de formularios
  set_datos_id?: string;
  // Módulo funcional
  flujos_detectados?: string[];
  // General
  url_objetivo?: string;

  // Control de ejecución y progreso
  modulo_actual?: string | null;
  skip_requested?: boolean;
  modulos_saltados?: string[];
  progreso_modulos?: Record<string, number>;
}

export interface LogConsola {
  timestamp: string;
  nivel: "info" | "warn" | "error" | "success" | "system";
  mensaje: string;
  modulo?: string;
}

// ============================================================
// CONFIGURACIÓN DE MÓDULOS
// ============================================================

export interface ModuloConfig {
  id: TipoPrueba;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  activo: boolean;
  requiereDoc?: boolean;
  requiereStress?: boolean;
  requiereFormData?: boolean;
}

export const MODULOS: ModuloConfig[] = [
  {
    id: "funcional",
    nombre: "Pruebas Funcionales",
    descripcion: "Análisis de HU y generación de flujos de testing automático",
    icono: "⚡",
    color: "cyan",
    activo: true,
    requiereDoc: true,
  },
  {
    id: "formulario",
    nombre: "Automatización de Formularios",
    descripcion: "Mapeo y rellenado inteligente con datos reales",
    icono: "📋",
    color: "purple",
    activo: false,
    requiereFormData: true,
  },
  {
    id: "estres",
    nombre: "Pruebas de Estrés y Carga",
    descripcion: "Simulación de tráfico concurrente con métricas k6",
    icono: "🔥",
    color: "amber",
    activo: false,
    requiereStress: true,
  },
  {
    id: "diseno",
    nombre: "Regresión Visual",
    descripcion: "Capturas en 3 viewports y análisis de desajustes estéticos",
    icono: "🎨",
    color: "green",
    activo: false,
  },
  {
    id: "seguridad",
    nombre: "Seguridad Automatizada",
    descripcion: "Escáner de vulnerabilidades web comunes (OWASP)",
    icono: "🛡️",
    color: "red",
    activo: false,
  },
  {
    id: "ortografia",
    nombre: "Ortografía y Gramática",
    descripcion: "Análisis lingüístico completo del contenido visible",
    icono: "✍️",
    color: "cyan",
    activo: false,
  },
  {
    id: "accesibilidad",
    nombre: "Accesibilidad y SEO",
    descripcion: "Auditoría WCAG, contraste, aria-labels y meta-tags",
    icono: "♿",
    color: "green",
    activo: false,
  },
  {
    id: "links_rotos",
    nombre: "Enlaces Rotos",
    descripcion: "Rastreo e indexación de todos los hipervínculos del sitio",
    icono: "🔗",
    color: "amber",
    activo: false,
  },
];

// ============================================================
// ESTADÍSTICAS DE DASHBOARD
// ============================================================

export interface DashboardStats {
  total_proyectos: number;
  total_ejecuciones: number;
  ejecuciones_completadas: number;
  score_promedio: number;
}

// ============================================================
// RESPUESTAS DE API
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
