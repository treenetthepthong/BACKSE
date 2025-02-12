const express = require('express');
const router = express.Router();
const setTimeController = require('../controllers/setTimeController'); // นำเข้าคอนโทรลเลอร์

// เส้นทางสำหรับเพิ่มเวลาว่าง
router.get('/set-time', setTimeController.getTimes); 
router.post('/set-time', setTimeController.addSetTime);
router.put('/set-time/:id', setTimeController.editSetTime);
router.delete('/set-time/:id', setTimeController.deleteSetTime);

module.exports = router;
