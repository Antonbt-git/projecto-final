import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"


def enviar_codigo_verificacion(destinatario: str, codigo: str) -> None:
    """
    Envía el código de verificación de 6 dígitos al correo del usuario.

    Si las credenciales SMTP no están configuradas (por ejemplo en un
    entorno de desarrollo), el código se imprime en la consola en lugar
    de enviarse, para no bloquear el flujo de pruebas locales.
    """

    asunto = "Tu código de verificación - Empresa Inteligente"
    cuerpo = (
        f"Hola,\n\n"
        f"Tu código de verificación es: {codigo}\n\n"
        f"Este código expira en 10 minutos. Si no intentaste iniciar "
        f"sesión, ignora este mensaje.\n\n"
        f"Empresa Inteligente"
    )

    if not SMTP_USER or not SMTP_PASSWORD:
        print(
            f"[2FA] SMTP no configurado. Código para {destinatario}: {codigo}"
        )
        return

    mensaje = MIMEMultipart()
    mensaje["From"] = SMTP_FROM
    mensaje["To"] = destinatario
    mensaje["Subject"] = asunto
    mensaje.attach(MIMEText(cuerpo, "plain", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as servidor:
        if SMTP_USE_TLS:
            servidor.starttls()

        servidor.login(SMTP_USER, SMTP_PASSWORD)
        servidor.sendmail(SMTP_FROM, destinatario, mensaje.as_string())


def enviar_codigo_registro(destinatario: str, codigo: str) -> None:
    """
    Envía el token de acceso de 6 dígitos para confirmar el registro
    de una nueva cuenta (incluye la confirmación de que el rostro
    quedó registrado).

    Si las credenciales SMTP no están configuradas, el código se
    imprime en la consola para no bloquear el flujo local.
    """

    asunto = "Confirma tu registro - Empresa Inteligente"
    cuerpo = (
        f"Hola,\n\n"
        f"Gracias por registrarte en Empresa Inteligente. Guardamos tu "
        f"reconocimiento facial junto con tus datos de cuenta.\n\n"
        f"Tu token de acceso es: {codigo}\n\n"
        f"Ingresa este código en la pantalla de registro para activar tu "
        f"cuenta. El token expira en 10 minutos. Si no intentaste "
        f"registrarte, ignora este mensaje.\n\n"
        f"Empresa Inteligente"
    )

    if not SMTP_USER or not SMTP_PASSWORD:
        print(
            f"[REGISTRO] SMTP no configurado. Token para {destinatario}: {codigo}"
        )
        return

    mensaje = MIMEMultipart()
    mensaje["From"] = SMTP_FROM
    mensaje["To"] = destinatario
    mensaje["Subject"] = asunto
    mensaje.attach(MIMEText(cuerpo, "plain", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as servidor:
        if SMTP_USE_TLS:
            servidor.starttls()

        servidor.login(SMTP_USER, SMTP_PASSWORD)
        servidor.sendmail(SMTP_FROM, destinatario, mensaje.as_string())
