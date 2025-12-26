/**
 * Email Configuration
 * Using nodemailer for sending emails (password reset, welcome, login notifications)
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
// For production, use a real email service (Gmail, SendGrid, etc.)
// For development, you can use Ethereal (test email service)
const createTransporter = () => {
    // Check if environment variables are set
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Production configuration (Gmail example)
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // App-specific password for Gmail
            }
        });
    } else {
        // Development fallback - console logging
        console.warn('⚠️  Email credentials not configured. Emails will be logged to console.');
        return {
            sendMail: async (options) => {
                console.log('📧 Email would be sent:');
                console.log('To:', options.to);
                console.log('Subject:', options.subject);
                console.log('Content:', options.text || options.html);
                return { messageId: 'dev-mode-' + Date.now() };
            }
        };
    }
};

const transporter = createTransporter();

/**
 * Send welcome email on signup
 */
const sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@habittracker.com',
        to: email,
        subject: '🌟 Welcome to Habit Tracker!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                <div style="background: white; padding: 30px; border-radius: 8px;">
                    <h1 style="color: #667eea; margin-bottom: 20px;">Welcome to Habit Tracker! 🎉</h1>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Hi ${name || 'there'},
                    </p>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Thank you for joining Habit Tracker! We're excited to help you build better habits and achieve your goals.
                    </p>
                    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2d3748; margin-bottom: 10px;">Getting Started:</h3>
                        <ul style="color: #4a5568; line-height: 2;">
                            <li>Create your first habit</li>
                            <li>Set minimum duration for accountability</li>
                            <li>Track your progress with timers</li>
                            <li>Build streaks and stay consistent</li>
                        </ul>
                    </div>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Remember: Small steps lead to big changes. Start today! 💪
                    </p>
                    <p style="font-size: 14px; color: #718096; margin-top: 30px;">
                        Happy habit building,<br>
                        The Habit Tracker Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send login notification email
 */
const sendLoginNotification = async (email, name, loginTime) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@habittracker.com',
        to: email,
        subject: '🔐 New Login to Your Habit Tracker Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Login Notification</h2>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Hi ${name || 'there'},
                    </p>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Your Habit Tracker account was just accessed.
                    </p>
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #4a5568;"><strong>Time:</strong> ${loginTime}</p>
                    </div>
                    <p style="font-size: 14px; color: #718096; margin-top: 20px;">
                        If this wasn't you, please secure your account immediately.
                    </p>
                    <p style="font-size: 14px; color: #718096; margin-top: 30px;">
                        Stay consistent,<br>
                        The Habit Tracker Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Login notification sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending login notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetToken, resetUrl) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@habittracker.com',
        to: email,
        subject: '🔑 Reset Your Habit Tracker Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Password Reset Request</h2>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Hi ${name || 'there'},
                    </p>
                    <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">
                        You requested to reset your password for your Habit Tracker account.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #718096; line-height: 1.6;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                    </p>
                    <p style="font-size: 14px; color: #e53e3e; margin-top: 20px;">
                        ⚠️ This link expires in 1 hour.
                    </p>
                    <p style="font-size: 14px; color: #718096; margin-top: 20px;">
                        If you didn't request this, please ignore this email and your password will remain unchanged.
                    </p>
                    <p style="font-size: 14px; color: #718096; margin-top: 30px;">
                        Stay secure,<br>
                        The Habit Tracker Team
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendLoginNotification,
    sendPasswordResetEmail
};
