import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const SIZES = [10, 50, 100, 500, 1000];

export function SearchPerformanceChart() {
  const data = SIZES.map((n) => ({
    n,
    linear: n,                              // pior caso O(n)
    linearAvg: Math.round(n / 2),          // caso médio
    binary: Math.ceil(Math.log2(n + 1)),   // O(log n)
  }));

  return (
    <div className="panel-cyber clip-cyber p-4">
      <div className="text-neon-magenta text-sm mb-3">▸ CURVAS DE COMPLEXIDADE — Comparações por tamanho da amostra</div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#00f0ff22" />
            <XAxis dataKey="n" stroke="#00f0ff" tick={{ fontSize: 10 }} label={{ value: "n (elementos)", fill: "#00f0ff", fontSize: 10, dy: 12 }} />
            <YAxis stroke="#00f0ff" tick={{ fontSize: 10 }} label={{ value: "comparações", angle: -90, fill: "#00f0ff", fontSize: 10, dx: -10 }} />
            <Tooltip contentStyle={{ background: "#0c0f12", border: "1px solid #00f0ff", fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="linear" name="Linear — pior caso O(n)" stroke="#ff0055" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="linearAvg" name="Linear — caso médio n/2" stroke="#fcee0a" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="binary" name="Binária O(log n)" stroke="#39ff14" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-5 gap-2 mt-3 text-[10px]">
        {data.map((d) => (
          <div key={d.n} className="border border-neon-cyan/30 clip-cyber-sm p-2 text-center">
            <div className="text-neon-cyan">n = {d.n}</div>
            <div className="text-neon-magenta">Lin: {d.linear}</div>
            <div className="text-neon-green">Bin: {d.binary}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-foreground/60 mt-3 italic">
        Para n=1000, a Busca Linear pode realizar até 1000 comparações enquanto a Binária precisa de no máximo {Math.ceil(Math.log2(1001))} — a diferença cresce exponencialmente.
      </p>
    </div>
  );
}
