const { poolPromise, sql } = require('../config/dbconfig');

// setTimeController.js
exports.getTimes = async (req, res) => {
  try {
    const pool = await poolPromise;
    // ดึงข้อมูลเวลาจากฐานข้อมูล
    const result = await pool.request()
      .query('SELECT * FROM Availability'); // ใช้คำสั่ง SQL สำหรับดึงข้อมูลเวลาทั้งหมด

    // ส่งผลลัพธ์กลับไปให้ frontend
    res.status(200).json(result.recordset); // ส่งกลับเป็น JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching time slots' });
  }
};

exports.addSetTime = async (req, res) => {
  const { date, startTime, endTime } = req.body;

  const formatTime = (t) => t.length === 5 ? `${t}:00` : t;

  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('date', sql.Date, date)
      .input('startTime', sql.VarChar, formattedStartTime)
      .input('endTime', sql.VarChar, formattedEndTime)
      .query(`
        INSERT INTO Availability (available_date, start_time, end_time)
        VALUES (@date, @startTime, @endTime)
      `);
    res.status(200).json({ message: 'Time slot added successfully' });
  } catch (error) {
    console.error("🔥 SQL Insert Error:", error);
    res.status(500).json({ error: error.message });
  }
};



// ฟังก์ชันสำหรับการแก้ไขเวลา
exports.editSetTime = async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // ตรวจสอบว่า startTime และ endTime ถูกส่งมาหรือไม่ และถูกต้องหรือไม่
    if (!startTime || !endTime || !date) {
      return res.status(400).json({ error: "Please provide valid date, startTime, and endTime" });
    }
    // แปลงเวลาที่ได้รับเป็นรูปแบบที่สามารถใช้งานกับ SQL Server
    const formattedStartTime = `${startTime}:00`;  // ใช้เวลาแบบตรง ๆ ไม่ต้องแปลง
    const formattedEndTime = `${endTime}:00`;      // ใช้เวลาแบบตรง ๆ ไม่ต้องแปลง

    // คำสั่ง SQL สำหรับการอัปเดต
    const result = await pool.request()
      .input('date', sql.Date, date)
      .input('startTime', sql.NVarChar, formattedStartTime)  // ใช้ sql.NVarChar
      .input('endTime', sql.NVarChar, formattedEndTime)      // ใช้ sql.NVarChar
      .input('id', sql.Int, id)
      .query(`
        UPDATE Availability
        SET available_date = @date, start_time = @startTime, end_time = @endTime
        WHERE availability_id = @id
      `);

    if (result.rowsAffected[0] > 0) {
      return res.status(200).json({ message: 'Time slot updated successfully' });
    } else {
      return res.status(404).json({ error: 'Time slot not found' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error updating time slot', details: err.message });
  }
};


// ฟังก์ชันสำหรับการลบเวลา
exports.deleteSetTime = async (req, res) => {
  const { id } = req.params;  // ดึง id จาก URL
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM Availability
        WHERE availability_id = @id
      `);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.status(200).json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
