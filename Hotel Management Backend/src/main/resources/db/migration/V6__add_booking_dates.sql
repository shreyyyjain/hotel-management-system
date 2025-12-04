-- Add check-in and check-out dates to bookings
BEGIN;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS check_in_date DATE,
ADD COLUMN IF NOT EXISTS check_out_date DATE;

-- Set defaults for existing bookings (current date and next day)
UPDATE bookings 
SET check_in_date = CURRENT_DATE,
    check_out_date = CURRENT_DATE + INTERVAL '1 day'
WHERE check_in_date IS NULL;

COMMIT;
