'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Proyecto } from '@/lib/types';
import { Plus, Search, FolderOpen } from 'lucide-react';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('testforge_session_id');
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('testforge_session_id', id);
  }
  return id;
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    fetch(`/api/proyectos?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((json) => {
        setProyectos(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const proyectosFiltrados = proyectos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.url_sitio.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Mis Proyectos</h1>
            <p className="text-sm text-gray-500">
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} en esta sesión
            </p>
          </div>
          <Link href="/proyectos/nuevo">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </Button>
          </Link>
        </div>

        {/* Search */}
        {proyectos.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="forge-input pl-9"
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="forge-card p-5 h-36 animate-pulse">
                <div className="h-4 bg-forge-border rounded w-2/3 mb-3" />
                <div className="h-3 bg-forge-border rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : proyectosFiltrados.length === 0 ? (
          <div className="forge-card p-16 text-center">
            <FolderOpen className="w-14 h-14 text-neon-cyan/20 mx-auto mb-4" />
            <h3 className="text-gray-300 font-semibold mb-2">
              {busqueda ? 'Sin resultados para tu búsqueda' : 'No tienes proyectos aún'}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {busqueda
                ? `No encontramos proyectos que coincidan con "${busqueda}"`
                : 'Crea tu primer proyecto para comenzar a testear tu sitio web con IA.'}
            </p>
            {!busqueda && (
              <Link href="/proyectos/nuevo">
                <Button variant="primary">
                  <Plus className="w-4 h-4" />
                  Crear proyecto
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {proyectosFiltrados.map((p) => (
              <ProjectCard key={p.id} proyecto={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
