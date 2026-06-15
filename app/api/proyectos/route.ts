import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/proyectos?session_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id requerido" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("session_id", sessionId)
    .order("creado_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/proyectos
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { nombre, url_sitio, repo_github, descripcion, session_id } = body;

  if (!nombre || !url_sitio || !session_id) {
    return NextResponse.json(
      { error: "nombre, url_sitio y session_id son requeridos" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("proyectos")
    .insert({ nombre, url_sitio, repo_github, descripcion, session_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
