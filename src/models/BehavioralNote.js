const pool = require('../config/database');

class BehavioralNote {
    static async create(data) {
        const { student_id, teacher_id, behavior_type, description, severity, is_positive } = data;
        const result = await pool.query(
            `INSERT INTO behavioral_notes
             (student_id, teacher_id, behavior_type, description, severity, is_positive, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             RETURNING *`,
            [student_id, teacher_id, behavior_type || null, description, severity ?? null, !!is_positive]
        );
        return result.rows[0];
    }

    static async findByStudent(studentId) {
        const result = await pool.query(
            `SELECT bn.*, u.full_name AS teacher_name
             FROM behavioral_notes bn
             LEFT JOIN users u ON bn.teacher_id = u.id
             WHERE bn.student_id = $1
             ORDER BY bn.note_date DESC, bn.created_at DESC`,
            [studentId]
        );
        return result.rows;
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT bn.*, 
                    u.full_name AS teacher_name, 
                    s.full_name AS student_name,
                    s.class_name
             FROM behavioral_notes bn
             LEFT JOIN users u ON bn.teacher_id = u.id
             LEFT JOIN students s ON bn.student_id = s.id
             ORDER BY bn.created_at DESC`
        );
        return result.rows;
    }
}

module.exports = BehavioralNote;

