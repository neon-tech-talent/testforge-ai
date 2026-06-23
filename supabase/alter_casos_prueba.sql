-- SQL Alter Script to create casos_prueba table
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

-- Habilitar RLS
ALTER TABLE public.casos_prueba ENABLE ROW LEVEL SECURITY;

-- Política de acceso público
CREATE POLICY "casos_prueba_acceso_publico"
  ON public.casos_prueba FOR ALL
  USING (true)
  WITH CHECK (true);
