import { motion } from "framer-motion";
import type { SortItem, SortKey } from "@/lib/sorting/algorithms";
import { cn } from "@/lib/utils";

const KEY_LABEL: Record<SortKey, string> = {
  weight: "PESO",
  height: "ALT",
  base_experience: "EXP",
};

export function PokemonCard({ item, sortKey }: { item: SortItem; sortKey: SortKey }) {
  const { pokemon, state } = item;
  const v = pokemon[sortKey];

  const stateClasses = {
    neutral: "border-[color:var(--neon-cyan)]/60 bg-[#0c0f12]/80",
    comparing: "border-[color:var(--neon-yellow)] bg-[color:var(--neon-yellow)]/10 anim-flicker-yellow",
    swapping: "border-[color:var(--neon-magenta)] bg-[color:var(--neon-magenta)]/10 anim-flicker-magenta",
    sorted: "border-[color:var(--neon-green)] bg-[color:var(--neon-green)]/5",
  }[state];

  const textColor = {
    neutral: "text-neon-cyan",
    comparing: "text-neon-yellow",
    swapping: "text-neon-magenta",
    sorted: "text-neon-green",
  }[state];

  return (
    <motion.div
      layout
      layoutId={`pkm-${pokemon.id}`}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "clip-cyber-sm border flex flex-col items-center justify-between p-2 w-[120px] h-[150px] text-center",
        stateClasses
      )}
    >
      <div className="w-full flex items-center justify-between text-[9px] opacity-70">
        <span className="text-neon-cyan">#{String(pokemon.id).padStart(3, "0")}</span>
        <span className={textColor}>{state.slice(0, 3).toUpperCase()}</span>
      </div>
      {pokemon.sprite ? (
        <img src={pokemon.sprite} alt={pokemon.name} className="w-16 h-16 object-contain" loading="lazy" />
      ) : (
        <div className="w-16 h-16 bg-muted" />
      )}
      <div className="w-full">
        <div className={cn("text-[10px] font-bold truncate uppercase", textColor)}>{pokemon.name}</div>
        <div className="text-[10px] text-foreground/80">
          <span className="opacity-60">{KEY_LABEL[sortKey]}:</span>{" "}
          <span className="text-neon-yellow font-bold">{v}</span>
        </div>
      </div>
    </motion.div>
  );
}
