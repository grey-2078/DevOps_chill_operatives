#!/bin/bash

HOST="myapp.local"
OTHER_HOST="otherapp.local"

echo "1. Проверка редиректа HTTP -> HTTPS (301)"
curl -sI -H "Host: $HOST" http://localhost/ | grep -i "HTTP\|Location"

echo "2. Проверка балансировки /api (чередование)"
for i in {1..4}; do
  curl -k -s -H "Host: $HOST" https://localhost/api/health
  echo ""
done

echo "3. Проверка /admin без пароля (401)"
curl -k -sI -H "Host: $HOST" https://localhost/admin | grep "HTTP"

echo "4. Флуд запросами /api (Ожидается 429)"
for i in {1..8}; do
  curl -k -s -o /dev/null -w "%{http_code}\n" -H "Host: $HOST" https://localhost/api/health
done | sort | uniq -c

echo "5. Запрос с чужим Host (otherapp.local)"
curl -k -s -H "Host: $OTHER_HOST" https://localhost/

echo "6. Несуществующая страница (Кастомная 404)"
curl -k -s -H "Host: $HOST" https://localhost/not-found-page