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
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
