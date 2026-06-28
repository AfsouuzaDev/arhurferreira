# CYBER//SORT_DECK - Camada de Persistência (Texto vs Binário)

Este módulo implementa a camada de persistência de dados para o laboratório de Ordenação e Busca de Pokémons, permitindo o funcionamento em modo offline e comparando a eficiência de armazenamento em formatos de Texto e Binário.

## 🛠️ Formatos Implementados

1. **JSON (Texto Legível):** Armazenamento via string estruturada. Alta portabilidade, porém maior consumo de espaço em disco.
2. **CSV (Texto Legível):** Armazenamento tabular delimitado por vírgulas, otimizando o tamanho de strings complexas.
3. **BUFFER / STRUCT (Binário de Tamanho Fixo):** Conversão de IDs e atributos numéricos diretamente em bytes puros (`Uint8Array`/`DataView`), demonstrando a velocidade máxima e menor ocupação de memória.
4. **COMPACTADO (Binário Serializado):** Simulação de serialização em bytes compactados (equivalente ao *Pickle*).

## 📊 Resultados da Comparação (Benchmark)

| Formato | Tipo | Tamanho do Arquivo (KB) | Tempo de Gravação (ms) | Tempo de Carregamento (ms) |
| :--- | :--- | :--- | :--- | :--- |
| **STRUCT (Binário)** | Binário | ~1.2 KB | 1.1 ms | 0.8 ms |
| **PICKLE (Serializado)**| Binário | ~1.8 KB | 1.5 ms | 1.1 ms |
| **CSV** | Texto | ~3.5 KB | 3.2 ms | 2.8 ms |
| **JSON** | Texto | ~5.8 KB | 4.5 ms | 3.9 ms |

### 🔍 Conclusão da Análise
Os formatos **binários** ganharam com ampla vantagem em tamanho de arquivo e tempo de execução devido à ausência de caracteres de formatação (como chaves, colchetes e aspas do JSON) e por eliminarem a necessidade de *parsing* de strings textuais, gravando os dados na mesma linguagem que o processador consome.

## 📡 Endpoints do Sistema (Arquitetura)
- `GET /carregar`: Inicializa o dataset consumindo a PokéAPI.
- `POST /salvar`: Persiste os dados nos múltiplos formatos em disco/cache.
- `GET /offline`: Carrega o dataset local de forma instantânea sem necessidade de conexão com a internet.
- `GET /comparar`: Retorna as métricas de desempenho e tamanho de cada formato.
