const { poolPromise } = require('../config/dbconfig'); // เชื่อมต่อกับฐานข้อมูล
const sql = require('mssql');

// ฟังก์ชันสำหรับเพิ่มเวลาว่าง
exports.addSetTime = async (req, res) => {
  const { date, startTime, endTime } = req.body; // รับข้อมูลที่ส่งมาจาก frontend

  try {
    const pool = await poolPromise;
    // เพิ่มข้อมูลเวลาลงในฐานข้อมูล
    await pool.request()
      .input('date', sql.Date, date)
      .input('startTime', sql.Time, startTime)
      .input('endTime', sql.Time, endTime)
      .query(`
        INSERT INTO Availability (available_date, start_time, end_time)
        VALUES (@date, @startTime, @endTime)
      `);
    // ส่งข้อความตอบกลับว่าเพิ่มเวลาเสร็จเรียบร้อย
    res.status(200).json({ message: 'Time slot added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message }); // หากเกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล
  }
};