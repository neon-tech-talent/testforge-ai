'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { HealthScoreGauge } from '@/components/reporte/HealthScoreGauge';
import { ResultTabPanel } from '@/components/reporte/ResultTabPanel';
import { Button } from '@/components/ui/Button';
import { EjecucionTest, Proyecto, ResultadoTest, TipoPrueba } from '@/lib/types';
import { calcularScoreSalud } from '@/lib/mock-engine';
import {
  ArrowLeft,
  Download,
  Settings,
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function ReportePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ejecucionId = searchParams.get('ejecucion');

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [ejecucion, setEjecucion] = useState<EjecucionTest | null>(null);
  const [resultados, setResultados] = useState<ResultadoTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!ejecucionId) return;
    try {
      const [proyRes, ejecRes, resRes] = await Promise.all([
        fetch(`/api/proyectos/${params.id}`),
        fetch(`/api/ejecuciones/${ejecucionId}`),
        fetch(`/api/resultados/${ejecucionId}`),
      ]);

      const [proyJson, ejecJson, resJson] = await Promise.all([
        proyRes.json(),
        ejecRes.json(),
        resRes.json(),
      ]);

      setProyecto(proyJson.data);
      setEjecucion(ejecJson.data);
      setResultados(resJson.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id, ejecucionId]);

  useEffect(() => {
    if (!ejecucionId) {
      router.push(`/proyectos/${params.id}/configurar`);
      return;
    }
    fetchData();
  }, [ejecucionId, fetchData, params.id, router]);

  if (!ejecucionId) return null;

  const score = calcularScoreSalud(resultados);
  const criticos = resultados.filter((r) => r.nivel_severidad === 'critico').length;
  const advertencias = resultados.filter((r) => r.nivel_severidad === 'advertencia').length;
  const infos = resultados.filter((r) => r.nivel_severidad === 'info').length;
  const exitos = resultados.filter((r) => r.nivel_severidad === 'exito').length;
  const totalErrores = criticos + advertencias + infos;

  const modulosActivos = ejecucion?.modulos_activos as TipoPrueba[] | undefined;

  const duracionMs = ejecucion?.finalizado_en
    ? new Date(ejecucion.finalizado_en).getTime() -
      new Date(ejecucion.iniciado_en).getTime()
    : null;
  const duracionLabel = duracionMs
    ? duracionMs < 60000
      ? `${Math.round(duracionMs / 1000)}s`
      : `${Math.floor(duracionMs / 60000)}m ${Math.round((duracionMs % 60000) / 1000)}s`
    : '—';

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid">
        {/* Breadcrumb */}
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
            <Zap className="w-3.5 h-3.5" />
            Reporte
          </span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">
              Informe de Resultados
            </h1>
            <p className="text-sm text-gray-500">
              {proyecto?.nombre} — {proyecto?.url_sitio}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Link href={`/proyectos/${params.id}/configurar`}>
              <Button variant="primary" className="gap-2">
                <Settings className="w-4 h-4" />
                Nueva Ejecución
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Cargando informe...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Gauge */}
              <div className="forge-card p-8 flex flex-col items-center justify-center">
                <HealthScoreGauge score={score} />
              </div>

              {/* Stats */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="forge-card p-5 border-l-4 border-l-neon-red">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Críticos
                    </span>
                    <XCircle className="w-4 h-4 text-neon-red" />
                  </div>
                  <p className="text-4xl font-black text-neon-red">{criticos}</p>
                  <p className="text-xs text-gray-600 mt-1">errores críticos</p>
                </div>

                <div className="forge-card p-5 border-l-4 border-l-neon-amber">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Advertencias
                    </span>
                    <AlertTriangle className="w-4 h-4 text-neon-amber" />
                  </div>
                  <p className="text-4xl font-black text-neon-amber">{advertencias}</p>
                  <p className="text-xs text-gray-600 mt-1">puntos a revisar</p>
                </div>

                <div className="forge-card p-5 border-l-4 border-l-neon-cyan">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Info
                    </span>
                    <Info className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <p className="text-4xl font-black text-neon-cyan">{infos}</p>
                  <p className="text-xs text-gray-600 mt-1">observaciones</p>
                </div>

                <div className="forge-card p-5 border-l-4 border-l-neon-green">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Superados
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  </div>
                  <p className="text-4xl font-black text-neon-green">{exitos}</p>
                  <p className="text-xs text-gray-600 mt-1">verificaciones OK</p>
                </div>

                {/* Metadata */}
                <div className="col-span-2 forge-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      Duración: <span className="text-gray-200 font-medium">{duracionLabel}</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-500">
                      <Zap className="w-3.5 h-3.5 text-neon-cyan" />
                      Módulos: <span className="text-gray-200 font-medium">{modulosActivos?.length || 0}</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-500">
                      Total issues:{' '}
                      <span className="text-gray-200 font-medium">{totalErrores}</span>
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      ejecucion?.estado === 'completado'
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                        : 'bg-neon-red/10 text-neon-red border border-neon-red/30'
                    }`}
                  >
                    {ejecucion?.estado?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs de resultados */}
            <div className="forge-card p-6">
              <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-cyan" />
                Resultados por Módulo
                <span className="ml-auto text-sm text-gray-500 font-normal">
                  {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} total
                </span>
              </h2>

              {resultados.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    No hay resultados disponibles aún. La ejecución puede estar en progreso.
                  </p>
                  <Link
                    href={`/proyectos/${params.id}/monitor?ejecucion=${ejecucionId}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Ver Monitor en Tiempo Real
                  </Link>
                </div>
              ) : (
                <ResultTabPanel
                  resultados={resultados}
                  modulosActivos={modulosActivos || []}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
