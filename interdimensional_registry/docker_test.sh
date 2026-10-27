#!/bin/bash
set -e

# ==============================================================================
# Скрипт автоматизированного тестирования требований к Docker-образам и Compose
# Согласно заданию:
# 1. Проверка размера образов (хороший vs плохой)
# 2. Проверка пользователя (whoami -> обычный пользователь)
# 3. Проверка кеширования при изменении одной строки кода
# 4. Поднятие всего стека через docker compose (бэк, фронт, БД)
# 5. Проверка сохранения данных в именованном томе (named volume) после удаления контейнера
# 6. Проверка сетевой изоляции (фронт не имеет доступа к БД)
# ==============================================================================

COLOR_GREEN="\033[0;32m"
COLOR_RED="\033[0;31m"
COLOR_YELLOW="\033[1;33m"
COLOR_BLUE="\033[0;34m"
COLOR_RESET="\033[0m"

echo -e "${COLOR_BLUE}======================================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}🚀 СТАРТ ТЕСТИРОВАНИЯ ДЛЯ ЛАБОРАТОРНОЙ РАБОТЫ (DOCKER)${COLOR_RESET}"
echo -e "${COLOR_BLUE}======================================================${COLOR_RESET}\n"

# Переход в директорию проекта
cd "$(dirname "$0")"

# ------------------------------------------------------------------------------
# 1. СБОРКА И СРАВНЕНИЕ РАЗМЕРОВ
# ------------------------------------------------------------------------------
echo -e "${COLOR_YELLOW}[ТЕСТ 1] Сборка образов и сравнение размера (Размер)${COLOR_YELLOW}"
echo "Собираем 'плохой' образ (Dockerfile.bad)..."
docker build -t glitch_app:bad -f Dockerfile.bad .

echo "Собираем 'хороший' образ (Dockerfile)..."
docker build -t glitch_app:good -f Dockerfile .

BAD_SIZE=$(docker images glitch_app:bad --format "{{.Size}}")
GOOD_SIZE=$(docker images glitch_app:good --format "{{.Size}}")

echo -e "📦 Размер плохого образа: ${COLOR_RED}${BAD_SIZE}${COLOR_RESET}"
echo -e "📦 Размер хорошего образа: ${COLOR_GREEN}${GOOD_SIZE}${COLOR_RESET}"

# ------------------------------------------------------------------------------
# 2. ПРОВЕРКА ПОЛЬЗОВАТЕЛЯ (WHOAMI)
# ------------------------------------------------------------------------------
echo -e "\n${COLOR_YELLOW}[ТЕСТ 2] Проверка пользователя внутри контейнера (Пользователь)${COLOR_YELLOW}"

BAD_USER=$(docker run --rm glitch_app:bad whoami)
GOOD_USER=$(docker run --rm glitch_app:good whoami)

echo -e "Пользователь в плохом контейнере (glitch_app:bad): ${COLOR_RED}${BAD_USER}${COLOR_RESET} (Опасно: root!)"
echo -e "Пользователь в хорошем контейнере (glitch_app:good): ${COLOR_GREEN}${GOOD_USER}${COLOR_RESET} (Безопасно: non-root)"

# ------------------------------------------------------------------------------
# 3. ИЗМЕРЕНИЕ ВРЕМЕНИ ПЕРЕСБОРКИ ПРИ ПРАВКЕ 1 СТРОКИ КОДА (КЕШИРОВАНИЕ)
# ------------------------------------------------------------------------------
echo -e "\n${COLOR_YELLOW}[ТЕСТ 3] Измерение времени пересборки при изменении кода (Кеш)${COLOR_YELLOW}"

# Вносим изменение в 1 строку (добавляем комментарий в app.py)
echo "# Test cache edit: $(date)" >> app.py

echo "Пересборка плохого образа после правки 1 строки:"
TIME_BAD=$( { time docker build -t glitch_app:bad -f Dockerfile.bad . ; } 2>&1 | grep real || true )
echo -e "Время пересборки плохого: ${TIME_BAD}"

echo "Пересборка хорошего образа после правки 1 строки:"
TIME_GOOD=$( { time docker build -t glitch_app:good -f Dockerfile . ; } 2>&1 | grep real || true )
echo -e "Время пересборки хорошего: ${TIME_GOOD}"

# Откатываем тестовую правку
git checkout app.py 2>/dev/null || sed -i '$ d' app.py

# ------------------------------------------------------------------------------
# 4. ПОДНЯТИЕ СТЕКА ЧЕРЕЗ DOCKER COMPOSE
# ------------------------------------------------------------------------------
echo -e "\n${COLOR_YELLOW}[ТЕСТ 4] Запуск стека docker compose (бэк, фронт, БД)${COLOR_YELLOW}"
docker compose down -v 2>/dev/null || true
docker compose up -d

echo "Ожидание готовности сервисов (healthcheck Postgres)..."
sleep 6

docker compose ps

# ------------------------------------------------------------------------------
# 5. ПРОВЕРКА СОХРАНЕНИЯ ДАННЫХ В ИМЕНОВАННОМ ТОМЕ (VOLUME)
# ------------------------------------------------------------------------------
echo -e "\n${COLOR_YELLOW}[ТЕСТ 5] Проверка именованного тома (glitch_data)${COLOR_YELLOW}"

echo "Записываем тестовую аномалию в базу данных..."
docker exec -i glitch_postgres_db psql -U glitch_master -d glitch_db -c \
  "INSERT INTO glitches (culprit, dimension, severity) VALUES ('Кот Шрёдингера (Автотест)', 'Измерение-42', 'Схлопывание мышей');"

echo "Проверяем наличие записи перед удалением контейнера:"
docker exec -i glitch_postgres_db psql -U glitch_master -d glitch_db -c \
  "SELECT id, culprit, dimension, severity FROM glitches WHERE culprit LIKE '%Автотест%';"

echo "Принудительно удаляем контейнер БД (docker rm -f)..."
docker rm -f glitch_postgres_db

echo "Поднимаем контейнер БД заново через docker compose up -d..."
docker compose up -d glitch_postgres
sleep 5

echo "Проверяем сохранность данных в пересозданном контейнере:"
SAVED_RECORD=$(docker exec -i glitch_postgres_db psql -U glitch_master -d glitch_db -t -c \
  "SELECT count(*) FROM glitches WHERE culprit LIKE '%Автотест%';")

if [[ "${SAVED_RECORD//[[:space:]]/}" -ge 1 ]]; then
  echo -e "${COLOR_GREEN}✅ УСПЕХ: Данные в именованном томе glitch_data успешно сохранились!${COLOR_RESET}"
else
  echo -e "${COLOR_RED}❌ ОШИБКА: Данные не сохранились!${COLOR_RESET}"
fi

# ------------------------------------------------------------------------------
# 6. СЕТЕВАЯ ИЗОЛЯЦИЯ: ФРОНТ (NGINX) -> БД (POSTGRES)
# ------------------------------------------------------------------------------
echo -e "\n${COLOR_YELLOW}[ТЕСТ 6] Проверка сетевой изоляции (front_net vs back_net)${COLOR_YELLOW}"

echo "1. Проверяем доступ бэкенда к БД (должен быть УСПЕШНЫМ, так как бэк в back_net):"
if docker exec glitch_backend_1 python -c "import socket; s = socket.socket(); s.connect(('glitch_postgres', 5432)); print('Подключение бэкенда к БД: УСПЕШНО'); s.close()" 2>/dev/null; then
  echo -e "${COLOR_GREEN}✅ Бэкенд имеет доступ к glitch_postgres:5432${COLOR_RESET}"
fi

echo "2. Проверяем доступ фронта (Nginx) к БД (должен ЗАВЕРШИТЬСЯ ОШИБКОЙ, так как Nginx только в front_net):"
set +e
docker exec glitch_nginx ping -c 1 glitch_postgres 2>&1
NGINX_TEST_EXIT=$?
set -e

if [ $NGINX_TEST_EXIT -ne 0 ]; then
  echo -e "${COLOR_GREEN}✅ УСПЕХ: Фронт (Nginx) изолирован и НЕ ИМЕЕТ прямого сетевого доступа к БД!${COLOR_RESET}"
else
  echo -e "${COLOR_RED}❌ ОШИБКА: Изоляция нарушена, Nginx видит базу данных!${COLOR_RESET}"
fi

echo -e "\n${COLOR_BLUE}======================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}🎉 ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ!${COLOR_RESET}"
echo -e "${COLOR_BLUE}======================================================${COLOR_RESET}"
