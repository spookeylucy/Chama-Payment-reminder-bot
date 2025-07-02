/*
  # Insert Additional Chama Groups and Sample Payments
  
  This script adds more chama groups and creates sample payments
  for members who have paid.
*/

-- Insert additional chama groups
INSERT INTO chamas (name, due_date, amount_expected) VALUES
  ('Nairobi Business Chama', CURRENT_DATE + INTERVAL '14 days', 2000),
  ('Mombasa Traders Group', CURRENT_DATE + INTERVAL '21 days', 1500),
  ('Kisumu Women Empowerment', CURRENT_DATE + INTERVAL '10 days', 1200),
  ('Eldoret Farmers Chama', CURRENT_DATE + INTERVAL '30 days', 3000),
  ('Nakuru Youth Savings', CURRENT_DATE + INTERVAL '7 days', 800)
ON CONFLICT DO NOTHING;

-- Insert additional settings for different chamas
INSERT INTO settings (due_date) VALUES 
  (CURRENT_DATE + INTERVAL '14 days'),
  (CURRENT_DATE + INTERVAL '21 days'),
  (CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;
