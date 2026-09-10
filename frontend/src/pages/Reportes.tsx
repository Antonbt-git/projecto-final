import { useState } from "react";
import { FileText, Download, Loader2, AlertCircle } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getComentarios } from "../services/comentarios";
import { getResumenCategorias } from "../services/categorias";
import { getResumenDashboard, getTiemposDiarios } from "../services/dashboard";
import { obtenerEstadisticas } from "../services/scipy";

type ReportId = "atencion" | "nlp" | "estadistico";

interface ReportDefinition {
  id: ReportId;
  title: string;
  description: string;
}

const reports: ReportDefinition[] = [
  {
    id: "atencion",
    title: "Reporte de atención",
    description: "Resumen de tiempos y atención a clientes.",
  },
  {
    id: "nlp",
    title: "Reporte NLP",
    description: "Análisis y clasificación de comentarios.",
  },
  {
    id: "estadistico",
    title: "Reporte estadístico",
    description: "Métricas calculadas sobre los tiempos de atención.",
  },
];

type Fila = (string | number)[];

function celdaCSV(valor: string | number | null | undefined): string {
  const texto = String(valor ?? "");
  if (/[",\n;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function filasACSV(filas: Fila[]): string {
  return filas.map((fila) => fila.map(celdaCSV).join(",")).join("\r\n");
}

function descargarCSV(nombreArchivo: string, contenido: string) {
  // BOM al inicio para que Excel reconozca acentos/ñ correctamente.
  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function sufijoFecha(): string {
  return new Date().toISOString().slice(0, 10);
}

// --- Generadores de cada reporte, con datos reales del backend ---

async function generarReporteAtencion(): Promise<{ nombre: string; filas: Fila[] }> {
  const [resumen, tiempos] = await Promise.all([
    getResumenDashboard(),
    getTiemposDiarios(30),
  ]);

  const filas: Fila[] = [
    ["Reporte de atención"],
    ["Generado el", new Date().toLocaleString("es-PE")],
    [],
    ["Resumen general"],
    ["Clientes", resumen.clientes],
    ["Clientes activos", resumen.clientes_activos],
    ["Comentarios totales", resumen.comentarios],
    ["Comentarios procesados", resumen.comentarios_procesados],
    ["Comentarios pendientes", resumen.comentarios_pendientes],
    ["% de comentarios procesados", resumen.porcentaje_procesados],
    ["Tiempo promedio de atención (min)", resumen.tiempo_promedio_minutos],
    [],
    ["Tiempos de atención por día (últimos 30 días)"],
    ["Fecha", "Promedio (min)", "Cantidad de registros"],
  ];

  if (tiempos.length === 0) {
    filas.push(["Sin registros de tiempos de atención en este período."]);
  } else {
    for (const t of tiempos) {
      filas.push([t.fecha, t.promedio_minutos, t.cantidad_registros]);
    }
  }

  return { nombre: `reporte-atencion-${sufijoFecha()}.csv`, filas };
}

async function generarReporteNLP(): Promise<{ nombre: string; filas: Fila[] }> {
  const [comentarios, categorias] = await Promise.all([
    getComentarios(),
    getResumenCategorias().catch(() => []),
  ]);

  const filas: Fila[] = [
    ["Reporte NLP — Clasificación de comentarios"],
    ["Generado el", new Date().toLocaleString("es-PE")],
    [],
  ];

  if (categorias.length > 0) {
    filas.push(["Resumen por categoría"]);
    filas.push(["Categoría", "Total", "Procesados", "Pendientes"]);
    for (const c of categorias) {
      filas.push([c.nombre, c.total_comentarios, c.procesados, c.pendientes]);
    }
    filas.push([]);
  }

  filas.push(["Detalle de comentarios"]);
  filas.push([
    "ID",
    "Cliente",
    "Canal",
    "Categoría",
    "Estado",
    "Fecha",
    "Contenido",
  ]);

  if (comentarios.length === 0) {
    filas.push(["No hay comentarios registrados."]);
  } else {
    for (const c of comentarios) {
      filas.push([
        c.id,
        c.cliente_nombre ?? "",
        c.canal,
        c.categoria ?? "",
        c.estado,
        new Date(c.fecha).toLocaleString("es-PE"),
        c.contenido,
      ]);
    }
  }

  return { nombre: `reporte-nlp-${sufijoFecha()}.csv`, filas };
}

async function generarReporteEstadistico(): Promise<{ nombre: string; filas: Fila[] }> {
  const estadisticas = await obtenerEstadisticas(30);

  const filas: Fila[] = [
    ["Reporte estadístico — Tiempos de atención (últimos 30 días)"],
    ["Generado el", new Date().toLocaleString("es-PE")],
    [],
    ["Métrica", "Valor"],
    ["Cantidad de registros", estadisticas.cantidad],
    ["Media", estadisticas.media],
    ["Mediana", estadisticas.mediana],
    ["Desviación estándar", estadisticas.desviacion_estandar],
    ["Mínimo", estadisticas.minimo],
    ["Máximo", estadisticas.maximo],
  ];

  if (estadisticas.percentil_25 !== undefined) {
    filas.push(["Percentil 25", estadisticas.percentil_25]);
  }
  if (estadisticas.percentil_75 !== undefined) {
    filas.push(["Percentil 75", estadisticas.percentil_75]);
  }

  return { nombre: `reporte-estadistico-${sufijoFecha()}.csv`, filas };
}

const generadores: Record<ReportId, () => Promise<{ nombre: string; filas: Fila[] }>> = {
  atencion: generarReporteAtencion,
  nlp: generarReporteNLP,
  estadistico: generarReporteEstadistico,
};

export default function Reportes() {
  const [generandoId, setGenerandoId] = useState<ReportId | null>(null);
  const [errorId, setErrorId] = useState<ReportId | null>(null);
  const [listoId, setListoId] = useState<ReportId | null>(null);

  const handleGenerar = async (id: ReportId) => {
    setGenerandoId(id);
    setErrorId(null);
    setListoId(null);

    try {
      const { nombre, filas } = await generadores[id]();
      descargarCSV(nombre, filasACSV(filas));
      setListoId(id);
    } catch {
      setErrorId(id);
    } finally {
      setGenerandoId(null);
    }
  };

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
          <Card key={report.id}>
            <div className="rounded-lg bg-blue-50 p-3 w-fit dark:bg-blue-500/10">
              <FileText className="text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">
              {report.title}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {report.description}
            </p>

            <div className="mt-5">
              <Button
                variant="secondary"
                disabled={generandoId === report.id}
                onClick={() => handleGenerar(report.id)}
              >
                <span className="flex items-center gap-2">
                  {generandoId === report.id ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Download size={17} />
                  )}
                  {generandoId === report.id
                    ? "Generando..."
                    : "Generar reporte"}
                </span>
              </Button>
            </div>

            {errorId === report.id && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={14} />
                No se pudo generar el reporte. Verifica tu conexión e intenta
                de nuevo.
              </p>
            )}

            {listoId === report.id && (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                Reporte descargado correctamente.
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
