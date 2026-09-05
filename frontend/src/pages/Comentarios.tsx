import {
  MessageSquare,
  Search,
} from "lucide-react";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

const comments = [
  {
    id: 1,
    cliente: "Juan Pérez",
    contenido:
      "El servicio fue rápido y la atención excelente.",
    canal: "web",
    categoria: "FELICITACION",
    estado: "procesado",
    fecha: "03/09/2026",
  },
  {
    id: 2,
    cliente: "María García",
    contenido:
      "Tengo un problema con mi producto.",
    canal: "web",
    categoria: "SOPORTE",
    estado: "pendiente",
    fecha: "03/09/2026",
  },
  {
    id: 3,
    cliente: "Carlos López",
    contenido:
      "Quiero información sobre sus precios.",
    canal: "email",
    categoria: "CONSULTA",
    estado: "procesado",
    fecha: "02/09/2026",
  },
];

export default function Comentarios() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Comentarios
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestión y análisis de comentarios de clientes
        </p>
      </div>

      <Card>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              placeholder="Buscar comentarios..."
              className="pl-10"
            />
          </div>

          <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
            <option value="">Todas las categorías</option>
            <option value="VENTAS">Ventas</option>
            <option value="SOPORTE">Soporte</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="CONSULTA">Consulta</option>
            <option value="FELICITACION">
              Felicitación
            </option>
          </select>
        </div>

        <div className="space-y-4">

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <MessageSquare
                      className="text-blue-600"
                      size={20}
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {comment.cliente}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {comment.contenido}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    comment.estado === "procesado"
                      ? "green"
                      : "yellow"
                  }
                >
                  {comment.estado}
                </Badge>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="blue">
                  {comment.categoria}
                </Badge>

                <Badge variant="gray">
                  {comment.canal}
                </Badge>

                <span className="text-xs text-slate-400">
                  {comment.fecha}
                </span>
              </div>
            </div>
          ))}

        </div>
      </Card>
    </div>
  );
}