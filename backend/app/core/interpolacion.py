"""
Interpolación de series numéricas (por ejemplo, el promedio diario de
tiempos de atención) usando SciPy.

Sirve para suavizar una curva con pocos puntos (rellenando valores
intermedios) y para proyectar el siguiente valor de la serie mediante
extrapolación. Alimenta el apartado "Interpolación" del dashboard.
"""
from __future__ import annotations

import numpy as np
from scipy import interpolate


class DatosInsuficientesError(ValueError):
    """No hay suficientes valores para interpolar (se necesitan >= 2)."""


def interpolar_serie(valores: list[float], puntos_salida: int | None = None) -> dict:
    """
    Recibe una serie de valores (ordenados, por ejemplo un valor por
    día) y devuelve una versión interpolada con más resolución.

    - Con 2 o 3 puntos se usa interpolación lineal.
    - Con 4 o más puntos se usa un spline cúbico (más suave).

    También calcula una proyección simple del siguiente punto de la
    serie mediante extrapolación (`fill_value="extrapolate"`).
    """
    if valores is None or len(valores) < 2:
        raise DatosInsuficientesError(
            "Se necesitan al menos 2 valores para poder interpolar."
        )

    x = np.arange(len(valores))
    y = np.asarray(valores, dtype=float)

    metodo = "cubic" if len(valores) >= 4 else "linear"
    funcion = interpolate.interp1d(
        x,
        y,
        kind=metodo,
        fill_value="extrapolate",
    )

    n_salida = puntos_salida or (len(valores) - 1) * 4 + 1
    x_nuevo = np.linspace(0, len(valores) - 1, n_salida)
    y_nuevo = funcion(x_nuevo)

    proyeccion_siguiente = float(funcion(len(valores)))

    return {
        "metodo": metodo,
        "x": [round(valor, 4) for valor in x_nuevo.tolist()],
        "valores_interpolados": [round(valor, 4) for valor in y_nuevo.tolist()],
        "proyeccion_siguiente": round(proyeccion_siguiente, 4),
    }
