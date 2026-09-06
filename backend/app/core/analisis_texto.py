"""
Análisis de comentarios usando NLTK.

Incluye:
- Tokenización del texto (nltk.word_tokenize, con fallback a regex).
- Palabras frecuentes, filtrando stopwords en español.
- Clasificación por categoría (VENTAS, SOPORTE, RECLAMO, CONSULTA,
  FELICITACION, OTROS) basada en un léxico de palabras clave.
- Análisis de sentimiento (positivo / negativo / neutral) basado en
  un léxico en español, con manejo simple de negaciones
  ("no", "nunca", etc.).

No se usa VADER porque su léxico solo cubre inglés; en su lugar se
usa NLTK para el preprocesamiento (tokenización y stopwords) y un
léxico propio en español para la puntuación de sentimiento.
"""

import re
import unicodedata
from collections import Counter

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

from app.core.nltk_setup import asegurar_recursos_nltk

asegurar_recursos_nltk()


# ---------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------

def _quitar_tildes(texto: str) -> str:
    texto_normalizado = unicodedata.normalize("NFD", texto)
    return "".join(
        caracter
        for caracter in texto_normalizado
        if unicodedata.category(caracter) != "Mn"
    )


_STOPWORDS_RESPALDO = {
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se",
    "las", "por", "un", "para", "con", "una", "su", "es", "al",
    "lo", "como", "mas", "pero", "sus", "le", "ya", "o", "este",
    "si", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre",
    "tambien", "me", "hasta", "hay", "donde", "quien", "desde",
    "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra",
    "esa", "eso", "ante", "ellos", "e", "esto", "mi", "antes",
    "algunos", "que", "unos", "yo", "otro", "otras", "otra", "el",
    "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos",
    "cual", "poco", "ella", "estar", "estas", "algunas", "algo",
}


def _obtener_stopwords() -> set[str]:
    try:
        return set(stopwords.words("spanish"))
    except LookupError:
        return _STOPWORDS_RESPALDO


def tokenizar(texto: str) -> list[str]:
    try:
        tokens = word_tokenize(texto.lower(), language="spanish")
    except LookupError:
        # Sin los recursos de NLTK descargados: se usa una
        # tokenización simple basada en expresiones regulares.
        tokens = re.findall(r"\b\w+\b", texto.lower(), flags=re.UNICODE)

    # Se descartan signos de puntuación sueltos, dejando solo
    # tokens que contengan al menos una letra.
    return [token for token in tokens if any(c.isalpha() for c in token)]


# ---------------------------------------------------------------
# Palabras frecuentes
# ---------------------------------------------------------------

def obtener_palabras_frecuentes(texto: str, top_n: int = 10) -> list[dict]:
    tokens = tokenizar(texto)
    palabras_vacias = _obtener_stopwords()

    palabras_significativas = [
        token
        for token in tokens
        if token not in palabras_vacias and len(token) > 2
    ]

    conteo = Counter(palabras_significativas)

    return [
        {"palabra": palabra, "frecuencia": frecuencia}
        for palabra, frecuencia in conteo.most_common(top_n)
    ]


# ---------------------------------------------------------------
# Clasificación por categoría
# ---------------------------------------------------------------

_CATEGORIAS_PALABRAS_CLAVE = {
    "RECLAMO": [
        "reclamo", "queja", "insatisfecho", "insatisfecha", "terrible",
        "pesimo", "pesima", "mal servicio", "no funciona", "defectuoso",
        "defectuosa", "estafa", "decepcionado", "decepcionada",
        "indignado", "indignada", "exijo", "devolucion",
    ],
    "SOPORTE": [
        "ayuda", "soporte", "error", "falla", "fallo",
        "problema tecnico", "asistencia", "no puedo", "no logro",
        "como configuro", "como instalo", "no carga", "no abre",
    ],
    "CONSULTA": [
        "informacion", "consulta", "precio", "precios", "costo",
        "cuanto cuesta", "quiero saber", "podrian decirme", "duda",
        "tienen disponible", "horario", "cobertura",
    ],
    "VENTAS": [
        "comprar", "compra", "venta", "adquirir", "cotizacion",
        "presupuesto", "interesado en comprar", "quiero comprar",
        "descuento", "promocion", "plan",
    ],
    "FELICITACION": [
        "excelente", "genial", "fantastico", "fantastica", "gracias",
        "felicidades", "encanto", "increible", "satisfecho",
        "satisfecha", "recomiendo", "buen trabajo", "impecable",
        "maravilloso", "maravillosa",
    ],
}


def clasificar_texto(texto: str) -> dict:
    texto_normalizado = _quitar_tildes(texto.lower())

    puntajes = {
        categoria: sum(
            1
            for palabra in palabras
            if _quitar_tildes(palabra) in texto_normalizado
        )
        for categoria, palabras in _CATEGORIAS_PALABRAS_CLAVE.items()
    }

    categoria_max = max(puntajes, key=lambda c: puntajes[c])
    total_coincidencias = sum(puntajes.values())

    if puntajes[categoria_max] == 0:
        return {"categoria": "OTROS", "confianza": 0.3}

    confianza = round(puntajes[categoria_max] / total_coincidencias, 2)

    return {"categoria": categoria_max, "confianza": confianza}


# ---------------------------------------------------------------
# Análisis de sentimiento
# ---------------------------------------------------------------

_PALABRAS_POSITIVAS = {
    "excelente", "rapido", "rapida", "buena", "bueno", "buen", "genial",
    "fantastico", "fantastica", "satisfecho", "satisfecha", "encanta",
    "encanto", "feliz", "contento", "contenta", "recomiendo",
    "recomendable", "agradecido", "agradecida", "perfecto", "perfecta",
    "increible", "amable", "eficiente", "maravilloso", "maravillosa",
    "gracias", "excepcional", "optimo", "optima", "resuelto", "resuelta",
    "agradable", "cumplio", "facil", "comodo", "comoda", "impecable",
    "bien",
}

_PALABRAS_NEGATIVAS = {
    "malo", "mala", "pesimo", "pesima", "terrible", "problema",
    "problemas", "lento", "lenta", "deficiente", "defectuoso",
    "defectuosa", "queja", "reclamo", "decepcionado", "decepcionada",
    "insatisfecho", "insatisfecha", "horrible", "tarde", "error",
    "falla", "fallo", "desastre", "molesto", "molesta", "frustrado",
    "frustrada", "odio", "detesto", "roto", "rota", "demora",
    "incompetente", "estafa", "enojado", "enojada", "mal",
}

_NEGADORES = {"no", "nunca", "jamas", "tampoco", "ni"}


def analizar_sentimiento(texto: str) -> dict:
    tokens = tokenizar(texto)

    palabras_positivas_encontradas: list[str] = []
    palabras_negativas_encontradas: list[str] = []
    puntaje = 0
    hay_negacion = False

    for token in tokens:
        token_normalizado = _quitar_tildes(token)

        if token_normalizado in _NEGADORES:
            hay_negacion = True
            continue

        es_positiva = token_normalizado in _PALABRAS_POSITIVAS
        es_negativa = token_normalizado in _PALABRAS_NEGATIVAS

        if es_positiva:
            if hay_negacion:
                puntaje -= 1
                palabras_negativas_encontradas.append(token)
            else:
                puntaje += 1
                palabras_positivas_encontradas.append(token)
        elif es_negativa:
            if hay_negacion:
                puntaje += 1
                palabras_positivas_encontradas.append(token)
            else:
                puntaje -= 1
                palabras_negativas_encontradas.append(token)

        # La negación solo afecta a la palabra de sentimiento
        # inmediatamente siguiente.
        hay_negacion = False

    if puntaje > 0:
        sentimiento = "positivo"
    elif puntaje < 0:
        sentimiento = "negativo"
    else:
        sentimiento = "neutral"

    total_encontradas = (
        len(palabras_positivas_encontradas) + len(palabras_negativas_encontradas)
    )
    total_tokens = max(len(tokens), 1)

    if total_encontradas == 0:
        confianza = 0.5
    else:
        dominante = max(
            len(palabras_positivas_encontradas),
            len(palabras_negativas_encontradas),
        )
        confianza = round(min((dominante / total_tokens) * 2, 1.0), 2)

    return {
        "sentimiento": sentimiento,
        "puntaje": puntaje,
        "confianza": confianza,
        "palabras_positivas": palabras_positivas_encontradas,
        "palabras_negativas": palabras_negativas_encontradas,
    }


# ---------------------------------------------------------------
# Análisis completo (usado por /nltk/analizar)
# ---------------------------------------------------------------

def analizar_texto(texto: str) -> dict:
    clasificacion = clasificar_texto(texto)

    return {
        "idioma": "es",
        "cantidad_palabras": len(texto.strip().split()),
        "tokens": tokenizar(texto),
        "palabras_frecuentes": obtener_palabras_frecuentes(texto),
        "categoria": clasificacion["categoria"],
        "confianza": clasificacion["confianza"],
    }
