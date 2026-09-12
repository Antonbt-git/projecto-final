import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle, Loader2, MessageSquare, Send } from "lucide-react";

import Card from "./components/Card";
import Input from "./components/Input";
import Button from "./components/Button";
import Badge from "./components/Badge";

import { createComentario } from "./services/comentarios";
import { crearCliente } from "./services/clientes";
import type { CommentCategory } from "./types";

function formatearCategoria(categoria?: CommentCategory | null): string {
  if (!categoria) return "Sin clasificar";

  const nombre = categoria.toLowerCase();
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/**
 * App independiente (deploy propio en Vercel) para que los clientes
 * dejen su comentario, sin login. Habla directamente con el mismo
 * backend que usa el panel administrativo: el comentario se guarda
 * en la base de datos y se clasifica automáticamente vía NLP
 * (ver services/comentarios.ts), por lo que aparece de inmediato en
 * la pantalla de Análisis NLP del panel admin.
 */
export default function App() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [contenido, setContenido] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [enviado, setEnviado] = useState(false);
  const [categoriaDetectada, setCategoriaDetectada] =
    useState<CommentCategory | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!contenido.trim()) {
      setError("Escribe tu comentario antes de enviarlo.");
      return;
    }

    setEnviando(true);

    try {
      let clienteId: number | undefined;

      if (nombre.trim() || email.trim()) {
        try {
          const cliente = await crearCliente({
            nombre: nombre.trim() || "Cliente sin nombre",
            email: email.trim() || undefined,
            empresa: empresa.trim() || undefined,
          });
          clienteId = cliente.id;
        } catch {
          clienteId = undefined;
        }
      }

      const creado = await createComentario({
        cliente_id: clienteId,
        contenido: contenido.trim(),
        canal: "web",
      });

      setCategoriaDetectada(creado.categoria ?? null);
      setEnviado(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "No pudimos guardar tu comentario. Intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarOtro = () => {
    setNombre("");
    setEmail("");
    setEmpresa("");
    setContenido("");
    setCategoriaDetectada(null);
    setEnviado(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <MessageSquare size={32} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Déjanos tu comentario
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Tu opinión nos ayuda a mejorar. No necesitas una cuenta.
          </p>
        </div>

        <Card>
          {!enviado ? (
            <form onSubmit={handleSubmit} className="space-y-5">

              <Input
                label="Nombre (opcional)"
                placeholder="¿Cómo te llamas?"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <Input
                label="Correo electrónico (opcional)"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Empresa (opcional)"
                placeholder="Nombre de tu empresa"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Tu comentario
                </label>

                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  rows={4}
                  placeholder="Cuéntanos tu experiencia, duda o sugerencia..."
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={enviando || !contenido.trim()}
                className="w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  {enviando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {enviando ? "Enviando..." : "Enviar comentario"}
                </span>
              </Button>

            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle size={28} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  ¡Gracias por tu comentario!
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ya lo recibimos y lo procesamos automáticamente.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <span>Categoría detectada:</span>
                <Badge>{formatearCategoria(categoriaDetectada)}</Badge>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleEnviarOtro}
                className="w-full"
              >
                Enviar otro comentario
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
