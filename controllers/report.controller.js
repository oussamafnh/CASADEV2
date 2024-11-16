import Report from '../models/report.model.js';
import Post from '../models/post.model.js';
import User from "../models/user.model.js";

// Create a new report
export const createReport = async (req, res) => {
  const { targetId, targetType, reason, description } = req.body;
  const reporterId = req.user._id;

  try {
    // Validate targetType
    if (!['User', 'Post'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    // Validate target existence
    const targetExists =
      targetType === 'User'
        ? await User.findById(targetId)
        : await Post.findById(targetId);

    if (!targetExists) {
      return res.status(404).json({ error: 'Target not found' });
    }

    // Create report
    const report = new Report({
      reporterId,
      targetId,
      targetType,
      reason,
      description,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reports (admin use only)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'username')
      .populate('targetId', 'username title')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!['Pending', 'Reviewed', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    report.status = status;
    await report.save();
    res.status(200).json({ message: 'Report status updated', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
