import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router

from app.api.clientes import router as clientes_router


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


@app.get("/")
def root():
    return {"message": "API Empresa Inteligente funcionando"}