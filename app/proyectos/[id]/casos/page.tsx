'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/Button';
import { CasoPrueba, Proyecto, Documentacion } from '@/lib/types';
import {
  ArrowLeft,
  Download,
  Zap,
  Sparkles,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Database,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function CasosPruebaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [documentos, setDocumentos] = useState<Documentacion[]>([]);
  const [casos, setCasos] = useState<CasoPrueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [migrationError, setMigrationError] = useState('');
  const [expandedCasoId, setExpandedCasoId] = useState<string | null>(null);
  const [loadingStepText, setLoadingStepText] = useState('Analizando información...');

  // Carga de datos iniciales
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setMigrationError('');
    try {
      const [proyRes, docsRes, casosRes] = await Promise.all([
        fetch(`/api/proyectos/${params.id}`),
        fetch(`/api/documentacion?proyecto_id=${params.id}`),
        fetch(`/api/proyectos/${params.id}/casos`),
      ]);

      const proyJson = await proyRes.json();
      const docsJson = await docsRes.json();
      const casosJson = await casosRes.json();

      if (!proyRes.ok) throw new Error(proyJson.error || 'Error al cargar proyecto');

      setProyecto(proyJson.data);
      setDocumentos(docsJson.data || []);

      if (casosJson.needMigration) {
        setMigrationError(casosJson.error);
        setCasos([]);
      } else {
        setCasos(casosJson.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejar cambio de texto en carga animada
  useEffect(() => {
    if (!generando) return;
    const steps = [
      'Leyendo documentación funcional del proyecto...',
      'Identificando funcionalidades y flujos troncales...',
      'Escribiendo precondiciones y datos necesarios...',
      'Estructurando los pasos y resultados esperados...',
      'Determinando criticidad e importancia...',
      'Guardando casos en base de datos Supabase...',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setLoadingStepText(steps[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [generando]);

  // Lanzar la generación por IA
  const handleGenerarCasos = async () => {
    setGenerando(true);
    setError('');
    setMigrationError('');
    setLoadingStepText('Conectando con el motor de IA Gemini...');
    try {
      const res = await fetch(`/api/proyectos/${params.id}/casos`, {
        method: 'POST',
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.needMigration) {
          setMigrationError(json.error);
          throw new Error(json.error);
        }
        throw new Error(json.error || 'Error al generar casos de prueba');
      }

      setCasos(json.data || []);
      if (json.data && json.data.length > 0) {
        setExpandedCasoId(json.data[0].id); // Expandir el primero automáticamente
      }
    } catch (err: any) {
      console.error(err);
      if (!migrationError) {
        setError(err.message || 'Error al generar casos de prueba');
      }
    } finally {
      setGenerando(false);
    }
  };

  // Exportación a Excel / XLS
  const handleExportarXLS = () => {
    if (casos.length === 0 || !proyecto) return;

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Casos de Prueba</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #1e293b; }
          table { border-collapse: collapse; width: 100%; border: 2px solid #cbd5e1; }
          .banner-header { background-color: #0f172a; color: #ffffff; font-size: 16pt; font-weight: bold; text-align: center; padding: 15px; border: 1px solid #0f172a; }
          .banner-sub { background-color: #f8fafc; color: #475569; font-size: 10pt; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
          th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 12px 10px; text-align: left; font-size: 11pt; }
          td { border: 1px solid #cbd5e1; padding: 12px 10px; vertical-align: top; font-size: 10pt; line-height: 1.5; }
          tr.even-row { background-color: #f8fafc; }
          tr.odd-row { background-color: #ffffff; }
          .crit-alta { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; border: 1px solid #fca5a5; }
          .crit-media { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; border: 1px solid #fde047; }
          .crit-baja { background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center; border: 1px solid #bbf7d0; }
          .title-id { font-family: Consolas, Monaco, monospace; font-weight: bold; color: #0284c7; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <!-- Banner Header -->
            <tr>
              <th colspan="8" class="banner-header">TESTFORGE AI — REPORTE DE CASOS DE PRUEBA TRONCALES</th>
            </tr>
            <!-- Metadata Header -->
            <tr>
              <th colspan="8" class="banner-sub">
                <b>Proyecto:</b> ${proyecto.nombre} &nbsp;&nbsp;|&nbsp;&nbsp; 
                <b>Sitio Web:</b> ${proyecto.url_sitio} &nbsp;&nbsp;|&nbsp;&nbsp; 
                <b>Fecha de Generación:</b> ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} &nbsp;&nbsp;|&nbsp;&nbsp;
                <b>Total de Casos:</b> ${casos.length}
              </th>
            </tr>
            <!-- Espaciador -->
            <tr style="height: 15px;">
              <td colspan="8" style="border: none; background-color: #ffffff;"></td>
            </tr>
            <!-- Columnas Reales -->
            <tr>
              <th width="240">ID / Título</th>
              <th width="280">Descripción</th>
              <th width="240">Precondiciones</th>
              <th width="200">Datos Requeridos</th>
              <th width="380">Pasos de Ejecución</th>
              <th width="380">Resultados Esperados por Paso</th>
              <th width="110" style="text-align: center;">Criticidad</th>
              <th width="110" style="text-align: center;">Importancia</th>
            </tr>
          </thead>
          <tbody>
    `;

    casos.forEach((caso, index) => {
      // Formatear pasos numerados en texto con saltos de línea HTML
      const pasosStr = caso.pasos.map((p, i) => `<b>Paso ${i + 1}:</b> ${p.paso.replace(/^\d+\.\s*/, '')}`).join("<br/><br/>");
      const resultadosStr = caso.pasos.map((p, i) => `<b>Esperado ${i + 1}:</b> ${p.resultado_esperado.replace(/^\d+\.\s*/, '')}`).join("<br/><br/>");

      const critClass = caso.criticidad === 'alta' ? 'crit-alta' : caso.criticidad === 'media' ? 'crit-media' : 'crit-baja';
      const impClass = caso.importancia === 'alta' ? 'crit-alta' : caso.importancia === 'media' ? 'crit-media' : 'crit-baja';
      const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';

      // Separar ID del titulo
      const partesTitulo = caso.titulo.split(':');
      const idCaso = partesTitulo[0]?.trim() || '';
      const nombreCaso = partesTitulo.slice(1).join(':')?.trim() || caso.titulo;

      tableHtml += `
        <tr class="${rowClass}">
          <td><span class="title-id">${idCaso}</span><br/><br/><b>${nombreCaso}</b></td>
          <td>${caso.descripcion || '—'}</td>
          <td>${caso.precondiciones || '—'}</td>
          <td><code>${caso.datos || '—'}</code></td>
          <td>${pasosStr}</td>
          <td>${resultadosStr}</td>
          <td class="${critClass}">${caso.criticidad.toUpperCase()}</td>
          <td class="${impClass}">${caso.importancia.toUpperCase()}</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Casos_de_Prueba_${proyecto.nombre.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExpand = (id: string) => {
    setExpandedCasoId(expandedCasoId === id ? null : id);
  };

  if (loading || !proyecto) {
    return (
      <div className="flex min-h-screen bg-forge-bg">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Cargando módulo de Casos de Prueba...</p>
        </main>
      </div>
    );
  }

  // Contar estadísticas
  const totalCasos = casos.length;
  const altaCrit = casos.filter(c => c.criticidad === 'alta').length;
  const mediaCrit = casos.filter(c => c.criticidad === 'media').length;
  const bajaCrit = casos.filter(c => c.criticidad === 'baja').length;

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push(`/proyectos/${params.id}`)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a {proyecto.nombre}
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-neon-cyan font-medium flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" />
            Casos de Prueba
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">
              Casos de Prueba con IA 📋
            </h1>
            <p className="text-sm text-gray-500">
              Diseño de pruebas troncales y de alto nivel a partir de los requisitos y especificaciones funcionales del proyecto.
            </p>
          </div>
          <div className="flex gap-3">
            {casos.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleExportarXLS}
                className="gap-2 border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/10"
              >
                <Download className="w-4 h-4" />
                Descargar .XLS
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleGenerarCasos}
              loading={generando}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4 text-forge-bg fill-forge-bg" />
              {casos.length > 0 ? 'Volver a Generar' : 'Generar Casos con IA'}
            </Button>
          </div>
        </div>

        {/* Alertas de error o migración */}
        {migrationError && (
          <div className="mb-6 p-5 bg-neon-amber/10 border border-neon-amber/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-neon-amber mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-neon-amber mb-1">
                  Tabla de Base de Datos requerida
                </h3>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Para guardar y recuperar los casos de prueba, necesitas crear la tabla `casos_prueba` en tu base de datos de Supabase.
                  Puedes hacerlo ejecutando la siguiente consulta en el <b>SQL Editor</b> de tu panel de Supabase:
                </p>
                <pre className="p-3 bg-forge-bg/80 border border-forge-border rounded-lg text-[11px] font-mono text-neon-cyan overflow-x-auto max-h-48">
{`CREATE TABLE IF NOT EXISTS public.casos_prueba (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id   UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  precondiciones TEXT,
  datos         TEXT,
  pasos         JSONB NOT NULL DEFAULT '[]',
  criticidad    TEXT CHECK (criticidad IN ('alta', 'media', 'baja')),
  importancia   TEXT CHECK (importancia IN ('alta', 'media', 'baja')),
  creado_en     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_casos_prueba_proyecto ON public.casos_prueba(proyecto_id);
ALTER TABLE public.casos_prueba ENABLE ROW LEVEL SECURITY;
CREATE POLICY "casos_prueba_acceso_publico" ON public.casos_prueba FOR ALL USING (true) WITH CHECK (true);`}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  Una vez ejecutada la consulta, recarga esta página y vuelve a presionar "Generar Casos con IA".
                </p>
              </div>
            </div>
          </div>
        )}

        {error && !migrationError && (
          <div className="mb-6 p-4 bg-neon-red/10 border border-neon-red/30 rounded-xl">
            <p className="text-sm text-neon-red">{error}</p>
          </div>
        )}

        {/* Estado Generando */}
        {generando && (
          <div className="forge-card p-12 text-center flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-neon-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Generando Casos de Prueba Troncales</h3>
            <p className="text-neon-cyan text-sm animate-pulse">{loadingStepText}</p>
            <p className="text-gray-500 text-xs mt-4 max-w-md">
              Gemini está procesando la estructura del proyecto y los {documentos.length} documento(s) funcionales para redactar escenarios de prueba óptimos.
            </p>
          </div>
        )}

        {/* Sin Casos de Prueba */}
        {!generando && casos.length === 0 && !migrationError && (
          <div className="forge-card p-16 text-center">
            <ClipboardList className="w-16 h-16 text-neon-cyan/10 mx-auto mb-4" />
            <h3 className="text-gray-300 font-bold text-lg mb-2">No se han generado casos aún</h3>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">
              {documentos.length > 0
                ? `Dispones de ${documentos.length} archivo(s) de documentación subidos (HU, Figma, etc.). La IA redactará los casos basándose en ellos.`
                : 'No tienes documentación cargada en este proyecto. Puedes cargar archivos funcionales (como Historias de Usuario en formato Markdown o texto) en la pestaña de Configuración para obtener pruebas más específicas, o generar casos troncales estándar ahora mismo.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/proyectos/${params.id}/configurar`}>
                <Button variant="secondary" className="border-forge-border">
                  Subir Documentación
                </Button>
              </Link>
              <Button variant="primary" onClick={handleGenerarCasos} className="gap-2">
                <Sparkles className="w-4 h-4 text-forge-bg fill-forge-bg" />
                Generar con IA
              </Button>
            </div>
          </div>
        )}

        {/* Listado y Resumen */}
        {!generando && casos.length > 0 && (
          <div className="space-y-6">
            {/* Resumen de estadisticas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="forge-card p-4 flex items-center justify-between border-l-4 border-l-neon-cyan">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Total Escenarios</span>
                  <p className="text-2xl font-black text-white mt-1">{totalCasos}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-neon-cyan/20" />
              </div>
              <div className="forge-card p-4 flex items-center justify-between border-l-4 border-l-neon-red">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Criticidad Alta</span>
                  <p className="text-2xl font-black text-neon-red mt-1">{altaCrit}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-neon-red/20" />
              </div>
              <div className="forge-card p-4 flex items-center justify-between border-l-4 border-l-neon-amber">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Criticidad Media</span>
                  <p className="text-2xl font-black text-neon-amber mt-1">{mediaCrit}</p>
                </div>
                <Clock className="w-8 h-8 text-neon-amber/20" />
              </div>
              <div className="forge-card p-4 flex items-center justify-between border-l-4 border-l-neon-green">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Criticidad Baja</span>
                  <p className="text-2xl font-black text-neon-green mt-1">{bajaCrit}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-neon-green/20" />
              </div>
            </div>

            {/* Listado de Casos de prueba */}
            <div className="space-y-3">
              {casos.map((caso) => {
                const isExpanded = expandedCasoId === caso.id;
                const critColor: Record<string, string> = {
                  alta: 'bg-neon-red/10 text-neon-red border-neon-red/20',
                  media: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
                  baja: 'bg-neon-green/10 text-neon-green border-neon-green/20',
                };
                const impColor: Record<string, string> = {
                  alta: 'bg-neon-red/10 text-neon-red border-neon-red/20',
                  media: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
                  baja: 'bg-neon-green/10 text-neon-green border-neon-green/20',
                };

                return (
                  <div
                    key={caso.id}
                    className={`forge-card overflow-hidden border transition-all ${
                      isExpanded ? 'border-neon-cyan/40 shadow-lg shadow-neon-cyan/5' : 'border-forge-border hover:border-neon-cyan/20'
                    }`}
                  >
                    {/* Collapsed Header */}
                    <div
                      onClick={() => toggleExpand(caso.id)}
                      className="p-5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-sm font-mono text-neon-cyan font-bold whitespace-nowrap">
                          {caso.titulo.split(':')[0]}
                        </span>
                        <h3 className="text-white font-bold text-base truncate">
                          {caso.titulo.split(':').slice(1).join(':').trim() || caso.titulo}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${critColor[caso.criticidad] || 'text-gray-400'}`}>
                          Crít: {caso.criticidad}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${impColor[caso.importancia] || 'text-gray-400'}`}>
                          Imp: {caso.importancia}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-6 border-t border-forge-border pt-5 space-y-5 animate-fade-in bg-forge-bg/30">
                        {/* Descripcion */}
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                            Descripción
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {caso.descripcion || 'Sin descripción detallada.'}
                          </p>
                        </div>

                        {/* Precondiciones y Datos */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="p-4 bg-forge-surface/50 border border-forge-border rounded-xl">
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                              Precondiciones
                            </h4>
                            <p className="text-sm text-gray-300 font-medium">
                              {caso.precondiciones || 'Ninguna precondición especificada.'}
                            </p>
                          </div>
                          <div className="p-4 bg-forge-surface/50 border border-forge-border rounded-xl">
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                              Datos Requeridos (Data / Usuario)
                            </h4>
                            <p className="text-sm text-gray-300 font-medium font-mono">
                              {caso.datos || 'No requiere datos específicos.'}
                            </p>
                          </div>
                        </div>

                        {/* Pasos y Resultados Esperados */}
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                            Paso a Paso & Resultados Esperados
                          </h4>
                          <div className="border border-forge-border rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-forge-surface text-gray-400 border-b border-forge-border">
                                <tr>
                                  <th className="p-3 w-12 text-center font-semibold">#</th>
                                  <th className="p-3 w-1/2 font-semibold">Paso de Instrucción</th>
                                  <th className="p-3 w-1/2 font-semibold">Resultado Esperado por Paso</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-forge-border bg-forge-surface/20">
                                {caso.pasos.map((p, index) => (
                                  <tr key={index} className="hover:bg-forge-surface/10 transition-colors">
                                    <td className="p-3 text-center font-mono font-bold text-neon-cyan">
                                      {index + 1}
                                    </td>
                                    <td className="p-3 text-gray-300 leading-relaxed">
                                      {p.paso.replace(/^\d+\.\s*/, '')}
                                    </td>
                                    <td className="p-3 text-neon-green/95 font-medium leading-relaxed">
                                      {p.resultado_esperado.replace(/^\d+\.\s*/, '')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
