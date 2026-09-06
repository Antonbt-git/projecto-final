import { useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Send,
  Loader2,
} from "lucide-react";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { analizarSentimiento as analizarSentimientoNLTK } from "../services/nltk";
import { createComentario } from "../services/comentarios";
import type { Sentimiento } from "../types";

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

const initialComments: CommentItem[] = [
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
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [nuevoCliente, setNuevoCliente] = useState("");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [nuevoCanal, setNuevoCanal] = useState("web");

  // id del comentario que se está analizando en este momento
  // (para mostrar el spinner solo en ese botón)
  const [analizandoId, setAnalizandoId] = useState<number | null>(null);
  const [analizandoTodos, setAnalizandoTodos] = useState(false);
  const [enviando, setEnviando] = useState(false);

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

  const handleAgregarComentario = async () => {
    if (!nuevoContenido.trim()) return;

    setEnviando(true);

    // Este es el mismo endpoint público que usaría un formulario de
    // contacto real. El backend clasifica el mensaje automáticamente
    // (NLTK) apenas llega, y devuelve ya la categoría y el estado
    // ("procesado") con los que se enruta a la bandeja del área
    // correspondiente (ventas, soporte, reclamo, etc.).
    try {
      const creado = await createComentario({
        contenido: nuevoContenido.trim(),
        canal: nuevoCanal,
      });

      const nuevo: CommentItem = {
        id: creado.id,
        cliente: nuevoCliente.trim() || "Cliente anónimo",
        contenido: creado.contenido,
        canal: creado.canal,
        categoria: creado.categoria ?? "OTROS",
        estado: creado.estado as CommentItem["estado"],
        fecha: new Date(creado.fecha).toLocaleDateString("es-PE"),
        sentimiento: null,
      };

      setComments((prev) => [nuevo, ...prev]);
    } catch {
      // Si el backend no responde, se agrega localmente sin
      // clasificar, para no bloquear la demo.
      const nuevo: CommentItem = {
        id: Date.now(),
        cliente: nuevoCliente.trim() || "Cliente anónimo",
        contenido: nuevoContenido.trim(),
        canal: nuevoCanal,
        categoria: "OTROS",
        estado: "pendiente",
        fecha: new Date().toLocaleDateString("es-PE"),
        sentimiento: null,
      };

      setComments((prev) => [nuevo, ...prev]);
    } finally {
      setNuevoCliente("");
      setNuevoContenido("");
      setNuevoCanal("web");
      setEnviando(false);
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

      {/* Formulario para agregar un comentario */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Agregar comentario
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Nombre del cliente (opcional)"
            value={nuevoCliente}
            onChange={(e) => setNuevoCliente(e.target.value)}
          />

          <select
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            value={nuevoCanal}
            onChange={(e) => setNuevoCanal(e.target.value)}
          >
            <option value="web">Web</option>
            <option value="email">Email</option>
            <option value="telefono">Teléfono</option>
            <option value="redes">Redes sociales</option>
          </select>

          <Button
            onClick={handleAgregarComentario}
            disabled={!nuevoContenido.trim() || enviando}
          >
            <span className="flex items-center justify-center gap-2">
              {enviando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {enviando ? "Clasificando..." : "Agregar comentario"}
            </span>
          </Button>
        </div>

        <textarea
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          rows={3}
          placeholder="Escribe el comentario del cliente..."
          value={nuevoContenido}
          onChange={(e) => setNuevoContenido(e.target.value)}
        />
      </Card>

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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="VENTAS">Ventas</option>
            <option value="SOPORTE">Soporte</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="CONSULTA">Consulta</option>
            <option value="FELICITACION">Felicitación</option>
            <option value="OTROS">Otros</option>
          </select>
        </div>

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
          {comentariosFiltrados.length === 0 && (
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
