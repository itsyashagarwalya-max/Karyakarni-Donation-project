-- ========================================================
-- DATABASE CREATION & INITIALIZATION
-- ========================================================
CREATE DATABASE IF NOT EXISTS kaaryakarni_db;
USE kaaryakarni_db;
-- ========================================================
-- 1. ROLES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO roles (role_id, role_name) VALUES 
(1, 'admin'),
(2, 'member'),
(3, 'guest');

-- ========================================================
-- 2. MEMBERS TABLE (Consolidated Auth)
-- ========================================================
CREATE TABLE IF NOT EXISTS members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username_or_email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(10) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Centralized credentials
    role_id INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_mobile_length CHECK (LENGTH(mobile_number) = 10),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OPTIONAL: SEED DUMMY ADMIN PROFILE FOR TESTING
-- ========================================================
-- Creates a baseline account for testing the Admin authentication forms.
-- Note: In production systems, make sure to hash passwords using bcrypt/argon2!
INSERT INTO members (first_name, last_name, username_or_email, mobile_number, password_hash, role_id) 
VALUES ('admin', 'admin', 'admin@kaaryakarni.org', '9588288157', 'Admin@123', 1)
ON DUPLICATE KEY UPDATE username_or_email=username_or_email;

-- ========================================================
-- 3. AUDIT LOGS TABLE
-- ========================================================
-- Tracks historical actions and login sessions
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'LOGIN', 'DONATION', 'UPDATE_ROLE'
    description TEXT,
    ip_address VARCHAR(45), -- Store user IP for security tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES members(member_id) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 4. DONATIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NULL,
    donor_full_name VARCHAR(105) NOT NULL,
    donor_email VARCHAR(100) NOT NULL,
    donor_mobile VARCHAR(10) NOT NULL,
    amount_inr DECIMAL(10, 2) NOT NULL,
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES members(member_id)
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================