import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePokemons } from "@/hooks/usePokemons";
import { useSearchEngine } from "@/hooks/useSearchEngine";
import { SearchControlPanel } from "@/components/search/SearchControlPanel";
import { SearchCard } from "@/components/search/SearchCard";
import { SearchDiagnostic } from "@/components/search/SearchDiagnostic";
import { SearchLegend } from "@/components/search/SearchLegend";
import { SearchPerformanceChart } from "@/components/search/SearchPerformanceChart";
import {
  isSortedBy,
  type SearchAlgoKey,
  type SearchItem,
  type SearchKey,
  type SearchMode,
} from "@/lib/search/algorithms";

export const Route = createFileRoute("/buscar")({
  component: SearchView,
});

function matches(pokemon: { id: number; name: string }, term: string, mode: SearchMode) {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  if (mode === "id") return String(pokemon.id) === t;
  if (mode === "name") return pokemon.name.toLowerCase() === t;
  return pokemon.name.toLowerCase().includes(t);
}

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

  // ── Loop simples (setInterval) para garantir que os botões funcionem ──
  const [liveItems, setLiveItems] = useState<SearchItem[]>([]);
  const [liveComp, setLiveComp] = useState(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [liveActiveLine, setLiveActiveLine] = useState(-1);
  const [liveFound, setLiveFound] = useState<number[]>([]);
  const [liveRunning, setLiveRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sample = useMemo(() => {
    if (!pokemons) return [];
    const arr = [...pokemons].slice(0, Math.min(pokemons.length, 500)).slice(0, sampleSize);
    if (sorted) {
      arr.sort((a, b) =>
        key === "id" ? a.id - b.id : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    } else {
      let s = sampleSize * 17 + 3;
      const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    return arr;
  }, [pokemons, sampleSize, sorted, key]);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    stopInterval();
    setLiveItems([]);
    setLiveComp(0);
    setLiveLogs([]);
    setLiveActiveLine(-1);
    setLiveFound([]);
    setLiveRunning(false);
    engine.reset(sample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sample, algo]);

  useEffect(() => {
    engine.setSpeed(speed);
  }, [speed, engine]);

  useEffect(() => () => stopInterval(), []);

  const isSorted = sample.length > 0 && isSortedBy(sample, key);
  const binaryDisabledReason =
    mode === "substring"
      ? "Acesso Negado: A Busca Binária não suporta busca por SUBSTRING — apenas alvos exatos comparáveis."
      : !isSorted
      ? "Acesso Negado: A Busca Binária requer que o vetor esteja previamente ordenado pelo algoritmo de ordenação."
      : undefined;

  useEffect(() => {
    if (binaryDisabledReason && algo === "binary") setAlgo("linear");
  }, [binaryDisabledReason, algo]);

  // ── Botão EXECUTAR BUSCA ──
  const handlePlay = () => {
    if (!term.trim() || sample.length === 0) return;
    stopInterval();

    const base: SearchItem[] = sample.map((p) => ({ pokemon: p, state: "neutral" }));
    setLiveItems(base);
    setLiveComp(0);
    setLiveLogs([`>> INICIANDO ${algo === "binary" ? "BUSCA BINÁRIA" : "BUSCA LINEAR"} · alvo="${term}"`]);
    setLiveActiveLine(0);
    setLiveFound([]);
    setLiveRunning(true);

    let i = 0;
    const found: number[] = [];

    intervalRef.current = setInterval(() => {
      if (i >= base.length) {
        stopInterval();
        setLiveRunning(false);
        setLiveActiveLine(-1);
        setLiveLogs((l) => [`>> FIM · ${found.length} alvo(s) encontrado(s) · ${i} comparações`, ...l]);
        return;
      }

      const hit = matches(base[i].pokemon, term, mode);
      if (hit) found.push(i);

      const next: SearchItem[] = base.map((it, idx) => {
        if (idx === i) return { ...it, state: hit ? "found" : "testing" };
        if (idx < i) return { ...it, state: found.includes(idx) ? "found" : "discarded" };
        return { ...it, state: "neutral" };
      });

      setLiveItems(next);
      setLiveComp((c) => c + 1);
      setLiveActiveLine(((i % 4) + 1));
      setLiveFound([...found]);
      if (hit) {
        setLiveLogs((l) => [`✓ HIT no índice ${i}: ${base[i].pokemon.name}`, ...l].slice(0, 100));
      }

      i++;
    }, Math.max(30, speed));
  };

  // ── Botão RESET ──
  const handleReset = () => {
    stopInterval();
    setLiveItems([]);
    setLiveComp(0);
    setLiveLogs([]);
    setLiveActiveLine(-1);
    setLiveFound([]);
    setLiveRunning(false);
    setTerm("");
    engine.reset(sample);
  };

  const handlePause = () => {
    stopInterval();
    setLiveRunning(false);
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

  const displayItems = liveItems.length > 0 ? liveItems : engine.items;
  const displayComparisons = liveItems.length > 0 ? liveComp : engine.comparisons;
  const displayLogs = liveItems.length > 0 ? liveLogs : engine.logs;
  const displayActiveLine = liveItems.length > 0 ? liveActiveLine : engine.activeLine;
  const displayFoundCount = liveItems.length > 0 ? liveFound.length : engine.foundIndices.length;
  const runState: "idle" | "running" | "paused" | "done" = liveRunning ? "running" : engine.runState;

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
              runState={runState}
              binaryDisabledReason={binaryDisabledReason}
              onPlay={handlePlay}
              onPause={handlePause}
              onResume={handlePlay}
              onStep={handlePlay}
              onReset={handleReset}
            />

            <SearchLegend algo={algo} />

            <div className="panel-cyber clip-cyber p-4 min-h-[300px]">
              <div className="text-[10px] text-neon-cyan mb-3">
                ▸ ÁREA DE VARREDURA — {displayItems.length} alvos · alvo: <span className="text-neon-yellow">"{term || "—"}"</span>
              </div>
              {displayItems.length === 0 ? (
                <div className="text-neon-cyan/60 text-xs">Aguardando amostra...</div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {displayItems.map((it, i) => (
                    <SearchCard key={`${it.pokemon.id}-${i}`} item={it} idx={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <SearchDiagnostic
            algo={algo}
            comparisons={displayComparisons}
            foundCount={displayFoundCount}
            activeLine={displayActiveLine}
            logs={displayLogs}
          />
        </div>
      )}
    </div>
  );
}
