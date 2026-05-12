const Student = require('../models/Student');
const Report = require('../models/Report');
const Case = require('../models/Case');
const Message = require('../models/Message');

class StudentController {
    static async getStudents(req, res) {
        try {
            const students = await Student.findAll(req.query);
            res.json({ success: true, data: students });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getStudentById(req, res) {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'التلميذ غير موجود' 
                });
            }
            res.json({ success: true, data: student });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getStudentDashboard(req, res) {
        try {
            const { id } = req.params;
            const student = await Student.findById(id);
            const cases = await Student.getStudentCases(id);
            const reports = await Student.getStudentReports(id);
            const notes = await Student.getStudentBehavioralNotes(id);

            res.json({
                success: true,
                data: { student, cases, reports, notes }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getParentChildren(req, res) {
        try {
            const { rows } = await require('../config/database').query(
                `SELECT s.*, ps.relationship
                 FROM students s
                 JOIN parent_students ps ON s.id = ps.student_id
                 WHERE ps.parent_id = $1
                 ORDER BY s.full_name`,
                [req.user.id]
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getTeacherStudents(req, res) {
        try {
            const { rows } = await require('../config/database').query(
                `SELECT 
                    s.*,
                    g.id AS group_id,
                    g.name AS group_name,
                    tg.subject
                 FROM teacher_groups tg
                 JOIN groups g ON g.id = tg.group_id
                 JOIN group_students gs ON gs.group_id = g.id
                 JOIN students s ON s.id = gs.student_id
                 WHERE tg.teacher_id = $1
                 ORDER BY g.name, s.full_name`,
                [req.user.id]
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }


static async createStudent(req, res) {
    try {
        const {
            full_name,
            date_of_birth,
            gender,
            class_name,
            school_year,
            parent_id,
            group_id
        } = req.body;

        // تحقق
        if (!full_name || !date_of_birth || !gender || !class_name || !school_year) {
            return res.status(400).json({
                success: false,
                message: "جميع الحقول مطلوبة"
            });
        }

        const db = require('../config/database');
        await db.query('BEGIN');

        const { rows } = await db.query(
            `INSERT INTO students (full_name, date_of_birth, gender, class_name, school_year)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [full_name, date_of_birth, gender, class_name, school_year]
        );

        const student = rows[0];

        if (parent_id) {
            await db.query(
                `INSERT INTO parent_students (parent_id, student_id, relationship, is_primary)
                 VALUES ($1, $2, $3, true)
                 ON CONFLICT (parent_id, student_id) DO NOTHING`,
                [parent_id, student.id, 'parent']
            );
        }

        if (group_id) {
            await db.query(
                `INSERT INTO group_students (group_id, student_id)
                 VALUES ($1, $2)
                 ON CONFLICT (student_id) DO UPDATE SET group_id = EXCLUDED.group_id`,
                [group_id, student.id]
            );
        }

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            data: student
        });

    } catch (err) {
        try {
            await require('../config/database').query('ROLLBACK');
        } catch (_) {}
        console.error("CREATE STUDENT ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
static async getAllStudents(req, res) {
    try {
        const { rows } = await require('../config/database').query(
            `SELECT * FROM students ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
static async getParentsList(req, res) {
        try {
            const { rows } = await require('../config/database').query(
                `SELECT id, full_name, email FROM users WHERE role = 'parent' ORDER BY full_name`
            );

            res.json({
                success: true,
                data: rows
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const {
                full_name,
                date_of_birth,
                gender,
                class_name,
                school_year,
                parent_id,
                group_id
            } = req.body;

            const db = require('../config/database');
            await db.query('BEGIN');

            const { rows } = await db.query(
                `UPDATE students 
                 SET full_name = $1, date_of_birth = $2, gender = $3, class_name = $4, school_year = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6
                 RETURNING *`,
                [full_name, date_of_birth, gender, class_name, school_year, id]
            );

            if (rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ success: false, message: 'التلميذ غير موجود' });
            }

            // تحديث ربط ولي الأمر
            if (parent_id) {
                await db.query(
                    `INSERT INTO parent_students (parent_id, student_id, relationship, is_primary)
                     VALUES ($1, $2, 'parent', true)
                     ON CONFLICT (student_id) DO UPDATE SET parent_id = EXCLUDED.parent_id`,
                    [parent_id, id]
                );
            }

            // تحديث ربط المجموعة
            if (group_id) {
                await db.query(
                    `INSERT INTO group_students (group_id, student_id)
                     VALUES ($1, $2)
                     ON CONFLICT (student_id) DO UPDATE SET group_id = EXCLUDED.group_id`,
                    [group_id, id]
                );
            }

            await db.query('COMMIT');
            res.json({ success: true, data: rows[0] });
        } catch (err) {
            await require('../config/database').query('ROLLBACK');
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            const db = require('../config/database');
            
            // سيتم حذف السجلات المرتبطة تلقائياً إذا تم ضبط ON DELETE CASCADE في قاعدة البيانات
            // وإلا يجب حذفها يدوياً هنا.
            await db.query('DELETE FROM students WHERE id = $1', [id]);
            
            res.json({ success: true, message: 'تم حذف التلميذ بنجاح' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = StudentController;