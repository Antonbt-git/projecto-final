import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

const data = [
  { dia: "Lun", tiempo: 14 },
  { dia: "Mar", tiempo: 17 },
  { dia: "Mié", tiempo: 15 },
  { dia: "Jue", tiempo: 19 },
  { dia: "Vie", tiempo: 16 },
  { dia: "Sáb", tiempo: 13 },
  { dia: "Dom", tiempo: 12 },
];

export default function AttentionChart() {
  return (
    <Card>

      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Tiempos de atención
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Evolución del tiempo promedio durante la semana
        </p>
      </div>

      <div className="h-72">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="tiempo"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </Card>
  );
}