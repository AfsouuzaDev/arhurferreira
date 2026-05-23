import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { usePokemons } from "@/hooks/usePokemons";
import { ALGORITHMS, type AlgorithmKey, type SortKey, type SortItem, type Pokemon } from "@/lib/sorting/algorithms";
import { ALGORITHM_INFO } from "@/lib/sorting/info";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/benchmark")({
  component: Benchmark,
});

interface Result {
  key: AlgorithmKey;
  name: string;
  comparisons: number;
  swaps: number;
  elapsed: number;
  complexity: string;
}

const KEYS: SortKey[] = ["weight", "height", "base_experience"];

function buildItems(p: Pokemon[]): SortItem[] {
  return p.map((pk) => ({ pokemon: pk, state: "neutral" }));
}

async function runFast(key: AlgorithmKey, sortKey: SortKey, items: SortItem[]) {
  let c = 0, s = 0;
  const local = [...items];
  const ctx = {
    arr: local, key: sortKey,
    comparisons: 0, swaps: 0, activeLine: -1,
    log: () => {},
    setArr: () => {},
    setMetrics: (cc: number, ss: number) => { c = cc; s = ss; },
    setActiveLine: () => {},
    setHeapSize: () => {},
    sleep: async () => {},
    shouldStop: () => false,
    fast: true,
  };
  Object.defineProperty(ctx, "comparisons", { get: () => c, set: (v: number) => { c = v; } });
  Object.defineProperty(ctx, "swaps", { get: () => s, set: (v: number) => { s = v; } });
  const t0 = performance.now();
  await ALGORITHMS[key].fn(ctx as never);
  const elapsed = performance.now() - t0;
  return { comparisons: c, swaps: s, elapsed };
}

function Benchmark() {
  const { data: pokemons, isLoading } = usePokemons();
  const [sampleSize, setSampleSize] = useState(100);
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const sample = useMemo(() => {
    if (!pokemons) return [];
    const arr = [...pokemons].slice(0, 500);
    let s = sampleSize * 7;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, sampleSize);
  }, [pokemons, sampleSize]);

  const runAll = async () => {
    setRunning(true);
    setResults([]);
    const items = buildItems(sample);
    const out: Result[] = [];
    for (const k of Object.keys(ALGORITHMS) as AlgorithmKey[]) {
      setProgress(`Executando ${ALGORITHMS[k].name}...`);
      // Clone fresh
      const clone = items.map((it) => ({ pokemon: it.pokemon, state: "neutral" as const }));
      // Yield to UI
      await new Promise((r) => setTimeout(r, 10));
      const r = await runFast(k, sortKey, clone);
      out.push({
        key: k,
        name: ALGORITHMS[k].name,
        comparisons: r.comparisons,
        swaps: r.swaps,
        elapsed: r.elapsed,
        complexity: ALGORITHM_INFO[k].complexity.average,
      });
    }
    setResults(out);
    setProgress("");
    setRunning(false);
  };

  if (isLoading) {
    return <div className="panel-cyber p-6 text-neon-cyan">Carregando PokéAPI...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="panel-cyber clip-cyber p-4">
        <div className="text-neon-magenta text-sm mb-3">▸ BENCHMARK COMPARATIVO — TODOS OS ALGORITMOS</div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <div className="text-[10px] text-neon-cyan mb-1">// AMOSTRA</div>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              disabled={running}
              className="bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow clip-cyber-sm"
            >
              {[10, 50, 100, 500].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-neon-cyan mb-1">// CHAVE</div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              disabled={running}
              className="bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow uppercase clip-cyber-sm"
            >
              {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <button
            onClick={runAll}
            disabled={running}
            className="clip-cyber-sm border border-neon-yellow bg-neon-yellow/10 text-neon-yellow px-5 py-2 text-xs uppercase font-bold hover:bg-neon-yellow/20 disabled:opacity-40"
          >
            {running ? "Executando..." : "▶ Iniciar Simulação Completa"}
          </button>
          {progress && <span className="text-neon-cyan text-xs animate-pulse">{progress}</span>}
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="panel-cyber clip-cyber p-4">
            <div className="text-neon-magenta text-sm mb-3">▸ TABELA DE DIAGNÓSTICO</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neon-cyan border-b border-neon-cyan/40">
                    <th className="text-left p-2">Algoritmo</th>
                    <th className="text-right p-2">Comparações</th>
                    <th className="text-right p-2">Trocas</th>
                    <th className="text-right p-2">Tempo (ms)</th>
                    <th className="text-right p-2">Big-O (Médio)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.key} className="border-b border-neon-cyan/10">
                      <td className="p-2 text-neon-yellow uppercase">{r.name}</td>
                      <td className="p-2 text-right text-foreground tabular-nums">{r.comparisons.toLocaleString()}</td>
                      <td className="p-2 text-right text-neon-magenta tabular-nums">{r.swaps.toLocaleString()}</td>
                      <td className="p-2 text-right text-neon-green tabular-nums">{r.elapsed.toFixed(2)}</td>
                      <td className="p-2 text-right text-neon-cyan">{r.complexity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="panel-cyber clip-cyber p-4">
              <div className="text-neon-magenta text-sm mb-3">▸ TEMPO DE EXECUÇÃO (ms)</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results}>
                    <CartesianGrid stroke="#00f0ff22" />
                    <XAxis dataKey="name" stroke="#00f0ff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#00f0ff" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0c0f12", border: "1px solid #00f0ff" }} />
                    <Bar dataKey="elapsed" fill="#39ff14" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="panel-cyber clip-cyber p-4">
              <div className="text-neon-magenta text-sm mb-3">▸ COMPARAÇÕES vs TROCAS</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results}>
                    <CartesianGrid stroke="#00f0ff22" />
                    <XAxis dataKey="name" stroke="#00f0ff" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#00f0ff" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0c0f12", border: "1px solid #00f0ff" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="comparisons" fill="#fcee0a" name="Comparações" />
                    <Bar dataKey="swaps" fill="#ff0055" name="Trocas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
