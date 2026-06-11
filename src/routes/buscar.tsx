import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { usePokemons } from "@/hooks/usePokemons";
import { useSearchEngine } from "@/hooks/useSearchEngine";
import { SearchControlPanel } from "@/components/search/SearchControlPanel";
import { SearchCard } from "@/components/search/SearchCard";
import { SearchDiagnostic } from "@/components/search/SearchDiagnostic";
import { SearchLegend } from "@/components/search/SearchLegend";
import { SearchPerformanceChart } from "@/components/search/SearchPerformanceChart";
import { isSortedBy, type SearchAlgoKey, type SearchKey, type SearchMode } from "@/lib/search/algorithms";

export const Route = createFileRoute("/buscar")({
  component: SearchView,
});

function SearchView() {
  const { data: pokemons, isLoading, error } = usePokemons();

  const [algo, setAlgo] = useState<SearchAlgoKey>("linear");
  const [mode, setMode] = useState<SearchMode>("name");
  const [key, setKey] = useState<SearchKey>("id");
  const [term, setTerm] = useState("");
  const [sampleSize, setSampleSize] = useState(50);
  const [speed, setSpeedState] = useState(350);
  const [sorted, setSorted] = useState(true);
  const [subTab, setSubTab] = useState<"viz" | "perf">("viz");

  const engine = useSearchEngine();

  const sample = useMemo(() => {
    if (!pokemons) return [];
    const arr = [...pokemons].slice(0, Math.min(pokemons.length, 500)).slice(0, sampleSize);
    if (sorted) {
      arr.sort((a, b) =>
        key === "id" ? a.id - b.id : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    } else {
      let s = sampleSize * 17 + 3;
      const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  }, [pokemons, sampleSize, sorted, key]);

  useEffect(() => { engine.reset(sample); /* eslint-disable-next-line */ }, [sample, algo]);
  useEffect(() => { engine.setSpeed(speed); }, [speed, engine]);

  // Binary precondition: array must be sorted by the chosen key AND mode must be id/name (no substring)
  const isSorted = sample.length > 0 && isSortedBy(sample, key);
  const binaryDisabledReason =
    mode === "substring"
      ? "Acesso Negado: A Busca Binária não suporta busca por SUBSTRING — apenas alvos exatos comparáveis."
      : !isSorted
      ? "Acesso Negado: A Busca Binária requer que o vetor esteja previamente ordenado pelo algoritmo de ordenação."
      : undefined;

  // If binary becomes disabled mid-flight, fall back to linear
  useEffect(() => {
    if (binaryDisabledReason && algo === "binary") setAlgo("linear");
  }, [binaryDisabledReason, algo]);

  const handlePlay = async () => {
    if (!term.trim()) return;
    await engine.run(algo, mode, key, term);
  };

  if (isLoading) {
    return (
      <div className="panel-cyber clip-cyber p-8 text-center">
        <div className="text-neon-cyan animate-pulse">[BOOT] CONECTANDO NA POKÉAPI... CARREGANDO 500 REGISTROS</div>
      </div>
    );
  }
  if (error) {
    return <div className="panel-cyber p-6 text-neon-magenta">FALHA NO LINK: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab("viz")}
          className={`clip-cyber-sm border px-4 py-1.5 text-xs uppercase font-bold ${
            subTab === "viz"
              ? "border-neon-yellow bg-neon-yellow/15 text-neon-yellow"
              : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10"
          }`}
        >▸ Simulação Visual</button>
        <button
          onClick={() => setSubTab("perf")}
          className={`clip-cyber-sm border px-4 py-1.5 text-xs uppercase font-bold ${
            subTab === "perf"
              ? "border-neon-yellow bg-neon-yellow/15 text-neon-yellow"
              : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10"
          }`}
        >▸ Performance (Curvas)</button>
      </div>

      {subTab === "perf" ? (
        <SearchPerformanceChart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="space-y-3">
            <SearchControlPanel
              algo={algo} setAlgo={setAlgo}
              mode={mode} setMode={setMode}
              searchKey={key} setSearchKey={setKey}
              term={term} setTerm={setTerm}
              sampleSize={sampleSize} setSampleSize={setSampleSize}
              speed={speed} setSpeed={setSpeedState}
              sorted={sorted} setSorted={setSorted}
              runState={engine.runState}
              binaryDisabledReason={binaryDisabledReason}
              onPlay={handlePlay}
              onPause={engine.pause}
              onResume={engine.resume}
              onStep={engine.step}
              onReset={() => engine.reset(sample)}
            />

            <SearchLegend algo={algo} />

            <div className="panel-cyber clip-cyber p-4 min-h-[300px]">
              <div className="text-[10px] text-neon-cyan mb-3">
                ▸ ÁREA DE VARREDURA — {engine.items.length} alvos · alvo: <span className="text-neon-yellow">"{term || "—"}"</span>
              </div>
              {engine.items.length === 0 ? (
                <div className="text-neon-cyan/60 text-xs">Aguardando amostra...</div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {engine.items.map((it, i) => (
                    <SearchCard key={`${it.pokemon.id}-${i}`} item={it} idx={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <SearchDiagnostic
            algo={algo}
            comparisons={engine.comparisons}
            foundCount={engine.foundIndices.length}
            activeLine={engine.activeLine}
            logs={engine.logs}
          />
        </div>
      )}
    </div>
  );
}
