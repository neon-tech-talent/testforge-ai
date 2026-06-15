import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/datos-formulario?proyecto_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const proyectoId = request.nextUrl.searchParams.get("proyecto_id");

  if (!proyectoId) {
    return NextResponse.json({ error: "proyecto_id requerido" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("datos_formulario")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("creado_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/datos-formulario
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { proyecto_id, nombre_set, descripcion, datos_json } = body;

  if (!proyecto_id || !nombre_set || !datos_json) {
    return NextResponse.json(
      { error: "proyecto_id, nombre_set y datos_json son requeridos" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("datos_formulario")
    .insert({ proyecto_id, nombre_set, descripcion, datos_json })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// DELETE /api/datos-formulario?id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const { error } = await supabase.from("datos_formulario").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Set de datos eliminado" });
}
