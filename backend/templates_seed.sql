-- Създаване на примерни templates
INSERT INTO templates (id, name, description, config, active, created_at, updated_at) VALUES
('tpl_restaurant_classic', 'Класически ресторант', 'Подходящ за традиционни ресторанти и бистра', '{"theme": "classic", "colors": {"primary": "#8B4513", "secondary": "#F5E6D3"}}', true, NOW(), NOW()),
('tpl_fastfood_modern', 'Модерен фаст фуд', 'Подходящ за бургерни, пицарии и заведения за бързо хранене', '{"theme": "modern", "colors": {"primary": "#FF6B35", "secondary": "#F7F7F7"}}', true, NOW(), NOW()),
('tpl_cafe_cozy', 'Уютно кафене', 'Подходящ за кафенета, пекарни и заведения за закуски', '{"theme": "cozy", "colors": {"primary": "#6F4E37", "secondary": "#FFF8DC"}}', true, NOW(), NOW()),
('tpl_fine_dining', 'Изискан ресторант', 'Подходящ за луксозни ресторанти с висока кухня', '{"theme": "elegant", "colors": {"primary": "#2C1810", "secondary": "#F8F6F0"}}', true, NOW(), NOW());

-- Създаване на template категории
INSERT INTO template_categories (id, name, description, "order", template_id, created_at, updated_at) VALUES
-- За класическия ресторант
(1, 'Предястия', 'Традиционни предястия и салати', 1, 'tpl_restaurant_classic', NOW(), NOW()),
(2, 'Основни ястия', 'Месни и рибни специалитети', 2, 'tpl_restaurant_classic', NOW(), NOW()),
(3, 'Десерти', 'Сладкиши и домашни десерти', 3, 'tpl_restaurant_classic', NOW(), NOW()),
(4, 'Напитки', 'Алкохолни и безалкохолни напитки', 4, 'tpl_restaurant_classic', NOW(), NOW()),

-- За модерния фаст фуд
(5, 'Бургери', 'Различни видове бургери', 1, 'tpl_fastfood_modern', NOW(), NOW()),
(6, 'Пици', 'Класически и специални пици', 2, 'tpl_fastfood_modern', NOW(), NOW()),
(7, 'Допълнения', 'Картофи, салати и други допълнения', 3, 'tpl_fastfood_modern', NOW(), NOW()),
(8, 'Напитки', 'Студени и топли напитки', 4, 'tpl_fastfood_modern', NOW(), NOW()),

-- За уютното кафене
(9, 'Кафе и чай', 'Специални кафета и чайове', 1, 'tpl_cafe_cozy', NOW(), NOW()),
(10, 'Сладкиши', 'Домашни торти и кексчета', 2, 'tpl_cafe_cozy', NOW(), NOW()),
(11, 'Закуски', 'Сандвичи и леки ястия', 3, 'tpl_cafe_cozy', NOW(), NOW());