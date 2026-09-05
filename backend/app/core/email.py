import os
import json
import urllib.request
import urllib.error

from dotenv import load_dotenv

load_dotenv()

RESEND_API_URL = "https://api.resend.com/emails"

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

RESEND_FROM = os.getenv(
    "RESEND_FROM",
    "Empresa Inteligente <onboarding@resend.dev>"
)


def _enviar_correo(
    destinatario: str,
    asunto: str,
    cuerpo: str
) -> None:
    """
    Envía un correo utilizando la API HTTPS de Resend.

    Si RESEND_API_KEY no está configurada, imprime el mensaje
    en consola para permitir pruebas locales.
    """

    if not RESEND_API_KEY:
        print(
            f"[EMAIL] Resend no configurado. "
            f"Correo para {destinatario}: {cuerpo}"
        )
        return

    datos = {
        "from": RESEND_FROM,
        "to": [destinatario],
        "subject": asunto,
        "text": cuerpo,
    }

    datos_json = json.dumps(datos).encode("utf-8")

    solicitud = urllib.request.Request(
        RESEND_API_URL,
        data=datos_json,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(solicitud, timeout=20) as respuesta:
            respuesta_body = respuesta.read().decode("utf-8")

            if not 200 <= respuesta.status < 300:
                raise RuntimeError(
                    f"Resend respondió HTTP {respuesta.status}: "
                    f"{respuesta_body}"
                )

            print(
                f"[EMAIL] Correo enviado correctamente a "
                f"{destinatario}"
            )

    except urllib.error.HTTPError as error:
        detalle = error.read().decode("utf-8", errors="replace")

        raise RuntimeError(
            f"Resend rechazó el correo. "
            f"HTTP {error.code}: {detalle}"
        ) from error

    except urllib.error.URLError as error:
        raise RuntimeError(
            f"No se pudo conectar con Resend: {error.reason}"
        ) from error


def enviar_codigo_verificacion(
    destinatario: str,
    codigo: str
) -> None:
    """
    Envía el código de verificación de 6 dígitos
    para iniciar sesión.
    """

    asunto = "Tu código de verificación - Empresa Inteligente"

    cuerpo = (
        f"Hola,\n\n"
        f"Tu código de verificación es: {codigo}\n\n"
        f"Este código expira en 10 minutos. "
        f"Si no intentaste iniciar sesión, "
        f"ignora este mensaje.\n\n"
        f"Empresa Inteligente"
    )

    _enviar_correo(
        destinatario,
        asunto,
        cuerpo
    )


def enviar_codigo_registro(
    destinatario: str,
    codigo: str
) -> None:
    """
    Envía el token de acceso de 6 dígitos
    para confirmar el registro de una nueva cuenta.
    """

    asunto = "Confirma tu registro - Empresa Inteligente"

    cuerpo = (
        f"Hola,\n\n"
        f"Gracias por registrarte en Empresa Inteligente. "
        f"Guardamos tu reconocimiento facial junto con "
        f"tus datos de cuenta.\n\n"
        f"Tu token de acceso es: {codigo}\n\n"
        f"Ingresa este código en la pantalla de registro "
        f"para activar tu cuenta. "
        f"El token expira en 10 minutos. "
        f"Si no intentaste registrarte, "
        f"ignora este mensaje.\n\n"
        f"Empresa Inteligente"
    )

    _enviar_correo(
        destinatario,
        asunto,
        cuerpo
    )