const pool = require('../config/database');

class Student {
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];
        let idx = 1;

        if (filters.class_name) {
            query += ` AND class_name = $${idx++}`;
            params.push(filters.class_name);
        }
        if (filters.school_year) {
            query += ` AND school_year = $${idx++}`;
            params.push(filters.school_year);
        }

        query += ' ORDER BY full_name ASC';
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT s.*, 
                    json_agg(json_build_object(
                        'id', u.id, 'name', u.full_name, 
                        'email', u.email, 'phone', u.phone,
                        'relationship', ps.relationship
                    )) AS parents
             FROM students s
             LEFT JOIN parent_students ps ON s.id = ps.student_id
             LEFT JOIN users u ON ps.parent_id = u.id
             WHERE s.id = $1
             GROUP BY s.id`,
            [id]
        );
        return result.rows[0];
    }

    static async getStudentCases(studentId) {
        const result = await pool.query(
            `SELECT pc.*, u.full_name AS counselor_name
             FROM psychological_cases pc
             LEFT JOIN users u ON pc.counselor_id = u.id
             WHERE pc.student_id = $1
             ORDER BY pc.created_at DESC`,
            [studentId]
        );
        return result.rows;
    }

    static async getStudentReports(studentId) {
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

    static async getStudentBehavioralNotes(studentId) {
        const result = await pool.query(
            `SELECT bn.*, u.full_name AS teacher_name
             FROM behavioral_notes bn
             LEFT JOIN users u ON bn.teacher_id = u.id
             WHERE bn.student_id = $1
             ORDER BY bn.note_date DESC`,
            [studentId]
        );
        return result.rows;
    }
}

module.exports = Student;