'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/Button';
import { Settings, Activity, BarChart2, Zap } from 'lucide-react';
import { useState } from 'react';
import { Proyecto, EjecucionTest } from '@/lib/types';

export default function ProyectoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [ejecuciones, setEjecuciones] = useState<EjecucionTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        fetch(`/api/proyectos/${params.id}`),
        fetch(`/api/ejecuciones?proyecto_id=${params.id}`),
      ]);
      const [pJson, eJson] = await Promise.all([pRes.json(), eRes.json()]);
      setProyecto(pJson.data);
      setEjecuciones(eJson.data || []);
    } catch {
      router.push('/proyectos');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const estadoColor: Record<string, string> = {
    pendiente: 'text-gray-500',
    en_progreso: 'text-neon-cyan',
    completado: 'text-neon-green',
    fallido: 'text-neon-red',
  };

  if (loading || !proyecto) {
    return (
      <div className="flex min-h-screen bg-forge-bg">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">{proyecto.nombre}</h1>
            <p className="text-sm text-neon-cyan/70">{proyecto.url_sitio}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/proyectos/${params.id}/configurar`}>
              <Button variant="primary" className="gap-2">
                <Zap className="w-4 h-4" />
                Nueva Ejecución
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link href={`/proyectos/${params.id}/configurar`} className="forge-card p-6 hover:forge-card-active transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Configurar</p>
              <p className="text-xs text-gray-500">Módulos y parámetros</p>
            </div>
          </Link>
          <Link href={ejecuciones[0] ? `/proyectos/${params.id}/monitor?ejecucion=${ejecuciones[0].id}` : '#'} className="forge-card p-6 hover:forge-card-active transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-neon-amber" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Monitor</p>
              <p className="text-xs text-gray-500">Última ejecución</p>
            </div>
          </Link>
          <Link href={ejecuciones[0]?.estado === 'completado' ? `/proyectos/${params.id}/reporte?ejecucion=${ejecuciones[0].id}` : '#'} className="forge-card p-6 hover:forge-card-active transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Reporte</p>
              <p className="text-xs text-gray-500">Ver informe completo</p>
            </div>
          </Link>
        </div>

        {/* Historial de ejecuciones */}
        <div className="forge-card p-6">
          <h2 className="text-white font-bold text-base mb-4">Historial de Ejecuciones</h2>
          {ejecuciones.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aún no hay ejecuciones para este proyecto.</p>
              <Link href={`/proyectos/${params.id}/configurar`}>
                <Button variant="primary" size="sm" className="mt-4">
                  Lanzar primera ejecución
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ejecuciones.map((ejec) => (
                <div key={ejec.id} className="flex items-center justify-between p-3 rounded-lg border border-forge-border hover:border-neon-cyan/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ejec.estado === 'completado' ? 'bg-neon-green' : ejec.estado === 'en_progreso' ? 'bg-neon-cyan animate-pulse' : ejec.estado === 'fallido' ? 'bg-neon-red' : 'bg-gray-600'}`} />
                    <div>
                      <p className={`text-sm font-semibold capitalize ${estadoColor[ejec.estado]}`}>{ejec.estado.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(ejec.iniciado_en).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{ejec.modulos_activos.length} módulos
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/proyectos/${params.id}/monitor?ejecucion=${ejec.id}`}>
                      <Button variant="ghost" size="sm">Monitor</Button>
                    </Link>
                    {ejec.estado === 'completado' && (
                      <Link href={`/proyectos/${params.id}/reporte?ejecucion=${ejec.id}`}>
                        <Button variant="secondary" size="sm">Reporte</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
