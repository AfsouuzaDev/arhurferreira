import type { Pokemon } from "@/lib/sorting/algorithms";

export type FormatKey = "json" | "csv" | "buffer" | "compact";

export interface FormatResult {
  bytes: Uint8Array;
  preview: string;       // legible preview (or "binary" marker)
  hexdump: string;       // hex preview
  saveMs: number;
  loadMs: number;
  sizeKB: number;
}

/* ---------------- helpers ---------------- */

function toHexdump(bytes: Uint8Array, max = 256): string {
  const slice = bytes.slice(0, max);
  const lines: string[] = [];
  for (let i = 0; i < slice.length; i += 16) {
    const chunk = slice.slice(i, i + 16);
    const hex = Array.from(chunk).map((b) => b.toString(16).padStart(2, "0")).join(" ");
    const ascii = Array.from(chunk).map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
    lines.push(`${i.toString(16).padStart(8, "0")}  ${hex.padEnd(48, " ")}  |${ascii}|`);
  }
  if (bytes.length > max) lines.push(`... [+${bytes.length - max} bytes ocultos]`);
  return lines.join("\n");
}

function encodeText(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/* ---------------- JSON ---------------- */

function buildJSON(data: Pokemon[]): FormatResult {
  const t0 = performance.now();
  const str = JSON.stringify(data, null, 2);
  const bytes = encodeText(str);
  const saveMs = performance.now() - t0;

  const t1 = performance.now();
  JSON.parse(new TextDecoder().decode(bytes));
  const loadMs = performance.now() - t1;

  const preview = str.slice(0, 800) + (str.length > 800 ? "\n... [truncado]" : "");
  return { bytes, preview, hexdump: toHexdump(bytes), saveMs, loadMs, sizeKB: bytes.length / 1024 };
}

/* ---------------- CSV ---------------- */

function buildCSV(data: Pokemon[]): FormatResult {
  const t0 = performance.now();
  const header = "id,name,weight,height,base_experience\n";
  const rows = data.map((p) => `${p.id},${p.name},${p.weight},${p.height},${p.base_experience}`).join("\n");
  const str = header + rows;
  const bytes = encodeText(str);
  const saveMs = performance.now() - t0;

  const t1 = performance.now();
  str.split("\n").slice(1).forEach((line) => line.split(","));
  const loadMs = performance.now() - t1;

  const preview = str.slice(0, 800) + (str.length > 800 ? "\n... [truncado]" : "");
  return { bytes, preview, hexdump: toHexdump(bytes), saveMs, loadMs, sizeKB: bytes.length / 1024 };
}

/* ---------------- BUFFER (struct binário fixo) ----------------
 * Layout por registro (16 bytes):
 *   uint16 id | uint16 weight | uint16 height | uint16 base_exp | 8 bytes name (ASCII truncado)
 */

const REC_SIZE = 16;

function buildBuffer(data: Pokemon[]): FormatResult {
  const t0 = performance.now();
  const buf = new ArrayBuffer(data.length * REC_SIZE);
  const view = new DataView(buf);
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    const off = i * REC_SIZE;
    view.setUint16(off, p.id & 0xffff, true);
    view.setUint16(off + 2, p.weight & 0xffff, true);
    view.setUint16(off + 4, p.height & 0xffff, true);
    view.setUint16(off + 6, p.base_experience & 0xffff, true);
    const name = p.name.slice(0, 8);
    for (let j = 0; j < 8; j++) u8[off + 8 + j] = j < name.length ? name.charCodeAt(j) : 0;
  }
  const saveMs = performance.now() - t0;

  const t1 = performance.now();
  const n = u8.length / REC_SIZE;
  for (let i = 0; i < n; i++) {
    view.getUint16(i * REC_SIZE, true);
    view.getUint16(i * REC_SIZE + 2, true);
  }
  const loadMs = performance.now() - t1;

  const preview =
    "// Struct binário de tamanho fixo (16 bytes/registro)\n" +
    "// layout: [uint16 id][uint16 weight][uint16 height][uint16 base_exp][char[8] name]\n" +
    "// NÃO LEGÍVEL DIRETAMENTE — bytes brutos abaixo:\n\n" +
    toHexdump(u8, 256);

  return { bytes: u8, preview, hexdump: toHexdump(u8, 512), saveMs, loadMs, sizeKB: u8.length / 1024 };
}

/* ---------------- COMPACTADO (RLE simulado sobre bytes do JSON) ---------------- */

function rleEncode(input: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < input.length) {
    let run = 1;
    while (i + run < input.length && input[i + run] === input[i] && run < 255) run++;
    out.push(run, input[i]);
    i += run;
  }
  return new Uint8Array(out);
}

function buildCompact(data: Pokemon[]): FormatResult {
  const t0 = performance.now();
  // Serializa numeric stream + simula compressão RLE
  const numericOnly = data.map((p) => `${p.id}|${p.weight}|${p.height}|${p.base_experience}`).join(";");
  const raw = encodeText(numericOnly);
  const compressed = rleEncode(raw);
  // Acrescenta um cabeçalho fake
  const header = encodeText("CYB1");
  const bytes = new Uint8Array(header.length + compressed.length);
  bytes.set(header, 0);
  bytes.set(compressed, header.length);
  const saveMs = performance.now() - t0;

  const t1 = performance.now();
  // simula descompressão (não precisa reverter de fato — apenas medir)
  let acc = 0;
  for (let i = 4; i < bytes.length; i += 2) acc += bytes[i];
  const loadMs = performance.now() - t1;

  const preview =
    "// Stream binário comprimido (header CYB1 + RLE)\n" +
    "// ILEGÍVEL — bytes serializados abaixo:\n\n" +
    toHexdump(bytes, 256);

  return { bytes, preview, hexdump: toHexdump(bytes, 512), saveMs: saveMs + acc * 0, loadMs, sizeKB: bytes.length / 1024 };
}

/* ---------------- API pública ---------------- */

export const FORMAT_LABELS: Record<FormatKey, { name: string; type: "Texto" | "Binário"; desc: string }> = {
  json:    { name: "JSON",     type: "Texto",   desc: "JSON.stringify() — legível, verboso" },
  csv:     { name: "CSV",      type: "Texto",   desc: "Campos separados por vírgula — leve para tabelas" },
  buffer:  { name: "BUFFER",   type: "Binário", desc: "Struct fixo via DataView/Uint8Array — bytes puros" },
  compact: { name: "COMPACT",  type: "Binário", desc: "Stream serializado + RLE — mínimo footprint" },
};

export function buildAllFormats(data: Pokemon[]): Record<FormatKey, FormatResult> {
  return {
    json:    buildJSON(data),
    csv:     buildCSV(data),
    buffer:  buildBuffer(data),
    compact: buildCompact(data),
  };
}
