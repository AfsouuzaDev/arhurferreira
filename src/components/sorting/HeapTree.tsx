import { motion } from "framer-motion";
import type { SortItem, SortKey } from "@/lib/sorting/algorithms";

interface Props {
  items: SortItem[];
  heapSize: number;
  sortKey: SortKey;
}

export function HeapTree({ items, heapSize, sortKey }: Props) {
  if (items.length === 0) return null;
  // Show up to 31 nodes (5 levels) to keep readable
  const max = Math.min(items.length, 31);
  const levels: number[][] = [];
  let idx = 0, level = 0;
  while (idx < max) {
    const count = Math.pow(2, level);
    const slice: number[] = [];
    for (let i = 0; i < count && idx < max; i++, idx++) slice.push(idx);
    levels.push(slice);
    level++;
  }

  const colorFor = (i: number) => {
    const it = items[i];
    if (!it) return "border-neon-cyan/40";
    if (i >= heapSize && heapSize > 0) return "border-[color:var(--neon-green)] shadow-[0_0_10px_#39ff14]";
    if (it.state === "comparing") return "border-[color:var(--neon-yellow)] shadow-[0_0_12px_#fcee0a]";
    if (it.state === "swapping") return "border-[color:var(--neon-magenta)] shadow-[0_0_12px_#ff0055]";
    if (it.state === "sorted") return "border-[color:var(--neon-green)]";
    return "border-[color:var(--neon-cyan)]";
  };

  return (
    <div className="panel-cyber clip-cyber p-3 mb-3">
      <div className="text-[10px] text-neon-magenta mb-2">▸ ÁRVORE BINÁRIA (MAX-HEAP) — heapSize: <span className="text-neon-yellow">{heapSize}</span></div>
      <div className="flex flex-col gap-3 items-center">
        {levels.map((row, li) => (
          <div key={li} className="flex gap-2 md:gap-4 justify-center items-end">
            {row.map((i) => (
              <motion.div
                layout
                key={items[i].pokemon.id}
                className={`relative w-14 h-14 rounded-full border-2 ${colorFor(i)} bg-black/60 flex flex-col items-center justify-center overflow-hidden`}
                title={`idx ${i} • ${items[i].pokemon.name}`}
              >
                {items[i].pokemon.sprite && (
                  <img src={items[i].pokemon.sprite} alt={items[i].pokemon.name} className="w-10 h-10 object-contain" />
                )}
                <div className="absolute -bottom-0.5 text-[8px] text-neon-yellow font-bold">
                  {items[i].pokemon[sortKey]}
                </div>
                <div className="absolute -top-2 -left-1 text-[8px] text-neon-cyan bg-black/80 px-1 rounded">{i}</div>
              </motion.div>
            ))}
          </div>
        ))}
        {items.length > max && (
          <div className="text-[10px] text-neon-cyan/60">... +{items.length - max} nós não exibidos (vetor maior que 31)</div>
        )}
      </div>
    </div>
  );
}
