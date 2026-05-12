const pool = require('../config/database');

class Group {
    static async create({ name, class_name, school_year }) {
        const result = await pool.query(
            `INSERT INTO groups (name, class_name, school_year)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, class_name || null, school_year || null]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT * FROM groups ORDER BY name ASC`
        );
        return result.rows;
    }

    static async addStudent(groupId, studentId) {
        const result = await pool.query(
            `INSERT INTO group_students (group_id, student_id)
             VALUES ($1, $2)
             ON CONFLICT (student_id) DO UPDATE SET group_id = EXCLUDED.group_id
             RETURNING *`,
            [groupId, studentId]
        );
        return result.rows[0];
    }

    static async assignTeacher({ group_id, teacher_id, subject }) {
        const result = await pool.query(
            `INSERT INTO teacher_groups (group_id, teacher_id, subject)
             VALUES ($1, $2, $3)
             ON CONFLICT (teacher_id, group_id) DO UPDATE SET subject = EXCLUDED.subject
             RETURNING *`,
            [group_id, teacher_id, subject]
        );
        return result.rows[0];
    }

    static async getTeacherGroups(teacherId) {
        const result = await pool.query(
            `SELECT tg.group_id, tg.subject, g.name, g.class_name, g.school_year
             FROM teacher_groups tg
             JOIN groups g ON g.id = tg.group_id
             WHERE tg.teacher_id = $1
             ORDER BY g.name`,
            [teacherId]
        );
        return result.rows;
    }

    static async getGroupStudents(groupId) {
        const result = await pool.query(
            `SELECT s.*
             FROM group_students gs
             JOIN students s ON s.id = gs.student_id
             WHERE gs.group_id = $1
             ORDER BY s.full_name`,
            [groupId]
        );
        return result.rows;
    }
}

module.exports = Group;

