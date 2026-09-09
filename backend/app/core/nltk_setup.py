"""
Utilidades para asegurar que los recursos de NLTK necesarios
(tokenizador y stopwords en español) estén disponibles antes de
usarlos.

Si el servidor no tiene conexión a internet en el momento en que se
importa este módulo, la descarga simplemente se omite: el resto del
análisis de texto (app/core/analisis_texto.py) tiene mecanismos de
respaldo basados en expresiones regulares para poder seguir
funcionando de todas formas.
"""

import nltk

# (ruta de búsqueda dentro de nltk_data, nombre del paquete a descargar)
_RECURSOS_REQUERIDOS = [
    ("tokenizers/punkt_tab", "punkt_tab"),
    ("tokenizers/punkt", "punkt"),
    ("corpora/stopwords", "stopwords"),
]


def asegurar_recursos_nltk() -> None:
    for ruta, paquete in _RECURSOS_REQUERIDOS:
        try:
            nltk.data.find(ruta)
        except LookupError:
            try:
                nltk.download(paquete, quiet=True)
            except Exception:
                # Sin internet u otro problema de descarga: se
                # continúa igual, ya que analisis_texto.py cuenta
                # con alternativas (fallback) que no dependen de
                # estos recursos.
                pass
