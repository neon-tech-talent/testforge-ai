// ============================================================
// MOTOR DE SIMULACIÓN DE TESTS - TestForge AI
// Genera resultados mock realistas para los 8 módulos
// ============================================================

import { TipoPrueba, ResultadoTest, LogConsola, NivelSeveridad } from "./types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ============================================================
// GENERADORES DE LOGS POR MÓDULO
// ============================================================

export function generarLogs(modulos: string[], url: string): LogConsola[] {
  const logs: LogConsola[] = [];
  const now = new Date();

  const addLog = (
    nivel: LogConsola["nivel"],
    mensaje: string,
    modulo?: string,
    offsetMs = 0
  ) => {
    logs.push({
      timestamp: new Date(now.getTime() + offsetMs).toISOString(),
      nivel,
      mensaje,
      modulo,
    });
  };

  addLog("system", "🚀 TestForge AI — Iniciando batería de agentes...", undefined, 0);
  addLog("info", `📡 URL objetivo: ${url}`, undefined, 200);
  addLog("info", `🔧 Módulos activos: ${modulos.join(", ")}`, undefined, 400);
  addLog("system", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", undefined, 600);

  let offset = 1000;

  if (modulos.includes("funcional")) {
    addLog("info", "⚡ [Funcional] Analizando Historias de Usuario...", "funcional", (offset += 500));
    addLog("info", "⚡ [Funcional] Extrayendo flujos de navegación...", "funcional", (offset += 1200));
    addLog("warn", "⚡ [Funcional] Flujo detectado: 'Registro de usuario' — 4 pasos", "funcional", (offset += 800));
    addLog("info", "⚡ [Funcional] Simulando clic en /registro → Esperando respuesta...", "funcional", (offset += 1000));
    addLog("success", "⚡ [Funcional] Flujo completado. 3 errores detectados.", "funcional", (offset += 600));
  }

  if (modulos.includes("formulario")) {
    addLog("info", "📋 [Formulario] Abriendo URL y extrayendo árbol HTML...", "formulario", (offset += 500));
    addLog("info", "📋 [Formulario] IA mapeando inputs del formulario...", "formulario", (offset += 1500));
    addLog("warn", "📋 [Formulario] Input #str_3 identificado como 'Teléfono'", "formulario", (offset += 700));
    addLog("info", "📋 [Formulario] Rellenando 3 registros de datos...", "formulario", (offset += 800));
    addLog("success", "📋 [Formulario] 3/3 formularios enviados exitosamente.", "formulario", (offset += 500));
  }

  if (modulos.includes("estres")) {
    addLog("info", "🔥 [Estrés] Generando script k6 dinámico...", "estres", (offset += 500));
    addLog("info", "🔥 [Estrés] Iniciando 50 VUs por 30 segundos...", "estres", (offset += 1000));
    addLog("warn", "🔥 [Estrés] P95 latencia: 843ms — Umbral superado", "estres", (offset += 2000));
    addLog("error", "🔥 [Estrés] 12 requests fallidos (tasa de error: 2.4%)", "estres", (offset += 800));
    addLog("success", "🔥 [Estrés] Análisis completado. Métricas guardadas.", "estres", (offset += 400));
  }

  if (modulos.includes("diseno")) {
    addLog("info", "🎨 [Diseño] Capturando viewport Desktop (1920x1080)...", "diseno", (offset += 500));
    addLog("info", "🎨 [Diseño] Capturando viewport Tablet (768x1024)...", "diseno", (offset += 1200));
    addLog("info", "🎨 [Diseño] Capturando viewport Mobile (375x812)...", "diseno", (offset += 800));
    addLog("warn", "🎨 [Diseño] Modelo de visión analizando desajustes...", "diseno", (offset += 2000));
    addLog("success", "🎨 [Diseño] 2 desajustes visuales detectados.", "diseno", (offset += 500));
  }

  if (modulos.includes("seguridad")) {
    addLog("info", "🛡️ [Seguridad] Iniciando escáner pasivo OWASP...", "seguridad", (offset += 500));
    addLog("warn", "🛡️ [Seguridad] Header 'X-Frame-Options' ausente", "seguridad", (offset += 1500));
    addLog("error", "🛡️ [Seguridad] Cookie sin flag 'Secure' detectada", "seguridad", (offset += 800));
    addLog("success", "🛡️ [Seguridad] Escáner completado. 4 vulnerabilidades.", "seguridad", (offset += 400));
  }

  if (modulos.includes("ortografia")) {
    addLog("info", "✍️ [Ortografía] Scrapeando textos visibles del sitio...", "ortografia", (offset += 500));
    addLog("info", "✍️ [Ortografía] IA analizando 2.847 palabras en es-AR...", "ortografia", (offset += 2000));
    addLog("warn", "✍️ [Ortografía] 'Bienvenidos' → posible error: 'Bienvenido'", "ortografia", (offset += 600));
    addLog("success", "✍️ [Ortografía] 7 errores ortográficos detectados.", "ortografia", (offset += 400));
  }

  if (modulos.includes("accesibilidad")) {
    addLog("info", "♿ [Accesibilidad] Auditando componentes WCAG 2.1...", "accesibilidad", (offset += 500));
    addLog("warn", "♿ [Accesibilidad] Ratio de contraste insuficiente: 3.2:1 (mín. 4.5:1)", "accesibilidad", (offset += 1200));
    addLog("error", "♿ [Accesibilidad] 5 imágenes sin atributo alt", "accesibilidad", (offset += 700));
    addLog("success", "♿ [Accesibilidad] 8 issues encontrados. Score SEO: 72/100.", "accesibilidad", (offset += 400));
  }

  if (modulos.includes("links_rotos")) {
    addLog("info", "🔗 [Links] Rastreando hipervínculos internos y externos...", "links_rotos", (offset += 500));
    addLog("info", "🔗 [Links] 247 URLs indexadas. Verificando estado HTTP...", "links_rotos", (offset += 2000));
    addLog("error", "🔗 [Links] 404 detectado: /productos/categoria-antigua", "links_rotos", (offset += 800));
    addLog("warn", "🔗 [Links] 500 detectado: https://api.proveedor.com/v1/data", "links_rotos", (offset += 600));
    addLog("success", "🔗 [Links] Rastreo completado. 8 enlaces rotos.", "links_rotos", (offset += 400));
  }

  addLog("system", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", undefined, (offset += 300));
  addLog("success", "✅ Batería de agentes completada. Generando informe...", undefined, (offset += 500));

  return logs;
}

// ============================================================
// RESULTADOS MOCK POR MÓDULO
// ============================================================

function mockResultadosFuncional(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "funcional",
      nivel_severidad: "critico",
      descripcion_error: "El flujo de checkout no redirige correctamente tras el pago exitoso",
      componente_afectado_html: '<button id="btn-pagar" class="checkout-btn">Confirmar Pago</button>',
      url_afectada: `${cleanUrl}/checkout/confirmar`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `// Agregar redirección tras pago exitoso en el handler
async function handlePago(e: React.FormEvent) {
  e.preventDefault();
  const resultado = await procesarPago(datosForm);
  
  if (resultado.success) {
    // CORRECCIÓN: Redirigir al usuario a la página de confirmación
    router.push(\`/confirmacion?orden=\${resultado.orden_id}\`);
  } else {
    setError(resultado.mensaje);
  }
}`,
      lenguaje_codigo: "typescript",
    },
    {
      tipo_prueba: "funcional",
      nivel_severidad: "advertencia",
      descripcion_error: "El formulario de registro no valida el formato del email en tiempo real",
      componente_afectado_html: '<input type="email" id="email-register" name="email" />',
      url_afectada: `${cleanUrl}/registro`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `<!-- Agregar validación HTML5 y patrón de email -->
<input 
  type="email" 
  id="email-register" 
  name="email"
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
  required
  aria-describedby="email-error"
  onInvalid="this.setCustomValidity('Por favor ingresa un email válido')"
/>
<span id="email-error" class="error-msg" role="alert"></span>`,
      lenguaje_codigo: "html",
    },
    {
      tipo_prueba: "funcional",
      nivel_severidad: "info",
      descripcion_error: "La página de búsqueda tarda más de 3 segundos en cargar resultados",
      componente_afectado_html: '<div class="search-results-container" id="results">',
      url_afectada: `${cleanUrl}/buscar?q=producto`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1573164713714-d72e4c0235b9?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `// Implementar debounce y loading state en el componente de búsqueda
const [loading, setLoading] = useState(false);

const buscarProductos = useMemo(
  () => debounce(async (query: string) => {
    setLoading(true);
    try {
      const data = await fetchProductos(query);
      setResultados(data);
    } finally {
      setLoading(false);
    }
  }, 300),
  []
);`,
      lenguaje_codigo: "typescript",
    },
  ];
}

function mockResultadosFormulario(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "formulario",
      nivel_severidad: "exito",
      descripcion_error: "Formulario de contacto rellenado y enviado exitosamente (3/3 registros)",
      componente_afectado_html: '<form id="contact-form" action="/api/contacto">',
      url_afectada: `${cleanUrl}/contacto`,
      codigo_solucion_sugerido: null,
    },
    {
      tipo_prueba: "formulario",
      nivel_severidad: "advertencia",
      descripcion_error: "Input con id='str_7' no pudo ser mapeado automáticamente (campo ambiguo)",
      componente_afectado_html: '<input type="text" id="str_7" placeholder="Ingrese valor" />',
      url_afectada: `${cleanUrl}/contacto`,
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Agregar atributos de semántica para facilitar el mapeo automático -->
<input 
  type="text" 
  id="campo-empresa" 
  name="empresa"
  autocomplete="organization"
  aria-label="Nombre de la empresa"
  placeholder="Ej: Mi Empresa S.A."
/>`,
      lenguaje_codigo: "html",
    },
  ];
}

function mockResultadosEstres(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "estres",
      nivel_severidad: "critico",
      descripcion_error: "Tiempo de respuesta P95 supera 800ms bajo 50 usuarios concurrentes",
      componente_afectado_html: "GET /api/productos",
      url_afectada: `${cleanUrl}/api/productos`,
      metadatos_adicionales: {
        vus: 50,
        duracion: "30s",
        p50: "234ms",
        p95: "843ms",
        p99: "1.2s",
        requests_total: 1247,
        requests_fallidos: 30,
        tasa_error: "2.4%",
        throughput: "41.5 req/s",
      },
      codigo_solucion_sugerido: `-- CORRECCIÓN: Agregar índice compuesto para la consulta más pesada
-- Ejecutar en Supabase SQL Editor:

CREATE INDEX CONCURRENTLY idx_productos_categoria_precio 
  ON productos(categoria_id, precio) 
  WHERE activo = true;

-- También considerar implementar caché Redis:
// En el API Route:
const cached = await redis.get(\`productos:\${categoriaId}\`);
if (cached) return JSON.parse(cached);

const data = await supabase.from('productos').select('*').eq('categoria_id', categoriaId);
await redis.setex(\`productos:\${categoriaId}\`, 300, JSON.stringify(data));`,
      lenguaje_codigo: "sql",
    },
    {
      tipo_prueba: "estres",
      nivel_severidad: "advertencia",
      descripcion_error: "Tasa de error del 2.4% bajo carga máxima (umbral: 1%)",
      componente_afectado_html: "POST /api/carrito/agregar",
      url_afectada: `${cleanUrl}/api/carrito/agregar`,
      metadatos_adicionales: {
        errores_timeout: 18,
        errores_500: 12,
        errores_conexion: 0,
      },
      codigo_solucion_sugerido: `// Implementar retry logic con backoff exponencial
async function agregarAlCarrito(producto: Producto, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch('/api/carrito/agregar', {
        method: 'POST',
        body: JSON.stringify(producto),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 100));
    }
  }
}`,
      lenguaje_codigo: "typescript",
    },
  ];
}

function mockResultadosDiseno(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "diseno",
      nivel_severidad: "critico",
      descripcion_error: "Componente NavBar superpuesto con el hero en viewport Mobile (375px)",
      componente_afectado_html: '<nav class="navbar fixed-top" id="main-nav">',
      url_afectada: cleanUrl,
      captura_pantalla_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `/* CORRECCIÓN: Agregar padding-top al hero para compensar la navbar fija */
@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }
  
  .hero-section {
    padding-top: 60px; /* Compensar altura de navbar */
    min-height: calc(100vh - 60px);
  }
  
  /* Evitar overflow horizontal en mobile */
  body {
    overflow-x: hidden;
  }
}`,
      lenguaje_codigo: "css",
    },
    {
      tipo_prueba: "diseno",
      nivel_severidad: "advertencia",
      descripcion_error: "Texto del botón CTA desbordado en viewport Tablet (768px)",
      componente_afectado_html: '<button class="cta-button btn-primary">Comenzar prueba gratuita ahora</button>',
      url_afectada: `${cleanUrl}/precios`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `/* CORRECCIÓN: Limitar el botón y truncar texto largo */
.cta-button {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* Alternativa: permitir wrap en pantallas pequeñas */
  @media (max-width: 768px) {
    white-space: normal;
    line-height: 1.3;
    padding: 12px 20px;
  }
}`,
      lenguaje_codigo: "css",
    },
  ];
}

function mockResultadosSeguridad(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "seguridad",
      nivel_severidad: "critico",
      descripcion_error: "Cookie de sesión sin flag 'Secure' ni 'HttpOnly' — exposición a XSS",
      componente_afectado_html: "Set-Cookie: session_id=abc123; Path=/",
      url_afectada: cleanUrl,
      codigo_solucion_sugerido: `// CORRECCIÓN: Configurar cookies seguras en Next.js
// En app/api/auth/route.ts o middleware:

const cookieOptions = {
  httpOnly: true,      // Inaccesible desde JavaScript
  secure: true,        // Solo en HTTPS
  sameSite: 'strict' as const, // Protección CSRF
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
};

// Usar cookies de Next.js:
cookies().set('session_id', sessionToken, cookieOptions);`,
      lenguaje_codigo: "typescript",
    },
    {
      tipo_prueba: "seguridad",
      nivel_severidad: "critico",
      descripcion_error: "Header 'Content-Security-Policy' ausente — riesgo de inyección de scripts",
      componente_afectado_html: "HTTP Response Headers",
      url_afectada: cleanUrl,
      codigo_solucion_sugerido: `// CORRECCIÓN: Configurar CSP en next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co",
    ].join('; ')
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

// En nextConfig:
headers: async () => [{
  source: '/(.*)',
  headers: securityHeaders,
}]`,
      lenguaje_codigo: "typescript",
    },
    {
      tipo_prueba: "seguridad",
      nivel_severidad: "advertencia",
      descripcion_error: "Header 'X-Frame-Options' ausente — posible vulnerabilidad Clickjacking",
      componente_afectado_html: "HTTP Response Headers",
      url_afectada: cleanUrl,
      codigo_solucion_sugerido: `# CORRECCIÓN: Agregar en vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}`,
      lenguaje_codigo: "javascript",
    },
    {
      tipo_prueba: "seguridad",
      nivel_severidad: "info",
      descripcion_error: "HSTS (HTTP Strict Transport Security) no configurado",
      componente_afectado_html: "HTTP Response Headers",
      url_afectada: cleanUrl,
      codigo_solucion_sugerido: `// Agregar en headers de Next.js:
{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }`,
      lenguaje_codigo: "typescript",
    },
  ];
}

function mockResultadosOrtografia(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "ortografia",
      nivel_severidad: "advertencia",
      descripcion_error: "'Bienvenidos a nuestro tienda' → error de concordancia de género",
      componente_afectado_html: '<h1 class="hero-title">Bienvenidos a nuestro tienda</h1>',
      url_afectada: cleanUrl,
      captura_pantalla_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Concordancia de género -->
<h1 class="hero-title">Bienvenidos a nuestra tienda</h1>`,
      lenguaje_codigo: "html",
    },
    {
      tipo_prueba: "ortografia",
      nivel_severidad: "advertencia",
      descripcion_error: "'Hacé click aqui' → 'aquí' requiere tilde ortográfica",
      componente_afectado_html: '<a href="/productos">Hacé click aqui</a>',
      url_afectada: `${cleanUrl}/productos`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Agregar tilde -->
<a href="/productos">Hacé click aquí</a>`,
      lenguaje_codigo: "html",
    },
    {
      tipo_prueba: "ortografia",
      nivel_severidad: "info",
      descripcion_error: "Uso inconsistente de mayúsculas en botones de la interfaz",
      componente_afectado_html: '<button>AGREGAR AL CARRITO</button> vs <button>Comprar Ahora</button>',
      url_afectada: `${cleanUrl}/productos`,
      codigo_solucion_sugerido: `/* CORRECCIÓN: Estandarizar capitalización con CSS */
.btn {
  text-transform: capitalize; /* Primera letra de cada palabra */
  /* O: */
  text-transform: uppercase;  /* Todo en mayúsculas */
}

/* Aplicar en globals.css para consistencia */`,
      lenguaje_codigo: "css",
    },
  ];
}

function mockResultadosAccesibilidad(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "accesibilidad",
      nivel_severidad: "critico",
      descripcion_error: "5 imágenes sin atributo alt — lectores de pantalla no pueden describirlas",
      componente_afectado_html: '<img src="/hero-banner.jpg" class="hero-img">',
      url_afectada: cleanUrl,
      captura_pantalla_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Agregar atributos alt descriptivos -->
<!-- Para imágenes decorativas: -->
<img src="/decorativo.jpg" alt="" role="presentation" />

<!-- Para imágenes de contenido: -->
<img 
  src="/hero-banner.jpg" 
  alt="Mujer usando nuestra plataforma de e-commerce en laptop"
  class="hero-img"
/>

<!-- Para imágenes de productos: -->
<img 
  src="/producto-123.jpg" 
  alt="Zapatillas Nike Air Max 270 - Color Negro - Talle 42"
/>`,
      lenguaje_codigo: "html",
    },
    {
      tipo_prueba: "accesibilidad",
      nivel_severidad: "critico",
      descripcion_error: "Ratio de contraste texto/fondo: 3.2:1 — No cumple WCAG AA (mínimo 4.5:1)",
      componente_afectado_html: '<p class="subtitle" style="color: #9ca3af; background: #ffffff">',
      url_afectada: `${cleanUrl}/nosotros`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `/* CORRECCIÓN: Aumentar contraste del texto secundario */
.subtitle {
  /* Antes: color: #9ca3af (contraste 3.2:1) */
  color: #6b7280; /* Contraste 5.4:1 ✅ WCAG AA */
  
  /* Para texto grande (18px+): mínimo 3:1 */
  /* Para texto normal (<18px): mínimo 4.5:1 */
}

/* Verificar con: https://webaim.org/resources/contrastchecker/ */`,
      lenguaje_codigo: "css",
    },
    {
      tipo_prueba: "accesibilidad",
      nivel_severidad: "advertencia",
      descripcion_error: "Formulario sin labels asociados a inputs — desorientador para tecnología asistiva",
      componente_afectado_html: '<input type="text" id="nombre" placeholder="Tu nombre" />',
      url_afectada: `${cleanUrl}/contacto`,
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Asociar labels explícitamente -->
<div class="form-group">
  <label for="nombre" class="form-label">
    Nombre completo
    <span aria-label="requerido" class="required">*</span>
  </label>
  <input 
    type="text" 
    id="nombre" 
    name="nombre"
    required
    aria-required="true"
    aria-describedby="nombre-hint"
    placeholder="Ej: María García"
  />
  <span id="nombre-hint" class="form-hint">Ingresa tu nombre y apellido</span>
</div>`,
      lenguaje_codigo: "html",
    },
    {
      tipo_prueba: "accesibilidad",
      nivel_severidad: "info",
      descripcion_error: "Meta description ausente — impacto negativo en SEO",
      componente_afectado_html: "<head> — No se encontró <meta name=\"description\">",
      url_afectada: cleanUrl,
      codigo_solucion_sugerido: `// CORRECCIÓN: Agregar metadata en Next.js App Router
// En app/layout.tsx o app/page.tsx:

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Tienda Online | Los Mejores Productos',
  description: 'Encontrá los mejores productos al mejor precio. Envíos a todo el país. Compra segura y fácil.',
  keywords: ['tienda online', 'comprar', 'productos', 'ofertas'],
  openGraph: {
    title: 'Mi Tienda Online',
    description: 'Los mejores productos al mejor precio',
    url: 'https://mitienda.com',
    siteName: 'Mi Tienda',
    type: 'website',
  },
};`,
      lenguaje_codigo: "typescript",
    },
  ];
}

function mockResultadosLinksRotos(url: string): Partial<ResultadoTest>[] {
  const cleanUrl = url.replace(/\/$/, "");
  return [
    {
      tipo_prueba: "links_rotos",
      nivel_severidad: "critico",
      descripcion_error: "404 Not Found: /productos/categoria-descontinuada",
      componente_afectado_html: '<a href="/productos/categoria-descontinuada">Ver categoría</a>',
      url_afectada: `${cleanUrl}/productos`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=600&q=80",
      metadatos_adicionales: {
        http_status: 404,
        encontrado_en: `${cleanUrl}/productos`,
        tipo: "interno",
      },
      codigo_solucion_sugerido: `// CORRECCIÓN: Configurar redirección en next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/productos/categoria-descontinuada',
        destination: '/productos',
        permanent: true, // 301 redirect
      },
    ];
  },
};

// O manejar en el componente:
// Usar notFound() de next/navigation si la ruta es dinámica`,
      lenguaje_codigo: "typescript",
    },
    {
      tipo_prueba: "links_rotos",
      nivel_severidad: "critico",
      descripcion_error: "500 Internal Server Error: https://api.proveedor-externo.com/v1/datos",
      componente_afectado_html: '<a href="https://api.proveedor-externo.com/v1/datos">API Docs</a>',
      url_afectada: `${cleanUrl}/integraciones`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=600&q=80",
      metadatos_adicionales: {
        http_status: 500,
        encontrado_en: `${cleanUrl}/integraciones`,
        tipo: "externo",
      },
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Reemplazar el enlace roto con la URL actualizada del proveedor
O agregar un aviso de que el enlace puede no estar disponible -->
<a 
  href="https://docs.proveedor-externo.com/api" 
  target="_blank" 
  rel="noopener noreferrer"
  aria-label="Documentación de API (abre en nueva pestaña)"
>
  Documentación API
  <span aria-hidden="true">↗</span>
</a>`,
      lenguaje_codigo: "html",
    },
    {
      tipo_prueba: "links_rotos",
      nivel_severidad: "advertencia",
      descripcion_error: "3 enlaces internos con rutas relativas incorrectas (./ruta vs /ruta)",
      componente_afectado_html: '<a href="./blog/articulo-1">Leer más</a>',
      url_afectada: `${cleanUrl}/blog`,
      captura_pantalla_url: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=600&q=80",
      codigo_solucion_sugerido: `<!-- CORRECCIÓN: Usar rutas absolutas desde la raíz -->
<!-- Antes (incorrecto - ruta relativa): -->
<a href="./blog/articulo-1">Leer más</a>

<!-- Después (correcto - ruta absoluta): -->
<a href="/blog/articulo-1">Leer más</a>

<!-- En Next.js, usar el componente Link: -->
import Link from 'next/link';
<Link href="/blog/articulo-1">Leer más</Link>`,
      lenguaje_codigo: "html",
    },
  ];
}

// ============================================================
// FUNCIÓN PRINCIPAL: Generar todos los resultados
// ============================================================

export async function generarResultadosMock(
  ejecucionId: string,
  modulos: string[],
  url: string
): Promise<Partial<ResultadoTest>[]> {
  const resultados: Partial<ResultadoTest>[] = [];

  if (modulos.includes("funcional")) {
    resultados.push(...mockResultadosFuncional(url));
  }
  if (modulos.includes("formulario")) {
    resultados.push(...mockResultadosFormulario(url));
  }
  if (modulos.includes("estres")) {
    resultados.push(...mockResultadosEstres(url));
  }
  if (modulos.includes("diseno")) {
    resultados.push(...mockResultadosDiseno(url));
  }
  if (modulos.includes("seguridad")) {
    resultados.push(...mockResultadosSeguridad(url));
  }
  if (modulos.includes("ortografia")) {
    resultados.push(...mockResultadosOrtografia(url));
  }
  if (modulos.includes("accesibilidad")) {
    resultados.push(...mockResultadosAccesibilidad(url));
  }
  if (modulos.includes("links_rotos")) {
    resultados.push(...mockResultadosLinksRotos(url));
  }

  return resultados.map((r) => ({
    ...r,
    ejecucion_id: ejecucionId,
    creado_en: new Date().toISOString(),
  }));
}

// ============================================================
// CÁLCULO DE SCORE DE SALUD
// ============================================================

export function calcularScoreSalud(resultados: ResultadoTest[]): number {
  const erroresReales = resultados.filter((r) => r.nivel_severidad !== "exito");

  if (erroresReales.length === 0) return 100;

  const criticos = erroresReales.filter((r) => r.nivel_severidad === "critico").length;
  const advertencias = erroresReales.filter((r) => r.nivel_severidad === "advertencia").length;
  const infos = erroresReales.filter((r) => r.nivel_severidad === "info").length;

  const penalizacion = criticos * 10 + advertencias * 3 + infos * 1;
  return Math.max(0, 100 - penalizacion);
}

export { delay };
