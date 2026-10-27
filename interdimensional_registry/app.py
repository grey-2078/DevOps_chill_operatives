import os
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

st.title("🪐 ЕДИНЫЙ РЕЕСТР МЕЖПРОСТРАНСТВЕННЫХ НЕДОРАЗУМЕНИЙ")
st.caption(
    f"Бюрократический контроль над мультивселенной | 🖥️ **Инстанс: {SERVER_ID}**"
)

st.sidebar.title("Информация об узле")
st.sidebar.info(f"Текущий бэкенд: **{SERVER_ID}**")

tab_view, tab_add = st.tabs(
    ["📜 Текущие аномалии", "✍️ Протоколирование инцидента"]
)

# ПРОСМОТР РЕЕСТРА
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

# РЕГИСТРАЦИЯ АНОМАЛИИ
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