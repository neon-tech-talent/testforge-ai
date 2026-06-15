'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Zap,
  Github,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/proyectos', label: 'Mis Proyectos', icon: FolderOpen },
  { href: '/proyectos/nuevo', label: 'Nuevo Proyecto', icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-forge-surface border-r border-forge-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-forge-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">TestForge</h1>
            <span className="text-neon-cyan text-xs font-semibold tracking-widest">AI</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('sidebar-nav-item', isActive && 'active')}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-forge-border">
        <div className="text-xs text-gray-600 space-y-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-gray-700">TestForge AI v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
