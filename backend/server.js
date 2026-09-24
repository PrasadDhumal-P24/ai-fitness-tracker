// const express = require('express');
// const cors = require('cors');
// const { Pool } = require('pg');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const app = express();

// // Middleware (Allowed Cors Setup)
// app.use(cors({
//   origin: '*', // Production saathi standard origin pathva
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json());

// // PostgreSQL Pool Connection Setup
// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   database: process.env.DB_NAME || 'getfit_db',
//   password: process.env.DB_PASSWORD || '303012', // Ensure this matches .env
//   port: process.env.DB_PORT || 5432,
// });

// // Test DB Connection
// pool.connect((err, client, release) => {
//   if (err) {
//     return console.error('❌ PostgreSQL joining mistake:', err.stack);
//   }
//   console.log('✅ PostgreSQL Database "getfit_db" शी यशस्वी संपर्क झाला!');
//   release();
// });

// // JWT Secret Key
// const JWT_SECRET = process.env.JWT_SECRET || 'getfit_super_secret_key';

// // ==========================================
// // 1. SIGNUP ROUTE
// // ==========================================
// app.post('/api/auth/signup', async (req, res) => {
//   const { name, email, password, goal, level } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({ error: 'fill only important information.' });
//   }

//   try {
//     const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (userCheck.rows.length > 0) {
//       return res.status(400).json({ error: 'this email existing already.' });
//     }

//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const newUser = await pool.query(
//       `INSERT INTO users (name, email, password, goal, level) 
//        VALUES ($1, $2, $3, $4, $5) 
//        RETURNING id, name, email, goal, level, created_at`,
//       [name, email, hashedPassword, goal || null, level || null]
//     );

//     const user = newUser.rows[0];

//     const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     res.status(201).json({
//       message: 'साइनअप यशस्वी झाले!',
//       token,
//       user,
//     });
//   } catch (err) {
//     console.error('❌ Signup Error Details:', err);
//     res.status(500).json({ error: 'साइनअप करताना सर्व्हर त्रुटी आली: ' + err.message });
//   }
// });

// // ==========================================
// // 2. LOGIN ROUTE
// // ==========================================
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: 'ई-मेल आणि पासवर्ड आवश्यक आहेत.' });
//   }

//   try {
//     const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

//     if (userResult.rows.length === 0) {
//       return res.status(400).json({ error: 'ई-मेल किंवा पासवर्ड चुकीचा आहे.' });
//     }

//     const user = userResult.rows[0];

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'ई-मेल किंवा पासवर्ड चुकीचा आहे.' });
//     }

//     const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     delete user.password;

//     res.status(200).json({
//       message: 'लॉगिन यशस्वी झाले!',
//       token,
//       user,
//     });
//   } catch (err) {
//     console.error('❌ Login Error Details:', err);
//     res.status(500).json({ error: 'लॉगिन करताना सर्व्हर त्रुटी आली: ' + err.message });
//   }
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server connected on http://localhost:${PORT}`);
// });



const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// PostgreSQL Pool Connection Setup
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'getfit_db',
  password: process.env.DB_PASSWORD || '303012',
  port: process.env.DB_PORT || 5432,
});

// Verify Database Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ PostgreSQL Connection Error:', err.stack);
  }
  console.log('✅ Connected to PostgreSQL Database: getfit_db');
  release();
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'getfit_super_secret_key';

// ==========================================
// 1. SIGNUP ROUTE
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, goal, level } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, goal, level) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, goal, level, created_at`,
      [name, email, hashedPassword, goal || null, level || null]
    );

    const user = newUser.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user,
    });
  } catch (err) {
    console.error('❌ Signup Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error during registration: ' + err.message });
  }
});

// ==========================================
// 2. LOGIN ROUTE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    delete user.password;

    res.status(200).json({
      message: 'Login successful!',
      token,
      user,
    });
  } catch (err) {
    console.error('❌ Login Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error during login: ' + err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});