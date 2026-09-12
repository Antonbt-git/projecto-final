import { useState } from "react";
import type { FormEvent } from "react";
import { Check, CheckCircle, Loader2, Send, Sparkles } from "lucide-react";

import Card from "./components/Card";
import Input from "./components/Input";
import Button from "./components/Button";
import Badge from "./components/Badge";
import ThemeToggle from "./components/ThemeToggle";

import { createComentario } from "./services/comentarios";
import { crearCliente } from "./services/clientes";
import type { CommentCategory } from "./types";

const MAX_CONTENIDO = 2000;

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
  const [telefono, setTelefono] = useState("");
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
            telefono: telefono.trim() || undefined,
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
    setTelefono("");
    setEmpresa("");
    setContenido("");
    setCategoriaDetectada(null);
    setEnviado(false);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-[76px] w-[min(1120px,calc(100%-40px))] items-center justify-between gap-5">
          <span className="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-[var(--text)]">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[var(--accent)] text-white">
              <Sparkles size={17} />
            </span>
            Tu opinión
          </span>

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-[min(1120px,calc(100%-40px))] py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:gap-16">
          <div className="py-0 lg:py-5">
            <span className="text-xs font-extrabold tracking-[0.14em] text-[var(--accent)]">
              TU VOZ IMPORTA
            </span>

            <h1 className="mt-3 mb-5 max-w-xl text-[clamp(2.6rem,6vw,4.4rem)] font-extrabold leading-[0.98] tracking-tight text-[var(--text)]">
              Cuéntanos qué piensas.
            </h1>

            <p className="max-w-lg text-[1.05rem] leading-relaxed text-[var(--muted)]">
              Comparte tu experiencia con nosotros. Tu comentario será
              procesado automáticamente para ayudarnos a entender mejor cada
              opinión.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-[var(--accent-soft)] font-black text-[var(--accent)]">
                  <Check size={16} />
                </span>
                <div>
                  <strong className="block text-[var(--text)]">
                    Rápido y sencillo
                  </strong>
                  <span className="text-sm text-[var(--muted)]">
                    Completa el formulario en pocos minutos.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-[var(--accent-soft)] font-black text-[var(--accent)]">
                  <Sparkles size={16} />
                </span>
                <div>
                  <strong className="block text-[var(--text)]">
                    Análisis automático
                  </strong>
                  <span className="text-sm text-[var(--muted)]">
                    Tu comentario será analizado al enviarlo.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Card>
            {!enviado ? (
              <>
                <span className="text-xs font-extrabold tracking-[0.14em] text-[var(--accent)]">
                  FORMULARIO
                </span>
                <h2 className="mb-1.5 mt-2 text-[1.7rem] font-extrabold tracking-tight text-[var(--text)]">
                  Déjanos tu comentario
                </h2>
                <p className="mb-6 text-sm text-[var(--muted)]">
                  Todos los campos son opcionales, excepto tu comentario.
                </p>

                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre"
                      placeholder="¿Cómo te llamas?"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />

                    <Input
                      label="Empresa"
                      placeholder="Nombre de tu empresa"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Correo electrónico"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                      label="Teléfono"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+51 999 999 999"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>

                  <label className="grid gap-2">
                    <span className="text-[0.86rem] font-bold text-[var(--text)]">
                      Comentario *
                    </span>

                    <textarea
                      className="
                        w-full resize-y rounded-xl border px-3.5 py-3 text-sm
                        outline-none transition
                        border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]
                        placeholder:text-[var(--muted)] placeholder:opacity-80
                        focus:border-[var(--accent)] focus:bg-[var(--surface)]
                        focus:ring-4 focus:ring-[var(--accent-soft)]
                      "
                      rows={5}
                      maxLength={MAX_CONTENIDO}
                      placeholder="Cuéntanos tu experiencia, duda o sugerencia..."
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                    />

                    <div className="flex justify-end text-xs text-[var(--muted)]">
                      <span>
                        {contenido.length}/{MAX_CONTENIDO}
                      </span>
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
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
                        <Loader2 size={16} className="spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {enviando ? "Enviando..." : "Enviar comentario"}
                    </span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="grid gap-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                  <CheckCircle size={28} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[var(--text)]">
                    ¡Gracias por tu comentario!
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Ya lo recibimos y lo procesamos automáticamente.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
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
      </main>

      <footer className="border-t border-[var(--border)] text-sm text-[var(--muted)]">
        <div className="mx-auto flex min-h-[72px] w-[min(1120px,calc(100%-40px))] flex-col items-start justify-center gap-1.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <span>© 2026 Tu opinión</span>
          <span>Gracias por compartir tu experiencia.</span>
        </div>
      </footer>
    </div>
  );
}
