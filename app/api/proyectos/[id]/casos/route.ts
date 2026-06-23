import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
      // Si la tabla no existe o falla la query, capturamos el error
      if (error.code === "P0001" || error.message.includes("does not exist")) {
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

// POST /api/proyectos/[id]/casos/generar
// Genera casos de prueba usando IA (Gemini) basados en la documentación y datos del proyecto
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // 1. Obtener datos del proyecto
    const { data: proyecto, error: proyectoError } = await supabase
      .from("proyectos")
      .select("*")
      .eq("id", params.id)
      .single();

    if (proyectoError || !proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    // 2. Obtener documentación funcional disponible
    const { data: docs } = await supabase
      .from("documentacion")
      .select("*")
      .eq("proyecto_id", params.id);

    let docTexto = "";
    if (docs && docs.length > 0) {
      docTexto = docs
        .map((d: any) => `[Tipo: ${d.tipo_doc}, Archivo: ${d.nombre_archivo || 'Sin nombre'}]\n${d.contenido_texto_o_url}`)
        .join("\n\n---\n\n");
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    let casosGenerados: any[] = [];

    if (geminiKey) {
      const prompt = `
Eres un QA Automation y Manual Lead AI. Tu tarea es analizar la información del proyecto y su documentación adjunta para diseñar Casos de Prueba (Test Cases) de alto nivel o troncales.

INFORMACIÓN DEL PROYECTO:
- Nombre: ${proyecto.nombre}
- URL: ${proyecto.url_sitio}
- Descripción: ${proyecto.descripcion || "No provista"}

DOCUMENTACIÓN Y REQUISITOS DEL PROYECTO:
${docTexto || "No hay documentación adjunta. Diseña casos de prueba troncales estándar basados en el nombre, URL y descripción del proyecto."}

REGLAS DE DISEÑO DE LOS CASOS DE PRUEBA:
1. Deben ser TRONCALES (core / high-level). No deben entrar en detalles minuciosos o flujos de nicho. Deben atacar directamente las funcionalidades y flujos principales de la aplicación (por ejemplo: Registro, Inicio de Sesión, Navegación Principal, Compra/Checkout, Envío de Formularios Clave, etc.).
2. Deben cubrir entre 5 y 8 escenarios clave de forma balanceada.
3. Convención de nomenclatura de ID para los Casos de Prueba (OBLIGATORIA):
   - Debes buscar códigos identificadores o nombres clave de las Historias de Usuario (HU) en el texto de la documentación (por ejemplo, 'LOG64_login', 'US-12', 'COMPRA-01', 'REG42', etc.).
   - Si encuentras un identificador o nombre de Historia de Usuario (ej. 'LOG64_login'), el ID del caso de prueba debe comenzar estrictamente con 'cp_[ID_HISTORIA_DE_USUARIO]_[CORRELATIVO]' (por ejemplo: 'cp_LOG64_login_001', 'cp_LOG64_login_002', etc.).
   - Si la documentación no contiene un identificador claro, o si no hay documentación de Historias de Usuario, utiliza el formato 'cp_[FUNCIONALIDAD]_[CORRELATIVO]' deducido de la funcionalidad analizada (por ejemplo: 'cp_login_001', 'cp_registro_002', 'cp_carrito_003', etc.).
   - El título completo del caso en el campo "titulo" debe estar formateado como: "[ID_CASO]: [Nombre descriptivo corto del caso]". Ejemplo: "cp_LOG64_login_001: Verificación de login exitoso con credenciales correctas".
4. Cada caso debe tener obligatoriamente los siguientes campos:
   - "titulo": El título formateado según la regla 3 anterior.
   - "descripcion": Explicación corta y concisa del objetivo de la prueba.
   - "precondiciones": Estado requerido del sistema antes de iniciar la prueba.
   - "datos": Datos requeridos, usuarios de prueba, inputs del formulario, etc.
   - "pasos": Un array de objetos, donde cada objeto representa un paso numerado y su resultado esperado. Ejemplo: [{"paso": "1. Ingresar a...", "resultado_esperado": "Se visualiza la pantalla..."}, {"paso": "2. Hacer click en...", "resultado_esperado": "Se muestra..."}]
   - "criticidad": Debe ser únicamente una de las siguientes opciones: "alta", "media", "baja".
   - "importancia": Debe ser únicamente una de las siguientes opciones: "alta", "media", "baja".

Responde ÚNICAMENTE con un array de objetos JSON con la estructura exacta detallada abajo. No incluyas markdown (como \`\`\`json ... \`\`\`), ni introducciones, ni comentarios adicionales. Tu respuesta debe ser puramente el string del JSON array.

ESTRUCTURA DE RESPUESTA REQUERIDA (Ejemplo JSON):
[
  {
    "titulo": "cp_LOG64_login_001: [Nombre del caso]",
    "descripcion": "[Detalle de la prueba]",
    "precondiciones": "[Precondiciones]",
    "datos": "[Datos de prueba o usuario]",
    "pasos": [
      { "paso": "1. [Descripción del paso]", "resultado_esperado": "[Resultado esperado del paso 1]" },
      { "paso": "2. [Descripción del paso]", "resultado_esperado": "[Resultado esperado del paso 2]" }
    ],
    "criticidad": "alta",
    "importancia": "alta"
  }
]
`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const resJson = await geminiRes.json();
        const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
        try {
          casosGenerados = JSON.parse(rawText.trim());
        } catch (parseErr) {
          console.error("Error al parsear JSON de Gemini:", parseErr, rawText);
          casosGenerados = [];
        }
      } else {
        console.error("Error en respuesta de Gemini API:", await geminiRes.text());
      }
    }

    // Fallback en caso de que no haya API key o falle la consulta
    if (casosGenerados.length === 0) {
      casosGenerados = obtenerCasosPruebaFallback(proyecto);
    }

    // 3. Guardar los casos de prueba generados en la base de datos
    // Primero eliminamos los casos anteriores para este proyecto
    const { error: deleteError } = await supabase
      .from("casos_prueba")
      .delete()
      .eq("proyecto_id", params.id);

    if (deleteError) {
      // Si la tabla no existe, notificamos al usuario sobre la necesidad del script SQL
      if (deleteError.code === "42P01" || deleteError.message.includes("does not exist")) {
        return NextResponse.json({
          error: "La tabla 'casos_prueba' no existe en Supabase. Por favor, ejecuta el script SQL 'supabase/alter_casos_prueba.sql' en tu panel de Supabase SQL Editor para habilitarla.",
          needMigration: true
        }, { status: 400 });
      }
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insertamos los nuevos casos
    const casosInsertar = casosGenerados.map((caso) => ({
      proyecto_id: params.id,
      titulo: caso.titulo,
      descripcion: caso.descripcion,
      precondiciones: caso.precondiciones,
      datos: caso.datos,
      pasos: caso.pasos,
      criticidad: caso.criticidad || "media",
      importancia: caso.importancia || "media",
    }));

    const { data: casosGuardados, error: insertError } = await supabase
      .from("casos_prueba")
      .insert(casosInsertar)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: casosGuardados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Genera casos de prueba genéricos de calidad si falla la IA
function obtenerCasosPruebaFallback(proyecto: any) {
  const esEcommerce = proyecto.nombre.toLowerCase().includes("shop") || 
                      proyecto.nombre.toLowerCase().includes("ecommerce") || 
                      proyecto.nombre.toLowerCase().includes("tienda") ||
                      proyecto.nombre.toLowerCase().includes("store") ||
                      proyecto.url_sitio.toLowerCase().includes("shop") ||
                      proyecto.url_sitio.toLowerCase().includes("store");

  if (esEcommerce) {
    return [
      {
        titulo: "cp_checkout_001: Flujo de Compra de Producto (Checkout Completo)",
        descripcion: "Verificar que un usuario pueda seleccionar un producto, agregarlo al carrito y finalizar la compra de forma exitosa.",
        precondiciones: "Productos con stock disponibles en el sitio.",
        datos: "Usuario registrado: test_user@tienda.com, Tarjeta Visa Demo: 4000 1234 5678 9010",
        pasos: [
          { paso: "1. Acceder a la página de inicio e ingresar al catálogo de productos", resultado_esperado: "Se visualizan las tarjetas de productos con sus precios y botón de agregar." },
          { paso: "2. Hacer clic en 'Agregar al carrito' en un producto", resultado_esperado: "El contador del carrito en el header se incrementa en 1 unidad." },
          { paso: "3. Abrir el carrito y presionar el botón 'Proceder al Pago'", resultado_esperado: "Se muestra el formulario para ingresar datos de envío y facturación." },
          { paso: "4. Completar datos de envío y proceder al pago con tarjeta demo", resultado_esperado: "Se procesa el pago de forma exitosa y se muestra pantalla de confirmación con el ID de la orden." }
        ],
        criticidad: "alta",
        importancia: "alta"
      },
      {
        titulo: "cp_busqueda_002: Búsqueda y Filtrado de Productos en Catálogo",
        descripcion: "Validar que el motor de búsqueda y filtros retorne resultados coherentes según el criterio del usuario.",
        precondiciones: "Catálogo cargado con múltiples productos y categorías.",
        datos: "Término de búsqueda: 'Remera', Rango de precios: $5000 a $15000",
        pasos: [
          { paso: "1. Escribir el término en la barra de búsqueda superior y presionar Enter", resultado_esperado: "Se listan únicamente productos que tengan el término en el título o descripción." },
          { paso: "2. Aplicar filtro de precio seleccionando el rango deseado en la barra lateral", resultado_esperado: "Los resultados en pantalla se actualizan mostrando solo aquellos en el rango de precios." }
        ],
        criticidad: "media",
        importancia: "alta"
      },
      {
        titulo: "cp_login_003: Inicio de Sesión de Usuario (Login)",
        descripcion: "Verificar el acceso seguro a la plataforma con credenciales registradas.",
        precondiciones: "Cuenta de usuario creada previamente y activa.",
        datos: "Email: usuario@ejemplo.com, Password: PasswordSegura123",
        pasos: [
          { paso: "1. Dirigirse a la sección de Login", resultado_esperado: "Se muestra el formulario pidiendo correo y contraseña." },
          { paso: "2. Introducir correo y contraseña correctos y hacer clic en 'Iniciar Sesión'", resultado_esperado: "Se redirige a la cuenta personal, mostrando el nombre de usuario en el header." }
        ],
        criticidad: "alta",
        importancia: "alta"
      },
      {
        titulo: "cp_carrito_004: Gestión de Carrito de Compras (Modificaciones)",
        descripcion: "Validar la edición de cantidades y eliminación de productos dentro del carrito.",
        precondiciones: "Al menos un producto previamente agregado al carrito.",
        datos: "Producto en carrito, Nueva cantidad: 3",
        pasos: [
          { paso: "1. Abrir la vista detallada del carrito", resultado_esperado: "Se lista el producto agregado con cantidad actual y total parcial." },
          { paso: "2. Incrementar la cantidad del producto a 3 usando el selector de cantidad", resultado_esperado: "El total del carrito se recalcula automáticamente reflejando el nuevo total." },
          { paso: "3. Hacer clic en el icono de papelera / botón 'Eliminar'", resultado_esperado: "El producto se remueve del carrito y se muestra el mensaje 'Tu carrito está vacío'." }
        ],
        criticidad: "media",
        importancia: "media"
      },
      {
        titulo: "cp_contacto_005: Formulario de Contacto y Soporte",
        descripcion: "Verificar el correcto envío de mensajes de soporte técnico por parte de usuarios o visitantes.",
        precondiciones: "Formulario de contacto accesible en el sitio.",
        datos: "Nombre: Juan Pérez, Email: juan@soporte.com, Asunto: Consulta de envío, Mensaje: ¿Hacen envíos los sábados?",
        pasos: [
          { paso: "1. Navegar a la página de Contacto", resultado_esperado: "Se presenta el formulario con los campos correspondientes." },
          { paso: "2. Completar todos los campos con datos válidos y hacer clic en 'Enviar Mensaje'", resultado_esperado: "Se muestra un modal o alerta de éxito: 'Mensaje enviado correctamente. Nos contactaremos a la brevedad'." }
        ],
        criticidad: "baja",
        importancia: "media"
      }
    ];
  }

  // Fallback genérico para cualquier sitio web
  return [
    {
      titulo: "cp_home_001: Navegación y Carga de la Página de Inicio (Home)",
      descripcion: "Validar que la página de inicio carga de forma correcta, rápida y los enlaces principales responden sin errores.",
      precondiciones: "El sitio web se encuentra en línea.",
      datos: "Ninguno",
      pasos: [
        { paso: "1. Ingresar la URL del sitio web en el navegador", resultado_esperado: "La página carga completamente y se muestran el logo, header, secciones y footer sin errores de renderizado." },
        { paso: "2. Hacer clic en los enlaces de navegación principales", resultado_esperado: "El usuario navega a las secciones deseadas sin enlaces rotos (código HTTP 200)." }
      ],
      criticidad: "alta",
      importancia: "alta"
    },
    {
      titulo: "cp_registro_002: Formulario de Registro de Nuevo Usuario",
      descripcion: "Verificar la creación exitosa de una cuenta llenando los datos obligatorios del formulario.",
      precondiciones: "Formulario de registro accesible en el sitio.",
      datos: "Nombre: QA User, Email: qa_test_user@servidor.com, Password: PasswordCompleja.99",
      pasos: [
        { paso: "1. Navegar a la página de Registro", resultado_esperado: "Se despliega el formulario de registro con campos requeridos identificados." },
        { paso: "2. Completar el formulario y hacer clic en el botón 'Crear Cuenta'", resultado_esperado: "El sistema confirma el registro, redirige a la pantalla de bienvenida o solicita verificación de correo." }
      ],
      criticidad: "alta",
      importancia: "alta"
    },
    {
      titulo: "cp_contacto_003: Formulario de Contacto y Feedback",
      descripcion: "Validar el envío de comentarios y mensajes mediante el formulario de contacto principal.",
      precondiciones: "Ninguna.",
      datos: "Nombre: Tester, Email: test@test.com, Mensaje: Felicitaciones por la plataforma TestForge AI.",
      pasos: [
        { paso: "1. Navegar a la sección de Contacto", resultado_esperado: "Se visualiza el formulario de contacto con campos Nombre, Correo y Mensaje." },
        { paso: "2. Rellenar los campos requeridos y hacer clic en 'Enviar'", resultado_esperado: "El sistema procesa el formulario de forma exitosa mostrando un mensaje de confirmación en pantalla." }
      ],
      criticidad: "media",
      importancia: "media"
    },
    {
      titulo: "cp_responsive_004: Diseño Responsivo (Visualización en Mobile)",
      descripcion: "Verificar la correcta adaptación del diseño del sitio web en dispositivos móviles.",
      precondiciones: "Resolución de pantalla móvil activa (ej. 375px ancho).",
      datos: "Viewport móvil (ej. iPhone X)",
      pasos: [
        { paso: "1. Redimensionar el navegador o emular pantalla móvil", resultado_esperado: "El menú de navegación superior colapsa en un menú hamburguesa y el contenido se apila verticalmente de forma fluida." },
        { paso: "2. Abrir el menú hamburguesa y navegar por el sitio", resultado_esperado: "El menú abre correctamente y permite hacer clic en los enlaces de navegación sin solapamientos visuales." }
      ],
      criticidad: "media",
      importancia: "alta"
    },
    {
      titulo: "cp_validaciones_005: Validación de Campos Obligatorios y Errores",
      descripcion: "Verificar que el sistema muestra mensajes de validación ante el envío de datos incompletos o inválidos en formularios.",
      precondiciones: "Acceso a cualquier formulario con campos requeridos (ej. login o registro).",
      datos: "Campos vacíos o formato de email incorrecto (ej: 'usuario_invalido')",
      pasos: [
        { paso: "1. Dejar vacíos los campos obligatorios del formulario y presionar el botón de envío", resultado_esperado: "Se detiene el envío y los campos vacíos se resaltan en rojo con leyendas explicativas." },
        { paso: "2. Escribir un correo electrónico con formato inválido y presionar enviar", resultado_esperado: "El sistema muestra un mensaje indicando que el formato del correo es inválido." }
      ],
      criticidad: "baja",
      importancia: "media"
    }
  ];
}
