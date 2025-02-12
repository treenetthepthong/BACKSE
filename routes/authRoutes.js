const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route สำหรับการล็อกอิน
router.post('/login', authController.login);

// Route อื่นๆ ที่คุณต้องการสามารถเพิ่มได้ที่นี่

module.exports = router;