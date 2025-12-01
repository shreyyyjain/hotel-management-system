-- Flyway V1: Initial schema for Hotel Management
-- Idempotent DDL so it can run alongside existing dev schemas

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  room_number INTEGER NOT NULL UNIQUE,
  room_type VARCHAR(100) NOT NULL,
  price_per_night NUMERIC(19,2) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  version BIGINT
);

CREATE TABLE IF NOT EXISTS food_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(100) NOT NULL,
  price NUMERIC(19,2) NOT NULL,
  image_url VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  food_quantities TEXT,
  total_amount NUMERIC(19,2) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS booking_rooms (
  booking_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  PRIMARY KEY (booking_id, room_id),
  CONSTRAINT fk_booking_rooms_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_rooms_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking_food_items (
  booking_id BIGINT NOT NULL,
  food_item_id BIGINT NOT NULL,
  PRIMARY KEY (booking_id, food_item_id),
  CONSTRAINT fk_booking_food_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_food_item FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms (available);
CREATE INDEX IF NOT EXISTS idx_food_items_cuisine ON food_items (cuisine);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room ON booking_rooms (room_id);
CREATE INDEX IF NOT EXISTS idx_booking_food_items_food ON booking_food_items (food_item_id);

COMMIT;
