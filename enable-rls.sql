/*
  # Chama Management System Database Schema
  
  1. New Tables
    - `members` - Store member information
    - `chamas` - Store chama group information  
    - `payments` - Store payment records
    - `settings` - Store system settings
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
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
  amount numeric NOT NULL CHECK (amount > 0),
  date timestamptz DEFAULT now(),
  chama_id uuid REFERENCES chamas(id) ON DELETE SET NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  due_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number);
CREATE INDEX IF NOT EXISTS idx_members_has_paid ON members(has_paid);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_chama_id ON payments(chama_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_chamas_due_date ON chamas(due_date);
