import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/ejecuciones?proyecto_id=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const proyectoId = request.nextUrl.searchParams.get("proyecto_id");

    if (!proyectoId) {
      return NextResponse.json({ error: "proyecto_id requerido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ejecuciones_test")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("iniciado_en", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/ejecuciones
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      proyecto_id,
      tipo_accion = "bateria_tests",
      modulos_activos,
      configuracion_json = {},
    } = body;

    if (!proyecto_id || !modulos_activos?.length) {
      return NextResponse.json(
        { error: "proyecto_id y modulos_activos son requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ejecuciones_test")
      .insert({
        proyecto_id,
        tipo_accion,
        estado: "pendiente",
        modulos_activos,
        configuracion_json,
        progreso: 0,
        logs_consola: [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
