const express = require('express');
const router = express.Router();
const availableTimesController = require('../controllers/AvailableTimesController');

// เส้นทางสำหรับดึงรายชื่ออาจารย์
router.get('/teachers', availableTimesController.getTeachers); 

// เส้นทางสำหรับดึงเวลาที่อาจารย์เปิดให้จองตามวันที่เลือก
router.get('/set-time/:teacherId/:date', availableTimesController.getAvailableTimesForTeacher);

// เส้นทางสำหรับการจองเวลานัด
router.post('/book-appointment', availableTimesController.bookAppointment);

module.exports = router;