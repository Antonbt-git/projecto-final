import {
  FileText,
  Download,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const reports = [
  {
    title: "Reporte de atención",
    description:
      "Resumen de tiempos y atención a clientes.",
  },
  {
    title: "Reporte NLP",
    description:
      "Análisis y clasificación de comentarios.",
  },
  {
    title: "Reporte estadístico",
    description:
      "Métricas calculadas sobre los tiempos de atención.",
  },
];

export default function Reportes() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Reportes
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generación y consulta de reportes
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {reports.map((report) => (
          <Card key={report.title}>

            <div className="rounded-lg bg-blue-50 p-3 w-fit">
              <FileText className="text-blue-600" />
            </div>

            <h2 className="mt-4 font-semibold">
              {report.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {report.description}
            </p>

            <div className="mt-5">
              <Button variant="secondary">
                <span className="flex items-center gap-2">
                  <Download size={17} />
                  Generar reporte
                </span>
              </Button>
            </div>

          </Card>
        ))}

      </div>
    </div>
  );
}