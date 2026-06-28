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

const STORAGE_KEY = "cyber:pokemons:disk";
const OFFLINE_KEY = "cyber:pokemons:offline";

export function readDiskCache(): Pokemon[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Pokemon[]) : null;
  } catch { return null; }
}

export function writeDiskCache(data: Pokemon[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function hasDiskCache(): boolean {
  return !!readDiskCache();
}

export function isOfflineMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(OFFLINE_KEY) === "1";
}

export function setOfflineMode(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OFFLINE_KEY, v ? "1" : "0");
}

async function fetchPokemons(): Promise<Pokemon[]> {
  if (isOfflineMode()) {
    const disk = readDiskCache();
    if (!disk || disk.length === 0) {
      throw new Error("MODO OFFLINE ATIVO: arquivo de cache não encontrado em disco. Desative o modo offline ou salve o cache primeiro na aba PERSISTÊNCIA.");
    }
    return disk;
  }

  const list: ListResp = await fetch("https://pokeapi.co/api/v2/pokemon?limit=500").then((r) => r.json());
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
    retry: false,
  });
}
