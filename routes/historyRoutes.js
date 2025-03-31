// historyRoutes.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Route สำหรับดึงประวัติการนัดหมาย
router.get('/appointments/history', historyController.getAppointmentHistory);

module.exports = router;
