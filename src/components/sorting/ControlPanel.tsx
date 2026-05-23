import { ALGORITHMS, type AlgorithmKey, type SortKey } from "@/lib/sorting/algorithms";

interface Props {
  algorithm: AlgorithmKey;
  setAlgorithm: (a: AlgorithmKey) => void;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  sampleSize: number;
  setSampleSize: (n: number) => void;
  speed: number;
  setSpeed: (n: number) => void;
  runState: "idle" | "running" | "paused" | "done";
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
}

const SAMPLES = [10, 50, 100, 500];
const KEYS: { key: SortKey; label: string }[] = [
  { key: "weight", label: "PESO" },
  { key: "height", label: "ALTURA" },
  { key: "base_experience", label: "EXPERIÊNCIA" },
];

export function ControlPanel(p: Props) {
  return (
    <div className="panel-cyber clip-cyber p-4 space-y-4 relative">
      <div className="absolute top-1 right-2 text-[9px] text-neon-cyan opacity-60">SYS_STATUS: {p.runState.toUpperCase()}</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <div className="text-[10px] text-neon-cyan mb-1">// ALGORITMO</div>
          <select
            value={p.algorithm}
            onChange={(e) => p.setAlgorithm(e.target.value as AlgorithmKey)}
            disabled={p.runState === "running"}
            className="w-full bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow uppercase clip-cyber-sm"
          >
            {Object.entries(ALGORITHMS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-[10px] text-neon-cyan mb-1">// CHAVE</div>
          <select
            value={p.sortKey}
            onChange={(e) => p.setSortKey(e.target.value as SortKey)}
            disabled={p.runState === "running"}
            className="w-full bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow uppercase clip-cyber-sm"
          >
            {KEYS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </div>
        <div>
          <div className="text-[10px] text-neon-cyan mb-1">// AMOSTRA</div>
          <select
            value={p.sampleSize}
            onChange={(e) => p.setSampleSize(Number(e.target.value))}
            disabled={p.runState === "running"}
            className="w-full bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow clip-cyber-sm"
          >
            {SAMPLES.map((s) => <option key={s} value={s}>{s} pokémons</option>)}
          </select>
        </div>
        <div>
          <div className="text-[10px] text-neon-cyan mb-1">// VELOCIDADE: {p.speed}ms</div>
          <input
            type="range" min={10} max={2000} step={10}
            value={p.speed}
            onChange={(e) => p.setSpeed(Number(e.target.value))}
            className="w-full accent-[color:var(--neon-magenta)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {p.runState === "running" ? (
          <button onClick={p.onPause} className="clip-cyber-sm border border-neon-yellow bg-neon-yellow/10 text-neon-yellow px-4 py-1.5 text-xs uppercase font-bold hover:bg-neon-yellow/20">
            ⏸ Pausar
          </button>
        ) : p.runState === "paused" ? (
          <button onClick={p.onResume} className="clip-cyber-sm border border-neon-green bg-neon-green/10 text-neon-green px-4 py-1.5 text-xs uppercase font-bold hover:bg-neon-green/20">
            ▶ Continuar
          </button>
        ) : (
          <button onClick={p.onPlay} className="clip-cyber-sm border border-neon-green bg-neon-green/10 text-neon-green px-4 py-1.5 text-xs uppercase font-bold hover:bg-neon-green/20">
            ▶ Executar
          </button>
        )}
        <button
          onClick={p.onStep}
          disabled={p.runState !== "paused"}
          className="clip-cyber-sm border border-neon-cyan bg-neon-cyan/10 text-neon-cyan px-4 py-1.5 text-xs uppercase font-bold hover:bg-neon-cyan/20 disabled:opacity-40"
        >
          ⏭ Passo
        </button>
        <button onClick={p.onReset} className="clip-cyber-sm border border-neon-magenta bg-neon-magenta/10 text-neon-magenta px-4 py-1.5 text-xs uppercase font-bold hover:bg-neon-magenta/20">
          ⟲ Reset
        </button>
      </div>
    </div>
  );
}
