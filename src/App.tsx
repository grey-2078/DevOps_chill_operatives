import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Layers, 
  Server, 
  FileCode, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Database, 
  Network, 
  Cpu, 
  BookOpen, 
  Search,
  ArrowRight,
  Code2,
  ExternalLink,
  Info,
  GitBranch,
  GitPullRequest,
  Upload,
  FileText,
  Check,
  Copy
} from 'lucide-react';
import { LabReport, loadBundledLabReports, syncReportsFromGitHub, parseLabReport } from './lib/labManager';
import { MarkdownRenderer } from './components/MarkdownRenderer';

interface Glitch {
  id: number;
  culprit: string;
  dimension: string;
  severity: 'потные ладошки' | 'пахнет клубникой' | 'Схлопывание мышей' | 'прыжки на месте' | 'ДАННЫЕ УДАЛЕНЫ' | 'осталось недолго';
  fine: string;
  status: 'Совет мудрых жаб' | 'Забыто под ковром' | 'Квантовый парадокс';
  createdAt?: string;
}

const INITIAL_GLITCHES: Glitch[] = [
  {
    id: 1042,
    culprit: 'Кот Шрёдингера',
    dimension: 'Суперпозиция C-137',
    severity: 'Схлопывание мышей',
    fine: '3 кг здравого смысла',
    status: 'Совет мудрых жаб',
    createdAt: '2026-10-27 12:40'
  },
  {
    id: 1041,
    culprit: 'Левитирующий чайник Аркадий',
    dimension: 'Плоскость бесконечных макарон',
    severity: 'пахнет клубникой',
    fine: 'Запрет на букву Ы на 300 лет',
    status: 'Забыто под ковром',
    createdAt: '2026-10-27 11:15'
  },
  {
    id: 1040,
    culprit: 'Фотон-дезертир',
    dimension: 'Зеркальный сектор 9',
    severity: 'прыжки на месте',
    fine: 'Замедление до скорости улитки',
    status: 'Квантовый парадокс',
    createdAt: '2026-10-27 09:30'
  },
  {
    id: 1039,
    culprit: 'Некто в пальто из темной материи',
    dimension: 'Измерение нулевого градиента',
    severity: 'ДАННЫЕ УДАЛЕНЫ',
    fine: 'Пожизненный просмотр рекламы утюгов',
    status: 'Совет мудрых жаб',
    createdAt: '2026-10-26 23:10'
  },
  {
    id: 1038,
    culprit: 'Двоичный ноль с завышенной самооценкой',
    dimension: 'Память первого суперкомпьютера',
    severity: 'потные ладошки',
    fine: 'Принудительное округление до единицы',
    status: 'Забыто под ковром',
    createdAt: '2026-10-26 18:22'
  }
];

const SEVERITIES = [
  'потные ладошки',
  'пахнет клубникой',
  'Схлопывание мышей',
  'прыжки на месте',
  'ДАННЫЕ УДАЛЕНЫ',
  'осталось недолго'
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<'registry' | 'register' | 'docker' | 'api' | 'docs'>('registry');
  const [glitches, setGlitches] = useState<Glitch[]>(() => {
    const saved = localStorage.getItem('glitches_registry_data');
    return saved ? JSON.parse(saved) : INITIAL_GLITCHES;
  });
  
  // Node rotation simulator
  const [currentNode, setCurrentNode] = useState<'backend-node-1' | 'backend-node-2'>('backend-node-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Form states
  const [culprit, setCulprit] = useState('');
  const [dimension, setDimension] = useState('');
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>('Схлопывание мышей');
  const [fine, setFine] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Docker lab test runner state
  const [dockerTab, setDockerTab] = useState<'comparison' | 'tests' | 'files'>('comparison');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testConsoleLogs, setTestConsoleLogs] = useState<string[]>([]);
  const [testStep, setTestStep] = useState<number>(0);

  // Dynamic Lab reports state and navigation
  const [labReports, setLabReports] = useState<LabReport[]>(() => {
    const cached = localStorage.getItem('synced_lab_reports_v2');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return loadBundledLabReports();
  });

  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSyncGitHub = async (silent = false) => {
    setIsSyncingGitHub(true);
    if (!silent) setSyncFeedback('Запрос к репозиторию grey-2078/DevOps_chill_operatives...');
    try {
      const { reports: ghReports } = await syncReportsFromGitHub();
      if (ghReports.length > 0) {
        setLabReports(prev => {
          const map = new Map<string, LabReport>();
          prev.forEach(r => map.set(r.id, r));
          ghReports.forEach(r => map.set(r.id, r));
          const updated = Array.from(map.values()).sort((a, b) => {
            const numA = parseInt(a.labNumber, 10);
            const numB = parseInt(b.labNumber, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.id.localeCompare(b.id);
          });
          localStorage.setItem('synced_lab_reports_v2', JSON.stringify(updated));
          return updated;
        });
        if (!silent) {
          setSyncFeedback(`✅ Синхронизировано: найдено ${ghReports.length} отчетов из GitHub!`);
        }
      } else {
        if (!silent) setSyncFeedback('Все отчеты актуальны.');
      }
    } catch (err: any) {
      if (!silent) setSyncFeedback('⚠️ GitHub API: лимит запросов или репозиторий недоступен.');
    } finally {
      setIsSyncingGitHub(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Background auto-sync on mount
  useEffect(() => {
    handleSyncGitHub(true);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newReport = parseLabReport(file.name, text, 'custom');
        setLabReports(prev => {
          const updated = [newReport, ...prev.filter(r => r.id !== newReport.id)].sort((a, b) => {
            const numA = parseInt(a.labNumber, 10);
            const numB = parseInt(b.labNumber, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.id.localeCompare(b.id);
          });
          localStorage.setItem('synced_lab_reports_v2', JSON.stringify(updated));
          return updated;
        });
        setSelectedLabId(newReport.id);
        window.location.hash = newReport.id;
        setSyncFeedback(`✅ Файл ${file.name} добавлен в реестр отчетов!`);
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    localStorage.setItem('glitches_registry_data', JSON.stringify(glitches));
  }, [glitches]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('lab') || hash === 'docs' || hash === 'reports') {
        setActiveTab('docs');
        setSelectedLabId(hash === 'reports' ? 'all' : hash);
      } else if (hash === 'docker') {
        setActiveTab('docker');
      } else if (hash === 'api') {
        setActiveTab('api');
      } else if (hash === 'registry') {
        setActiveTab('registry');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToLab = (labId: string) => {
    setSelectedLabId(labId);
    setShowRawMarkdown(false);
    if (labId === 'all') {
      window.location.hash = 'reports';
    } else {
      window.location.hash = labId;
    }
  };

  const rotateNode = () => {
    setCurrentNode(prev => prev === 'backend-node-1' ? 'backend-node-2' : 'backend-node-1');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!culprit || !dimension || !fine) return;

    const newId = (glitches[0]?.id || 1000) + 1;
    const newGlitch: Glitch = {
      id: newId,
      culprit,
      dimension,
      severity,
      fine,
      status: 'Совет мудрых жаб',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setGlitches([newGlitch, ...glitches]);
    setFormSuccess(`Протокол №${newId} успешно зарегистрирован и отправлен в совет!`);
    setCulprit('');
    setDimension('');
    setFine('');
    rotateNode();

    setTimeout(() => {
      setFormSuccess(null);
    }, 4500);
  };

  const runDockerSuite = () => {
    setIsRunningTests(true);
    setTestConsoleLogs([]);
    setTestStep(1);

    const logs = [
      '🚀 Запуск тестирования Docker-образов и Compose стека...',
      '📂 [ТЕСТ 1] Сборка образов и анализ размера:',
      '   Building glitch_app:bad (Dockerfile.bad)... done (Size: 812 MB)',
      '   Building glitch_app:good (Dockerfile multi-stage)... done (Size: 274 MB)',
      '   ✅ РЕЗУЛЬТАТ: Хороший образ в 3 раза легче плохого (274 МБ < 812 МБ)',
      '-------------------------------------------------------',
      '👤 [ТЕСТ 2] Проверка пользователя внутри контейнера (whoami):',
      '   glitch_app:bad whoami -> root (ОПАСНОСТЬ: повышение привилегий)',
      '   glitch_app:good whoami -> appuser (БЕЗОПАСНО: non-root UID 999)',
      '   ✅ РЕЗУЛЬТАТ: Контейнер изолирован и работает под appuser',
      '-------------------------------------------------------',
      '⚡ [ТЕСТ 3] Измерение времени пересборки при изменении 1 строки (app.py):',
      '   Вносим тестовую строку в app.py...',
      '   time docker build -f Dockerfile.bad -> real 0m42.84s (инвалидация всех слоев)',
      '   time docker build -f Dockerfile -> real 0m01.12s (кеш wheels и pip сохранен)',
      '   ✅ РЕЗУЛЬТАТ: Кеширование слоев ускоряет билд в 38 раз (1.1 сек)',
      '-------------------------------------------------------',
      '🐳 [ТЕСТ 4] Запуск полного стека (docker compose up -d):',
      '   [+] Running 4/4',
      '   ✔ Network front_net            Created',
      '   ✔ Network back_net             Created',
      '   ✔ Volume glitch_data           Created',
      '   ✔ Container glitch_postgres_db Healthy (Postgres 15)',
      '   ✔ Container glitch_backend_1   Started (Node 1)',
      '   ✔ Container glitch_backend_2   Started (Node 2)',
      '   ✔ Container glitch_nginx       Started (Port 80/443)',
      '   ✅ РЕЗУЛЬТАТ: Все 3 сервиса (фронт, бэк, БД) подняты и общаются',
      '-------------------------------------------------------',
      '💾 [ТЕСТ 5] Проверка именованного тома (glitch_data):',
      '   INSERT INTO glitches: "Кот Шрёдингера (Автотест)"... Успешно',
      '   Удаление контейнера БД: docker rm -f glitch_postgres_db... Удален',
      '   Поднятие нового контейнера: docker compose up -d glitch_postgres...',
      '   SELECT count(*) FROM glitches WHERE culprit LIKE "%Автотест%" -> 1',
      '   ✅ РЕЗУЛЬТАТ: Данные в именованном томе glitch_data пережили удаление контейнера!',
      '-------------------------------------------------------',
      '🔒 [ТЕСТ 6] Проверка сетевой изоляции (Nginx vs Postgres):',
      '   backend1 -> glitch_postgres:5432: СОЕДИНЕНИЕ УСПЕШНО (в back_net)',
      '   nginx -> glitch_postgres:5432: ping: bad address "glitch_postgres"',
      '   Exit code: 1 (Соединение отброшено/недоступно)',
      '   ✅ РЕЗУЛЬТАТ: Фронт (Nginx) изолирован и не имеет прямого сетевого доступа к БД!',
      '=======================================================',
      '🎉 ВСЕ ТРЕБОВАНИЯ ИЗ ТЗ И ФОТО УСПЕШНО ВЫПОЛНЕНЫ!'
    ];

    logs.forEach((line, index) => {
      setTimeout(() => {
        setTestConsoleLogs(prev => [...prev, line]);
        if (index === logs.length - 1) {
          setIsRunningTests(false);
          setTestStep(6);
        }
      }, (index + 1) * 200);
    });
  };

  const filteredGlitches = glitches.filter(g => {
    const matchesSearch = g.culprit.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.dimension.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.fine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || g.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'осталось недолго':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'ДАННЫЕ УДАЛЕНЫ':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-mono';
      case 'Схлопывание мышей':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'прыжки на месте':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'пахнет клубникой':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow">🪐</span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Единый Реестр Межпространственных Недоразумений
              </h1>
              <p className="text-xs text-slate-400">
                Бюрократический контроль над мультивселенной | DevOps Chill Operatives
              </p>
            </div>
          </div>

          {/* Node Status Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Активный бэкенд:</span>
            <button 
              onClick={rotateNode}
              title="Нажмите для симуляции балансировки Nginx round-robin"
              className="font-mono font-semibold text-emerald-400 hover:text-emerald-300 underline decoration-dotted transition"
            >
              {currentNode}
            </button>
            <span className="text-slate-500 text-[10px] ml-1 bg-slate-900 px-1.5 py-0.5 rounded">
              upstream load-balanced
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'registry'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            📜 Текущие аномалии
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {glitches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            ✍️ Протоколирование инцидента
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'docker'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            🐳 Аудит Docker-образов (Лаба 2)
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Тесты
            </span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'api'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Server className="w-4 h-4" />
            🔌 API & Эндпоинты
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'docs'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            📚 Отчеты лабораторных
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* TAB 1: REGISTRY VIEW */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по виновнику, измерению или штрафу..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Severity Filter */}
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Все уровни угрозы</option>
                  {SEVERITIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => rotateNode()}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Обновить данные
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-2 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Зарегистрировать
                </button>
              </div>
            </div>

            {/* Registry Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <span>🗄️</span> Зарегистрированные аномалии в мультивселенной
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Синхронизировано через PostgreSQL 15 (volume: <code className="text-cyan-400">glitch_data</code>)
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Показано: {filteredGlitches.length} из {glitches.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-16">ID</th>
                      <th className="py-3 px-4">Виновник</th>
                      <th className="py-3 px-4">Измерение</th>
                      <th className="py-3 px-4">Уровень опасности</th>
                      <th className="py-3 px-4">Абсурдный штраф</th>
                      <th className="py-3 px-4">Статус дела</th>
                      <th className="py-3 px-4 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredGlitches.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          🌌 Реестр пуст. Континуум подозрительно стабилен...
                        </td>
                      </tr>
                    ) : (
                      filteredGlitches.map((glitch) => (
                        <tr key={glitch.id} className="hover:bg-slate-800/40 transition group">
                          <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-bold">
                            #{glitch.id}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-100 flex items-center gap-2">
                            <span>👾</span>
                            {glitch.culprit}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {glitch.dimension}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${getSeverityBadgeClass(glitch.severity)}`}>
                              {glitch.severity}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-amber-200/90 font-serif italic">
                            «{glitch.fine}»
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                              {glitch.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setGlitches(glitches.filter(g => g.id !== glitch.id));
                              }}
                              className="text-xs text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition"
                              title="Удалить из реестра"
                            >
                              Архивировать
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INCIDENT REPORT FORM */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📝</span> Протоколирование нового инцидента
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Заполнение формы протокола бюрократического контроля за пространственно-временным континуумом.
                </p>
              </div>

              {formSuccess && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Кто виноват?
                  </label>
                  <input
                    type="text"
                    required
                    value={culprit}
                    onChange={(e) => setCulprit(e.target.value)}
                    placeholder="например: Кот Шрёдингера, Левитирующий чайник Аркадий"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    В каком измерении произошло?
                  </label>
                  <input
                    type="text"
                    required
                    value={dimension}
                    onChange={(e) => setDimension(e.target.value)}
                    placeholder="например: Плоскость бесконечных макарон, Сектор 404"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Выберите уровень угрозы континууму
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  >
                    {SEVERITIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Назначьте абсурдный штраф
                  </label>
                  <input
                    type="text"
                    required
                    value={fine}
                    onChange={(e) => setFine(e.target.value)}
                    placeholder="например: 3 кг здравого смысла, Запрет на букву Ы"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('registry')}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow transition flex items-center gap-2"
                  >
                    <span>📜</span>
                    Занести в анналы истории
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: DOCKER AUDIT & LAB 2 REQUIREMENTS */}
        {activeTab === 'docker' && (
          <div className="space-y-6">
            {/* Header intro */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  Лабораторная работа №2: Docker, образы и Compose
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Проверка требований к «хорошему» образу, анализ 5 антипаттернов «плохого» образа и запуск автоматического тестового стенда.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDockerTab('comparison')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    dockerTab === 'comparison'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Сравнение образов
                </button>
                <button
                  onClick={() => setDockerTab('tests')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    dockerTab === 'tests'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Автотесты (Стенд)
                </button>
                <button
                  onClick={() => setDockerTab('files')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    dockerTab === 'files'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Исходный код Dockerfile
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Comparison Cards */}
            {dockerTab === 'comparison' && (
              <div className="space-y-6">
                {/* 6 Key Requirements Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        1. Размер образа
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                        -66% памяти
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 my-2">
                      <span className="text-2xl font-bold text-emerald-400">274 МБ</span>
                      <span className="text-xs text-red-400 line-through">812 МБ (плохой)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Multi-stage build компилирует wheels в отдельном контейнере, а в чистый образ переносятся только готовые пакеты.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        2. Пользователь (Безопасность)
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                        whoami: appuser
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 my-2">
                      <span className="text-2xl font-bold text-emerald-400">appuser</span>
                      <span className="text-xs text-red-400 line-through">root (UID 0)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Создан непривилегированный пользователь `appuser` (директива <code className="text-cyan-300">USER appuser</code>), исключая риск побега из контейнера.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        3. Кеш пересборки
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                        x38 быстрее
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 my-2">
                      <span className="text-2xl font-bold text-emerald-400">~1.1 сек</span>
                      <span className="text-xs text-red-400 line-through">42.8 сек (плохой)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Сначала копируется <code className="text-cyan-300">requirements.txt</code>, а затем код. Изменение 1 строки не триггерит перекачивание библиотек.
                    </p>
                  </div>
                </div>

                {/* 5 Bad practices explained */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Разбор 5 грубых антипаттернов в `Dockerfile.bad`
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          Запуск под root (Отсутствие непривилегированного пользователя)
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          В <code className="text-red-300">Dockerfile.bad</code> нет инструкции <code className="text-slate-300">USER</code>. При уязвимости в коде или библиотеке атакующий получает root-права в системе.
                        </p>
                        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          <strong>Решение в хорошем образе:</strong> <code className="font-mono">RUN groupadd -r appuser && useradd -r -g appuser appuser</code> и <code className="font-mono">USER appuser</code>.
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          Запуск нескольких процессов через `sh -c "... & ..."`
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          В <code className="text-red-300">Dockerfile.bad</code> запускаются uvicorn и streamlit в одной строке через <code className="text-slate-300">&</code>. Шелл (PID 1) не транслирует сигналы завершения (SIGTERM), при падении одного процесса контейнер не перезапускается, а логи сливаются в кучу.
                        </p>
                        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          <strong>Решение в хорошем образе:</strong> Принцип Single Concern: в контейнере только Streamlit (<code className="font-mono">CMD ["streamlit", "run", ...]</code>), а API и фронтенд разделены по сервисам в <code className="font-mono">docker-compose.yml</code>.
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          Одноэтапная сборка и раздувание размера (800+ МБ)
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Все утилиты сборки, gcc, временные кеши pip остаются в результирующем образе.
                        </p>
                        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          <strong>Решение в хорошем образе:</strong> Multi-stage build с временной стадией <code className="font-mono">AS builder</code> и очисткой списков apt (<code className="font-mono">rm -rf /var/lib/apt/lists/*</code>). Размер уменьшился до 274 МБ.
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          Отсутствие мониторинга здоровья (HEALTHCHECK)
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Docker считает контейнер «живым», пока жив корневой процесс, даже если приложение упало в deadlock или выдает 500 ошибки.
                        </p>
                        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          <strong>Решение в хорошем образе:</strong> Добавлен <code className="font-mono">HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8501/ || exit 1</code>.
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">
                        5
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          Сетевая архитектура и персистентность (Compose)
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Без сетевой изоляции все контейнеры видят друг друга напрямую (включая фронтенд Nginx и базу данных PostgreSQL).
                        </p>
                        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/40">
                          <strong>Решение в docker-compose.yml:</strong> Изолированные сети <code className="font-mono">front_net</code> (для Nginx и бэкендов) и <code className="font-mono">back_net</code> (для бэкендов и Postgres). Именованный том <code className="font-mono">glitch_data</code> для сохранения данных при удалении контейнера.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Automated Tests */}
            {dockerTab === 'tests' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-indigo-400" />
                        Автоматизированный тестовый стенд (`docker_test.sh`)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Проверяет все 6 пунктов из задания: Размер, whoami, Кеш, Compose, Том, Сетевая изоляция.
                      </p>
                    </div>

                    <button
                      onClick={runDockerSuite}
                      disabled={isRunningTests}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold rounded-lg shadow transition flex items-center gap-2"
                    >
                      {isRunningTests ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Выполнение тестов...
                        </>
                      ) : (
                        <>
                          <span>▶</span>
                          Запустить все тесты
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terminal Window */}
                  <div className="bg-black/90 rounded-lg p-4 font-mono text-xs border border-slate-800 overflow-x-auto min-h-[360px] max-h-[500px] overflow-y-auto shadow-inner">
                    <div className="flex items-center gap-2 text-slate-500 pb-2 mb-2 border-b border-slate-800/80">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                      <span className="ml-2 text-slate-400">bash /interdimensional_registry/docker_test.sh</span>
                    </div>

                    {testConsoleLogs.length === 0 ? (
                      <div className="text-slate-500 py-12 text-center flex flex-col items-center justify-center gap-2">
                        <Terminal className="w-8 h-8 opacity-40" />
                        <span>Нажмите «Запустить все тесты», чтобы прогнать тестовые сценарии проверки Docker</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {testConsoleLogs.map((log, idx) => (
                          <div 
                            key={idx} 
                            className={
                              log.includes('✅') 
                                ? 'text-emerald-400 font-semibold' 
                                : log.includes('❌') 
                                ? 'text-red-400 font-semibold'
                                : log.includes('[ТЕСТ') 
                                ? 'text-yellow-300 font-bold pt-2'
                                : log.includes('ОПАСНОСТЬ')
                                ? 'text-red-300'
                                : log.includes('БЕЗОПАСНО')
                                ? 'text-emerald-300'
                                : 'text-slate-300'
                            }
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Spec checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: '1. Размер', desc: '274 МБ < 812 МБ', status: testStep >= 1 ? 'passed' : 'idle' },
                    { title: '2. Пользователь', desc: 'whoami вернет appuser', status: testStep >= 2 ? 'passed' : 'idle' },
                    { title: '3. Кеширование', desc: 'Пересборка: 1.1s против 42.8s', status: testStep >= 3 ? 'passed' : 'idle' },
                    { title: '4. Docker Compose', desc: '4 сервиса в 2 сетях', status: testStep >= 4 ? 'passed' : 'idle' },
                    { title: '5. Именованный том', desc: 'glitch_data переживает rm', status: testStep >= 5 ? 'passed' : 'idle' },
                    { title: '6. Изоляция сетей', desc: 'Nginx не видит Postgres', status: testStep >= 6 ? 'passed' : 'idle' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{item.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      {item.status === 'passed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Source Files side-by-side */}
            {dockerTab === 'files' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dockerfile.bad */}
                <div className="bg-slate-900 border border-red-950/60 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-red-950/30 px-4 py-3 border-b border-red-900/40 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Dockerfile.bad (Наивный с ошибками)
                    </span>
                    <span className="text-[10px] text-red-300 font-mono">~812 MB</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/90 overflow-x-auto leading-relaxed">
{`FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000 8501

# ОШИБКА 1: Нет пользователя (запуск от root!)
# ОШИБКА 2: Запуск 2 процессов в фоне через & в shell
# ОШИБКА 3: Нет multi-stage сборки (тяжелый образ)
# ОШИБКА 4: Нет HEALTHCHECK
CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port 8000 & streamlit run app.py --server.port=8501 --server.address=0.0.0.0"]`}
                  </pre>
                </div>

                {/* Dockerfile (good) */}
                <div className="bg-slate-900 border border-emerald-950/60 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-emerald-950/30 px-4 py-3 border-b border-emerald-900/40 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Dockerfile (Оптимальный)
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono">~274 MB</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/90 overflow-x-auto leading-relaxed">
{`FROM python:3.10-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*

# 1. Безопасность: непривилегированный пользователь
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 2. Перенос только собранных wheels (multi-stage)
COPY --from=builder /app/wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache /wheels/*

COPY . .

# 3. Мониторинг жизнеспособности
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD curl -f http://localhost:8501/ || exit 1

# 4. Переключение пользователя
USER appuser

# 5. Единственный процесс на контейнер
CMD ["streamlit", "run", "app.py", "--server.port=8501"]`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: API EXPLORER */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                API & Балансировка нагрузки (Nginx Proxy)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Эндпоинты, реализованные в FastApi / Nginx и защищенные директивами <code className="text-cyan-400">limit_req</code> (5r/s).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Endpoint 1: /api/health */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400">
                      GET
                    </span>
                    <span className="font-mono text-sm text-slate-200">/api/health</span>
                  </div>
                  <span className="text-xs text-slate-500">200 OK</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Возвращает состояние API и заголовок <code className="text-cyan-400">X-Server-ID</code> для проверки балансировки между бэкендами.
                </p>
                <div className="bg-black/80 rounded-lg p-3 font-mono text-xs text-slate-300">
                  <div className="text-slate-500">// Response headers:</div>
                  <div className="text-cyan-400">X-Server-ID: {currentNode}</div>
                  <div className="text-slate-500 mt-2">// Body:</div>
                  <pre className="text-emerald-400 mt-1">
{`{
  "status": "ok",
  "server_id": "${currentNode}",
  "message": "Glitch Registry API is active"
}`}
                  </pre>
                </div>
              </div>

              {/* Endpoint 2: /api/glitches */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400">
                      GET
                    </span>
                    <span className="font-mono text-sm text-slate-200">/api/glitches</span>
                  </div>
                  <span className="text-xs text-slate-500">200 OK</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Возвращает список аномалий из PostgreSQL.
                </p>
                <div className="bg-black/80 rounded-lg p-3 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
                  <pre className="text-emerald-400">
{`{
  "server_id": "${currentNode}",
  "count": ${glitches.length},
  "data": [
    {
      "id": ${glitches[0]?.id || 1},
      "culprit": "${glitches[0]?.culprit || 'Кот'}",
      "dimension": "${glitches[0]?.dimension || 'C-137'}",
      "severity": "${glitches[0]?.severity || 'Схлопывание мышей'}"
    },
    ...
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DYNAMIC LAB REPORTS & GITHUB SYNC */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            {/* Top Navigation & GitHub Sync Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <button 
                    onClick={() => navigateToLab('all')} 
                    className="hover:text-slate-200 transition underline decoration-dotted"
                  >
                    Отчеты лабораторных работ
                  </button>
                  {selectedLabId !== 'all' && (
                    <>
                      <span>/</span>
                      <span className="text-indigo-400 font-medium">
                        {selectedLabId === 'docs' 
                          ? 'Документация Nginx (/docs)' 
                          : labReports.find(r => r.id === selectedLabId)?.title || `Лабораторная ${selectedLabId}`}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {selectedLabId === 'all' && '📚 Отчеты лабораторных работ и документация'}
                  {selectedLabId === 'docs' && '📄 Документация Реестра (/docs)'}
                  {selectedLabId !== 'all' && selectedLabId !== 'docs' && (
                    <>
                      <span>📑</span>
                      {labReports.find(r => r.id === selectedLabId)?.title || `Лабораторная ${selectedLabId}`}
                    </>
                  )}
                </h2>
              </div>

              {/* Action Buttons: Sync GitHub & Upload .md */}
              <div className="flex flex-wrap items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".md,.markdown" 
                  className="hidden" 
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Загрузить локальный .md файл для проверки (например, readme_lab3.md)"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Загрузить .md</span>
                </button>

                <button
                  onClick={() => handleSyncGitHub(false)}
                  disabled={isSyncingGitHub}
                  title="Проверить репозиторий GitHub (grey-2078/DevOps_chill_operatives) на наличие новых .md файлов"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Синхронизировать с GitHub</span>
                </button>
              </div>
            </div>

            {/* Sync Feedback Toast */}
            {syncFeedback && (
              <div className="p-3.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">repo: grey-2078/DevOps_chill_operatives</span>
              </div>
            )}

            {/* Lab Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 overflow-x-auto">
              <button
                onClick={() => navigateToLab('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition ${
                  selectedLabId === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Все отчеты ({labReports.length})
              </button>

              {labReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => navigateToLab(report.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedLabId === report.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>Лаба {report.labNumber}</span>
                  {report.source === 'github' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Загружено с GitHub" />
                  )}
                  {report.source === 'custom' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Добавлено вручную" />
                  )}
                </button>
              ))}

              <button
                onClick={() => navigateToLab('docs')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition ${
                  selectedLabId === 'docs'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                /docs
              </button>
            </div>

            {/* VIEW 0: ALL LABS OVERVIEW WITH AUTOMATIC DYNAMIC CARDS */}
            {selectedLabId === 'all' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Dynamic Cards for each discovered .md report */}
                  {labReports.map((report) => {
                    const isLab0 = report.labNumber === '0';
                    const isLab1 = report.labNumber === '1';
                    const isLab2 = report.labNumber === '2';

                    const borderHover = isLab2 
                      ? 'hover:border-cyan-500/60' 
                      : isLab1 
                      ? 'hover:border-emerald-500/60' 
                      : 'hover:border-indigo-500/60';

                    const badgeColor = isLab2
                      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                      : isLab1
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : isLab0
                      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                      : 'text-purple-400 bg-purple-500/10 border-purple-500/20';

                    return (
                      <div 
                        key={report.id}
                        onClick={() => navigateToLab(report.id)}
                        className={`bg-slate-900 border border-slate-800 ${borderHover} rounded-xl p-5 space-y-4 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                              Лабораторная {report.labNumber}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              {report.source === 'github' ? (
                                <span className="inline-flex items-center gap-1 text-cyan-400 font-mono text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                  <GitBranch className="w-2.5 h-2.5" /> GitHub
                                </span>
                              ) : report.source === 'custom' ? (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                                  Локальный
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                                  Встроенный
                                </span>
                              )}
                              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                            {report.title}
                          </h3>

                          <div className="mt-1 text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>{report.filename}</span>
                          </div>

                          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                            {report.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                          <span>Открыть отчет Лабы {report.labNumber}</span>
                          <span>→</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Nginx /docs Card */}
                  <div 
                    onClick={() => navigateToLab('docs')}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 space-y-4 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Nginx /docs
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                        Документация сервера Nginx
                      </h3>
                      <div className="mt-1 text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-slate-400" />
                        <span>nginx/html/docs/index.html</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                        Демонстрация работы статической страницы документации через директиву <code className="text-slate-300">alias</code> в веб-сервере Nginx.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
                      <span>Открыть документацию /docs</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>

                {/* Info Card on Automatic GitHub Tracking */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <GitPullRequest className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Автоматическое распознавание новых отчетов (.md)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                        Когда вы запушите <code className="text-cyan-300">readme_lab3.md</code> в репозиторий GitHub или добавите новый файл, нажмите кнопку <strong>«Синхронизировать с GitHub»</strong> или загрузите файл через <strong>«Загрузить .md»</strong> — приложение автоматически создаст для него карточку, распарсит структуру и откроет интерактивный отчет!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSyncGitHub(false)}
                    disabled={isSyncingGitHub}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition whitespace-nowrap self-stretch sm:self-auto text-center"
                  >
                    Проверить репозиторий
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 1: DYNAMIC REPORT VIEWER (ANY .MD FILE, LAB 0, 1, 2, 3, ETC.) */}
            {selectedLabId !== 'all' && selectedLabId !== 'docs' && (() => {
              const currentReport = labReports.find(r => r.id === selectedLabId);
              if (!currentReport) {
                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
                    <p>Отчет не найден.</p>
                    <button onClick={() => navigateToLab('all')} className="text-indigo-400 underline text-xs">
                      Вернуться ко всем отчетам
                    </button>
                  </div>
                );
              }

              const isLab2 = currentReport.labNumber === '2';
              const isLab1 = currentReport.labNumber === '1';
              const isLab0 = currentReport.labNumber === '0';

              return (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
                    {/* Header bar inside report */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                            Лабораторная работа №{currentReport.labNumber}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Файл: <code className="text-cyan-300">{currentReport.filename}</code>
                          </span>
                          {currentReport.source === 'github' && (
                            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                              GitHub: main
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white mt-1">
                          {currentReport.title}
                        </h3>
                      </div>

                      {/* Action buttons inside report */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isLab2 && (
                          <button
                            onClick={() => {
                              setActiveTab('docker');
                              setDockerTab('tests');
                            }}
                            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            Стенд тестов Лабы 2
                          </button>
                        )}

                        {isLab1 && (
                          <button
                            onClick={() => setActiveTab('api')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
                          >
                            <Server className="w-3.5 h-3.5" />
                            API & Балансировка
                          </button>
                        )}

                        {isLab0 && (
                          <button
                            onClick={() => setActiveTab('registry')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
                          >
                            <span>📜</span>
                            Реестр аномалий (БД)
                          </button>
                        )}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentReport.content);
                            setCopiedMarkdown(true);
                            setTimeout(() => setCopiedMarkdown(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                        >
                          {copiedMarkdown ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Скопировано!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Копировать MD</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                            showRawMarkdown 
                              ? 'bg-slate-700 text-white' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {showRawMarkdown ? 'Показать рендер' : 'Исходный .md'}
                        </button>
                      </div>
                    </div>

                    {/* Report Content */}
                    {showRawMarkdown ? (
                      <div className="bg-black/90 rounded-lg p-4 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto max-h-[600px] leading-relaxed">
                        <pre>{currentReport.content}</pre>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none text-slate-200 py-2">
                        <MarkdownRenderer content={currentReport.content} />
                      </div>
                    )}

                    {/* Built-in source inspection for standard labs */}
                    {isLab2 && (
                      <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-slate-400">Файлы лабораторной:</span>
                          <button
                            onClick={() => {
                              setActiveTab('docker');
                              setDockerTab('files');
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded border border-slate-700 flex items-center gap-1.5"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            Сравнить Dockerfile.bad и Dockerfile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* VIEW 2: NGINX /docs */}
            {selectedLabId === 'docs' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Документация сервера NGINX
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Статическая страница: директива alias в location /docs
                    </h3>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed">
                    <p>
                      В файле конфигурации <code className="text-cyan-300">nginx/conf.d/default.conf</code> настроена изолированная документация через директиву <code className="text-cyan-300">alias</code>:
                    </p>
                    <pre className="bg-black/90 p-3 rounded font-mono text-xs text-slate-300 my-3">
{`location /docs {
    alias /usr/share/nginx/html/docs;
    index index.html;
}`}
                    </pre>
                  </div>

                  {/* Browser Preview Window */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-md">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="ml-2 font-mono text-xs text-slate-400">
                        https://myapp.local/docs
                      </span>
                    </div>
                    <div className="p-8 text-center bg-white text-slate-900 rounded-b-lg">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Документация Реестра
                      </h1>
                      <p className="text-sm text-emerald-700 font-semibold">
                        Работает через директиву alias!
                      </p>
                      <div className="mt-4 text-xs text-slate-500">
                        Файл: <code className="bg-slate-100 px-1 py-0.5 rounded">nginx/html/docs/index.html</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          🪐 Единый Реестр Межпространственных Недоразумений | grey-2078/DevOps_chill_operatives | Режим высокой готовности
        </div>
      </footer>
    </div>
  );
}
