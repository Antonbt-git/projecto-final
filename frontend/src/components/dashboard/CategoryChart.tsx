import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import Card from "../ui/Card";

const data = [
  { name: "SOPORTE", value: 42 },
  { name: "VENTAS", value: 27 },
  { name: "RECLAMO", value: 18 },
  { name: "CONSULTA", value: 8 },
  { name: "FELICITACION", value: 5 },
];

export default function CategoryChart() {
  return (
    <Card>

      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Categorías NLP
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Distribución de comentarios clasificados
        </p>
      </div>

      <div className="h-72">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={3}
              label
            >
              {data.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </Card>
  );
}