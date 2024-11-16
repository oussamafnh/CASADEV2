import express from 'express';
import { createReport, getAllReports, updateReportStatus } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createReport);

export default router;
