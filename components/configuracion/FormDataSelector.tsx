'use client';

import { useEffect, useState } from 'react';
import { DatosFormulario } from '@/lib/types';
import { Database, Plus } from 'lucide-react';

interface FormDataSelectorProps {
  proyectoId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function FormDataSelector({ proyectoId, selectedId, onSelect }: FormDataSelectorProps) {
  const [sets, setSets] = useState<DatosFormulario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await fetch(`/api/datos-formulario?proyecto_id=${proyectoId}`);
        const json = await res.json();
        setSets(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, [proyectoId]);

  return (
    <div className="forge-card p-5 border-[#bf5af2]/30 bg-[#bf5af2]/5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#bf5af2]/10 flex items-center justify-center">
          <Database className="w-4 h-4 text-[#bf5af2]" />
        </div>
        <h3 className="text-[#bf5af2] font-semibold text-sm">Set de Datos para Formularios</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-[#bf5af2]/40 border-t-[#bf5af2] rounded-full animate-spin" />
          Cargando sets de datos...
        </div>
      ) : sets.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-3">No hay sets de datos para este proyecto.</p>
          <button className="text-xs text-[#bf5af2] flex items-center gap-1 mx-auto hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Crear set de datos
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sets.map((set) => (
            <div
              key={set.id}
              onClick={() => onSelect(selectedId === set.id ? null : set.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedId === set.id
                  ? 'border-[#bf5af2] bg-[#bf5af2]/10'
                  : 'border-forge-border hover:border-[#bf5af2]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">{set.nombre_set}</p>
                  {set.descripcion && (
                    <p className="text-xs text-gray-500 mt-0.5">{set.descripcion}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {Array.isArray(set.datos_json) ? set.datos_json.length : 0} registros
                  </p>
                </div>
                {selectedId === set.id && (
                  <span className="text-xs text-[#bf5af2] font-bold">SELECCIONADO</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
