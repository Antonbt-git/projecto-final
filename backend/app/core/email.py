import os
import json
import urllib.request
import urllib.error

from dotenv import load_dotenv

load_dotenv()

# --------------------------------
# CONFIGURACIÓN DE BREVO (API HTTPS)
# --------------------------------
# Se usa la API HTTPS de Brevo (antes Sendinblue) en vez de SMTP porque
# el plan gratuito de Render bloquea el tráfico saliente por los
# puertos SMTP (25, 465, 587). La API de Brevo funciona por HTTPS
# normal, así que no tiene ese problema, y permite enviar a cualquier
# destinatario (a diferencia del modo sandbox de Resend).
#
# BREVO_API_KEY: se obtiene en https://app.brevo.com/settings/keys/api
# BREVO_FROM_EMAIL: el correo remitente. Debe estar verificado como
#             "sender" en tu cuenta de Brevo
#             (https://app.brevo.com/senders/list). Puede ser tu
#             propio Gmail, solo hay que verificarlo ahí (Brevo manda
#             un correo de confirmación a esa dirección).
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

BREVO_FROM_EMAIL = os.getenv("BREVO_FROM_EMAIL")

EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Empresa Inteligente")


def _enviar_correo(
    destinatario: str,
    asunto: str,
    cuerpo: str
) -> None:
    """
    Envía un correo utilizando la API HTTPS de Brevo.

    Si BREVO_API_KEY o BREVO_FROM_EMAIL no están configuradas,
    imprime el mensaje en consola para permitir pruebas locales.
    """

    if not BREVO_API_KEY or not BREVO_FROM_EMAIL:
        print(
            f"[EMAIL] Brevo no configurado. "
            f"Correo para {destinatario}: {cuerpo}"
        )
        return

    datos = {
        "sender": {
            "name": EMAIL_FROM_NAME,
            "email": BREVO_FROM_EMAIL,
        },
        "to": [{"email": destinatario}],
        "subject": asunto,
        "textContent": cuerpo,
    }

    datos_json = json.dumps(datos).encode("utf-8")

    solicitud = urllib.request.Request(
        BREVO_API_URL,
        data=datos_json,
        headers={
            "api-key": BREVO_API_KEY,
            "accept": "application/json",
            "content-type": "application/json",
            "User-Agent": "EmpresaInteligente-Backend/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(solicitud, timeout=20) as respuesta:
            respuesta_body = respuesta.read().decode("utf-8")

            if not 200 <= respuesta.status < 300:
                raise RuntimeError(
                    f"Brevo respondió HTTP {respuesta.status}: "
                    f"{respuesta_body}"
                )

            print(
                f"[EMAIL] Correo enviado correctamente a "
                f"{destinatario}"
            )

    except urllib.error.HTTPError as error:
        detalle = error.read().decode("utf-8", errors="replace")

        raise RuntimeError(
            f"Brevo rechazó el correo. "
            f"HTTP {error.code}: {detalle}"
        ) from error

    except urllib.error.URLError as error:
        raise RuntimeError(
            f"No se pudo conectar con Brevo: {error.reason}"
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
