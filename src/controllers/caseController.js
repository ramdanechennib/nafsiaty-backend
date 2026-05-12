const Case = require('../models/Case');
const pool = require('../config/database');

class CaseController {
    static async createCase(req, res) {
        try {
            const caseData = { ...req.body, counselor_id: req.body.counselor_id || null };
            const newCase = await Case.create(caseData);
            res.status(201).json({ success: true, data: newCase });
        } catch (err) {
            console.error("CASE ERROR:", err); // 👈 مهم جداً
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getCaseById(req, res) {
        try {
            const caseData = await Case.findById(req.params.id);
            if (!caseData) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'الحالة غير موجودة' 
                });
            }
            const sessions = await Case.getSessions(req.params.id);
            res.json({ success: true,   data: { ...caseData, sessions } });
        } catch (err) {
            console.error("CASE ERROR:", err); // 👈 مهم جداً
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getCounselorCases(req, res) {
        try {
            const cases = await Case.findAllByCounselor(req.user.id, req.query);
            res.json({ success: true, data: cases });
        } catch (err) {
            console.error("CASE ERROR:", err); // 👈 مهم جداً
            res.status(500).json({ success: false, message: err.message });
        }
    }

static async getAllCases(req, res) {
    try {
        const { status } = req.query;

        let query = `
            SELECT c.*, 
                   s.full_name AS student_name,
                   u.full_name AS counselor_name
            FROM psychological_cases c
            JOIN students s ON c.student_id = s.id
            LEFT JOIN users u ON c.counselor_id = u.id
        `;

        const params = [];

        if (status) {
            params.push(status);
            query += ` WHERE c.status = $1`;
        }

        query += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows || []
        });

    } catch (err) {
        console.error("GET CASES ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

    static async updateCase(req, res) {
        try {
            const updated = await Case.update(req.params.id, req.body);
            res.json({ success: true, data: updated });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async addSession(req, res) {
        try {
            const sessionData = { ...req.body, case_id: req.params.id, counselor_id: req.user.id };
            const session = await Case.addSession(sessionData);
            res.status(201).json({ success: true, data: session });
        } catch (err) {
            console.error("CASE ERROR:", err); // 👈 مهم جداً
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getDashboardStats(req, res) {
        try {
            const stats = await pool.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE status = 'open') AS open_cases,
                    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_cases,
                    COUNT(*) FILTER (WHERE status = 'urgent') AS urgent_cases,
                    COUNT(*) FILTER (WHERE status = 'closed') AS closed_cases,
                    COUNT(*) AS total_cases
                FROM psychological_cases
            `);
            res.json({ success: true, data:stats.rows[0] });
        } catch (err) {
            console.error("CASE ERROR:", err); // 👈 مهم جداً
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = CaseController;