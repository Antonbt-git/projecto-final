import { useEffect, useState } from "react";
import { Brain, Inbox, Loader2, Sparkles } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import {
  analizarComentario,
  getComentarios,
} from "../services/comentarios";

import type { AnalisisComentario, Comment } from "../types";

function formatearCategoria(categoria?: string | null): string {
  if (!categoria) return "Sin clasificar";
  const nombre = categoria.toLowerCase();
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export default function AnalisisNLP() {
  // --- Comentarios pendientes (llegan del formulario público, sin
  // analizar todavía) para que el analista decida cuándo procesarlos.
  const [pendientes, setPendientes] = useState<Comment[]>([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(true);
  const [errorPendientes, setErrorPendientes] = useState("");
  const [analizandoId, setAnalizandoId] = useState<number | null>(null);
  const [ultimoAnalisis, setUltimoAnalisis] =
    useState<AnalisisComentario | null>(null);
  const [comentarioAnalizado, setComentarioAnalizado] =
    useState<Comment | null>(null);

  // Comentario pendiente que el usuario seleccionó de la lista de
  // arriba: su contenido se muestra abajo para revisarlo antes de
  // analizarlo.
  const [comentarioSeleccionado, setComentarioSeleccionado] =
    useState<Comment | null>(null);

  const cargarPendientes = async () => {
    setCargandoPendientes(true);
    setErrorPendientes("");

    try {
      const datos = await getComentarios({ procesado: false });
      setPendientes(datos);
    } catch {
      setErrorPendientes(
        "No se pudieron cargar los comentarios pendientes."
      );
    } finally {
      setCargandoPendientes(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const handleAnalizarComentario = async (comentario: Comment) => {
    setAnalizandoId(comentario.id);

    try {
      const analisis = await analizarComentario(comentario.id);

      setUltimoAnalisis(analisis);
      setComentarioAnalizado(comentario);

      // Ya se analizó: lo sacamos de la lista de pendientes y
      // limpiamos la selección.
      setPendientes((prev) =>
        prev.filter((c) => c.id !== comentario.id)
      );
      setComentarioSeleccionado(null);
    } catch {
      setErrorPendientes(
        "No se pudo analizar el comentario. Intenta nuevamente."
      );
    } finally {
      setAnalizandoId(null);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Análisis NLP
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Los comentarios de los clientes llegan aquí sin analizar.
          Elige cuáles procesar con NLTK.
        </p>
      </div>

      {/* Comentarios pendientes de análisis */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3">
              <Inbox className="text-amber-600" />
            </div>

            <div>
              <h2 className="font-semibold">
                Comentarios pendientes
              </h2>

              <p className="text-sm text-slate-500">
                Toca un comentario para revisarlo y analizarlo abajo.
              </p>
            </div>
          </div>

          <Badge variant="yellow">
            {pendientes.length} pendiente{pendientes.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {errorPendientes && (
          <p className="mb-3 text-sm text-red-600">{errorPendientes}</p>
        )}

        {cargandoPendientes ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Cargando comentarios pendientes...
          </div>
        ) : pendientes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No hay comentarios pendientes por analizar.
          </p>
        ) : (
          <div className="space-y-3">
            {pendientes.map((comentario) => {
              const seleccionado = comentarioSeleccionado?.id === comentario.id;

              return (
                <button
                  key={comentario.id}
                  type="button"
                  onClick={() => setComentarioSeleccionado(comentario)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    seleccionado
                      ? "border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-500/10"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {comentario.cliente_nombre || "Cliente anónimo"}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {new Date(comentario.fecha).toLocaleString("es-PE")}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {comentario.contenido}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Comentario seleccionado: se llena al tocar uno de arriba y
          se analiza desde aquí. */}
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3">
            <Brain className="text-purple-600" />
          </div>

          <div>
            <h2 className="font-semibold">
              Comentario seleccionado
            </h2>

            <p className="text-sm text-slate-500">
              {comentarioSeleccionado
                ? `De ${comentarioSeleccionado.cliente_nombre || "Cliente anónimo"}`
                : "Toca un comentario pendiente arriba para verlo aquí."}
            </p>
          </div>
        </div>

        <textarea
          value={comentarioSeleccionado?.contenido ?? ""}
          readOnly
          placeholder="Selecciona un comentario pendiente arriba..."
          rows={6}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-500/20"
        />

        <div className="mt-4">
          <Button
            onClick={() =>
              comentarioSeleccionado &&
              handleAnalizarComentario(comentarioSeleccionado)
            }
            disabled={
              !comentarioSeleccionado ||
              analizandoId === comentarioSeleccionado?.id
            }
          >
            <span className="flex items-center gap-2">
              {comentarioSeleccionado && analizandoId === comentarioSeleccionado.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}

              {comentarioSeleccionado && analizandoId === comentarioSeleccionado.id
                ? "Analizando..."
                : "Analizar comentario"}
            </span>
          </Button>
        </div>
      </Card>

      {/* Resultado del último comentario analizado */}
      {ultimoAnalisis && comentarioAnalizado && (
        <Card>
          <h2 className="mb-5 text-lg font-semibold">
            Resultado — {comentarioAnalizado.cliente_nombre || "Cliente anónimo"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Idioma</p>
              <p className="mt-1 font-semibold">{ultimoAnalisis.idioma}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Cantidad de palabras</p>
              <p className="mt-1 font-semibold">
                {ultimoAnalisis.cantidad_palabras}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Categoría</p>
              <div className="mt-2">
                <Badge variant="green">
                  {formatearCategoria(ultimoAnalisis.categoria_detectada)}
                </Badge>
              </div>
            </div>
          </div>

          {!!ultimoAnalisis.palabras_limpias?.length && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Tokens</h3>

              <div className="flex flex-wrap gap-2">
                {ultimoAnalisis.palabras_limpias.map((token, index) => (
                  <span
                    key={`${token}-${index}`}
                    className="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!!ultimoAnalisis.palabras_frecuentes?.length && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Palabras frecuentes</h3>

              <div className="space-y-2">
                {ultimoAnalisis.palabras_frecuentes.map((word) => (
                  <div
                    key={word.palabra}
                    className="flex justify-between rounded-lg bg-slate-50 px-4 py-3"
                  >
                    <span>{word.palabra}</span>
                    <span className="font-semibold">{word.frecuencia}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ultimoAnalisis.confianza !== undefined &&
            ultimoAnalisis.confianza !== null && (
              <div className="mt-6">
                <p className="text-sm text-slate-500">Confianza</p>
                <p className="text-xl font-bold text-green-600">
                  {(ultimoAnalisis.confianza * 100).toFixed(1)}%
                </p>
              </div>
            )}
        </Card>
      )}

    </div>
  );
}

