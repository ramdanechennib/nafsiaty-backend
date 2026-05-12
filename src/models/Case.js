const pool = require('../config/database');

class Case {
    static async create(caseData) {
        const { student_id, counselor_id, title, description, severity_level } = caseData;
        const result = await pool.query(
            `INSERT INTO psychological_cases 
             (student_id, counselor_id, title, description, severity_level)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [student_id, counselor_id, title, description, severity_level]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT pc.*, 
                    s.full_name AS student_name,
                    u.full_name AS counselor_name
             FROM psychological_cases pc
             JOIN students s ON pc.student_id = s.id
             LEFT JOIN users u ON pc.counselor_id = u.id
             WHERE pc.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findAllByCounselor(counselorId, filters = {}) {
        let query = `
            SELECT pc.*, s.full_name AS student_name, s.class_name,
                   (SELECT COUNT(*) FROM case_sessions WHERE case_id = pc.id) as session_count,
                   (SELECT progress_assessment FROM case_sessions WHERE case_id = pc.id ORDER BY session_date DESC LIMIT 1) as latest_progress
            FROM psychological_cases pc
            JOIN students s ON pc.student_id = s.id
            WHERE (pc.counselor_id = $1 OR pc.counselor_id IS NULL)
        `;
        const params = [counselorId];
        let idx = 2;

        if (filters.status) {
            query += ` AND pc.status = $${idx++}`;
            params.push(filters.status);
        }

        query += ' ORDER BY pc.created_at DESC';
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT pc.*, 
                   s.full_name AS student_name, 
                   s.class_name,
                   u.full_name AS counselor_name
            FROM psychological_cases pc
            JOIN students s ON pc.student_id = s.id
            LEFT JOIN users u ON pc.counselor_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let idx = 1;

        if (filters.status) {
            query += ` AND pc.status = $${idx++}`;
            params.push(filters.status);
        }
        if (filters.student_id) {
            query += ` AND pc.student_id = $${idx++}`;
            params.push(filters.student_id);
        }
        if (filters.severity_gte) {
            query += ` AND pc.severity_level >= $${idx++}`;
            params.push(filters.severity_gte);
        }

        query += ' ORDER BY pc.severity_level DESC, pc.created_at DESC';
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async update(id, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

        const result = await pool.query(
            `UPDATE psychological_cases SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
        );
        return result.rows[0];
    }

    static async addSession(sessionData) {
        const { case_id, counselor_id, session_date, duration_minutes, notes, progress_assessment } = sessionData;
        const result = await pool.query(
            `INSERT INTO case_sessions 
             (case_id, counselor_id, session_date, duration_minutes, notes, progress_assessment)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [case_id, counselor_id, session_date, duration_minutes, notes, progress_assessment]
        );
        return result.rows[0];
    }

    static async getSessions(caseId) {
        const result = await pool.query(
            `SELECT cs.*, u.full_name AS counselor_name
             FROM case_sessions cs
             LEFT JOIN users u ON cs.counselor_id = u.id
             WHERE cs.case_id = $1
             ORDER BY cs.session_date DESC`,
            [caseId]
        );
        return result.rows;
    }
}

module.exports = Case;