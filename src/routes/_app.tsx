import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const loc = useLocation();
  const [time] = useState(() => new Date().toLocaleTimeString());

  const tabs = [
    { to: "/", label: "Dashboard de Ordenação" },
    { to: "/benchmark", label: "Análise de Desempenho" },
  ];

  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen px-4 md:px-8 py-4 relative">
        <header className="flex flex-wrap items-end justify-between gap-2 mb-4 border-b border-neon-cyan/30 pb-2">
          <div>
            <h1 className="text-2xl text-neon-yellow">CYBER//SORT_DECK</h1>
            <div className="text-[10px] text-neon-cyan/70">
              SYSTEM STATUS: ACTIVE • NETRUNNER MODE • {time}
            </div>
          </div>
          <nav className="flex gap-2">
            {tabs.map((t) => {
              const active = loc.pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`clip-cyber-sm border px-3 py-1.5 text-xs uppercase font-bold ${
                    active
                      ? "border-neon-yellow bg-neon-yellow/10 text-neon-yellow"
                      : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <Outlet />
        <footer className="text-[9px] text-neon-cyan/50 mt-6 text-center">
          [SYSLOG] Disciplina: Estrutura de Dados • Algoritmos de Ordenação • Data Source: PokéAPI v2
        </footer>
      </div>
    </QueryClientProvider>
  );
}
