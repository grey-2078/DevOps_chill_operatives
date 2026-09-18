# 1. Используем официальный легкий образ Python
FROM python:3.10-slim

# 2. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# 3. Копируем файл зависимостей и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Копируем все остальные файлы проекта в контейнер
COPY . .

# 5. Сообщаем Docker, что приложение слушает порт 8501
EXPOSE 8501

# 6. Команда для запуска веб-интерфейса Streamlit
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
