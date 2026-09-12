import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Loader2,
} from "lucide-react";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import CategorySummary from "../components/comentarios/CategorySummary";
import { analizarSentimiento as analizarSentimientoNLTK } from "../services/nltk";
import { getComentarios } from "../services/comentarios";
import { getCategorias } from "../services/categorias";
import type { Category, Comment, Sentimiento } from "../types";

// Respaldo (fallback) mientras el backend no responda, para que el
// filtro siempre tenga opciones. Coincide con la tabla `categorias`
// sembrada por la migración de la base de datos.
const CATEGORIAS_RESPALDO: Category[] = [
  { id: 1, nombre: "VENTAS", activo: true, created_at: "" },
  { id: 2, nombre: "SOPORTE", activo: true, created_at: "" },
  { id: 3, nombre: "RECLAMO", activo: true, created_at: "" },
  { id: 4, nombre: "CONSULTA", activo: true, created_at: "" },
  { id: 5, nombre: "FELICITACION", activo: true, created_at: "" },
  { id: 6, nombre: "OTROS", activo: true, created_at: "" },
];

function formatearNombreCategoria(nombre: string): string {
  const normalizado = nombre.toLowerCase();
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
}

interface CommentItem {
  id: number;
  cliente: string;
  contenido: string;
  canal: string;
  categoria: string;
  estado: "procesado" | "pendiente";
  fecha: string;
  sentimiento: Sentimiento | null;
}

// Respaldo (fallback) mientras el backend no responda, para que la
// pantalla nunca se vea vacía en la demo.
const COMENTARIOS_RESPALDO: CommentItem[] = [
  {
    id: 1,
    cliente: "Juan Pérez",
    contenido: "El servicio fue rápido y la atención excelente.",
    canal: "web",
    categoria: "FELICITACION",
    estado: "procesado",
    fecha: "03/09/2026",
    sentimiento: null,
  },
  {
    id: 2,
    cliente: "María García",
    contenido: "Tengo un problema con mi producto.",
    canal: "web",
    categoria: "SOPORTE",
    estado: "pendiente",
    fecha: "03/09/2026",
    sentimiento: null,
  },
  {
    id: 3,
    cliente: "Carlos López",
    contenido: "Quiero información sobre sus precios.",
    canal: "email",
    categoria: "CONSULTA",
    estado: "procesado",
    fecha: "02/09/2026",
    sentimiento: null,
  },
];

// Convierte un comentario tal como lo devuelve el backend (tabla
// `comentarios`, con el nombre del cliente ya resuelto vía JOIN) al
// formato que usa esta pantalla.
function mapComentarioBackend(comentario: Comment): CommentItem {
  return {
    id: comentario.id,
    cliente: comentario.cliente_nombre?.trim() || "Cliente anónimo",
    contenido: comentario.contenido,
    canal: comentario.canal,
    categoria: comentario.categoria ?? "OTROS",
    estado: comentario.estado === "pendiente" ? "pendiente" : "procesado",
    fecha: new Date(comentario.fecha).toLocaleDateString("es-PE"),
    sentimiento: null,
  };
}

// Léxico simple en español, usado SOLO como respaldo (fallback) si
// el backend con NLTK no está disponible en ese momento. El análisis
// "real" ocurre en el servidor (app/core/analisis_texto.py), que usa
// NLTK para tokenizar, quitar stopwords y evaluar el sentimiento.
const PALABRAS_POSITIVAS = [
  "excelente","rapido","rápido","buena","bueno","genial","fantastico",
  "fantástico","satisfecho","satisfecha","encanta","encanto","encantó",
  "feliz","contento","contenta","recomiendo","recomendable","agradecido",
  "agradecida","perfecto","perfecta","increible","increíble","amable",
  "eficiente","maravilloso","maravillosa","gracias","excepcional",
  "optimo","óptimo","genial","resuelto","resuelta","agradable","cumplio",
  "cumplió","facil","fácil","comodo","cómodo","impecable",
];

const PALABRAS_NEGATIVAS = [
  "malo","mala","pesimo","pésimo","terrible","problema","problemas",
  "lento","lenta","deficiente","defectuoso","defectuosa","queja",
  "reclamo","decepcionado","decepcionada","insatisfecho","insatisfecha",
  "horrible","nunca","tarde","error","falla","fallo","desastre",
  "molesto","molesta","frustrado","frustrada","odio","detesto","roto",
  "rota","demora","demoro","demoró","incompetente","estafa","enojado",
  "enojada","pesima","no funciona","no sirve","mal servicio",
];

function analizarSentimientoLocal(texto: string): Sentimiento {
  const textoNormalizado = texto.toLowerCase();

  let puntaje = 0;

  for (const palabra of PALABRAS_POSITIVAS) {
    if (textoNormalizado.includes(palabra)) puntaje += 1;
  }

  for (const palabra of PALABRAS_NEGATIVAS) {
    if (textoNormalizado.includes(palabra)) puntaje -= 1;
  }

  if (puntaje > 0) return "positivo";
  if (puntaje < 0) return "negativo";
  return "neutral";
}

type Filtro = "todos" | "positivo" | "negativo" | "sin-analizar";

export default function Comentarios() {
  const [comments, setComments] = useState<CommentItem[]>(COMENTARIOS_RESPALDO);
  const [cargandoComentarios, setCargandoComentarios] = useState(true);
  const [errorComentarios, setErrorComentarios] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  // Categorías traídas de la tabla `categorias` de la base de datos
  // (con respaldo local si el backend aún no responde), para que el
  // filtro y los apartados de esta pantalla no dependan de una lista
  // fija en el frontend.
  const [categorias, setCategorias] = useState<Category[]>(CATEGORIAS_RESPALDO);

  useEffect(() => {
    let activo = true;

    getCategorias(true)
      .then((data) => {
        if (activo && data.length > 0) setCategorias(data);
      })
      .catch(() => {
        // Se mantiene el respaldo si el endpoint no está disponible.
      });

    return () => {
      activo = false;
    };
  }, []);

  // Trae los comentarios reales guardados en la base de datos (tabla
  // `comentarios`) para que la lista de abajo, la búsqueda y los
  // filtros trabajen sobre datos reales en vez de datos de ejemplo.
  useEffect(() => {
    let activo = true;

    setCargandoComentarios(true);
    setErrorComentarios(false);

    getComentarios()
      .then((data) => {
        if (!activo) return;
        setComments(data.map(mapComentarioBackend));
      })
      .catch(() => {
        // Se mantiene el respaldo local si el endpoint no responde
        // (por ejemplo, backend caído o sesión sin token válido).
        if (activo) setErrorComentarios(true);
      })
      .finally(() => {
        if (activo) setCargandoComentarios(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // id del comentario que se está analizando en este momento
  // (para mostrar el spinner solo en ese botón)
  const [analizandoId, setAnalizandoId] = useState<number | null>(null);
  const [analizandoTodos, setAnalizandoTodos] = useState(false);

  // Intenta analizar con el backend (NLTK). Si el servidor no
  // responde (por ejemplo, no está corriendo o no hay internet),
  // se usa el análisis local basado en palabras clave como respaldo.
  const obtenerSentimiento = async (texto: string): Promise<Sentimiento> => {
    try {
      const resultado = await analizarSentimientoNLTK(texto);
      return resultado.sentimiento;
    } catch {
      return analizarSentimientoLocal(texto);
    }
  };

  const handleAnalizarComentario = async (id: number) => {
    const comentario = comments.find((c) => c.id === id);
    if (!comentario) return;

    setAnalizandoId(id);

    const sentimiento = await obtenerSentimiento(comentario.contenido);

    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, sentimiento, estado: "procesado" } : c
      )
    );

    setAnalizandoId(null);
  };

  const handleAnalizarTodos = async () => {
    const pendientes = comments.filter((c) => c.sentimiento === null);
    if (pendientes.length === 0) return;

    setAnalizandoTodos(true);

    const resultados = await Promise.all(
      pendientes.map(async (c) => ({
        id: c.id,
        sentimiento: await obtenerSentimiento(c.contenido),
      }))
    );

    setComments((prev) =>
      prev.map((c) => {
        const resultado = resultados.find((r) => r.id === c.id);
        return resultado
          ? { ...c, sentimiento: resultado.sentimiento, estado: "procesado" }
          : c;
      })
    );

    setAnalizandoTodos(false);
  };

  const conteo = useMemo(() => {
    return {
      positivos: comments.filter((c) => c.sentimiento === "positivo").length,
      negativos: comments.filter((c) => c.sentimiento === "negativo").length,
      sinAnalizar: comments.filter((c) => c.sentimiento === null).length,
    };
  }, [comments]);

  const comentariosFiltrados = useMemo(() => {
    return comments.filter((c) => {
      const coincideBusqueda = c.contenido
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
        c.cliente.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria =
        !categoriaFiltro || c.categoria === categoriaFiltro;

      const coincideFiltro =
        filtro === "todos" ||
        (filtro === "positivo" && c.sentimiento === "positivo") ||
        (filtro === "negativo" && c.sentimiento === "negativo") ||
        (filtro === "sin-analizar" && c.sentimiento === null);

      return coincideBusqueda && coincideCategoria && coincideFiltro;
    });
  }, [comments, busqueda, categoriaFiltro, filtro]);

  const sentimientoBadge = (sentimiento: Sentimiento | null) => {
    if (sentimiento === "positivo") {
      return (
        <Badge variant="green">
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} /> Positivo
          </span>
        </Badge>
      );
    }

    if (sentimiento === "negativo") {
      return (
        <Badge variant="red">
          <span className="flex items-center gap-1">
            <ThumbsDown size={12} /> Negativo
          </span>
        </Badge>
      );
    }

    if (sentimiento === "neutral") {
      return (
        <Badge variant="gray">
          <span className="flex items-center gap-1">
            <MinusCircle size={12} /> Neutral
          </span>
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Comentarios
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestión y análisis de comentarios de clientes
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleAnalizarTodos}
          disabled={analizandoTodos || conteo.sinAnalizar === 0}
        >
          <span className="flex items-center gap-2">
            {analizandoTodos ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {analizandoTodos ? "Analizando..." : "Analizar todos"}
          </span>
        </Button>
      </div>

      {/* Resumen de sentimiento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-green-50 p-3">
            <ThumbsUp className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Positivos</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {conteo.positivos}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-3">
            <ThumbsDown className="text-red-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Negativos</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {conteo.negativos}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-3">
            <MinusCircle className="text-slate-500" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Sin analizar</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {conteo.sinAnalizar}
            </p>
          </div>
        </Card>
      </div>

      {/* Apartado guiado por la tabla `categorias` de la base de datos:
          muestra, por cada categoría, cuántos comentarios tiene y en
          qué estado están. */}
      <CategorySummary />

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
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.nombre}>
                {formatearNombreCategoria(categoria.nombre)}
              </option>
            ))}
          </select>
        </div>

        {errorComentarios && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            No se pudo conectar con la base de datos; mostrando comentarios de ejemplo.
          </p>
        )}

        {/* Pestañas para separar positivos / negativos */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "todos", label: `Todos (${comments.length})` },
            { key: "positivo", label: `Positivos (${conteo.positivos})` },
            { key: "negativo", label: `Negativos (${conteo.negativos})` },
            { key: "sin-analizar", label: `Sin analizar (${conteo.sinAnalizar})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFiltro(tab.key as Filtro)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtro === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {cargandoComentarios && (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Cargando comentarios...
            </p>
          )}

          {!cargandoComentarios && comentariosFiltrados.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">
              No hay comentarios que coincidan con este filtro.
            </p>
          )}

          {comentariosFiltrados.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <MessageSquare className="text-blue-600" size={20} />
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

                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      comment.estado === "procesado" ? "green" : "yellow"
                    }
                  >
                    {comment.estado}
                  </Badge>

                  {sentimientoBadge(comment.sentimiento)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="blue">{comment.categoria}</Badge>
                  <Badge variant="gray">{comment.canal}</Badge>
                  <span className="text-xs text-slate-400">
                    {comment.fecha}
                  </span>
                </div>

                {comment.sentimiento === null && (
                  <Button
                    variant="secondary"
                    className="!px-3 !py-1.5 text-xs"
                    disabled={analizandoId === comment.id}
                    onClick={() => handleAnalizarComentario(comment.id)}
                  >
                    <span className="flex items-center gap-1.5">
                      {analizandoId === comment.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {analizandoId === comment.id
                        ? "Analizando..."
                        : "Analizar comentario"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
