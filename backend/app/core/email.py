import os
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr

from dotenv import load_dotenv

load_dotenv()

# --------------------------------
# CONFIGURACIÓN DE GMAIL (SMTP)
# --------------------------------
# GMAIL_USER: la cuenta de Gmail que envía los correos
#             (ej. tuapp@gmail.com).
# GMAIL_APP_PASSWORD: una "contraseña de aplicación" de 16 caracteres
#             generada en https://myaccount.google.com/apppasswords
#             (requiere tener la verificación en 2 pasos activada en
#             esa cuenta de Gmail). NUNCA uses la contraseña normal
#             de la cuenta, Google la rechaza para SMTP.
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

GMAIL_SMTP_HOST = "smtp.gmail.com"
GMAIL_SMTP_PORT = 465

EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Empresa Inteligente")


def _enviar_correo(
    destinatario: str,
    asunto: str,
    cuerpo: str
) -> None:
    """
    Envía un correo utilizando una cuenta de Gmail vía SMTP (SSL).

    A diferencia de un servicio como Resend en modo de prueba, esto
    permite enviar correos a cualquier destinatario, no solo a la
    cuenta verificada del remitente.

    Si GMAIL_USER o GMAIL_APP_PASSWORD no están configuradas, imprime
    el mensaje en consola para permitir pruebas locales.
    """

    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print(
            f"[EMAIL] Gmail no configurado. "
            f"Correo para {destinatario}: {cuerpo}"
        )
        return

    mensaje = MIMEText(cuerpo, "plain", "utf-8")
    mensaje["Subject"] = asunto
    mensaje["From"] = formataddr((EMAIL_FROM_NAME, GMAIL_USER))
    mensaje["To"] = destinatario

    try:
        with smtplib.SMTP_SSL(
            GMAIL_SMTP_HOST,
            GMAIL_SMTP_PORT,
            timeout=20,
        ) as servidor:
            servidor.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            servidor.sendmail(
                GMAIL_USER,
                [destinatario],
                mensaje.as_string(),
            )

        print(
            f"[EMAIL] Correo enviado correctamente a "
            f"{destinatario}"
        )

    except smtplib.SMTPAuthenticationError as error:
        raise RuntimeError(
            "Gmail rechazó las credenciales. Verifica que "
            "GMAIL_APP_PASSWORD sea una contraseña de aplicación "
            "válida (no la contraseña normal de la cuenta) y que "
            "la verificación en 2 pasos esté activa en esa cuenta "
            f"de Gmail. Detalle: {error}"
        ) from error

    except smtplib.SMTPException as error:
        raise RuntimeError(
            f"No se pudo enviar el correo con Gmail: {error}"
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
