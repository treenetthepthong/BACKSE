const { poolPromise, sql } = require('../config/dbconfig');

// ดึงรายชื่ออาจารย์ทั้งหมด
exports.getTeachers = async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .query(`
          SELECT p.professor_id, u.full_name 
          FROM Professors p
          JOIN Users u ON p.user_id = u.user_id
        `);  // ใช้ JOIN เพื่อดึงข้อมูลจากทั้งสองตาราง
      res.status(200).json(result.recordset);  // ส่งข้อมูลกลับเป็น JSON
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching teachers' });
    }
};
  
  // ฟังก์ชันดึงเวลาที่อาจารย์เปิดให้จองตามวันที่เลือก
  exports.getAvailableTimesForTeacher = async (req, res) => {
    const { teacherId, date } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('teacherId', sql.Int, teacherId)
        .input('date', sql.Date, date)
        .query(`
          SELECT available_date, start_time, end_time
          FROM Availability
          WHERE teacher_id = @teacherId AND available_date = @date
        `);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching available times' });
    }
  };

// ฟังก์ชันสำหรับการจองเวลานัด
exports.bookAppointment = async (req, res) => {
  const { teacherId, date, startTime, endTime } = req.body;

  try {
    const pool = await poolPromise;

    // ตรวจสอบว่าเวลานี้ถูกจองไปแล้วหรือไม่
    const checkBooking = await pool.request()
      .input('teacherId', sql.Int, teacherId)
      .input('date', sql.Date, date)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .query(`
        SELECT * FROM BookedAppointments
        WHERE teacher_id = @teacherId AND appointment_date = @date AND start_time = @startTime AND end_time = @endTime
      `);

    if (checkBooking.recordset.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    // ถ้าไม่มีการจอง ให้บันทึกการจอง
    await pool.request()
      .input('teacherId', sql.Int, teacherId)
      .input('date', sql.Date, date)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .query(`
        INSERT INTO BookedAppointments (teacher_id, appointment_date, start_time, end_time)
        VALUES (@teacherId, @date, @startTime, @endTime)
      `);

    res.status(200).json({ message: 'Appointment booked successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error booking appointment' });
  }
};
