const pool = require('../config/database');

class Report {
    static async create(reportData) {
        const { student_id, author_id, report_type, title, content, recommendations } = reportData;
        const result = await pool.query(
            `INSERT INTO reports 
             (student_id, author_id, report_type, title, content, recommendations, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'sent')
             RETURNING *`,
            [student_id, author_id, report_type, title, content, recommendations]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT r.*, s.full_name AS student_name, u.full_name AS author_name
             FROM reports r
             JOIN students s ON r.student_id = s.id
             LEFT JOIN users u ON r.author_id = u.id
             ORDER BY r.created_at DESC`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT r.*, s.full_name AS student_name, u.full_name AS author_name
             FROM reports r
             JOIN students s ON r.student_id = s.id
             LEFT JOIN users u ON r.author_id = u.id
             WHERE r.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByStudent(studentId) {
        const result = await pool.query(
            `SELECT r.*, u.full_name AS author_name
             FROM reports r
             LEFT JOIN users u ON r.author_id = u.id
             WHERE r.student_id = $1
             ORDER BY r.created_at DESC`,
            [studentId]
        );
        return result.rows;
    }

    static async findByParent(parentId) {
        const result = await pool.query(
            `SELECT r.*, s.full_name AS student_name, u.full_name AS author_name
             FROM reports r
             JOIN students s ON r.student_id = s.id
             JOIN parent_students ps ON s.id = ps.student_id
             LEFT JOIN users u ON r.author_id = u.id
             WHERE ps.parent_id = $1
             ORDER BY r.created_at DESC`,
            [parentId]
        );
        return result.rows;
    }

    static async markAsRead(reportId) {
        await pool.query(
            `UPDATE reports SET parent_read = true, read_at = CURRENT_TIMESTAMP 
             WHERE id = $1`,
            [reportId]
        );
    }
}

module.exports = Report;