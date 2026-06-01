export function ActionLegend() {
  const items = [
    { label: "NEUTRO", desc: "Aguardando varredura", cls: "border-neon-cyan/60 bg-[#0c0f12]/80 text-neon-cyan" },
    { label: "COMPARANDO", desc: "Elementos sendo comparados", cls: "border-neon-yellow bg-neon-yellow/10 text-neon-yellow" },
    { label: "TROCANDO", desc: "Swap em execução", cls: "border-neon-magenta bg-neon-magenta/10 text-neon-magenta" },
    { label: "ORDENADO", desc: "Posição final confirmada", cls: "border-neon-green bg-neon-green/10 text-neon-green" },
  ];
  return (
    <div className="panel-cyber clip-cyber p-3">
      <div className="text-[10px] text-neon-magenta mb-2">▸ LEGENDA DE AÇÕES</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {items.map((it) => (
          <div key={it.label} className={`clip-cyber-sm border px-2 py-1 ${it.cls}`}>
            <div className="text-[10px] font-bold">■ {it.label}</div>
            <div className="text-[9px] opacity-80 text-foreground/80">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
