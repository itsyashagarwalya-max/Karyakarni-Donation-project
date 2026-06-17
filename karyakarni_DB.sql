-- ========================================================
-- DATABASE CREATION & INITIALIZATION
-- ========================================================
CREATE DATABASE IF NOT EXISTS kaaryakarni_db;
USE kaaryakarni_db;

-- ========================================================
-- 1. MEMBERS TABLE
-- ========================================================
-- Stores profile and authentication metadata for registered users
CREATE TABLE IF NOT EXISTS members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensuring that mobile numbers are exactly 10 digits structurally
    CONSTRAINT chk_mobile_length CHECK (LENGTH(mobile_number) = 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 2. ADMINS TABLE
-- ========================================================
-- Stores credentials and internal metrics for backend administration
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username_or_email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Holds securely hashed keys
    two_factor_secret VARCHAR(100) NULL,  -- Holds configuration strings for 2FA tracking
    last_login TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- 3. DONATIONS TABLE
-- ========================================================
-- Tracks all standard transactions (Supports both logged-in members and guest users)
CREATE TABLE IF NOT EXISTS donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NULL, -- Left NULL if it's a guest checking out directly via "Donate Now"
    donor_full_name VARCHAR(105) NOT NULL,
    donor_email VARCHAR(100) NOT NULL,
    donor_mobile VARCHAR(10) NOT NULL,
    amount_inr DECIMAL(10, 2) NOT NULL, -- Supports up to 99,99,999.99 INR transactions
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Linking donations to the members table safely via Foreign Key
    FOREIGN KEY (member_id) REFERENCES members(member_id)
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- OPTIONAL: SEED DUMMY ADMIN PROFILE FOR TESTING
-- ========================================================
-- Creates a baseline account for testing the Admin authentication forms.
-- Note: In production systems, make sure to hash passwords using bcrypt/argon2!
INSERT INTO admins (username_or_email, password_hash) 
VALUES ('admin@kaaryakarni.org', 'Admin@123')
ON DUPLICATE KEY UPDATE username_or_email=username_or_email;