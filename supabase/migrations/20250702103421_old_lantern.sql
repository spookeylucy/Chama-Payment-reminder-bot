/*
  # Add 100 Kenyan Members to Chama Database

  1. New Data
    - 100 realistic Kenyan members with authentic names and phone numbers
    - Mixed payment status (paid/unpaid) for realistic testing
    - Sample payments for paid members
    - Additional chama groups

  2. Enhanced Features
    - Regional distribution across Kenya
    - Varied payment amounts
    - Historical payment data
*/

-- Insert 100 Kenyan members with realistic names and phone numbers
INSERT INTO members (name, phone_number, has_paid) VALUES
  -- Nairobi Region
  ('Grace Wanjiku Kamau', '+254712345001', true),
  ('John Mwangi Kariuki', '+254723456001', false),
  ('Mary Achieng Odhiambo', '+254734567001', true),
  ('Peter Kiprotich Ruto', '+254745678001', false),
  ('Sarah Njeri Muthoni', '+254756789001', true),
  ('David Ochieng Otieno', '+254767890001', false),
  ('Lucy Nyambura Wanjiru', '+254778901001', false),
  ('James Kiplagat Koech', '+254789012001', true),
  ('Faith Wanjiru Ndung''u', '+254790123001', false),
  ('Michael Omondi Owino', '+254701234001', true),
  
  -- Central Kenya
  ('Agnes Wangari Githinji', '+254712345002', true),
  ('Samuel Maina Kinyua', '+254723456002', false),
  ('Rose Wanjiku Mbugua', '+254734567002', true),
  ('Francis Karanja Mwangi', '+254745678002', false),
  ('Catherine Nyokabi Kimani', '+254756789002', true),
  ('Joseph Kamau Njoroge', '+254767890002', false),
  ('Margaret Wambui Gathoni', '+254778901002', true),
  ('Daniel Mwangi Kuria', '+254789012002', false),
  ('Jane Wanjiru Macharia', '+254790123002', true),
  ('Paul Njoroge Kamau', '+254701234002', false),
  
  -- Western Kenya
  ('Eunice Akinyi Ouma', '+254712345003', true),
  ('Vincent Wafula Wekesa', '+254723456003', false),
  ('Beatrice Nafula Simiyu', '+254734567003', true),
  ('Moses Wanyama Barasa', '+254745678003', false),
  ('Mercy Awino Otieno', '+254756789003', true),
  ('George Odhiambo Okoth', '+254767890003', false),
  ('Phoebe Nekesa Wanjala', '+254778901003', true),
  ('Robert Wekesa Masinde', '+254789012003', false),
  ('Gladys Auma Ochieng', '+254790123003', true),
  ('Stephen Omondi Ogola', '+254701234003', false),
  
  -- Coast Region
  ('Fatuma Khadija Mohamed', '+254712345004', true),
  ('Hassan Omar Abdallah', '+254723456004', false),
  ('Amina Salim Mwalimu', '+254734567004', true),
  ('Ali Juma Bakari', '+254745678004', false),
  ('Zeinab Fadhil Rashid', '+254756789004', true),
  ('Hamisi Mwangi Kombe', '+254767890004', false),
  ('Mwanaisha Said Mwangi', '+254778901004', true),
  ('Abdallah Mwangi Omar', '+254789012004', false),
  ('Halima Juma Salim', '+254790123004', true),
  ('Mohamed Bakari Hassan', '+254701234004', false),
  
  -- Rift Valley
  ('Joyce Chebet Kiplagat', '+254712345005', true),
  ('William Kiprotich Sang', '+254723456005', false),
  ('Esther Jepkemei Rono', '+254734567005', true),
  ('Nicholas Kipchoge Bett', '+254745678005', false),
  ('Mercy Jepchumba Koech', '+254756789005', true),
  ('Evans Kiprop Kemboi', '+254767890005', false),
  ('Gladys Chepkemoi Rotich', '+254778901005', true),
  ('Benjamin Kiprono Lagat', '+254789012005', false),
  ('Lydia Chepkoech Kiptoo', '+254790123005', true),
  ('Dennis Kipkemboi Ruto', '+254701234005', false),
  
  -- Eastern Kenya
  ('Grace Mwende Mutua', '+254712345006', true),
  ('Patrick Musyoka Kioko', '+254723456006', false),
  ('Susan Kavutha Mwangi', '+254734567006', true),
  ('John Mutinda Nzuki', '+254745678006', false),
  ('Mary Nduku Muthama', '+254756789006', true),
  ('Stephen Muema Kilonzo', '+254767890006', false),
  ('Agnes Katunge Mwanzia', '+254778901006', true),
  ('David Mwangi Mutiso', '+254789012006', false),
  ('Ruth Mumbua Kioko', '+254790123006', true),
  ('James Kyalo Musyoka', '+254701234006', false),
  
  -- Northern Kenya
  ('Halima Abdi Mohamed', '+254712345007', true),
  ('Ahmed Hassan Duale', '+254723456007', false),
  ('Sahra Omar Farah', '+254734567007', true),
  ('Abdirahman Yusuf Ali', '+254745678007', false),
  ('Amina Mohamed Adan', '+254756789007', true),
  ('Hussein Omar Abdi', '+254767890007', false),
  ('Fatuma Ali Hassan', '+254778901007', true),
  ('Mohamed Abdi Yusuf', '+254789012007', false),
  ('Khadija Hassan Omar', '+254790123007', true),
  ('Ibrahim Mohamed Ali', '+254701234007', false),
  
  -- Additional Nairobi Members
  ('Elizabeth Wanjiku Kimani', '+254712345008', true),
  ('Anthony Mwangi Gitau', '+254723456008', false),
  ('Priscilla Njeri Waweru', '+254734567008', true),
  ('Simon Kamau Maina', '+254745678008', false),
  ('Tabitha Wambui Karanja', '+254756789008', true),
  ('Kenneth Njoroge Mwangi', '+254767890008', false),
  ('Veronica Wanjiru Kinyua', '+254778901008', true),
  ('Charles Maina Githuku', '+254789012008', false),
  ('Josephine Nyokabi Kamau', '+254790123008', true),
  ('Robert Karanja Njoroge', '+254701234008', false),
  
  -- Mixed Regions
  ('Winnie Cherop Kibet', '+254712345009', true),
  ('Collins Wanjala Wekesa', '+254723456009', false),
  ('Violet Akinyi Ouma', '+254734567009', true),
  ('Brian Kipchoge Rono', '+254745678009', false),
  ('Doris Wanjiku Mwangi', '+254756789009', true),
  ('Felix Ochieng Otieno', '+254767890009', false),
  ('Lillian Chepkemoi Sang', '+254778901009', true),
  ('Victor Musyoka Kioko', '+254789012009', false),
  ('Edith Mumbua Mutua', '+254790123009', true),
  ('Geoffrey Kiprop Lagat', '+254701234009', false),
  
  -- Final 20 Members
  ('Christine Wangari Kamau', '+254712345010', true),
  ('Emmanuel Kiprotich Koech', '+254723456010', false),
  ('Pauline Achieng Odhiambo', '+254734567010', true),
  ('Lawrence Mwangi Kariuki', '+254745678010', false),
  ('Rachael Njeri Muthoni', '+254756789010', true),
  ('Timothy Ochieng Owino', '+254767890010', false),
  ('Stella Nyambura Wanjiru', '+254778901010', true),
  ('Martin Kiplagat Ruto', '+254789012010', false),
  ('Eunice Wanjiru Ndung''u', '+254790123010', true),
  ('Andrew Omondi Ogola', '+254701234010', false),
  ('Millicent Wambui Githinji', '+254712345011', true),
  ('Kevin Maina Kinyua', '+254723456011', false),
  ('Gladys Wanjiku Mbugua', '+254734567011', true),
  ('Philip Karanja Mwangi', '+254745678011', false),
  ('Lydia Nyokabi Kimani', '+254756789011', true),
  ('Moses Kamau Njoroge', '+254767890011', false),
  ('Esther Wambui Gathoni', '+254778901011', true),
  ('Isaac Mwangi Kuria', '+254789012011', false),
  ('Naomi Wanjiru Macharia', '+254790123011', true),
  ('Samuel Njoroge Kamau', '+254701234011', false)
ON CONFLICT (phone_number) DO NOTHING;

-- Insert additional chama groups
INSERT INTO chamas (name, due_date, amount_expected) VALUES
  ('Nairobi Business Chama', CURRENT_DATE + INTERVAL '14 days', 2000),
  ('Mombasa Traders Group', CURRENT_DATE + INTERVAL '21 days', 1500),
  ('Kisumu Women Empowerment', CURRENT_DATE + INTERVAL '10 days', 1200),
  ('Eldoret Farmers Chama', CURRENT_DATE + INTERVAL '30 days', 3000),
  ('Nakuru Youth Savings', CURRENT_DATE + INTERVAL '7 days', 800)
ON CONFLICT DO NOTHING;

-- Insert sample payments for paid members (randomly distributed amounts)
DO $$
DECLARE
    member_record RECORD;
    payment_amount NUMERIC;
    payment_date TIMESTAMPTZ;
BEGIN
    FOR member_record IN 
        SELECT id, name FROM members WHERE has_paid = true
    LOOP
        -- Random payment amount between 800-2000
        payment_amount := 800 + (RANDOM() * 1200);
        
        -- Random payment date within last 30 days
        payment_date := NOW() - (RANDOM() * INTERVAL '30 days');
        
        INSERT INTO payments (member_id, amount, date) 
        VALUES (member_record.id, payment_amount, payment_date)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Update settings with multiple due dates for different chamas
INSERT INTO settings (due_date) VALUES 
  (CURRENT_DATE + INTERVAL '7 days'),
  (CURRENT_DATE + INTERVAL '14 days'),
  (CURRENT_DATE + INTERVAL '21 days'),
  (CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;