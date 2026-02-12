import { Resend } from "resend";
import { authConfig } from "../config/auth.config";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailUtil {
  static async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string
  ): Promise<void> {
    const verificationUrl = `${authConfig.verification.baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
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
                <div class="header"><h1>🎓 Welcome to SmartScholar!</h1></div>
                <div class="content">
                  <p>Hello ${firstName},</p>
                  <p>Please verify your email address by clicking the button below:</p>
                  <center>
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </center>
                  <p>Or copy and paste this link:</p>
                  <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                    ${verificationUrl}
                  </p>
                  <p><strong>This link will expire in 24 hours.</strong></p>
                  <p>Best regards,<br>The SmartScholar Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} SmartScholar. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${authConfig.frontendUrl}/auth/reset-password/${resetToken}`;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Reset Your SmartScholar Password",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); 
                          color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #764ba2; 
                         color: white; text-decoration: none; border-radius: 5px; 
                         margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h1>Password Reset Request</h1></div>
                <div class="content">
                  <p>Hello ${firstName},</p>
                  <p>Click the button below to reset your password:</p>
                  <center>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </center>
                  <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                    ${resetUrl}
                  </p>
                  <p><strong>This link expires in 1 hour.</strong></p>
                  <p>If you didn't request this, please ignore this email.</p>
                  <p>Best regards,<br>The SmartScholar Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} SmartScholar. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string
  ): Promise<void> {
    const dashboardPath =
      role.toLowerCase() === "student" ? "/student" : "/provider";
    const dashboardUrl = `${authConfig.frontendUrl}${dashboardPath}`;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Welcome to SmartScholar - Account Verified!",
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
                <div class="header"><h1>🎉 Account Verified!</h1></div>
                <div class="content">
                  <p>Hello ${firstName},</p>
                  <p>Your SmartScholar account has been successfully verified!</p>
                  <center>
                    <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
                  </center>
                  <p>Best regards,<br>The SmartScholar Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} SmartScholar. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Not critical, don't throw
    }
  }
}
