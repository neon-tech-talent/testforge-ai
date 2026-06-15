# TestForge AI 🚀

> Plataforma SaaS de Testing y Automatización Web "todo en uno" impulsada por Inteligencia Artificial.

![TestForge AI](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20Supabase%20%7C%20TypeScript-00f5ff?style=flat-square&labelColor=030712)

---

## ✨ Características

- **8 Módulos de Testing** impulsados por IA:
  - ⚡ Pruebas Funcionales (desde HU, Figma, PDFs)
  - 📋 Automatización de Formularios
  - 🔥 Pruebas de Estrés y Carga (k6)
  - 🎨 Regresión Visual (3 viewports)
  - 🛡️ Seguridad Automatizada (OWASP)
  - ✍️ Ortografía y Gramática
  - ♿ Accesibilidad (WCAG 2.1) y SEO
  - 🔗 Detección de Enlaces Rotos

- **Monitor en Tiempo Real** con Supabase Realtime
- **Dashboard de Reportes** con score de salud radial
- **Soluciones de IA** con bloques de código y sintaxis resaltada
- **Sin registro requerido** — acceso inmediato

---

## 🛠 Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 14** (App Router) | Framework frontend + API Routes |
| **Supabase** | Base de datos PostgreSQL + Realtime + Storage |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos (tema oscuro neón) |
| **Framer Motion** | Animaciones |
| **react-syntax-highlighter** | Bloques de código con syntax highlight |
| **Vercel** | Despliegue en producción |

---

## 🚀 Setup Rápido

### 1. Clonar y configurar

```bash
git clone <tu-repo>
cd testforge-ai
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completa con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 3. Configurar la base de datos Supabase

1. Ve a tu proyecto de Supabase → **SQL Editor**
2. Pega y ejecuta el contenido de `supabase/schema.sql`
3. Activa **Realtime** para la tabla `ejecuciones_test`:
   - Ve a **Database → Replication**
   - Habilita `ejecuciones_test` y `resultados_test`

### 4. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/              # API Routes (simuladas)
│   ├── proyectos/        # Páginas de proyectos
│   │   ├── nuevo/        # Crear proyecto
│   │   └── [id]/
│   │       ├── configurar/   # Panel de configuración
│   │       ├── monitor/      # Monitor en tiempo real
│   │       └── reporte/      # Dashboard de resultados
│   ├── layout.tsx
│   ├── page.tsx          # Home/Dashboard
│   └── globals.css
├── components/
│   ├── configuracion/    # Módulos de configuración
│   ├── dashboard/        # Sidebar, ProjectCard, Stats
│   ├── monitor/          # ExecutionMonitor, ConsoleLog
│   ├── reporte/          # Gauge, Tabs, ErrorCard, AIBlock
│   └── ui/               # Button, Badge, Toggle, etc.
├── lib/
│   ├── supabase/         # Clientes browser/server
│   ├── mock-engine.ts    # Motor de simulación de tests
│   └── types.ts          # Tipos TypeScript globales
└── supabase/
    └── schema.sql        # Schema completo de BD
```

---

## 🌐 Despliegue en Vercel

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a `main`

---

## 🔧 Configurar Supabase Realtime

Para que el monitor funcione en tiempo real:

```sql
-- En Supabase SQL Editor:
ALTER TABLE ejecuciones_test REPLICA IDENTITY FULL;
ALTER TABLE resultados_test REPLICA IDENTITY FULL;
```

Y en Supabase → Database → Replication → habilita ambas tablas.

---

## 📋 Tablas de Base de Datos

| Tabla | Descripción |
|---|---|
| `proyectos` | Proyectos por sesión |
| `documentacion` | HU, Figma, PDF, MD por proyecto |
| `datos_formulario` | Sets de datos JSON para automatización |
| `ejecuciones_test` | Registro de ejecuciones con estado en tiempo real |
| `resultados_test` | Resultados detallados con soluciones de IA |

---

## 🎨 Tema Visual

Dashboard oscuro tipo "escudería de Fórmula 1" con acentos neón:

| Color | Uso |
|---|---|
| `#00f5ff` (Cian neón) | Acciones principales, estado activo |
| `#39ff14` (Verde neón) | Éxito, completado |
| `#ffb700` (Ámbar neón) | Advertencias, estrés |
| `#ff2d55` (Rojo neón) | Errores críticos |

---

*Construido con ❤️ por TestForge AI Team*
