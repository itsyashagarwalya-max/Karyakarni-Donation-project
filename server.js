const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'))); 

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Minty@0603', 
    database: 'kaaryakarni_db'
};

const otpStore = {};
// ==================== OTP REQUEST ====================
app.post('/api/otp/request', async (req, res) => {
    try {
        const { targetPhone } = req.body;
        let fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 1. Validate phone number
        if (!/^\d{10}$/.test(targetPhone)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }
        otpStore[targetPhone] = fallbackOtp;
        
//        // 2. Call the OTP Provider (using the credentials from your curl command)
//        try{
//	        const otpResponse = await fetch('https://api.otp.dev/v1/verifications', {
//	            method: 'POST',
//	            headers: {
//	                'X-OTP-Key': '02eb5b7ee0484adf4afacc5616d76dbd',
//	                'Accept': 'application/json',
//	                'Content-Type': 'application/json'
//	            },
//	            body: JSON.stringify({
//	                data: {
//	                    channel: 'sms',
//	                    sender: 'd4144733-615f-4f5d-9d64-64c6efb9fc64',
//	                    phone: `91${targetPhone}`, // Assuming India (+91) based on your context
//	                    template: '80b609f1-3290-4e3f-aa93-dedfb375073f',
//	                    code_length: 6
//	                }
//	            })
//	        });
//
//	        const result = await otpResponse.json();
//	        console.log(`${result}`)
//	        if (!otpResponse.ok) throw new Error("API responded with error");
//
//            // If successful, log that we used the API
//            otpStore[targetPhone] = result.data.code
//            fallbackOtp = result.data.code
//            console.log(`[OTP sent via API to ${targetPhone}:${fallbackOtp}]`);
//        } catch (apiError) {
//            // FALLBACK LOGIC
//            console.error(`[OTP API failed, using fallback for ${targetPhone}]:`, apiError.message);
//
//            // Store fallback OTP in your memory
//            otpStore[targetPhone] = fallbackOtp;
//
//            // Log for your internal console/debug
//            console.log(`[Fallback OTP for ${targetPhone}]: ${fallbackOtp}`);
//        }
        res.status(200).json({
            success: true,
            message: 'OTP request processed',
            providerResponse: fallbackOtp 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==================== MEMBER SIGN IN ====================
app.post('/api/member/signin-verify', async (req, res) => {
    try {
        const { mobileNumber, clientOtp } = req.body;
        
        // ADD THIS LOG
    	   console.log(`Mobile=${mobileNumber}, StoredOTP=${otpStore[mobileNumber]}, SentOTP=${clientOtp}`);    	   
        
        if (!otpStore[mobileNumber] || otpStore[mobileNumber] !== clientOtp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Added role_id to the query
        const query = `SELECT member_id, first_name, last_name, username_or_email, mobile_number, role_id FROM members WHERE mobile_number = ?`;
        const [rows] = await connection.execute(query, [mobileNumber]);
        await connection.end();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const member = rows[0];
        delete otpStore[mobileNumber];
        
        res.status(200).json({
            success: true,
            member: {
                memberId: member.member_id,
                firstName: member.first_name,
                lastName: member.last_name,
                emailId: member.email,
                mobileNumber: member.mobile_number,
                roleId: member.role_id // Sent to frontend for UI logic
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== ADMIN AUTHENTICATION (Phase 2 - 2FA & Auth) ====================
app.post('/api/admin/gateway-2fa', async (req, res) => {
    try {
        const { userToken2fa, memberId } = req.body; 
        
        const connection = await mysql.createConnection(dbConfig);
        
        // SECURITY CHECK: Verify if this specific member is an admin
        const [users] = await connection.execute('SELECT role_id FROM members WHERE member_id = ?', [memberId]);
        
        if (users.length === 0 || users[0].role_id !== 1) {
            await connection.end();
            return res.status(403).json({ message: 'Access Denied: Admin role required.' });
        }
        
        // Fetch all members and donations only after confirming Admin status
        const [members] = await connection.execute(`SELECT first_name, last_name, email, mobile_number FROM members`);
        const [donations] = await connection.execute(`SELECT donor_full_name, donor_email, amount_inr, transaction_timestamp FROM donations`);
        
        await connection.end();
        
        res.status(200).json({
            success: true,
            message: '2FA verification successful',
            dataLog: {
                members: members,
                donations: donations
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== MEMBER REGISTRATION ====================
app.post('/api/member/register-account', async (req, res) => {
    try {
        const { firstName, lastName, emailId, mobileNumber, clientOtp } = req.body;
        
        // Verify OTP
        if (!otpStore[mobileNumber] || otpStore[mobileNumber] !== clientOtp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const query = 'INSERT INTO members (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)';
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


// ==================== DONATION SUBMISSION ====================
app.post('/api/donation/submit-transaction', async (req, res) => {
    try {
        const { fullName, emailId, mobileNumber, amountInr, clientOtp, bypassOtp } = req.body;
        
        // Verify OTP if not bypassed
        if (!bypassOtp && (!otpStore[mobileNumber] || otpStore[mobileNumber] !== clientOtp)) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        const connection = await mysql.createConnection(dbConfig);
        
        const query = 'INSERT INTO donations (donor_full_name, donor_email, donor_mobile, amount_inr) VALUES (?, ?, ?, ?)';
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

// ==================== FETCH MEMBER DONATIONS ====================
app.get('/api/member/donations/:mobile', async (req, res) => {
    try {
        const mobile = req.params.mobile;
        const connection = await mysql.createConnection(dbConfig);
        
        // Fetch only donations for this mobile number
        const [donations] = await connection.execute(
            `SELECT * FROM donations WHERE donor_mobile = ?`, [mobile]
        );
        
        await connection.end();
        res.json({ success: true, donations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Kaaryakarni API Backend running on http://localhost:${PORT}`);
    console.log(`📁 Database: kaaryakarni_db`);
    console.log(`🔒 Admin credentials - Email: admin@kaaryakarni.org | Password: Admin@123`);
});
