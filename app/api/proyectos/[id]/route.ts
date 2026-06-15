import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/proyectos/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data: proyecto, error: proyectoError } = await supabase
    .from("proyectos")
    .select("*")
    .eq("id", params.id)
    .single();

  if (proyectoError || !proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  // Obtener última ejecución
  const { data: ultimaEjecucion } = await supabase
    .from("ejecuciones_test")
    .select("*")
    .eq("proyecto_id", params.id)
    .order("iniciado_en", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ data: { ...proyecto, ultima_ejecucion: ultimaEjecucion } });
}

// PUT /api/proyectos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("proyectos")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/proyectos/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proyectos")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Proyecto eliminado" });
}
