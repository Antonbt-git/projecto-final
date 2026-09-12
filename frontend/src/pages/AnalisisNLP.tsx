import { useEffect, useState } from "react";
import { Brain, Inbox, Loader2, Sparkles } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import {
  analizarTexto,
} from "../services/nltk";
import {
  analizarComentario,
  getComentarios,
} from "../services/comentarios";

import type { AnalisisComentario, Comment, NLPAnalysis } from "../types";

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

      // Ya se analizó: lo sacamos de la lista de pendientes.
      setPendientes((prev) =>
        prev.filter((c) => c.id !== comentario.id)
      );
    } catch {
      setErrorPendientes(
        "No se pudo analizar el comentario. Intenta nuevamente."
      );
    } finally {
      setAnalizandoId(null);
    }
  };

  // --- Herramienta de prueba: analizar un texto suelto, sin que
  // esté asociado a ningún comentario guardado.
  const [texto, setTexto] = useState("");

  const [resultado, setResultado] =
    useState<NLPAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleAnalizar() {
    if (!texto.trim()) {
      setError("Escribe un comentario.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await analizarTexto(texto);

      setResultado(result);
    } catch {
      /*
       * Mientras FastAPI no esté funcionando,
       * mostramos un resultado de demostración.
       */
      setResultado({
        idioma: "es",
        cantidad_palabras: texto.trim().split(/\s+/).length,
        tokens: texto
          .toLowerCase()
          .replace(/[.,!?]/g, "")
          .split(/\s+/),
        palabras_frecuentes: [
          {
            palabra: "servicio",
            frecuencia: 1,
          },
          {
            palabra: "atención",
            frecuencia: 1,
          },
        ],
        categoria: "FELICITACION",
        confianza: 0.94,
      });
    } finally {
      setLoading(false);
    }
  }

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
                Comentarios recibidos que todavía no se han analizado.
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
            {pendientes.map((comentario) => (
              <div
                key={comentario.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {comentario.cliente_nombre || "Cliente anónimo"}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {new Date(comentario.fecha).toLocaleString("es-PE")}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {comentario.contenido}
                  </p>
                </div>

                <Button
                  onClick={() => handleAnalizarComentario(comentario)}
                  disabled={analizandoId === comentario.id}
                  className="shrink-0"
                >
                  <span className="flex items-center gap-2">
                    {analizandoId === comentario.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {analizandoId === comentario.id
                      ? "Analizando..."
                      : "Analizar"}
                  </span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resultado del último comentario analizado desde la lista */}
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

      {/* Herramienta libre: analizar cualquier texto sin guardarlo */}
      <Card>

        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3">
            <Brain className="text-purple-600" />
          </div>

          <div>
            <h2 className="font-semibold">
              Probar un texto suelto
            </h2>

            <p className="text-sm text-slate-500">
              Analiza cualquier texto de prueba, sin guardarlo como comentario.
            </p>
          </div>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ejemplo: El servicio fue excelente y rápido..."
          rows={6}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-500/20"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4">
          <Button
            onClick={handleAnalizar}
            disabled={loading}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={18} />

              {loading
                ? "Analizando..."
                : "Analizar texto"}
            </span>
          </Button>
        </div>
      </Card>

      {resultado && (
        <Card>
          <h2 className="mb-5 text-lg font-semibold">
            Resultado del análisis
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Idioma
              </p>

              <p className="mt-1 font-semibold">
                {resultado.idioma}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Cantidad de palabras
              </p>

              <p className="mt-1 font-semibold">
                {resultado.cantidad_palabras}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Categoría
              </p>

              <div className="mt-2">
                <Badge variant="green">
                  {resultado.categoria}
                </Badge>
              </div>
            </div>

          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-semibold">
              Tokens
            </h3>

            <div className="flex flex-wrap gap-2">
              {resultado.tokens.map((token, index) => (
                <span
                  key={`${token}-${index}`}
                  className="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-semibold">
              Palabras frecuentes
            </h3>

            <div className="space-y-2">
              {resultado.palabras_frecuentes.map(
                (word) => (
                  <div
                    key={word.palabra}
                    className="flex justify-between rounded-lg bg-slate-50 px-4 py-3"
                  >
                    <span>{word.palabra}</span>

                    <span className="font-semibold">
                      {word.frecuencia}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {resultado.confianza !== undefined && (
            <div className="mt-6">
              <p className="text-sm text-slate-500">
                Confianza
              </p>

              <p className="text-xl font-bold text-green-600">
                {(resultado.confianza * 100).toFixed(1)}%
              </p>
            </div>
          )}

        </Card>
      )}

    </div>
  );
}
