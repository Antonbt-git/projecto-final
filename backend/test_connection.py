from sqlalchemy import text

from app.database.connection import engine


try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.scalar()

        print("✅ Conexión exitosa con PostgreSQL")
        print(f"PostgreSQL: {version}")

except Exception as error:
    print("❌ Error de conexión")
    print(error)