const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Essential to read data sent from frontend

// 1. Database Connection Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',             // Your MySQL Workbench username
    password: 'Yash@2410', // Your MySQL Workbench password
    database: 'kaaryakarni_db'
};

// 2. API Endpoint: Sign Up / New Member Registration
app.post('/api/members/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, mobile } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `INSERT INTO members (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)`;
        const [result] = await connection.execute(query, [firstName, lastName, email, mobile]);
        await connection.end();

        res.status(201).json({ success: true, memberId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. API Endpoint: Record a New Donation
app.post('/api/donations/add', async (req, res) => {
    try {
        const { memberId, fullName, email, mobile, amount } = req.body;
        const connection = await mysql.createConnection(dbConfig);
        
        const query = `INSERT INTO donations (member_id, donor_full_name, donor_email, donor_mobile, amount_inr) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await connection.execute(query, [memberId || null, fullName, email, mobile, amount]);
        await connection.end();

        // Send back a clean localized timestamp for the frontend receipt
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'IST' });
        res.status(200).json({ success: true, transactionId: result.insertId, timestamp });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start backend server
const PORT = 5000;
app.listen(PORT, () => console.log(`Kaaryakarni API Backend running on http://localhost:${PORT}`));