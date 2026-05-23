import type { AlgorithmKey } from "@/lib/sorting/algorithms";
import { ALGORITHM_INFO } from "@/lib/sorting/info";
import { ALGORITHMS } from "@/lib/sorting/algorithms";

interface Props {
  algorithm: AlgorithmKey;
  comparisons: number;
  swaps: number;
  elapsed: number;
  activeLine: number;
  logs: string[];
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-cyber clip-cyber p-3 relative">
      <div className="text-[10px] text-neon-magenta mb-2 uppercase tracking-widest">▸ {title}</div>
      {children}
    </div>
  );
}

export function DiagnosticPanel({ algorithm, comparisons, swaps, elapsed, activeLine, logs }: Props) {
  const info = ALGORITHM_INFO[algorithm];
  return (
    <div className="space-y-3">
      <Frame title="Descrição Teórica">
        <h2 className="text-base text-neon-yellow mb-2">{ALGORITHMS[algorithm].name}</h2>
        <p className="text-xs text-foreground/80 leading-relaxed font-sans">{info.description}</p>
      </Frame>

      <Frame title="Métricas de Hardware">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="border border-neon-cyan/40 p-2 clip-cyber-sm">
            <div className="text-[9px] text-neon-cyan">COMPARAÇÕES</div>
            <div className="text-xl text-neon-yellow font-bold tabular-nums">{comparisons}</div>
          </div>
          <div className="border border-neon-cyan/40 p-2 clip-cyber-sm">
            <div className="text-[9px] text-neon-cyan">TROCAS</div>
            <div className="text-xl text-neon-magenta font-bold tabular-nums">{swaps}</div>
          </div>
          <div className="border border-neon-cyan/40 p-2 clip-cyber-sm">
            <div className="text-[9px] text-neon-cyan">TEMPO (MS)</div>
            <div className="text-xl text-neon-green font-bold tabular-nums">{elapsed.toFixed(0)}</div>
          </div>
        </div>
      </Frame>

      <Frame title="Terminal de Narração">
        <div className="bg-black border border-neon-green/40 clip-cyber-sm p-2 h-40 overflow-y-auto text-[10px] leading-snug">
          {logs.length === 0 ? (
            <div className="text-neon-green/60">[SYS_LOG]: Aguardando execução...</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className={i === 0 ? "text-neon-green" : "text-neon-green/50"}>
                <span className="text-neon-cyan/60">[SYS_LOG]:</span> {l}
              </div>
            ))
          )}
        </div>
      </Frame>

      <Frame title="Pseudocódigo Dinâmico">
        <pre className="bg-black/60 border border-neon-cyan/30 clip-cyber-sm p-2 text-[11px] leading-relaxed overflow-x-auto">
          {info.pseudocode.map((line, i) => (
            <div
              key={i}
              className={
                i === activeLine
                  ? "bg-[color:var(--neon-yellow)] text-black px-1 font-bold"
                  : "text-foreground/80 px-1"
              }
            >
              <span className="text-neon-cyan/50 mr-2">{String(i).padStart(2, "0")}</span>{line}
            </div>
          ))}
        </pre>
      </Frame>

      <Frame title="Análise de Complexidade">
        <table className="w-full text-xs">
          <tbody>
            <tr><td className="text-neon-cyan py-1">Melhor caso</td><td className="text-neon-green text-right">{info.complexity.best}</td></tr>
            <tr><td className="text-neon-cyan py-1">Caso médio</td><td className="text-neon-yellow text-right">{info.complexity.average}</td></tr>
            <tr><td className="text-neon-cyan py-1">Pior caso</td><td className="text-neon-magenta text-right">{info.complexity.worst}</td></tr>
            <tr><td className="text-neon-cyan py-1">Espaço auxiliar</td><td className="text-neon-cyan text-right">{info.complexity.space}</td></tr>
          </tbody>
        </table>
        <p className="text-[10px] text-foreground/60 mt-2 italic">{info.complexity.note}</p>
      </Frame>
    </div>
  );
}
