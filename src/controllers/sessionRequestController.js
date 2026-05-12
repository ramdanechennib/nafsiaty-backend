const SessionRequest = require('../models/SessionRequest');

class SessionRequestController {
    static async create(req, res) {
        try {
            const { student_id, counselor_id, reason, preferred_date } = req.body;

            if (!student_id || !reason) {
                return res.status(400).json({ success: false, message: 'student_id و reason مطلوبان' });
            }

            const created = await SessionRequest.create({
                student_id,
                requester_id: req.user.id,
                counselor_id: counselor_id || null,
                reason,
                preferred_date: preferred_date || null
            });

            res.status(201).json({ success: true, data: created });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getMyRequests(req, res) {
        try {
            let requests;
            if (req.user.role === 'counselor') {
                requests = await SessionRequest.findByCounselor(req.user.id);
            } else {
                requests = await SessionRequest.findByRequester(req.user.id);
            }
            res.json({ success: true, data: requests });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async respond(req, res) {
        try {
            const { status, response_notes } = req.body;
            if (!status) {
                return res.status(400).json({ success: false, message: 'status مطلوب' });
            }

            const updated = await SessionRequest.respond(req.params.id, req.user.id, status, response_notes || null);
            res.json({ success: true, data: updated });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = SessionRequestController;

