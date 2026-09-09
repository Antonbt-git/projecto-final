"""
Optimización de asignación de recursos con programación lineal
(scipy.optimize.linprog).

Escenario que resuelve: dado un conjunto de recursos con una
cantidad inicial, un costo por unidad y una capacidad de "servicio"
que aporta cada unidad, se busca la combinación de recursos de
menor costo total que siga cubriendo una demanda mínima de
servicio, sin superar un margen de crecimiento sobre la cantidad
inicial de cada recurso.

Ejemplo:
    recursos = {"recurso_a": 3, "recurso_b": 5}
    costos_unitarios = {"recurso_a": 120, "recurso_b": 90}
    capacidad_por_unidad = {"recurso_a": 25, "recurso_b": 18}
    demanda_minima = 160

    resultado = optimizar_recursos(...)
    # {"recurso_a": 2.8, "recurso_b": 4.1, "costo": 742.50, "costo_inicial": ...}
"""
from __future__ import annotations

from scipy.optimize import linprog


class ParametrosInvalidosError(ValueError):
    """Los parámetros de entrada no permiten calcular una optimización."""


def optimizar_recursos(
    recursos: dict[str, float],
    costos_unitarios: dict[str, float],
    capacidad_por_unidad: dict[str, float],
    demanda_minima: float,
    margen_maximo: float = 1.5,
) -> dict:
    nombres = list(recursos.keys())

    if not nombres:
        raise ParametrosInvalidosError("Debe indicar al menos un recurso.")

    faltantes = [
        nombre
        for nombre in nombres
        if nombre not in costos_unitarios or nombre not in capacidad_por_unidad
    ]
    if faltantes:
        raise ParametrosInvalidosError(
            "Faltan costos_unitarios o capacidad_por_unidad para: "
            + ", ".join(faltantes)
        )

    # Función objetivo: minimizar el costo total = sum(costo_i * x_i)
    c = [costos_unitarios[nombre] for nombre in nombres]

    # linprog solo admite restricciones "<=", así que la restricción
    # de demanda mínima (sum(capacidad_i * x_i) >= demanda_minima) se
    # reescribe como -sum(capacidad_i * x_i) <= -demanda_minima
    A_ub = [[-capacidad_por_unidad[nombre] for nombre in nombres]]
    b_ub = [-demanda_minima]

    limites = [(0, recursos[nombre] * margen_maximo) for nombre in nombres]

    resultado = linprog(
        c=c,
        A_ub=A_ub,
        b_ub=b_ub,
        bounds=limites,
        method="highs",
    )

    if not resultado.success:
        raise ParametrosInvalidosError(
            f"No se encontró una solución factible: {resultado.message}"
        )

    valores_optimizados = {
        nombre: round(float(valor), 4)
        for nombre, valor in zip(nombres, resultado.x)
    }

    costo_inicial = sum(
        costos_unitarios[nombre] * recursos[nombre] for nombre in nombres
    )

    return {
        **valores_optimizados,
        "costo": round(float(resultado.fun), 2),
        "costo_inicial": round(float(costo_inicial), 2),
    }
