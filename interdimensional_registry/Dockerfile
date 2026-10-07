# 1. Используем официальный легкий образ Python
FROM python:3.10-slim

# 2. Устанавливаем рабочую директорию
WORKDIR /app

# 3. Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Копируем все файлы проекта
COPY . .

# 5. Открываем порты для FastAPI (8000) и Streamlit (8501)
EXPOSE 8000 8501

# 6. Запускаем одновременно FastAPI и Streamlit
CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port 8000 & streamlit run app.py --server.port=8501 --server.address=0.0.0.0"]