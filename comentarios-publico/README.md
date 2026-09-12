# comentarios-publico

Formulario público (sin login) para que los clientes dejen sus
comentarios. Es un proyecto **totalmente independiente** de
`frontend/` (el panel administrativo): tiene su propio
`package.json` y se despliega como un proyecto de Vercel aparte.

Habla directamente con el **mismo backend** (FastAPI) que usa el
panel administrativo. El backend ya se encarga de:

1. Guardar el comentario en la base de datos (`comentarios`).
2. Ejecutar el análisis NLP automáticamente (NLTK) y guardarlo en
   `analisis_nlp`.
3. Clasificar el comentario (ventas, soporte, reclamo, etc.).

Por eso, apenas alguien envía un comentario aquí, ya aparece
procesado en la pantalla "Análisis NLP" del panel administrativo
— no hace falta ningún paso extra.

## Desarrollo local

```bash
npm install
cp .env.example .env   # y ajusta VITE_API_URL si tu backend no corre en localhost:8000
npm run dev
```

## Desplegar en Vercel (proyecto aparte)

1. Sube esta carpeta (`comentarios-publico/`) a su propio repositorio
   de Git, o si usas un monorepo, en Vercel crea un **nuevo proyecto**
   y en "Root Directory" selecciona `comentarios-publico`.
2. Framework preset: **Vite**.
3. En "Environment Variables" agrega:
   - `VITE_API_URL` = la URL de tu backend en producción, por ejemplo
     `https://mi-backend.onrender.com/api`.
4. Deploy.

El backend ya tiene el CORS configurado para aceptar automáticamente
cualquier dominio `*.vercel.app` (ver `backend/app/main.py`), así que
no hace falta tocar nada del backend para que este segundo proyecto
funcione.
