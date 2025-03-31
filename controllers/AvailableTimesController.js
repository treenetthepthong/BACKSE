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

exports.getAvailableTimesForTeacher = async (req, res) => {
  const { teacherId, date } = req.params;
  if (!teacherId || !date) {
    return res.status(400).json({ error: 'Invalid teacherId or date' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('teacherId', sql.Int, teacherId)
      .input('date', sql.Date, date)
      .query(`
          SELECT available_date, start_time, end_time, availability_id
          FROM Availability
          WHERE professor_id = @teacherId AND available_date = @date

      `);

    const availableTimes = result.recordset.map(time => ({
      available_date: time.available_date,
      start_time: new Date(time.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end_time: new Date(time.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      availabilityId: time.availability_id, // แมปจาก availability_id เป็น availabilityId
      isBooked: false // เพิ่มพร็อพเพอร์ตี้ isBooked ที่คอมโพเนนต์ของคุณคาดหวัง
    }));

    res.status(200).json(availableTimes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching available times' });
  }
};
exports.bookappointment = async (req, res) => {
  const { teacherId, date, availabilityId, purpose, studentId, status } = req.body;

  try {
    console.log('Received Data:', { teacherId, date, availabilityId, purpose, studentId, status });

    const pool = await poolPromise;

    // ตรวจสอบว่าเวลานี้ถูกจองไปแล้วหรือไม่ โดยใช้ availability_id และ available_date
    const checkBooking = await pool.request()
      .input('teacherId', sql.Int, teacherId)
      .input('date', sql.Date, date)  // วันที่ที่นักเรียนเลือก
      .input('availabilityId', sql.Int, availabilityId)
      .query(`
        SELECT a.appointment_id, a.student_id, a.professor_id, a.status, a.purpose, a.created_at, 
               av.available_date, av.start_time, av.end_time
        FROM Appointments a
        JOIN Availability av ON a.availability_id = av.availability_id
        WHERE a.professor_id = @teacherId
        AND av.available_date = @date
        AND a.availability_id = @availabilityId;
      `);

    // ถ้าเวลานี้ถูกจองแล้ว ให้ส่งกลับข้อผิดพลาด

    if (checkBooking.recordset.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    await pool.request()
      .input('teacherId', sql.Int, teacherId)
      .input('date', sql.Date, date)  // ใช้ `date` สำหรับวันที่ที่นักเรียนจอง
      .input('studentId', sql.Int, studentId)
      .input('purpose', sql.NVarChar, purpose)
      .input('status', sql.NVarChar, status)
      .input('availabilityId', sql.Int, availabilityId)
      .query(`
        INSERT INTO Appointments (student_id, professor_id, created_at, status, purpose, availability_id)
        VALUES (@studentId, @teacherId, GETDATE(), @status, @purpose, @availabilityId)
      `);
    res.status(200).json({ message: 'Appointment booked successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error booking appointment' });
  }
};