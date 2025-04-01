const { poolPromise, sql } = require('../config/dbconfig');  // ใช้การเชื่อมต่อกับฐานข้อมูล

// ดึงข้อมูลการนัดหมายทั้งหมดที่สถานะเป็น 'pending'
exports.getAppointments = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('status', sql.NVarChar, 'pending')
            .query(`
                SELECT 
                a.appointment_id, 
                a.status AS appointment_status , 
                a.purpose,
                av.available_date, 
                av.start_time, 
                av.end_time,
                s.student_id, 
                u.full_name AS student_name
                FROM Appointments a
                JOIN Availability av ON a.availability_id = av.availability_id
                JOIN Students s ON a.student_id = s.student_id
                JOIN Users u ON s.user_id = u.user_id
                WHERE a.status = 'pending'  -- เพิ่มเงื่อนไขให้ดึงแค่ 'pending'
                ORDER BY av.available_date 
            `)

        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// ฟังก์ชันสำหรับการอัพเดตสถานะการนัดหมาย (รับ/ปฏิเสธ)
exports.updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;  // รับ ID ของการนัดหมาย
    const { status } = req.body; // รับสถานะใหม่ ('accepted' หรือ 'rejected')

    try {
        const pool = await poolPromise;  // เชื่อมต่อฐานข้อมูล
        const result = await pool.request()
            .input('status', sql.NVarChar, status)  // กำหนดสถานะใหม่
            .input('id', sql.Int, id)  // กำหนด ID ของการนัดหมาย
            .query('UPDATE Appointments SET status = @status WHERE appointment_id = @id');
        // คำสั่ง SQL อัพเดตสถานะ

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: 'Appointment not found' });
        }

        res.status(200).send({ message: 'Appointment status updated' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};