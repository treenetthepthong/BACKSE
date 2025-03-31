const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

// เส้นทาง GET สำหรับดึงข้อมูลการนัดหมายที่รอการตอบรับ
router.get('/', appointmentsController.getAppointments);

// เส้นทาง POST สำหรับอัพเดตสถานะการนัดหมาย (รับหรือปฏิเสธ)
router.post('/:id/status', appointmentsController.updateAppointmentStatus);

module.exports = router;
