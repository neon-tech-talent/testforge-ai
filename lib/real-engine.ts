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
