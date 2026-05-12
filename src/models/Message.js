const pool = require('../config/database');

class Message {
    static async create(messageData) {
        const { sender_id, receiver_id, student_id, content, message_type = 'direct' } = messageData;
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, student_id, content, message_type)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [sender_id, receiver_id, student_id, content, message_type]
        );
        return result.rows[0];
    }

    static async getConversation(userId1, userId2, studentId = null) {
        let query = `
            SELECT m.*, 
                   s.full_name AS sender_name,
                   r.full_name AS receiver_name
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2)
               OR (m.sender_id = $2 AND m.receiver_id = $1)
        `;
        const params = [userId1, userId2];
        let idx = 3;

        if (studentId) {
            query += ` AND m.student_id = $${idx++}`;
            params.push(studentId);
        }

        query += ' ORDER BY m.created_at ASC';
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async markAsRead(messageId) {
        await pool.query(
            `UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [messageId]
        );
    }

    static async getUnreadCount(userId) {
        const result = await pool.query(
            `SELECT COUNT(*) AS count FROM messages WHERE receiver_id = $1 AND is_read = false`,
            [userId]
        );
        return result.rows[0].count;
    }

static async getRecentConversations(userId) {
    // Latest message per contact. Uses DISTINCT ON with created_at (UUID ids cannot be MAX'ed safely).
    const { rows } = await pool.query(
        `
        SELECT DISTINCT ON (contact_id)
            m.id,
            m.content,
            m.created_at,
            m.is_read,
            CASE
                WHEN m.sender_id = $1 THEN m.receiver_id
                ELSE m.sender_id
            END AS contact_id,
            u.full_name AS contact_name,
            u.role AS contact_role
        FROM messages m
        JOIN users u
          ON u.id = CASE
                        WHEN m.sender_id = $1 THEN m.receiver_id
                        ELSE m.sender_id
                    END
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY contact_id, m.created_at DESC
        `,
        [userId]
    );

    return rows;
}



}

module.exports = Message;