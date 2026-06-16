'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ModuleTogglePanel } from '@/components/configuracion/ModuleTogglePanel';
import { StressConfigPanel } from '@/components/configuracion/StressConfigPanel';
import { FormDataSelector } from '@/components/configuracion/FormDataSelector';
import { DocumentDropzone } from '@/components/configuracion/DocumentDropzone';
import { Button } from '@/components/ui/Button';
import { Proyecto, TipoPrueba } from '@/lib/types';
import {
  Zap,
  Globe,
  Github,
  ArrowLeft,
  Settings,
  Rocket,
} from 'lucide-react';

export default function ConfigurarPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loadingProyecto, setLoadingProyecto] = useState(true);

  // Módulos
  const [modulosActivos, setModulosActivos] = useState<TipoPrueba[]>([
    'funcional',
    'diseno',
    'accesibilidad',
    'links_rotos',
  ]);

  // Config estrés
  const [peticiones, setPeticiones] = useState(50);
  const [duracion, setDuracion] = useState(30);

  // Config formularios
  const [setDatosId, setSetDatosId] = useState<string | null>(null);

  // Documentación
  const [documentos, setDocumentos] = useState<
    Array<{ tipo: string; nombre?: string; preview: string; contenido: string }>
  >([]);

  // Lanzamiento
  const [lanzando, setLanzando] = useState(false);
  const [error, setError] = useState('');

  const fetchProyecto = useCallback(async () => {
    try {
      const res = await fetch(`/api/proyectos/${params.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProyecto(json.data);
    } catch {
      router.push('/proyectos');
    } finally {
      setLoadingProyecto(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchProyecto();
  }, [fetchProyecto]);

  const handleDocumentAdded = (content: string, tipo: string, nombre?: string) => {
    setDocumentos((prev) => [
      ...prev,
      { tipo, nombre, preview: content.slice(0, 100), contenido: content },
    ]);
  };

  const handleDocumentRemoved = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLanzar = async () => {
    if (modulosActivos.length === 0) {
      setError('Debes activar al menos un módulo de testing.');
      return;
    }
    setError('');
    setLanzando(true);

    try {
      // 1. Subir documentos si los hay
      for (const doc of documentos) {
        await fetch('/api/documentacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proyecto_id: params.id,
            tipo_doc: doc.tipo,
            nombre_archivo: doc.nombre,
            contenido_texto_o_url: doc.contenido,
          }),
        });
      }

      // 2. Crear ejecución
      const ejecRes = await fetch('/api/ejecuciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: params.id,
          tipo_accion: 'bateria_tests',
          modulos_activos: modulosActivos,
          configuracion_json: {
            peticiones_concurrentes: peticiones,
            duracion_segundos: duracion,
            set_datos_id: setDatosId,
            url_objetivo: proyecto?.url_sitio,
          },
        }),
      });

      const ejecJson = await ejecRes.json();
      if (!ejecRes.ok) throw new Error(ejecJson.error || 'Error al crear ejecución');

      const ejecucionId = ejecJson.data.id;

      // 3. Redirigir al monitor (el monitor se encargará de iniciar la simulación)
      router.push(`/proyectos/${params.id}/monitor?ejecucion=${ejecucionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al lanzar la batería');
      setLanzando(false);
    }
  };

  if (loadingProyecto) {
    return (
      <div className="flex min-h-screen bg-forge-bg">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const mostrarStress = modulosActivos.includes('estres');
  const mostrarFormularios = modulosActivos.includes('formulario');
  const mostrarDocs =
    modulosActivos.includes('funcional') || modulosActivos.includes('ortografia');

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push('/proyectos')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Proyectos
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-gray-400">{proyecto?.nombre}</span>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-neon-cyan font-medium flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" />
            Configurar
          </span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">{proyecto?.nombre}</h1>
            <div className="flex items-center gap-4 mt-2">
              <a
                href={proyecto?.url_sitio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-neon-cyan/70 hover:text-neon-cyan transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {proyecto?.url_sitio}
              </a>
              {proyecto?.repo_github && (
                <a
                  href={proyecto.repo_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Repositorio
                </a>
              )}
            </div>
          </div>
          {/* Botón principal */}
          <Button
            variant="primary"
            size="lg"
            loading={lanzando}
            onClick={handleLanzar}
            className="gap-2"
          >
            <Rocket className="w-5 h-5" />
            Desplegar Batería de Agentes
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-neon-red/10 border border-neon-red/30 rounded-xl">
            <p className="text-sm text-neon-red">{error}</p>
          </div>
        )}

        {/* Panel de módulos */}
        <div className="mb-8">
          <ModuleTogglePanel
            modulosActivos={modulosActivos}
            onChange={setModulosActivos}
          />
        </div>

        {/* Sub-paneles condicionales */}
        <div className="space-y-5">
          {mostrarStress && (
            <StressConfigPanel
              peticiones={peticiones}
              duracion={duracion}
              onPeticionesChange={setPeticiones}
              onDuracionChange={setDuracion}
            />
          )}

          {mostrarFormularios && proyecto && (
            <FormDataSelector
              proyectoId={proyecto.id}
              selectedId={setDatosId}
              onSelect={setSetDatosId}
            />
          )}

          {mostrarDocs && (
            <div className="forge-card p-5">
              <DocumentDropzone
                onDocumentAdded={handleDocumentAdded}
                documentos={documentos}
                onDocumentRemoved={handleDocumentRemoved}
              />
            </div>
          )}
        </div>

        {/* Info final */}
        <div className="mt-8 p-5 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-neon-cyan mb-1">
                {modulosActivos.length} módulo{modulosActivos.length !== 1 ? 's' : ''} seleccionado{modulosActivos.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">
                Al hacer clic en "Desplegar", los agentes de IA analizarán{' '}
                <span className="text-gray-300 font-medium">{proyecto?.url_sitio}</span> y
                generarán un informe completo con sugerencias de código.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
