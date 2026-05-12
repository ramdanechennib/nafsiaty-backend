const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'OK' });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/advices', require('./routes/advices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/behavioral-notes', require('./routes/behavioral-notes'));
app.use('/api/session-requests', require('./routes/session-requests'));
app.use('/api/payments', require('./routes/payments'));
// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'خطأ في الخادم'
    });
});

module.exports = app;