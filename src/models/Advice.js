const pool = require('../config/database');

class Advice {
    static async create(data) {
        const { author_id, target_role, title, content, category } = data;
        const result = await pool.query(
            `INSERT INTO advices (author_id, target_role, title, content, category)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [author_id, target_role, title, content, category]
        );
        return result.rows[0];
    }

    static async findAll(targetRole = null) {
        let query = 'SELECT a.*, u.full_name AS author_name FROM advices a JOIN users u ON a.author_id = u.id WHERE a.is_published = true';
        const params = [];
        let idx = 1;

        if (targetRole) {
            query += ` AND (a.target_role = $${idx++} OR a.target_role IS NULL)`;
            params.push(targetRole);
        }

        query += ' ORDER BY a.created_at DESC';
        const result = await pool.query(query, params);
        return result.rows;
    }
}

module.exports = Advice;