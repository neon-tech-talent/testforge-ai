import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/ejecuciones/[id]/saltar
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  const ejecucionId = params.id;

  // Obtener la ejecución actual
  const { data: ejecucion, error: fetchError } = await supabase
    .from("ejecuciones_test")
    .select("*")
    .eq("id", ejecucionId)
    .single();

  if (fetchError || !ejecucion) {
    return NextResponse.json({ error: "Ejecución no encontrada" }, { status: 404 });
  }

  if (ejecucion.estado !== "en_progreso") {
    return NextResponse.json(
      { error: "La ejecución no está en progreso y no se puede interrumpir" },
      { status: 400 }
    );
  }

  const configuracion = ejecucion.configuracion_json || {};
  const moduloActual = configuracion.modulo_actual;

  if (!moduloActual) {
    return NextResponse.json(
      { error: "No hay un módulo activo en ejecución en este momento" },
      { status: 400 }
    );
  }

  // Agregar a modulos_saltados y marcar skip_requested como true
  const modulosSaltados = configuracion.modulos_saltados || [];
  if (!modulosSaltados.includes(moduloActual)) {
    modulosSaltados.push(moduloActual);
  }

  const nuevaConfiguracion = {
    ...configuracion,
    skip_requested: true,
    modulos_saltados: modulosSaltados,
  };

  const { data: updatedData, error: updateError } = await supabase
    .from("ejecuciones_test")
    .update({ configuracion_json: nuevaConfiguracion })
    .eq("id", ejecucionId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Interrupción solicitada",
    data: updatedData,
  });
}
