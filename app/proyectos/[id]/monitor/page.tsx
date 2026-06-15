'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ExecutionMonitor } from '@/components/monitor/ExecutionMonitor';
import { Button } from '@/components/ui/Button';
import { Proyecto } from '@/lib/types';
import {
  ArrowLeft,
  BarChart2,
  Settings,
  Zap,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function MonitorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ejecucionId = searchParams.get('ejecucion');

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [completado, setCompletado] = useState(false);
  const [tiempoInicio] = useState(new Date());
  const [tiempoActual, setTiempoActual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTiempoActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ejecucionId) {
      router.push(`/proyectos/${params.id}/configurar`);
      return;
    }
    fetch(`/api/proyectos/${params.id}`)
      .then((r) => r.json())
      .then((json) => setProyecto(json.data));
  }, [params.id, ejecucionId, router]);

  const handleCompleted = useCallback(() => {
    setCompletado(true);
  }, []);

  const elapsedSeconds = Math.round(
    (tiempoActual.getTime() - tiempoInicio.getTime()) / 1000
  );
  const elapsedLabel =
    elapsedSeconds < 60
      ? `${elapsedSeconds}s`
      : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;

  if (!ejecucionId) return null;

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
            Monitor
          </span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">
              Monitor de Ejecución
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Tiempo: {elapsedLabel}
              </span>
              <span className="font-mono text-xs text-gray-600">
                ID: {ejecucionId.slice(0, 8)}...
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {completado && (
              <Link href={`/proyectos/${params.id}/reporte?ejecucion=${ejecucionId}`}>
                <Button variant="primary" className="gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Ver Reporte Final
                </Button>
              </Link>
            )}
            <Link href={`/proyectos/${params.id}/configurar`}>
              <Button variant="secondary" className="gap-2">
                <Settings className="w-4 h-4" />
                Nueva Ejecución
              </Button>
            </Link>
          </div>
        </div>

        {/* Alerta de completado */}
        {completado && (
          <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-neon-green rounded-full" />
              <p className="text-neon-green font-semibold text-sm">
                ✅ Batería de agentes completada — El informe está listo
              </p>
            </div>
            <Link href={`/proyectos/${params.id}/reporte?ejecucion=${ejecucionId}`}>
              <Button variant="primary" size="sm">
                Ver Informe
              </Button>
            </Link>
          </div>
        )}

        {/* Monitor */}
        <ExecutionMonitor
          ejecucionId={ejecucionId}
          onCompleted={handleCompleted}
        />
      </main>
    </div>
  );
}
