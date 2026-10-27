-- Создаем таблицы только если они еще не существуют (чтобы сохранять данные в volume glitch_data!)
CREATE TABLE IF NOT EXISTS glitches (
    id SERIAL PRIMARY KEY,
    culprit VARCHAR(255) NOT NULL,
    dimension VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('потные ладошки', 'пахнет клубникой', 'Схлопывание мышей', 'прыжки на месте', 'ДАННЫЕ УДАЛЕНЫ', 'осталось недолго')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bureaucratic_actions (
    id SERIAL PRIMARY KEY,
    glitch_id INT REFERENCES glitches(id) ON DELETE CASCADE,
    fine_cost VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Совет мудрых жаб' CHECK (status IN ('Совет мудрых жаб', 'Забыто под ковром', 'Квантовый парадокс')),
    resolved_at TIMESTAMP
);

-- Начальные записи реестра (добавляются только если таблица пуста)
DO $$
DECLARE
    new_id INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM glitches LIMIT 1) THEN
        INSERT INTO glitches (culprit, dimension, severity)
        VALUES ('Кот Шрёдингера', 'Суперпозиция C-137', 'Схлопывание мышей')
        RETURNING id INTO new_id;
        INSERT INTO bureaucratic_actions (glitch_id, fine_cost, status)
        VALUES (new_id, '3 кг здравого смысла', 'Совет мудрых жаб');

        INSERT INTO glitches (culprit, dimension, severity)
        VALUES ('Левитирующий чайник Аркадий', 'Плоскость бесконечных макарон', 'пахнет клубникой')
        RETURNING id INTO new_id;
        INSERT INTO bureaucratic_actions (glitch_id, fine_cost, status)
        VALUES (new_id, 'Запрет на букву Ы на 300 лет', 'Забыто под ковром');

        INSERT INTO glitches (culprit, dimension, severity)
        VALUES ('Фотон-дезертир', 'Зеркальный сектор 9', 'прыжки на месте')
        RETURNING id INTO new_id;
        INSERT INTO bureaucratic_actions (glitch_id, fine_cost, status)
        VALUES (new_id, 'Замедление до скорости улитки', 'Квантовый парадокс');

        INSERT INTO glitches (culprit, dimension, severity)
        VALUES ('Некто в пальто из темной материи', 'Измерение нулевого градиента', 'ДАННЫЕ УДАЛЕНЫ')
        RETURNING id INTO new_id;
        INSERT INTO bureaucratic_actions (glitch_id, fine_cost, status)
        VALUES (new_id, 'Пожизненный просмотр рекламы утюгов', 'Совет мудрых жаб');
    END IF;
END $$;
