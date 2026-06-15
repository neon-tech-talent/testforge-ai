'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/Button';
import { Globe, Github, FileText, ArrowLeft, Zap } from 'lucide-react';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('testforge_session_id');
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('testforge_session_id', id);
  }
  return id;
}

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    url_sitio: '',
    repo_github: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim() || !form.url_sitio.trim()) {
      setError('El nombre y la URL del sitio son obligatorios.');
      return;
    }

    try {
      new URL(form.url_sitio);
    } catch {
      setError('La URL del sitio no es válida. Incluye https://');
      return;
    }

    setLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, session_id: sessionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al crear el proyecto');
      router.push(`/proyectos/${json.data.id}/configurar`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-grid-forge bg-grid flex items-center justify-center">
        <div className="w-full max-w-xl animate-slide-up">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Nuevo Proyecto</h1>
              <p className="text-sm text-gray-500">
                Configura el sitio que querés testear con IA
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="forge-card p-8 space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nombre del Proyecto <span className="text-neon-red">*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: E-Commerce Principal"
                className="forge-input"
                required
              />
            </div>

            {/* URL Sitio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 inline mr-1.5 text-neon-cyan" />
                URL del Sitio Objetivo <span className="text-neon-red">*</span>
              </label>
              <input
                type="url"
                value={form.url_sitio}
                onChange={(e) => setForm({ ...form, url_sitio: e.target.value })}
                placeholder="https://mi-sitio.com"
                className="forge-input"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                La URL que la IA va a testear. Debe ser accesible públicamente.
              </p>
            </div>

            {/* Repo GitHub */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <Github className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Repositorio GitHub{' '}
                <span className="text-gray-600 font-normal">(opcional)</span>
              </label>
              <input
                type="url"
                value={form.repo_github}
                onChange={(e) => setForm({ ...form, repo_github: e.target.value })}
                placeholder="https://github.com/usuario/repo"
                className="forge-input"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <FileText className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                Descripción{' '}
                <span className="text-gray-600 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Breve descripción del proyecto o sitio web..."
                rows={3}
                className="forge-input resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded-lg">
                <p className="text-sm text-neon-red">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="flex-1">
                <Zap className="w-4 h-4" />
                Crear Proyecto
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
