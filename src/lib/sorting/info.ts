import type { AlgorithmKey } from "./algorithms";

export interface AlgorithmInfo {
  description: string;
  pseudocode: string[];
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
    note: string;
  };
}

export const ALGORITHM_INFO: Record<AlgorithmKey, AlgorithmInfo> = {
  bubble: {
    description:
      "O Bubble Sort percorre o vetor repetidamente, comparando elementos adjacentes e trocando-os quando estão fora de ordem. A cada passada completa, o maior elemento 'borbulha' até o final da estrutura. É um algoritmo extremamente didático, porém ineficiente para grandes volumes de dados, pois realiza muitas comparações redundantes.",
    pseudocode: [
      "funcao bubbleSort(A):",
      "  para i de 0 até n-1:",
      "    para j de 0 até n-i-2:",
      "      se A[j] > A[j+1]:",
      "        trocar(A[j], A[j+1])",
      "  retornar A",
    ],
    complexity: {
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      note: "Possui dois laços aninhados; in-place sem memória auxiliar.",
    },
  },
  selection: {
    description:
      "O Selection Sort divide o vetor em duas regiões: ordenada (à esquerda) e desordenada (à direita). A cada iteração, ele varre a região desordenada em busca do menor elemento e o troca com a primeira posição não ordenada. Tem desempenho previsível, sempre quadrático, mas faz no máximo n trocas — útil quando o custo de troca é alto.",
    pseudocode: [
      "funcao selectionSort(A):",
      "  para i de 0 até n-2:",
      "    min = i",
      "    para j de i+1 até n-1:",
      "      se A[j] < A[min]:",
      "        min = j",
      "    se min != i:",
      "      trocar(A[i], A[min])",
    ],
    complexity: {
      best: "O(n²)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      note: "Sempre executa todas as comparações; troca apenas n vezes.",
    },
  },
  insertion: {
    description:
      "O Insertion Sort constrói o vetor ordenado um elemento por vez, deslocando os elementos maiores para a direita até encontrar a posição correta de inserção. É extremamente eficiente para vetores pequenos ou quase ordenados, sendo usado internamente em algoritmos híbridos como o Timsort.",
    pseudocode: [
      "funcao insertionSort(A):",
      "  para i de 1 até n-1:",
      "    j = i",
      "    enquanto j > 0:",
      "      se A[j-1] > A[j]:",
      "        trocar(A[j-1], A[j])",
      "      j = j - 1",
    ],
    complexity: {
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
      note: "Linear no melhor caso (vetor já ordenado); estável e in-place.",
    },
  },
  merge: {
    description:
      "O Merge Sort é um algoritmo de divisão e conquista que divide o vetor recursivamente ao meio até obter subvetores de tamanho 1, e depois realiza a fusão (merge) ordenada dessas partes. Garante complexidade O(n log n) em todos os casos, mas requer memória auxiliar proporcional a n.",
    pseudocode: [
      "funcao mergeSort(A, l, r):",
      "  se l < r:",
      "    m = (l + r) / 2",
      "    mergeSort(A, l, m); mergeSort(A, m+1, r)",
      "    merge(A, l, m, r)",
    ],
    complexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      space: "O(n)",
      note: "Divide e conquista com fusão linear; usa buffer auxiliar.",
    },
  },
  quick: {
    description:
      "O Quick Sort escolhe um elemento como pivô e particiona o vetor de forma que valores menores fiquem à esquerda e maiores à direita, recursivamente. É geralmente o mais rápido na prática, mas seu pior caso (pivô ruim) degenera para O(n²).",
    pseudocode: [
      "funcao quickSort(A, lo, hi):",
      "  pivot = A[hi]",
      "  i = lo - 1",
      "  para j de lo até hi-1:",
      "    se A[j] <= pivot: i++; trocar(A[i], A[j])",
      "  trocar(A[i+1], A[hi])",
      "  quickSort(esquerda); quickSort(direita)",
    ],
    complexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
      space: "O(log n)",
      note: "Particionamento in-place; pior caso ocorre com pivô degenerado.",
    },
  },
  heap: {
    description:
      "O Heap Sort organiza o vetor como uma árvore binária max-heap, garantindo que a raiz contenha o maior elemento. Em seguida, troca a raiz com o último elemento, reduz o heap e refaz a heapificação. Combina a estabilidade do tempo de O(n log n) com uso de memória O(1).",
    pseudocode: [
      "funcao heapSort(A):",
      "  para i = n/2-1 até 0: heapify(A, n, i)",
      "  para i = n-1 até 1:",
      "    trocar(A[0], A[i])",
      "    heapify(A, i, 0)",
      "heapify(A, n, i):",
      "  largest = i; calcula filhos l, r",
      "  trocar(A[i], A[largest]) e recursão",
    ],
    complexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
      space: "O(1)",
      note: "Usa árvore binária implícita no array; in-place sem recursão profunda.",
    },
  },
};
