import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generarYGuardarCasosDePrueba } from "@/lib/casos-helper";

// GET /api/proyectos/[id]/casos
// Obtiene todos los casos de prueba guardados para un proyecto
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: casos, error } = await supabase
      .from("casos_prueba")
      .select("*")
      .eq("proyecto_id", params.id)
      .order("creado_en", { ascending: true });

    if (error) {
      if (error.code === "P0001" || error.code === "42P01" || error.message.includes("does not exist")) {
        return NextResponse.json({
          data: [],
          needMigration: true,
          error: "La tabla 'casos_prueba' no existe en la base de datos de Supabase. Por favor, ejecuta el script SQL 'supabase/alter_casos_prueba.sql' en tu editor SQL de Supabase."
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: casos || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/proyectos/[id]/casos
// Genera y guarda casos de prueba usando IA (Gemini) basados en la documentación y datos del proyecto
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const casos = await generarYGuardarCasosDePrueba(params.id);
    return NextResponse.json({ data: casos });
  } catch (err: any) {
    console.error("Error en POST /api/proyectos/[id]/casos:", err);
    if (err.message.includes("does not exist") || err.message.includes("42P01")) {
      return NextResponse.json({
        error: "La tabla 'casos_prueba' no existe en Supabase. Por favor, ejecuta el script SQL 'supabase/alter_casos_prueba.sql' en tu panel de Supabase SQL Editor para habilitarla.",
        needMigration: true
      }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
