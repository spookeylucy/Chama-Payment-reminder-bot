/*
  # Enable Row Level Security and Create Policies
  
  This script enables RLS and creates policies for all tables
  to ensure data security and proper access control.
*/

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on members" ON members;
DROP POLICY IF EXISTS "Allow all operations on chamas" ON chamas;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;

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
