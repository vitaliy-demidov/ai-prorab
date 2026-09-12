import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Прораб — Строительный Agentic-оркестратор',
  description: 'Автономный агент технического заказчика для структурирования хаотичных запросов на ремонт, изоляции рисков и формирования WorkBrief с гарантией Human-in-the-loop.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-[#07080b] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
