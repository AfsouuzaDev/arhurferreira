import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center panel-cyber clip-cyber p-6">
        <h1 className="text-7xl text-neon-magenta">404</h1>
        <p className="mt-2 text-sm text-neon-cyan">SECTOR NOT FOUND IN GRID</p>
        <Link to="/" className="mt-4 inline-block clip-cyber-sm border border-neon-yellow text-neon-yellow px-4 py-1.5 text-xs uppercase">Voltar</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center panel-cyber clip-cyber p-6">
        <h1 className="text-xl text-neon-magenta">FALHA DE SISTEMA</h1>
        <p className="mt-2 text-xs text-neon-cyan/80">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 clip-cyber-sm border border-neon-yellow text-neon-yellow px-4 py-1.5 text-xs uppercase"
        >Reconectar</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CYBER//SORT_DECK — Algoritmos de Ordenação" },
      { name: "description", content: "Dashboard didático cyberpunk para algoritmos de ordenação com PokéAPI." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AppHeader() {
  const loc = useLocation();
  const tabs = [
    { to: "/", label: "Dashboard" },
    { to: "/benchmark", label: "Análise / Benchmark" },
  ];
  return (
    <header className="flex flex-wrap items-end justify-between gap-2 mb-4 border-b border-neon-cyan/30 pb-2">
      <div>
        <h1 className="text-2xl text-neon-yellow">CYBER//SORT_DECK</h1>
        <div className="text-[10px] text-neon-cyan/70">SYSTEM STATUS: ACTIVE • NETRUNNER MODE • EST.DADOS</div>
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
            >{t.label}</Link>
          );
        })}
      </nav>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen px-4 md:px-8 py-4">
        <AppHeader />
        <Outlet />
        <footer className="text-[9px] text-neon-cyan/50 mt-6 text-center">
          [SYSLOG] Disciplina: Estrutura de Dados • Data Source: PokéAPI v2 • &copy; CyberDeck
        </footer>
      </div>
    </QueryClientProvider>
  );
}
