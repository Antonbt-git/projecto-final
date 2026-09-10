import { useEffect, useState } from "react";
import { Loader2, Tag } from "lucide-react";

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { getResumenCategorias } from "../../services/categorias";
import type { CategorySummary as CategorySummaryType } from "../../types";

// Respaldo (fallback) mientras el backend no responda, para que el
// apartado nunca se vea vacío. Coincide con la tabla `categorias`
// sembrada por la migración de la base de datos.
const RESPALDO: CategorySummaryType[] = [
  { id: 1, nombre: "VENTAS", activo: true, total_comentarios: 0, procesados: 0, pendientes: 0 },
  { id: 2, nombre: "SOPORTE", activo: true, total_comentarios: 0, procesados: 0, pendientes: 0 },
  { id: 3, nombre: "RECLAMO", activo: true, total_comentarios: 0, procesados: 0, pendientes: 0 },
  { id: 4, nombre: "CONSULTA", activo: true, total_comentarios: 0, procesados: 0, pendientes: 0 },
  { id: 5, nombre: "FELICITACION", activo: true, total_comentarios: 0, procesados: 0, pendientes: 0 },
  { id: 6, nombre: "OTROS", activo: true, total_comentarios: 0, procesados: 0, pendientes: 0 },
];

const COLORES: Record<string, string> = {
  VENTAS: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  SOPORTE: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  RECLAMO: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  CONSULTA: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  FELICITACION: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  OTROS: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
};

function colorCategoria(nombre: string): string {
  return COLORES[nombre] ?? COLORES.OTROS;
}

function formatearNombre(nombre: string): string {
  const normalizado = nombre.toLowerCase();
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
}

export default function CategorySummary() {
  const [categorias, setCategorias] = useState<CategorySummaryType[]>(RESPALDO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    getResumenCategorias()
      .then((data) => {
        if (activo && data.length > 0) setCategorias(data);
      })
      .catch(() => {
        // Se mantiene el respaldo si el endpoint aún no está disponible.
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Comentarios por categoría
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Distribución según la tabla de categorías de la base de datos
          </p>
        </div>

        {loading && (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorCategoria(
                    categoria.nombre
                  )}`}
                >
                  <Tag size={15} />
                </span>

                <span className="font-semibold text-slate-800 dark:text-white">
                  {formatearNombre(categoria.nombre)}
                </span>
              </div>

              {!categoria.activo && <Badge variant="gray">Inactiva</Badge>}
            </div>

            {categoria.descripcion && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {categoria.descripcion}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Total: <strong className="text-slate-800 dark:text-white">{categoria.total_comentarios}</strong>
              </span>

              <span className="text-emerald-600 dark:text-emerald-400">
                {categoria.procesados} procesados
              </span>

              <span className="text-amber-600 dark:text-amber-400">
                {categoria.pendientes} pendientes
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
