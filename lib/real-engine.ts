import { ResultadoTest, LogConsola } from "./types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper: Ping URL to check status
async function pingUrl(url: string): Promise<{ ok: boolean; status: number; error?: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    clearTimeout(id);
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    clearTimeout(id);
    return { ok: false, status: 0, error: err.message || 'Error de conexión' };
  }
}

// Helper: Extract all links from HTML
function extraerEnlaces(html: string, baseUrl: string): string[] {
  const enlaces = new Set<string>();
  const regex = /href=["']([^"']+)["']/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }

    try {
      const resolved = new URL(href, baseUrl).toString();
      enlaces.add(resolved);
    } catch {
      // Ignorar URLs inválidas
    }
  }

  return Array.from(enlaces);
}

// ============================================================
// 1. MÓDULO: ENLACES ROTOS (Real Scan)
// ============================================================
export async function ejecutarLinksRotos(
  url: string,
  ejecucionId: string,
  isInterrupted?: () => Promise<boolean>
): Promise<{ resultados: Partial<ResultadoTest>[]; logs: LogConsola[] }> {
  const resultados: Partial<ResultadoTest>[] = [];
  const logs: LogConsola[] = [];
  const now = new Date();

  const addLog = (nivel: LogConsola["nivel"], mensaje: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      nivel,
      mensaje,
      modulo: "links_rotos",
    });
  };

  addLog("info", "🔗 [Links] Iniciando rastreo de hipervínculos en la página principal...");

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    if (!res.ok) {
      addLog("error", `🔗 [Links] No se pudo cargar la página principal (HTTP ${res.status}).`);
      return { resultados, logs };
    }

    const html = await res.text();
    if (isInterrupted && await isInterrupted()) {
      addLog("warn", "⚠️ [Links] Ejecución interrumpida por el usuario.");
      return { resultados, logs };
    }
    const enlaces = extraerEnlaces(html, url).slice(0, 15); // Limitar a 15 enlaces para evitar timeouts en Serverless
    
    addLog("info", `🔗 [Links] Se detectaron ${enlaces.length} enlaces para auditar. Verificando estado HTTP...`);

    for (const link of enlaces) {
      if (isInterrupted && await isInterrupted()) {
        addLog("warn", "⚠️ [Links] Ejecución interrumpida por el usuario.");
        break;
      }
      addLog("info", `🔗 [Links] Verificando: ${link}`);
      const check = await pingUrl(link);
      
      if (!check.ok) {
        addLog("warn", `🔗 [Links] Enlace roto encontrado: ${link} (Status: ${check.status || 'Fallo de Red'})`);
        resultados.push({
          ejecucion_id: ejecucionId,
          tipo_prueba: "links_rotos",
          nivel_severidad: "critico",
          descripcion_error: `Enlace roto detectado: Código ${check.status || 'Conexión Fallida'} para "${link}"`,
          componente_afectado_html: `<a href="${link}">`,
          url_afectada: link,
          captura_pantalla_url: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=600&q=80",
          metadatos_adicionales: {
            http_status: check.status,
            encontrado_en: url,
            error: check.error || null
          }
        });
      }
    }

    addLog("success", `🔗 [Links] Rastreo completado. Se encontraron ${resultados.length} enlaces rotos.`);
  } catch (err: any) {
    addLog("error", `🔗 [Links] Error crítico durante el análisis: ${err.message}`);
  }

  return { resultados, logs };
}

// ============================================================
// 2. MÓDULO: ACCESIBILIDAD Y SEO (Real Scan)
// ============================================================
export async function ejecutarAccesibilidad(
  url: string,
  ejecucionId: string,
  isInterrupted?: () => Promise<boolean>
): Promise<{ resultados: Partial<ResultadoTest>[]; logs: LogConsola[] }> {
  const resultados: Partial<ResultadoTest>[] = [];
  const logs: LogConsola[] = [];

  const addLog = (nivel: LogConsola["nivel"], mensaje: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      nivel,
      mensaje,
      modulo: "accesibilidad",
    });
  };

  addLog("info", "♿ [Accesibilidad] Descargando HTML para auditar WCAG y SEO...");

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    if (!res.ok) {
      addLog("error", `♿ [Accesibilidad] Error al cargar la página (HTTP ${res.status}).`);
      return { resultados, logs };
    }

    const html = await res.text();
    addLog("info", "♿ [Accesibilidad] Auditando semántica HTML y meta-tags...");

    // 1. Verificar etiqueta <title>
    if (!/<title[^>]*>([^<]+)<\/title>/i.test(html)) {
      addLog("warn", "♿ [Accesibilidad] Falta la etiqueta <title> en el <head>.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "accesibilidad",
        nivel_severidad: "critico",
        descripcion_error: "La página no tiene una etiqueta <title> configurada en el <head>.",
        componente_afectado_html: "<head>",
        url_afectada: url,
        captura_pantalla_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      });
    }

    // 2. Verificar atributo lang en <html>
    if (!/<html[^>]*lang=["']\w+["']/i.test(html)) {
      addLog("warn", "♿ [Accesibilidad] Falta el idioma en la etiqueta <html>.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "accesibilidad",
        nivel_severidad: "advertencia",
        descripcion_error: "El elemento <html> no tiene configurado el atributo de idioma 'lang' (ej. <html lang=\"es\">).",
        componente_afectado_html: "<html>",
        url_afectada: url,
      });
    }

    // 3. Verificar etiqueta <h1>
    const h1Matches = html.match(/<h1[^>]*>/gi) || [];
    if (h1Matches.length === 0) {
      addLog("warn", "♿ [Accesibilidad] No se detectó encabezado principal <h1>.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "accesibilidad",
        nivel_severidad: "critico",
        descripcion_error: "No se encontró ningún encabezado principal <h1> en la página.",
        componente_afectado_html: "<body>",
        url_afectada: url,
      });
    } else if (h1Matches.length > 1) {
      addLog("info", "♿ [Accesibilidad] Múltiples etiquetas <h1> encontradas.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "accesibilidad",
        nivel_severidad: "info",
        descripcion_error: `Se encontraron múltiples encabezados <h1> (${h1Matches.length}). Se recomienda tener un único <h1> por página para una jerarquía semántica óptima.`,
        componente_afectado_html: "<body>",
        url_afectada: url,
      });
    }

    // 4. Verificar imágenes sin alt
    const imgRegex = /<img([^>]+)>/gi;
    let match;
    let imgsSinAltCount = 0;
    let primerImgSinAlt = "";

    while ((match = imgRegex.exec(html)) !== null) {
      const attrs = match[1];
      if (!/alt=["']/i.test(attrs)) {
        imgsSinAltCount++;
        if (!primerImgSinAlt) {
          primerImgSinAlt = match[0];
        }
      }
    }

    if (imgsSinAltCount > 0) {
      addLog("warn", `♿ [Accesibilidad] Se encontraron ${imgsSinAltCount} imágenes sin atributo 'alt'.`);
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "accesibilidad",
        nivel_severidad: "critico",
        descripcion_error: `Se detectaron ${imgsSinAltCount} imágenes sin el atributo descriptivo 'alt'. Esto dificulta la navegación para lectores de pantalla.`,
        componente_afectado_html: primerImgSinAlt,
        url_afectada: url,
        captura_pantalla_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      });
    }

    addLog("success", "♿ [Accesibilidad] Auditoría completada con éxito.");
  } catch (err: any) {
    addLog("error", `♿ [Accesibilidad] Error crítico: ${err.message}`);
  }

  return { resultados, logs };
}

// ============================================================
// 3. MÓDULO: ORTOGRAFÍA Y GRAMÁTICA (Real Scan)
// ============================================================
function extraerTextoLimpio(html: string): string {
  let clean = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  clean = clean.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  clean = clean.replace(/<[^>]+>/g, " ");
  clean = clean.replace(/\s+/g, " ").trim();
  return clean;
}

export async function ejecutarOrtografia(
  url: string,
  ejecucionId: string,
  isInterrupted?: () => Promise<boolean>
): Promise<{ resultados: Partial<ResultadoTest>[]; logs: LogConsola[] }> {
  const resultados: Partial<ResultadoTest>[] = [];
  const logs: LogConsola[] = [];

  const addLog = (nivel: LogConsola["nivel"], mensaje: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      nivel,
      mensaje,
      modulo: "ortografia",
    });
  };

  addLog("info", "✍️ [Ortografía] Descargando contenido de la página para análisis ortográfico...");

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    if (!res.ok) {
      addLog("error", `✍️ [Ortografía] Error al descargar HTML (HTTP ${res.status}).`);
      return { resultados, logs };
    }

    const html = await res.text();
    const textoLimpio = extraerTextoLimpio(html);

    addLog("info", "✍️ [Ortografía] Analizando 1500 caracteres con la API pública de LanguageTool...");

    const textoCortado = textoLimpio.slice(0, 1500);
    if (!textoCortado) {
      addLog("warn", "✍️ [Ortografía] No se extrajo suficiente texto legible de la página.");
      return { resultados, logs };
    }

    const params = new URLSearchParams();
    params.append('text', textoCortado);
    params.append('language', 'es');

    const checkRes = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    if (!checkRes.ok) {
      addLog("error", "✍️ [Ortografía] La API de LanguageTool rechazó la solicitud.");
      return { resultados, logs };
    }

    const json = await checkRes.json();
    const matches = json.matches || [];

    const erroresFiltrados = matches
      .filter((m: any) => m.rule.category.id === 'TYPOS' || m.rule.category.id === 'GRAMMAR')
      .slice(0, 3); // Límite de 3 errores para no saturar

    erroresFiltrados.forEach((match: any) => {
      const palabraContexto = match.context.text.substring(match.context.offset, match.context.offset + match.context.length);
      const sugerencias = (match.replacements || []).slice(0, 3).map((r: any) => r.value).join(', ');

      addLog("warn", `✍️ [Ortografía] Posible error encontrado: "${palabraContexto}"`);

      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "ortografia",
        nivel_severidad: "advertencia",
        descripcion_error: `Posible error en texto: "${palabraContexto}". ${match.message}`,
        componente_afectado_html: `<span class="contexto-error">${match.context.text}</span>`,
        url_afectada: url,
        captura_pantalla_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
        codigo_solucion_sugerido: sugerencias ? `// Sugerencias de corrección:\n// Reemplazar por: ${sugerencias}` : null,
        lenguaje_codigo: "text"
      });
    });

    addLog("success", `✍️ [Ortografía] Análisis completado. Se encontraron ${resultados.length} sugerencias.`);
  } catch (err: any) {
    addLog("error", `✍️ [Ortografía] Error crítico en análisis: ${err.message}`);
  }

  return { resultados, logs };
}

// ============================================================
// 4. MÓDULO: SEGURIDAD (Real Scan)
// ============================================================
export async function ejecutarSeguridad(
  url: string,
  ejecucionId: string,
  isInterrupted?: () => Promise<boolean>
): Promise<{ resultados: Partial<ResultadoTest>[]; logs: LogConsola[] }> {
  const resultados: Partial<ResultadoTest>[] = [];
  const logs: LogConsola[] = [];

  const addLog = (nivel: LogConsola["nivel"], mensaje: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      nivel,
      mensaje,
      modulo: "seguridad",
    });
  };

  addLog("info", "🛡️ [Seguridad] Iniciando escaneo pasivo de cabeceras HTTP...");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (isInterrupted && await isInterrupted()) {
      addLog("warn", "⚠️ [Seguridad] Ejecución interrumpida por el usuario.");
      return { resultados, logs };
    }

    addLog("info", "🛡️ [Seguridad] Analizando cabeceras de seguridad...");

    const headers = res.headers;

    // 1. Content-Security-Policy
    const csp = headers.get("content-security-policy");
    if (!csp) {
      addLog("error", "🛡️ [Seguridad] Cabecera 'Content-Security-Policy' ausente.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "seguridad",
        nivel_severidad: "critico",
        descripcion_error: "La cabecera 'Content-Security-Policy' (CSP) no está configurada. Esto expone el sitio a ataques de inyección de scripts (XSS).",
        componente_afectado_html: "HTTP Response Headers",
        url_afectada: url,
        codigo_solucion_sugerido: `// Configurar CSP en Next.js (next.config.js):
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  }
];`,
        lenguaje_codigo: "javascript"
      });
    } else {
      addLog("success", "🛡️ [Seguridad] Cabecera 'Content-Security-Policy' detectada.");
    }

    // 2. X-Frame-Options
    const xfo = headers.get("x-frame-options");
    if (!xfo) {
      addLog("error", "🛡️ [Seguridad] Cabecera 'X-Frame-Options' ausente.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "seguridad",
        nivel_severidad: "critico",
        descripcion_error: "La cabecera 'X-Frame-Options' no está configurada, permitiendo que el sitio sea embebido en frames externos (riesgo de Clickjacking).",
        componente_afectado_html: "HTTP Response Headers",
        url_afectada: url,
        codigo_solucion_sugerido: `// Configurar SAMEORIGIN en Next.js (next.config.js):
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  }
];`,
        lenguaje_codigo: "javascript"
      });
    } else {
      addLog("success", `🛡️ [Seguridad] Cabecera 'X-Frame-Options' configurada como: ${xfo}`);
    }

    // 3. X-Content-Type-Options
    const xcto = headers.get("x-content-type-options");
    if (!xcto || xcto.toLowerCase() !== "nosniff") {
      addLog("warn", "🛡️ [Seguridad] Cabecera 'X-Content-Type-Options' ausente o incorrecta.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "seguridad",
        nivel_severidad: "advertencia",
        descripcion_error: "La cabecera 'X-Content-Type-Options' no está configurada con 'nosniff'. El navegador podría intentar interpretar el tipo de archivo incorrectamente.",
        componente_afectado_html: "HTTP Response Headers",
        url_afectada: url,
        codigo_solucion_sugerido: `// Configurar nosniff en Next.js (next.config.js):
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];`,
        lenguaje_codigo: "javascript"
      });
    } else {
      addLog("success", "🛡️ [Seguridad] Cabecera 'X-Content-Type-Options' configurada con 'nosniff'.");
    }

    // 4. Strict-Transport-Security (HSTS)
    const hsts = headers.get("strict-transport-security");
    if (!hsts) {
      addLog("warn", "🛡️ [Seguridad] Cabecera 'Strict-Transport-Security' (HSTS) ausente.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "seguridad",
        nivel_severidad: "advertencia",
        descripcion_error: "La cabecera 'Strict-Transport-Security' (HSTS) no está configurada. Las conexiones del usuario podrían ser interceptadas o degradadas a HTTP.",
        componente_afectado_html: "HTTP Response Headers",
        url_afectada: url,
        codigo_solucion_sugerido: `// Configurar HSTS en Next.js (next.config.js):
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
];`,
        lenguaje_codigo: "javascript"
      });
    } else {
      addLog("success", "🛡️ [Seguridad] Cabecera 'Strict-Transport-Security' detectada.");
    }

    // 5. Cookies seguras
    let setCookies: string[] = [];
    if (res.headers.getSetCookie) {
      setCookies = res.headers.getSetCookie();
    } else {
      const rawCookie = res.headers.get("set-cookie");
      if (rawCookie) {
        setCookies = [rawCookie];
      }
    }

    let cookieProblems = 0;
    
    for (const cookie of setCookies) {
      const parts = cookie.split(";").map(p => p.trim().toLowerCase());
      const hasSecure = parts.includes("secure");
      const hasHttpOnly = parts.includes("httponly");

      if (!hasSecure || !hasHttpOnly) {
        cookieProblems++;
        const cookieName = cookie.split("=")[0] || "cookie";
        const missing = [];
        if (!hasSecure) missing.push("Secure");
        if (!hasHttpOnly) missing.push("HttpOnly");

        addLog("error", `🛡️ [Seguridad] Cookie de respuesta "${cookieName}" sin directiva: ${missing.join(", ")}`);
        
        resultados.push({
          ejecucion_id: ejecucionId,
          tipo_prueba: "seguridad",
          nivel_severidad: "critico",
          descripcion_error: `La cookie "${cookieName}" no tiene configuradas las banderas de seguridad obligatorias: ${missing.join(" y ")}. Esto facilita ataques de robo de sesión.`,
          componente_afectado_html: `Set-Cookie: ${cookie.split(";")[0]}`,
          url_afectada: url,
          codigo_solucion_sugerido: `// Ejemplo de configuración de cookies seguras:
response.cookies.set('${cookieName}', valor, {
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  path: '/'
});`,
          lenguaje_codigo: "javascript"
        });
      }
    }

    if (cookieProblems === 0) {
      addLog("success", "🛡️ [Seguridad] Análisis de cookies completado sin problemas detectados.");
    }

    addLog("success", `🛡️ [Seguridad] Escaneo de seguridad completado. Se detectaron ${resultados.length} vulnerabilidades.`);
  } catch (err: any) {
    addLog("error", `🛡️ [Seguridad] Error crítico en análisis: ${err.message}`);
  }

  return { resultados, logs };
}

// ============================================================
// 5. MÓDULO: ESTRÉS (Real Scan)
// ============================================================
export async function ejecutarEstres(
  url: string,
  ejecucionId: string,
  peticiones: number = 50,
  duracion: number = 6,
  isInterrupted?: () => Promise<boolean>
): Promise<{ resultados: Partial<ResultadoTest>[]; logs: LogConsola[] }> {
  const resultados: Partial<ResultadoTest>[] = [];
  const logs: LogConsola[] = [];

  const addLog = (nivel: LogConsola["nivel"], mensaje: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      nivel,
      mensaje,
      modulo: "estres",
    });
  };

  addLog("info", `🔥 [Estrés] Iniciando simulación de carga real hacia ${url}...`);
  addLog("info", `🔥 [Estrés] Configuración: ${peticiones} usuarios virtuales (VUs) durante ${duracion} segundos.`);

  // Medir latencias
  const latencias: number[] = [];
  let exitosos = 0;
  let fallidos = 0;
  let totalRequests = 0;

  const totalDurationMs = duracion * 1000;
  const startTest = Date.now();
  
  // Dividimos la cantidad de peticiones en ráfagas de 1 segundo
  const intervaloMs = 1000;
  const peticionesPorSegundo = Math.ceil(peticiones / Math.max(1, duracion));

  addLog("info", `🔥 [Estrés] Ejecutando ráfagas de ${peticionesPorSegundo} peticiones por segundo...`);

  try {
    let elapsed = 0;
    while (elapsed < totalDurationMs) {
      if (isInterrupted && await isInterrupted()) {
        addLog("warn", "⚠️ [Estrés] Simulación de estrés interrumpida por el usuario.");
        break;
      }

      const promesasBatch = Array.from({ length: peticionesPorSegundo }).map(async () => {
        const reqStart = Date.now();
        const check = await pingUrl(url);
        const reqEnd = Date.now();
        const duration = reqEnd - reqStart;
        
        if (check.ok) {
          exitosos++;
          latencias.push(duration);
        } else {
          fallidos++;
        }
        totalRequests++;
      });

      await Promise.all(promesasBatch);
      await delay(intervaloMs);
      elapsed = Date.now() - startTest;
    }

    const testDurationRealSec = (Date.now() - startTest) / 1000;
    const throughput = totalRequests / Math.max(0.1, testDurationRealSec);
    const tasaError = totalRequests > 0 ? (fallidos / totalRequests) * 100 : 0;

    // Calcular P50, P95 y Promedio
    latencias.sort((a, b) => a - b);
    const avgLatencia = latencias.length > 0 ? latencias.reduce((sum, val) => sum + val, 0) / latencias.length : 0;
    const p50 = latencias.length > 0 ? latencias[Math.floor(latencias.length * 0.5)] : 0;
    const p95 = latencias.length > 0 ? latencias[Math.floor(latencias.length * 0.95)] : 0;

    addLog("info", `🔥 [Estrés] Carga finalizada. Total peticiones: ${totalRequests} (${exitosos} exitosas, ${fallidos} fallidas).`);
    addLog("info", `🔥 [Estrés] Métricas de Latencia — Promedio: ${avgLatencia.toFixed(0)}ms, P50: ${p50}ms, P95: ${p95}ms.`);

    const severidad = p95 > 800 || tasaError > 5 ? "critico" : p95 > 400 || tasaError > 1 ? "advertencia" : "exito";

    if (severidad === "critico" || severidad === "advertencia") {
      addLog("warn", `🔥 [Estrés] Rendimiento degradado bajo carga (P95: ${p95}ms, Errores: ${tasaError.toFixed(1)}%).`);
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "estres",
        nivel_severidad: severidad,
        descripcion_error: `El servidor experimenta lentitud bajo carga. Latencia P95: ${p95.toFixed(0)}ms (umbral: 800ms) con ${tasaError.toFixed(1)}% de peticiones fallidas.`,
        componente_afectado_html: `GET ${url}`,
        url_afectada: url,
        metadatos_adicionales: {
          vus: peticiones,
          duracion: `${duracion}s`,
          p50: `${p50.toFixed(0)}ms`,
          p95: `${p95.toFixed(0)}ms`,
          requests_total: totalRequests,
          requests_fallidos: fallidos,
          tasa_error: `${tasaError.toFixed(1)}%`,
          throughput: `${throughput.toFixed(1)} req/s`
        },
        codigo_solucion_sugerido: `// Sugerencias para optimizar el rendimiento:
// 1. Agregar índices para las consultas SQL de base de datos más recurrentes.
// 2. Implementar almacenamiento en caché (ej. Vercel KV / Redis / CDN caching).
// 3. Optimizar el tamaño de las imágenes y assets para reducir el peso de descarga.`,
        lenguaje_codigo: "javascript"
      });
    } else {
      addLog("success", "🔥 [Estrés] Rendimiento óptimo bajo carga. Cero problemas detectados.");
      resultados.push({
        ejecucion_id: ejecucionId,
        tipo_prueba: "estres",
        nivel_severidad: "exito",
        descripcion_error: `Rendimiento de carga óptimo. Latencia P95: ${p95.toFixed(0)}ms con 0% de errores bajo carga.`,
        componente_afectado_html: `GET ${url}`,
        url_afectada: url,
        metadatos_adicionales: {
          vus: peticiones,
          duracion: `${duracion}s`,
          p50: `${p50.toFixed(0)}ms`,
          p95: `${p95.toFixed(0)}ms`,
          requests_total: totalRequests,
          requests_fallidos: fallidos,
          tasa_error: `${tasaError.toFixed(1)}%`,
          throughput: `${throughput.toFixed(1)} req/s`
        }
      });
    }

  } catch (err: any) {
    addLog("error", `🔥 [Estrés] Error crítico en simulación de carga: ${err.message}`);
  }

  return { resultados, logs };
}

