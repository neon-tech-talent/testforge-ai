import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/resultados/[ejecucion_id]
export async function GET(
  request: NextRequest,
  { params }: { params: { ejecucion_id: string } }
) {
  const supabase = await createClient();
  const tipo = request.nextUrl.searchParams.get("tipo");

  let query = supabase
    .from("resultados_test")
    .select("*")
    .eq("ejecucion_id", params.ejecucion_id)
    .order("nivel_severidad", { ascending: true });

  if (tipo) {
    query = query.eq("tipo_prueba", tipo);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
