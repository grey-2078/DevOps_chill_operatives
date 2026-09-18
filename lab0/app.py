import streamlit as st
import db_manager

# Настройка страницы (вкладка браузера)
st.set_page_config(
    page_title="Реестр Межпространственных Недоразумений",
    page_icon="🪐",
    layout="wide"
)

# Инициализируем базу данных при первом запуске
if 'db_initialized' not in st.session_state:
    db_manager.init_db()
    st.session_state['db_initialized'] = True

# Шапка сайта
st.title("🪐 ЕДИНЫЙ РЕЕСТР МЕЖПРОСТРАНСТВЕННЫХ НЕДОРАЗУМЕНИЙ")
st.caption("Бюрократический контроль над мультивселенной")

# Разделение интерфейса на две вкладки (Просмотр и Добавление)
tab_view, tab_add = st.tabs(["📜 Текущие аномалии", "✍️ Протоколирование инцидента"])

# --- ВКЛАДКА 1: ПРОСМОТР РЕЕСТРА ---
with tab_view:
    st.subheader("🗄 Текущие аномалии в мультивселенной")

    # Кнопка принудительного обновления данных
    if st.button("🔄 Обновить данные", type="secondary"):
        st.rerun()

    records = db_manager.get_all_registry()

    if not records:
        st.warning("🌌 Реестр пуст. Континуум подозрительно стабилен...")
    else:
        # Формируем структуру таблицы для отображения
        table_data = []
        for row in records:
            g_id, culprit, dimension, severity, fine, status = row
            table_data.append({
                "ID": g_id,
                "Виновник": culprit,
                "Измерение": dimension,
                "Уровень опасности": severity,
                "Абсурдный штраф": fine if fine else "Не назначен",
                "Статус дела": status if status else "—"
            })

        # Красивый интерактивный вывод таблицы с поиском и сортировкой
        st.dataframe(table_data, use_container_width=True, hide_index=True)

# --- ВКЛАДКА 2: РЕГИСТРАЦИЯ АНОМАЛИИ ---
with tab_add:
    st.subheader("📝 Протоколирование нового инцидента")

    # Создаем форму, чтобы данные отправлялись одной кнопкой
    with st.form("glitch_form", clear_on_submit=True):
        culprit = st.text_input("Кто виноват?", placeholder="например: Кот Шрёдингера, Левитирующий чайник Аркадий")
        dimension = st.text_input("В каком измерении произошло?", placeholder="например: Плоскость бесконечных макарон")

        severities = [
            "потные ладошки",
            "пахнет клубникой",
            "Схлопывание мышей",
            "прыжки на месте",
            "ДАННЫЕ УДАЛЕНЫ",
            "осталось недолго"
        ]
        severity = st.selectbox("Выберите уровень угрозы континууму", options=severities)

        fine_cost = st.text_input("Назначьте абсурдный штраф",
                                  placeholder="например: 3 кг здравого смысла, Запрет на букву Ы")

        submit_btn = st.form_submit_button("Занести в анналы истории", type="primary")

        if submit_btn:
            if not culprit or not dimension or not fine_cost:
                st.error("⚠️ Пожалуйста, заполните все поля протокола!")
            else:
                # 1. Сохраняем аномалию в базу
                glitch_id = db_manager.add_glitch(culprit, dimension, severity)

                if glitch_id:
                    # 2. Привязываем наказание
                    if db_manager.issue_bureaucratic_action(glitch_id, fine_cost):
                        st.success(f"✅ Протокол №{glitch_id} успешно зарегистрирован!")
                        # Предлагаем переключиться на вкладку просмотра
                        st.info("Перейдите на вкладку 'Текущие аномалии', чтобы увидеть запись.")
                else:
                    st.error("❌ Сбой матрицы. Данные рассеялись в пустоте.")
