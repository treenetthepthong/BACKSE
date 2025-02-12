const express = require('express');
const router = express.Router();
const setTimeController = require('../controllers/setTimeController'); // นำเข้าคอนโทรลเลอร์

// เส้นทางสำหรับเพิ่มเวลาว่าง
router.post('/set-time', setTimeController.addSetTime);

module.exports = router;
