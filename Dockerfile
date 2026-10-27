# ==============================================================================
# Multi-stage Dockerfile для сборки и запуска React-приложения
# С соблюдением всех лучших практик (Лабораторная №2):
# 1. Multi-stage build (минимальный итоговый вес)
# 2. Непривилегированный пользователь (USER appuser)
# 3. Кеширование слоев зависимостей
# 4. Встроенный HEALTHCHECK
# 5. Изоляция одного процесса на контейнер
# ==============================================================================

# ЭТАП 1: Сборка статических ассетов (Builder)
FROM node:22-alpine AS builder
WORKDIR /app

# Кешируем слой зависимостей
COPY package.json ./
RUN npm install

# Копируем исходный код и компилируем React-приложение
COPY . .
RUN npm run build

# ЭТАП 2: Легковесный производственный рантайм (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

# Устанавливаем легкий веб-сервер для отдачи SPA
RUN npm install -g serve && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

# Переносим только скомпилированный бандл (dist)
COPY --from=builder /app/dist ./dist

# Переключаемся на безопасного непривилегированного пользователя
USER appuser

EXPOSE 3000

# Автоматический мониторинг здоровья контейнера
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Запуск отдачи приложения на порту 3000
CMD ["serve", "dist", "-l", "3000"]
