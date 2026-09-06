import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import Card from "../ui/Card";
import { getKeywords } from "../../services/comentarios";
import type { FrequentWord } from "../../types";

// Palabras de respaldo (fallback) mientras el backend no responda,
// para que el dashboard nunca se vea vacío.
const RESPALDO: FrequentWord[] = [
  { palabra: "servicio", frecuencia: 125 },
  { palabra: "atención", frecuencia: 98 },
  { palabra: "rápido", frecuencia: 87 },
  { palabra: "producto", frecuencia: 74 },
  { palabra: "soporte", frecuencia: 63 },
  { palabra: "cliente", frecuencia: 58 },
];

export default function FrequentWords() {
  const [words, setWords] = useState<FrequentWord[]>(RESPALDO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    getKeywords(10)
      .then((data) => {
        if (activo && data.length > 0) setWords(data);
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
          <h2 className="text-lg font-semibold text-slate-900">
            Palabras más frecuentes
          </h2>

          <p className="text-sm text-slate-500">
            Términos más usados en los comentarios de clientes
          </p>
        </div>

        {loading && (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {words.map((item) => (
          <div
            key={item.palabra}
            className="rounded-lg bg-slate-100 px-4 py-3"
          >
            <span className="font-medium text-slate-800">
              {item.palabra}
            </span>

            <span className="ml-2 text-sm text-slate-500">
              {item.frecuencia}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
