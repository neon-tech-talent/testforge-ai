-- ============================================================
-- TESTFORGE AI — Esquema de Base de Datos Supabase
-- ============================================================
-- Ejecutar en el Editor SQL de Supabase
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: proyectos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proyectos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  url_sitio     TEXT NOT NULL,
  repo_github   TEXT,
  descripcion   TEXT,
  session_id    TEXT NOT NULL,              -- Identificador de sesión anónima del navegador
  creado_en     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  actualizado_en TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para buscar proyectos por sesión
CREATE INDEX IF NOT EXISTS idx_proyectos_session ON public.proyectos(session_id);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proyectos_updated_at
  BEFORE UPDATE ON public.proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLA: documentacion
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documentacion (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id           UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  tipo_doc              TEXT NOT NULL CHECK (tipo_doc IN ('HU', 'Figma', 'PDF', 'MD', 'Texto')),
  nombre_archivo        TEXT,
  contenido_texto_o_url TEXT NOT NULL,
  tamanio_bytes         BIGINT,
  creado_en             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documentacion_proyecto ON public.documentacion(proyecto_id);

-- ============================================================
-- TABLA: datos_formulario
-- ============================================================
CREATE TABLE IF NOT EXISTS public.datos_formulario (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  nombre_set  TEXT NOT NULL,
  descripcion TEXT,
  datos_json  JSONB NOT NULL DEFAULT '[]',    -- Array de objetos: [{campo: valor}, ...]
  creado_en   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_datos_formulario_proyecto ON public.datos_formulario(proyecto_id);

-- ============================================================
-- TABLA: ejecuciones_test
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ejecuciones_test (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id       UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  tipo_accion       TEXT NOT NULL CHECK (tipo_accion IN ('bateria_tests', 'rellenado_formulario')),
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'fallido')),
  modulos_activos   TEXT[] NOT NULL DEFAULT '{}',  -- Array de IDs de módulos activos
  configuracion_json JSONB DEFAULT '{}',            -- Parámetros de estrés, selectores, etc.
  progreso          INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  iniciado_en       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  finalizado_en     TIMESTAMPTZ,
  logs_consola      JSONB DEFAULT '[]'              -- Array de {timestamp, nivel, mensaje}
);

CREATE INDEX IF NOT EXISTS idx_ejecuciones_proyecto ON public.ejecuciones_test(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_ejecuciones_estado ON public.ejecuciones_test(estado);

-- ============================================================
-- TABLA: resultados_test
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resultados_test (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ejecucion_id                UUID NOT NULL REFERENCES public.ejecuciones_test(id) ON DELETE CASCADE,
  tipo_prueba                 TEXT NOT NULL
                              CHECK (tipo_prueba IN (
                                'funcional',
                                'formulario',
                                'estres',
                                'diseno',
                                'seguridad',
                                'ortografia',
                                'accesibilidad',
                                'links_rotos'
                              )),
  nivel_severidad             TEXT NOT NULL
                              CHECK (nivel_severidad IN ('critico', 'advertencia', 'info', 'exito')),
  descripcion_error           TEXT NOT NULL,
  componente_afectado_html    TEXT,                  -- Selector CSS o fragmento HTML
  url_afectada                TEXT,                  -- URL específica donde se detectó el error
  captura_pantalla_url        TEXT,                  -- URL de Supabase Storage con screenshot
  codigo_solucion_sugerido    TEXT,                  -- Fix de código sugerido por IA (TEXT largo)
  lenguaje_codigo             TEXT DEFAULT 'html',   -- html, css, javascript, typescript
  metadatos_adicionales       JSONB DEFAULT '{}',    -- Datos extra según el tipo de prueba
  creado_en                   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resultados_ejecucion ON public.resultados_test(ejecucion_id);
CREATE INDEX IF NOT EXISTS idx_resultados_tipo ON public.resultados_test(tipo_prueba);
CREATE INDEX IF NOT EXISTS idx_resultados_severidad ON public.resultados_test(nivel_severidad);

-- ============================================================
-- TABLA: casos_prueba
-- ============================================================
CREATE TABLE IF NOT EXISTS public.casos_prueba (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id   UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  precondiciones TEXT,
  datos         TEXT,
  pasos         JSONB NOT NULL DEFAULT '[]', -- Array de {paso: string, resultado_esperado: string}
  criticidad    TEXT CHECK (criticidad IN ('alta', 'media', 'baja')),
  importancia   TEXT CHECK (importancia IN ('alta', 'media', 'baja')),
  creado_en     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_casos_prueba_proyecto ON public.casos_prueba(proyecto_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Habilitamos RLS en todas las tablas
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datos_formulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejecuciones_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casos_prueba ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS - Sin autenticación (acceso anónimo por session_id)
-- ============================================================

-- PROYECTOS: Acceso público usando anon key
CREATE POLICY "proyectos_acceso_publico"
  ON public.proyectos FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "documentacion_acceso_publico"
  ON public.documentacion FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "datos_formulario_acceso_publico"
  ON public.datos_formulario FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ejecuciones_acceso_publico"
  ON public.ejecuciones_test FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "resultados_acceso_publico"
  ON public.resultados_test FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "casos_prueba_acceso_publico"
  ON public.casos_prueba FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- FUNCIÓN: Calcular score de salud de una ejecución
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_score_salud(p_ejecucion_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_errores INTEGER;
  errores_criticos INTEGER;
  errores_advertencia INTEGER;
  errores_info INTEGER;
  score INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE nivel_severidad = 'critico'),
    COUNT(*) FILTER (WHERE nivel_severidad = 'advertencia'),
    COUNT(*) FILTER (WHERE nivel_severidad = 'info')
  INTO errores_criticos, errores_advertencia, errores_info
  FROM public.resultados_test
  WHERE ejecucion_id = p_ejecucion_id
    AND nivel_severidad != 'exito';

  total_errores := errores_criticos + errores_advertencia + errores_info;

  IF total_errores = 0 THEN
    RETURN 100;
  END IF;

  -- Fórmula ponderada: críticos -10pts, advertencias -3pts, info -1pt
  score := GREATEST(0, 100 - (errores_criticos * 10) - (errores_advertencia * 3) - (errores_info * 1));

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DATOS DE EJEMPLO PARA DESARROLLO
-- ============================================================
-- Proyecto demo
INSERT INTO public.proyectos (id, nombre, url_sitio, descripcion, session_id)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Demo E-Commerce',
  'https://demo.testforge.ai',
  'Proyecto de demostración para pruebas de la plataforma',
  'demo-session-001'
) ON CONFLICT DO NOTHING;

-- Set de datos de formulario demo
INSERT INTO public.datos_formulario (proyecto_id, nombre_set, descripcion, datos_json)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Usuarios de Prueba',
  'Set de 3 usuarios ficticios para formularios de registro',
  '[
    {"nombre": "María García", "email": "maria@test.com", "telefono": "+54 11 4567-8901", "password": "Test1234!"},
    {"nombre": "Carlos López", "email": "carlos@test.com", "telefono": "+54 11 2345-6789", "password": "Test5678!"},
    {"nombre": "Ana Martínez", "email": "ana@test.com", "telefono": "+54 11 9876-5432", "password": "Test9012!"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;
