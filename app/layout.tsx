import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TestForge AI — Plataforma de Testing y Automatización Web",
  description:
    "Plataforma SaaS todo en uno impulsada por IA para pruebas funcionales, de estrés, seguridad, accesibilidad, diseño y más. Despliega tu batería de agentes en segundos.",
  keywords: [
    "testing web",
    "automatización",
    "QA",
    "inteligencia artificial",
    "pruebas de carga",
    "accesibilidad",
    "seguridad web",
  ],
  openGraph: {
    title: "TestForge AI",
    description: "Testing y Automatización Web impulsada por IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-forge-bg text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
