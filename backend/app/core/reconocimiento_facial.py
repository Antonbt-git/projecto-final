"""
Reconocimiento facial simple basado en OpenCV.

Flujo:
1. En el registro se detecta y recorta el rostro de la foto capturada
   por la cámara, y se guarda la imagen original en la cuenta del
   usuario (Usuario.rostro_imagen).
2. En el login facial, se detecta el rostro de la nueva captura y se
   compara contra el rostro guardado usando LBPH (Local Binary
   Patterns Histograms), un algoritmo clásico de reconocimiento
   facial incluido en OpenCV. Si la distancia entre ambos rostros es
   menor al umbral definido, se considera que es la misma persona.

Este enfoque no requiere modelos externos ni conexión a internet: solo
usa el clasificador Haar Cascade y el reconocedor LBPH que vienen
incluidos con `opencv-contrib-python`.
"""

import base64

import numpy as np

try:
    import cv2

    _CV2_DISPONIBLE = True
except Exception:  # pragma: no cover - depende del entorno de despliegue
    # Si OpenCV no puede cargarse (por ejemplo, faltan librerías del
    # sistema en el servidor), no se debe caer toda la API por esto.
    # Las funciones de este módulo lanzarán un error claro solo cuando
    # se intenten usar, en vez de impedir que el resto de la app arranque.
    cv2 = None  # type: ignore
    _CV2_DISPONIBLE = False

TAMANO_ROSTRO = (200, 200)

# LBPH devuelve una "distancia": mientras más bajo, más se parecen los
# rostros. Este umbral fue elegido de forma conservadora; valores por
# debajo de él se consideran la misma persona.
UMBRAL_CONFIANZA = 75.0

_detector_rostros = None
if _CV2_DISPONIBLE:
    _RUTA_CASCADA = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    _detector_rostros = cv2.CascadeClassifier(_RUTA_CASCADA)


class RostroNoDetectadoError(Exception):
    """No se detectó ningún rostro en la imagen proporcionada."""


class ImagenInvalidaError(Exception):
    """La imagen recibida no pudo ser decodificada."""


class ReconocimientoNoDisponibleError(Exception):
    """OpenCV no está disponible en este entorno de despliegue."""


def _verificar_disponible() -> None:
    if not _CV2_DISPONIBLE:
        raise ReconocimientoNoDisponibleError(
            "El reconocimiento facial no está disponible en el servidor "
            "en este momento. Contacta al administrador."
        )


def _decodificar_imagen(imagen_base64: str) -> np.ndarray:
    """Convierte una imagen en formato Data URL (o base64 puro) en una
    matriz BGR utilizable por OpenCV."""

    if not imagen_base64:
        raise ImagenInvalidaError("No se recibió ninguna imagen de rostro.")

    datos = imagen_base64
    if "," in datos and datos.strip().startswith("data:"):
        datos = datos.split(",", 1)[1]

    try:
        binario = base64.b64decode(datos)
    except Exception as exc:
        raise ImagenInvalidaError(
            "La imagen del rostro no es válida."
        ) from exc

    arreglo = np.frombuffer(binario, dtype=np.uint8)
    imagen = cv2.imdecode(arreglo, cv2.IMREAD_COLOR)

    if imagen is None:
        raise ImagenInvalidaError(
            "No fue posible procesar la imagen del rostro."
        )

    return imagen


def extraer_rostro(imagen_base64: str) -> np.ndarray:
    """Detecta el rostro principal de una imagen y devuelve un recorte
    en escala de grises, normalizado en tamaño, listo para comparar."""

    _verificar_disponible()

    imagen = _decodificar_imagen(imagen_base64)

    gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
    gris = cv2.equalizeHist(gris)

    rostros = _detector_rostros.detectMultiScale(
        gris,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80),
    )

    if len(rostros) == 0:
        raise RostroNoDetectadoError(
            "No se detectó ningún rostro en la imagen. Intenta de nuevo "
            "con mejor iluminación y mirando directo a la cámara."
        )

    # Si se detecta más de un rostro, se usa el más grande (el más
    # cercano a la cámara).
    x, y, w, h = max(rostros, key=lambda r: r[2] * r[3])
    recorte = gris[y : y + h, x : x + w]
    recorte = cv2.resize(recorte, TAMANO_ROSTRO)

    return recorte


def comparar_rostros(
    imagen_registrada_b64: str,
    imagen_login_b64: str,
) -> tuple[bool, float]:
    """
    Compara el rostro capturado al iniciar sesión contra el rostro
    guardado durante el registro.

    Devuelve una tupla (coincide, confianza), donde `confianza` es la
    distancia LBPH (menor = más parecido).
    """

    _verificar_disponible()

    rostro_registrado = extraer_rostro(imagen_registrada_b64)
    rostro_login = extraer_rostro(imagen_login_b64)

    reconocedor = cv2.face.LBPHFaceRecognizer_create()
    reconocedor.train([rostro_registrado], np.array([1]))

    _, confianza = reconocedor.predict(rostro_login)

    coincide = confianza <= UMBRAL_CONFIANZA

    return coincide, float(confianza)
