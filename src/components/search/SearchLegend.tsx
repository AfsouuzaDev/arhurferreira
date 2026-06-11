export function SearchLegend({ algo }: { algo: "linear" | "binary" }) {
  const items = algo === "linear"
    ? [
        { c: "border-neon-cyan/60 bg-[#0c0f12]", label: "NEUTRO", color: "text-neon-cyan" },
        { c: "border-neon-yellow bg-neon-yellow/15 anim-flicker-yellow", label: "TESTANDO", color: "text-neon-yellow" },
        { c: "border-neon-green bg-neon-green/15", label: "ENCONTRADO", color: "text-neon-green" },
      ]
    : [
        { c: "border-neon-cyan bg-neon-cyan/15", label: "START (lo)", color: "text-neon-cyan" },
        { c: "border-neon-yellow bg-neon-yellow/15 anim-flicker-yellow", label: "MID", color: "text-neon-yellow" },
        { c: "border-neon-magenta bg-neon-magenta/15", label: "END (hi)", color: "text-neon-magenta" },
        { c: "border-foreground/15 bg-black/60 opacity-30", label: "DESCARTADO", color: "text-foreground/60" },
        { c: "border-neon-green bg-neon-green/15", label: "ENCONTRADO", color: "text-neon-green" },
      ];
  return (
    <div className="panel-cyber clip-cyber p-3">
      <div className="text-[10px] text-neon-magenta mb-2 uppercase tracking-widest">▸ Legenda — {algo === "linear" ? "Busca Linear" : "Busca Binária"}</div>
      <div className="flex flex-wrap gap-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <div className={`w-5 h-5 border ${it.c} clip-cyber-sm`} />
            <span className={`text-[10px] font-bold ${it.color}`}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
