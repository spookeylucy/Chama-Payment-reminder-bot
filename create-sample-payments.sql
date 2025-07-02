/*
  # Create Sample Payments for Paid Members
  
  This script creates realistic payment records for members
  who have already paid their contributions.
*/

-- Create a function to generate sample payments
CREATE OR REPLACE FUNCTION generate_sample_payments()
RETURNS void AS $$
DECLARE
    member_record RECORD;
    chama_record RECORD;
    payment_amount NUMERIC;
    payment_date TIMESTAMPTZ;
BEGIN
    -- Get a random chama for payments
    SELECT id INTO chama_record FROM chamas ORDER BY RANDOM() LIMIT 1;
    
    -- Create payments for members who have paid
    FOR member_record IN 
        SELECT id, name FROM members WHERE has_paid = true
    LOOP
        -- Random payment amount between 800-3000
        payment_amount := 800 + (RANDOM() * 2200);
        
        -- Random payment date within last 60 days
        payment_date := NOW() - (RANDOM() * INTERVAL '60 days');
        
        INSERT INTO payments (member_id, amount, date, chama_id) 
        VALUES (
            member_record.id, 
            ROUND(payment_amount, 2), 
            payment_date,
            chama_record.id
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create sample payments
SELECT generate_sample_payments();

-- Drop the function after use
DROP FUNCTION generate_sample_payments();
