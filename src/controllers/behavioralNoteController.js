const BehavioralNote = require('../models/BehavioralNote');

class BehavioralNoteController {
    static async create(req, res) {
        try {
            const { student_id, behavior_type, description, severity, is_positive } = req.body;

            if (!student_id || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'student_id و description مطلوبان'
                });
            }

            const note = await BehavioralNote.create({
                student_id,
                teacher_id: req.user.id,
                behavior_type,
                description,
                severity,
                is_positive
            });

            res.status(201).json({ success: true, data: note });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getByStudent(req, res) {
        try {
            const notes = await BehavioralNote.findByStudent(req.params.studentId);
            res.json({ success: true, data: notes });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const notes = await BehavioralNote.findAll();
            res.json({ success: true, data: notes });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = BehavioralNoteController;

