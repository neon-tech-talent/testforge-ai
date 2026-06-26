import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/documentacion?proyecto_id=xxx
export async function GET(request: NextRequest) {
  try {
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/documentacion
export async function POST(request: NextRequest) {
  try {
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

    // Extraer texto real si el documento es un PDF codificado en base64
    let textoFinal = contenido_texto_o_url;
    if (tipo_doc === "PDF" && contenido_texto_o_url.startsWith("data:application/pdf;base64,")) {
      try {
        const pdf = require("pdf-parse");
        const base64Data = contenido_texto_o_url.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const pdfData = await pdf(buffer);
        textoFinal = pdfData.text || "";
      } catch (parseErr: any) {
        console.error("Error al parsear PDF:", parseErr);
        return NextResponse.json(
          { error: `No se pudo extraer el texto del PDF: ${parseErr.message}` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("documentacion")
      .insert({
        proyecto_id,
        tipo_doc,
        nombre_archivo,
        contenido_texto_o_url: textoFinal,
        tamanio_bytes,
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
