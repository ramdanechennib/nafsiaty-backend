const pool = require('../config/database');

class User {
    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT id, email, full_name, phone, avatar, role, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async create(userData) {
        const { email, password_hash, full_name, phone, role } = userData;
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, phone, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, full_name, phone, role`,
            [email, password_hash, full_name, phone, role]
        );
        return result.rows[0];
    }

    static async updateLastLogin(id) {
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
    }
}

module.exports = User;