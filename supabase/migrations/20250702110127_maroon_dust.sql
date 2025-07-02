/*
  # Create Chama Manager Database Schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `name` (varchar, member's full name)
      - `phone_number` (varchar, unique phone number)
      - `has_paid` (boolean, payment status)
      - `created_at` (timestamp)
    - `chamas`
      - `id` (uuid, primary key)
      - `name` (varchar, chama name)
      - `due_date` (date, payment due date)
      - `amount_expected` (numeric, expected payment amount)
      - `created_at` (timestamp)
    - `payments`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key to members)
      - `amount` (numeric, payment amount)
      - `date` (timestamp, payment date)
      - `chama_id` (uuid, optional foreign key to chamas)
    - `settings`
      - `id` (integer, primary key)
      - `due_date` (date, global due date setting)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Public access for demo purposes (can be restricted later)

  3. Sample Data
    - Insert 100 sample Kenyan members for testing
    - Add initial settings with due date
    - Create sample payments for demonstration
*/

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL UNIQUE,
    has_paid boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Create chamas table
CREATE TABLE IF NOT EXISTS public.chamas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL,
    due_date date NOT NULL,
    amount_expected numeric DEFAULT 1000.0,
    created_at timestamp with time zone DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    date timestamp with time zone DEFAULT now(),
    chama_id uuid REFERENCES public.chamas(id) ON DELETE SET NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id integer PRIMARY KEY,
    due_date date NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow all operations on members" ON public.members FOR ALL USING (true);
CREATE POLICY "Allow all operations on chamas" ON public.chamas FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON public.settings FOR ALL USING (true);

-- Insert initial settings
INSERT INTO public.settings (id, due_date) 
VALUES (1, (CURRENT_DATE + INTERVAL '7 days')) 
ON CONFLICT (id) DO UPDATE SET due_date = EXCLUDED.due_date;

-- Insert sample Kenyan members for testing
INSERT INTO public.members (name, phone_number, has_paid) VALUES
('John Kamau', '+254712345678', true),
('Mary Wanjiku', '+254723456789', false),
('Peter Mwangi', '+254734567890', true),
('Grace Nyambura', '+254745678901', false),
('David Kiprotich', '+254756789012', true),
('Sarah Akinyi', '+254767890123', false),
('Michael Ochieng', '+254778901234', true),
('Faith Wanjiru', '+254789012345', false),
('James Kipchoge', '+254790123456', true),
('Lucy Moraa', '+254701234567', false),
('Samuel Mutua', '+254712345679', true),
('Rose Chebet', '+254723456780', false),
('Francis Otieno', '+254734567891', true),
('Agnes Wambui', '+254745678902', false),
('Robert Kigen', '+254756789013', true),
('Catherine Njeri', '+254767890124', false),
('Joseph Macharia', '+254778901235', true),
('Margaret Auma', '+254789012346', false),
('Daniel Ruto', '+254790123457', true),
('Joyce Wairimu', '+254701234568', false),
('Anthony Mbugua', '+254712345680', true),
('Esther Chepkemoi', '+254723456781', false),
('George Wekesa', '+254734567892', true),
('Beatrice Njoki', '+254745678903', false),
('Paul Kibet', '+254756789014', true),
('Helen Awino', '+254767890125', false),
('Charles Gitau', '+254778901236', true),
('Mercy Cheptoo', '+254789012347', false),
('Stephen Odongo', '+254790123458', true),
('Priscilla Wangari', '+254701234569', false),
('Vincent Koech', '+254712345681', true),
('Gladys Muthoni', '+254723456782', false),
('Moses Omondi', '+254734567893', true),
('Eunice Wanjala', '+254745678904', false),
('Isaac Langat', '+254756789015', true),
('Lydia Nyokabi', '+254767890126', false),
('Emmanuel Kariuki', '+254778901237', true),
('Violet Jepkemei', '+254789012348', false),
('Kenneth Mutiso', '+254790123459', true),
('Tabitha Waweru', '+254701234570', false),
('Felix Cheruiyot', '+254712345682', true),
('Naomi Gathoni', '+254723456783', false),
('Collins Anyango', '+254734567894', true),
('Purity Kamene', '+254745678905', false),
('Brian Kiplagat', '+254756789016', true),
('Winnie Njambi', '+254767890127', false),
('Edwin Maina', '+254778901238', true),
('Stella Jeptanui', '+254789012349', false),
('Nicholas Wafula', '+254790123460', true),
('Diana Wangui', '+254701234571', false),
('Simon Kiprono', '+254712345683', true),
('Millicent Waithera', '+254723456784', false),
('Alex Okoth', '+254734567895', true),
('Josephine Mwende', '+254745678906', false),
('Timothy Sang', '+254756789017', true),
('Rachael Njuguna', '+254767890128', false),
('Patrick Muriuki', '+254778901239', true),
('Edith Jepkorir', '+254789012350', false),
('Mark Owino', '+254790123461', true),
('Lilian Wambugu', '+254701234572', false),
('Andrew Kiptoo', '+254712345684', true),
('Doris Nyawira', '+254723456785', false),
('Richard Amolo', '+254734567896', true),
('Veronica Mwikali', '+254745678907', false),
('Kevin Rotich', '+254756789018', true),
('Irene Wanjiku', '+254767890129', false),
('Lawrence Ndungu', '+254778901240', true),
('Phyllis Chepngetich', '+254789012351', false),
('Martin Ongeri', '+254790123462', true),
('Susan Wangeci', '+254701234573', false),
('Dennis Kiprotich', '+254712345685', true),
('Caroline Mutheu', '+254723456786', false),
('Henry Oduya', '+254734567897', true),
('Jacinta Wanjiru', '+254745678908', false),
('Allan Kipchirchir', '+254756789019', true),
('Monica Nyambura', '+254767890130', false),
('Gerald Mwangi', '+254778901241', true),
('Evelyn Jepkoech', '+254789012352', false),
('Philip Otieno', '+254790123463', true),
('Grace Wanjala', '+254701234574', false),
('Victor Kemboi', '+254712345686', true),
('Janet Njeri', '+254723456787', false),
('Thomas Anyona', '+254734567898', true),
('Pauline Mwende', '+254745678909', false),
('Eric Kiplagat', '+254756789020', true),
('Christine Wangui', '+254767890131', false),
('Benjamin Mutua', '+254778901242', true),
('Florence Chepkemoi', '+254789012353', false),
('Isaac Ochieng', '+254790123464', true),
('Mary Wambui', '+254701234575', false),
('Joshua Kibet', '+254712345687', true),
('Ruth Nyokabi', '+254723456788', false),
('William Amolo', '+254734567899', true),
('Elizabeth Muthoni', '+254745678910', false),
('Samuel Ruto', '+254756789021', true),
('Ann Wanjiru', '+254767890132', false),
('Peter Ongeri', '+254778901243', true),
('Mercy Cheptoo', '+254789012354', false),
('John Oduya', '+254790123465', true),
('Jane Wangari', '+254701234576', false),
('Michael Kiprotich', '+254712345688', true),
('Sarah Njoki', '+254723456789', false),
('David Anyango', '+254734567800', true),
('Lucy Mwikali', '+254745678911', false);

-- Insert sample payments for paid members
INSERT INTO public.payments (member_id, amount)
SELECT id, 1000.0 
FROM public.members 
WHERE has_paid = true;

-- Create a sample chama
INSERT INTO public.chamas (name, due_date, amount_expected) VALUES
('Monthly Savings Group', CURRENT_DATE + INTERVAL '15 days', 1000.0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone_number);
CREATE INDEX IF NOT EXISTS idx_members_has_paid ON public.members(has_paid);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(date);
CREATE INDEX IF NOT EXISTS idx_chamas_due_date ON public.chamas(due_date);