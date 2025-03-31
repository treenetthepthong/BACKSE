const { poolPromise, sql } = require('../config/dbconfig');

exports.getAppointments = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('status', sql.NVarChar, 'pending')
            .query(`
                SELECT 
                    a.appointment_id, 
                    a.professor_id, 
                    a.student_id, 
                    a.status AS appointment_status, 
                    s.full_name AS student_name,  
                    av.available_date, 
                    av.start_time,
                    av.end_time
                FROM Appointments a
                JOIN Users s ON a.student_id = s.user_id  
                JOIN Availability av ON a.professor_id = av.professor_id  
                WHERE a.status = @status
            `);

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
            .query('UPDATE Appointments SET status = @status WHERE id = @id');  // คำสั่ง SQL อัพเดตสถานะ

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: 'Appointment not found' });
        }

        res.status(200).send({ message: 'Appointment status updated' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
