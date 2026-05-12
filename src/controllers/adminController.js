const pool = require('../config/database');
const { hashPassword } = require('../utils/password');
class AdminController {
    static async getDashboard(req, res) {
        try {
            const stats = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE role = 'parent') AS parent_count,
                    (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS teacher_count,
                    (SELECT COUNT(*) FROM users WHERE role = 'counselor') AS counselor_count,
                    (SELECT COUNT(*) FROM students) AS student_count,
                    (SELECT COUNT(*) FROM psychological_cases WHERE status = 'open') AS open_cases,
                    (SELECT COUNT(*) FROM psychological_cases WHERE status = 'urgent') AS urgent_cases,
                    (SELECT COUNT(*) FROM messages WHERE is_read = false) AS unread_messages,
                    (SELECT COUNT(*) FROM session_requests WHERE status = 'pending') AS pending_requests
            `);
            res.json({ success: true, data: stats.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

        // ... (الكود الموجود سابقاً)

static async createStudent(req, res) {
    try {
        const {
            full_name,
            date_of_birth,
            gender,
            class_name,
            school_year,
            parent_id // 👈 مهم
        } = req.body;

        if (!full_name || !date_of_birth || !gender || !class_name || !school_year || !parent_id) {
            return res.status(400).json({
                success: false,
                message: "جميع الحقول مطلوبة"
            });
        }

        const db = require('../config/database');

        // 1. إنشاء الطالب
        const studentResult = await db.query(
            `INSERT INTO students (full_name, date_of_birth, gender, class_name, school_year)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [full_name, date_of_birth, gender, class_name, school_year]
        );

        const student = studentResult.rows[0];

        // 2. ربطه مع الولي
        await db.query(
            `INSERT INTO parent_students (parent_id, student_id, relationship, is_primary)
             VALUES ($1, $2, $3, true)`,
            [parent_id, student.id, 'parent']
        );

        res.status(201).json({
            success: true,
            data: student
        });

    } catch (err) {
        console.error("CREATE STUDENT ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


    static async getAllStudents(req, res) {
        try {
            const { rows } = await pool.query('SELECT * FROM students ORDER BY full_name');
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    
    // دالة مساعدة لجلب الآباء فقط لاستخدامها في القائمة المنسدلة
    static async getParentsList(req, res) {
        try {
            const { rows } = await pool.query("SELECT id, full_name, email FROM users WHERE role = 'parent'");
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
static async createUser(req, res) {
    try {
        const { email, full_name, phone, password, role } = req.body;

        // التحقق من المدخلات
        if (!email || !full_name || !password || !role) {
            return res.status(400).json({ success: false, message: 'جميع الحقول المطلوبة غير موجودة' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
        }

        // التحقق من عدم وجود المستخدم مسبقاً
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await hashPassword(password);

        // إدراج المستخدم
        const result = await pool.query(
            `INSERT INTO users (email, full_name, phone, password_hash, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, phone, role, is_active, created_at`,
            [email, full_name, phone, hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            data: result.rows[0]
        });
        console.log("CREATING USER:", email, role);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
}
    static async getAllUsers(req, res) {
        try {
            const { rows } = await pool.query(
                `SELECT id, email, full_name, phone, role, is_active, created_at, last_login 
                 FROM users ORDER BY role, full_name`
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async sendBulkNotification(req, res) {
        try {
            const { title, content, target_role } = req.body;
            await pool.query(
                `INSERT INTO notifications (user_id, title, content, type)
                 SELECT id, $1, $2, 'broadcast' FROM users 
                 WHERE role = COALESCE($3, role)`,
                [title, content, target_role]
            );
            res.json({ success: true, message: 'تم إرسال الإشعار بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async monitorMessages(req, res) {
        try {
            const { rows } = await pool.query(`
                SELECT m.*, 
                       s.full_name AS sender_name, 
                       r.full_name AS receiver_name,
                       st.full_name AS student_name
                FROM messages m
                JOIN users s ON m.sender_id = s.id
                JOIN users r ON m.receiver_id = r.id
                LEFT JOIN students st ON m.student_id = st.id
                ORDER BY m.created_at DESC
                LIMIT 100
            `);
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getSystemSettings(req, res) {
        try {
            const { rows } = await pool.query('SELECT * FROM system_settings');
            res.json({ success: true,  data:rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async updateSetting(req, res) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            await pool.query(
                'INSERT INTO system_settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2',
                [key, JSON.stringify(value)]
            );
            res.json({ success: true, message: 'تم تحديث الإعداد بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // --- ميزات الحذف والتعديل الجديدة للأدمن ---

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (id == req.user.id) {
                return res.status(400).json({ success: false, message: 'لا يمكنك حذف حسابك الخاص' });
            }
            await pool.query('DELETE FROM users WHERE id = $1', [id]);
            res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { full_name, email, phone, role, is_active } = req.body;
            await pool.query(
                `UPDATE users 
                 SET full_name = $1, email = $2, phone = $3, role = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6`,
                [full_name, email, phone, role, is_active, id]
            );
            res.json({ success: true, message: 'تم تحديث بيانات المستخدم بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM messages WHERE id = $1', [id]);
            res.json({ success: true, message: 'تم حذف الرسالة بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async updateMessage(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            await pool.query(
                'UPDATE messages SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [content, id]
            );
            res.json({ success: true, message: 'تم تعديل الرسالة بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = AdminController;