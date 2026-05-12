const pool = require('../config/database');

class SessionRequest {
    static async create(data) {
        const { student_id, requester_id, counselor_id, reason, preferred_date } = data;
        const result = await pool.query(
            `INSERT INTO session_requests 
             (student_id, requester_id, counselor_id, reason, preferred_date)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [student_id, requester_id, counselor_id, reason, preferred_date]
        );
        return result.rows[0];
    }

    static async findByCounselor(counselorId) {
        const result = await pool.query(
            `SELECT sr.*, 
                    s.full_name AS student_name, 
                    s.class_name,
                    u.full_name AS requester_name,
                    u.role AS requester_role,
                    p.status AS payment_status,
                    p.payment_method
             FROM session_requests sr
             JOIN students s ON sr.student_id = s.id
             LEFT JOIN users u ON sr.requester_id = u.id
             LEFT JOIN payments p ON sr.payment_id = p.id
             WHERE sr.counselor_id = $1 OR sr.counselor_id IS NULL
             ORDER BY sr.requested_at DESC`,
            [counselorId]
        );
        return result.rows;
    }

    static async findByRequester(requesterId) {
        const result = await pool.query(
            `SELECT sr.*, 
                    s.full_name AS student_name, 
                    p.status AS payment_status,
                    p.payment_method
             FROM session_requests sr
             JOIN students s ON sr.student_id = s.id
             LEFT JOIN payments p ON sr.payment_id = p.id
             WHERE sr.requester_id = $1
             ORDER BY sr.requested_at DESC`,
            [requesterId]
        );
        return result.rows;
    }

    static async respond(requestId, counselorId, status, response_notes) {
        const result = await pool.query(
            `UPDATE session_requests 
             SET status = $1, 
                 response_notes = $2, 
                 counselor_id = $3,
                 responded_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [status, response_notes, counselorId, requestId]
        );
        return result.rows[0];
    }
}

module.exports = SessionRequest;