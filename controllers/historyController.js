const jwt = require('jsonwebtoken');
const sql = require('mssql'); // ใช้สำหรับเชื่อมต่อกับฐานข้อมูล
const { poolPromise } = require('../config/dbconfig'); // ใช้การเชื่อมต่อกับฐานข้อมูลที่ตั้งไว้

// ฟังก์ชันดึงประวัติการนัดหมาย
exports.getAppointmentHistory = async (req, res) => {
  // ตรวจสอบ JWT token ที่ส่งมาจาก client
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // ดึง token จาก header

  if (!token) {
    return res.status(401).json({ error: 'Token is required for authentication' });
  }

  try {
    // ตรวจสอบความถูกต้องของ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey');
    const userId = decoded.userId; // ดึง userId จาก token ที่ตรวจสอบแล้ว

    // เชื่อมต่อกับฐานข้อมูล MSSQL
    const pool = await poolPromise;
    
    // ดึง student_id จากตาราง students โดยใช้ user_id
    const studentResult = await pool.request()
      .input('userId', sql.Int, userId)  // ส่ง userId เป็น parameter
      .query('SELECT student_id FROM students WHERE user_id = @userId');
    
    // หากไม่พบ student_id สำหรับ user_id นี้
    if (studentResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }

    // ดึง student_id
    const studentId = studentResult.recordset[0].student_id;

    // ดึงข้อมูลประวัติการนัดหมายจากตาราง appointments โดยใช้ student_id
    const appointmentResult = await pool.request()
      .input('studentId', sql.Int, studentId)  // ส่ง studentId เป็น parameter
      .query('SELECT appointment_id, appointment_date, status FROM appointments WHERE student_id = @studentId ORDER BY appointment_date DESC');
    
    // หากไม่มีการนัดหมาย
    if (appointmentResult.recordset.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this student' });
    }

    // ส่งข้อมูลการนัดหมาย
    return res.status(200).json({ appointments: appointmentResult.recordset });
  } catch (error) {
    console.error(error);  // แสดงข้อผิดพลาดใน console
    return res.status(500).json({ message: 'Server error' });  // ข้อผิดพลาดที่เกิดจาก server
  }
};