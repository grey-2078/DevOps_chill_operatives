-- Принудительно сносим старые таблицы
DROP TABLE IF EXISTS bureaucratic_actions CASCADE;
DROP TABLE IF EXISTS glitches CASCADE;

-- Таблица аномалий с твоими новыми статусами угрозы
CREATE TABLE glitches (
    id SERIAL PRIMARY KEY,
    culprit VARCHAR(255) NOT NULL,
    dimension VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('потные ладошки', 'пахнет клубникой', 'Схлопывание мышей', 'прыжки на месте', 'ДАННЫЕ УДАЛЕНЫ', 'осталось недолго')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица мер наказания
CREATE TABLE bureaucratic_actions (
    id SERIAL PRIMARY KEY,
    glitch_id INT REFERENCES glitches(id) ON DELETE CASCADE,
    fine_cost VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Совет мудрых жаб' CHECK (status IN ('Совет мудрых жаб', 'Забыто под ковром', 'Квантовый парадокс')),
    resolved_at TIMESTAMP
);
