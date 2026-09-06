"""
Cálculo de métricas estadísticas descriptivas sobre los tiempos de
atención, usando NumPy y SciPy.

Alimenta la tabla `metricas_estadisticas`, que a su vez permite
mostrar tarjetas como "Tiempo promedio", "Desviación estándar" y
"Tiempo máximo" en el frontend.
"""
from __future__ import annotations

import numpy as np
from scipy import stats


class SinDatosError(ValueError):
    """No hay valores suficientes para calcular las métricas."""


def calcular_metricas(valores: list[float]) -> dict:
    """
    Calcula, a partir de una lista de tiempos (en minutos):
    - cantidad_registros
    - media
    - mediana
    - desviacion_estandar (muestral, ddof=1; 0 si solo hay 1 dato)
    - minimo / maximo
    - percentil_25 / percentil_75
    """
    if not valores:
        raise SinDatosError(
            "No hay tiempos de atención para calcular las métricas."
        )

    datos = np.asarray(valores, dtype=float)
    n = datos.size

    return {
        "cantidad_registros": int(n),
        "media": round(float(np.mean(datos)), 4),
        "mediana": round(float(np.median(datos)), 4),
        "desviacion_estandar": (
            round(float(np.std(datos, ddof=1)), 4) if n > 1 else 0.0
        ),
        "minimo": round(float(np.min(datos)), 4),
        "maximo": round(float(np.max(datos)), 4),
        "percentil_25": round(float(stats.scoreatpercentile(datos, 25)), 4),
        "percentil_75": round(float(stats.scoreatpercentile(datos, 75)), 4),
    }
