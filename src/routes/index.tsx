import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { usePokemons } from "@/hooks/usePokemons";
import { useSortingEngine } from "@/hooks/useSortingEngine";
import { ControlPanel } from "@/components/sorting/ControlPanel";
import { PokemonCard } from "@/components/sorting/PokemonCard";
import { DiagnosticPanel } from "@/components/sorting/DiagnosticPanel";
import { HeapTree } from "@/components/sorting/HeapTree";
import type { AlgorithmKey, SortKey } from "@/lib/sorting/algorithms";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: pokemons, isLoading, error } = usePokemons();
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("bubble");
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sampleSize, setSampleSize] = useState(10);
  const [speed, setSpeedState] = useState(200);

  const engine = useSortingEngine();

  const sample = useMemo(() => {
    if (!pokemons) return [];
    // Take a shuffled subset deterministically per size
    const arr = [...pokemons].slice(0, Math.min(pokemons.length, 500));
    // Shuffle (Fisher-Yates) with a seed-ish based on sampleSize+sortKey
    const seed = sampleSize * 13 + sortKey.length;
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, sampleSize);
  }, [pokemons, sampleSize, sortKey]);

  useEffect(() => {
    engine.reset(sample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sample, algorithm]);

  useEffect(() => { engine.setSpeed(speed); }, [speed, engine]);

  const visualize = true;

  const handlePlay = async () => {
    await engine.run(algorithm, sortKey, visualize);
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
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
      <div className="space-y-3">
        <ControlPanel
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          sortKey={sortKey}
          setSortKey={setSortKey}
          sampleSize={sampleSize}
          setSampleSize={setSampleSize}
          speed={speed}
          setSpeed={setSpeedState}
          runState={engine.runState}
          onPlay={handlePlay}
          onPause={engine.pause}
          onResume={engine.resume}
          onStep={engine.step}
          onReset={() => engine.reset(sample)}
        />

        {algorithm === "heap" && visualize && (
          <HeapTree items={engine.items} heapSize={engine.heapSize || engine.items.length} sortKey={sortKey} />
        )}

        <div className="panel-cyber clip-cyber p-4 min-h-[300px]">
          <div className="text-[10px] text-neon-cyan mb-3">▸ ÁREA DE VARREDURA VISUAL — {engine.items.length} alvos</div>
          {visualize ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {engine.items.map((it) => (
                <PokemonCard key={it.pokemon.id} item={it} sortKey={sortKey} />
              ))}
            </div>
          ) : (
            <div className="border border-neon-magenta/60 bg-neon-magenta/5 clip-cyber-sm p-6 text-center">
              <div className="text-neon-magenta text-lg font-bold">⚠ MODO ALTA PERFORMANCE ATIVO</div>
              <div className="text-xs text-neon-cyan mt-2">CARDS OCULTADOS — Processando {sampleSize} elementos em segundo plano para evitar travamento do navegador.</div>
              <div className="text-[10px] text-foreground/60 mt-2">Métricas e tempo continuam sendo calculados em tempo real abaixo (sem delay visual).</div>
            </div>
          )}
        </div>
      </div>

      <DiagnosticPanel
        algorithm={algorithm}
        comparisons={engine.comparisons}
        swaps={engine.swaps}
        elapsed={engine.elapsed}
        activeLine={engine.activeLine}
        logs={engine.logs}
      />
    </div>
  );
}
