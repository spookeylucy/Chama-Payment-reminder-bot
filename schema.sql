-- Auto-run database schema for Chama Reminder System
CREATE DATABASE IF NOT EXISTS chama_db;
USE chama_db;

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    phone_number  VARCHAR(20)  NOT NULL UNIQUE,
    has_paid      TINYINT(1)   DEFAULT 0,
    last_payment  DATETIME     NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Chamas table
CREATE TABLE IF NOT EXISTS chamas (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    due_date         DATE NOT NULL,
    amount_expected  FLOAT DEFAULT 1000.0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    member_id  INT NOT NULL,
    amount     FLOAT NOT NULL,
    date       DATETIME DEFAULT CURRENT_TIMESTAMP,
    chama_id   INT,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (chama_id) REFERENCES chamas(id)
);

-- Settings table for due dates
CREATE TABLE IF NOT EXISTS settings (
    id           INT PRIMARY KEY,
    due_date     DATE NOT NULL
);

-- Insert default settings (due date 7 days from now)
INSERT INTO settings (id, due_date) VALUES (1, CURDATE() + INTERVAL 7 DAY)
ON DUPLICATE KEY UPDATE due_date = CURDATE() + INTERVAL 7 DAY;

-- Insert demo data for testing (optional)
INSERT INTO members (name, phone_number, has_paid, last_payment) VALUES
('Alice Wanjiku', '+254712345678', 1, NOW() - INTERVAL 1 DAY),
('John Kimani', '+254723456789', 0, NULL),
('Mary Achieng', '+254734567890', 1, NOW() - INTERVAL 2 DAY),
('Peter Mwangi', '+254745678901', 0, NULL),
('Grace Njeri', '+254756789012', 1, NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert a default chama
INSERT INTO chamas (name, due_date, amount_expected) VALUES
('Weekly Savings Chama', CURDATE() + INTERVAL 7 DAY, 1000.0)
ON DUPLICATE KEY UPDATE name = VALUES(name);