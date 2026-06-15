import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/documentacion?proyecto_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const proyectoId = request.nextUrl.searchParams.get("proyecto_id");

  if (!proyectoId) {
    return NextResponse.json({ error: "proyecto_id requerido" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documentacion")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("creado_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/documentacion
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    proyecto_id,
    tipo_doc,
    nombre_archivo,
    contenido_texto_o_url,
    tamanio_bytes,
  } = body;

  if (!proyecto_id || !tipo_doc || !contenido_texto_o_url) {
    return NextResponse.json(
      { error: "proyecto_id, tipo_doc y contenido_texto_o_url son requeridos" },
      { status: 400 }
    );
  }

  const tiposValidos = ["HU", "Figma", "PDF", "MD", "Texto"];
  if (!tiposValidos.includes(tipo_doc)) {
    return NextResponse.json(
      { error: `tipo_doc debe ser uno de: ${tiposValidos.join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("documentacion")
    .insert({
      proyecto_id,
      tipo_doc,
      nombre_archivo,
      contenido_texto_o_url,
      tamanio_bytes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
