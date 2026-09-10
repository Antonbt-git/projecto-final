import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router

from app.api.clientes import router as clientes_router
from app.api.nltk import router as nltk_router
from app.api.comentarios import router as comentarios_router
from app.api.tiempos_atencion import router as tiempos_atencion_router
from app.api.metricas import router as metricas_router
from app.api.optimizaciones import router as optimizaciones_router
from app.api.auditoria import router as auditoria_router
from app.api.scipy_analisis import router as scipy_analisis_router
from app.api.categorias import router as categorias_router
from app.api.dashboard import router as dashboard_router


app = FastAPI(
    title="Empresa Inteligente",
    version="1.0.0",
)


# Orígenes permitidos. Se pueden agregar más separados por coma en la
# variable de entorno ALLOWED_ORIGINS (ej. en Render):
# ALLOWED_ORIGINS=https://mi-dominio-personalizado.com
_origenes_extra = [
    origen.strip()
    for origen in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origen.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        *_origenes_extra,
    ],
    # Cubre automáticamente el dominio principal de Vercel y todas las
    # URLs de preview que genera por cada despliegue/rama
    # (ej. https://projecto-final-3xjg.vercel.app,
    # https://projecto-final-3xjg-git-main-usuario.vercel.app).
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(clientes_router)
app.include_router(nltk_router)
app.include_router(comentarios_router)
app.include_router(tiempos_atencion_router)
app.include_router(metricas_router)
app.include_router(optimizaciones_router)
app.include_router(auditoria_router)
app.include_router(scipy_analisis_router)
app.include_router(categorias_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "API Empresa Inteligente funcionando"}