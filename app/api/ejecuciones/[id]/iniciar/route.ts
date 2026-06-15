import { createAdminClient } from "@/lib/supabase/server";
import { generarLogs, generarResultadosMock, delay } from "@/lib/mock-engine";
import { NextRequest, NextResponse } from "next/server";

// POST /api/ejecuciones/[id]/iniciar
// Dispara la simulación completa de la batería de tests
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  const ejecucionId = params.id;

  // Obtener la ejecución
  const { data: ejecucion, error: fetchError } = await supabase
    .from("ejecuciones_test")
    .select("*, proyectos(url_sitio)")
    .eq("id", ejecucionId)
    .single();

  if (fetchError || !ejecucion) {
    return NextResponse.json({ error: "Ejecución no encontrada" }, { status: 404 });
  }

  const urlObjetivo = (ejecucion as { proyectos?: { url_sitio?: string } }).proyectos?.url_sitio || "";
  const modulos: string[] = ejecucion.modulos_activos || [];

  // Responder inmediatamente al cliente
  const responsePromise = NextResponse.json({ message: "Simulación iniciada", ejecucion_id: ejecucionId });

  // Ejecutar simulación en background (sin await para respuesta inmediata)
  ejecutarSimulacion(supabase, ejecucionId, modulos, urlObjetivo).catch(console.error);

  return responsePromise;
}

async function ejecutarSimulacion(
  supabase: ReturnType<typeof createAdminClient>,
  ejecucionId: string,
  modulos: string[],
  url: string
) {
  try {
    // 1. Obtener configuración inicial
    const { data: initialExec } = await supabase
      .from("ejecuciones_test")
      .select("configuracion_json")
      .eq("id", ejecucionId)
      .single();

    const initialConfig = initialExec?.configuracion_json || {};

    // 2. Generar logs simulados
    const allLogs = generarLogs(modulos, url);
    const startLogs = allLogs.filter(l => !l.modulo && l.nivel !== "success");
    const endLogs = allLogs.filter(l => !l.modulo && l.nivel === "success");

    let logsAcumulados = [...startLogs];

    // Marcar como en_progreso
    await supabase
      .from("ejecuciones_test")
      .update({
        estado: "en_progreso",
        progreso: 5,
        logs_consola: logsAcumulados,
        configuracion_json: {
          ...initialConfig,
          modulo_actual: modulos[0] || null,
          modulos_saltados: []
        }
      })
      .eq("id", ejecucionId);

    // 3. Simular progreso por módulo
    const progresoIncremento = Math.floor(85 / Math.max(modulos.length, 1));
    let progresoActual = 5;

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      // Obtener configuración actualizada
      const { data: currentExec } = await supabase
        .from("ejecuciones_test")
        .select("configuracion_json")
        .eq("id", ejecucionId)
        .single();

      const configObj = (currentExec?.configuracion_json || {}) as Record<string, any>;
      const modulosSaltados: string[] = configObj.modulos_saltados || [];

      if (modulosSaltados.includes(modulo)) {
        continue;
      }

      // Actualizar el modulo_actual en la DB
      await supabase
        .from("ejecuciones_test")
        .update({
          configuracion_json: {
            ...configObj,
            modulo_actual: modulo
          }
        })
        .eq("id", ejecucionId);

      // Filtrar logs de este módulo
      const logsModulo = allLogs.filter((l) => l.modulo === modulo);
      const logsInicio = logsModulo.slice(0, logsModulo.length - 1);
      const logFin = logsModulo.slice(logsModulo.length - 1);

      // Agregar logs iniciales del módulo a la consola
      logsAcumulados.push(...logsInicio);
      progresoActual = Math.min(90, progresoActual + progresoIncremento);

      await supabase
        .from("ejecuciones_test")
        .update({
          progreso: progresoActual,
          logs_consola: logsAcumulados,
        })
        .eq("id", ejecucionId);

      // Delay realista por módulo, chequeando interrupción cada 500ms
      const delayTime = 2000 + Math.random() * 2000;
      const step = 500;
      let elapsed = 0;
      let interrupted = false;

      while (elapsed < delayTime) {
        await delay(step);
        elapsed += step;

        const { data: checkExec } = await supabase
          .from("ejecuciones_test")
          .select("configuracion_json")
          .eq("id", ejecucionId)
          .single();

        const checkConfig = (checkExec?.configuracion_json || {}) as Record<string, any>;
        if (checkConfig.skip_requested) {
          interrupted = true;
          break;
        }
      }

      // Obtener la configuración más reciente después del delay/interrupción
      const { data: finalExecStep } = await supabase
        .from("ejecuciones_test")
        .select("configuracion_json")
        .eq("id", ejecucionId)
        .single();

      let latestConfig = (finalExecStep?.configuracion_json || {}) as Record<string, any>;

      if (interrupted) {
        const nowStr = new Date().toISOString();

        // Agregar log de interrupción
        logsAcumulados.push({
          timestamp: nowStr,
          nivel: "warn",
          mensaje: `⚠️ Módulo [${modulo.toUpperCase()}] interrumpido por el usuario.`,
          modulo: modulo
        });

        // Limpiar el flag skip_requested
        latestConfig = {
          ...latestConfig,
          skip_requested: false,
        };

        if (i === modulos.length - 1) {
          logsAcumulados.push({
            timestamp: nowStr,
            nivel: "info",
            mensaje: `🏁 Último módulo alcanzado. Finalizando ejecución...`,
            modulo: modulo
          });

          await supabase
            .from("ejecuciones_test")
            .update({
              logs_consola: logsAcumulados,
              configuracion_json: latestConfig
            })
            .eq("id", ejecucionId);

          break; // Salir de la iteración
        } else {
          logsAcumulados.push({
            timestamp: nowStr,
            nivel: "info",
            mensaje: `➡️ Saltando al siguiente módulo...`,
            modulo: modulo
          });

          await supabase
            .from("ejecuciones_test")
            .update({
              logs_consola: logsAcumulados,
              configuracion_json: latestConfig
            })
            .eq("id", ejecucionId);

          continue; // Saltar al siguiente módulo en el bucle
        }
      } else {
        // Si no se interrumpió, completar el log final del módulo
        logsAcumulados.push(...logFin);
        await supabase
          .from("ejecuciones_test")
          .update({
            logs_consola: logsAcumulados,
          })
          .eq("id", ejecucionId);
      }
    }

    // Obtener la configuración final para determinar los módulos no saltados
    const { data: finalExec } = await supabase
      .from("ejecuciones_test")
      .select("configuracion_json")
      .eq("id", ejecucionId)
      .single();

    const finalConfig = (finalExec?.configuracion_json || {}) as Record<string, any>;
    const finalSaltados: string[] = finalConfig.modulos_saltados || [];

    const cleanedConfig = {
      ...finalConfig,
      modulo_actual: null,
      skip_requested: false
    };

    const modulosFiltrados = modulos.filter(m => !finalSaltados.includes(m));

    // 4. Generar y guardar resultados de los módulos no saltados
    await supabase
      .from("ejecuciones_test")
      .update({
        progreso: 92,
        logs_consola: [...logsAcumulados, ...endLogs],
        configuracion_json: cleanedConfig
      })
      .eq("id", ejecucionId);

    const resultados = await generarResultadosMock(ejecucionId, modulosFiltrados, url);

    if (resultados.length > 0) {
      await supabase.from("resultados_test").insert(resultados);
    }

    // 5. Marcar como completado
    await supabase
      .from("ejecuciones_test")
      .update({
        estado: "completado",
        progreso: 100,
        finalizado_en: new Date().toISOString(),
        logs_consola: [...logsAcumulados, ...endLogs],
      })
      .eq("id", ejecucionId);
  } catch (error) {
    console.error("Error en simulación:", error);
    await supabase
      .from("ejecuciones_test")
      .update({
        estado: "fallido",
        finalizado_en: new Date().toISOString(),
      })
      .eq("id", ejecucionId);
  }
}
