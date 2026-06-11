import { useCallback, useRef, useState } from "react";
import {
  SEARCH_ALGORITHMS,
  type SearchAlgoKey,
  type SearchContext,
  type SearchItem,
  type SearchMode,
  type SearchKey,
} from "@/lib/search/algorithms";
import type { Pokemon } from "@/lib/sorting/algorithms";

type RunState = "idle" | "running" | "paused" | "done";

export function useSearchEngine() {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [comparisons, setComparisons] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [foundIndices, setFoundIndices] = useState<number[]>([]);

  const stopRef = useRef(false);
  const pauseRef = useRef(false);
  const stepRef = useRef(false);
  const speedRef = useRef(400);

  const setSpeed = useCallback((v: number) => { speedRef.current = v; }, []);

  const reset = useCallback((pokemons: Pokemon[]) => {
    stopRef.current = true;
    pauseRef.current = false;
    setItems(pokemons.map((p) => ({ pokemon: p, state: "neutral" })));
    setComparisons(0);
    setActiveLine(-1);
    setLogs([]);
    setFoundIndices([]);
    setRunState("idle");
  }, []);

  const pause = useCallback(() => {
    if (runState === "running") { pauseRef.current = true; setRunState("paused"); }
  }, [runState]);
  const resume = useCallback(() => {
    if (runState === "paused") { pauseRef.current = false; setRunState("running"); }
  }, [runState]);
  const step = useCallback(() => {
    if (runState === "paused") stepRef.current = true;
  }, [runState]);

  const run = useCallback(
    async (algo: SearchAlgoKey, mode: SearchMode, key: SearchKey, term: string) => {
      stopRef.current = false;
      pauseRef.current = false;
      stepRef.current = false;
      setComparisons(0);
      setLogs([]);
      setActiveLine(-1);
      setFoundIndices([]);

      const local: SearchItem[] = items.map((it) => ({ pokemon: it.pokemon, state: "neutral" }));
      setItems(local);

      const found: number[] = [];
      const ctx: SearchContext = {
        arr: local,
        mode,
        key,
        term,
        comparisons: 0,
        setArr: (next) => setItems([...next]),
        setComparisons: (n) => setComparisons(n),
        setActiveLine: (n) => setActiveLine(n),
        log: (m) => setLogs((l) => [m, ...l].slice(0, 100)),
        sleep: async () => {
          while (pauseRef.current && !stopRef.current) {
            if (stepRef.current) { stepRef.current = false; break; }
            await new Promise((r) => setTimeout(r, 50));
          }
          if (stopRef.current) return;
          await new Promise((r) => setTimeout(r, speedRef.current));
        },
        shouldStop: () => stopRef.current,
        onFound: (idx) => { found.push(idx); setFoundIndices([...found]); },
      };

      setRunState("running");
      await SEARCH_ALGORITHMS[algo].fn(ctx);
      setRunState("done");
    },
    [items]
  );

  return {
    items, comparisons, activeLine, logs, runState, foundIndices,
    setSpeed, reset, pause, resume, step, run,
  };
}
