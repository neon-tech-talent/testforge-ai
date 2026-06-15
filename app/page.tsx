'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { Button } from '@/components/ui/Button';
import { Proyecto } from '@/lib/types';
import {
  Plus,
  Zap,
  Activity,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('testforge_session_id');
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('testforge_session_id', id);
  }
  return id;
}

export default function HomePage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

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

  const recentProjects = proyectos.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid min-h-screen">
        {/* Hero Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full">
                  <span className="text-xs font-bold text-neon-cyan tracking-widest uppercase">
                    IA ACTIVA
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-black text-white leading-tight mb-2">
                <span className="gradient-text-forge">TestForge AI</span>
              </h1>
              <p className="text-gray-400 text-base max-w-xl">
                Plataforma de testing y automatización web todo en uno. Despliega tu batería de agentes en segundos y obtén un informe completo con soluciones de IA.
              </p>
            </div>
            <Link href="/proyectos/nuevo">
              <Button variant="primary" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Proyecto
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <StatsWidget
            label="Proyectos Activos"
            value={loading ? '—' : proyectos.length}
            sublabel="En esta sesión"
            color="cyan"
            icon={<Activity className="w-4 h-4" />}
          />
          <StatsWidget
            label="Módulos Disponibles"
            value="8"
            sublabel="Agentes especializados"
            color="green"
            icon={<Sparkles className="w-4 h-4" />}
          />
          <StatsWidget
            label="Tipos de Prueba"
            value="8"
            sublabel="Funcional, estrés, seguridad y más"
            color="amber"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatsWidget
            label="Soluciones con IA"
            value="∞"
            sublabel="Sugerencias de código auto-generadas"
            color="cyan"
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
        </div>

        {/* Módulos grid */}
        <div className="mb-10">
          <h2 className="text-white font-bold text-lg mb-4">Agentes Disponibles</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icono: '⚡', nombre: 'Pruebas Funcionales', desc: 'Flujos desde HU y Figma', color: 'neon-cyan' },
              { icono: '📋', nombre: 'Automatización Formularios', desc: 'Mapeo y rellenado inteligente', color: 'purple-400' },
              { icono: '🔥', nombre: 'Pruebas de Estrés', desc: 'Simulación k6 dinámica', color: 'neon-amber' },
              { icono: '🎨', nombre: 'Regresión Visual', desc: '3 viewports + análisis IA', color: 'neon-green' },
              { icono: '🛡️', nombre: 'Seguridad OWASP', desc: 'Escáner pasivo de vulnerabilidades', color: 'neon-red' },
              { icono: '✍️', nombre: 'Ortografía y Gramática', desc: 'Análisis lingüístico completo', color: 'neon-cyan' },
              { icono: '♿', nombre: 'Accesibilidad y SEO', desc: 'WCAG 2.1 + meta-tags', color: 'neon-green' },
              { icono: '🔗', nombre: 'Enlaces Rotos', desc: 'Rastreo de 404/500', color: 'neon-amber' },
            ].map((m, i) => (
              <div
                key={i}
                className="forge-card p-4 hover:border-neon-cyan/30 transition-all group"
              >
                <span className="text-2xl mb-2 block">{m.icono}</span>
                <h3 className="text-sm font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">
                  {m.nombre}
                </h3>
                <p className="text-xs text-gray-600">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Proyectos recientes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Proyectos Recientes</h2>
            <Link
              href="/proyectos"
              className="flex items-center gap-1 text-sm text-neon-cyan hover:text-white transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="forge-card p-5 h-36 animate-pulse">
                  <div className="h-4 bg-forge-border rounded w-2/3 mb-3" />
                  <div className="h-3 bg-forge-border rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="forge-card p-12 text-center">
              <Zap className="w-12 h-12 text-neon-cyan/20 mx-auto mb-4 animate-float" />
              <h3 className="text-gray-300 font-semibold mb-2">
                Aún no tienes proyectos
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Crea tu primer proyecto y despliega tu primera batería de agentes.
              </p>
              <Link href="/proyectos/nuevo">
                <Button variant="primary">
                  <Plus className="w-4 h-4" />
                  Crear mi primer proyecto
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {recentProjects.map((p) => (
                <ProjectCard key={p.id} proyecto={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
