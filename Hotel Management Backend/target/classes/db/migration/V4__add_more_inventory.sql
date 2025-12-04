-- Add more rooms and food items
BEGIN;

-- Add more rooms (assuming existing rooms go up to 21)
INSERT INTO rooms (room_number, room_type, price_per_night, available) VALUES
(122, 'SINGLE', 2500, true),
(123, 'SINGLE', 2500, true),
(124, 'SINGLE', 2500, true),
(125, 'SINGLE', 2500, true),
(201, 'DOUBLE', 4500, true),
(202, 'DOUBLE', 4500, true),
(203, 'DOUBLE', 4500, true),
(204, 'DOUBLE', 4500, true),
(205, 'DOUBLE', 4500, true),
(301, 'DELUXE', 7500, true),
(302, 'DELUXE', 7500, true),
(303, 'DELUXE', 7500, true),
(304, 'DELUXE', 7500, true),
(305, 'DELUXE', 7500, true),
(401, 'SUITE', 12000, true),
(402, 'SUITE', 12000, true),
(403, 'SUITE', 12000, true),
(404, 'SUITE', 12000, true),
(501, 'PRESIDENTIAL', 25000, true),
(502, 'PRESIDENTIAL', 25000, true)
ON CONFLICT (room_number) DO NOTHING;

-- Add more food items with diverse cuisines
INSERT INTO food_items (name, cuisine, price) VALUES
-- Indian
('Butter Chicken', 'Indian', 450),
('Paneer Tikka Masala', 'Indian', 380),
('Dal Makhani', 'Indian', 280),
('Biryani', 'Indian', 420),
('Tandoori Chicken', 'Indian', 480),
('Naan Bread', 'Indian', 80),
('Raita', 'Indian', 120),

-- Chinese
('Kung Pao Chicken', 'Chinese', 420),
('Sweet and Sour Pork', 'Chinese', 450),
('Chow Mein', 'Chinese', 350),
('Fried Rice', 'Chinese', 280),
('Spring Rolls', 'Chinese', 220),
('Manchurian', 'Chinese', 320),

-- Italian
('Margherita Pizza', 'Italian', 480),
('Pasta Carbonara', 'Italian', 520),
('Lasagna', 'Italian', 580),
('Risotto', 'Italian', 550),
('Tiramisu', 'Italian', 320),
('Bruschetta', 'Italian', 280),

-- Mexican
('Tacos', 'Mexican', 380),
('Burrito', 'Mexican', 450),
('Quesadilla', 'Mexican', 420),
('Nachos', 'Mexican', 350),
('Enchiladas', 'Mexican', 480),

-- Continental
('Grilled Chicken', 'Continental', 550),
('Beef Steak', 'Continental', 880),
('Fish and Chips', 'Continental', 620),
('Caesar Salad', 'Continental', 350),
('French Fries', 'Continental', 180),
('Garlic Bread', 'Continental', 150),

-- Thai
('Pad Thai', 'Thai', 420),
('Green Curry', 'Thai', 480),
('Tom Yum Soup', 'Thai', 350),
('Thai Fried Rice', 'Thai', 380),

-- Desserts
('Chocolate Brownie', 'Continental', 280),
('Ice Cream Sundae', 'Continental', 320),
('Gulab Jamun', 'Indian', 180),
('Cheesecake', 'Continental', 380),

-- Beverages
('Fresh Juice', 'Continental', 180),
('Coffee', 'Continental', 120),
('Tea', 'Indian', 80),
('Mocktail', 'Continental', 250)
ON CONFLICT DO NOTHING;

COMMIT;
