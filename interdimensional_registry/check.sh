#!/bin/bash

# Путь к сайту (учитываем локальный домен и самоподписанный SSL через -k)
URL="https://myapp.local"
HTTP_URL="http://myapp.local"

echo "ЗАПУСК ПРОВЕРКИ NGINX И ИНФРАСТРУКТУРЫ"
echo ""

# 1. Проверка редиректа 301 с HTTP на HTTPS
echo "Проверка редиректа с HTTP на HTTPS (ожидается 301):"
curl -I -s "$HTTP_URL" | grep -E "HTTP|Location"
echo "шмек"

# 2. Несколько запросов на /api — чередование инстансов (балансировка)
echo "Проверка балансировки /api:"
for i in {1..4}; do
  echo -n "Запрос $i: "
  curl -k -s -I "$URL/api" | grep -i "server" || echo "Ответ получен"
done
echo "шмек шмек"

# 3. Проверка авторизации на /admin (без пароля -> 401)
echo "Проверка базовой авторизации на /admin (ожидается 401 Unauthorized):"
curl -k -s -I "$URL/admin" | grep "HTTP/"
echo "шмек шмек шмек"

# 4. Проверка флуда запросов / лимита (limit_req -> 429 или 503)
echo "Проверка лимита запросов (flood на /api, ожидается срабатывание защиты):"
for i in {1..10}; do
  STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "$URL/api")
  echo "Запрос $i -> Статус: $STATUS"
done
echo "шмек шмек шмек шмек"

# 5. Проверка виртуальных хостов (чужой Host-заголовок)
echo "Проверка виртуальных хостов (запрос с чужим Host: secondproject.local):"
curl -k -s -I -H "Host: secondproject.local" "$URL/" | grep "HTTP/"
echo "шмек шмек шмек шмек шмек"

# 6. Проверка несуществующей страницы (кастомная 404)
echo "Проверка кастомной страницы 404 (запрос несуществующего пути):"
curl -k -s -o /dev/null -w "Статус ответа: %{http_code}\n" "$URL/nonexistent-page-test"
echo ""
echo "шмек шмек шмек шмек шмек шмек"