export interface LabReport {
  id: string; // e.g. "lab0", "lab1", "lab2", "lab3"
  filename: string; // e.g. "readme_lab3.md"
  title: string;
  subtitle?: string;
  labNumber: string; // e.g. "0", "1", "2", "3" or "Custom"
  summary: string;
  content: string;
  source: 'bundled' | 'github' | 'custom';
  updatedAt?: string;
}

// Built-in fallback content in case of offline or build
export const DEFAULT_LAB_CONTENTS: Record<string, string> = {
  'readme_lab0.md': `# DevOps_chill_operative

Самые неприятные события - те, которые нарушают комфорт нашей жизни. И речь не о заблокированных сервисах, а о событиях межпространственных масштабов. Представляю **реестр событий**, которые представляют некоторую угрозу реальности: от потных ладошек до **ДАННЫЕ УДАЛЕНЫ**. 

# Файлы
* **\`docker-compose.yml\`** — Инструкция для Docker. Автоматически скачивает образ PostgreSQL 15, разворачивает контейнер в изолированном пространстве, настраивает порты и монтирует виртуальный жесткий диск для сохранения данных.
* **\`init_db.sql\`** — Скрипт инициализации базы данных. Содержит структуру таблиц \`glitches\` и \`bureaucratic_actions\`, связи \`FOREIGN KEY\` с каскадным удалением, а также жесткие ограничения \`CHECK\` для контроля за уровнями космических угроз.
* **\`config.py\`** — Считывает настройки из \`.env\` файла с помощью библиотеки \`python-dotenv\` и формирует удобный словарь параметров для подключения к Postgres.
* **\`db_manager.py\`** — Отвечает за проверку существования БД, автоматический накат SQL-схемы через библиотеку \`psycopg\`, а также содержит функции выполнения запросов (\`INSERT\` для добавления аномалий/штрафов и сложный \`LEFT JOIN\` для чтения).
* **\`app.py\`** — Главный файл приложения. Запускает интерактивный интерфейс.

# Итоги
Я и ранее работал на бюрократов, но действовал четкому тз: сделай чтобы тут вот так было, а там работало только так и никак иначе. Здесь мне приказали сделать аппку и чтобы работало. **А ОНО И РАБОТАЕТ!**. В очередной раз усвоил, что докер контейнеры это круто, но очень неудобно.`,

  'readme_lab1.md': `# DevOps_chill_operative

Привет из пространства реализации фич! В этот раз мы реализовали отказоустойчивый NGINX, благодаря чему теперь есть **отказоустойчивость** (при условии рабочего сервера), ведь бэкенд делится **аж на два!** Сейчас расскажем и покажем как это работает.

# Файлы
* **\`docker-compose.yml\`** — Запускает все файлы, объединяет в одну сеть, пробрасывает порты.
* **\`default.conf\`** — С этим файлом больше всего возни было. Настройка upstream streamlit_backend, редирект с HTTP (80) на HTTPS (443), SSL сертификаты, rate limit (5r/s), кастомная 404 страница и базовая авторизация /admin.
* **\`check.sh\`** — Автопроверка всех ключевых сценариев: редирект, балансировка между инстансами, 401 на admin, flood лимит, vhost secondproject.local и кастомная 404.

# Итоги
Отказоустойчивость достигнута, написан автотест.`,

  'readme_lab2.md': `# Отчет по Лабораторной работе №2: Docker 

**Цель лабы:** Упаковать сервис из Лабы 0 в Docker, создать «плохой» и «хороший» образы, а также поднять стек через \`docker compose\` с сетевой изоляцией и volume. 

Чтобы подойти к сдаче лабы креативно, мы оформили отчёт в стиле «Вредных советов». 

> **Внимание:** все советы из раздела «Как сделать плохо» **категорически нельзя** использовать в реальной разработке. Это лишь демонстрация того, как делать не надо. 

### Вредные советы: Как собрать «Плохой» Dockerfile (\`Dockerfile.bad\`) 

1. Никогда не фиксируйте версию базового образа. Используйте лучше \`python:latest\`. Завтра код сломается, потому что вышло обновление. 
2. Запускайте всё от имени \`root\`. \`USER appuser\` ни к чему, пусть приложение имеет максимальные права. 
3. Обязательно копируйте всё сразу (\`COPY . .\`). Не разделяйте \`requirements.txt\` и код, чтобы при изменении одной строчки заново скачивались все библиотеки. 
4. Игнорируйте \`.dockerignore\`. Положите в образ папку \`.git\`, пароли из \`.env\` и кэш.  
5. Напишите всё в одну команду. Зачем один процесс на контейнер? Напишите \`CMD ["sh", "-c", "uvicorn ... & streamlit ..."]\`. 

### Как исправить эти ошибки в «Хорошем» Dockerfile (\`Dockerfile\`) 

* **Multi-stage build.** Сначала собираем все библиотеки во временном контейнере (\`builder\`), а в финальный образ переносим только готовые пакеты. Образ стал весить 274 МБ вместо 800+ МБ.
* **Безопасность.** Создали отдельного пользователя \`appuser\` и запускаем приложение от него.
* **Кеширование.** Сначала копируем \`requirements.txt\` и ставим зависимости, и только потом копируем код. Пересборка после правки кода занимает 1 секунду.
* **\`.dockerignore\` и HEALTHCHECK.** Очищен мусор и настроен автоматический мониторинг здоровья сервиса.

### Про Docker Compose и сети 
Сети \`front_net\` (фронт + бэкенды) и \`back_net\` (бэкенды + база данных). Nginx не имеет прямого доступа к базе данных. Именованный volume \`glitch_data\` сохраняет информацию после пересоздания контейнеров.`
};

/**
 * Парсит markdown файл и извлекает метаданные для карточки
 */
export function parseLabReport(filename: string, rawContent: string, source: 'bundled' | 'github' | 'custom' = 'bundled'): LabReport {
  const cleanName = filename.split('/').pop() || filename;
  
  // Извлекаем номер лабы: например readme_lab3.md -> "3", lab4.md -> "4"
  const labMatch = cleanName.match(/lab(?:_)?(\d+)/i);
  const labNumber = labMatch ? labMatch[1] : (cleanName.includes('README') ? 'Root' : 'Ext');
  const id = labMatch ? `lab${labMatch[1]}` : cleanName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

  // Извлекаем первый заголовок H1 или H2
  const titleMatch = rawContent.match(/^#\s+(.+)$/m) || rawContent.match(/^##\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `Лабораторная работа №${labNumber}`;

  // Извлекаем первый значимый абзац текста (без решеток) как summary
  const lines = rawContent.split('\n');
  let summary = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('> ') && !trimmed.startsWith('```') && trimmed.length > 20) {
      summary = trimmed.replace(/\*\*/g, '').replace(/`/g, '');
      break;
    }
  }

  if (!summary) {
    summary = `Отчет и техническая документация из файла ${cleanName}.`;
  }

  if (summary.length > 170) {
    summary = summary.substring(0, 167) + '...';
  }

  return {
    id,
    filename: cleanName,
    title,
    labNumber,
    summary,
    content: rawContent,
    source,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Загружает встроенные файлы markdown через Vite import.meta.glob
 */
export function loadBundledLabReports(): LabReport[] {
  const reportsMap = new Map<string, LabReport>();

  // 1. Сначала загружаем дефолтные файлы
  for (const [filename, content] of Object.entries(DEFAULT_LAB_CONTENTS)) {
    const report = parseLabReport(filename, content, 'bundled');
    reportsMap.set(report.id, report);
  }

  // 2. Пытаемся динамически подтянуть любые .md файлы через glob
  try {
    const globFiles = import.meta.glob(['/interdimensional_registry/*.md', '../*.md', '/*.md', './**/*.md'], {
      query: '?raw',
      import: 'default',
      eager: true
    }) as Record<string, string>;

    for (const [filePath, fileContent] of Object.entries(globFiles)) {
      if (typeof fileContent === 'string' && fileContent.trim().length > 0) {
        const report = parseLabReport(filePath, fileContent, 'bundled');
        reportsMap.set(report.id, report);
      }
    }
  } catch (e) {
    console.warn('Vite glob import fallback to defaults:', e);
  }

  return Array.from(reportsMap.values()).sort((a, b) => {
    const numA = parseInt(a.labNumber, 10);
    const numB = parseInt(b.labNumber, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Синхронизирует .md файлы напрямую с репозиторием GitHub grey-2078/DevOps_chill_operatives
 */
export async function syncReportsFromGitHub(): Promise<{ reports: LabReport[]; newCount: number }> {
  const repoOwner = 'grey-2078';
  const repoName = 'DevOps_chill_operatives';
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/interdimensional_registry`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API вернул статус ${res.status}`);
    }

    const items: Array<{ name: string; download_url: string; type: string }> = await res.json();
    const mdItems = items.filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.md'));

    const fetchedReports: LabReport[] = [];

    for (const item of mdItems) {
      try {
        const rawRes = await fetch(item.download_url);
        if (rawRes.ok) {
          const content = await rawRes.text();
          const report = parseLabReport(item.name, content, 'github');
          fetchedReports.push(report);
        }
      } catch (err) {
        console.error(`Ошибка скачивания ${item.name}:`, err);
      }
    }

    return { reports: fetchedReports, newCount: fetchedReports.length };
  } catch (err) {
    console.error('Ошибка синхронизации с GitHub:', err);
    throw err;
  }
}
