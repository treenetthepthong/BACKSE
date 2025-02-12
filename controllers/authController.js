const jwt = require('jsonwebtoken');
const sql = require('mssql'); // เพิ่มบรรทัดนี้เพื่อให้ใช้งานได้
const { poolPromise } = require('../config/dbconfig'); // ใช้การเชื่อมต่อกับฐานข้อมูลที่ตั้งไว้

// สำหรับการเข้าสู่ระบบ (Login)
exports.login = async (req, res) => {
  const { email, password_hash } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)  // ตรวจสอบให้แน่ใจว่าใช้ sql กับ `input`
      .query('SELECT * FROM Users WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.recordset[0];

    console.log('Password from DB:', user.password_hash);
    console.log('Password from request:', password_hash);

    // เปรียบเทียบรหัสผ่านที่กรอกกับรหัสผ่านที่เก็บไว้ในฐานข้อมูล
    if (password_hash === user.password_hash) {
      // สร้าง JWT token หากรหัสผ่านตรง
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET || 'yourSecretKey',
        { expiresIn: '1h' } // Token หมดอายุใน 1 ชั่วโมง
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        username: user.username,
        role: user.role
      });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });  // รหัสผ่านไม่ตรง
    }
  } catch (error) {
    console.error(error);  // แสดงข้อผิดพลาดใน console
    return res.status(500).json({ message: 'Server error' });  // ข้อผิดพลาดที่เกิดจาก server
  }
};
