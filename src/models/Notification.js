const pool = require('../config/database');

class Notification {
    static async create(userId, title, content, type = 'info', relatedEntity = null, relatedEntityId = null) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, content, type, related_entity, related_entity_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, title, content, type, relatedEntity, relatedEntityId]
        );
        return result.rows[0];
    }

    static async findByUser(userId, limit = 20, offset = 0) {
        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    static async markAsRead(notificationId) {
        const result = await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`,
            [notificationId]
        );
        return result.rows[0];
    }

    static async markAllAsRead(userId) {
        await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    }

    static async getUnreadCount(userId) {
        const result = await pool.query(
            `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    }

    static async delete(userId, notificationId) {
        await pool.query(
            `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
    }

    static async getLatestForDashboard(userId, limit = 5) {
        const result = await pool.query(
            `SELECT id, title, content, type, is_read, created_at 
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }
}

module.exports = Notification;