import { useQuery } from "@tanstack/react-query";
import type { Pokemon } from "@/lib/sorting/algorithms";

interface ListResp {
  results: { name: string; url: string }[];
}

interface DetailResp {
  id: number;
  name: string;
  weight: number;
  height: number;
  base_experience: number;
  sprites: { front_default: string | null; other: { "official-artwork": { front_default: string | null } } };
}

async function fetchPokemons(): Promise<Pokemon[]> {
  const list: ListResp = await fetch("https://pokeapi.co/api/v2/pokemon?limit=500").then((r) => r.json());
  // Fetch in batches of 50 in parallel
  const results: Pokemon[] = [];
  const batchSize = 50;
  for (let i = 0; i < list.results.length; i += batchSize) {
    const batch = list.results.slice(i, i + batchSize);
    const details = await Promise.all(
      batch.map((p) => fetch(p.url).then((r) => r.json() as Promise<DetailResp>))
    );
    for (const d of details) {
      results.push({
        id: d.id,
        name: d.name,
        sprite:
          d.sprites.other["official-artwork"].front_default ||
          d.sprites.front_default ||
          "",
        weight: d.weight ?? 0,
        height: d.height ?? 0,
        base_experience: d.base_experience ?? 0,
      });
    }
  }
  return results;
}

export function usePokemons() {
  return useQuery({
    queryKey: ["pokemons-500"],
    queryFn: fetchPokemons,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
