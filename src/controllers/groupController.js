const pool = require('../config/database');
const Group = require('../models/Group');

class GroupController {
    static async create(req, res) {
        try {
            const { name, class_name, school_year } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'name مطلوب' });
            }
            const group = await Group.create({ name, class_name, school_year });
            res.status(201).json({ success: true, data: group });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async list(req, res) {
        try {
            const groups = await Group.findAll();
            res.json({ success: true, data: groups });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async assignStudents(req, res) {
        try {
            const { groupId } = req.params;
            const { student_ids } = req.body; // array
            if (!Array.isArray(student_ids) || student_ids.length === 0) {
                return res.status(400).json({ success: false, message: 'student_ids مطلوب (array)' });
            }

            await pool.query('BEGIN');
            const results = [];
            for (const sid of student_ids) {
                const r = await Group.addStudent(groupId, sid);
                results.push(r);
            }
            await pool.query('COMMIT');

            res.json({ success: true, data: results });
        } catch (err) {
            try { await pool.query('ROLLBACK'); } catch (_) {}
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async assignTeacher(req, res) {
        try {
            const { groupId } = req.params;
            const { teacher_id, subject } = req.body;
            if (!teacher_id || !subject) {
                return res.status(400).json({ success: false, message: 'teacher_id و subject مطلوبان' });
            }
            const tg = await Group.assignTeacher({ group_id: groupId, teacher_id, subject });
            res.json({ success: true, data: tg });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async listTeachers(req, res) {
        try {
            const { rows } = await pool.query(
                `SELECT id, full_name, email
                 FROM users
                 WHERE role = 'teacher' AND is_active = true
                 ORDER BY full_name`
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = GroupController;

