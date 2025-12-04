-- Remove duplicate food items
BEGIN;

-- Delete all duplicates, keeping only one of each
DELETE FROM food_items 
WHERE name IN ('Butter Chicken', 'Caesar Salad', 'Chow Mein', 'Kung Pao Chicken', 'Margherita Pizza', 'Pad Thai', 'Pasta Carbonara');

-- Re-insert unique items with correct pricing
INSERT INTO food_items (name, cuisine, price) VALUES
('Butter Chicken', 'Indian', 450),
('Caesar Salad', 'Continental', 350),
('Chow Mein', 'Chinese', 350),
('Kung Pao Chicken', 'Chinese', 420),
('Margherita Pizza', 'Italian', 480),
('Pad Thai', 'Thai', 420),
('Pasta Carbonara', 'Italian', 520)
ON CONFLICT DO NOTHING;

COMMIT;
