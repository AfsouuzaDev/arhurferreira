import type { SearchAlgoKey, SearchMode, SearchKey } from "@/lib/search/algorithms";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  algo: SearchAlgoKey;
  setAlgo: (a: SearchAlgoKey) => void;
  mode: SearchMode;
  setMode: (m: SearchMode) => void;
  searchKey: SearchKey;
  setSearchKey: (k: SearchKey) => void;
  term: string;
  setTerm: (t: string) => void;
  sampleSize: number;
  setSampleSize: (n: number) => void;
  speed: number;
  setSpeed: (n: number) => void;
  sorted: boolean;
  setSorted: (v: boolean) => void;
  runState: "idle" | "running" | "paused" | "done";
  binaryDisabledReason?: string;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
}

const SAMPLES = [10, 50, 100, 500];

export function SearchControlPanel(p: Props) {
  const binaryDisabled = !!p.binaryDisabledReason;
  return (
    <TooltipProvider>
      <div className="panel-cyber clip-cyber p-4 space-y-4 relative">
        <div className="absolute top-1 right-2 text-[9px] text-neon-cyan opacity-60">
          SYS_STATUS: {p.runState.toUpperCase()}
        </div>

        {/* Algorithm selectors */}
        <div>
          <div className="text-[10px] text-neon-cyan mb-1">// ALGORITMO DE BUSCA</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => p.setAlgo("linear")}
              disabled={p.runState === "running"}
              className={`clip-cyber-sm border px-4 py-1.5 text-xs uppercase font-bold ${
                p.algo === "linear"
                  ? "border-neon-yellow bg-neon-yellow/15 text-neon-yellow"
                  : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10"
              }`}
            >
              ▸ Busca Linear
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <button
                    onClick={() => !binaryDisabled && p.setAlgo("binary")}
                    disabled={binaryDisabled || p.runState === "running"}
                    className={`clip-cyber-sm border px-4 py-1.5 text-xs uppercase font-bold transition ${
                      binaryDisabled
                        ? "border-neon-magenta/40 text-neon-magenta/60 cursor-not-allowed opacity-60 bg-neon-magenta/5"
                        : p.algo === "binary"
                        ? "border-neon-yellow bg-neon-yellow/15 text-neon-yellow"
                        : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10"
                    }`}
                  >
                    {binaryDisabled ? "⛔ Busca Binária" : "▸ Busca Binária"}
                  </button>
                </span>
              </TooltipTrigger>
              {binaryDisabled && (
                <TooltipContent className="max-w-xs bg-[#0c0f12] border border-neon-magenta text-neon-magenta text-[10px] uppercase">
                  {p.binaryDisabledReason}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <div className="text-[10px] text-neon-cyan mb-1">// MODO DE BUSCA</div>
            <select
              value={p.mode}
              onChange={(e) => p.setMode(e.target.value as SearchMode)}
              disabled={p.runState === "running"}
              className="w-full bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow uppercase clip-cyber-sm"
            >
              <option value="id">ID exato</option>
              <option value="name">Nome exato</option>
              <option value="substring">Substring (parcial)</option>
            </select>
          </div>

          <div>
            <div className="text-[10px] text-neon-cyan mb-1">// CHAVE (ORDENAÇÃO)</div>
            <select
              value={p.key}
              onChange={(e) => p.setKey(e.target.value as SearchKey)}
              disabled={p.runState === "running"}
              className="w-full bg-background border border-neon-cyan/60 px-2 py-1 text-xs text-neon-yellow uppercase clip-cyber-sm"
            >
              <option value="id">ID</option>
              <option value="name">NOME</option>
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
              type="range" min={50} max={1500} step={10}
              value={p.speed}
              onChange={(e) => p.setSpeed(Number(e.target.value))}
              className="w-full accent-[color:var(--neon-magenta)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <div className="text-[10px] text-neon-cyan mb-1">
              // TERMO {p.mode === "id" ? "(ID numérico)" : p.mode === "name" ? "(nome exato)" : "(substring)"}
            </div>
            <input
              type="text"
              value={p.term}
              onChange={(e) => p.setTerm(e.target.value)}
              placeholder={p.mode === "id" ? "ex: 25" : p.mode === "name" ? "ex: pikachu" : "ex: char"}
              disabled={p.runState === "running"}
              className="w-full bg-background border border-neon-cyan/60 px-3 py-2 text-sm text-neon-yellow uppercase clip-cyber-sm placeholder:text-neon-cyan/30"
            />
          </div>
          <button
            onClick={() => p.setSorted(!p.sorted)}
            disabled={p.runState === "running"}
            className={`clip-cyber-sm border px-4 py-2 text-xs uppercase font-bold ${
              p.sorted
                ? "border-neon-green bg-neon-green/15 text-neon-green"
                : "border-neon-magenta bg-neon-magenta/10 text-neon-magenta"
            }`}
          >
            {p.sorted ? "✓ VETOR ORDENADO" : "⚠ VETOR EMBARALHADO"}
          </button>
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
              ▶ Executar Busca
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
    </TooltipProvider>
  );
}
