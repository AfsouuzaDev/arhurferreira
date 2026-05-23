export type SortKey = "weight" | "height" | "base_experience";

export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  weight: number;
  height: number;
  base_experience: number;
}

export type CardState = "neutral" | "comparing" | "swapping" | "sorted";

export interface SortItem {
  pokemon: Pokemon;
  state: CardState;
}

export interface SortContext {
  arr: SortItem[];
  key: SortKey;
  comparisons: number;
  swaps: number;
  activeLine: number;
  log: (msg: string) => void;
  setArr: (next: SortItem[]) => void;
  setMetrics: (c: number, s: number) => void;
  setActiveLine: (n: number) => void;
  setHeapSize?: (n: number) => void;
  sleep: () => Promise<void>;
  shouldStop: () => boolean;
  fast?: boolean;
}

const val = (p: Pokemon, k: SortKey) => p[k];

async function compare(ctx: SortContext, i: number, j: number) {
  ctx.comparisons++;
  if (ctx.fast) return;
  ctx.setMetrics(ctx.comparisons, ctx.swaps);
  const a = ctx.arr[i], b = ctx.arr[j];
  a.state = "comparing"; b.state = "comparing";
  ctx.setArr([...ctx.arr]);
  ctx.log(`[CMP] ${a.pokemon.name.toUpperCase()}(${val(a.pokemon, ctx.key)}) vs ${b.pokemon.name.toUpperCase()}(${val(b.pokemon, ctx.key)})`);
  await ctx.sleep();
  a.state = "neutral"; b.state = "neutral";
}

async function swap(ctx: SortContext, i: number, j: number) {
  ctx.swaps++;
  if (ctx.fast) {
    const t = ctx.arr[i];
    ctx.arr[i] = ctx.arr[j];
    ctx.arr[j] = t;
    return;
  }
  ctx.setMetrics(ctx.comparisons, ctx.swaps);
  ctx.arr[i].state = "swapping";
  ctx.arr[j].state = "swapping";
  ctx.setArr([...ctx.arr]);
  ctx.log(`[SWP] ${ctx.arr[i].pokemon.name.toUpperCase()} <-> ${ctx.arr[j].pokemon.name.toUpperCase()}`);
  await ctx.sleep();
  const temp = ctx.arr[i];
  ctx.arr[i] = ctx.arr[j];
  ctx.arr[j] = temp;
  ctx.arr[i].state = "neutral";
  ctx.arr[j].state = "neutral";
  ctx.setArr([...ctx.arr]);
}

function markSorted(ctx: SortContext, i: number) {
  if (ctx.fast) return;
  ctx.arr[i].state = "sorted";
  ctx.setArr([...ctx.arr]);
}

export async function bubbleSort(ctx: SortContext) {
  const n = ctx.arr.length;
  for (let i = 0; i < n - 1; i++) {
    if (ctx.shouldStop()) return;
    ctx.setActiveLine(1);
    for (let j = 0; j < n - i - 1; j++) {
      if (ctx.shouldStop()) return;
      ctx.setActiveLine(2);
      await compare(ctx, j, j + 1);
      ctx.setActiveLine(3);
      if (val(ctx.arr[j].pokemon, ctx.key) > val(ctx.arr[j + 1].pokemon, ctx.key)) {
        ctx.setActiveLine(4);
        await swap(ctx, j, j + 1);
      }
    }
    markSorted(ctx, n - i - 1);
  }
  markSorted(ctx, 0);
}

export async function selectionSort(ctx: SortContext) {
  const n = ctx.arr.length;
  for (let i = 0; i < n - 1; i++) {
    if (ctx.shouldStop()) return;
    ctx.setActiveLine(1);
    let min = i;
    ctx.setActiveLine(2);
    for (let j = i + 1; j < n; j++) {
      if (ctx.shouldStop()) return;
      ctx.setActiveLine(3);
      await compare(ctx, min, j);
      ctx.setActiveLine(4);
      if (val(ctx.arr[j].pokemon, ctx.key) < val(ctx.arr[min].pokemon, ctx.key)) {
        ctx.setActiveLine(5);
        min = j;
      }
    }
    ctx.setActiveLine(6);
    if (min !== i) {
      ctx.setActiveLine(7);
      await swap(ctx, i, min);
    }
    markSorted(ctx, i);
  }
  markSorted(ctx, n - 1);
}

export async function insertionSort(ctx: SortContext) {
  const n = ctx.arr.length;
  markSorted(ctx, 0);
  for (let i = 1; i < n; i++) {
    if (ctx.shouldStop()) return;
    ctx.setActiveLine(1);
    let j = i;
    ctx.setActiveLine(2);
    while (j > 0) {
      if (ctx.shouldStop()) return;
      ctx.setActiveLine(3);
      await compare(ctx, j - 1, j);
      ctx.setActiveLine(4);
      if (val(ctx.arr[j - 1].pokemon, ctx.key) > val(ctx.arr[j].pokemon, ctx.key)) {
        ctx.setActiveLine(5);
        await swap(ctx, j - 1, j);
        ctx.setActiveLine(6);
        j--;
      } else break;
    }
    if (!ctx.fast) {
      for (let k = 0; k <= i; k++) ctx.arr[k].state = "sorted";
      ctx.setArr([...ctx.arr]);
    }
  }
}

async function mergeRange(ctx: SortContext, l: number, r: number) {
  if (l >= r || ctx.shouldStop()) return;
  ctx.setActiveLine(1);
  const m = Math.floor((l + r) / 2);
  ctx.setActiveLine(2);
  ctx.setActiveLine(3);
  await mergeRange(ctx, l, m);
  await mergeRange(ctx, m + 1, r);
  ctx.setActiveLine(4);
  // Merge: extract sub, sort by comparison then write back via swaps
  const left = ctx.arr.slice(l, m + 1).map((x) => x.pokemon);
  const right = ctx.arr.slice(m + 1, r + 1).map((x) => x.pokemon);
  let i = 0, j = 0, k = l;
  while (i < left.length && j < right.length) {
    if (ctx.shouldStop()) return;
    ctx.comparisons++;
    ctx.setMetrics(ctx.comparisons, ctx.swaps);
    ctx.arr[k].state = "comparing";
    ctx.setArr([...ctx.arr]);
    ctx.log(`[MRG] ${left[i].name.toUpperCase()}(${val(left[i], ctx.key)}) vs ${right[j].name.toUpperCase()}(${val(right[j], ctx.key)})`);
    await ctx.sleep();
    ctx.arr[k].state = "neutral";
    if (val(left[i], ctx.key) <= val(right[j], ctx.key)) {
      if (ctx.arr[k].pokemon.id !== left[i].id) {
        ctx.swaps++;
        ctx.arr[k] = { pokemon: left[i], state: "swapping" };
        ctx.setMetrics(ctx.comparisons, ctx.swaps);
        ctx.setArr([...ctx.arr]);
        await ctx.sleep();
        ctx.arr[k].state = "neutral";
      }
      i++;
    } else {
      if (ctx.arr[k].pokemon.id !== right[j].id) {
        ctx.swaps++;
        ctx.arr[k] = { pokemon: right[j], state: "swapping" };
        ctx.setMetrics(ctx.comparisons, ctx.swaps);
        ctx.setArr([...ctx.arr]);
        await ctx.sleep();
        ctx.arr[k].state = "neutral";
      }
      j++;
    }
    k++;
  }
  while (i < left.length) {
    if (ctx.arr[k].pokemon.id !== left[i].id) {
      ctx.swaps++;
      ctx.arr[k] = { pokemon: left[i], state: "swapping" };
      ctx.setMetrics(ctx.comparisons, ctx.swaps);
      ctx.setArr([...ctx.arr]);
      await ctx.sleep();
      ctx.arr[k].state = "neutral";
    }
    i++; k++;
  }
  while (j < right.length) {
    if (ctx.arr[k].pokemon.id !== right[j].id) {
      ctx.swaps++;
      ctx.arr[k] = { pokemon: right[j], state: "swapping" };
      ctx.setMetrics(ctx.comparisons, ctx.swaps);
      ctx.setArr([...ctx.arr]);
      await ctx.sleep();
      ctx.arr[k].state = "neutral";
    }
    j++; k++;
  }
}

export async function mergeSort(ctx: SortContext) {
  await mergeRange(ctx, 0, ctx.arr.length - 1);
  for (let i = 0; i < ctx.arr.length; i++) markSorted(ctx, i);
}

async function partition(ctx: SortContext, lo: number, hi: number): Promise<number> {
  ctx.setActiveLine(1);
  const pivot = ctx.arr[hi].pokemon;
  ctx.log(`[PVT] Pivô = ${pivot.name.toUpperCase()}(${val(pivot, ctx.key)})`);
  ctx.setActiveLine(2);
  let i = lo - 1;
  ctx.setActiveLine(3);
  for (let j = lo; j < hi; j++) {
    if (ctx.shouldStop()) return i + 1;
    ctx.setActiveLine(4);
    await compare(ctx, j, hi);
    if (val(ctx.arr[j].pokemon, ctx.key) <= val(pivot, ctx.key)) {
      i++;
      if (i !== j) await swap(ctx, i, j);
    }
  }
  ctx.setActiveLine(5);
  await swap(ctx, i + 1, hi);
  return i + 1;
}

async function quickRange(ctx: SortContext, lo: number, hi: number) {
  if (lo < hi && !ctx.shouldStop()) {
    const p = await partition(ctx, lo, hi);
    ctx.setActiveLine(6);
    await quickRange(ctx, lo, p - 1);
    await quickRange(ctx, p + 1, hi);
  }
}

export async function quickSort(ctx: SortContext) {
  await quickRange(ctx, 0, ctx.arr.length - 1);
  for (let i = 0; i < ctx.arr.length; i++) markSorted(ctx, i);
}

async function heapify(ctx: SortContext, n: number, i: number) {
  if (ctx.shouldStop()) return;
  ctx.setActiveLine(6);
  let largest = i;
  const l = 2 * i + 1;
  const r = 2 * i + 2;
  if (l < n) {
    await compare(ctx, l, largest);
    if (val(ctx.arr[l].pokemon, ctx.key) > val(ctx.arr[largest].pokemon, ctx.key)) largest = l;
  }
  if (r < n) {
    await compare(ctx, r, largest);
    if (val(ctx.arr[r].pokemon, ctx.key) > val(ctx.arr[largest].pokemon, ctx.key)) largest = r;
  }
  if (largest !== i) {
    ctx.setActiveLine(7);
    await swap(ctx, i, largest);
    await heapify(ctx, n, largest);
  }
}

export async function heapSort(ctx: SortContext) {
  const n = ctx.arr.length;
  ctx.setHeapSize?.(n);
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    if (ctx.shouldStop()) return;
    ctx.setActiveLine(1);
    await heapify(ctx, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    if (ctx.shouldStop()) return;
    ctx.setActiveLine(2);
    ctx.setActiveLine(3);
    await swap(ctx, 0, i);
    markSorted(ctx, i);
    ctx.setHeapSize?.(i);
    ctx.setActiveLine(4);
    await heapify(ctx, i, 0);
  }
  markSorted(ctx, 0);
  ctx.setHeapSize?.(0);
}

export const ALGORITHMS = {
  bubble: { name: "Bubble Sort", fn: bubbleSort },
  selection: { name: "Selection Sort", fn: selectionSort },
  insertion: { name: "Insertion Sort", fn: insertionSort },
  merge: { name: "Merge Sort", fn: mergeSort },
  quick: { name: "Quick Sort", fn: quickSort },
  heap: { name: "Heap Sort", fn: heapSort },
} as const;

export type AlgorithmKey = keyof typeof ALGORITHMS;
