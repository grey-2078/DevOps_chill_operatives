import os
from dotenv import load_dotenv

load_dotenv()

db_host = os.getenv("POSTGRES_HOST", "localhost")

DB_CONFIG = {
    "dbname": os.getenv("POSTGRES_DB", "glitch_db"),
    "user": os.getenv("POSTGRES_USER", "glitch_master"),
    "password": os.getenv("POSTGRES_PASSWORD", "cosmic_password_123"),
    "host": db_host,
    "port": int(os.getenv("POSTGRES_PORT", 5432))
}
