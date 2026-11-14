from sqlalchemy import text
from app.db.session import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database()"))
        print("Database connected successfully!")
        print("Connected database:", result.scalar())
except Exception as error:
    print("Database connection failed:")
    print(error)