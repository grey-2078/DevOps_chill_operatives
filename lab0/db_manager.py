import psycopg
from config import DB_CONFIG


def create_database_if_not_exists():
    """Создает базу данных, если её нет. Требует дефолтного подключения."""
    sys_config = DB_CONFIG.copy()
    target_db = sys_config.pop("dbname")
    sys_config["dbname"] = "postgres"

    with psycopg.connect(**sys_config, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
            if not cur.fetchone():
                print(f"🌌 База данных '{target_db}' не найдена. Искривляем пространство и создаем...")
                cur.execute(f"CREATE DATABASE {target_db}")
            else:
                print(f"✨ Пространственный карман '{target_db}' уже существует.")


def init_db():
    """Читает SQL файл и создает структуру таблиц."""
    create_database_if_not_exists()

    print("📜 Загружаем законы межпространственной бюрократии...")
    try:
        with psycopg.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                with open("init_db.sql", "r", encoding="utf-8") as f:
                    sql_script = f.read()

                cur.execute(sql_script)
                conn.commit()
                print("✅ Таблицы успешно материализовались в Postgres!")
    except Exception as e:
        print(f"❌ Произошел сбой матрицы при инициализации: {e}")


def add_glitch(culprit: str, dimension: str, severity: str):
    """Регистрирует новое межпространственное недоразумение."""
    query = """
        INSERT INTO glitches (culprit, dimension, severity)
        VALUES (%s, %s, %s) RETURNING id;
    """
    try:
        with psycopg.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute(query, (culprit, dimension, severity))
                result = cur.fetchone()
                if result:
                    glitch_id = result[0]  # Извлекаем чистое число ID из кортежа (например, 1 вместо (1,))
                    conn.commit()
                    return glitch_id
                return None
    except Exception as e:
        print(f"❌ Ошибка при регистрации аномалии: {e}")
        return None



def issue_bureaucratic_action(glitch_id: int, fine_cost: str):
    """Выписывает абсурдный штраф для существующей аномалии."""
    query = """
        INSERT INTO bureaucratic_actions (glitch_id, fine_cost)
        VALUES (%s, %s);
    """
    try:
        with psycopg.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute(query, (glitch_id, fine_cost))
                conn.commit()
                return True
    except Exception as e:
        print(f"❌ Бюрократия дала сбой: {e}")
        return False


def get_all_registry():
    """Получает полный список аномалий вместе с назначенными штрафами."""
    query = """
        SELECT g.id, g.culprit, g.dimension, g.severity, b.fine_cost, b.status
        FROM glitches g
        LEFT JOIN bureaucratic_actions b ON g.id = b.glitch_id
        ORDER BY g.id DESC;
    """
    try:
        with psycopg.connect(**DB_CONFIG) as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                return cur.fetchall()
    except Exception as e:
        print(f"❌ Не удалось прочесть свитки реестра: {e}")
        return []


if __name__ == "__main__":
    init_db()
