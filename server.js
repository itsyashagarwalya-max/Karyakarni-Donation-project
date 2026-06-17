const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Yash@2410', // Update with your MySQL password
    database: 'kaaryakarni_db'
};

// ==================== OTP MANAGEMENT ====================
// Store OTPs in memory (in production, use Redis or database)
const otpStore = {};

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// ==================== MEMBER REGISTRATION ====================
app.post('/api/member/register-account', async (req, res) => {
    try {
        const { firstName, lastName, emailId, mobileNumber, clientOtp } = req.body;
        
        // Verify OTP
        if (!otpStore[mobileNumber] || otpStore[mobileNumber] !== clientOtp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `INSERT INTO members (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)`;
        const [result] = await connection.execute(query, [firstName, lastName, emailId, mobileNumber]);
        await connection.end();
        
        // Clear OTP after successful registration
        delete otpStore[mobileNumber];
        
        res.status(201).json({
            success: true,
            member: {
                memberId: result.insertId,
                firstName,
                lastName,
                emailId,
                mobileNumber
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== MEMBER SIGN IN ====================
app.post('/api/member/signin-verify', async (req, res) => {
    try {
        const { mobileNumber, clientOtp } = req.body;
        
        // Verify OTP
        if (!otpStore[mobileNumber] || otpStore[mobileNumber] !== clientOtp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `SELECT * FROM members WHERE mobile_number = ?`;
        const [rows] = await connection.execute(query, [mobileNumber]);
        await connection.end();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const member = rows[0];
        
        // Clear OTP after successful signin
        delete otpStore[mobileNumber];
        
        res.status(200).json({
            success: true,
            member: {
                memberId: member.member_id,
                firstName: member.first_name,
                lastName: member.last_name,
                emailId: member.email,
                mobileNumber: member.mobile_number
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== OTP REQUEST ====================
app.post('/api/otp/request', async (req, res) => {
    try {
        const { targetPhone } = req.body;
        
        // Validate phone number
        if (!/^\d{10}$/.test(targetPhone)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        otpStore[targetPhone] = otp;
        
        // In production, send via SMS service (Twilio, AWS SNS, etc.)
        // For testing, we return OTP in response
        console.log(`[OTP for ${targetPhone}]: ${otp}`);
        
        res.status(200).json({
            success: true,
            activeTokenCode: otp, // For testing only - remove in production
            message: 'OTP sent successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== DONATION SUBMISSION ====================
app.post('/api/donation/submit-transaction', async (req, res) => {
    try {
        const { fullName, emailId, mobileNumber, amountInr, clientOtp, bypassOtp } = req.body;
        
        // Verify OTP if not bypassed
        if (!bypassOtp && (!otpStore[mobileNumber] || otpStore[mobileNumber] !== clientOtp)) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `INSERT INTO donations (donor_full_name, donor_email, donor_mobile, amount_inr) VALUES (?, ?, ?, ?)`;
        const [result] = await connection.execute(query, [fullName, emailId, mobileNumber, amountInr]);
        await connection.end();
        
        // Clear OTP after successful donation
        delete otpStore[mobileNumber];
        
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'IST' });
        
        res.status(200).json({
            success: true,
            donation: {
                donationId: result.insertId,
                fullName,
                emailId,
                mobileNumber,
                amountInr: parseFloat(amountInr),
                timestamp
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ADMIN AUTHENTICATION (Phase 1) ====================
app.post('/api/admin/gateway-pass', async (req, res) => {
    try {
        const { identity, password } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `SELECT * FROM admins WHERE username_or_email = ? AND password_hash = ?`;
        const [rows] = await connection.execute(query, [identity, password]);
        await connection.end();
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate 2FA code
        const admin2faCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[`2fa_${identity}`] = admin2faCode;
        
        console.log(`[2FA Code for ${identity}]: ${admin2faCode}`);
        
        res.status(200).json({
            success: true,
            message: 'Credentials verified. Please provide 2FA code.',
            admin2faCode // For testing only - remove in production
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== ADMIN AUTHENTICATION (Phase 2 - 2FA) ====================
app.post('/api/admin/gateway-2fa', async (req, res) => {
    try {
        const { userToken2fa } = req.body;
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Fetch all members
        const memberQuery = `SELECT member_id, first_name, last_name, email, mobile_number FROM members`;
        const [members] = await connection.execute(memberQuery);
        
        // Fetch all donations
        const donationQuery = `SELECT donor_full_name, donor_email, amount_inr, transaction_timestamp FROM donations`;
        const [donations] = await connection.execute(donationQuery);
        
        await connection.end();
        
        // Format data for response
        const memberData = members.map(m => ({
            firstName: m.first_name,
            lastName: m.last_name,
            emailId: m.email,
            mobileNumber: m.mobile_number
        }));
        
        const donationData = donations.map(d => ({
            fullName: d.donor_full_name,
            emailId: d.donor_email,
            amountInr: parseFloat(d.amount_inr),
            timestamp: new Date(d.transaction_timestamp).toLocaleString('en-IN', { timeZone: 'IST' })
        }));
        
        res.status(200).json({
            success: true,
            message: '2FA verification successful',
            dataLog: {
                members: memberData,
                donations: donationData
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Kaaryakarni API Backend running on http://localhost:${PORT}`);
    console.log(`📁 Database: kaaryakarni_db`);
    console.log(`🔒 Admin credentials - Email: admin@kaaryakarni.org | Password: Admin@123`);
});
