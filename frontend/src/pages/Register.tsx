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
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  reenviarTokenRegistro,
  registrarAdministrador,
  verificarTokenRegistro,
} from "../services/auth";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

type Paso = "datos" | "rostro" | "token";

export default function Register() {
  const navigate = useNavigate();

  // Datos del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reconocimiento facial
  const [rostroImagen, setRostroImagen] = useState<string | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Token de acceso enviado al correo
  const [codigo, setCodigo] = useState("");
  const [reenviando, setReenviando] = useState(false);

  // Estado general
  const [paso, setPaso] = useState<Paso>("datos");
  const [error, setError] = useState("");
  const [infoMensaje, setInfoMensaje] = useState("");
  const [loading, setLoading] = useState(false);

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

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setRostroImagen(dataUrl);
    detenerCamara();
  };

  const reintentarCaptura = () => {
    setRostroImagen(null);
    iniciarCamara();
  };

  // --------------------------------
  // Paso 1: datos de la cuenta
  // --------------------------------
  const handleSubmitDatos = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!nombre || !email || !password || !confirmarPassword) {
      setError("Completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPaso("rostro");
  };

  // --------------------------------
  // Paso 2: reconocimiento facial + envío del registro
  // --------------------------------
  const handleConfirmarRostro = async () => {
    setError("");

    if (!rostroImagen) {
      setError("Captura tu rostro con la cámara antes de continuar.");
      return;
    }

    setLoading(true);

    try {
      const respuesta = await registrarAdministrador({
        nombre,
        email,
        password,
        rostro_imagen: rostroImagen,
      });

      setInfoMensaje(respuesta.mensaje);
      setPaso("token");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "No fue posible completar el registro."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Paso 3: verificar token de 6 dígitos enviado al correo
  // --------------------------------
  const handleVerificarToken = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!codigo || codigo.length !== 6) {
      setError("Ingresa el token de 6 dígitos que enviamos a tu correo.");
      return;
    }

    setLoading(true);

    try {
      await verificarTokenRegistro(email, codigo);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Token inválido o expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarToken = async () => {
    setError("");
    setInfoMensaje("");
    setReenviando(true);

    try {
      const respuesta = await reenviarTokenRegistro(email);

      setInfoMensaje(respuesta.mensaje);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "No fue posible reenviar el token."
      );
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Crear cuenta
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Registro de administrador con reconocimiento facial
          </p>
        </div>

        <Card>
          {paso === "datos" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  1. Tus datos
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Luego capturaremos tu rostro y confirmaremos tu correo
                </p>
              </div>

              <form onSubmit={handleSubmitDatos} className="space-y-5">
                <div>
                  <label
                    htmlFor="nombre"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Nombre completo
                  </label>

                  <div className="relative">
                    <UserIcon
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Nombre y apellido"
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      className="pl-10"
                      autoComplete="name"
                    />
                  </div>
                </div>

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
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
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

                <div>
                  <label
                    htmlFor="confirmarPassword"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Confirmar contraseña
                  </label>

                  <Input
                    id="confirmarPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirmarPassword}
                    onChange={(event) =>
                      setConfirmarPassword(event.target.value)
                    }
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Continuar
                </Button>
              </form>
            </>
          )}

          {paso === "rostro" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  2. Reconocimiento facial
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Guardaremos una captura de tu rostro junto a tu cuenta
                  para futuras verificaciones de acceso
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                  {rostroImagen ? (
                    <img
                      src={rostroImagen}
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

                  {!camaraActiva && !rostroImagen && (
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

                {!rostroImagen ? (
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
                      onClick={handleConfirmarRostro}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Enviando..." : "Confirmar y registrarme"}
                    </Button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    detenerCamara();
                    setPaso("datos");
                  }}
                  className="w-full text-sm font-medium text-slate-500 hover:underline"
                >
                  Volver
                </button>
              </div>
            </>
          )}

          {paso === "token" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  3. Confirma tu correo
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Enviamos un token de acceso de 6 dígitos a{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerificarToken} className="space-y-5">
                <div>
                  <label
                    htmlFor="codigo"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Token de acceso
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Verificando..." : "Activar cuenta"}
                </Button>

                <div className="flex items-center justify-center text-sm">
                  <button
                    type="button"
                    onClick={handleReenviarToken}
                    disabled={reenviando}
                    className="font-medium text-slate-900 hover:underline disabled:opacity-50 dark:text-white"
                  >
                    {reenviando ? "Reenviando..." : "Reenviar token"}
                  </button>
                </div>
              </form>
            </>
          )}
        </Card>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-slate-500 hover:underline"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}
