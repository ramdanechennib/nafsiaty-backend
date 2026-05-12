const Report = require('../models/Report');
const Message = require('../models/Message');

class ReportController {
    static async createReport(req, res) {
        try {
            const reportData = { ...req.body, author_id: req.user.id };
            const report = await Report.create(reportData);

            // Notify parent
            const { rows } = await require('../config/database').query(
                `SELECT ps.parent_id FROM parent_students ps WHERE ps.student_id = $1`,
                [req.body.student_id]
            );
            for (const row of rows) {
                await require('../config/database').query(
                    `INSERT INTO notifications (user_id, title, content, related_entity, related_entity_id)
                     VALUES ($1, 'تقرير جديد', 'تم إرسال تقرير جديد بخصوص التلميذ', 'report', $2)`,
                    [row.parent_id, report.id]
                );
            }

            res.status(201).json({ success: true, data: report });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getAllReports(req, res) {
        try {
            const reports = await Report.findAll();
            res.json({ success: true, data: reports });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getReportsByParent(req, res) {
        try {
            const reports = await Report.findByParent(req.user.id);
            res.json({ success: true, data: reports });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getReportsByStudent(req, res) {
        try {
            const reports = await Report.findByStudent(req.params.studentId);
            res.json({ success: true, data: reports });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async markAsRead(req, res) {
        try {
            await Report.markAsRead(req.params.id);
            res.json({ success: true, message: 'تم تحديد التقرير كمقروء' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = ReportController;