import type { Pokemon } from "@/lib/sorting/algorithms";

export type SearchAlgoKey = "linear" | "binary";
export type SearchMode = "id" | "name" | "substring";
export type SearchKey = "id" | "name";

export type SearchCardState =
  | "neutral"
  | "testing"
  | "start"
  | "mid"
  | "end"
  | "discarded"
  | "found";

export interface SearchItem {
  pokemon: Pokemon;
  state: SearchCardState;
}

export interface SearchContext {
  arr: SearchItem[];
  mode: SearchMode;
  key: SearchKey; // attribute used as ordering for binary
  term: string;
  comparisons: number;
  setArr: (next: SearchItem[]) => void;
  setComparisons: (n: number) => void;
  setActiveLine: (n: number) => void;
  log: (msg: string) => void;
  sleep: () => Promise<void>;
  shouldStop: () => boolean;
  onFound: (idx: number) => void;
}

function matches(p: Pokemon, mode: SearchMode, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  if (mode === "id") return String(p.id) === t;
  if (mode === "name") return p.name.toLowerCase() === t;
  return p.name.toLowerCase().includes(t);
}

// Comparison for binary search: -1 if p < target, 0 equal, 1 if greater
function cmpForBinary(p: Pokemon, key: SearchKey, term: string): number {
  if (key === "id") {
    const t = Number(term);
    if (isNaN(t)) return 1;
    return p.id < t ? -1 : p.id > t ? 1 : 0;
  }
  const a = p.name.toLowerCase();
  const b = term.trim().toLowerCase();
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function resetStates(ctx: SearchContext) {
  for (const it of ctx.arr) it.state = "neutral";
}

export async function linearSearch(ctx: SearchContext): Promise<number[]> {
  const found: number[] = [];
  let comps = 0;
  ctx.setActiveLine(0);
  for (let i = 0; i < ctx.arr.length; i++) {
    if (ctx.shouldStop()) return found;
    ctx.setActiveLine(1);
    resetStates(ctx);
    ctx.arr[i].state = "testing";
    comps++;
    ctx.setComparisons(comps);
    ctx.setArr([...ctx.arr]);
    ctx.log(`[CMP] idx ${i} → ${ctx.arr[i].pokemon.name.toUpperCase()}`);
    await ctx.sleep();
    ctx.setActiveLine(2);
    if (matches(ctx.arr[i].pokemon, ctx.mode, ctx.term)) {
      ctx.setActiveLine(3);
      ctx.arr[i].state = "found";
      ctx.setArr([...ctx.arr]);
      ctx.log(`[HIT] ${ctx.arr[i].pokemon.name.toUpperCase()} encontrado em idx ${i}`);
      found.push(i);
      ctx.onFound(i);
      await ctx.sleep();
    }
  }
  ctx.setActiveLine(4);
  if (found.length === 0) ctx.log(`[MISS] Nenhum alvo encontrado para "${ctx.term}"`);
  return found;
}

export async function binarySearch(ctx: SearchContext): Promise<number[]> {
  let lo = 0, hi = ctx.arr.length - 1;
  let comps = 0;
  ctx.setActiveLine(0);
  while (lo <= hi) {
    if (ctx.shouldStop()) return [];
    const mid = Math.floor((lo + hi) / 2);
    ctx.setActiveLine(1);
    // Mark discarded + highlight start/mid/end
    for (let i = 0; i < ctx.arr.length; i++) {
      if (i < lo || i > hi) ctx.arr[i].state = "discarded";
      else ctx.arr[i].state = "neutral";
    }
    ctx.arr[lo].state = "start";
    ctx.arr[hi].state = "end";
    ctx.arr[mid].state = "mid";
    comps++;
    ctx.setComparisons(comps);
    ctx.setArr([...ctx.arr]);
    ctx.log(`[BIN] lo=${lo} mid=${mid} hi=${hi} → ${ctx.arr[mid].pokemon.name.toUpperCase()}`);
    await ctx.sleep();

    ctx.setActiveLine(2);
    const c = cmpForBinary(ctx.arr[mid].pokemon, ctx.key, ctx.term);
    if (c === 0) {
      ctx.setActiveLine(3);
      // discard everything else
      for (let i = 0; i < ctx.arr.length; i++) {
        if (i !== mid) ctx.arr[i].state = "discarded";
      }
      ctx.arr[mid].state = "found";
      ctx.setArr([...ctx.arr]);
      ctx.log(`[HIT] ${ctx.arr[mid].pokemon.name.toUpperCase()} em idx ${mid}`);
      ctx.onFound(mid);
      await ctx.sleep();
      return [mid];
    } else if (c < 0) {
      ctx.setActiveLine(4);
      // mid < term → discard left half
      for (let i = lo; i <= mid; i++) ctx.arr[i].state = "discarded";
      ctx.setArr([...ctx.arr]);
      lo = mid + 1;
    } else {
      ctx.setActiveLine(5);
      for (let i = mid; i <= hi; i++) ctx.arr[i].state = "discarded";
      ctx.setArr([...ctx.arr]);
      hi = mid - 1;
    }
    await ctx.sleep();
  }
  ctx.setActiveLine(6);
  // mark all as discarded
  for (let i = 0; i < ctx.arr.length; i++) ctx.arr[i].state = "discarded";
  ctx.setArr([...ctx.arr]);
  ctx.log(`[MISS] "${ctx.term}" não encontrado`);
  return [];
}

export const SEARCH_ALGORITHMS = {
  linear: { name: "Busca Linear", fn: linearSearch },
  binary: { name: "Busca Binária", fn: binarySearch },
} as const;

export const SEARCH_INFO: Record<SearchAlgoKey, {
  description: string;
  pseudocode: string[];
  complexity: { best: string; average: string; worst: string; space: string; note: string };
}> = {
  linear: {
    description:
      "A Busca Linear percorre o vetor sequencialmente do início ao fim, comparando cada elemento com o alvo. Funciona em qualquer vetor (ordenado ou não) e em qualquer tipo de busca (id, nome ou substring), porém seu custo cresce proporcionalmente ao tamanho da entrada.",
    pseudocode: [
      "funcao buscaLinear(A, alvo):",
      "  para i de 0 até n-1:",
      "    se A[i] == alvo:",
      "      retornar i",
      "  retornar -1",
    ],
    complexity: { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)", note: "Não exige vetor ordenado; única opção para busca por substring." },
  },
  binary: {
    description:
      "A Busca Binária exige um vetor previamente ordenado pela chave de comparação. A cada iteração ela calcula o ponto médio, compara com o alvo e descarta metade do intervalo. O número de comparações cresce de forma logarítmica, tornando-a extremamente rápida em grandes volumes.",
    pseudocode: [
      "funcao buscaBinaria(A, alvo):",
      "  lo=0; hi=n-1; mid=(lo+hi)/2",
      "  comparar A[mid] com alvo",
      "  se igual: retornar mid",
      "  se A[mid] < alvo: lo = mid+1",
      "  senao: hi = mid-1",
      "  retornar -1 (intervalo vazio)",
    ],
    complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", note: "Pré-condição: vetor ORDENADO pela chave de comparação." },
  },
};

// Utility: check if pokemons are sorted ascending by key
export function isSortedBy(pokemons: Pokemon[], key: SearchKey): boolean {
  for (let i = 1; i < pokemons.length; i++) {
    if (key === "id") {
      if (pokemons[i - 1].id > pokemons[i].id) return false;
    } else {
      if (pokemons[i - 1].name.toLowerCase() > pokemons[i].name.toLowerCase()) return false;
    }
  }
  return true;
}
