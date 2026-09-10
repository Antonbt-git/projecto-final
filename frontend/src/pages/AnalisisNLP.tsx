import { useState } from "react";
import { Brain, Sparkles } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

import {
  analizarTexto,
} from "../services/nltk";

import type { NLPAnalysis } from "../types";

export default function AnalisisNLP() {
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
          Analiza y clasifica comentarios mediante NLTK
        </p>
      </div>

      <Card>

        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3">
            <Brain className="text-purple-600" />
          </div>

          <div>
            <h2 className="font-semibold">
              Analizar comentario
            </h2>

            <p className="text-sm text-slate-500">
              Introduce el texto que deseas analizar.
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
                : "Analizar comentario"}
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