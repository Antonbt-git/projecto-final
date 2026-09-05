import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  login,
  loginFacial,
  resendTwoFactorCode,
  verifyTwoFactorCode,
} from "../services/auth";

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

  const [step, setStep] = useState<
    "credenciales" | "facial" | "codigo"
  >("credenciales");
  const [codigo, setCodigo] = useState("");
  const [infoMensaje, setInfoMensaje] = useState("");
  const [reenviando, setReenviando] = useState(false);

  // Reconocimiento facial
  const [capturaRostro, setCapturaRostro] = useState<string | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      detenerCamara();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, []);

  const detenerCamara = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCamaraActiva(false);
  };

  const iniciarCamara = async () => {
    setErrorCamara("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCamaraActiva(true);
    } catch (err) {
      setErrorCamara(
        "No pudimos acceder a la cámara. Verifica los permisos del navegador."
      );
    }
  };

  const capturarRostro = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      return;
    }

    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCapturaRostro(canvas.toDataURL("image/jpeg", 0.85));
    detenerCamara();
  };

  const reintentarCaptura = () => {
    setCapturaRostro(null);
    iniciarCamara();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Ingresa tu correo electrónico y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const respuesta = await login(email, password);

      setInfoMensaje(respuesta.mensaje);
      setStep("codigo");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarLoginFacial = () => {
    setError("");

    if (!email) {
      setError(
        "Ingresa tu correo electrónico para verificar tu rostro."
      );
      return;
    }

    setCapturaRostro(null);
    setStep("facial");
  };

  const handleConfirmarRostroLogin = async () => {
    setError("");

    if (!capturaRostro) {
      setError("Captura tu rostro con la cámara antes de continuar.");
      return;
    }

    setLoading(true);

    try {
      const respuesta = await loginFacial(email, capturaRostro);

      setInfoMensaje(respuesta.mensaje);
      setStep("codigo");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "No fue posible verificar tu rostro."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVolverDeFacial = () => {
    detenerCamara();
    setCapturaRostro(null);
    setError("");
    setStep("credenciales");
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!codigo || codigo.length !== 6) {
      setError("Ingresa el código de 6 dígitos que enviamos a tu correo.");
      return;
    }

    setLoading(true);

    try {
      await verifyTwoFactorCode(email, codigo);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Código inválido o expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setInfoMensaje("");
    setReenviando(true);

    try {
      const respuesta = await resendTwoFactorCode(email);

      setInfoMensaje(respuesta.mensaje);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "No fue posible reenviar el código."
      );
    } finally {
      setReenviando(false);
    }
  };

  const handleVolverACredenciales = () => {
    setStep("credenciales");
    setCodigo("");
    setError("");
    setInfoMensaje("");
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
          {step === "credenciales" && (
            <>
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
                    ? "Verificando..."
                    : "Iniciar sesión"}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-slate-400 dark:bg-slate-800">
                      o
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleIniciarLoginFacial}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Camera size={16} />
                    Iniciar sesión con reconocimiento facial
                  </span>
                </button>

              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  ¿Eres administrador y aún no tienes una cuenta?
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="mt-2 text-sm font-semibold text-slate-900 hover:underline dark:text-white"
                >
                  Registrar administrador
                </button>
              </div>
            </>
          )}

          {step === "facial" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Reconocimiento facial
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Verificaremos tu rostro contra el que registraste para{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                  {capturaRostro ? (
                    <img
                      src={capturaRostro}
                      alt="Rostro capturado"
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      className="aspect-video w-full object-cover"
                    />
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                  {!camaraActiva && !capturaRostro && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm text-white">
                      Activa la cámara para continuar
                    </div>
                  )}
                </div>

                {errorCamara && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorCamara}
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {!capturaRostro ? (
                  <Button
                    type="button"
                    onClick={camaraActiva ? capturarRostro : iniciarCamara}
                    className="w-full"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Camera size={18} />
                      {camaraActiva ? "Capturar rostro" : "Activar cámara"}
                    </span>
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={reintentarCaptura}
                      className="flex-1"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCcw size={16} />
                        Repetir
                      </span>
                    </Button>

                    <Button
                      type="button"
                      onClick={handleConfirmarRostroLogin}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Verificando..." : "Verificar rostro"}
                    </Button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVolverDeFacial}
                  className="w-full text-sm font-medium text-slate-500 hover:underline"
                >
                  Volver
                </button>
              </div>
            </>
          )}

          {step === "codigo" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Verifica tu identidad
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Ingresa el código de 6 dígitos que enviamos a{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">

                <div>
                  <label
                    htmlFor="codigo"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Código de verificación
                  </label>

                  <Input
                    id="codigo"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    value={codigo}
                    onChange={(event) =>
                      setCodigo(
                        event.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </div>

                {infoMensaje && !error && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {infoMensaje}
                  </div>
                )}

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
                  {loading ? "Verificando..." : "Verificar código"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleVolverACredenciales}
                    className="font-medium text-slate-500 hover:underline"
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={reenviando}
                    className="font-medium text-slate-900 hover:underline disabled:opacity-50 dark:text-white"
                  >
                    {reenviando ? "Reenviando..." : "Reenviar código"}
                  </button>
                </div>
              </form>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          Acceso exclusivo para administradores autorizados
        </p>
      </div>
    </div>
  );
}
