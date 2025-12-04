const nodemailer = require("nodemailer");

import { authConfig } from "../config/auth.config";

export class EmailUtil {
  private static transporter = nodemailer.createTransport;

  /**
   * Initialize email transporter
   */
  static initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: authConfig.email.host,
      port: authConfig.email.port,
      secure: authConfig.email.secure,
      auth: authConfig.email.auth,
    });
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string
  ): Promise<void> {
    const verificationUrl = `${authConfig.verification.baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: authConfig.email.from,
      to: email,
      subject: "Verify Your SmartScholar Account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                       color: white; text-decoration: none; border-radius: 5px; 
                       margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Welcome to SmartScholar!</h1>
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>Thank you for registering with SmartScholar! We're excited to have you join our community.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <center>
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </center>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${verificationUrl}
                </p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account, please ignore this email.</p>
                <p>Best regards,<br>The SmartScholar Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} SmartScholar. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${authConfig.passwordReset.baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: authConfig.email.from,
      to: email,
      subject: "Reset Your SmartScholar Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); 
                        color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #f56565; 
                       color: white; text-decoration: none; border-radius: 5px; 
                       margin: 20px 0; font-weight: bold; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; 
                        padding: 15px; margin: 15px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>We received a request to reset your SmartScholar password.</p>
                <p>Click the button below to reset your password:</p>
                <center>
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </center>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${resetUrl}
                </p>
                <div class="warning">
                  <strong> Important:</strong>
                  <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your password will remain unchanged</li>
                  </ul>
                </div>
                <p>For security reasons, we recommend choosing a strong password that you haven't used before.</p>
                <p>Best regards,<br>The SmartScholar Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} SmartScholar. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string
  ): Promise<void> {
    const dashboardUrl = `${authConfig.verification.baseUrl}/dashboard`;

    const mailOptions = {
      from: authConfig.email.from,
      to: email,
      subject: "Welcome to SmartScholar - Account Verified!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); 
                        color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #48bb78; 
                       color: white; text-decoration: none; border-radius: 5px; 
                       margin: 20px 0; font-weight: bold; }
              .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Account Verified!</h1>
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>Your SmartScholar account has been successfully verified! </p>
                <p>You can now access all features available for ${role}s:</p>
                <div class="features">
                  ${
                    role === "student"
                      ? `
                    <div class="feature-item">📚 Browse thousands of scholarships</div>
                    <div class="feature-item"> Submit scholarship applications</div>
                    <div class="feature-item"> Track your application status</div>
                    <div class="feature-item"> Get notifications for new opportunities</div>
                  `
                      : `
                    <div class="feature-item"> Post scholarship opportunities</div>
                    <div class="feature-item"> Manage applications</div>
                    <div class="feature-item">View analytics and insights</div>
                    <div class="feature-item"> Build your organization profile</div>
                  `
                  }
                </div>
                <center>
                  <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                </center>
                <p>If you have any questions or need assistance, our support team is here to help!</p>
                <p>Best regards,<br>The SmartScholar Team</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} SmartScholar. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw error for welcome email as it's not critical
    }
  }
}

// Initialize email transporter
EmailUtil.initializeTransporter();
