/*
  # Insert Initial Sample Data
  
  This script inserts sample members, chamas, and settings
  to get started with the application.
*/

-- Insert default settings first
INSERT INTO settings (due_date) 
VALUES (CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Insert sample chama groups
INSERT INTO chamas (name, due_date, amount_expected) VALUES
  ('Weekly Savings Chama', CURRENT_DATE + INTERVAL '7 days', 1000),
  ('Monthly Investment Group', CURRENT_DATE + INTERVAL '30 days', 5000),
  ('Emergency Fund Chama', CURRENT_DATE + INTERVAL '14 days', 2000)
ON CONFLICT DO NOTHING;

-- Insert initial sample members
INSERT INTO members (name, phone_number, has_paid) VALUES
  ('Alice Wanjiku', '+254712345678', true),
  ('John Kimani', '+254723456789', false),
  ('Mary Achieng', '+254734567890', true),
  ('Peter Mwangi', '+254745678901', false),
  ('Grace Njeri', '+254756789012', true),
  ('David Ochieng', '+254767890123', false),
  ('Sarah Wanjiru', '+254778901234', false),
  ('James Kiprotich', '+254789012345', true),
  ('Lucy Nyambura', '+254790123456', false),
  ('Michael Omondi', '+254701234567', true)
ON CONFLICT (phone_number) DO NOTHING;
