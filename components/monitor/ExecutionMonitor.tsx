'use client';

import { useEffect, useState, useCallback } from 'react';
import { EjecucionTest, LogConsola, TipoPrueba } from '@/lib/types';
import { ConsoleLog } from './ConsoleLog';
import { ProgressTracker } from './ProgressTracker';
import { createClient } from '@/lib/supabase/client';
import { Activity, RefreshCw } from 'lucide-react';

interface ExecutionMonitorProps {
  ejecucionId: string;
  onCompleted?: (ejecucionId: string) => void;
}

export function ExecutionMonitor({ ejecucionId, onCompleted }: ExecutionMonitorProps) {
  const [ejecucion, setEjecucion] = useState<EjecucionTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);

  const fetchEjecucion = useCallback(async () => {
    const res = await fetch(`/api/ejecuciones/${ejecucionId}`);
    const json = await res.json();
    if (json.data) setEjecucion(json.data);
    setLoading(false);
  }, [ejecucionId]);

  const handleSkipModule = async () => {
    if (skipping) return;
    setSkipping(true);
    try {
      const res = await fetch(`/api/ejecuciones/${ejecucionId}/saltar`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errJson = await res.json();
        console.error("Error al interrumpir módulo:", errJson.error);
      } else {
        await fetchEjecucion();
      }
    } catch (err) {
      console.error("Error de red al interrumpir módulo:", err);
    } finally {
      setSkipping(false);
    }
  };

  useEffect(() => {
    fetchEjecucion();
  }, [fetchEjecucion]);

  useEffect(() => {
    if (ejecucion && ejecucion.estado === 'pendiente') {
      // Disparar la simulación de forma asíncrona en el cliente para mantener abierta la conexión del servidor en Vercel
      fetch(`/api/ejecuciones/${ejecucionId}/iniciar`, { method: 'POST' }).catch(console.error);
    }
  }, [ejecucion, ejecucionId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`ejecucion-${ejecucionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ejecuciones_test',
          filter: `id=eq.${ejecucionId}`,
        },
        (payload) => {
          const updated = payload.new as EjecucionTest;
          setEjecucion(updated);
          if (updated.estado === 'completado' || updated.estado === 'fallido') {
            onCompleted?.(ejecucionId);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ejecucionId, onCompleted]);

  if (loading || !ejecucion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
      </div>
    );
  }

  const logs: LogConsola[] = Array.isArray(ejecucion.logs_consola) ? ejecucion.logs_consola : [];

  return (
    <div className="space-y-6">
      {/* Estado header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${
            ejecucion.estado === 'en_progreso' ? 'bg-neon-cyan animate-pulse' :
            ejecucion.estado === 'completado' ? 'bg-neon-green' :
            ejecucion.estado === 'fallido' ? 'bg-neon-red' :
            'bg-gray-600'
          }`} />
          <span className="text-sm font-semibold capitalize text-gray-200">
            {ejecucion.estado === 'en_progreso' ? 'Ejecutando batería de agentes...' :
             ejecucion.estado === 'completado' ? 'Ejecución completada' :
             ejecucion.estado === 'fallido' ? 'Ejecución fallida' :
             'Pendiente de inicio'}
          </span>
        </div>
        <button
          onClick={fetchEjecucion}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress tracker */}
        <div className="forge-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan" />
            Estado de Módulos
          </h3>
          <ProgressTracker
            modulosActivos={ejecucion.modulos_activos as TipoPrueba[]}
            progreso={ejecucion.progreso}
            estadoGeneral={ejecucion.estado}
            onSkip={handleSkipModule}
            skipping={skipping}
          />
        </div>

        {/* Console */}
        <div className="forge-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            Consola de Logs
          </h3>
          <ConsoleLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
