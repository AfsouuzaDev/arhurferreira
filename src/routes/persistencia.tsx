import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePokemons, readDiskCache, writeDiskCache, hasDiskCache, isOfflineMode, setOfflineMode } from "@/hooks/usePokemons";
import { buildAllFormats, FORMAT_LABELS, type FormatKey, type FormatResult } from "@/lib/persistence/formats";

export const Route = createFileRoute("/persistencia")({
  component: PersistenciaPage,
});

function PersistenciaPage() {
  const qc = useQueryClient();
  const { data: pokemons, isLoading, error, refetch } = usePokemons();

  const [offline, setOffline] = useState(false);
  const [diskExists, setDiskExists] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [selected, setSelected] = useState<FormatKey>("json");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setOffline(isOfflineMode());
    setDiskExists(hasDiskCache());
  }, []);

  const formats = useMemo(() => {
    if (!pokemons || pokemons.length === 0) return null;
    return buildAllFormats(pokemons);
  }, [pokemons]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveCache = () => {
    if (!pokemons || pokemons.length === 0) {
      flash("⚠ Sem dados carregados para gravar.");
      return;
    }
    writeDiskCache(pokemons);
    setDiskExists(true);
    setSavedAt(new Date().toLocaleTimeString("pt-BR"));
    flash(`✓ ${pokemons.length} registros gravados no disco local.`);
  };

  const handleToggleOffline = async (v: boolean) => {
    if (v && !hasDiskCache()) {
      flash("⚠ Arquivo de cache não existe. Salve o cache antes de ativar o modo offline.");
      return;
    }
    setOfflineMode(v);
    setOffline(v);
    await qc.invalidateQueries({ queryKey: ["pokemons-500"] });
    await refetch();
    flash(v ? "✓ MODO OFFLINE ATIVADO — carregando do disco." : "✓ MODO ONLINE — reconectando à PokéAPI.");
  };

  const sel = formats?.[selected];

  return (
    <div className="space-y-4">
      {/* ============ Header ============ */}
      <div className="panel-cyber clip-cyber p-4">
        <div className="text-neon-yellow text-lg">▸ MÓDULO DE PERSISTÊNCIA EM DISCO</div>
        <div className="text-[10px] text-neon-cyan/80 mt-1">
          Camada de I/O do sistema — grava o vetor global de Pokémons em formatos de Texto e Binário (Buffer/Struct).
          Em produção, esta rotina utiliza Node.js FileSystem + TypedArrays no servidor. Aqui o disco é simulado via storage local sincronizado ao estado global.
        </div>
      </div>

      {/* ============ Cache controls ============ */}
      <div className="panel-cyber clip-cyber p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <div className="text-neon-magenta text-sm mb-2">▸ CONTROLE DE CACHE & MODO OFFLINE</div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleToggleOffline(!offline)}
              className={`clip-cyber-sm border-2 px-4 py-2 text-xs uppercase font-bold transition-colors ${
                offline
                  ? "border-neon-green bg-neon-green/15 text-neon-green"
                  : "border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/10"
              }`}
            >
              {offline ? "● MODO OFFLINE ATIVO" : "○ MODO OFFLINE (Carregar do Disco)"}
            </button>

            <button
              onClick={handleSaveCache}
              disabled={!pokemons || pokemons.length === 0}
              className="clip-cyber-sm border-2 border-neon-yellow text-neon-yellow px-4 py-2 text-xs uppercase font-bold hover:bg-neon-yellow/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ▼ SALVAR CACHE NO DISCO
            </button>
          </div>
          <div className="text-[10px] mt-2 space-x-3">
            <span className={diskExists ? "text-neon-green" : "text-neon-magenta"}>
              [DISK] {diskExists ? `OK — ${readDiskCache()?.length ?? 0} registros gravados` : "VAZIO — nenhum arquivo encontrado"}
            </span>
            {savedAt && <span className="text-neon-cyan/70">[LAST WRITE] {savedAt}</span>}
            <span className="text-neon-cyan/70">[SOURCE] {offline ? "DISCO LOCAL" : "POKÉAPI v2"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-neon-cyan/60">REGISTROS EM MEMÓRIA</div>
          <div className="text-3xl text-neon-green font-bold">{pokemons?.length ?? 0}</div>
        </div>
      </div>

      {toast && (
        <div className="panel-cyber clip-cyber p-3 border-2 border-neon-yellow text-neon-yellow text-xs">
          {toast}
        </div>
      )}

      {error && (
        <div className="panel-cyber clip-cyber p-3 border-2 border-neon-magenta text-neon-magenta text-xs">
          ⚠ {(error as Error).message}
        </div>
      )}

      {isLoading && (
        <div className="panel-cyber clip-cyber p-4 text-neon-cyan animate-pulse text-center text-xs">
          [BOOT] Carregando dataset...
        </div>
      )}

      {/* ============ Tabela comparativa ============ */}
      <div className="panel-cyber clip-cyber p-4">
        <div className="text-neon-magenta text-sm mb-3">▸ TABELA COMPARATIVA DE FORMATOS — Clique numa linha para inspecionar</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-neon-cyan border-b border-neon-cyan/30">
                <th className="text-left py-2 px-2">FORMATO</th>
                <th className="text-left py-2 px-2">TIPO</th>
                <th className="text-right py-2 px-2">TAMANHO (KB)</th>
                <th className="text-right py-2 px-2">SAVE (ms)</th>
                <th className="text-right py-2 px-2">LOAD (ms)</th>
                <th className="text-left py-2 px-2">DESCRIÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(FORMAT_LABELS) as FormatKey[]).map((k) => {
                const f = formats?.[k];
                const meta = FORMAT_LABELS[k];
                const active = selected === k;
                return (
                  <tr
                    key={k}
                    onClick={() => setSelected(k)}
                    className={`cursor-pointer border-b border-neon-cyan/10 transition-colors ${
                      active ? "bg-neon-yellow/10 text-neon-yellow" : "hover:bg-neon-cyan/5"
                    }`}
                  >
                    <td className="py-2 px-2 font-bold">{active ? "▶ " : "  "}{meta.name}</td>
                    <td className={`py-2 px-2 ${meta.type === "Binário" ? "text-neon-magenta" : "text-neon-cyan"}`}>{meta.type}</td>
                    <td className="py-2 px-2 text-right font-mono">{f ? f.sizeKB.toFixed(2) : "—"}</td>
                    <td className="py-2 px-2 text-right font-mono">{f ? f.saveMs.toFixed(2) : "—"}</td>
                    <td className="py-2 px-2 text-right font-mono">{f ? f.loadMs.toFixed(2) : "—"}</td>
                    <td className="py-2 px-2 text-[10px] text-foreground/70">{meta.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {formats && (
          <div className="text-[10px] text-neon-cyan/60 mt-3 italic">
            Observe que formatos binários (BUFFER, COMPACT) produzem arquivos drasticamente menores que JSON — o trade-off é a perda de legibilidade humana.
          </div>
        )}
      </div>

      {/* ============ Inspeção de memória ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalBox
          title="VISUALIZAÇÃO TEXTO — Legível"
          subtitle={`./cache.${selected} (${sel ? sel.sizeKB.toFixed(2) : "0"} KB)`}
          tone="cyan"
          content={sel?.preview ?? "[vazio]"}
        />
        <TerminalBox
          title="HEXDUMP BINÁRIO — Ilegível"
          subtitle={`raw bytes • offset 0x00`}
          tone="magenta"
          content={sel?.hexdump ?? "[vazio]"}
        />
      </div>
    </div>
  );
}

function TerminalBox({ title, subtitle, tone, content }: { title: string; subtitle: string; tone: "cyan" | "magenta"; content: string }) {
  const color = tone === "cyan" ? "neon-cyan" : "neon-magenta";
  return (
    <div className={`panel-cyber clip-cyber p-3 border-2 border-${color}/40`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-${color} text-xs font-bold`}>▸ {title}</div>
        <div className="text-[9px] text-foreground/50 font-mono">{subtitle}</div>
      </div>
      <pre className={`text-[10px] font-mono leading-tight text-${color} bg-black/60 p-3 max-h-96 overflow-auto whitespace-pre`}>
{content}
      </pre>
    </div>
  );
}
