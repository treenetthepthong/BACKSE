const moment = require('moment');  // ใช้ moment.js สำหรับการจัดการเวลา
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { poolPromise } = require('../config/dbconfig');

// ฟังก์ชันดึงประวัติการนัดหมาย
exports.getAppointmentHistory = async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];  // ดึง token จาก header
  
  if (!token) {
    return res.status(401).json({ error: 'Token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey');
    const userId = decoded.userId;

    const pool = await poolPromise;
    
    const studentResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT student_id FROM students WHERE user_id = @userId');
    
    if (studentResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }

    const studentId = studentResult.recordset[0].student_id;

    const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT 
          a.appointment_id,
          a.student_id,
          a.professor_id,
          a.status,
          a.purpose,
          av.available_date,
          av.start_time,
          av.end_time
        FROM appointments a
        JOIN Availability av ON a.availability_id = av.availability_id
        WHERE a.student_id = @studentId
        ORDER BY av.available_date DESC
      `);
    
    const appointments = result.recordset.map(appointment => {
      // ตรวจสอบและแปลงเวลาถ้าจำเป็น
      appointment.available_date = moment(appointment.available_date).format('YYYY-MM-DD'); // แปลงวันที่
      appointment.start_time = moment(appointment.start_time).format('YYYY-MM-DD HH:mm:ss'); // แปลงเวลาที่เริ่ม
      appointment.end_time = moment(appointment.end_time).format('YYYY-MM-DD HH:mm:ss'); // แปลงเวลาที่สิ้นสุด

      return appointment;
    });

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this student' });
    }

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.getProfessorAppointmentHistory = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Token is required for authentication' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey');
      const userId = decoded.userId;
  
      const pool = await poolPromise;
  
      // 🔍 หาค่า professor_id จาก user_id
      const professorResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT professor_id FROM Professors WHERE user_id = @userId');
  
      if (professorResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Professor not found for this user' });
      }
  
      const professorId = professorResult.recordset[0].professor_id;
  
      const result = await pool.request()
        .input('professorId', sql.Int, professorId)
        .query(`
          SELECT a.appointment_id, a.status, a.purpose, a.created_at,
                 av.available_date, av.start_time, av.end_time,
                 s.student_id, u.full_name AS student_name
          FROM Appointments a
          JOIN Availability av ON a.availability_id = av.availability_id
          JOIN Students s ON a.student_id = s.student_id
          JOIN Users u ON s.user_id = u.user_id
          WHERE a.professor_id = @professorId
          ORDER BY av.available_date DESC
        `);
  
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };