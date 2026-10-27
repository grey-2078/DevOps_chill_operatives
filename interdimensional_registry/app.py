import glob
import os
import re
import db_manager
import streamlit as st

SERVER_ID = os.getenv("SERVER_ID", "standalone-instance")

st.set_page_config(
    page_title="Реестр Межпространственных Недоразумений",
    page_icon="🪐",
    layout="wide",
)

if "db_initialized" not in st.session_state:
  db_manager.init_db()
  st.session_state["db_initialized"] = True

if "selected_lab_report" not in st.session_state:
  st.session_state["selected_lab_report"] = None

st.title("🪐 ЕДИНЫЙ РЕЕСТР МЕЖПРОСТРАНСТВЕННЫХ НЕДОРАЗУМЕНИЙ")
st.caption(
    f"Бюрократический контроль над мультивселенной | 🖥️ **Инстанс: {SERVER_ID}**"
)

st.sidebar.title("Информация об узле")
st.sidebar.info(f"Текущий бэкенд: **{SERVER_ID}**")
st.sidebar.markdown("---")
st.sidebar.caption("Навигация по модулям:")
st.sidebar.markdown(
    "- 📜 Текущие аномалии\n"
    "- ✍️ Протоколирование\n"
    "- 🐳 Аудит Docker (Лаба 2)\n"
    "- 🔌 API & Эндпоинты\n"
    "- 📚 Отчеты лабораторных"
)

tab_view, tab_add, tab_docker, tab_api, tab_docs = st.tabs([
    "📜 Текущие аномалии",
    "✍️ Протоколирование инцидента",
    "🐳 Аудит Docker-образов (Лаба 2)",
    "🔌 API & Эндпоинты",
    "📚 Отчеты лабораторных",
])

# 1. ПРОСМОТР РЕЕСТРА
with tab_view:
  st.subheader("🗄 Текущие аномалии в мультивселенной")

  if st.button("🔄 Обновить данные", type="secondary"):
    st.rerun()

  records = db_manager.get_all_registry()

  if not records:
    st.warning("🌌 Реестр пуст. Континуум подозрительно стабилен...")
  else:
    table_data = []
    for row in records:
      g_id, culprit, dimension, severity, fine, status = row
      table_data.append({
          "ID": g_id,
          "Виновник": culprit,
          "Измерение": dimension,
          "Уровень опасности": severity,
          "Абсурдный штраф": fine if fine else "Не назначен",
          "Статус дела": status if status else "—",
      })

    st.dataframe(table_data, use_container_width=True, hide_index=True)

# 2. РЕГИСТРАЦИЯ АНОМАЛИИ
with tab_add:
  st.subheader("📝 Протоколирование нового инцидента")

  with st.form("glitch_form", clear_on_submit=True):
    culprit = st.text_input(
        "Кто виноват?",
        placeholder="например: Кот Шрёдингера, Левитирующий чайник Аркадий",
    )
    dimension = st.text_input(
        "В каком измерении произошло?",
        placeholder="например: Плоскость бесконечных макарон",
    )

    severities = [
        "потные ладошки",
        "пахнет клубникой",
        "Схлопывание мышей",
        "прыжки на месте",
        "ДАННЫЕ УДАЛЕНЫ",
        "осталось недолго",
    ]
    severity = st.selectbox(
        "Выберите уровень угрозы континууму", options=severities
    )

    fine_cost = st.text_input(
        "Назначьте абсурдный штраф",
        placeholder="например: 3 кг здравого смысла, Запрет на букву Ы",
    )

    submit_btn = st.form_submit_button(
        "Занести в анналы истории", type="primary"
    )

    if submit_btn:
      if not culprit or not dimension or not fine_cost:
        st.error("⚠️ Пожалуйста, заполните все поля протокола!")
      else:
        glitch_id = db_manager.add_glitch(culprit, dimension, severity)

        if glitch_id:
          if db_manager.issue_bureaucratic_action(glitch_id, fine_cost):
            st.success(f"✅ Протокол №{glitch_id} успешно зарегистрирован!")
            st.info(
                "Перейдите на вкладку 'Текущие аномалии', чтобы увидеть запись."
            )
        else:
          st.error("❌ Сбой матрицы. Данные рассеялись в пустоте.")

# 3. АУДИТ DOCKER-ОБРАЗОВ (ЛАБА 2)
with tab_docker:
  st.subheader("🐳 Лабораторная работа №2: Аудит Docker-образов и Compose")
  col1, col2, col3 = st.columns(3)
  col1.metric("1. Размер образа", "274 МБ", "-538 МБ (плохой: 812 МБ)")
  col2.metric("2. Пользователь (whoami)", "appuser", "Безопасно (не root)")
  col3.metric("3. Кеш пересборки", "1.1 сек", "в 38 раз быстрее (плохой: 42.8с)")

  st.markdown("### Разбор антипаттернов `Dockerfile.bad` и исправлений в `Dockerfile`")
  st.info(
      "1. **Запуск от root** -> Исправлено созданием системного пользователя `USER appuser`.\n"
      "2. **Два процесса через `&` в shell** -> Разделено на отдельные сервисы в `docker-compose.yml`.\n"
      "3. **Отсутствие Multi-stage сборки** -> Добавлен этап `AS builder` для сборки wheels.\n"
      "4. **Отсутствие HEALTHCHECK** -> Добавлена проверка `curl -f http://localhost:8501/`.\n"
      "5. **Сетевая изоляция и том** -> Разделены сети `front_net` и `back_net`, данные хранятся в томе `glitch_data`."
  )

# 4. API & ЭНДПОИНТЫ
with tab_api:
  st.subheader("🔌 API & Балансировка нагрузки (Nginx Proxy)")
  st.markdown("Эндпоинты защищены директивой `limit_req` (5r/s) в Nginx:")
  st.code(
      f'GET /api/health\nX-Server-ID: {SERVER_ID}\n\n{{\n  "status": "ok",\n  "server_id": "{SERVER_ID}",\n  "message": "Glitch Registry API is active"\n}}',
      language="json",
  )

# 5. ОТЧЕТЫ ЛАБОРАТОРНЫХ (ДИНАМИЧЕСКОЕ ЧТЕНИЕ ВСЕХ .MD ФАЙЛОВ)
with tab_docs:
  st.subheader("📚 База знаний и отчеты по лабораторным работам")
  st.caption(
      "Все файлы `readme_lab*.md` автоматически обнаруживаются и получают собственные интерактивные карточки."
  )

  md_files = sorted(glob.glob("readme_lab*.md") + glob.glob("../*.md"))
  lab_files = [f for f in md_files if os.path.isfile(f)]

  if st.session_state["selected_lab_report"]:
    selected_path = st.session_state["selected_lab_report"]
    if st.button("← Вернуться ко всем отчетам"):
      st.session_state["selected_lab_report"] = None
      st.rerun()

    if os.path.isfile(selected_path):
      with open(selected_path, "r", encoding="utf-8") as f:
        st.markdown(f.read())
  else:
    cols = st.columns(3)
    for idx, filepath in enumerate(lab_files):
      filename = os.path.basename(filepath)
      with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
      match = re.search(r"lab(\d+)", filename, re.IGNORECASE)
      badge = f"Лабораторная {match.group(1)}" if match else filename
      lines = [
          line.strip()
          for line in content.splitlines()
          if line.strip() and not line.strip().startswith("#")
      ]
      summary = lines[0][:140] + "..." if lines else "Отчет лабораторной работы"

      with cols[idx % 3]:
        with st.container(border=True):
          st.caption(f"📌 **{badge}** (`{filename}`)")
          st.markdown(f"**{badge}**")
          st.write(summary)
          if st.button(f"Открыть {badge} →", key=f"btn_{filename}"):
            st.session_state["selected_lab_report"] = filepath
            st.rerun()