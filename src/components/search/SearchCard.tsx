import { motion } from "framer-motion";
import type { SearchItem } from "@/lib/search/algorithms";
import { cn } from "@/lib/utils";

export function SearchCard({ item, idx }: { item: SearchItem; idx: number }) {
  const { pokemon, state } = item;

  const stateClasses = {
    neutral: "border-[color:var(--neon-cyan)]/60 bg-[#0c0f12]/80",
    testing: "border-[color:var(--neon-yellow)] bg-[color:var(--neon-yellow)]/10 anim-flicker-yellow",
    start: "border-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/15 shadow-[0_0_14px_#00f0ff]",
    mid: "border-[color:var(--neon-yellow)] bg-[color:var(--neon-yellow)]/15 anim-flicker-yellow",
    end: "border-[color:var(--neon-magenta)] bg-[color:var(--neon-magenta)]/15 shadow-[0_0_14px_#ff0055]",
    discarded: "border-foreground/15 bg-black/60 opacity-25 grayscale",
    found: "border-[color:var(--neon-green)] bg-[color:var(--neon-green)]/15 shadow-[0_0_18px_#39ff14]",
  }[state];

  const tag = {
    neutral: "",
    testing: "TEST",
    start: "START",
    mid: "MID",
    end: "END",
    discarded: "OUT",
    found: "HIT",
  }[state];

  const tagColor = {
    neutral: "text-neon-cyan",
    testing: "text-neon-yellow",
    start: "text-neon-cyan",
    mid: "text-neon-yellow",
    end: "text-neon-magenta",
    discarded: "text-foreground/60",
    found: "text-neon-green",
  }[state];

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "clip-cyber-sm border flex flex-col items-center justify-between p-2 w-[100px] h-[130px] text-center transition-colors",
        stateClasses
      )}
    >
      <div className="w-full flex items-center justify-between text-[9px] opacity-80">
        <span className="text-neon-cyan">[{idx}]</span>
        <span className={tagColor}>{tag}</span>
      </div>
      {pokemon.sprite ? (
        <img src={pokemon.sprite} alt={pokemon.name} className="w-12 h-12 object-contain" loading="lazy" />
      ) : (
        <div className="w-12 h-12 bg-muted" />
      )}
      <div className="w-full">
        <div className={cn("text-[10px] font-bold truncate uppercase", tagColor)}>{pokemon.name}</div>
        <div className="text-[9px] text-foreground/80">
          <span className="opacity-60">#</span>
          <span className="text-neon-yellow font-bold">{String(pokemon.id).padStart(3, "0")}</span>
        </div>
      </div>
    </motion.div>
  );
}
