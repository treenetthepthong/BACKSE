const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/dbconfig'); // ใช้การเชื่อมต่อกับฐานข้อมูลที่ตั้งไว้

// สำหรับการเข้าสู่ระบบ (Login)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('username', username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = userResult.recordset[0];
    // ตรวจสอบรหัสผ่านที่กรอกเข้ามา
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // ถ้ารหัสผ่านถูกต้อง, สร้าง JWT token
    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      'yourSecretKey', // ควรเก็บไว้ใน environment variable
      { expiresIn: '1h' } // token หมดอายุหลังจาก 1 ชั่วโมง
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};
