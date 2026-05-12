// backend/src/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. التحقق من وجود البيانات
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
                });
            }

            console.log('🔍 محاولة تسجيل دخول للبريد:', email); // للتتبع

            const user = await User.findByEmail(email);
            
            if (!user) {
                console.log('❌ المستخدم غير موجود');
                return res.status(401).json({ 
                    success: false, 
                    message: 'بيانات الدخول غير صحيحة' 
                });
            }

            // 2. التحقق من كلمة المرور
            const isValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isValid) {
                console.log('❌ كلمة المرور غير صحيحة');
                return res.status(401).json({ 
                    success: false, 
                    message: 'بيانات الدخول غير صحيحة' 
                });
            }

            await User.updateLastLogin(user.id);

            // 3. إنشاء التوكن
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ تم تسجيل الدخول بنجاح');

            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                        avatar: user.avatar
                    }
                }
            });
        } catch (err) {
            console.error('💥 خطأ في تسجيل الدخول:', err.message); // إظهار الخطأ الحقيقي
            console.error(err.stack); // إظهار مكان الخطأ
            res.status(500).json({ 
                success: false, 
                message: 'خطأ في الخادم', 
                error: process.env.NODE_ENV === 'development' ? err.message : undefined 
            });
        }
    }

    // ... باقي الدوال (getProfile, register) كما هي
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            res.json({ success: true, data: user });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async register(req, res) {
        try {
            const { email, password, full_name, phone, role } = req.body;
            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'البريد الإلكتروني مسجل مسبقاً' 
                });
            }

            const password_hash = await bcrypt.hash(password, 10);
            const user = await User.create({ 
                email, password_hash, full_name, phone, role 
            });

            res.status(201).json({ success: true, data: user });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = AuthController;