import { useCallback, useRef, useState } from "react";
import { ALGORITHMS, type AlgorithmKey, type Pokemon, type SortItem, type SortKey, type SortContext } from "@/lib/sorting/algorithms";

type RunState = "idle" | "running" | "paused" | "done";

export function useSortingEngine() {
  const [items, setItems] = useState<SortItem[]>([]);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [heapSize, setHeapSize] = useState(0);

  const stopRef = useRef(false);
  const pauseRef = useRef(false);
  const stepRef = useRef(false);
  const speedRef = useRef(200);
  const startRef = useRef(0);
  const elapsedAccumRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const setSpeed = useCallback((v: number) => { speedRef.current = v; }, []);

  const startTimer = () => {
    startRef.current = performance.now();
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    const tick = () => {
      setElapsed(elapsedAccumRef.current + (performance.now() - startRef.current));
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
  };
  const pauseTimer = () => {
    elapsedAccumRef.current += performance.now() - startRef.current;
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    timerRef.current = null;
  };
  const stopTimer = () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    timerRef.current = null;
  };

  const reset = useCallback((pokemons: Pokemon[]) => {
    stopRef.current = true;
    pauseRef.current = false;
    stopTimer();
    elapsedAccumRef.current = 0;
    setElapsed(0);
    setComparisons(0);
    setSwaps(0);
    setActiveLine(-1);
    setLogs([]);
    setHeapSize(0);
    setRunState("idle");
    setItems(pokemons.map((p) => ({ pokemon: p, state: "neutral" })));
  }, []);

  const pause = useCallback(() => {
    if (runState === "running") {
      pauseRef.current = true;
      setRunState("paused");
      pauseTimer();
    }
  }, [runState]);

  const resume = useCallback(() => {
    if (runState === "paused") {
      pauseRef.current = false;
      setRunState("running");
      startTimer();
    }
  }, [runState]);

  const step = useCallback(() => {
    if (runState === "paused") {
      stepRef.current = true;
    }
  }, [runState]);

  const stop = useCallback(() => {
    stopRef.current = true;
    pauseRef.current = false;
    stopTimer();
  }, []);

  const run = useCallback(
    async (algorithm: AlgorithmKey, key: SortKey, visualize: boolean) => {
      stopRef.current = false;
      pauseRef.current = false;
      stepRef.current = false;
      setComparisons(0);
      setSwaps(0);
      setLogs([]);
      setActiveLine(-1);
      elapsedAccumRef.current = 0;
      setElapsed(0);

      const local: SortItem[] = items.map((it) => ({ ...it, state: "neutral" }));
      let cmp = 0, swp = 0;

      const ctx: SortContext = {
        arr: local,
        key,
        comparisons: 0,
        swaps: 0,
        activeLine: -1,
        log: (m) => visualize && setLogs((l) => [m, ...l].slice(0, 100)),
        setArr: (next) => {
          if (visualize) setItems([...next]);
        },
        setMetrics: (c, s) => {
          cmp = c; swp = s;
          if (visualize) { setComparisons(c); setSwaps(s); }
        },
        setActiveLine: (n) => visualize && setActiveLine(n),
        setHeapSize: (n) => visualize && setHeapSize(n),
        sleep: async () => {
          if (!visualize) return;
          // Pause support
          while (pauseRef.current && !stopRef.current) {
            if (stepRef.current) { stepRef.current = false; break; }
            await new Promise((r) => setTimeout(r, 50));
          }
          if (stopRef.current) return;
          await new Promise((r) => setTimeout(r, speedRef.current));
        },
        shouldStop: () => stopRef.current,
      };
      Object.defineProperty(ctx, "comparisons", { get: () => cmp, set: (v) => { cmp = v; } });
      Object.defineProperty(ctx, "swaps", { get: () => swp, set: (v) => { swp = v; } });

      setRunState("running");
      if (visualize) startTimer();
      const t0 = performance.now();
      await ALGORITHMS[algorithm].fn(ctx);
      const elapsedTotal = performance.now() - t0;
      stopTimer();
      if (!visualize) {
        setComparisons(cmp);
        setSwaps(swp);
        setElapsed(elapsedTotal);
        setItems([...local]);
      } else {
        setElapsed(elapsedAccumRef.current + (performance.now() - startRef.current));
      }
      setRunState("done");
      return { comparisons: cmp, swaps: swp, elapsed: elapsedTotal };
    },
    [items]
  );

  return {
    items, setItems,
    comparisons, swaps, elapsed, activeLine, logs, runState, heapSize,
    setSpeed, reset, pause, resume, step, stop, run,
  };
}
