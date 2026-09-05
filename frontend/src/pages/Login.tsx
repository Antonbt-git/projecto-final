import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Ingresa tu correo electrónico y contraseña.");
      return;
    }

    setLoading(true);

    try {
    await login(email, password);

    navigate("/dashboard");
    } catch (err: any) {
    setError(
        err.response?.data?.detail ||
        "No fue posible iniciar sesión."
    );
    } finally {
    setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Centro Inteligente
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Centro Inteligente de Gestión Empresarial
          </p>
        </div>

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Iniciar sesión
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Accede al panel administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contraseña
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Iniciando sesión..."
                : "Iniciar sesión"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 dark:bg-slate-800">
                  Próximamente
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              Iniciar sesión con reconocimiento facial
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ¿Eres administrador y aún no tienes una cuenta?
            </p>

            <button
              type="button"
              className="mt-2 text-sm font-semibold text-slate-900 hover:underline dark:text-white"
            >
              Registrar administrador
            </button>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          Acceso exclusivo para administradores autorizados
        </p>
      </div>
    </div>
  );
}

