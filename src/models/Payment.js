const pool = require('../config/database');

class Payment {
    static async create(data) {
        const { parent_id, student_id, session_request_id, amount, payment_method, transaction_id, status, card_info } = data;
        const result = await pool.query(
            `INSERT INTO payments 
             (parent_id, student_id, session_request_id, amount, payment_method, transaction_id, status, card_info)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [parent_id, student_id, session_request_id, amount, payment_method, transaction_id, status, card_info]
        );

        // Update session request link if provided
        if (session_request_id) {
            await pool.query(
                `UPDATE session_requests SET payment_id = $1 WHERE id = $2`,
                [result.rows[0].id, session_request_id]
            );
        }

        return result.rows[0];
    }

    static async updateStatus(id, status) {
        const result = await pool.query(
            `UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, id]
        );

        // If status is completed, update session_requests.is_paid
        if (status === 'completed' && result.rows[0].session_request_id) {
            await pool.query(
                `UPDATE session_requests SET is_paid = true WHERE id = $1`,
                [result.rows[0].session_request_id]
            );
        }

        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT p.*, 
                    u.full_name AS parent_name, 
                    s.full_name AS student_name
             FROM payments p
             JOIN users u ON p.parent_id = u.id
             JOIN students s ON p.student_id = s.id
             ORDER BY p.created_at DESC`
        );
        return result.rows;
    }

    static async findByParent(parentId) {
        const result = await pool.query(
            `SELECT p.*, s.full_name AS student_name
             FROM payments p
             JOIN students s ON p.student_id = s.id
             WHERE p.parent_id = $1
             ORDER BY p.created_at DESC`,
            [parentId]
        );
        return result.rows;
    }

    static async getStats() {
        const result = await pool.query(
            `SELECT 
                SUM(amount) AS total_revenue,
                COUNT(*) AS total_transactions,
                COUNT(DISTINCT parent_id) AS unique_payers
             FROM payments 
             WHERE status = 'completed'`
        );
        return result.rows[0];
    }
}

module.exports = Payment;
