const nodemailer = require('nodemailer');

// إعداد ناقل البريد
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

class EmailService {
    /**
     * إرسال بريد إلكتروني عام
     */
    static async sendMail(to, subject, html, text = '') {
        try {
            const mailOptions = {
                from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ تم إرسال البريد بنجاح: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error('❌ فشل إرسال البريد الإلكتروني:', error.message);
            // لا نرمي الخطأ هنا لتجنب تعطيل المسار الرئيسي، لكن يمكنك تفعيله حسب الحاجة
            // throw error;
        }
    }

    /**
     * إرسال إشعار مخصص
     */
    static async sendNotificationEmail(userEmail, title, content, type = 'info') {
        const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', broadcast: '📢' };
        const html = `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; background: #f5f7fa; border-radius: 8px;">
                <h2 style="color: #2c3e50; margin-bottom: 10px;">${icons[type] || 'ℹ️'} ${title}</h2>
                <div style="background: #fff; padding: 15px; border-radius: 6px; border-right: 4px solid #3498db;">
                    <p style="color: #34495e; line-height: 1.6;">${content}</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                    تم الإرسال تلقائياً من نظام المتابعة النفسية المدرسي<br>
                    🕒 ${new Date().toLocaleString('ar-EG')}
                </p>
            </div>
        `;
        return this.sendMail(userEmail, `إشعار: ${title}`, html);
    }

    /**
     * إرسال تقرير جديد لولي الأمر
     */
    static async sendReportNotification(parentEmail, studentName, reportTitle, authorName) {
        return this.sendNotificationEmail(
            parentEmail,
            'تقرير مدرسي جديد',
            `تم إرسال تقرير جديد بعنوان "<strong>${reportTitle}</strong>" بخصوص التلميذ <strong>${studentName}</strong> من قبل: ${authorName}`,
            'success'
        );
    }
}

module.exports = EmailService;