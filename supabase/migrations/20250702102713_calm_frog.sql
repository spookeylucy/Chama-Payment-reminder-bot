/*
  # Chama Management System Database Schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone_number` (text, unique)
      - `has_paid` (boolean, default false)
      - `created_at` (timestamp)
    - `chamas`
      - `id` (uuid, primary key)
      - `name` (text)
      - `due_date` (date)
      - `amount_expected` (numeric, default 1000)
      - `created_at` (timestamp)
    - `payments`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key)
      - `amount` (numeric)
      - `date` (timestamp)
      - `chama_id` (uuid, foreign key)
    - `settings`
      - `id` (uuid, primary key)
      - `due_date` (date)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text UNIQUE NOT NULL,
  has_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create chamas table
CREATE TABLE IF NOT EXISTS chamas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  due_date date NOT NULL,
  amount_expected numeric DEFAULT 1000,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  date timestamptz DEFAULT now(),
  chama_id uuid REFERENCES chamas(id) ON DELETE SET NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  due_date date NOT NULL
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for members table
CREATE POLICY "Allow all operations on members"
  ON members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for chamas table
CREATE POLICY "Allow all operations on chamas"
  ON chamas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for payments table
CREATE POLICY "Allow all operations on payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for settings table
CREATE POLICY "Allow all operations on settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (due_date) VALUES (CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Insert sample data
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

-- Insert sample chama
INSERT INTO chamas (name, due_date, amount_expected) VALUES
  ('Weekly Savings Chama', CURRENT_DATE + INTERVAL '7 days', 1000)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number);
CREATE INDEX IF NOT EXISTS idx_members_has_paid ON members(has_paid);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);