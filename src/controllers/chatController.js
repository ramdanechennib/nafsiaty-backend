
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const pool = require('../config/database');

class ChatController {
    static async sendMessage(req, res) {
        try {
            const messageData = { ...req.body, sender_id: req.user.id };
            const message = await Message.create(messageData);
            
            // إنشاء إشعار للمستلم
            await Notification.create(
                message.receiver_id,
                'رسالة جديدة',
                `لقد تلقيت رسالة جديدة من ${req.user.full_name}`,
                'info',
                'message',
                message.id
            );

            res.status(201).json({ success: true, data: message });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    static async getSchoolContact(req, res) {
        try {
            const db = require('../config/database');
    
            const { rows } = await db.query(`
                SELECT id, full_name, role
                FROM users
                WHERE role IN ('admin', 'counselor')
                ORDER BY role
                LIMIT 1
            `);
    
            res.json({
                success: true,
                data: rows[0]
            });
    
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
    static async getConversation(req, res) {
        try {
            const currentUserId = req.user.id;
            const otherUserId = req.params.userId;
            const { student_id } = req.query;
    
            const { rows } = await pool.query(
                `
                SELECT 
                    m.*,
                    s.full_name AS sender_name,
                    r.full_name AS receiver_name
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                WHERE (
                    (m.sender_id = $1 AND m.receiver_id = $2)
                    OR
                    (m.sender_id = $2 AND m.receiver_id = $1)
                )
                AND ($3::uuid IS NULL OR m.student_id = $3)
                ORDER BY m.created_at ASC
                `,
                [currentUserId, otherUserId, student_id || null]
            );
    
            res.json({
                success: true,
                data: rows
            });
    
        } catch (err) {
            console.error("CHAT ERROR:", err);
    
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
static async getRecentConversations(req, res) {
    try {
        console.log("USER:", req.user); // 👈 أضف هذا

        const conversations = await Message.getRecentConversations(req.user.id);

        res.json({ success: true, data: conversations });
    } catch (err) {
        console.error("CHAT ERROR:", err); // 👈 هذا الأهم
        res.status(500).json({ success: false, message: err.message });
    }
}

    static async getUnreadCount(req, res) {
        try {
            const count = await Message.getUnreadCount(req.user.id);
            res.json({ success: true,  data:{ count } });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async markAsRead(req, res) {
        try {
            await Message.markAsRead(req.params.messageId);
            res.json({ success: true, message: 'تم تحديد الرسالة كمقروءة' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getUsersToChat(req, res) {
        try {
            const currentUserId = req.user.id;
            const currentUserRole = req.user.role;
            const { search } = req.query;

            let query = `
                SELECT id, full_name, role, email 
                FROM users 
                WHERE id != $1
            `;
            const params = [currentUserId];

            if (search) {
                query += ` AND (full_name ILIKE $2 OR email ILIKE $2)`;
                params.push(`%${search}%`);
            } else if (currentUserRole === 'admin') {
                // الأدمن يرى الجميع (موظفين وأولياء أمور) مرتبين بالدور
                query += ` AND role IN ('admin', 'counselor', 'teacher', 'parent')`;
            } else if (currentUserRole === 'counselor' || currentUserRole === 'teacher') {
                // الموظفون يرون زملائهم أولاً
                query += ` AND role IN ('admin', 'counselor', 'teacher')`;
            } else if (currentUserRole === 'parent') {
                // الأب يرى الإدارة أولاً (أدمن ومستشارين)
                query += ` AND role IN ('admin', 'counselor')`;
            }

            query += ` ORDER BY 
                CASE 
                    WHEN role = 'admin' THEN 1
                    WHEN role = 'counselor' THEN 2
                    WHEN role = 'teacher' THEN 3
                    ELSE 4
                END, full_name LIMIT 50`;

            const { rows } = await pool.query(query, params);
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = ChatController;