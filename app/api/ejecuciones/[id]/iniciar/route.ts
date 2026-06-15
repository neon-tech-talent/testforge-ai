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
    // 1. Marcar como en_progreso
    await supabase
      .from("ejecuciones_test")
      .update({ estado: "en_progreso", progreso: 5 })
      .eq("id", ejecucionId);

    // 2. Generar logs simulados
    const logs = generarLogs(modulos, url);

    // 3. Simular progreso por módulo
    const progresoIncremento = Math.floor(85 / Math.max(modulos.length, 1));
    let progresoActual = 5;

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];
      const logsModulo = logs.filter((l) => l.modulo === modulo);

      // Actualizar progreso del módulo
      progresoActual = Math.min(90, progresoActual + progresoIncremento);

      await supabase
        .from("ejecuciones_test")
        .update({
          progreso: progresoActual,
          logs_consola: logs.slice(0, Math.floor((i + 1) * (logs.length / modulos.length))),
        })
        .eq("id", ejecucionId);

      // Delay realista por módulo (2-4 segundos)
      await delay(2000 + Math.random() * 2000);
    }

    // 4. Generar y guardar resultados
    await supabase
      .from("ejecuciones_test")
      .update({ progreso: 92, logs_consola: logs })
      .eq("id", ejecucionId);

    const resultados = await generarResultadosMock(ejecucionId, modulos, url);

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
        logs_consola: logs,
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
